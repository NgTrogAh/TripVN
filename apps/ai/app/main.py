from fastapi import FastAPI
from apps.ai.app.api.router import api_router

app = FastAPI(title="TripVN AI Service")

app.include_router(api_router)
