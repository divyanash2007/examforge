# ExamForge 🎓

**A Production-Grade Monitoring & Assessment Platform**

ExamForge is a sophisticated educational platform designed to bridge the gap between rigorous assessment protocols and modern user experience. It features a robust exam engine with **live proctoring capabilities**, real-time student monitoring, and comprehensive performance analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_19-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791.svg)

---

## 🚀 Key Features

### 👨‍🏫 For Teachers
*   **Live Attempt Monitor**: Watch student progress in real-time (In Progress / Submitted) with dynamic remaining time tracking.
*   **Deep Analytics**: Visualize performance metrics, including item analysis (distractor efficiency) and score distributions.
*   **Classroom Management**: Secure room creation with role-based access control.
*   **Flexible Assessments**: Create timed exams with auto-submission and strict duration enforcement.

### 👨‍🎓 For Students
*   **Resilient Exam Engine**:
    *   **Auto-Save & Resume**: Protection against browser crashes or refreshes.
    *   **Server-Side Timer**: Tamper-proof countdowns synchronized with the backend.
    *   **Auto-Submit**: Enforced submission when time expires.
*   **Instant Feedback**: Detailed report cards available immediately after assessment closure.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Axios.
*   **Backend**: FastAPI (Python 3.10+), SQLModel (SQLAlchemy + Pydantic).
*   **Database**: PostgreSQL / SQLite (Development).
*   **Security**: OAuth2 with JWT Authentication.

---

## ⚡ Quick Start

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload
```
*Server runs at: `http://localhost:8000`*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*App runs at: `http://localhost:5173`*

---

## 🔒 Security & Architecture
*   **Stateless Auth**: Fully decoupled frontend and backend using JWT.
*   **Validation**: Pydantic schemas ensure strict data validation on all inputs.
*   **Read-Only Monitoring**: The live monitor is architected as a read-only observer to prevent load on the core transactional exam engine.

---

## 📄 License
MIT © 2026
