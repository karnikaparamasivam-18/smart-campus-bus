from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.payment import PaymentStatus


class PaymentOrderCreate(BaseModel):
    booking_id: int


class PaymentOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: float
    currency: str = "INR"
    key_id: str


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    razorpay_order_id: str
    amount: float
    status: PaymentStatus
    created_at: datetime

    model_config = {"from_attributes": True}
