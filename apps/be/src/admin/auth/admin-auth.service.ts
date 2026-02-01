import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AdminAuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) {
    }

    async login(email: string, password: string) {
        const admin = await this.prisma.admins.findUnique({
            where: {email},
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const ok = await argon2.verify(admin.password, password);
        if (!ok) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwt.sign({
            sub: admin.id,
            type: 'ADMIN',
        });

        return {
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        };
    }
}
