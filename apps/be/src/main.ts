import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableCors({
        origin: ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PATCH'],
    });

    await app.listen(4000);
    console.log('🚀 Backend chạy ở http://localhost:4000');
}

bootstrap();