import { createSignal } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { useAuth } from '~/stores/auth/store.ts'
import { Button } from '~/components/shared/Button.tsx'

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')

  function onSubmit(e: Event): void {
    e.preventDefault()
    auth.login(
      { id: '1', email: email(), name: email().split('@')[0] ?? 'user' },
      'dev-token',
    )
    navigate('/dashboard', { replace: true })
  }

  return (
    <section>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            value={email()}
            onInput={(e) => {
              setEmail(e.currentTarget.value)
            }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password()}
            onInput={(e) => {
              setPassword(e.currentTarget.value)
            }}
          />
        </label>
        <Button type="submit">Sign in</Button>
      </form>
    </section>
  )
}
