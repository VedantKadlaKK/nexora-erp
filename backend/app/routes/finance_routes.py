from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db

from app.models.activity_model import ActivityLog
from app.models.audit_model import AuditLog
from app.models.finance_model import Finance
from app.models.shipment_model import Shipment
from app.models.user_model import User
from app.services.realtime_service import (
    emit_activity_created,
    emit_audit_created,
    emit_finance_updated,
    emit_shipment_updated,
)

router = APIRouter()

@router.get("/finance")
def get_finance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    finance = db.query(Finance).all()

    return finance


@router.put("/finance/{finance_id}")
async def update_finance(
    finance_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in {"Admin", "Finance Staff"}:
        raise HTTPException(status_code=403, detail="Only Finance Staff or Admin can update finance")

    finance = db.query(Finance).filter(Finance.id == finance_id).first()

    if not finance:
        raise HTTPException(status_code=404, detail="Finance record not found")

    previous_state = finance.invoice_status
    shipment = None

    if "invoice_status" in data:
        finance.invoice_status = data["invoice_status"]
        shipment = db.query(Shipment).filter(
            (Shipment.id == finance.shipment_id)
            | (Shipment.shipment_code == finance.shipment_code)
        ).first()

        if shipment:
            shipment.payment_status = data["invoice_status"]

    if "payment_risk" in data:
        finance.payment_risk = data["payment_risk"]

    if "revenue_amount" in data:
        finance.revenue_amount = data["revenue_amount"]

    db.commit()
    db.refresh(finance)

    activity = ActivityLog(
        event_type="Finance Updated",
        description=(
            f"{current_user.username} updated finance for {finance.shipment_code}"
        )
    )
    audit = AuditLog(
        shipment_id=finance.shipment_id,
        shipment_code=finance.shipment_code,
        operator_id=current_user.id,
        operator_name=current_user.username,
        action="Finance Updated",
        previous_state=previous_state,
        new_state=finance.invoice_status,
        note=data.get("note")
    )
    db.add(activity)
    db.add(audit)
    db.commit()
    db.refresh(activity)
    db.refresh(audit)

    await emit_finance_updated(finance)
    if shipment:
        await emit_shipment_updated(shipment)
    await emit_activity_created(activity)
    await emit_audit_created(audit)

    return {"message": "Finance updated successfully"}
