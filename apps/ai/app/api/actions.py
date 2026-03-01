from fastapi import APIRouter, HTTPException, status

from apps.ai.app.usecases.action_usecase import ActionUsecase
from apps.ai.app.schemas.action_schema import ActionRequestSchema, ActionResponseSchema

router = APIRouter(prefix="/actions", tags=["actions"])

@router.post(
    "",
    response_model=ActionResponseSchema,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Action payload is required"
        }
    }
)
async def actions_endpoint(payload: ActionRequestSchema):
    if not payload.action:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action payload is required"
        )

    usecase = ActionUsecase()
    result = await usecase.handle(payload)

    return result