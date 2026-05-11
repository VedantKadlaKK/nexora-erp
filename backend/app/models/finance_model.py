from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base

class Finance(Base):

    __tablename__ = "finance"

    id = Column(Integer, primary_key=True, index=True)

    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=True)

    shipment_code = Column(String, nullable=False)

    invoice_status = Column(String, default="Pending")

    payment_risk = Column(String, default="Low")

    revenue_amount = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    shipment = relationship("Shipment", back_populates="finance")
