from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    shipments = relationship("Shipment", back_populates="customer")
