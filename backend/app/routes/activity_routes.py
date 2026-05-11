from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db

from app.models.activity_model import ActivityLog
from app.models.user_model import User

router = APIRouter()

@router.get("/activities")
def get_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    activities = db.query(ActivityLog)\
        .order_by(ActivityLog.created_at.desc())\
        .all()

    return activities
