export class VoiceResponseDto {
  transcript!: string
  intent!: string
  action_preview?: Record<string, any>
  message!: string
}
