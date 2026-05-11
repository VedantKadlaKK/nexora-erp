from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.activity_model import ActivityLog
from app.models.customer_model import Customer
from app.models.user_model import User
from app.services.realtime_service import (
    emit_activity_created,
    emit_customer_updated,
)


router = APIRouter()


@router.get("/customers")
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Customer).order_by(Customer.created_at.desc()).all()


@router.get("/customers/{customer_id}/history")
def get_customer_history(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {
        "customer": customer,
        "shipments": customer.shipments
    }


@router.post("/customers")
async def create_customer(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = Customer(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        status=data.get("status", "Active")
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    activity = ActivityLog(
        event_type="Customer Created",
        description=f"{customer.name} was added to the customer register"
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    await emit_activity_created(activity)
    await emit_customer_updated(customer)

    return customer
