import sys
import os

# Add the parent directory (backend) to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.rooms.router import router as rooms_router
from app.assessments.router import router as assessments_router
from app.reports.router import router as reports_router
from app.analytics.router import router as analytics_router
from app.monitor.router import router as monitor_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(rooms_router)
app.include_router(assessments_router)
app.include_router(reports_router)
app.include_router(analytics_router)
app.include_router(monitor_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
