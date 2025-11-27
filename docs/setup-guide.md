# Development Setup Guide

## Prerequisites
- Node.js 18+
- Python 3.10+
- Git

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/retail-forge-ai.git
cd retail-forge-ai
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Runs on: http://localhost:5173

### 3. Backend Setup (Node.js)
```bash
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev
```
Runs on: http://localhost:3000

### 4. Image Service Setup (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python image-service.py
```
Runs on: http://localhost:8000

## Verify Installation

All these should respond:
- Frontend: http://localhost:5173
- Backend Health: http://localhost:3000/health
- Image Service: http://localhost:8000/health

## Common Issues

### Port Already in Use
```bash
# Find process using port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Python venv Not Activating
Make sure you're in the `backend` directory first.

### npm install Fails
Try:
```bash
rm -rf node_modules package-lock.json
npm install
```