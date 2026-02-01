from fastapi import APIRouter

from apps.ai.app.api.voice import router as voice_router
from apps.ai.app.api.chat import router as chat_router
from apps.ai.app.api.actions import router as actions_router

api_router = APIRouter()

api_router.include_router(voice_router)
api_router.include_router(chat_router)
api_router.include_router(actions_router)