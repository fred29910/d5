import { Show } from 'solid-js'
import type { ParentProps } from 'solid-js'
import { Navigate } from '@solidjs/router'
import { useAuth } from '~/stores/auth/store.ts'

export function AuthGuard(props: ParentProps) {
  const auth = useAuth()

  return (
    <Show
      when={auth.state.status === 'authenticated'}
      fallback={<Navigate href="/login" />}
    >
      {props.children}
    </Show>
  )
}
