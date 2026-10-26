import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db
from app.db.base import Base

# Use in-memory SQLite for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_and_login(client):
    # Register
    resp = client.post("/api/v1/auth/register", json={
        "email": "student@test.com",
        "full_name": "Test Student",
        "password": "password123",
        "role": "student"
    })
    assert resp.status_code == 201
    assert resp.json()["email"] == "student@test.com"

    # Login
    resp = client.post("/api/v1/auth/login", json={
        "email": "student@test.com",
        "password": "password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_register_duplicate_email(client):
    payload = {"email": "dup@test.com", "full_name": "Dup User", "password": "pass123", "role": "student"}
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "a@test.com", "full_name": "A", "password": "correct", "role": "student"
    })
    resp = client.post("/api/v1/auth/login", json={"email": "a@test.com", "password": "wrong"})
    assert resp.status_code == 401


def test_get_profile_requires_auth(client):
    resp = client.get("/api/v1/users/me")
    assert resp.status_code == 401
