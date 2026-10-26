from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.payment import PaymentOrderCreate, PaymentOrderResponse, PaymentVerify, PaymentResponse
from app.api.deps import get_current_student
from app.services.payment_service import create_payment_order, verify_payment
from app.models.user import User

router = APIRouter()


@router.post("/create-order", response_model=PaymentOrderResponse)
def create_order(
    order_in: PaymentOrderCreate,
    db: Session = Depends(get_db),
    student: User = Depends(get_current_student),
):
    """Student: Create a Razorpay payment order for a booking."""
    return create_payment_order(db, order_in.booking_id)


@router.post("/verify", response_model=PaymentResponse)
def verify(
    payment_data: PaymentVerify,
    db: Session = Depends(get_db),
    student: User = Depends(get_current_student),
):
    """Student: Verify payment after Razorpay checkout."""
    return verify_payment(
        db,
        payment_data.razorpay_order_id,
        payment_data.razorpay_payment_id,
        payment_data.razorpay_signature,
    )
