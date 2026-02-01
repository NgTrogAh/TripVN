from typing import Optional
from faster_whisper import WhisperModel
from apps.ai.app.config import WHISPER_MODEL
import tempfile

class FasterWhisperService:
    def __init__(
            self,
            model_name: str = WHISPER_MODEL,
            device: str = "cpu",
            compute_type: str = "int8",
    ):
        self.model_name = model_name
        self.device = device
        self.compute_type = compute_type
        self._model: Optional[WhisperModel] = None

    def _load_model(self) -> WhisperModel:
        if self._model is None:
            self._model = WhisperModel(
                self.model_name,
                device=self.device,
                compute_type=self.compute_type,
            )
        return self._model

    def transcribe(self, audio_bytes: bytes) -> dict:
        model = self._load_model()

        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp.flush()

            segments, info = model.transcribe(tmp.name)

        text = " ".join(segment.text.strip() for segment in segments)

        return {
            "text": text,
            "duration": info.duration,
        }
