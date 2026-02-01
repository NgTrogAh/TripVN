import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {UpdateMeDto} from './dto/update-me.dto';
import type {AuthUser} from '../auth/auth-user.interface';

@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: { user: AuthUser }) {
        return this.users.getMe(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(
        @Req() req: { user: AuthUser },
        @Body() dto: UpdateMeDto,
    ) {
        return this.users.updateMe(req.user.id, dto);
    }

    @Get(':id')
    getPublicUser(@Param('id') id: string) {
        return this.users.getPublicById(id);
    }
}