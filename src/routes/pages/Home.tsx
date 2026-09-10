import { Show, Suspense, createResource } from 'solid-js'
import { A } from '@solidjs/router'
import { apiHealth } from '~/lib/api/client.ts'

export default function Home() {
  const [health] = createResource(() => apiHealth().catch(() => null))

  return (
    <section class="space-y-4">
      <h1 class="text-4xl sm:text-5xl font-medium tracking-tight text-gray-950 dark:text-gray-50">
        {import.meta.env.VITE_APP_NAME}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">SolidJS production scaffold — router, stores, api ready.</p>
      <Suspense fallback={<p class="text-gray-600 dark:text-gray-400">Checking API…</p>}>
        <Show
          when={health()}
          fallback={<p class="text-gray-600 dark:text-gray-400">API unreachable (dev without backend).</p>}
        >
          {(h) => (
            <p class="inline-flex items-center gap-2 rounded-md bg-gray-100 dark:bg-white/5 px-3 py-1 font-mono text-sm text-gray-600 dark:text-gray-400">
              API {h().status} · {h().version}
            </p>
          )}
        </Show>
      </Suspense>
      <p>
        <A href="/dashboard" class="text-indigo-600 dark:text-indigo-400 hover:underline">
          Go to dashboard →
        </A>
      </p>
    </section>
  )
}