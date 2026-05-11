from sqlalchemy import Column, Integer, String, Float

from app.database.base import Base

class Finance(Base):

    __tablename__ = "finance"

    id = Column(Integer, primary_key=True, index=True)

    shipment_code = Column(String, nullable=False)

    invoice_status = Column(String, default="Pending")

    payment_risk = Column(String, default="Low")

    revenue_amount = Column(Float, default=0)