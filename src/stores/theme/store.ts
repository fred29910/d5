import { createSignal, createContext, useContext } from 'solid-js'
import type { Signal } from 'solid-js'
import { makePersisted } from '@solid-primitives/storage'

export type Theme = 'light' | 'dark' | 'system'

const THEMES: readonly Theme[] = ['light', 'dark', 'system']

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === 'string' &&
    (THEMES as readonly string[]).includes(value)
  )
}

export function createThemeStore() {
  const [theme, setThemeRaw] = makePersisted<Theme, Signal<Theme>>(
    createSignal<Theme>('system'),
    {
      name: 'ulw.theme',
    },
  )

  if (!isTheme(theme())) {
    setThemeRaw('system')
  }

  function setTheme(next: Theme): void {
    setThemeRaw(next)
  }

  return { theme, setTheme }
}

export type ThemeStore = ReturnType<typeof createThemeStore>

export const ThemeContext = createContext<ThemeStore>()

export function useTheme(): ThemeStore {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within AppProviders')
  return ctx
}
