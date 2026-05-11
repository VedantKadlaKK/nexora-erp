from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.auth.jwt_handler import decode_access_token
from app.database.session import get_db
from app.models.user_model import User


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")

    token = authorization.replace("Bearer ", "", 1)
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == payload.get("user_id")).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
