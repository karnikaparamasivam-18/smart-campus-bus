
import razorpay
import hmac
import hashlib

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.config import settings
from app.models.payment import Payment, PaymentStatus
from app.models.booking import Booking, BookingStatus


def get_razorpay_client():
    return razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET,
        )
    )


def create_payment_order(
    db: Session,
    booking_id: int,
    student_id: int,
) -> dict:

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.student_id == student_id,
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Booking is not pending payment",
        )

    route = booking.route
    amount_paise = int(route.fare * 100)

    client = get_razorpay_client()

    order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": booking.booking_reference,
    })

    payment = Payment(
        booking_id=booking.id,
        razorpay_order_id=order["id"],
        amount=route.fare,
        status=PaymentStatus.PENDING,
    )

    db.add(payment)
    db.commit()

    return {
        "razorpay_order_id": order["id"],
        "amount": route.fare,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
    }


def verify_payment(
    db: Session,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    student_id: int,
) -> Payment:

    payment = (
        db.query(Payment)
        .join(Booking, Payment.booking_id == Booking.id)
        .filter(
            Payment.razorpay_order_id == razorpay_order_id,
            Booking.student_id == student_id,
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found",
        )

    if payment.status == PaymentStatus.SUCCESS:
        raise HTTPException(
            status_code=400,
            detail="Payment already verified",
        )

    if payment.booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Booking is no longer eligible for payment confirmation",
        )

    # Verify Razorpay signature
    message = f"{razorpay_order_id}|{razorpay_payment_id}"

    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        generated_signature,
        razorpay_signature,
    ):
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed - invalid signature",
        )

    # Mark payment as successful
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = PaymentStatus.SUCCESS

    # Confirm associated booking
    booking = payment.booking
    booking.status = BookingStatus.CONFIRMED

    db.commit()
    db.refresh(payment)

    return payment
