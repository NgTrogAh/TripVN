from enum import Enum
from typing import Any, Dict

class ActionType(str, Enum):
    ADD = "ADD"
    MODIFY = "MODIFY"
    REMOVE = "REMOVE"
    REMIND = "REMIND"
    SUGGEST = "SUGGEST"


class TripAction:
    def __init__(self, action_type: ActionType, payload: Dict[str, Any]):
        self.type = action_type
        self.payload = payload

    @classmethod
    def from_llm(cls, data: Dict[str, Any]) -> "TripAction":
        action_type = ActionType(data.get("type"))
        payload = data.get("payload", {})
        return cls(action_type=action_type, payload=payload)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type.value,
            "payload": self.payload,
        }