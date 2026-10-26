from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.booking import BookingCreate, BookingResponse, QRScanRequest, QRScanResponse
from app.api.deps import get_current_student, get_current_scanner, get_current_user
from app.services.booking_service import create_booking, get_student_bookings, validate_qr, cancel_booking
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=BookingResponse, status_code=201)
def book_ticket(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    student: User = Depends(get_current_student),
):
    """Student: Book a bus ticket."""
    return create_booking(db, booking_in, student)


@router.get("/my", response_model=List[BookingResponse])
def my_bookings(db: Session = Depends(get_db), student: User = Depends(get_current_student)):
    """Student: Get my booking history."""
    return get_student_bookings(db, student.id)


@router.post("/scan", response_model=QRScanResponse)
def scan_qr(
    scan_data: QRScanRequest,
    db: Session = Depends(get_db),
    scanner: User = Depends(get_current_scanner),
):
    """Scanner/Admin: Validate a QR code."""
    return validate_qr(db, scan_data.qr_token, scanner)


@router.delete("/{booking_id}", response_model=BookingResponse)
def cancel(
    booking_id: int,
    db: Session = Depends(get_db),
    student: User = Depends(get_current_student),
):
    """Student: Cancel a booking."""
    return cancel_booking(db, booking_id, student.id)
