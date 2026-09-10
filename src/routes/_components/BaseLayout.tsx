import { createEffect } from 'solid-js'
import type { ParentProps } from 'solid-js'
import { A } from '@solidjs/router'
import { useI18n } from '~/stores/i18n/store.ts'
import { useTheme } from '~/stores/theme/store.ts'

export interface BaseLayoutProps extends ParentProps {
  showNav?: boolean
}

export function BaseLayout(props: BaseLayoutProps) {
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

  const mainCls =
    props.showNav === false
      ? 'mx-auto flex w-full max-w-[1126px] flex-1 flex-col items-center justify-center px-4 py-8'
      : 'mx-auto w-full max-w-[1126px] flex-1 px-4 py-8'

  return (
    <div class="min-h-svh flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {props.showNav !== false && (
        <nav class="sticky top-0 z-10 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur px-4 py-3">
          <A href="/" end class="font-semibold text-[var(--text-h)]">
            {import.meta.env.VITE_APP_NAME}
          </A>
          <A href="/dashboard" class="text-sm hover:text-[var(--text-h)]">Dashboard</A>
          <A href="/login" class="text-sm hover:text-[var(--text-h)]">Login</A>
          <span class="flex-1" />
          <button
            type="button"
            class="bg-transparent border border-[var(--border)] hover:bg-[var(--border)] text-inherit rounded-md px-3 py-1.5 text-sm transition-colors"
            onClick={() =>
              theme.setTheme(theme.theme() === 'dark' ? 'light' : 'dark')
            }
          >
            {theme.theme() === 'dark' ? '☀' : '☾'}
          </button>
          <select
            class="rounded-md border border-[var(--border)] bg-transparent text-sm px-2 py-1"
            value={i18n.state.locale}
            onChange={(e) => {
              i18n.setLocale(e.currentTarget.value)
            }}
          >
            <option value="en">en</option>
            <option value="zh">中文</option>
          </select>
        </nav>
      )}
      <main class={mainCls}>{props.children}</main>
    </div>
  )
}
