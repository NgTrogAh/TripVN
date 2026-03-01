import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import FormData from 'form-data'
import { VoiceResponseDto } from './dto/voice-response.dto'
import { ChatResponseDto} from "./dto/chat-response.dto"

type UploadedAudio = {
    buffer: Buffer
    originalname: string
    mimetype: string
}

@Injectable()
export class AiService {
    constructor(private readonly http: HttpService) {}

    async chat(message: string): Promise<ChatResponseDto> {
        try {
            const res = await firstValueFrom(
                this.http.post('http://127.0.0.1:8000/chat', {
                    text: message,
                }),
            )

            if (!res.data?.intent) {
                throw new Error('Invalid AI response')
            }

            return res.data as VoiceResponseDto
        } catch (err) {
            console.error('[AI CHAT ERROR]', err)

            throw new InternalServerErrorException({
                message: 'AI chat service failed',
                code: 'AI_CHAT_ERROR',
            })
        }
    }

    async voice(file: UploadedAudio): Promise<VoiceResponseDto> {
        try {
            const form = new FormData()
            form.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            })

            const res = await firstValueFrom(
                this.http.post('http://127.0.0.1:8000/voice', form, {
                    headers: {
                        ...form.getHeaders(),
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                    timeout: 120_000,
                }),
            )

            if (!res.data?.intent) {
                throw new Error('Invalid AI response')
            }

            return res.data as VoiceResponseDto
        } catch (err) {
            console.error('[AI VOICE ERROR]', err)

            throw new InternalServerErrorException({
                message: 'AI voice service failed',
                code: 'AI_VOICE_ERROR',
            })
        }
    }
}