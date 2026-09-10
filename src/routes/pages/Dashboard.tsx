import { Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useAuth } from '~/stores/auth/store.ts'
import { Button } from '~/components/shared/Button.tsx'

export default function Dashboard() {
  const auth = useAuth()
  const navigate = useNavigate()

  function onLogout(): void {
    auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <section class="space-y-4">
      <h1 class="text-2xl font-medium tracking-tight text-gray-950 dark:text-gray-50">Dashboard</h1>
      <Show
        when={auth.state.user}
        fallback={<p class="text-gray-600 dark:text-gray-400">No user session (should not happen behind guard).</p>}
      >
        {(user) => (
          <p class="text-gray-600 dark:text-gray-400">
            Signed in as <span class="font-medium text-gray-950 dark:text-gray-50">{user().name}</span> ({user().email})
          </p>
        )}
      </Show>
      <Button variant="ghost" onClick={onLogout}>
        Sign out
      </Button>
    </section>
  )
}