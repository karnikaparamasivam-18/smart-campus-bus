from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.services.user_service import create_user, login_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (student, scanner, or admin)."""
    return create_user(db, user_in)


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login and get access + refresh tokens."""
    return login_user(db, login_data.email, login_data.password)
