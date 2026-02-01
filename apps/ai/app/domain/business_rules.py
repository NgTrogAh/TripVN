from apps.ai.app.domain.intent import Intent
from apps.ai.app.domain.trip_action import TripAction, ActionType

class BusinessRules:
    @staticmethod
    def validate(intent: Intent, action: TripAction) -> None:
        if intent in (Intent.GENERAL_CHAT, Intent.UNKNOWN):
            return

        if intent == Intent.SET_REMINDER and action.type != ActionType.REMIND:
            raise ValueError("SET_REMINDER only allows REMIND action")

        if intent == Intent.ADD_TIMELINE_ITEM and action.type != ActionType.ADD:
            raise ValueError("ADD_TIMELINE_ITEM only allows ADD action")

        if (
                intent == Intent.QUERY_TRIP_INFO
                and action.type not in (ActionType.SUGGEST, ActionType.ADD)
        ):
            raise ValueError("QUERY_TRIP_INFO allows only SUGGEST or ADD")