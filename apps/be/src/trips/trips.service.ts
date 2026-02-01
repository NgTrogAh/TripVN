import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {
    trip_status_enum,
    timeline_item_type_enum,
    timeline_source_enum,
    trips,
    trip_shares,
} from '@prisma/client';

type TripWithShares = trips & { trip_shares: trip_shares[] };

@Injectable()
export class TripsService {
    constructor(private readonly prisma: PrismaService) {
    }

    private canViewTrip(trip: TripWithShares, userId: string) {
        if (trip.user_id === userId) return true;

        return trip.trip_shares.some(
            (s: trip_shares) => s.shared_with_user_id === userId,
        );
    }

    private canEditTrip(trip: TripWithShares, userId: string) {
        if (trip.user_id === userId) return true;

        return trip.trip_shares.some(
            (s: trip_shares) =>
                s.shared_with_user_id === userId &&
                s.permission === 'EDIT',
        );
    }

    private assertTripEditable(status: trip_status_enum) {
        if (
            status === trip_status_enum.COMPLETED ||
            status === trip_status_enum.CANCELLED
        ) {
            throw new BadRequestException('Trip is not editable');
        }
    }

    private async loadTrip(tripId: string): Promise<TripWithShares> {
        const trip = await this.prisma.trips.findUnique({
            where: {id: tripId},
            include: {trip_shares: true},
        });

        if (!trip) throw new NotFoundException('Not found');
        return trip;
    }

    async createTrip(
        userId: string,
        data: {
            title?: string;
            start_date?: Date;
            end_date?: Date;
        },
    ) {
        if (data.start_date && data.end_date && data.start_date > data.end_date) {
            throw new BadRequestException('start_date must be before end_date');
        }

        return this.prisma.trips.create({
            data: {
                user_id: userId,
                title: data.title,
                start_date: data.start_date,
                end_date: data.end_date,
                status: trip_status_enum.PLANNING,
            },
        });
    }

    async listMyTrips(userId: string) {
        return this.prisma.trips.findMany({
            where: {
                OR: [
                    {user_id: userId},
                    {
                        trip_shares: {
                            some: {shared_with_user_id: userId},
                        },
                    },
                ],
            },
            orderBy: {created_at: 'desc'},
        });
    }

    async getTripDetail(userId: string, tripId: string) {
        const trip = await this.loadTrip(tripId);

        if (!this.canViewTrip(trip, userId)) {
            throw new ForbiddenException('Forbidden');
        }

        return trip;
    }

    async updateTrip(
        userId: string,
        tripId: string,
        data: {
            title?: string;
            start_date?: Date;
            end_date?: Date;
        },
    ) {
        const trip = await this.loadTrip(tripId);

        if (!this.canEditTrip(trip, userId)) {
            throw new ForbiddenException('Forbidden');
        }

        this.assertTripEditable(trip.status);

        return this.prisma.trips.update({
            where: {id: tripId},
            data,
        });
    }

    async deleteTrip(userId: string, tripId: string) {
        const trip = await this.loadTrip(tripId);

        if (trip.user_id !== userId) {
            throw new ForbiddenException('Forbidden');
        }

        await this.prisma.$transaction([
            this.prisma.trip_shares.deleteMany({where: {trip_id: tripId}}),
            this.prisma.trip_timeline_items.deleteMany({
                where: {trip_id: tripId},
            }),
            this.prisma.trips.delete({where: {id: tripId}}),
        ]);

        return {ok: true};
    }

    async shareTrip(
        ownerId: string,
        tripId: string,
        data: {
            shared_with_user_id: string;
            permission: 'VIEW' | 'EDIT';
        },
    ) {
        const trip = await this.loadTrip(tripId);

        if (trip.user_id !== ownerId) {
            throw new ForbiddenException('Only owner can share');
        }

        return this.prisma.trip_shares.upsert({
            where: {
                trip_id_shared_with_user_id: {
                    trip_id: tripId,
                    shared_with_user_id: data.shared_with_user_id,
                },
            },
            update: {
                permission: data.permission,
            },
            create: {
                trip_id: tripId,
                shared_with_user_id: data.shared_with_user_id,
                permission: data.permission,
            },
        });
    }

    async getTimeline(userId: string, tripId: string) {
        const trip = await this.loadTrip(tripId);

        if (!this.canViewTrip(trip, userId)) {
            throw new ForbiddenException('Forbidden');
        }

        return this.prisma.trip_timeline_items.findMany({
            where: {trip_id: tripId},
            orderBy: {start_time: 'asc'},
        });
    }

    async addTimelineItem(
        userId: string,
        tripId: string,
        data: {
            type: timeline_item_type_enum;
            title?: string;
            description?: string;
            start_time?: Date;
            end_time?: Date;
        },
    ) {
        const trip = await this.loadTrip(tripId);

        if (!this.canEditTrip(trip, userId)) {
            throw new ForbiddenException('Forbidden');
        }

        this.assertTripEditable(trip.status);

        return this.prisma.trip_timeline_items.create({
            data: {
                trip_id: tripId,
                type: data.type,
                source: timeline_source_enum.MANUAL,
                title: data.title,
                description: data.description,
                start_time: data.start_time,
                end_time: data.end_time,
            },
        });
    }

    async updateTimelineItem(
        userId: string,
        itemId: string,
        data: {
            title?: string;
            description?: string;
            start_time?: Date;
            end_time?: Date;
        },
    ) {
        const item = await this.prisma.trip_timeline_items.findFirst({
            where: {id: itemId},
            include: {trips: {include: {trip_shares: true}}},
        });

        if (!item) throw new NotFoundException('Not found');

        if (!this.canEditTrip(item.trips, userId)) {
            throw new ForbiddenException('Forbidden');
        }

        this.assertTripEditable(item.trips.status);

        return this.prisma.trip_timeline_items.update({
            where: {id: itemId},
            data,
        });
    }

    async deleteTimelineItem(userId: string, itemId: string) {
        const item = await this.prisma.trip_timeline_items.findFirst({
            where: {id: itemId},
            include: {trips: {include: {trip_shares: true}}},
        });

        if (!item) throw new NotFoundException('Not found');

        if (!this.canEditTrip(item.trips, userId)) {
            throw new ForbiddenException('Forbidden');
        }

        this.assertTripEditable(item.trips.status);

        await this.prisma.trip_timeline_items.delete({
            where: {id: itemId},
        });

        return {ok: true};
    }
}