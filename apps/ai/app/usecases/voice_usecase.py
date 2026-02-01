from apps.ai.app.infrastructure.fasterWhisper import FasterWhisperService
from apps.ai.app.usecases.chat_usecase import ChatUsecase
from apps.ai.app.schemas.voice_schema import VoiceResponseSchema

class VoiceUsecase:
    def __init__(self):
        self.stt = FasterWhisperService()
        self.chat = ChatUsecase()

    async def handle(self, file) -> VoiceResponseSchema:
        audio_bytes = await file.read()

        transcript_result = self.stt.transcribe(audio_bytes)
        transcript = transcript_result["text"]

        chat_result = await self.chat.handle(transcript)

        return VoiceResponseSchema(
            transcript=transcript,
            intent=chat_result.intent,
            action_preview=chat_result.action_preview,
            message=chat_result.message,
        )
