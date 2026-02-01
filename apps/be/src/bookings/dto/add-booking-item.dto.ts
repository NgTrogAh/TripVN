import {IsEnum, IsInt, IsOptional, IsUUID, Min} from 'class-validator';
import {booking_item_type_enum} from '@prisma/client';

export class AddBookingItemDto {
    @IsEnum(booking_item_type_enum) type: booking_item_type_enum;
    @IsOptional() @IsInt() @Min(1) quantity?: number;
    @IsOptional() unit_price?: number;
    @IsOptional() @IsUUID() experience_item_id?: string;
}