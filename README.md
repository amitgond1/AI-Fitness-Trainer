# AI Fitness Trainer

Full-stack AI fitness application with authentication, workout tracking, analytics, leaderboard, chatbot, and real-time pose detection.

## Screenshots

### Landing Page
![Landing](https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop)

### Workout View
![Workout](https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1469&auto=format&fit=crop)

### Exercise Library
![Library](https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1470&auto=format&fit=crop)

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, Framer Motion, Recharts, MediaPipe JS
- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- AI Service: FastAPI, MediaPipe Pose, OpenCV

## Project Structure

```text
fitness/
  backend/
  frontend/
  ai-server/
```

## Prerequisites

- Node.js 20+
- Python 3.10+
- MongoDB (local or cloud)

## Setup Instructions

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-fitness
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRE=1d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
PY_AI_URL=http://localhost:8000
```

Run backend:

```bash
npm run dev
```

### 2. AI Server

```bash
cd ai-server
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open: `http://127.0.0.1:5173`

## Main Features

- Signup, login, forgot/reset password
- Profile + reminders + settings
- Workout logging and analytics
- AI workout recommendation + chatbot
- Real-time pose tracking with rep counter and posture warning
- Leaderboard and streak tracking

## API Summary

### Backend

- Auth: `POST /api/signup`, `POST /api/login`, `POST /api/forgot-password`, `POST /api/reset-password`
- User: `GET /api/profile`, `PUT /api/profile`, `PUT /api/change-password`, `DELETE /api/account`
- Workout: `POST /api/workout`, `GET /api/workouts`, `GET /api/workouts/analytics`
- AI bridge: `POST /api/recommend`, `POST /api/chatbot`
- Social: `GET /api/leaderboard`
- Health: `GET /api/health`

### AI Server

- `GET /health`
- `POST /pose`
- `POST /recommend`
- `POST /chat`

## Troubleshooting

- If signup/login fails, verify backend is running on `PORT=5000`.
- If pose counter fails, verify AI server is running on `8000`.
- If camera does not start, allow browser camera permissions and use HTTPS in production.

## License

For personal or educational use unless you add your own license.
