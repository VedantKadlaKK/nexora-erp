from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.database.connection import engine
from app.database.base import Base

from app.models.shipment_model import Shipment

from app.models.user_model import User

from app.routes.shipment_routes import router as shipment_router

from app.routes.auth_routes import router as auth_router

from app.websocket.socket_manager import sio
from app.models.activity_model import ActivityLog
from app.routes.activity_routes import router as activity_router
from app.models.finance_model import Finance
from app.routes.finance_routes import router as finance_router


fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

fastapi_app.include_router(shipment_router)
fastapi_app.include_router(auth_router)
fastapi_app.include_router(activity_router)
fastapi_app.include_router(finance_router)

@fastapi_app.get("/")
def home():
    return {"message": "Nexora ERP Backend Running"}

app = socketio.ASGIApp(
    sio,
    other_asgi_app=fastapi_app
)