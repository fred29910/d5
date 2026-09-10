import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button(props: ParentProps<ButtonProps>) {
  const [local, rest] = splitProps(props, ['children', 'variant', 'class'])
  const variant = local.variant ?? 'primary'
  const base =
    variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-400 dark:text-gray-950 dark:hover:bg-indigo-300 disabled:opacity-50 disabled:pointer-events-none transition-colors'
      : 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-inherit disabled:opacity-50 disabled:pointer-events-none transition-colors'
  const cls = local.class ? `${base} ${local.class}` : base

  return (
    <button type="button" class={cls} {...rest}>
      {local.children}
    </button>
  )
}
