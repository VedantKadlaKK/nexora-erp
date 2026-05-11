from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.base import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)

    shipment_code = Column(String, unique=True, nullable=False)

    customer_name = Column(String, nullable=False)

    origin = Column(String, nullable=False)

    destination = Column(String, nullable=False)

    status = Column(String, default="In Transit")

    payment_status = Column(String, default="Pending")

    eta = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)