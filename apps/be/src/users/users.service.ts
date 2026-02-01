import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {UpdateMeDto} from './dto/update-me.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {
    }

    async getMe(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: {id: userId},
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
                created_at: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        return this.prisma.users.update({
            where: {id: userId},
            data: {
                name: dto.name.trim(),
            },
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
                created_at: true,
            },
        });
    }

    async getPublicById(id: string) {
        const user = await this.prisma.users.findUnique({
            where: {id},
            select: {
                id: true,
                name: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}