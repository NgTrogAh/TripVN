import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { AdminAuthService } from './auth/admin-auth.service'
import { AdminAuthController } from './auth/admin-auth.controller'
import { AdminBookingsController } from './admin-bookings.controller'
import { AdminTripsController } from './admin-trips.controller'
import { AdminUsersController } from './admin-users.controller'
import { AdminJwtStrategy } from './auth/admin-jwt.strategy'
import { AdminAuthGuard } from './auth/admin-auth.guard'

@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [
        AdminAuthController,
        AdminBookingsController,
        AdminTripsController,
        AdminUsersController,
    ],
    providers: [
        AdminAuthService,
        AdminJwtStrategy,
        AdminAuthGuard,
    ],
})
export class AdminModule {}
