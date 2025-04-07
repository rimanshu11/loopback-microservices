# Book Management System - Microservices Architecture

This project is a **Book Management System** built using **microservices architecture**. It is designed to demonstrate how individual services can communicate through a centralized API Gateway. Each microservice runs independently and handles a specific domain in the system.

---

## 🧩 Microservices Overview

| Service Name      | Description                               | Port           |
|-------------------|-------------------------------------------|----------------|
| **Author Service** | Manages authors (CRUD operations)         | `localhost:3001` |
| **Book Service**   | Manages books (CRUD operations)           | `localhost:3002` |
| **Category Service** | Manages categories (CRUD operations)    | `localhost:3003` |
| **Auth Service**   | Handles user authentication & authorization | `localhost:3004` |
| **API Gateway (bms-api-gateway)** | Centralized entry point to access all services | `localhost:3005` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm / yarn
- MYSQL / PostgreSQL (based on your implementation)

---

## 📁 Folder Structure

```
bms-project/ │
 ├── author-service/ # Runs on port 3001
 ├── book-service/ # Runs on port 3002
 ├── category-service/ # Runs on port 3003
 ├── auth-service/ # Runs on port 3004
 └── bms-api-gateway/ # Runs on port 3005
```


---

## ⚙️ How to Run

Each service should be run independently. Open separate terminal tabs/windows for each.

### 1. Author Service
```bash
  cd author-service
  npm install
  npm start
  # Runs on http://localhost:3001
```
### 2. Book Service
```bash
  cd book-service
  npm install
  npm start
  # Runs on http://localhost:3002
```
### 3. Category Service
```bash
  cd category-service
  npm install
  npm start
  # Runs on http://localhost:3003
```
### 4. Auth-Service
```bash
  cd auth-service
  npm install
  npm start
  # Runs on http://localhost:3004
```
### 5. API Gateway
  ```bash
  cd bms-api-gateway
  npm install
  npm start
  # Runs on http://localhost:3005
```
## 🔐 Authentication & Authorization
- Auth service manages JWT-based authentication.

- API Gateway validates incoming tokens and routes requests accordingly.

- Role-based access control (RBAC) can be implemented via the auth-service.

## 📡 Communication Between Services

- Services communicate via HTTP through the centralized API Gateway.

- You can also implement service discovery or use a message broker (e.g., RabbitMQ, Kafka) for event-driven architecture.

## ✅ API Endpoints
All requests go through the API Gateway (http://localhost:3005).

Examples:

- GET /authors

- POST /books

- GET /categories

- POST /auth/login

## ✍️ Author

Developed by Rimanshu Singh
