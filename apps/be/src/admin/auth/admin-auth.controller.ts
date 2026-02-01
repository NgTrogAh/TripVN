import {Controller, Post, Body} from '@nestjs/common';
import {AdminAuthService} from './admin-auth.service';

@Controller('admin/auth')
export class AdminAuthController {
    constructor(private readonly auth: AdminAuthService) {
    }

    @Post('login')
    login(
        @Body() body: { email: string; password: string },
    ) {
        return this.auth.login(body.email, body.password);
    }
}
