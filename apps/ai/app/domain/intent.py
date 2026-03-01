from enum import Enum


class Intent(str, Enum):
    ADD_TIMELINE_ITEM = "ADD_TIMELINE_ITEM"
    SET_REMINDER = "SET_REMINDER"
    MODIFY_TIMELINE_ITEM = "MODIFY_TIMELINE_ITEM"
    REMOVE_TIMELINE_ITEM = "REMOVE_TIMELINE_ITEM"
    QUERY_TRIP_INFO = "QUERY_TRIP_INFO"

    @staticmethod
    def from_value(value: str) -> "Intent":
        try:
            return Intent(value)
        except ValueError:
            return Intent.QUERY_TRIP_INFO