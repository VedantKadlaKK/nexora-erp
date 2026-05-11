from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db

from app.models.activity_model import ActivityLog
from app.models.finance_model import Finance
from app.models.user_model import User
from app.services.realtime_service import (
    emit_activity_created,
    emit_finance_updated,
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
    finance = db.query(Finance).filter(Finance.id == finance_id).first()

    if not finance:
        raise HTTPException(status_code=404, detail="Finance record not found")

    if "invoice_status" in data:
        finance.invoice_status = data["invoice_status"]

    if "payment_risk" in data:
        finance.payment_risk = data["payment_risk"]

    if "revenue_amount" in data:
        finance.revenue_amount = data["revenue_amount"]

    db.commit()
    db.refresh(finance)

    activity = ActivityLog(
        event_type="Finance Updated",
        description=f"{finance.shipment_code} finance record was updated"
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    await emit_finance_updated(finance)
    await emit_activity_created(activity)

    return {"message": "Finance updated successfully"}
