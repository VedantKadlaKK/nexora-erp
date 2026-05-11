from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.shipment_model import Shipment
from app.models.activity_model import ActivityLog
from app.models.audit_model import AuditLog
from app.models.customer_model import Customer
from app.models.finance_model import Finance
from app.models.user_model import User
from app.services.operational_service import perform_shipment_action
from app.services.realtime_service import (
    create_operational_notification,
    emit_activity_created,
    emit_audit_created,
    emit_customer_updated,
    emit_finance_updated,
    emit_shipment_deleted,
    emit_shipment_updated,
)

router = APIRouter()

@router.post("/shipments")
async def create_shipment(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    required_fields = ["shipment_code", "customer_name", "origin", "destination"]
    missing_fields = [
        field for field in required_fields if not str(data.get(field, "")).strip()
    ]

    if missing_fields:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )

    existing_shipment = db.query(Shipment).filter(
        Shipment.shipment_code == data["shipment_code"].strip()
    ).first()

    if existing_shipment:
        raise HTTPException(status_code=409, detail="Shipment code already exists")

    payment_status = data.get("payment_status", "Pending")
    if payment_status not in {"Pending", "Paid", "Complete", "Overdue"}:
        raise HTTPException(status_code=422, detail="Invalid payment status")

    customer = None
    customer_id = data.get("customer_id")

    if customer_id:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
    elif data.get("customer_name"):
        customer = db.query(Customer).filter(
            Customer.name == data["customer_name"]
        ).first()

        if not customer:
            customer = Customer(
                name=data["customer_name"],
                email=data.get("customer_email"),
                company=data.get("customer_company")
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)

    shipment = Shipment(
        shipment_code=data["shipment_code"].strip(),
        customer_name=customer.name if customer else data["customer_name"].strip(),
        customer_id=customer.id if customer else None,
        origin=data["origin"].strip(),
        destination=data["destination"].strip(),
        status="Created",
        payment_status=payment_status,
        eta=data.get("eta")
    )

    db.add(shipment)

    db.commit()

    db.refresh(shipment)

    finance = Finance(
        shipment_id=shipment.id,
        shipment_code=shipment.shipment_code,
        invoice_status=payment_status,
        payment_risk="High" if payment_status == "Overdue" else "Low",
        revenue_amount=data.get("revenue_amount", 0)
    )

    db.add(finance)

    db.commit()
    db.refresh(finance)

    activity = ActivityLog(
        event_type="Shipment Created",
        description=(
            f"{current_user.username} created {shipment.shipment_code} "
            f"for {shipment.customer_name}"
        )
    )
    audit = AuditLog(
        shipment_id=shipment.id,
        shipment_code=shipment.shipment_code,
        operator_id=current_user.id,
        operator_name=current_user.username,
        action="Shipment Created",
        previous_state=None,
        new_state=shipment.status,
        note=data.get("note")
    )
    db.add(activity)
    db.add(audit)
    db.commit()
    db.refresh(activity)
    db.refresh(audit)

    await emit_shipment_updated(shipment)
    await emit_finance_updated(finance)
    await emit_activity_created(activity)
    await emit_audit_created(audit)
    if customer:
        await emit_customer_updated(customer)

    await create_operational_notification(
        db,
        "Shipment created",
        f"{shipment.shipment_code} entered the operations queue.",
        "info"
    )

    return {
        "message": "Shipment created successfully",
        "shipment_id": shipment.id
    }

@router.get("/shipments")
def get_shipments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    shipments = db.query(Shipment).all()

    return shipments


@router.post("/shipments/{shipment_id}/actions")
async def shipment_action(
    shipment_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    action = data.get("action")
    result = await perform_shipment_action(db, shipment, current_user, action, data)

    return {
        "message": "Shipment action completed",
        "shipment_id": result["shipment"].id,
        "action": action
    }

@router.put("/shipments/{shipment_id}")
async def update_shipment(
    shipment_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    shipment = db.query(Shipment).filter(
        Shipment.id == shipment_id
    ).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    previous_status = shipment.status

    if "status" in data and data["status"] != shipment.status:
        raise HTTPException(
            status_code=409,
            detail="Use /shipments/{id}/actions for lifecycle transitions"
        )

    if "payment_status" in data:
        await perform_shipment_action(
            db,
            shipment,
            current_user,
            "update_payment",
            data
        )
        return {
            "message": "Shipment payment updated successfully"
        }

    if "eta" in data:
        shipment.eta = data["eta"]

    if "customer_id" in data:
        customer = db.query(Customer).filter(
            Customer.id == data["customer_id"]
        ).first()

        if customer:
            shipment.customer_id = customer.id
            shipment.customer_name = customer.name

    db.commit()

    db.refresh(shipment)

    finance = db.query(Finance).filter(
        Finance.shipment_code == shipment.shipment_code
    ).first()

    if not finance:
        finance = Finance(
            shipment_id=shipment.id,
            shipment_code=shipment.shipment_code,
            invoice_status=shipment.payment_status,
            revenue_amount=data.get("revenue_amount", 0)
        )
        db.add(finance)
    else:
        finance.shipment_id = shipment.id

    if shipment.status == "Delayed":

        finance.payment_risk = "High"

    else:

        finance.payment_risk = "Low"

    if "payment_status" in data:
        finance.invoice_status = data["payment_status"]

    if "revenue_amount" in data:
        finance.revenue_amount = data["revenue_amount"]

    db.commit()
    db.refresh(finance)

    activity = ActivityLog(
        event_type="Shipment Updated",
        description=f"{shipment.shipment_code} status changed to {shipment.status}"
    )

    db.add(activity)

    db.commit()
    db.refresh(activity)

    await emit_shipment_updated(shipment)
    await emit_finance_updated(finance)
    await emit_activity_created(activity)

    if shipment.status == "Delayed" and previous_status != "Delayed":
        await create_operational_notification(
            db,
            "Shipment delayed",
            f"{shipment.shipment_code} now requires operational attention.",
            "warning"
        )

    if shipment.status == "Delivered" and previous_status != "Delivered":
        await create_operational_notification(
            db,
            "Shipment delivered",
            f"{shipment.shipment_code} has been completed.",
            "success"
        )

    return {
        "message": "Shipment updated successfully"
    }


@router.delete("/shipments/{shipment_id}")
async def delete_shipment(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can delete shipments")

    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()

    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment_code = shipment.shipment_code

    finance = db.query(Finance).filter(
        (Finance.shipment_id == shipment.id) |
        (Finance.shipment_code == shipment.shipment_code)
    ).first()

    if finance:
        db.delete(finance)

    db.query(AuditLog).filter(AuditLog.shipment_id == shipment.id).update(
        {"shipment_id": None}
    )

    db.delete(shipment)
    db.commit()

    activity = ActivityLog(
        event_type="Shipment Deleted",
        description=f"{current_user.username} removed {shipment_code} from operations"
    )
    audit = AuditLog(
        shipment_id=None,
        shipment_code=shipment_code,
        operator_id=current_user.id,
        operator_name=current_user.username,
        action="Shipment Deleted",
        previous_state="Registered",
        new_state="Deleted"
    )
    db.add(audit)
    db.add(activity)
    db.commit()
    db.refresh(audit)
    db.refresh(activity)

    await emit_shipment_deleted(shipment_id)
    await emit_activity_created(activity)
    await emit_audit_created(audit)
    await create_operational_notification(
        db,
        "Shipment deleted",
        f"{shipment_code} was removed from the shipment register.",
        "info"
    )

    return {"message": "Shipment deleted successfully"}
