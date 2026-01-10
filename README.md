# Project Setup and Guide

## Dependencies

Ensure you have the following installed:
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## First Time Setup

### 1. Database Setup
```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE project_management;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE project_management TO postgres;"

# Start Redis
sudo service redis-server start
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## How to Run (Every Time)

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## User Registration

To register a new user, send the following mutation to `http://localhost:8000/graphql/`:

```graphql
mutation Register {
  register(username: "newuser", email: "user@example.com", password: "password123") {
    success
    error
    user {
      id
      username
    }
  }
}
```
