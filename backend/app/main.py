from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.leads import router as leads_router

app = FastAPI(title="Lead Scoring Dashboard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads_router, prefix="/api")

@app.get("/")
async def root() -> dict:
    return {"message": "Lead Scoring API is running", "docs": "/docs"}

@app.get("/api/health")
async def health() -> dict:
    return {"ok": True}
