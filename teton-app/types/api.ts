export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateSessionResponse {
  sessionId: string
  url: string
}

export interface PromptPollResponse {
  ready: boolean
  prompt?: string
}

export interface GeneratePromptResponse {
  prompt: string
}
