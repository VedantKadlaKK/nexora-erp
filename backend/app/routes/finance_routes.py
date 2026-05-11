from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.finance_model import Finance

router = APIRouter()

@router.get("/finance")
def get_finance(db: Session = Depends(get_db)):

    finance = db.query(Finance).all()

    return finance