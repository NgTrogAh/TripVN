import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AdminAuthService} from './auth/admin-auth.service';
import {AdminAuthController} from './auth/admin-auth.controller';
import {PrismaModule} from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET!,
            signOptions: {
                expiresIn: '1d',
            },
        }),
    ],
    controllers: [AdminAuthController],
    providers: [AdminAuthService],
})
export class AdminModule {
}
