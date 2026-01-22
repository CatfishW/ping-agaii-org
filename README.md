# PING Interactive Learning Platform

A full-stack web application for interactive educational simulations built with React and FastAPI.

## Project Structure

```
ping-agaii-org/
├── frontend/          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── App.js
│       └── index.js
├── backend/           # FastAPI backend
│   ├── main.py
│   └── requirements.txt
├── Force&Motion/      # Unity game assets
└── HTML/             # Legacy HTML files
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Database Setup

1. **Install PostgreSQL** (see [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions)

2. **Create database**:
   ```sql
   CREATE DATABASE ping_db;
   ```

3. **Configure environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `DATABASE_URL` with your PostgreSQL credentials
   - `SECRET_KEY` with a secure random string

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the FastAPI server:
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

## Features

### ✅ Implemented

- 🎮 Interactive simulation browser
- 🔍 Real-time search and filtering  
- 🎯 Subject-based categorization
- 🎲 Embedded Unity game (Forces and Motion)
- 📱 Responsive design
- 🚀 Fast and modern UI
- 🔐 User authentication (Register/Login)
### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/api/simulations` | Get all simulations (with filters) |
| GET | `/api/simulations/{sim_id}` | Get specific simulation |
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/tags` | Get all tags |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (Form data) |
| POST | `/api/auth/login-json` | Login (JSON) |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/guest` | Create guest session |
| POST | `/api/auth/consent` | Submit consent agreement |

### Query Parameters (Simulations)

- `subject`: Filter by subject (physics, math, chemistry, biology)
- `age`: Filter by age group
- `search`: Search by keyword, Student, Teacher, Admin)
- 📊 Database models for users, organizations, classes, modules

### 🚧 In Development

- ✅ Consent management system
- ⏳ Cookie consent UI
- ⏳ Privacy policy pages

### ⏳ Planned

- Google OAuth integration
- Unity ↔ React communication (postMessage)
- Behavior data collection
- Teacher dashboard
- Class management
- Student progress tracking
- Organization administration

## API Endpoints

- `GET /api/simulations` - Get all simulations (supports filtering)
- `GET /api/simulations/{sim_id}` - Get specific simulation
- `GET /api/subjects` - Get all subjects
- `GET /api/tags` - Get all tags

## Technologies

### Frontend
- React 18
- React Router
- Axios
- Lucide Icons
- CSS3

### Backend
- FastAPI
- Python 3.8+
- Uvicorn
- Pydantic

## Development

To run both frontend and backend simultaneously:

1. Open two terminal windows
2. In terminal 1: Run the backend server
3. In terminal 2: Run the frontend dev server

The frontend is configured to proxy API requests to the backend automatically.

## License

Copyright © 2026 PING - Personalized Instruction and Need-aware Gamification
