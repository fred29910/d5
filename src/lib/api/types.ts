export interface HealthResponse {
  status: 'ok'
  version: string
  timestamp: string
}

export interface ApiErrorData {
  message: string
  status: number
}

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number
}
