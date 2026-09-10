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
    <div class="shell">
      <nav class="topnav">
        <A href="/" end>
          {import.meta.env.VITE_APP_NAME}
        </A>
        <A href="/dashboard">Dashboard</A>
        <A href="/login">Login</A>
        <span class="spacer" />
        <button
          type="button"
          class="btn ghost"
          onClick={() =>
            theme.setTheme(theme.theme() === 'dark' ? 'light' : 'dark')
          }
        >
          {theme.theme() === 'dark' ? '☀' : '☾'}
        </button>
        <select
          value={i18n.state.locale}
          onChange={(e) => {
            i18n.setLocale(e.currentTarget.value)
          }}
        >
          <option value="en">en</option>
          <option value="zh">中文</option>
        </select>
      </nav>
      <main>{props.children}</main>
    </div>
  )
}
