from fastapi import FastAPI
from src.tasks.health.router import health_router

app = FastAPI()


app.include_router(health_router, prefix="/health", tags=["health"])
