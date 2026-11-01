
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_admin
from app.schemas.user import UserResponse, StaffCreate
from app.schemas.booking import BookingResponse
from app.models.user import User, UserRole
from app.models.booking import Booking
from app.models.route import Route
from app.models.bus import Bus
from app.services.user_service import get_all_users, get_user_by_email
from app.services.booking_service import get_all_bookings
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
def admin_list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_users(db)


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def admin_create_staff(
    payload: StaffCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    if payload.role not in (UserRole.SCANNER, UserRole.ADMIN):
        raise HTTPException(
            status_code=422,
            detail="Role must be scanner or admin"
        )

    if not payload.full_name.strip() or len(payload.full_name) > 100:
        raise HTTPException(
            status_code=422,
            detail="Invalid full name"
        )

    if len(payload.password) < 12 or len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=422,
            detail="Password must be 12-72 bytes"
        )

    email = str(payload.email).lower()

    if get_user_by_email(db, email):
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role
    )

    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    db.refresh(user)
    return user


@router.get("/bookings", response_model=List[BookingResponse])
def admin_list_bookings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return get_all_bookings(db)


@router.get("/reports/summary")
def admin_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_users = db.query(User).count()
    total_bookings = db.query(Booking).count()
    total_buses = db.query(Bus).filter(Bus.is_active == True).count()
    total_routes = db.query(Route).filter(Route.is_active == True).count()
    confirmed_bookings = db.query(Booking).filter(
        Booking.status == "confirmed"
    ).count()
    used_bookings = db.query(Booking).filter(
        Booking.status == "used"
    ).count()

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "used_bookings": used_bookings,
        "total_buses": total_buses,
        "total_routes": total_routes,
    }
