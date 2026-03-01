import {
    Controller,
    Post,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common'
import { Request } from 'express'

import { AtaService } from './ata.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateAtaDto } from './dto/create-ata.dto'
import { AuthUser } from '../auth/auth-user.interface'

@UseGuards(JwtAuthGuard)
@Controller('ata')
export class AtaController {
    constructor(private readonly ata: AtaService) {}

    @Post(':tripId')
    create(
        @Req() req: Request & { user: AuthUser },
        @Param('tripId') tripId: string,
        @Body() dto: CreateAtaDto,
    ) {
        return this.ata.create(req.user.id, tripId, dto)
    }

    @Patch(':actionId/confirm')
    confirm(
        @Req() req: Request & { user: AuthUser },
        @Param('actionId') actionId: string,
    ) {
        return this.ata.confirm(req.user.id, actionId)
    }

    @Patch(':actionId/reject')
    reject(
        @Req() req: Request & { user: AuthUser },
        @Param('actionId') actionId: string,
    ) {
        return this.ata.reject(req.user.id, actionId)
    }
}