
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole
from tests.test_auth import TestingSessionLocal, client, engine
from app.db.base import Base


def admin_headers():
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    try:
        user = db.query(User).filter(
            User.email == "admin@example.com"
        ).first()

        if user is None:
            user = User(
                full_name="Test Admin",
                email="admin@example.com",
                hashed_password=get_password_hash("StrongAdminPassword123"),
                role=UserRole.ADMIN,
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token({
            "sub": str(user.id),
            "role": "admin",
        })

        return {"Authorization": f"Bearer {token}"}

    finally:
        db.close()


def test_admin_creates_scanner_and_admin(client):
    headers = admin_headers()

    for role in ("scanner", "admin"):
        email = f"new-{role}@example.com"

        response = client.post(
            "/api/v1/admin/users",
            headers=headers,
            json={
                "email": email,
                "full_name": "Staff User",
                "password": "SecurePassword123!",
                "role": role,
            },
        )

        assert response.status_code == 201, response.text
        assert response.json()["role"] == role
        assert "hashed_password" not in response.json()

        login = client.post(
            "/api/v1/auth/login",
            json={
                "email": email,
                "password": "SecurePassword123!",
            },
        )

        assert login.status_code == 200


def test_student_cannot_create_staff(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "student@example.com",
            "full_name": "Student",
            "password": "password123",
        },
    )

    login = client.post(
        "/api/v1/auth/login",
        json={
            "email": "student@example.com",
            "password": "password123",
        },
    )

    token = login.json()["access_token"]

    response = client.post(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "email": "other@example.com",
            "full_name": "Other",
            "password": "SecurePassword123!",
            "role": "admin",
        },
    )

    assert response.status_code == 403


def test_staff_creation_validation(client):
    headers = admin_headers()

    payload = {
        "email": "staff@example.com",
        "full_name": "Staff",
        "password": "SecurePassword123!",
        "role": "student",
    }

    response = client.post(
        "/api/v1/admin/users",
        headers=headers,
        json=payload,
    )
    assert response.status_code == 422

    payload["role"] = "scanner"

    response = client.post(
        "/api/v1/admin/users",
        headers=headers,
        json=payload,
    )
    assert response.status_code == 201

    duplicate = client.post(
        "/api/v1/admin/users",
        headers=headers,
        json=payload,
    )
    assert duplicate.status_code == 409
