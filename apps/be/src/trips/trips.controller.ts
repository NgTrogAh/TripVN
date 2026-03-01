import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
    BadRequestException,
} from '@nestjs/common'
import { TripsService } from './trips.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import type { AuthUser } from '../auth/auth-user.interface'
import type { TimelineItemType } from './trips.types'

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
    constructor(private readonly trips: TripsService) {}

    @Post()
    createTrip(
        @Req() req: { user: AuthUser },
        @Body() body: {
            title?: string
            start_date?: string
            end_date?: string
        },
    ) {
        const startDate = body.start_date
            ? new Date(body.start_date)
            : undefined

        const endDate = body.end_date
            ? new Date(body.end_date)
            : undefined

        if (startDate && endDate && startDate > endDate) {
            throw new BadRequestException(
                'start_date must be before end_date',
            )
        }

        return this.trips.createTrip(req.user.id, {
            title: body.title,
            start_date: startDate,
            end_date: endDate,
        })
    }

    @Get()
    listMyTrips(@Req() req: { user: AuthUser }) {
        return this.trips.listMyTrips(req.user.id)
    }

    @Get(':id')
    getTripDetail(
        @Req() req: { user: AuthUser },
        @Param('id') id: string,
    ) {
        return this.trips.getTripDetail(req.user.id, id)
    }

    @Patch(':id')
    updateTrip(
        @Req() req: { user: AuthUser },
        @Param('id') id: string,
        @Body() body: {
            title?: string
            start_date?: string
            end_date?: string
        },
    ) {
        const startDate = body.start_date
            ? new Date(body.start_date)
            : undefined

        const endDate = body.end_date
            ? new Date(body.end_date)
            : undefined

        if (startDate && endDate && startDate > endDate) {
            throw new BadRequestException(
                'start_date must be before end_date',
            )
        }

        return this.trips.updateTrip(req.user.id, id, {
            title: body.title,
            start_date: startDate,
            end_date: endDate,
        })
    }

    @Delete(':id')
    deleteTrip(
        @Req() req: { user: AuthUser },
        @Param('id') id: string,
    ) {
        return this.trips.deleteTrip(req.user.id, id)
    }

    @Post(':id/share')
    shareTrip(
        @Req() req: { user: AuthUser },
        @Param('id') id: string,
        @Body() body: {
            shared_with_user_id: string
            permission: 'VIEW' | 'EDIT'
        },
    ) {
        return this.trips.shareTrip(req.user.id, id, body)
    }

    @Get(':id/timeline')
    getTimeline(
        @Req() req: { user: AuthUser },
        @Param('id') tripId: string,
    ) {
        return this.trips.getTimeline(req.user.id, tripId)
    }

    @Post(':id/timeline')
    addTimelineItem(
        @Req() req: { user: AuthUser },
        @Param('id') tripId: string,
        @Body() body: {
            type: TimelineItemType
            title?: string
            description?: string
            start_time?: string
            end_time?: string
        },
    ) {
        if (!body.type) {
            throw new BadRequestException('type is required')
        }

        const startTime = body.start_time
            ? new Date(body.start_time)
            : undefined

        const endTime = body.end_time
            ? new Date(body.end_time)
            : undefined

        if (startTime && endTime && startTime > endTime) {
            throw new BadRequestException(
                'start_time must be before end_time',
            )
        }

        return this.trips.addTimelineItem(req.user.id, tripId, {
            type: body.type,
            title: body.title,
            description: body.description,
            start_time: startTime,
            end_time: endTime,
        })
    }

    @Patch('timeline/:itemId')
    updateTimelineItem(
        @Req() req: { user: AuthUser },
        @Param('itemId') itemId: string,
        @Body() body: {
            title?: string
            description?: string
            start_time?: string
            end_time?: string
        },
    ) {
        const startTime = body.start_time
            ? new Date(body.start_time)
            : undefined

        const endTime = body.end_time
            ? new Date(body.end_time)
            : undefined

        if (startTime && endTime && startTime > endTime) {
            throw new BadRequestException(
                'start_time must be before end_time',
            )
        }

        return this.trips.updateTimelineItem(req.user.id, itemId, {
            title: body.title,
            description: body.description,
            start_time: startTime,
            end_time: endTime,
        })
    }

    @Delete('timeline/:itemId')
    deleteTimelineItem(
        @Req() req: { user: AuthUser },
        @Param('itemId') itemId: string,
    ) {
        return this.trips.deleteTimelineItem(req.user.id, itemId)
    }
}