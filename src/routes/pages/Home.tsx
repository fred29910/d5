import { Show, Suspense, createResource } from 'solid-js'
import { A } from '@solidjs/router'
import { apiHealth } from '~/lib/api/client.ts'

export default function Home() {
  const [health] = createResource(() => apiHealth().catch(() => null))

  return (
    <section>
      <h1>{import.meta.env.VITE_APP_NAME}</h1>
      <p>SolidJS production scaffold — router, stores, api ready.</p>
      <Suspense fallback={<p>Checking API…</p>}>
        <Show
          when={health()}
          fallback={<p>API unreachable (dev without backend).</p>}
        >
          {(h) => (
            <p>
              API {h().status} · {h().version}
            </p>
          )}
        </Show>
      </Suspense>
      <p>
        <A href="/dashboard">Go to dashboard →</A>
      </p>
    </section>
  )
}
