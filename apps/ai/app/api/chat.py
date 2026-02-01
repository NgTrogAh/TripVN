from fastapi import APIRouter, HTTPException

from apps.ai.app.usecases.chat_usecase import ChatUsecase
from apps.ai.app.schemas.chat_schema import ChatRequestSchema, ChatResponseSchema

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponseSchema)
async def chat_endpoint(payload: ChatRequestSchema):
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text is required")

    usecase = ChatUsecase()
    result = await usecase.handle(payload.text)

    return result