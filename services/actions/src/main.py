from fastapi import FastAPI
from src.tasks.health.router import health_router
from src.tasks.summarization.router import summarization_router


app = FastAPI()


app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(
    summarization_router, prefix="/summarization", tags=["summarization"]
)
