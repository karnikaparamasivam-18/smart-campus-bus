from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.route import RouteCreate, RouteResponse, RouteUpdate
from app.api.deps import get_current_admin, get_current_user
from app.models.route import Route
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[RouteResponse])
def list_routes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all active routes."""
    return db.query(Route).filter(Route.is_active == True).all()


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(route_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific route by ID."""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.post("/", response_model=RouteResponse, status_code=201)
def create_route(route_in: RouteCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Create a new route."""
    route = Route(**route_in.model_dump())
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.put("/{route_id}", response_model=RouteResponse)
def update_route(route_id: int, route_in: RouteUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Update a route."""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    for field, value in route_in.model_dump(exclude_unset=True).items():
        setattr(route, field, value)
    db.commit()
    db.refresh(route)
    return route


@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Admin: Deactivate a route."""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    route.is_active = False
    db.commit()
