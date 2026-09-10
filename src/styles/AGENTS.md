# src/styles — AGENTS.md

## OVERVIEW
Token-first styling: `src/index.css` owns layers/tokens/dark-mode/animations; `shared.css` owns the three canonical component classes.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| New/changed token | `src/index.css` `@theme` block | `--color-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--text/--bg/--border` |
| New/changed component style | `shared.css` `@utility` | `btn-primary` / `card` / `input` only — reference tokens via `var(--…)` |
| Dark-mode behavior | `src/index.css` bottom | Stage 1 `[data-theme='dark']` override wins; Stage 2 `prefers-color-scheme` fallback |
| Animations | `src/index.css` `@layer utilities` + `@keyframes` | `animate-fade-in` / `animate-slide-up` / `animate-fade-slide-up` (opacity + transform only) |

## CONVENTIONS
- Layer order is declared once: `@layer tokens, base, components, utilities`; `@layer components` in index.css stays an empty shell — real component styles live in `shared.css` `@utility`.
- Components consume tokens two ways: `var(--…)` in CSS, `bg-[var(--…)]` arbitrary values in TSX. Never raw hex (enforced by `__tests__/token-consumption.test.ts`).
- `shared.css` reaches the build only via `@import "./styles/shared.css"` in index.css — never import it from TSX.
- `dark:` variant here is `@custom-variant dark (&:where([data-theme=dark] …))` — keyed on `data-theme`, not `prefers-color-scheme`.
- `prefers-reduced-motion` disables all animation; `:focus-visible` outline uses `--accent`.

## ANTI-PATTERNS
- Do NOT define `.card`/`.btn`/`.input` as plain CSS in index.css — `shared.css` `@utility` is the single canonical definition (duplicate `.card` was deleted in review).
- Do NOT animate layout properties — keyframes are opacity/transform only.
- Do NOT delete old `@media (max-width:1024px)` blocks — add `md:`/`lg:` classes alongside (T5 convergence rule).
- Before changing anything visual, read `STYLE_ARCH.md` (root) — it has grep-verifiable commands per section.
