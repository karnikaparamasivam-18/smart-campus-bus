
import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.services.payment_service import (
    create_payment_order,
    verify_payment,
)


def make_booking(
    booking_id=10,
    student_id=1,
    status=BookingStatus.PENDING,
):
    booking = Booking(
        id=booking_id,
        student_id=student_id,
        route_id=1,
        booking_reference="BUS-TEST123",
        status=status,
    )

    booking.route = MagicMock()
    booking.route.fare = 50.0

    return booking


def make_payment(booking, status=PaymentStatus.PENDING):
    payment = Payment(
        id=1,
        booking_id=booking.id,
        razorpay_order_id="order_test123",
        amount=50.0,
        status=status,
    )
    payment.booking = booking
    return payment


def test_student_cannot_create_order_for_another_student():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with patch(
        "app.services.payment_service.get_razorpay_client"
    ) as razorpay_client:
        with pytest.raises(HTTPException) as exc:
            create_payment_order(
                db,
                booking_id=10,
                student_id=2,
            )

        assert exc.value.status_code == 404
        razorpay_client.assert_not_called()


def test_student_cannot_verify_another_students_payment():
    db = MagicMock()
    db.query.return_value.join.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as exc:
        verify_payment(
            db,
            razorpay_order_id="order_test123",
            razorpay_payment_id="pay_test123",
            razorpay_signature="invalid",
            student_id=2,
        )

    assert exc.value.status_code == 404


def test_cancelled_booking_cannot_be_confirmed():
    booking = make_booking(status=BookingStatus.CANCELLED)
    payment = make_payment(booking)

    db = MagicMock()
    db.query.return_value.join.return_value.filter.return_value.first.return_value = payment

    with pytest.raises(HTTPException) as exc:
        verify_payment(
            db,
            razorpay_order_id="order_test123",
            razorpay_payment_id="pay_test123",
            razorpay_signature="invalid",
            student_id=1,
        )

    assert exc.value.status_code == 400
    assert booking.status == BookingStatus.CANCELLED
    db.commit.assert_not_called()


def test_already_verified_payment_cannot_be_verified_again():
    booking = make_booking(status=BookingStatus.CONFIRMED)
    payment = make_payment(booking, status=PaymentStatus.SUCCESS)

    db = MagicMock()
    db.query.return_value.join.return_value.filter.return_value.first.return_value = payment

    with pytest.raises(HTTPException) as exc:
        verify_payment(
            db,
            razorpay_order_id="order_test123",
            razorpay_payment_id="pay_test123",
            razorpay_signature="invalid",
            student_id=1,
        )

    assert exc.value.status_code == 400
    assert payment.status == PaymentStatus.SUCCESS
    db.commit.assert_not_called()


def test_confirmed_booking_cannot_create_another_order():
    booking = make_booking(status=BookingStatus.CONFIRMED)

    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = booking

    with patch(
        "app.services.payment_service.get_razorpay_client"
    ) as razorpay_client:
        with pytest.raises(HTTPException) as exc:
            create_payment_order(
                db,
                booking_id=10,
                student_id=1,
            )

        assert exc.value.status_code == 400
        razorpay_client.assert_not_called()
