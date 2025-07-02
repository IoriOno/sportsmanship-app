from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, users, clubs, tests, comparisons, coaching, admin, questions, test_interface, athlete_type, export
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(clubs.router, prefix="/api/v1/clubs", tags=["clubs"])
app.include_router(tests.router, prefix="/api/v1/tests", tags=["tests"])
app.include_router(comparisons.router, prefix="/api/v1/comparisons", tags=["comparisons"])
app.include_router(coaching.router, prefix="/api/v1/coaching", tags=["coaching"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["questions"])
app.include_router(test_interface.router, prefix="/api/v1", tags=["test_interface"])
app.include_router(athlete_type.router, prefix="/api/v1/athlete-type", tags=["athlete_type"])
app.include_router(export.router, prefix="/api/v1/export", tags=["export"])


@app.get("/")
def read_root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}