from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.user_model import User

from app.auth.password_handler import (
    hash_password,
    verify_password
)

from app.auth.jwt_handler import (
    create_access_token
)
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/register")
def register(data: dict, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if existing_user:

        return {"error": "User already exists"}

    hashed = hash_password(data["password"])

    user = User(
        username=data["username"],
        email=data["email"],
        password=hashed
    )

    db.add(user)

    db.commit()

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid = verify_password(
        data["password"],
        user.password
    )

    if not valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "user_id": user.id,
        "email": user.email
    })

    return {
        "access_token": token
    }


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
