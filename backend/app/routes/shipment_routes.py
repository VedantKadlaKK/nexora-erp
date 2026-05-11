from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.shipment_model import Shipment
from app.models.activity_model import ActivityLog
from app.models.customer_model import Customer
from app.models.finance_model import Finance
from app.models.user_model import User
from app.services.realtime_service import (
    create_operational_notification,
    emit_activity_created,
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
        shipment_code=data["shipment_code"],
        customer_name=customer.name if customer else data["customer_name"],
        customer_id=customer.id if customer else None,
        origin=data["origin"],
        destination=data["destination"],
        status=data.get("status", "In Transit"),
        payment_status=data.get("payment_status", "Pending"),
        eta=data.get("eta")
    )

    db.add(shipment)

    db.commit()

    db.refresh(shipment)

    finance = Finance(
        shipment_id=shipment.id,
        shipment_code=shipment.shipment_code,
        invoice_status=data.get("invoice_status", "Pending"),
        payment_risk="Low",
        revenue_amount=data.get("revenue_amount", 25000)
    )

    db.add(finance)

    db.commit()
    db.refresh(finance)

    activity = ActivityLog(
        event_type="Shipment Created",
        description=f"{shipment.shipment_code} was created for {shipment.customer_name}"
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    await emit_shipment_updated(shipment)
    await emit_finance_updated(finance)
    await emit_activity_created(activity)
    if customer:
        await emit_customer_updated(customer)

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

    if "status" in data:
        shipment.status = data["status"]

    if "payment_status" in data:
        shipment.payment_status = data["payment_status"]

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

    db.delete(shipment)
    db.commit()

    activity = ActivityLog(
        event_type="Shipment Deleted",
        description=f"{shipment_code} was removed from operations"
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    await emit_shipment_deleted(shipment_id)
    await emit_activity_created(activity)
    await create_operational_notification(
        db,
        "Shipment deleted",
        f"{shipment_code} was removed from the shipment register.",
        "info"
    )

    return {"message": "Shipment deleted successfully"}
