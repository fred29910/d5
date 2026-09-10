import { Show, Suspense, createResource } from 'solid-js'
import { A } from '@solidjs/router'
import { apiHealth } from '~/lib/api/client.ts'

export default function Home() {
  const [health] = createResource(() => apiHealth().catch(() => null))

  return (
    <section class="space-y-6 px-4 md:px-6 lg:px-8">
      <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-gray-950 dark:text-gray-50 animate-fade-in">
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
        <A href="/dashboard" class="btn-primary inline-flex items-center px-4 py-2 text-sm no-underline">
          Go to dashboard →
        </A>
      </p>

      {/* T5: responsive auto-fit grid cards */}
      <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mt-8 animate-slide-up">
        <article class="card p-6 text-left">
          <h2 class="text-xl font-medium text-gray-950 dark:text-gray-50 mb-2">Router</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">File-based routing with lazy loading and nested layouts.</p>
        </article>
        <article class="card p-6 text-left">
          <h2 class="text-xl font-medium text-gray-950 dark:text-gray-50 mb-2">Stores</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Reactive state management with fine-grained updates.</p>
        </article>
        <article class="card p-6 text-left">
          <h2 class="text-xl font-medium text-gray-950 dark:text-gray-50 mb-2">API</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">Typed client with health checks and error handling.</p>
        </article>
      </div>
    </section>
  )
}