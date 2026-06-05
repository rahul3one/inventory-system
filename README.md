# Inventory & Order Management System

A full-stack Inventory and Order Management System built with FastAPI, React, and PostgreSQL. Supports product management, customer management, order creation with automatic stock validation and reduction.

## Live URLs
- **Frontend:** https://inventory-system-xi-amber.vercel.app
- **Backend API:** https://inventory-system-2w6m.onrender.com
- **API Docs (Swagger):** https://inventory-system-2w6m.onrender.com/docs
- **Docker Hub:** https://hub.docker.com/r/rahulvns1124/inventory-backend

## Tech Stack
| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | React + Vite            |
| Backend   | FastAPI + Python 3.11   |
| Database  | PostgreSQL 16           |
| Container | Docker + Docker Compose |
| Frontend Host | Vercel              |
| Backend Host  | Render              |

## Local Setup

### Prerequisites
- Docker Desktop installed and running
- Git installed

### Steps
\`\`\`bash
# 1. Clone the repo
git clone https://github.com/rahulvns1124/inventory-system.git
cd inventory-system

# 2. Create environment file
cp .env.example .env

# 3. Start all services
docker-compose up --build
\`\`\`

- Frontend:   http://localhost:5173
- Backend:    http://localhost:8000
- API Docs:   http://localhost:8000/docs

## Environment Variables

| Variable          | Description                   | Example                                        |
|-------------------|-------------------------------|------------------------------------------------|
| DATABASE_URL      | PostgreSQL connection string  | postgresql://user:pass@db:5432/inventory_db    |
| POSTGRES_USER     | Database username             | postgres                                       |
| POSTGRES_PASSWORD | Database password             | strongpassword123                              |
| POSTGRES_DB       | Database name                 | inventory_db                                   |
| VITE_API_URL      | Backend URL for frontend      | https://inventory-system-2w6m.onrender.com     |

## API Endpoints

### Health
| Method | Endpoint   | Description       |
|--------|------------|-------------------|
| GET    | /health    | Health check      |
| GET    | /docs      | Swagger API docs  |

### Products
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /products/        | List all products        |
| POST   | /products/        | Create product           |
| GET    | /products/{id}    | Get single product       |
| PUT    | /products/{id}    | Update product           |
| DELETE | /products/{id}    | Delete product           |

### Customers
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /customers/       | List all customers       |
| POST   | /customers/       | Create customer          |
| GET    | /customers/{id}   | Get single customer      |
| PUT    | /customers/{id}   | Update customer          |
| DELETE | /customers/{id}   | Delete customer          |

### Orders
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /orders/              | List all orders          |
| POST   | /orders/              | Create order             |
| GET    | /orders/{id}          | Get single order         |
| PATCH  | /orders/{id}/status   | Update order status      |

## Business Rules
- Product SKUs are unique — duplicate SKU returns 400 error
- Customer emails are unique — duplicate email returns 400 error
- Orders validate stock for ALL items before any changes are made
- Stock is automatically reduced when an order is placed
- Orders return 400 with a clear message if stock is insufficient
- Order total is automatically calculated from unit prices

## Docker

\`\`\`bash
# Pull backend image directly
docker pull rahulvns1124/inventory-backend:latest

# Run full stack locally
docker-compose up --build
\`\`\`

## Project Structure
\`\`\`
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # DB models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── pages/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
\`\`\`