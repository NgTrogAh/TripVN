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
        mapping = {
            Intent.ADD_TIMELINE_ITEM: ActionType.ADD,
            Intent.MODIFY_TIMELINE_ITEM: ActionType.MODIFY,
            Intent.REMOVE_TIMELINE_ITEM: ActionType.REMOVE,
            Intent.SET_REMINDER: ActionType.REMIND,
        }

        if intent in mapping:
            return mapping[intent]

        if intent.is_query():
            return ActionType.QUERY

        return ActionType.SUGGEST