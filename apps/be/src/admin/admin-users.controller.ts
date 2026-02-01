import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {AdminAuthGuard} from './auth/admin-auth.guard';
import {user_status_enum} from '@prisma/client';

@UseGuards(AdminAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
    constructor(private readonly prisma: PrismaService) {
    }

    @Get()
    listUsers() {
        return this.prisma.users.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
                created_at: true,
            },
            orderBy: {created_at: 'desc'},
        });
    }

    @Patch(':id/status')
    async updateUserStatus(
        @Param('id') userId: string,
        @Body() body: { status: user_status_enum },
    ) {
        if (
            body.status !== user_status_enum.ACTIVE &&
            body.status !== user_status_enum.BLOCKED
        ) {
            throw new NotFoundException('Invalid status');
        }

        return this.prisma.users.update({
            where: {id: userId},
            data: {status: body.status},
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
            },
        });
    }
}
