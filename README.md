# 🚌 Smart Campus Bus Booking & Management System

A full-stack DevOps project for digitizing campus bus booking, QR validation, and admin management.

## 👥 Team

| Member | GitHub | Role |
|--------|--------|------|
| Karnika | [@karnikaparamasivam-18](https://github.com/karnikaparamasivam-18) | Backend – FastAPI, PostgreSQL, Auth, QR, Payments |
| Dhakshi | [@Dhakshi03](https://github.com/Dhakshi03) | Frontend – React.js + Tailwind CSS |
| Evelin | [@evelinkim17](https://github.com/evelinkim17) | DevOps – Docker, CI/CD, Nginx, Monitoring |

## 🏗️ Project Structure

```
smart-campus-bus/
├── backend/         # FastAPI backend (Karnika)
├── frontend/        # React.js frontend (Dhakshi)
├── devops/          # Docker, Nginx, CI/CD, Monitoring (Evelin)
└── docs/            # Task documents & API docs
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL

### Run with Docker Compose
```bash
docker-compose up --build
```

### Run Backend Locally
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | OAuth2 + JWT |
| QR | Python QRCode + HTML5-QRCode |
| Payment | Razorpay (Test Mode) |
| DevOps | Docker, GitHub Actions, Nginx |
| Monitoring | Prometheus + Grafana |

## 📄 API Documentation
After starting the backend, visit: `http://localhost:8000/docs`

## 🔐 Environment Variables
Copy `.env.example` to `.env` and fill in your values.
