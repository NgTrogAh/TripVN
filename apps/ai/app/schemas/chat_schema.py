from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ChatRequestSchema(BaseModel):
    text: str = Field(..., min_length=1)


class ChatResponseSchema(BaseModel):
    intent: str
    action_preview: Optional[Dict[str, Any]] = None
    message: str