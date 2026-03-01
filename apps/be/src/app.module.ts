import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import type { StringValue } from 'ms'

import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { TripsModule } from './trips/trips.module'
import { BookingsModule } from './bookings/bookings.module'
import { AdminModule } from './admin/admin.module'
import { AiModule } from './ai/ai.module'
import { AtaModule } from './ata/ata.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')
        if (!secret) throw new Error('JWT_SECRET is not defined')

        return {
          secret,
          signOptions: {
            expiresIn: (config.get('JWT_EXPIRES_IN') ?? '15m') as StringValue,
          },
        }
      },
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        { ttl: 60, limit: 20 },
      ],
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    TripsModule,
    BookingsModule,
    AdminModule,
    AiModule,
    AtaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}