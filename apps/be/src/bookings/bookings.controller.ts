import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AddBookingItemDto } from './dto/add-booking-item.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AuthUser } from '../auth/auth-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    create(
        @Req() req: Request & { user: AuthUser },
        @Body() dto: CreateBookingDto,
    ) {
        return this.bookingsService.createBooking(req.user.id, dto);
    }

    @Post(':id/items')
    addItem(
        @Req() req: Request & { user: AuthUser },
        @Param('id') bookingId: string,
        @Body() dto: AddBookingItemDto,
    ) {
        return this.bookingsService.addBookingItem(
            req.user.id,
            bookingId,
            dto,
        );
    }

    @Get(':id')
    getDetail(
        @Req() req: Request & { user: AuthUser },
        @Param('id') bookingId: string,
    ) {
        return this.bookingsService.getBookingDetail(
            req.user.id,
            bookingId,
        );
    }

    @Get('/trip/:tripId')
    getByTrip(
        @Req() req: Request & { user: AuthUser },
        @Param('tripId') tripId: string,
    ) {
        return this.bookingsService.getBookingsByTrip(
            req.user.id,
            tripId,
        );
    }

    @Patch(':id/status')
    updateStatus(
        @Req() req: Request & { user: AuthUser },
        @Param('id') bookingId: string,
        @Body() dto: UpdateBookingStatusDto,
    ) {
        return this.bookingsService.updateStatus(
            req.user.id,
            bookingId,
            dto,
        );
    }
}
