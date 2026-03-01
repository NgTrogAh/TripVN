export interface ChatResponseDto {
    intent: string
    action_preview?: Record<string, any>
    message: string
}