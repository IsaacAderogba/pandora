from fastapi import FastAPI
from src.tasks.health.router import health_router
from src.tasks.summarization.router import summarization_router
from src.tasks.ranking.router import ranking_router
from src.tasks.extraction.router import extraction_router


app = FastAPI()


app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(ranking_router, prefix="/ranking", tags=["ranking"])
app.include_router(
    summarization_router, prefix="/summarization", tags=["summarization"]
)
app.include_router(
    extraction_router, prefix="/extraction", tags=["extraction"]
)
