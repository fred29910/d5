import type { HealthResponse, RequestOptions } from './types.ts'
import { ApiError } from './types.ts'

function baseUrl(): string {
  return import.meta.env.VITE_API_URL ?? '/api'
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = 8000, ...init } = options
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort()
  }, timeoutMs)
  try {
    const res = await fetch(`${baseUrl()}${endpoint}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
    if (!res.ok) {
      const data: unknown = await res.json().catch(() => null)
      throw new ApiError(res.status, data, `API Error: ${res.status}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export function apiHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health')
}
