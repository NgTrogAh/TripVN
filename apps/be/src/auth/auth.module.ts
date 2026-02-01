import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';

import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtStrategy} from './jwt.strategy';
import {PrismaModule} from '../prisma/prisma.module';
import {UsersModule} from '../users/users.module';
import {EmailModule} from '../integrations/email.module';

@Module({
    imports: [
        PrismaModule,
        UsersModule,
        EmailModule,
        PassportModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET!,
            signOptions: {
                expiresIn: process.env.JWT_EXPIRES_IN as any,
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
