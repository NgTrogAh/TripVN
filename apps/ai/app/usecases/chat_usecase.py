from apps.ai.app.infrastructure.ollama import analyze_text
from apps.ai.app.domain.intent import Intent
from apps.ai.app.domain.trip_action import TripAction, ActionType
from apps.ai.app.domain.business_rules import BusinessRules
from apps.ai.app.schemas.chat_schema import ChatResponseSchema

class ChatUsecase:
    async def handle(self, text: str) -> ChatResponseSchema:
        result = await analyze_text(text)

        intent = Intent.from_value(result.get("intent"))
        entities = result.get("entities", {})

        action = TripAction(
            action_type=self._map_intent_to_action(intent),
            payload=entities,
        )

        BusinessRules.validate(intent, action)

        return ChatResponseSchema(
            intent=intent.value,
            action_preview=action.to_dict(),
            message=text,
        )

    def _map_intent_to_action(self, intent: Intent) -> ActionType:
        if intent == Intent.ADD_TIMELINE_ITEM:
            return ActionType.ADD
        if intent == Intent.SET_REMINDER:
            return ActionType.REMIND
        if intent == Intent.MODIFY_TIMELINE_ITEM:
            return ActionType.MODIFY
        if intent == Intent.REMOVE_TIMELINE_ITEM:
            return ActionType.REMOVE

        return ActionType.SUGGEST