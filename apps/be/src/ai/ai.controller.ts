import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import type { Express } from 'express'

import { AiService } from './ai.service'
import { VoiceResponseDto } from './dto/voice-response.dto'

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  async chat(
      @Body() body: { message: string },
  ): Promise<VoiceResponseDto> {
    if (!body.message) {
      throw new BadRequestException('message is required')
    }

    return this.ai.chat(body.message)
  }

  @Post('voice')
  @UseInterceptors(
      FileInterceptor('file', {
        storage: memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
      }),
  )
  async voice(
      @UploadedFile() file: Express.Multer.File,
  ): Promise<VoiceResponseDto> {
    if (!file) {
      throw new BadRequestException('Audio file is required')
    }

    return this.ai.voice({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    })
  }
}