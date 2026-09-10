import { createEffect } from 'solid-js'
import type { ParentProps } from 'solid-js'
import { A } from '@solidjs/router'
import { useI18n } from '~/stores/i18n/store.ts'
import { useTheme } from '~/stores/theme/store.ts'

export function Layout(props: ParentProps) {
  const theme = useTheme()
  const i18n = useI18n()

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
      <nav class="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#16171d]/80 backdrop-blur px-4 py-3">
        <A href="/" end class="font-semibold text-gray-950 dark:text-gray-50">
          {import.meta.env.VITE_APP_NAME}
        </A>
        <A href="/dashboard" class="text-sm hover:text-gray-950 dark:hover:text-white">Dashboard</A>
        <A href="/login" class="text-sm hover:text-gray-950 dark:hover:text-white">Login</A>
        <span class="flex-1" />
        <button
          type="button"
          class="bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-inherit rounded-md px-3 py-1.5 text-sm transition-colors"
          onClick={() =>
            theme.setTheme(theme.theme() === 'dark' ? 'light' : 'dark')
          }
        >
          {theme.theme() === 'dark' ? '☀' : '☾'}
        </button>
        <select
          class="rounded-md border border-gray-200 dark:border-white/10 bg-transparent text-sm px-2 py-1"
          value={i18n.state.locale}
          onChange={(e) => {
            i18n.setLocale(e.currentTarget.value)
          }}
        >
          <option value="en">en</option>
          <option value="zh">中文</option>
        </select>
      </nav>
      <main class="mx-auto w-full max-w-[1126px] flex-1 px-4 py-8">{props.children}</main>
    </div>
  )
}
