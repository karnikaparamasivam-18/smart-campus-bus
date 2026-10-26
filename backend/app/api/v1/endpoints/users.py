from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current logged-in user's profile."""
    return current_user
