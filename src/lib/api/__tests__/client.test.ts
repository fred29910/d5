import { describe, expect, it, vi } from 'vitest'
import { apiHealth } from '../client.ts'
import { ApiError } from '../types.ts'

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('apiHealth (S1)', () => {
  it('ok-200: resolves HealthResponse matching schema', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          { status: 'ok', version: '1.0.0', timestamp: '2026-09-10T00:00:00Z' },
          200,
        ),
      ),
    )
    try {
      const res = await apiHealth()
      expect(res.status).toBe('ok')
      expect(res.version).toBe('1.0.0')
      expect(typeof res.timestamp).toBe('string')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('404: throws ApiError carrying status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ message: 'not found' }, 404)),
    )
    try {
      await expect(apiHealth()).rejects.toBeInstanceOf(ApiError)
      await expect(apiHealth()).rejects.toMatchObject({ status: 404 })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('calls VITE_API_URL base + /health path', async () => {
    const fetchMock = vi.fn(
      async (_url: string | URL | Request): Promise<Response> =>
        jsonResponse({ status: 'ok', version: 'x', timestamp: 't' }, 200),
    )
    vi.stubGlobal('fetch', fetchMock)
    try {
      await apiHealth()
      expect(fetchMock).toHaveBeenCalledOnce()
      expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/health')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
