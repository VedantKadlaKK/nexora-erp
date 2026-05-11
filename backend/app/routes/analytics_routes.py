from collections import Counter, defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.finance_model import Finance
from app.models.shipment_model import Shipment
from app.models.user_model import User


router = APIRouter()


def day_key(value):
    if isinstance(value, datetime):
        return value.strftime("%b %d")

    return "Unscheduled"


@router.get("/analytics/overview")
def analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipments = db.query(Shipment).all()
    finance = db.query(Finance).all()

    status_counts = Counter(shipment.status for shipment in shipments)
    payment_counts = Counter(shipment.payment_status for shipment in shipments)

    revenue_by_day = defaultdict(float)
    delays_by_day = defaultdict(int)
    route_counts = Counter()

    for shipment in shipments:
        route = f"{shipment.origin} to {shipment.destination}"
        route_counts[route] += 1

        if shipment.status == "Delayed":
            delays_by_day[day_key(shipment.created_at)] += 1

    for item in finance:
        revenue_by_day[day_key(item.created_at)] += item.revenue_amount or 0

    total_revenue = sum(item.revenue_amount or 0 for item in finance)
    delayed_count = status_counts.get("Delayed", 0)
    delivered_count = status_counts.get("Delivered", 0)

    delay_rate = round((delayed_count / len(shipments)) * 100, 1) if shipments else 0
    delivery_rate = round((delivered_count / len(shipments)) * 100, 1) if shipments else 0

    return {
        "status_counts": [
            {"name": status, "value": count}
            for status, count in status_counts.items()
        ],
        "payment_counts": [
            {"name": status, "value": count}
            for status, count in payment_counts.items()
        ],
        "revenue_trend": [
            {"date": date, "revenue": amount}
            for date, amount in sorted(revenue_by_day.items())
        ],
        "delay_trend": [
            {"date": date, "delays": count}
            for date, count in sorted(delays_by_day.items())
        ],
        "top_routes": [
            {"route": route, "shipments": count}
            for route, count in route_counts.most_common(5)
        ],
        "insights": {
            "total_revenue": total_revenue,
            "delay_rate": delay_rate,
            "delivery_rate": delivery_rate,
            "active_routes": len(route_counts)
        }
    }
