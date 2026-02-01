import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '../prisma/prisma.service';
import {EmailService} from '../integrations/email.service';
import {hashToken, verifyHash} from '../common/hash';
import {SessionType, user_status_enum} from '@prisma/client';
import * as crypto from 'node:crypto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly email: EmailService,
    ) {
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOtp(email: string) {
        const existingUser = await this.prisma.users.findUnique({
            where: {email},
        });

        const user =
            existingUser ??
            (await this.prisma.users.create({
                data: {email},
            }));

        if (user.status === user_status_enum.BLOCKED) {
            throw new UnauthorizedException('User is blocked');
        }

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const otpCount = await this.prisma.user_sessions.count({
            where: {
                user_id: user.id,
                type: SessionType.OTP,
                created_at: {gte: fifteenMinutesAgo},
            },
        });

        if (otpCount >= 5) {
            throw new BadRequestException('Too many OTP requests');
        }

        const activeOtp = await this.prisma.user_sessions.findFirst({
            where: {
                user_id: user.id,
                type: SessionType.OTP,
                revoked: false,
                expires_at: {gt: new Date()},
            },
            orderBy: {created_at: 'desc'},
        });

        if (activeOtp) {
            const ttl = Math.ceil(
                (activeOtp.expires_at.getTime() - Date.now()) / 1000,
            );
            return {ok: true, ttl};
        }

        const otp = this.generateOtp();

        await this.prisma.user_sessions.create({
            data: {
                user_id: user.id,
                token: hashToken(otp),
                type: SessionType.OTP,
                expires_at: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        await this.email.sendOtp(email, otp);

        return {ok: true, ttl: 300};
    }

    async verifyOtp(email: string, otp: string) {
        const user = await this.prisma.users.findUnique({
            where: {email},
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.status === user_status_enum.BLOCKED) {
            throw new UnauthorizedException('User is blocked');
        }

        const sessions = await this.prisma.user_sessions.findMany({
            where: {
                user_id: user.id,
                type: SessionType.OTP,
                revoked: false,
                expires_at: {gt: new Date()},
            },
            orderBy: {created_at: 'desc'},
        });

        const matched = sessions.find(s => verifyHash(otp, s.token));
        if (!matched) {
            throw new BadRequestException('Invalid OTP');
        }

        await this.prisma.user_sessions.updateMany({
            where: {
                user_id: user.id,
                type: SessionType.OTP,
                revoked: false,
            },
            data: {
                revoked: true,
                used_at: new Date(),
            },
        });

        const accessToken = this.jwt.sign({sub: user.id});

        const refreshPlain = crypto.randomUUID();

        await this.prisma.user_sessions.create({
            data: {
                user_id: user.id,
                token: hashToken(refreshPlain),
                type: SessionType.REFRESH,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return {
            token: accessToken,
            refresh: refreshPlain,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                status: user.status,
            },
        };
    }

    async rotateRefreshToken(oldRefresh: string) {
        const hashed = hashToken(oldRefresh);

        const session = await this.prisma.user_sessions.findFirst({
            where: {
                token: hashed,
                type: SessionType.REFRESH,
            },
            include: {
                users: true,
            },
        });

        if (
            !session ||
            session.expires_at < new Date() ||
            session.users.status === user_status_enum.BLOCKED
        ) {
            throw new UnauthorizedException();
        }

        if (session.revoked) {
            await this.prisma.user_sessions.updateMany({
                where: {
                    user_id: session.user_id,
                    type: SessionType.REFRESH,
                },
                data: {revoked: true},
            });
            throw new UnauthorizedException();
        }

        await this.prisma.user_sessions.update({
            where: {id: session.id},
            data: {
                revoked: true,
                used_at: new Date(),
            },
        });

        const newRefresh = crypto.randomUUID();

        await this.prisma.user_sessions.create({
            data: {
                user_id: session.user_id,
                token: hashToken(newRefresh),
                type: SessionType.REFRESH,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return {
            token: this.jwt.sign({sub: session.user_id}),
            refresh: newRefresh,
        };
    }

    async revokeByRefresh(refresh: string) {
        await this.prisma.user_sessions.updateMany({
            where: {
                token: hashToken(refresh),
                type: SessionType.REFRESH,
                revoked: false,
            },
            data: {
                revoked: true,
                used_at: new Date(),
            },
        });
    }
}
