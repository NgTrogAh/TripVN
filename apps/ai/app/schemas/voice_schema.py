from typing import Any, Dict, Optional
from pydantic import BaseModel


class VoiceResponseSchema(BaseModel):
    transcript: str
    intent: str
    action_preview: Optional[Dict[str, Any]] = None
    message: str