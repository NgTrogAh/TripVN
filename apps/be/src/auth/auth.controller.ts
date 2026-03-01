import {
    Controller,
    Post,
    Body,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { SendOtpDto } from '../users/dto/send-otp.dto'
import { VerifyOtpDto } from '../users/dto/verify-otp.dto'
import type { AuthUser } from './auth-user.interface'
import { Public } from './public.decorator'

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Throttle({ default: { limit: 5, ttl: 900 } })
    @Post('send-otp')
    sendOtp(@Body() dto: SendOtpDto) {
        return this.auth.sendOtp(dto.email)
    }

    @Public()
    @Post('verify-otp')
    async verifyOtp(
        @Body() dto: VerifyOtpDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.auth.verifyOtp(dto.email, dto.otp)

        res.cookie('refresh_token', result.refresh, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return {
            token: result.token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name ?? '',
            },
        }
    }

    @Public()
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refresh = req.cookies?.refresh_token

        if (!refresh) {
            throw new UnauthorizedException('Missing refresh token')
        }

        const result = await this.auth.rotateRefreshToken(refresh)

        res.cookie('refresh_token', result.refresh, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return { token: result.token }
    }

    @Post('logout')
    async logout(
        @Req() req: { user: AuthUser } & Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refresh = req.cookies?.refresh_token

        if (refresh) {
            await this.auth.revokeByRefresh(refresh)
        }

        res.clearCookie('refresh_token', { path: '/auth' })

        return { ok: true }
    }

    @Post('me')
    me(@Req() req: { user: AuthUser }) {
        return req.user
    }
}