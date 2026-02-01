import {Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): { message: string } {
        return {message: 'Hello from NestJS + Prisma!'};
    }

    @Get('api/health')
    health() {
        return {status: 'OK', timestamp: new Date()};
    }
}