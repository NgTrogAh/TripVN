from typing import Annotated
from fastapi import APIRouter, UploadFile, File, HTTPException, status

from apps.ai.app.usecases.voice_usecase import VoiceUsecase
from apps.ai.app.schemas.voice_schema import VoiceResponseSchema

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post(
    "",
    response_model=VoiceResponseSchema,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Audio file is required"
        }
    }
)
async def voice_endpoint(
        file: Annotated[UploadFile, File(...)]
):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is required"
        )

    usecase = VoiceUsecase()
    result = await usecase.handle(file)

    return result