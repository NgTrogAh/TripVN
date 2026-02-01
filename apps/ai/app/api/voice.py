from fastapi import APIRouter, UploadFile, File, HTTPException

from apps.ai.app.usecases.voice_usecase import VoiceUsecase
from apps.ai.app.schemas.voice_schema import VoiceResponseSchema

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("", response_model=VoiceResponseSchema)
async def voice_endpoint(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="Audio file is required")

    usecase = VoiceUsecase()
    result = await usecase.handle(file)

    return result
