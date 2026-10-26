from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    route_id: int
    travel_date: datetime


class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    route_id: int
    student_id: int
    status: BookingStatus
    travel_date: datetime
    qr_code: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class QRScanRequest(BaseModel):
    qr_token: str


class QRScanResponse(BaseModel):
    valid: bool
    message: str
    booking_reference: Optional[str] = None
    student_name: Optional[str] = None
    route_name: Optional[str] = None
