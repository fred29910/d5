import type { JSX, ParentProps } from 'solid-js'
import { splitProps } from 'solid-js'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button(props: ParentProps<ButtonProps>) {
  const [local, others] = splitProps(props, ['children', 'variant'])

  return (
    <button type="button" class={`btn ${local.variant ?? 'primary'}`} {...others}>
      {local.children}
    </button>
  )
}
