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
    <section>
      <h1>Dashboard</h1>
      <Show
        when={auth.state.user}
        fallback={<p>No user session (should not happen behind guard).</p>}
      >
        {(user) => (
          <p>
            Signed in as {user().name} ({user().email})
          </p>
        )}
      </Show>
      <Button variant="ghost" onClick={onLogout}>
        Sign out
      </Button>
    </section>
  )
}
