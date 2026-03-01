import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    IsObject,
    ValidateNested,
    ValidateIf,
} from 'class-validator'
import { Type } from 'class-transformer'
import {
    ai_action_type_enum,
    timeline_item_type_enum,
} from '@prisma/client'

class AddPayloadDto {
    @IsEnum(timeline_item_type_enum)
    timeline_type: timeline_item_type_enum

    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    start_time?: string

    @IsOptional()
    @IsString()
    end_time?: string
}

class RemindPayloadDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    remind_at: string
}

class ModifyPayloadDto {
    @IsUUID()
    timeline_item_id: string

    @IsObject()
    updates: Record<string, any>
}

class RemovePayloadDto {
    @IsUUID()
    timeline_item_id: string
}

export class CreateAtaDto {
    @IsEnum(ai_action_type_enum)
    @IsNotEmpty()
    action_type: ai_action_type_enum

    @ValidateIf(o => o.action_type === ai_action_type_enum.ADD)
    @ValidateNested()
    @Type(() => AddPayloadDto)
    payload_add?: AddPayloadDto

    @ValidateIf(o => o.action_type === ai_action_type_enum.REMIND)
    @ValidateNested()
    @Type(() => RemindPayloadDto)
    payload_remind?: RemindPayloadDto

    @ValidateIf(o => o.action_type === ai_action_type_enum.MODIFY)
    @ValidateNested()
    @Type(() => ModifyPayloadDto)
    payload_modify?: ModifyPayloadDto

    @ValidateIf(o => o.action_type === ai_action_type_enum.REMOVE)
    @ValidateNested()
    @Type(() => RemovePayloadDto)
    payload_remove?: RemovePayloadDto
}