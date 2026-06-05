# Inventory System

Full-stack inventory and order management app with FastAPI, PostgreSQL, and React + Vite.

## Quick Start

```bash
# At project root
cp .env.example .env          # fill in values
docker-compose up --build     # spins up db + backend + frontend
```

- **Backend API docs:** http://localhost:8000/docs
- **Frontend:** http://localhost:5173

## Local Development (without Docker)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
inventory-system/
├── .env                 # Postgres credentials (not committed)
├── backend/             # FastAPI + SQLAlchemy
├── frontend/            # React + Vite + TanStack Query
└── docker-compose.yml
```

## API Endpoints

| Resource  | Base Path    |
|-----------|--------------|
| Products  | `/products`  |
| Customers | `/customers` |
| Orders    | `/orders`    |
