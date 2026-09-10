import { A } from '@solidjs/router'

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>Page not found.</p>
      <p>
        <A href="/">Back home →</A>
      </p>
    </section>
  )
}
