from apps.ai.app.domain.intent import Intent
from apps.ai.app.domain.trip_action import TripAction

class BusinessRules:
    @staticmethod
    def validate(intent: Intent, action: TripAction):
        payload = action.payload or {}

        if intent == Intent.ADD_TIMELINE_ITEM:
            if not payload.get("timeline_type"):
                raise ValueError("timeline_type is required")

        elif intent == Intent.SET_REMINDER:
            if not payload.get("title") or not payload.get("remind_at"):
                raise ValueError("title and remind_at are required")

        elif intent == Intent.MODIFY_TIMELINE_ITEM:
            if not payload.get("timeline_item_id"):
                raise ValueError("timeline_item_id is required")

        elif intent == Intent.REMOVE_TIMELINE_ITEM:
            if not payload.get("timeline_item_id"):
                raise ValueError("timeline_item_id is required")