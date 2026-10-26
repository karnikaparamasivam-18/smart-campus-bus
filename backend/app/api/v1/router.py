from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, buses, routes, bookings, payments, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(buses.router, prefix="/buses", tags=["Buses"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
