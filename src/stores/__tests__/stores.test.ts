import { createRoot } from 'solid-js'
import { beforeEach, describe, expect, it } from 'vitest'
import { createAppStore } from '../app/store.ts'
import { createAuthStore } from '../auth/store.ts'
import { createI18nStore } from '../i18n/store.ts'
import { createThemeStore } from '../theme/store.ts'

describe('stores (S2)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('auth: empty token keeps idle state', () => {
    createRoot((dispose) => {
      const auth = createAuthStore()
      expect(auth.state.status).toBe('idle')
      expect(auth.state.user).toBeNull()
      expect(auth.state.token).toBeNull()
      dispose()
    })
  })

  it('auth: login sets user and persists ulw.auth', () => {
    createRoot((dispose) => {
      const auth = createAuthStore()
      auth.login({ id: '1', email: 'a@b.com', name: 'T' }, 'tok_123')
      expect(auth.state.status).toBe('authenticated')
      expect(auth.state.user?.name).toBe('T')
      expect(localStorage.getItem('ulw.auth')).toContain('tok_123')
      dispose()
    })
  })

  it('theme: illegal stored value resets to system', () => {
    localStorage.setItem('ulw.theme', JSON.stringify('neon'))
    createRoot((dispose) => {
      const theme = createThemeStore()
      expect(theme.theme()).toBe('system')
      dispose()
    })
  })

  it('theme: setTheme persists ulw.theme', () => {
    createRoot((dispose) => {
      const theme = createThemeStore()
      theme.setTheme('dark')
      expect(theme.theme()).toBe('dark')
      expect(localStorage.getItem('ulw.theme')).toContain('dark')
      dispose()
    })
  })

  it('i18n: t falls back to key, setLocale switches locale', () => {
    createRoot((dispose) => {
      const i18n = createI18nStore()
      expect(i18n.t('hello')).toBe('hello')
      i18n.setLocale('zh')
      expect(i18n.state.locale).toBe('zh')
      dispose()
    })
  })

  it('app: setError batches loading to false', () => {
    createRoot((dispose) => {
      const app = createAppStore()
      app.setLoading(true)
      app.setError('boom')
      expect(app.state.error).toBe('boom')
      expect(app.state.loading).toBe(false)
      dispose()
    })
  })
})
