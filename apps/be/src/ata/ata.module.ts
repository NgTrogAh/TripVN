import { Module } from '@nestjs/common'
import { AtaController } from './ata.controller'
import { AtaService } from './ata.service'
import { PrismaService } from '../prisma/prisma.service'
import { TripsService } from '../trips/trips.service'

@Module({
    controllers: [AtaController],
    providers: [AtaService, PrismaService, TripsService],
})
export class AtaModule {}