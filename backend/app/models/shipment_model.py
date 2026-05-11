from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)

    shipment_code = Column(String, unique=True, nullable=False)

    customer_name = Column(String, nullable=False)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)

    origin = Column(String, nullable=False)

    destination = Column(String, nullable=False)

    status = Column(String, default="Created")

    delayed_from_status = Column(String, nullable=True)

    delay_reason = Column(String, nullable=True)

    payment_status = Column(String, default="Pending")

    eta = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="shipments")

    finance = relationship(
        "Finance",
        back_populates="shipment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    audit_logs = relationship(
        "AuditLog",
        back_populates="shipment"
    )
