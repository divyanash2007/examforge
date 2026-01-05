# ExamForge - Gamified Classroom & Assessment Platform

A comprehensive platform for managing classrooms, conducting timed assessments, and analyzing student performance in real-time.

## Features

-   **Role-Based Access**: Distinct portals for Teachers and Students.
-   **Classroom Management**: Create rooms, generate join codes, and manage members.
-   **Assessment Engine**:
    -   Create timed exams with various question types.
    -   **Auto-Submit**: Exams automatically submit when time expires.
    -   **Resume Capability**: Students can refresh or rejoin without losing time or progress.
-   **Real-Time Monitoring**: Teachers can watch student statuses live (In Progress / Submitted) with remaining time tracking.
-   **Analytics Dashboard**: Detailed breakdown of class performance, question-level analysis, and score distributions.

## Tech Stack

### Backend
-   **Framework**: FastAPI (Python)
-   **Database**: PostgreSQL / SQLite (via SQLModel)
-   **Authentication**: JWT (OAuth2)
-   **Tools**: Alembic (Migrations), Pydantic

### Frontend
-   **Framework**: React 19 (Vite)
-   **Styling**: Tailwind CSS v4
-   **Icons**: Lucide React
-   **HTTP Client**: Axios

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   PostgreSQL (optional, defaults to SQLite if configured)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/divyanash2007/examforge.git
    cd examforge
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    # source venv/bin/activate
    
    pip install -r requirements.txt
    
    # Run Migrations
    alembic upgrade head
    
    # Start Server
    uvicorn app.main:app --reload
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Project Structure

-   `/backend`: FastAPI application, models, and business logic.
    -   `/app/assessments`: Exam engine logic.
    -   `/app/analytics`: Performance aggregation.
    -   `/app/monitor`: Real-time monitoring.
-   `/frontend`: React SPA.

## License

MIT
