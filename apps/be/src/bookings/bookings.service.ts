import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
    booking_item_type_enum,
    booking_status_enum,
    timeline_item_type_enum,
    timeline_source_enum,
    trip_share_permission_enum,
    trip_status_enum,
    trips,
    trip_shares,
} from '@prisma/client'

type TripWithShares = trips & { trip_shares: trip_shares[] }

@Injectable()
export class BookingsService {
    constructor(private readonly prisma: PrismaService) {}

    private canEditTrip(trip: TripWithShares, userId: string): boolean {
        if (trip.user_id === userId) return true

        return trip.trip_shares.some(
            s =>
                s.shared_with_user_id === userId &&
                s.permission === trip_share_permission_enum.EDIT,
        )
    }

    private assertTripEditable(status: trip_status_enum) {
        if (
            status === trip_status_enum.COMPLETED ||
            status === trip_status_enum.CANCELLED
        ) {
            throw new BadRequestException('Trip is not editable')
        }
    }

    async createBooking(userId: string, dto: { trip_id: string }) {
        const trip = await this.prisma.trips.findUnique({
            where: { id: dto.trip_id },
            include: { trip_shares: true },
        })

        if (!trip) throw new NotFoundException('Trip not found')
        if (!this.canEditTrip(trip, userId))
            throw new ForbiddenException('Forbidden')

        this.assertTripEditable(trip.status)

        return this.prisma.bookings.create({
            data: {
                trip_id: dto.trip_id,
                created_by_user_id: userId,
                status: booking_status_enum.PENDING,
            },
        })
    }

    async addBookingItem(
        userId: string,
        bookingId: string,
        dto: {
            type: booking_item_type_enum
            quantity?: number
            unit_price?: number
            experience_item_id?: string
        },
    ) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                trips: { include: { trip_shares: true } },
            },
        })

        if (!booking) throw new NotFoundException('Booking not found')
        if (!this.canEditTrip(booking.trips, userId))
            throw new ForbiddenException('Forbidden')

        this.assertTripEditable(booking.trips.status)

        if (booking.status !== booking_status_enum.PENDING) {
            throw new BadRequestException('Booking is not editable')
        }

        if (dto.experience_item_id) {
            const experience = await this.prisma.experience_items.findUnique({
                where: { id: dto.experience_item_id },
            })

            if (!experience) {
                throw new NotFoundException(
                    'Experience item not found',
                )
            }
        }

        return this.prisma.booking_items.create({
            data: {
                booking_id: bookingId,
                type: dto.type,
                quantity: dto.quantity,
                unit_price: dto.unit_price,
                experience_item_id: dto.experience_item_id,
            },
        })
    }

    async getBookingDetail(userId: string, bookingId: string) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                booking_items: {
                    include: { experience_items: true },
                },
                trips: {
                    include: { trip_shares: true },
                },
            },
        })

        if (!booking) throw new NotFoundException('Booking not found')
        if (!this.canEditTrip(booking.trips, userId))
            throw new ForbiddenException('Forbidden')

        return booking
    }

    async getBookingsByTrip(userId: string, tripId: string) {
        const trip = await this.prisma.trips.findUnique({
            where: { id: tripId },
            include: { trip_shares: true },
        })

        if (!trip) throw new NotFoundException('Trip not found')
        if (!this.canEditTrip(trip, userId))
            throw new ForbiddenException('Forbidden')

        return this.prisma.bookings.findMany({
            where: { trip_id: tripId },
            include: { booking_items: true },
            orderBy: { created_at: 'desc' },
        })
    }

    async updateStatus(
        userId: string,
        bookingId: string,
        dto: { status: booking_status_enum },
    ) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                booking_items: {
                    include: { experience_items: true },
                },
                trips: {
                    include: { trip_shares: true },
                },
            },
        })

        if (!booking) throw new NotFoundException('Booking not found')
        if (!this.canEditTrip(booking.trips, userId))
            throw new ForbiddenException('Forbidden')

        this.assertTripEditable(booking.trips.status)

        if (booking.status !== booking_status_enum.PENDING) {
            throw new BadRequestException(
                'Booking already processed',
            )
        }

        if (
            dto.status !== booking_status_enum.CONFIRMED &&
            dto.status !== booking_status_enum.CANCELLED
        ) {
            throw new BadRequestException('Invalid status')
        }

        if (
            dto.status === booking_status_enum.CONFIRMED &&
            booking.booking_items.length === 0
        ) {
            throw new BadRequestException(
                'Cannot confirm empty booking',
            )
        }

        return this.prisma.$transaction(async tx => {
            const updatedBooking = await tx.bookings.update({
                where: { id: bookingId },
                data: { status: dto.status },
            })

            if (dto.status === booking_status_enum.CONFIRMED) {
                for (const item of booking.booking_items) {
                    let timelineType: timeline_item_type_enum

                    if (item.type === booking_item_type_enum.FLIGHT) {
                        timelineType = timeline_item_type_enum.FLIGHT
                    } else if (item.type === booking_item_type_enum.HOTEL) {
                        timelineType = timeline_item_type_enum.HOTEL
                    } else {
                        timelineType = timeline_item_type_enum.ACTIVITY
                    }

                    await tx.trip_timeline_items.create({
                        data: {
                            trip_id: booking.trip_id,
                            type: timelineType,
                            source: timeline_source_enum.BOOKING,
                            title:
                                item.experience_items?.name ?? '',
                            description:
                                item.experience_items
                                    ?.location_text ?? '',
                            experience_item_id:
                            item.experience_item_id,
                        },
                    })
                }
            }

            return updatedBooking
        })
    }
}