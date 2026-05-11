from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.shipment_model import Shipment
from app.websocket.socket_manager import sio
from app.models.activity_model import ActivityLog
from app.models.finance_model import Finance

router = APIRouter()

@router.post("/shipments")
def create_shipment(data: dict, db: Session = Depends(get_db)):

    shipment = Shipment(
        shipment_code=data["shipment_code"],
        customer_name=data["customer_name"],
        origin=data["origin"],
        destination=data["destination"],
        status=data["status"],
        payment_status=data["payment_status"],
        eta=data["eta"]
    )

    db.add(shipment)

    db.commit()

    db.refresh(shipment)

    finance = Finance(
    shipment_code=shipment.shipment_code,
    invoice_status="Pending",
    payment_risk="Low",
    revenue_amount=25000
)

    db.add(finance)

    db.commit()

    return {
        "message": "Shipment created successfully",
        "shipment_id": shipment.id
    }

@router.get("/shipments")
def get_shipments(db: Session = Depends(get_db)):

    shipments = db.query(Shipment).all()

    return shipments

@router.put("/shipments/{shipment_id}")
async def update_shipment(
    shipment_id: int,
    data: dict,
    db: Session = Depends(get_db)
):

    shipment = db.query(Shipment).filter(
        Shipment.id == shipment_id
    ).first()

    if not shipment:
        return {"error": "Shipment not found"}

    shipment.status = data["status"]

    shipment.payment_status = data["payment_status"]

    db.commit()

    db.refresh(shipment)

    finance = db.query(Finance).filter(
        Finance.shipment_code == shipment.shipment_code
    ).first()

    if shipment.status == "Delayed":

        finance.payment_risk = "High"

    else:

        finance.payment_risk = "Low"

    db.commit()

    activity = ActivityLog(
    event_type="Shipment Updated",
    description=f"{shipment.shipment_code} status changed to {shipment.status}"
)

    db.add(activity)

    db.commit()

    await sio.emit(
        "shipment_updated",
        {
            "id": shipment.id,
            "shipment_code": shipment.shipment_code,
            "status": shipment.status,
            "payment_status": shipment.payment_status
        }
    )

    return {
        "message": "Shipment updated successfully"
    }