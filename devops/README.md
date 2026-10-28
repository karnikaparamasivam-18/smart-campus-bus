# ⚙️ DevOps – Smart Campus Bus Booking & Management System

> **Owner:** [@evelinkim17](https://github.com/evelinkim17)  
> **Tech Stack:** Docker, Docker Compose, Nginx, Prometheus, Grafana, GitHub Actions

This directory and the associated root configuration files containerize the entire Smart Campus Bus application, provide Nginx reverse proxying, establish automated Prometheus scraping and Grafana metrics visualization, and define GitHub Actions CI/CD pipelines.

---

## 🏗️ Architecture Overview

```
                          [ Client / Browser ]
                                   │
                                   ▼ :80
                     ┌───────────────────────────┐
                     │       Nginx Proxy         │
                     │      (:80 on host)        │
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │ /api/, /docs, /openapi.json             │ / (default)
              ▼                                         ▼
   ┌───────────────────────┐                 ┌───────────────────────┐
   │    FastAPI Backend    │                 │   React Frontend UI   │
   │      (:8000)          │                 │        (:80)          │
   └──────────┬────────────┘                 └───────────────────────┘
              │ :5432
              ▼
   ┌───────────────────────┐
   │   PostgreSQL DB       │
   │  (campus_bus / :5432) │
   └───────────────────────┘

────────────────────────────────────────────────────────────────────────
[ Monitoring Subsystem ]

   ┌───────────────────────┐                 ┌───────────────────────┐
   │      Prometheus       │◄──pull metrics──│    FastAPI Backend    │
   │ (:9090 / scrapes 15s) │ (:8000/metrics) │      (/metrics)       │
   └──────────┬────────────┘                 └───────────────────────┘
              │ :9090
              ▼
   ┌───────────────────────┐
   │        Grafana        │ (Auto-provisioned datasource)
   │  (:3001 -> :3000)     │ Default user/pass: admin/admin
   └───────────────────────┘
```

---

## 📁 DevOps Directory Structure

```
smart-campus-bus/
├── docker-compose.yml                                  # Root-level multi-container orchestrator (6 services)
├── .github/
│   └── workflows/
│       └── ci-cd.yml                                   # Automated test & Docker build pipeline
├── devops/
│   ├── README.md                                       # DevOps documentation (this file)
│   ├── nginx/
│   │   └── nginx.conf                                  # Reverse proxy routing & proxy headers
│   └── monitoring/
│       ├── prometheus.yml                              # Prometheus scrape configuration (FastAPI metrics)
│       └── grafana/
│           └── provisioning/
│               └── datasources/
│                   └── prometheus.yml                  # Grafana default Prometheus datasource
├── backend/
│   ├── Dockerfile                                      # FastAPI container build
│   └── .dockerignore                                   # Build context exclusions
└── frontend/
    ├── Dockerfile                                      # Multi-stage Node 18 -> Nginx Alpine container build
    └── .dockerignore                                   # Build context exclusions
```

---

## 🔌 Service & Port Reference

| Service | Container Internal Port | Host Port | Description |
|---|---|---|---|
| **nginx** | `80` | `80` | Reverse proxy gateway routing `/api/` & `/docs` to backend, `/` to frontend |
| **frontend** | `80` | `3000` | React application served via internal Nginx |
| **backend** | `8000` | `8000` | FastAPI backend application and Swagger UI |
| **db** | `5432` | `5432` | PostgreSQL 15 database |
| **prometheus** | `9090` | `9090` | Prometheus time-series metrics collector |
| **grafana** | `3000` | `3001` | Grafana metrics visualization UI |

---

## 🚀 Getting Started

### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2+

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure test values or production secrets are populated as needed.

### 2. Start Full Stack
From the project root:
```bash
docker-compose up --build
```
To run in detached mode (in the background):
```bash
docker-compose up -d --build
```

### 3. Access URLs
- **Application Portal (via Nginx):** [http://localhost](http://localhost)
- **API Documentation (Swagger UI):** [http://localhost/docs](http://localhost/docs) or [http://localhost:8000/docs](http://localhost:8000/docs)
- **Prometheus Dashboard:** [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboard:** [http://localhost:3001](http://localhost:3001)
  - **Username:** `admin`
  - **Password:** `admin`

---

## 📊 Monitoring Details

1. **FastAPI Instrumentation:**
   - The backend uses `prometheus-fastapi-instrumentator` configured in `app/main.py`.
   - Metrics are exposed at `/metrics`.
2. **Prometheus Scraping:**
   - Configured in `devops/monitoring/prometheus.yml` to scrape `backend:8000/metrics` every `15s`.
3. **Grafana Auto-Provisioning:**
   - The Prometheus datasource is pre-configured via `devops/monitoring/grafana/provisioning/datasources/prometheus.yml`.
   - On startup, Grafana is immediately ready to query metrics without manual configuration.

---

## 🔄 CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

The GitHub Actions pipeline triggers on every push and pull request targeting `main` and `dev`:
1. **`test-backend` Job:**
   - Spins up a `postgres:15` container service with health checks.
   - Installs Python 3.11 and dependencies from `backend/requirements.txt`.
   - Executes unit and integration tests using `pytest tests/ -v`.
2. **`build-docker` Job:**
   - Depends on `test-backend` passing.
   - Sets up Docker Buildx.
   - Builds both `campus-bus-backend` and `campus-bus-frontend` container images.

---

## 🛠️ Handy DevOps Commands

```bash
# Check service health and status
docker-compose ps

# View live logs for all services
docker-compose logs -f

# View live logs for a specific service
docker-compose logs -f backend
docker-compose logs -f nginx

# Stop all services and keep data volumes
docker-compose down

# Stop all services and delete volumes
docker-compose down -v

# Rebuild a specific service
docker-compose up -d --build backend
```
