import { createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

export interface I18nState {
  locale: string
  dict: Record<string, string>
}

export function createI18nStore() {
  const [state, setState] = createStore<I18nState>({ locale: 'en', dict: {} })

  function setLocale(locale: string): void {
    setState('locale', locale)
  }

  function setDict(entries: Record<string, string>): void {
    setState('dict', (prev) => ({ ...prev, ...entries }))
  }

  function t(key: string): string {
    return state.dict[`${state.locale}.${key}`] ?? state.dict[key] ?? key
  }

  return { state, setState, setLocale, setDict, t }
}

export type I18nStore = ReturnType<typeof createI18nStore>

export const I18nContext = createContext<I18nStore>()

export function useI18n(): I18nStore {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within AppProviders')
  return ctx
}
