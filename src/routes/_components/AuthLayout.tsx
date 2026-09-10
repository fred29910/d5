import { createEffect } from 'solid-js'
import type { ParentProps } from 'solid-js'
import { useTheme } from '~/stores/theme/store.ts'

export function AuthLayout(props: ParentProps) {
  const theme = useTheme()

  createEffect(() => {
    const t = theme.theme()
    const dark =
      t === 'dark' ||
      (t === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  })

  return (
    <div class="min-h-svh flex flex-col bg-white text-gray-600 dark:bg-[#16171d] dark:text-gray-400">
      <main class="flex flex-1 items-center justify-center px-4 py-8">
        {props.children}
      </main>
    </div>
  )
}
