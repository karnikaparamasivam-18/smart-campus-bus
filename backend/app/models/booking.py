import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    USED = "used"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    booking_reference = Column(String(50), unique=True, nullable=False, index=True)
    qr_code = Column(Text, nullable=True)           # base64-encoded QR image
    qr_token = Column(String(255), unique=True)     # JWT token embedded in QR
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    travel_date = Column(DateTime(timezone=True), nullable=False)
    scanned_at = Column(DateTime(timezone=True), nullable=True)
    scanned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    student = relationship("User", back_populates="bookings", foreign_keys=[student_id])
    route = relationship("Route", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
