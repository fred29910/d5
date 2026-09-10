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
    <section class="space-y-6 px-4 md:px-6 lg:px-8">
      <h1 class="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-gray-950 dark:text-gray-50">Dashboard</h1>
      <Show
        when={auth.state.user}
        fallback={<p class="text-gray-600 dark:text-gray-400">No user session (should not happen behind guard).</p>}
      >
        {(user) => (
          <div class="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div class="card p-6 text-left">
              <h2 class="text-lg font-medium text-gray-950 dark:text-gray-50 mb-2">Profile</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Signed in as <span class="font-medium text-gray-950 dark:text-gray-50">{user().name}</span> ({user().email})
              </p>
            </div>
            <div class="card p-6 text-left">
              <h2 class="text-lg font-medium text-gray-950 dark:text-gray-50 mb-2">Actions</h2>
              <Button variant="ghost" onClick={onLogout} class="w-full justify-start text-left">
                Sign out
              </Button>
            </div>
          </div>
        )}
      </Show>
    </section>
  )
}