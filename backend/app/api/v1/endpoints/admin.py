from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.user import UserResponse
from app.schemas.booking import BookingResponse
from app.api.deps import get_current_admin
from app.models.user import User
from app.services.user_service import get_all_users
from app.services.booking_service import get_all_bookings
from app.models.booking import Booking
from app.models.route import Route
from app.models.bus import Bus

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
def admin_list_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: List all users."""
    return get_all_users(db)


@router.get("/bookings", response_model=List[BookingResponse])
def admin_list_bookings(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: List all bookings."""
    return get_all_bookings(db)


@router.get("/reports/summary")
def admin_summary(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Get a summary report of the system."""
    total_users = db.query(User).count()
    total_bookings = db.query(Booking).count()
    total_buses = db.query(Bus).filter(Bus.is_active == True).count()
    total_routes = db.query(Route).filter(Route.is_active == True).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    used_bookings = db.query(Booking).filter(Booking.status == "used").count()

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "used_bookings": used_bookings,
        "total_buses": total_buses,
        "total_routes": total_routes,
    }
