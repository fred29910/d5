import type { ParentProps } from 'solid-js'
import {
  AppContext,
  createAppStore,
  useApp,
} from './app/store.ts'
import {
  AuthContext,
  createAuthStore,
  useAuth,
} from './auth/store.ts'
import {
  I18nContext,
  createI18nStore,
  useI18n,
} from './i18n/store.ts'
import {
  ThemeContext,
  createThemeStore,
  useTheme,
} from './theme/store.ts'

export function AppProviders(props: ParentProps) {
  const app = createAppStore()
  const auth = createAuthStore()
  const theme = createThemeStore()
  const i18n = createI18nStore()

  return (
    <AppContext.Provider value={app}>
      <AuthContext.Provider value={auth}>
        <ThemeContext.Provider value={theme}>
          <I18nContext.Provider value={i18n}>
            {props.children}
          </I18nContext.Provider>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    </AppContext.Provider>
  )
}

export { useApp, useAuth, useI18n, useTheme }
