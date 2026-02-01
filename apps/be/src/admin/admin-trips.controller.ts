import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {AdminAuthGuard} from './auth/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/trips')
export class AdminTripsController {
    constructor(private readonly prisma: PrismaService) {
    }

    @Get()
    listTrips() {
        return this.prisma.trips.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                created_at: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
            orderBy: {created_at: 'desc'},
        });
    }

    @Get(':id')
    getTripDetail(@Param('id') id: string) {
        return this.prisma.trips.findUnique({
            where: {id},
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                trip_shares: {
                    select: {
                        shared_with_user_id: true,
                        permission: true,
                    },
                },
                trip_timeline_items: {
                    orderBy: {start_time: 'asc'},
                },
                bookings: {
                    select: {
                        id: true,
                        status: true,
                        created_at: true,
                    },
                },
            },
        });
    }
}
