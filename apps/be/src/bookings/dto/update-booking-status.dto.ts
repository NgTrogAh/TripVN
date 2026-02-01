import {booking_status_enum} from '@prisma/client';

export class UpdateBookingStatusDto {
    status: booking_status_enum;
}