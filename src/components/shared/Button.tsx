import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button(props: ParentProps<ButtonProps>) {
  const [local, rest] = splitProps(props, ['children', 'variant', 'class'])
  const variant = local.variant ?? 'primary'
  const base = 'inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200'
  const variantClass = variant === 'primary'
    ? 'bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-700)] active:bg-[var(--color-brand-900)] dark:bg-[var(--color-brand-500)] dark:text-[var(--bg)] dark:hover:bg-[var(--color-brand-100)]'
    : 'bg-transparent border border-[var(--border)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-neutral-50)]/5 text-inherit dark:border-[var(--border)]'
  const cls = local.class ? `${base} ${variantClass} ${local.class}` : `${base} ${variantClass}`

  return (
    <button type="button" class={cls} {...rest}>
      {local.children}
    </button>
  )
}
