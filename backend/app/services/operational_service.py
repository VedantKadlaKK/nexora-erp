from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.activity_model import ActivityLog
from app.models.audit_model import AuditLog
from app.models.finance_model import Finance
from app.models.notification_model import Notification
from app.models.shipment_model import Shipment
from app.models.user_model import User
from app.services.realtime_service import (
    emit_activity_created,
    emit_audit_created,
    emit_finance_updated,
    emit_notification_created,
    emit_shipment_updated,
)


LIFECYCLE_STATES = [
    "Created",
    "Packed",
    "In Transit",
    "Out For Delivery",
    "Delivered",
]

ROLE_PERMISSIONS = {
    "Admin": {
        "mark_packed",
        "dispatch",
        "mark_out_for_delivery",
        "mark_delivered",
        "delay",
        "resolve_delay",
        "update_payment",
    },
    "Warehouse Staff": {"mark_packed", "delay", "resolve_delay"},
    "Logistics Staff": {
        "dispatch",
        "mark_out_for_delivery",
        "mark_delivered",
        "delay",
        "resolve_delay",
    },
    "Finance Staff": {"update_payment"},
}

ACTION_LABELS = {
    "mark_packed": "Marked Packed",
    "dispatch": "Dispatched Shipment",
    "mark_out_for_delivery": "Marked Out For Delivery",
    "mark_delivered": "Marked Delivered",
    "delay": "Delayed Shipment",
    "resolve_delay": "Resolved Delay",
    "update_payment": "Updated Payment",
}


def ensure_allowed(user: User, action: str):
    permissions = ROLE_PERMISSIONS.get(user.role or "Admin", set())

    if action not in permissions:
        raise HTTPException(
            status_code=403,
            detail=f"{user.role} cannot perform {action.replace('_', ' ')}",
        )


def get_finance_record(db: Session, shipment: Shipment):
    finance = (
        db.query(Finance)
        .filter(
            (Finance.shipment_id == shipment.id)
            | (Finance.shipment_code == shipment.shipment_code)
        )
        .first()
    )

    if finance:
        finance.shipment_id = shipment.id
        return finance

    finance = Finance(
        shipment_id=shipment.id,
        shipment_code=shipment.shipment_code,
        invoice_status=shipment.payment_status,
        payment_risk="Low",
        revenue_amount=0,
    )
    db.add(finance)
    return finance


def require_status(shipment: Shipment, expected_status: str, action: str):
    if shipment.status != expected_status:
        raise HTTPException(
            status_code=409,
            detail=(
                f"{ACTION_LABELS[action]} requires status {expected_status}; "
                f"current status is {shipment.status}"
            ),
        )


async def create_notification(db: Session, title: str, message: str, kind: str):
    notification = Notification(
        title=title,
        message=message,
        notification_type=kind,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    await emit_notification_created(notification)

    return notification


async def perform_shipment_action(
    db: Session,
    shipment: Shipment,
    user: User,
    action: str,
    payload: dict | None = None,
):
    payload = payload or {}
    if action not in ACTION_LABELS:
        raise HTTPException(status_code=422, detail="Unknown operational action")

    ensure_allowed(user, action)

    previous_state = shipment.status
    previous_payment = shipment.payment_status
    finance = get_finance_record(db, shipment)
    notification = None

    if action == "mark_packed":
        require_status(shipment, "Created", action)
        shipment.status = "Packed"

    elif action == "dispatch":
        require_status(shipment, "Packed", action)
        shipment.status = "In Transit"

    elif action == "mark_out_for_delivery":
        require_status(shipment, "In Transit", action)
        shipment.status = "Out For Delivery"

    elif action == "mark_delivered":
        require_status(shipment, "Out For Delivery", action)
        shipment.status = "Delivered"
        if finance.invoice_status == "Pending":
            finance.invoice_status = "Ready"
        notification = (
            "Shipment delivered",
            f"{shipment.shipment_code} has completed its delivery lifecycle.",
            "success",
        )

    elif action == "delay":
        if shipment.status == "Delivered":
            raise HTTPException(
                status_code=409,
                detail="Delivered shipments cannot be delayed",
            )

        if shipment.status != "Delayed":
            shipment.delayed_from_status = shipment.status

        shipment.status = "Delayed"
        shipment.delay_reason = payload.get("note") or payload.get("reason")
        finance.payment_risk = "High"
        notification = (
            "Shipment delayed",
            f"{shipment.shipment_code} now requires operational attention.",
            "warning",
        )

    elif action == "resolve_delay":
        require_status(shipment, "Delayed", action)
        shipment.status = shipment.delayed_from_status or "In Transit"
        shipment.delayed_from_status = None
        shipment.delay_reason = None
        finance.payment_risk = "Low"
        notification = (
            "Delay resolved",
            f"{shipment.shipment_code} has returned to its workflow.",
            "success",
        )

    elif action == "update_payment":
        payment_status = payload.get("payment_status")
        if payment_status not in {"Pending", "Paid", "Complete", "Overdue"}:
            raise HTTPException(
                status_code=422,
                detail="Payment status must be Pending, Paid, Complete, or Overdue",
            )

        shipment.payment_status = payment_status
        finance.invoice_status = payment_status
        finance.payment_risk = "High" if payment_status == "Overdue" else "Low"

        if "revenue_amount" in payload:
            finance.revenue_amount = float(payload.get("revenue_amount") or 0)

        notification = (
            "Payment status updated",
            f"{shipment.shipment_code} payment is now {payment_status}.",
            "info",
        )

    if action != "update_payment":
        if action != "mark_delivered":
            finance.invoice_status = shipment.payment_status
        finance.payment_risk = "High" if shipment.status == "Delayed" else "Low"

    if "eta" in payload:
        shipment.eta = payload["eta"]

    if "revenue_amount" in payload and action != "update_payment":
        finance.revenue_amount = float(payload.get("revenue_amount") or 0)

    shipment.updated_at = datetime.utcnow()

    activity = ActivityLog(
        event_type=ACTION_LABELS[action],
        description=(
            f"{user.username} {ACTION_LABELS[action].lower()} "
            f"for {shipment.shipment_code}"
        ),
    )
    audit = AuditLog(
        shipment_id=shipment.id,
        shipment_code=shipment.shipment_code,
        operator_id=user.id,
        operator_name=user.username,
        action=ACTION_LABELS[action],
        previous_state=previous_payment if action == "update_payment" else previous_state,
        new_state=shipment.payment_status if action == "update_payment" else shipment.status,
        note=payload.get("note") or payload.get("reason"),
    )

    db.add(activity)
    db.add(audit)
    db.commit()
    db.refresh(shipment)
    db.refresh(finance)
    db.refresh(activity)
    db.refresh(audit)

    await emit_shipment_updated(shipment)
    await emit_finance_updated(finance)
    await emit_activity_created(activity)
    await emit_audit_created(audit)

    if notification:
        await create_notification(db, *notification)

    return {
        "shipment": shipment,
        "finance": finance,
        "activity": activity,
        "audit": audit,
    }
