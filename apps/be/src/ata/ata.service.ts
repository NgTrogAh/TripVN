import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common'
import {
    Prisma,
    ai_trip_actions,
    ai_action_status_enum,
    ai_action_type_enum,
    timeline_item_type_enum,
    timeline_source_enum,
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

    async create(userId: string, tripId: string, dto: CreateAtaDto) {
        await this.trips.getTripDetail(userId, tripId)

        let payload: Prisma.InputJsonValue

        switch (dto.action_type) {
            case ai_action_type_enum.ADD:
                if (!dto.payload_add) {
                    throw new BadRequestException('payload_add is required')
                }
                payload = dto.payload_add as unknown as Prisma.InputJsonValue
                break

            case ai_action_type_enum.REMIND:
                if (!dto.payload_remind) {
                    throw new BadRequestException('payload_remind is required')
                }
                payload = dto.payload_remind as unknown as Prisma.InputJsonValue
                break

            case ai_action_type_enum.MODIFY:
                if (!dto.payload_modify) {
                    throw new BadRequestException('payload_modify is required')
                }
                payload = dto.payload_modify as unknown as Prisma.InputJsonValue
                break

            case ai_action_type_enum.REMOVE:
                if (!dto.payload_remove) {
                    throw new BadRequestException('payload_remove is required')
                }
                payload = dto.payload_remove as unknown as Prisma.InputJsonValue
                break

            default:
                throw new BadRequestException('Unsupported action type')
        }

        return this.prisma.ai_trip_actions.create({
            data: {
                trip_id: tripId,
                triggered_by_user_id: userId,
                action_type: dto.action_type,
                payload,
                status: 'PENDING'
            }
        })
    }

    async confirm(userId: string, actionId: string) {
        return this.prisma.$transaction(async (tx) => {
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

            const result = await this.executeAction(tx, action)

            await tx.ai_trip_actions.update({
                where: { id: actionId },
                data: {
                    status: ai_action_status_enum.APPLIED,
                    timeline_item_id: result?.id ?? null,
                },
            })

            return result ?? { success: true }
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

    private async executeAction(
        tx: Prisma.TransactionClient,
        action: ai_trip_actions,
    ) {
        switch (action.action_type) {
            case ai_action_type_enum.ADD:
                return this.handleAdd(tx, action)

            case ai_action_type_enum.REMIND:
                return this.handleRemind(tx, action)

            case ai_action_type_enum.MODIFY:
                return this.handleModify(tx, action)

            case ai_action_type_enum.REMOVE:
                return this.handleRemove(tx, action)

            case ai_action_type_enum.SUGGEST:
                throw new BadRequestException('SUGGEST cannot be confirmed')

            default:
                throw new BadRequestException('Unsupported action type')
        }
    }

    private async handleAdd(
        tx: Prisma.TransactionClient,
        action: ai_trip_actions,
    ) {
        const payload = action.payload as any

        if (!payload?.timeline_type) {
            throw new BadRequestException('timeline_type is required')
        }

        if (
            payload.start_time &&
            payload.end_time &&
            new Date(payload.start_time) > new Date(payload.end_time)
        ) {
            throw new BadRequestException('start_time must be before end_time')
        }

        return tx.trip_timeline_items.create({
            data: {
                trip_id: action.trip_id,
                type: payload.timeline_type as timeline_item_type_enum,
                source: timeline_source_enum.AI,
                title: payload.title,
                description: payload.description,
                start_time: payload.start_time
                    ? new Date(payload.start_time)
                    : undefined,
                end_time: payload.end_time
                    ? new Date(payload.end_time)
                    : undefined,
            },
        })
    }

    private async handleRemind(
        tx: Prisma.TransactionClient,
        action: ai_trip_actions,
    ) {
        const payload = action.payload as any

        if (!payload?.title || !payload?.remind_at) {
            throw new BadRequestException('title and remind_at are required')
        }

        return tx.trip_timeline_items.create({
            data: {
                trip_id: action.trip_id,
                type: timeline_item_type_enum.REMINDER,
                source: timeline_source_enum.AI,
                title: payload.title,
                start_time: new Date(payload.remind_at),
            },
        })
    }

    private async handleModify(
        tx: Prisma.TransactionClient,
        action: ai_trip_actions,
    ) {
        const payload = action.payload as any

        if (!payload?.timeline_item_id) {
            throw new BadRequestException('timeline_item_id is required')
        }

        const existing = await tx.trip_timeline_items.findFirst({
            where: {
                id: payload.timeline_item_id,
                trip_id: action.trip_id,
            },
        })

        if (!existing) {
            throw new NotFoundException('Timeline item not found')
        }

        if (
            payload.updates?.start_time &&
            payload.updates?.end_time &&
            new Date(payload.updates.start_time) >
            new Date(payload.updates.end_time)
        ) {
            throw new BadRequestException('start_time must be before end_time')
        }

        const allowedUpdates = {
            title: payload.updates?.title,
            description: payload.updates?.description,
            start_time: payload.updates?.start_time
                ? new Date(payload.updates.start_time)
                : undefined,
            end_time: payload.updates?.end_time
                ? new Date(payload.updates.end_time)
                : undefined,
        }

        return tx.trip_timeline_items.update({
            where: { id: payload.timeline_item_id },
            data: allowedUpdates,
        })
    }

    private async handleRemove(
        tx: Prisma.TransactionClient,
        action: ai_trip_actions,
    ) {
        const payload = action.payload as any

        if (!payload?.timeline_item_id) {
            throw new BadRequestException('timeline_item_id is required')
        }

        const existing = await tx.trip_timeline_items.findFirst({
            where: {
                id: payload.timeline_item_id,
                trip_id: action.trip_id,
            },
        })

        if (!existing) {
            throw new NotFoundException('Timeline item not found')
        }

        const deletedId = payload.timeline_item_id

        await tx.trip_timeline_items.delete({
            where: { id: deletedId },
        })

        return { id: deletedId }
    }
}