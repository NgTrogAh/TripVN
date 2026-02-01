from apps.ai.app.infrastructure.backend import BackendClient
from apps.ai.app.schemas.action_schema import (
    ActionRequestSchema,
    ActionResponseSchema,
)

class ActionUsecase:
    def __init__(self):
        self.backend = BackendClient()

    async def handle(self, payload: ActionRequestSchema) -> ActionResponseSchema:
        result = await self.backend.apply_action(
            action_type=payload.action.type,
            payload=payload.action.payload,
        )

        return ActionResponseSchema(
            success=True,
            result=result,
        )
