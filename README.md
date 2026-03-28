# 🏠 ISD Airbnb — Microservice Platform

A full-stack Airbnb-like rental platform built with **Spring Boot microservices**, **React**, **MongoDB Atlas**, and **Docker**. Designed for scalability, independent deployability, and clean separation of concerns.

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────┐
                        │   React Frontend │
                        │   (Port: 3000)   │
                        └────────┬────────┘
                                 │ HTTP
                        ┌────────▼────────┐
                        │ Nginx Load Bal. │
                        │   (Port: 80)    │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   API Gateway   │
                        │(Ports: 8080x2)  │
                        └────────┬────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │          │           │           │          │
   ┌──────▼───┐ ┌────▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼──────┐
   │  User    │ │Booking  │ │Payment │ │Listing │ │Availabil.│
   │ :8081    │ │ :8082   │ │ :8083  │ │ :8084  │ │  :8085   │
   └──────────┘ └─────────┘ └────────┘ └────────┘ └──────────┘
          │          │
   ┌──────▼───┐ ┌────▼──────┐ ┌──────────────┐ ┌─────────────┐
   │  Search  │ │Notif.     │ │    Admin     │ │   Review    │
   │  :8086   │ │ :8087     │ │    :8088     │ │   :8089     │
   └──────────┘ └───────────┘ └──────────────┘ └─────────────┘
          │          │           │     │     │        │
          └──────────┴───────────┘     │     │        │
                     │                 │     │        │
              ┌──────▼─────────────────▼─────▼────────▼───┐
              │             MongoDB Atlas (Cloud)         │
              │  userdb | bookingdb | paymentdb | etc...  │
              └───────────────────────────────────────────┘
```

---

## 📦 Services

| Service              | Port | Database         | Responsibility                              |
|----------------------|------|------------------|---------------------------------------------|
| **Nginx Proxy**      | 80   | —                | Load balancing across API Gateways          |
| **API Gateway**      | 8080 | —                | Route all incoming requests                 |
| **User Service**     | 8081 | `userdb`         | Auth, guest/host profiles, Message/Wishlist |
| **Booking Service**  | 8082 | `bookingdb`      | Create bookings, status transitions, history|
| **Payment Service**  | 8083 | `paymentdb`      | Payments, refunds, host payouts             |
| **Listing Service**  | 8084 | `listingdb`      | Property details, pricing, images           |
| **Availability Svc** | 8085 | `availabilitydb` | Calendar, date blocking, double-book guard  |
| **Search Service**   | 8086 | `searchdb`       | Search indexing, filters                    |
| **Notification Svc** | 8087 | `notificationdb` | Email/SMS/push to guest & host              |
| **Admin Service**    | 8088 | `admindb`        | Monitoring, logs, platform moderation       |
| **Review Service**   | 8089 | `reviewdb`       | Property reviews, host responses, ratings   |

---

## 🔄 Booking Status Flow

```
PENDING ──► CONFIRMED ──► CHECKED_IN ──► CHECKED_OUT
   │              │
   └──────────────┴──► CANCELLED ──► REFUNDED (partial / full)
                                          │
FAILED ◄──────────────────────────────────┘ (payment failure path)
```

| Status             | Trigger                                  |
|--------------------|------------------------------------------|
| `PENDING`          | Booking created, awaiting payment        |
| `CONFIRMED`        | Payment successful                       |
| `CHECKED_IN`       | Guest checks in on start date            |
| `CHECKED_OUT`      | Guest checks out on end date             |
| `CANCELLED`        | Guest or host cancels                    |
| `FAILED`           | Payment or system failure                |
| `REFUNDED`         | Full (cancelled early) / Partial (late)  |

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, React Router v6, Axios    |
| Backend     | Spring Boot 3.2, Java 21            |
| Database    | MongoDB Atlas (per-service DB)      |
| Auth        | JWT (Spring Security)               |
| Gateway     | Spring Cloud Gateway                |
| Container   | Docker, Docker Compose              |
| CI/CD       | GitHub Actions                      |

---

## 🚀 Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose
- MongoDB Atlas account (cluster: `cluster0`, project: `ISD Airbnb`)

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/isd-airbnb.git
cd isd-airbnb
```

---

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual MongoDB Atlas connection strings, JWT secret, and mail credentials.

---

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

All services will start. API Gateway is available at `http://localhost:8080`.

---

### 4. Run Individual Services (Development)

```bash
cd backend/<service-name>
mvn spring-boot:run
```

---

### 5. Run the Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

---

## 🌿 Git Branch Strategy

```
main          ──── Production-ready, protected
develop       ──── Integration branch
feature/*     ──── New features  (e.g. feature/booking-status-history)
hotfix/*      ──── Urgent production fixes
release/*     ──── Release preparation
```

### Branch per Service (recommended for parallel dev)

```
feature/user-service
feature/booking-service
feature/payment-service
...
```

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/ci-cd.yml`

| Trigger                        | Jobs                                      |
|-------------------------------|-------------------------------------------|
| Push / PR → `main`, `develop` | Detect changes → Build → Test → Docker   |
| Backend change detected        | Matrix build for all 9 Spring Boot services |
| Frontend change detected       | npm install → build                       |

### Required GitHub Secrets

| Secret                  | Description                          |
|-------------------------|--------------------------------------|
| `MONGO_URI_TEST`        | Atlas URI for test environment       |
| `REACT_APP_API_BASE_URL`| API Gateway URL for frontend build   |

---

## 📁 Project Structure

```
isd-airbnb/
├── backend/
│   ├── api-gateway/
│   ├── user-service/
│   ├── booking-service/
│   ├── payment-service/
│   ├── listing-service/
│   ├── availability-service/
│   ├── search-service/
│   ├── notification-service/
│   └── admin-service/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       └── utils/
├── docs/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📄 API Routes (via Gateway)

| Route prefix          | Forwarded to         |
|-----------------------|----------------------|
| `/api/users/**`       | user-service:8081    |
| `/api/bookings/**`    | booking-service:8082 |
| `/api/payments/**`    | payment-service:8083 |
| `/api/listings/**`    | listing-service:8084 |
| `/api/availability/**`| availability-service:8085 |
| `/api/search/**`      | search-service:8086  |
| `/api/notifications/**`| notification-service:8087 |
| `/api/admin/**`       | admin-service:8088   |
| `/api/reviews/**`     | review-service:8089  |

---

## 👥 Team

BUET — CSE 326 Information System Design
Project: **ISD Airbnb**

---

## 📝 License

This project is for academic purposes under BUET CSE 326.