import { ai_action_type_enum } from '@prisma/client'

export class CreateAtaDto {
    action_type: ai_action_type_enum
    payload: any
}