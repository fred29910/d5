import { A } from '@solidjs/router'

export default function NotFound() {
  return (
    <section class="flex items-center justify-center py-16 text-center space-y-3">
      <h1 class="text-6xl font-semibold text-gray-950 dark:text-gray-50">404</h1>
      <p class="text-gray-600 dark:text-gray-400">Page not found.</p>
      <p>
        <A href="/" class="text-indigo-600 dark:text-indigo-400 hover:underline">
          Back home →
        </A>
      </p>
    </section>
  )
}