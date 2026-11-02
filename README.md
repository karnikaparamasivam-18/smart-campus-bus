# 🚌 Smart Campus Bus Booking & Management System

**A Dockerized, cloud-deployed campus transportation management platform with CI/CD, monitoring, and role-based access control.**

The Smart Campus Bus Booking & Management System is a full-stack web application designed to simplify campus transportation through digital bus booking, route management, ticket verification, and administrative operations.

The project demonstrates the practical implementation of **DevOps principles**, including version control, containerization, multi-container orchestration, cloud deployment, reverse proxy configuration, continuous integration, and infrastructure monitoring.

### 🌐 Live Application

**[Visit the Deployed Application](https://smartcampusbus-demo.duckdns.org)**

**Deployment Platform:** AWS EC2 (Ubuntu Linux)  
**Deployment Method:** Docker Compose  
**Production Web Server:** Nginx  
**Database:** PostgreSQL 15

---

## ✨ Key Features

### 👨‍🎓 Student Portal
- Student registration and secure login
- View available buses and routes
- Book bus seats
- Access booking history
- View booking and ticket information

### 🛡️ Admin Dashboard
- Role-based administrative access
- Manage buses and routes
- Manage users and bookings
- View booking information and summary reports

### 🎫 Scanner / Conductor Portal
- Role-based scanner login
- QR-based ticket verification
- Ticket validation and usage tracking

### ⚙️ DevOps Features
- Docker containerization of application services
- Multi-container orchestration using Docker Compose
- Git-based version control and feature branch collaboration
- GitHub Actions workflows for CI/CD checks
- Cloud hosting on AWS EC2
- Nginx reverse proxy and HTTPS access
- PostgreSQL persistent storage using Docker volumes
- Prometheus metrics collection
- Grafana monitoring dashboards

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL 15 |
| Authentication | JWT-based authentication |
| Containerization | Docker |
| Multi-container Management | Docker Compose |
| CI/CD | GitHub Actions |
| Cloud Infrastructure | AWS EC2 (Ubuntu) |
| Reverse Proxy | Nginx |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Version Control | Git & GitHub |
| Domain | DuckDNS |
| HTTPS | TLS/SSL |

---

## 🏗️ System Architecture

```text
                     USERS
               (Web / Mobile)
                       |
                       | HTTPS
                       v
       smartcampusbus-demo.duckdns.org
                       |
                       v
              +----------------+
              |  Nginx Proxy   |
              |  Ports 80/443  |
              +----------------+
                       |
              +--------+--------+
              |                 |
              v                 v
       +-------------+   +-------------+
       |   React     |   |   FastAPI   |
       |  Frontend   |-->|   Backend   |
       +-------------+   +-------------+
                               |
                               v
                        +-------------+
                        | PostgreSQL  |
                        |  Database   |
                        +-------------+
                               |
                               v
                        Docker Volume

              MONITORING INFRASTRUCTURE
              +-----------------------+
              |      Prometheus       |
              |   Metrics Collection  |
              +-----------------------+
                         |
                         v
              +-----------------------+
              |        Grafana        |
              |   Monitoring Panels   |
              +-----------------------+

              HOSTED ON AWS EC2
```

All application services run as Docker containers on the EC2 instance and communicate using Docker networking.

---

## 🐳 Docker Containerization

The deployed system consists of **six Docker containers**.

| Container | Purpose |
|---|---|
| `frontend` | Serves the React application |
| `backend` | Runs the FastAPI application |
| `db` | Stores application data in PostgreSQL |
| `nginx` | Handles reverse proxy routing and HTTPS |
| `prometheus` | Collects monitoring metrics |
| `grafana` | Visualizes monitoring data |

Docker Compose is used to configure services, internal networks, environment variables, port mappings, health checks, and persistent volumes.

### Benefits of Containerization

- Consistent application environments
- Isolated services and dependencies
- Simplified deployment and configuration
- Easier application maintenance
- Reproducible builds
- Persistent database storage

---

## 🔄 CI/CD and Version Control

GitHub is used for collaborative development, version control, and managing feature integration.

### Branching Strategy

| Branch | Purpose |
|---|---|
| `feature/frontend` | Frontend development |
| `feature/backend` | Backend development |
| `feature/devops` | Docker, CI/CD, and monitoring |
| `dev` | Development and integration |
| `final/integrated-deployment` | Final integrated deployment version |

### CI/CD Workflow

The repository includes GitHub Actions workflows for automated development checks.

The CI/CD process is organized around:

1. Code development and Git commits
2. Pushing changes to GitHub
3. Automated workflow execution
4. Dependency installation and validation
5. Application testing and build checks
6. Integration and deployment preparation
7. Deployment of validated changes to AWS EC2

**Note:** Production deployment is managed separately on EC2; the presence of GitHub Actions workflows does not necessarily imply that every push triggers an automatic production deployment.

---

## ☁️ AWS EC2 Deployment

The application is deployed on an Ubuntu-based AWS EC2 instance.

The production environment uses Docker Compose to run the application services and Nginx to provide access through a public domain.

### Production Services

```bash
docker compose --env-file .env.production \
  -f docker-compose.prod.yml ps
```

### Rebuild and Start Production Services

```bash
docker compose --env-file .env.production \
  -f docker-compose.prod.yml up -d --build
```

This command should be executed on the configured EC2 server after reviewing changes and ensuring that production environment variables are present.

### Live Website

https://smartcampusbus-demo.duckdns.org

---

## 🗄️ Database Management

The application uses PostgreSQL to store and manage application records.

### Main Database Tables

| Table | Description |
|---|---|
| `users` | User accounts and roles |
| `buses` | Bus information |
| `routes` | Bus routes and scheduling information |
| `bookings` | Student bus bookings |
| `payments` | Payment-related records |

PostgreSQL runs in a dedicated Docker container, with persistent storage configured through a Docker volume.

This allows application containers to be recreated without intentionally deleting database records.

### View Database Tables

On the EC2 server:

```bash
docker compose --env-file .env.production \
  -f docker-compose.prod.yml \
  exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"'
```

---

## 📊 Monitoring with Prometheus and Grafana

Monitoring is an important part of maintaining a deployed application.

### Prometheus

Prometheus is used to collect metrics from configured monitoring targets.

### Grafana

Grafana provides dashboards for visualizing collected metrics and monitoring system behavior.

### Monitoring Objectives

- Observe application and service performance
- Identify abnormal behavior
- Support troubleshooting
- Improve operational visibility
- Understand service health and availability

Monitoring services run alongside the application in Docker containers.

---

## 💻 Local Development

### Prerequisites

- Git
- Docker Desktop
- Docker Compose
- Node.js and Python for development outside Docker

### 1. Clone the Repository

```bash
git clone -b final/integrated-deployment \
  https://github.com/karnikaparamasivam-18/smart-campus-bus.git

cd smart-campus-bus
```

### 2. Start the Application

```bash
docker compose up -d --build
```

### 3. Access Local Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| FastAPI Documentation | http://localhost:8000/docs |
| Nginx | http://localhost |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

Local development configuration is separate from production. Local services may require appropriate environment variables, and the local database does not automatically contain production data.

### 4. Check Container Status

```bash
docker compose ps
```

### 5. Stop the Application

```bash
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to remove associated persistent volumes.

---

## 👥 Team Members and Contributions

| Team Member | Area of Contribution |
|---|---|
| **Karnika K P** | Backend development, API integration, database-related functionality, and final application integration |
| **Evelin Kimberly** | DevOps infrastructure, Docker configuration, GitHub Actions, Nginx, Prometheus, and Grafana |
| **Dhakshitha Deivanai** | Frontend development, user interface, and application dashboards |

The project was developed collaboratively using Git feature branches, pull requests, commits, and final integration.

---

## 🚧 Challenges and Learnings

During development and deployment, the team worked through several technical challenges:

- Integrating independently developed frontend, backend, and DevOps components
- Managing Git branches and resolving integration differences
- Configuring communication between Docker containers
- Connecting FastAPI with PostgreSQL
- Managing database persistence
- Configuring Nginx reverse proxy routing
- Handling environment differences between Windows development and Linux deployment
- Deploying and validating a multi-container application on AWS EC2
- Setting up CI/CD checks and monitoring infrastructure

### Key Learnings

This project provided hands-on experience in:

- Full-stack application deployment
- Containerized infrastructure
- Git-based collaborative workflows
- Cloud infrastructure management
- CI/CD concepts and implementation
- Database persistence
- Reverse proxy configuration
- Monitoring and observability
- Troubleshooting production environments

---

## 🔮 Future Enhancements

- More comprehensive automated testing
- Fully automated production deployment with rollback support
- Automated database backups
- Improved monitoring alerts
- Enhanced admin analytics
- Improved mobile responsiveness
- Security hardening and secret management
- Additional reliability and performance improvements

---

## 🎓 Academic Context

**Project:** Smart Campus Bus Booking & Management System  
**Domain:** DevOps and Cloud Deployment  
**Institution:** Shiv Nadar University Chennai

The project demonstrates how modern DevOps tools can be integrated to develop, package, deploy, and monitor a real-world web application.

---

## 📌 Project Repository

**GitHub:** https://github.com/karnikaparamasivam-18/smart-campus-bus

**Production Branch:** `final/integrated-deployment`

**Live Application:** https://smartcampusbus-demo.duckdns.org

---

**Built collaboratively as a DevOps course project.**