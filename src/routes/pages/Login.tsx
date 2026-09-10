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
    <section class="flex items-center justify-center">
      <div class="mx-auto max-w-sm rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm bg-white dark:bg-white/5 space-y-4">
        <h1 class="text-2xl font-medium tracking-tight text-gray-950 dark:text-gray-50">Login</h1>
        <form onSubmit={onSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-950 dark:text-gray-50">
              Email
            </label>
            <input
              type="email"
              required
              value={email()}
              onInput={(e) => {
                setEmail(e.currentTarget.value)
              }}
              class="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-gray-950 dark:text-gray-50 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-950 dark:text-gray-50">
              Password
            </label>
            <input
              type="password"
              required
              value={password()}
              onInput={(e) => {
                setPassword(e.currentTarget.value)
              }}
              class="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-gray-950 dark:text-gray-50 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
          <Button type="submit" class="w-full">Sign in</Button>
        </form>
      </div>
    </section>
  )
}