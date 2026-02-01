from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ActionType(str, Enum):
    ADD = "ADD"
    MODIFY = "MODIFY"
    REMOVE = "REMOVE"
    REMIND = "REMIND"
    SUGGEST = "SUGGEST"


class ActionSchema(BaseModel):
    type: ActionType
    payload: Dict[str, Any] = Field(default_factory=dict)


class ActionRequestSchema(BaseModel):
    action: ActionSchema
    trip_id: Optional[str] = None


class ActionResponseSchema(BaseModel):
    success: bool
    result: Optional[Dict[str, Any]] = None