# Sudoku Web App

A full-stack Sudoku web application with a React frontend and Node.js backend.

## Project Structure

```
.
├── frontend/   # React application (served via Nginx in production)
└── backend/    # Node.js API server
```

## Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs at http://localhost:5173 (or the port configured by Vite).

### Backend

```bash
cd backend
npm install
npm start
```

Backend API runs at http://localhost:3001.

## Running Tests

### Frontend tests

```bash
cd frontend
npm run test
```

### Backend tests

```bash
cd backend
npm run test
```

## Running with Docker Compose

```bash
docker compose up --build
```

This starts both services:

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost          |
| Backend  | http://localhost:3001     |

## Service URLs (Docker)

- **Frontend:** http://localhost (port 80)
- **Backend API:** http://localhost:3001
