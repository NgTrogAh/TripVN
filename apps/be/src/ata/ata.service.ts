import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common'
import {
    ai_action_status_enum,
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { TripsService } from '../trips/trips.service'
import { CreateAtaDto } from './dto/create-ata.dto'

@Injectable()
export class AtaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly trips: TripsService,
    ) {}

    async create(
        userId: string,
        tripId: string,
        dto: CreateAtaDto,
    ) {
        await this.trips.getTripDetail(userId, tripId)

        return this.prisma.ai_trip_actions.create({
            data: {
                trip_id: tripId,
                action_type: dto.action_type,
                payload: dto.payload,
                status: ai_action_status_enum.PENDING,
            },
        })
    }

    async confirm(userId: string, actionId: string) {
        return this.prisma.$transaction(async tx => {
            const action = await tx.ai_trip_actions.findUnique({
                where: { id: actionId },
            })

            if (!action) {
                throw new NotFoundException('Action not found')
            }

            if (action.status !== ai_action_status_enum.PENDING) {
                throw new BadRequestException('Already processed')
            }

            await this.trips.getTripDetail(userId, action.trip_id)

            const payload = action.payload as any

            const timelineItem = await this.trips.addTimelineItem(
                userId,
                action.trip_id,
                {
                    type: payload.type,
                    title: payload.title,
                    description: payload.description,
                    start_time: payload.start_time
                        ? new Date(payload.start_time)
                        : undefined,
                    end_time: payload.end_time
                        ? new Date(payload.end_time)
                        : undefined,
                },
            )

            await tx.ai_trip_actions.update({
                where: { id: actionId },
                data: {
                    status: ai_action_status_enum.APPLIED,
                    timeline_item_id: timelineItem.id,
                },
            })

            return timelineItem
        })
    }

    async reject(userId: string, actionId: string) {
        const action = await this.prisma.ai_trip_actions.findUnique({
            where: { id: actionId },
        })

        if (!action) {
            throw new NotFoundException('Action not found')
        }

        if (action.status !== ai_action_status_enum.PENDING) {
            throw new BadRequestException('Already processed')
        }

        await this.trips.getTripDetail(userId, action.trip_id)

        return this.prisma.ai_trip_actions.update({
            where: { id: actionId },
            data: {
                status: ai_action_status_enum.FAILED,
            },
        })
    }
}