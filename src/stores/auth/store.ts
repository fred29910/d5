import { createContext, useContext } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import type { SetStoreFunction, Store } from 'solid-js/store'
import { makePersisted } from '@solid-primitives/storage'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  status: 'idle' | 'loading' | 'authenticated'
}

const INITIAL: AuthState = { user: null, token: null, status: 'idle' }

export function createAuthStore() {
  const [state, setState] = makePersisted<
    AuthState,
    [Store<AuthState>, SetStoreFunction<AuthState>]
  >(createStore<AuthState>(INITIAL), {
    name: 'ulw.auth',
  })

  function login(user: AuthUser, token: string): void {
    setState(
      produce((draft) => {
        draft.user = user
        draft.token = token
        draft.status = 'authenticated'
      }),
    )
  }

  function logout(): void {
    setState(
      produce((draft) => {
        draft.user = null
        draft.token = null
        draft.status = 'idle'
      }),
    )
  }

  function setStatus(status: AuthState['status']): void {
    setState('status', status)
  }

  return { state, setState, login, logout, setStatus }
}

export type AuthStore = ReturnType<typeof createAuthStore>

export const AuthContext = createContext<AuthStore>()

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AppProviders')
  return ctx
}
