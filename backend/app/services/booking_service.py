import qrcode
import io
import base64
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking, BookingStatus
from app.models.route import Route
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.core.security import create_access_token, decode_token


def generate_booking_reference() -> str:
    return f"BUS-{uuid.uuid4().hex[:8].upper()}"


def generate_qr_code(data: str) -> str:
    """Generate a QR code and return it as a base64 string."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def create_booking(db: Session, booking_in: BookingCreate, student: User) -> Booking:
    route = db.query(Route).filter(Route.id == booking_in.route_id, Route.is_active == True).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found or inactive")

    if route.available_seats <= 0:
        raise HTTPException(status_code=400, detail="No seats available on this route")

    # Generate unique booking reference
    ref = generate_booking_reference()

    # Create a JWT token to embed in QR (expires in 24 hours)
    qr_token = create_access_token(
        data={"booking_ref": ref, "student_id": student.id, "route_id": route.id},
        expires_delta=timedelta(hours=24),
    )

    # Generate QR image
    qr_image_b64 = generate_qr_code(qr_token)

    booking = Booking(
        student_id=student.id,
        route_id=route.id,
        booking_reference=ref,
        qr_code=qr_image_b64,
        qr_token=qr_token,
        status=BookingStatus.PENDING,
        travel_date=booking_in.travel_date,
    )

    # Decrease available seats
    route.available_seats -= 1

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_student_bookings(db: Session, student_id: int):
    return db.query(Booking).filter(Booking.student_id == student_id).all()


def get_all_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Booking).offset(skip).limit(limit).all()


def validate_qr(db: Session, qr_token: str, scanner: User) -> dict:
    """Validate a QR token during boarding."""
    payload = decode_token(qr_token)
    if not payload:
        return {"valid": False, "message": "Invalid or expired QR code"}

    booking_ref = payload.get("booking_ref")
    if not booking_ref:
        return {"valid": False, "message": "Malformed QR token"}

    booking = db.query(Booking).filter(Booking.qr_token == qr_token).first()
    if not booking:
        return {"valid": False, "message": "Booking not found"}

    if booking.status == BookingStatus.USED:
        return {"valid": False, "message": "QR already used — ticket is invalid"}

    if booking.status == BookingStatus.CANCELLED:
        return {"valid": False, "message": "Booking was cancelled"}

    if booking.status != BookingStatus.CONFIRMED:
        return {"valid": False, "message": "Payment not completed for this booking"}

    # Mark as used
    booking.status = BookingStatus.USED
    booking.scanned_at = datetime.utcnow()
    booking.scanned_by = scanner.id
    db.commit()

    student = db.query(User).filter(User.id == booking.student_id).first()
    route = booking.route

    return {
        "valid": True,
        "message": "Ticket validated successfully",
        "booking_reference": booking.booking_reference,
        "student_name": student.full_name if student else "Unknown",
        "route_name": route.route_name if route else "Unknown",
    }


def cancel_booking(db: Session, booking_id: int, student_id: int) -> Booking:
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.student_id == student_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status in [BookingStatus.USED, BookingStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")

    booking.status = BookingStatus.CANCELLED
    # Restore seat
    booking.route.available_seats += 1
    db.commit()
    db.refresh(booking)
    return booking
