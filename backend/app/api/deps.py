
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.services.user_service import get_user_by_id


# Bearer authentication for Swagger and API requests
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # No token provided
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract JWT
    token = credentials.credentials

    # Decode and validate token
    try:
        payload = decode_token(token)
    except Exception:
        raise credentials_exception

    if not payload:
        raise credentials_exception

    # Only access tokens are accepted
    if payload.get("type") != "access":
        raise credentials_exception

    # Extract user ID
    user_id = payload.get("sub")

    if user_id is None:
        raise credentials_exception

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    # Fetch user from database
    user = get_user_by_id(db, user_id)

    if user is None or not user.is_active:
        raise credentials_exception

    return user


# Student-only endpoints
def get_current_student(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students only"
        )

    return current_user


# Scanner and Admin endpoints
def get_current_scanner(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role not in [
        UserRole.SCANNER,
        UserRole.ADMIN
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Scanners/Admins only"
        )

    return current_user


# Admin-only endpoints
def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only"
        )

    return current_user
