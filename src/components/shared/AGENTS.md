# src/components/shared — AGENTS.md

## OVERVIEW
Single shared component (`Button.tsx`); class merging via `cn` package (`cn@0.2.6`, clsx + tailwind-merge semantics).

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change Button style/variant | `Button.tsx` `base` + `variants` record | `variant: primary\|ghost`; token-only `bg-[var(--…)]`, zero hex |
| Add shared component | Same dir, copy `Button.tsx` shape | `splitProps` + `cn(...)` + `class={...}` in JSX; no page-specific CSS |
| Override from a page | Caller `class="…"` (e.g. Dashboard `w-full justify-start`) | Caller wins via `cn` conflict resolution — do not duplicate base classes |

## CONVENTIONS
- Merge with `cn` from `'cn'`: `class={cn(base, variants[local.variant ?? 'primary'], local.class)}` — base → variant → caller order, caller wins on conflict (`justify-start` overrides `justify-center`, `px-8` overrides `px-4`).
- `base` / `variants` are module-level `as const` records; `cn` call stays inside JSX so `variant`/`class` stay reactive (Solid components run once — hoisted reads outside JSX go stale).
- `cn` accepts clsx-style args (strings, arrays, objects, `cond && 'x'`) — use them for conditionals instead of ternaries/template concat.
- Tokens via `bg-[var(--…)]` / `border-[var(--border)]` arbitrary values in TSX; never raw hex.
- Props pattern: `splitProps(props, ['children', 'variant', 'class'])`, spread `{...rest}` after `class`.

## ANTI-PATTERNS
- Do NOT concatenate classes with template strings (`` `${base} ${variant} ${local.class}` ``) — conflicts (`justify-center` + `justify-start`) coexist and resolve by CSS order luck; `cn` is the single merge path.
- Do NOT read `local.variant` / `local.class` into a `const` outside JSX — breaks reactivity when the parent updates them.
- Do NOT import `clsx` / `tailwind-merge` directly — `cn` already covers both (drop-in replacement, 30× faster per its README).
- Do NOT hardcode hex colors — use `var(--…)` tokens (see `src/styles/AGENTS.md`).
