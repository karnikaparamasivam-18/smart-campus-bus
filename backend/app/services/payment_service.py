import razorpay
import hmac
import hashlib
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.config import settings
from app.models.payment import Payment, PaymentStatus
from app.models.booking import Booking, BookingStatus


def get_razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_payment_order(db: Session, booking_id: int) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    route = booking.route
    amount_paise = int(route.fare * 100)  # Razorpay works in paise

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


def verify_payment(db: Session, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> Payment:
    # Verify signature
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()

    payment = db.query(Payment).filter(Payment.razorpay_order_id == razorpay_order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    if generated_signature != razorpay_signature:
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed — invalid signature")

    # Mark payment as success
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = PaymentStatus.SUCCESS

    # Confirm the booking
    booking = payment.booking
    booking.status = BookingStatus.CONFIRMED

    db.commit()
    db.refresh(payment)
    return payment
