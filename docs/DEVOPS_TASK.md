# ⚙️ DevOps Task – Smart Campus Bus
**Assigned to:** [@evelinkim17](https://github.com/evelinkim17)
**Tech:** Docker, Docker Compose, GitHub Actions, Nginx, Prometheus, Grafana

---

## 🎯 Your Goal
Containerize the entire app, set up CI/CD, configure Nginx as reverse proxy, and add monitoring with Prometheus + Grafana.

---

## ⚙️ Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/karnikaparamasivam-18/smart-campus-bus.git
cd smart-campus-bus

# 2. Create your branch
git checkout -b feature/devops
```

---

## 📁 Files to Create

```
devops/
├── nginx/
│   └── nginx.conf
└── monitoring/
    ├── prometheus.yml
    └── grafana/
        └── provisioning/
            └── datasources/
                └── prometheus.yml

docker-compose.yml          ← root level
.github/
└── workflows/
    └── ci-cd.yml
```

---

## 1️⃣ `docker-compose.yml` (Root Level)

Create this file at the **root** of the project (`smart-campus-bus/docker-compose.yml`):

```yaml
version: "3.9"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: campus_bus
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/campus_bus
      SECRET_KEY: super-secret-key-change-in-prod
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
      BACKEND_CORS_ORIGINS: '["http://localhost:3000","http://localhost"]'
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./devops/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./devops/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./devops/monitoring/grafana/provisioning:/etc/grafana/provisioning

volumes:
  postgres_data:
  grafana_data:
```

---

## 2️⃣ `devops/nginx/nginx.conf`

```nginx
events {}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /docs {
            proxy_pass http://backend;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
        }
    }
}
```

---

## 3️⃣ `devops/monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fastapi-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
```

---

## 4️⃣ `devops/monitoring/grafana/provisioning/datasources/prometheus.yml`

```yaml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    isDefault: true
```

---

## 5️⃣ Frontend `Dockerfile` (create inside `frontend/`)

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 6️⃣ `.github/workflows/ci-cd.yml` (GitHub Actions)

Create this file at `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run backend tests
        run: |
          cd backend
          pytest tests/ -v

  build-docker:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: test-backend

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build backend image
        run: docker build -t campus-bus-backend ./backend

      - name: Build frontend image
        run: docker build -t campus-bus-frontend ./frontend
```

---

## 🌿 Git Workflow

```bash
git add .
git commit -m "feat: add docker-compose for full stack"
git commit -m "feat: add nginx reverse proxy config"
git commit -m "feat: add prometheus and grafana monitoring"
git commit -m "feat: add github actions ci/cd pipeline"
git push origin feature/devops

# Open Pull Request: feature/devops → dev
```

### Commit message style:
- `feat: add docker-compose.yml`
- `feat: add nginx reverse proxy`
- `feat: configure prometheus scraping`
- `feat: add grafana datasource provisioning`
- `feat: add github actions ci/cd workflow`

---

## ✅ Checklist
- [ ] `docker-compose.yml` with all 6 services (db, backend, frontend, nginx, prometheus, grafana)
- [ ] Backend Dockerfile (already done by Karnika)
- [ ] Frontend Dockerfile
- [ ] Nginx config
- [ ] Prometheus config
- [ ] Grafana datasource provisioning
- [ ] GitHub Actions CI/CD workflow (test + build)
- [ ] `docker-compose up --build` works end to end
