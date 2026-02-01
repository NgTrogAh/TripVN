import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {
    booking_item_type_enum,
    booking_status_enum,
    timeline_item_type_enum,
    timeline_source_enum,
    trip_share_permission_enum,
} from '@prisma/client';

@Injectable()
export class BookingsService {
    constructor(private readonly prisma: PrismaService) {
    }

    private canEditTrip(trip: any, userId: string): boolean {
        if (trip.user_id === userId) return true;

        return trip.trip_shares.some(
            (s: any) =>
                s.shared_with_user_id === userId &&
                s.permission === trip_share_permission_enum.EDIT,
        );
    }

    private assertTripEditable(status: string) {
        if (status === 'COMPLETED' || status === 'CANCELLED') {
            throw new BadRequestException('Trip is not editable');
        }
    }

    async createBooking(
        userId: string,
        dto: { trip_id: string },
    ) {
        const trip = await this.prisma.trips.findUnique({
            where: {id: dto.trip_id},
            include: {trip_shares: true},
        });

        if (!trip) throw new NotFoundException('Trip not found');
        if (!this.canEditTrip(trip, userId))
            throw new ForbiddenException('Forbidden');

        this.assertTripEditable(trip.status);

        return this.prisma.bookings.create({
            data: {
                trip_id: dto.trip_id,
                created_by_user_id: userId,
                status: booking_status_enum.PENDING,
            },
        });
    }

    async addBookingItem(
        userId: string,
        bookingId: string,
        dto: {
            type: any;
            quantity?: number;
            unit_price?: number;
            experience_item_id?: string;
        },
    ) {
        const booking = await this.prisma.bookings.findUnique({
            where: {id: bookingId},
            include: {
                trips: {include: {trip_shares: true}},
            },
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (!this.canEditTrip(booking.trips, userId))
            throw new ForbiddenException('Forbidden');

        this.assertTripEditable(booking.trips.status);

        if (booking.status !== booking_status_enum.PENDING) {
            throw new BadRequestException('Booking is not editable');
        }

        return this.prisma.booking_items.create({
            data: {
                booking_id: bookingId,
                type: dto.type,
                quantity: dto.quantity,
                unit_price: dto.unit_price,
                experience_item_id: dto.experience_item_id,
            },
        });
    }

    async getBookingDetail(
        userId: string,
        bookingId: string,
    ) {
        const booking = await this.prisma.bookings.findUnique({
            where: {id: bookingId},
            include: {
                booking_items: {
                    include: {experience_items: true},
                },
                trips: {
                    include: {trip_shares: true},
                },
            },
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (!this.canEditTrip(booking.trips, userId))
            throw new ForbiddenException('Forbidden');

        return booking;
    }

    async getBookingsByTrip(
        userId: string,
        tripId: string,
    ) {
        const trip = await this.prisma.trips.findUnique({
            where: {id: tripId},
            include: {trip_shares: true},
        });

        if (!trip) throw new NotFoundException('Trip not found');
        if (!this.canEditTrip(trip, userId))
            throw new ForbiddenException('Forbidden');

        return this.prisma.bookings.findMany({
            where: {trip_id: tripId},
            include: {
                booking_items: true,
            },
            orderBy: {created_at: 'desc'},
        });
    }

    async updateStatus(
        userId: string,
        bookingId: string,
        dto: { status: booking_status_enum },
    ) {
        const booking = await this.prisma.bookings.findUnique({
            where: {id: bookingId},
            include: {
                booking_items: {
                    include: {experience_items: true},
                },
                trips: {
                    include: {trip_shares: true},
                },
            },
        });

        if (!booking) throw new NotFoundException('Booking not found');
        if (!this.canEditTrip(booking.trips, userId))
            throw new ForbiddenException('Forbidden');

        this.assertTripEditable(booking.trips.status);

        if (booking.status !== booking_status_enum.PENDING) {
            throw new BadRequestException('Booking already processed');
        }

        if (
            dto.status !== booking_status_enum.CONFIRMED &&
            dto.status !== booking_status_enum.CANCELLED
        ) {
            throw new BadRequestException('Invalid status');
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedBooking = await tx.bookings.update({
                where: {id: bookingId},
                data: {status: dto.status},
            });

            if (dto.status === booking_status_enum.CONFIRMED) {
                for (const item of booking.booking_items) {
                    await tx.trip_timeline_items.create({
                        data: {
                            trip_id: booking.trip_id,
                            type:
                                item.type === booking_item_type_enum.FLIGHT
                                    ? timeline_item_type_enum.FLIGHT
                                    : item.type === booking_item_type_enum.HOTEL
                                        ? timeline_item_type_enum.HOTEL
                                        : timeline_item_type_enum.ACTIVITY,
                            source: timeline_source_enum.BOOKING,
                            title: item.experience_items?.name,
                            description: item.experience_items?.location_text,
                            experience_item_id: item.experience_item_id,
                        },
                    });
                }
            }

            return updatedBooking;
        });
    }
}
export class BookingsModule {}
