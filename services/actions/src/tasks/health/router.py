from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/probe")
async def probe():
    return {"message": "up and running"}
