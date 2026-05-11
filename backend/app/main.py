from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.database.connection import engine
from app.database.base import Base
from app.services.schema_service import ensure_runtime_schema

from app.models.shipment_model import Shipment

from app.models.user_model import User
from app.models.customer_model import Customer

from app.routes.shipment_routes import router as shipment_router

from app.routes.auth_routes import router as auth_router

from app.websocket.socket_manager import sio
from app.models.activity_model import ActivityLog
from app.routes.activity_routes import router as activity_router
from app.models.finance_model import Finance
from app.routes.finance_routes import router as finance_router
from app.models.notification_model import Notification
from app.routes.analytics_routes import router as analytics_router
from app.routes.customer_routes import router as customer_router
from app.routes.notification_routes import router as notification_router


fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
ensure_runtime_schema(engine)

fastapi_app.include_router(shipment_router)
fastapi_app.include_router(auth_router)
fastapi_app.include_router(activity_router)
fastapi_app.include_router(finance_router)
fastapi_app.include_router(analytics_router)
fastapi_app.include_router(customer_router)
fastapi_app.include_router(notification_router)

@fastapi_app.get("/")
def home():
    return {"message": "Nexora ERP Backend Running"}

app = socketio.ASGIApp(
    sio,
    other_asgi_app=fastapi_app
)
