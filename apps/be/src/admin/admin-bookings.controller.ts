import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {AdminAuthGuard} from './auth/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/bookings')
export class AdminBookingsController {
    constructor(private readonly prisma: PrismaService) {
    }

    @Get()
    listBookings() {
        return this.prisma.bookings.findMany({
            select: {
                id: true,
                status: true,
                created_at: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                trips: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {created_at: 'desc'},
        });
    }

    @Get(':id')
    getBookingDetail(@Param('id') id: string) {
        return this.prisma.bookings.findUnique({
            where: {id},
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                trips: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                },
                booking_items: {
                    include: {
                        experience_items: true,
                    },
                },
            },
        });
    }
}
