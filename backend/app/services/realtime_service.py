from app.models.notification_model import Notification
from app.websocket.socket_manager import sio


def serialize_datetime(value):
    return value.isoformat() if value else None


def serialize_shipment(shipment):
    return {
        "id": shipment.id,
        "shipment_code": shipment.shipment_code,
        "customer_name": shipment.customer_name,
        "customer_id": shipment.customer_id,
        "origin": shipment.origin,
        "destination": shipment.destination,
        "status": shipment.status,
        "payment_status": shipment.payment_status,
        "eta": shipment.eta,
        "created_at": serialize_datetime(shipment.created_at),
    }


def serialize_finance(finance):
    return {
        "id": finance.id,
        "shipment_id": finance.shipment_id,
        "shipment_code": finance.shipment_code,
        "invoice_status": finance.invoice_status,
        "payment_risk": finance.payment_risk,
        "revenue_amount": finance.revenue_amount,
        "created_at": serialize_datetime(finance.created_at),
    }


def serialize_activity(activity):
    return {
        "id": activity.id,
        "event_type": activity.event_type,
        "description": activity.description,
        "created_at": serialize_datetime(activity.created_at),
    }


def serialize_notification(notification):
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "is_read": notification.is_read,
        "created_at": serialize_datetime(notification.created_at),
    }


def serialize_customer(customer):
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "company": customer.company,
        "status": customer.status,
        "created_at": serialize_datetime(customer.created_at),
    }


async def emit_shipment_updated(shipment):
    await sio.emit("shipment_updated", serialize_shipment(shipment))


async def emit_shipment_deleted(shipment_id):
    await sio.emit("shipment_deleted", {"id": shipment_id})


async def emit_finance_updated(finance):
    await sio.emit("finance_updated", serialize_finance(finance))


async def emit_activity_created(activity):
    await sio.emit("activity_created", serialize_activity(activity))


async def emit_notification_created(notification):
    await sio.emit(
        "notification_created",
        serialize_notification(notification)
    )


async def emit_customer_updated(customer):
    await sio.emit("customer_updated", serialize_customer(customer))


async def create_operational_notification(
    db,
    title,
    message,
    notification_type="info"
):
    notification = Notification(
        title=title,
        message=message,
        notification_type=notification_type
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    await emit_notification_created(notification)

    return notification
