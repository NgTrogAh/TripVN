from enum import Enum

class Intent(str, Enum):
    ADD_TIMELINE_ITEM = "add_timeline_item"
    SET_REMINDER = "set_reminder"
    QUERY_TRIP_INFO = "query_trip_info"
    GENERAL_CHAT = "general_chat"
    UNKNOWN = "unknown"

    @classmethod
    def from_value(cls, value: str) -> "Intent":
        try:
            return cls(value)
        except ValueError:
            return cls.UNKNOWN