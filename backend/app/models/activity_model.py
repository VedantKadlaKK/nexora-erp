from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.base import Base

class ActivityLog(Base):

    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    event_type = Column(String, nullable=False)

    description = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)