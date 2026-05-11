from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.activity_model import ActivityLog

router = APIRouter()

@router.get("/activities")
def get_activities(db: Session = Depends(get_db)):

    activities = db.query(ActivityLog)\
        .order_by(ActivityLog.created_at.desc())\
        .all()

    return activities