from fastapi import FastAPI
from src.tasks.health.router import health_router
from src.tasks.summarization.router import summarization_router
from src.tasks.ranking.router import ranking_router
from src.tasks.extraction.router import extraction_router
from src.tasks.similarity.router import similarity_router
from src.tasks.embeddings.router import embeddings_router
from src.tasks.cache.router import cache_router


app = FastAPI()


app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(ranking_router, prefix="/ranking", tags=["ranking"])
app.include_router(
    summarization_router, prefix="/summarization", tags=["summarization"]
)
app.include_router(extraction_router, prefix="/extraction", tags=["extraction"])
app.include_router(similarity_router, prefix="/similarity", tags=["similarity"])
app.include_router(embeddings_router, prefix="/embeddings", tags=["embeddings"])
app.include_router(cache_router, prefix="/cache", tags=["cache"])
