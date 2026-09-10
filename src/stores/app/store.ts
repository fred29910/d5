import { createContext, useContext } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

export interface AppState {
  loading: boolean
  error: string | null
}

const INITIAL: AppState = { loading: false, error: null }

export function createAppStore() {
  const [state, setState] = createStore<AppState>(INITIAL)

  function setLoading(loading: boolean): void {
    setState('loading', loading)
  }

  function setError(error: string | null): void {
    setState(
      produce((draft) => {
        draft.error = error
        draft.loading = false
      }),
    )
  }

  function clearError(): void {
    setState('error', null)
  }

  return { state, setState, setLoading, setError, clearError }
}

export type AppStore = ReturnType<typeof createAppStore>

export const AppContext = createContext<AppStore>()

export function useApp(): AppStore {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProviders')
  return ctx
}
