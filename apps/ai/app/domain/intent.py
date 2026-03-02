from enum import Enum

class Intent(str, Enum):
    ADD_TIMELINE_ITEM = "add_timeline_item"
    MODIFY_TIMELINE_ITEM = "modify_timeline_item"
    REMOVE_TIMELINE_ITEM = "remove_timeline_item"
    SET_REMINDER = "set_reminder"

    QUERY_TRIP_INFO = "query_trip_info"
    QUERY_TIMELINE = "query_timeline"
    QUERY_BOOKING = "query_booking"
    QUERY_REMINDER = "query_reminder"

    GENERAL_CHAT = "general_chat"
    UNKNOWN = "unknown"

    @staticmethod
    def from_value(value: str) -> "Intent":
        if not value:
            return Intent.UNKNOWN
        try:
            return Intent(value)
        except ValueError:
            return Intent.UNKNOWN

    def is_mutate(self) -> bool:
        return self in {
            Intent.ADD_TIMELINE_ITEM,
            Intent.MODIFY_TIMELINE_ITEM,
            Intent.REMOVE_TIMELINE_ITEM,
            Intent.SET_REMINDER,
        }

    def is_query(self) -> bool:
        return self in {
            Intent.QUERY_TRIP_INFO,
            Intent.QUERY_TIMELINE,
            Intent.QUERY_BOOKING,
            Intent.QUERY_REMINDER,
        }

    def is_chat(self) -> bool:
        return self in {
            Intent.GENERAL_CHAT,
            Intent.UNKNOWN,
        }