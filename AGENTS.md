# PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-10
**Commit:** e1ddec4
**Branch:** main

## OVERVIEW
SolidJS + Vite + Tailwind v4 SPA scaffold: router, persisted stores, typed API client, token-first styling.

## STRUCTURE
```
./
├── src/index.tsx + App.tsx   # mount + router shell (only entry)
├── src/routes/               # pages + shared layout/guard (organizational only, NOT file-based routing)
├── src/stores/               # app/auth/i18n/theme stores + providers.tsx aggregator
├── src/lib/api/              # typed fetch wrapper (apiFetch, apiHealth, ApiError)
├── src/index.css + src/styles/shared.css  # token layers + @utility components
├── src/components/shared/    # Button.tsx (single shared component)
├── STYLE_ARCH.md / NOTEPAD.md  # style architecture + task log (read before touching CSS)
└── index.html / .env.example # Vite shell (#root) / VITE_API_URL + VITE_APP_NAME
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Change routes | `src/App.tsx` | Routes declared imperatively; adding files under `routes/` does nothing by itself |
| Add global state | `src/stores/<domain>/store.ts` + wire in `providers.tsx` | Copy an existing store file; see `src/stores/AGENTS.md` |
| Call backend | `src/lib/api/client.ts` (`apiFetch<T>`, `apiHealth`) | Base `VITE_API_URL ?? '/api'`; errors throw `ApiError` |
| Change styling/tokens | `src/index.css` (@theme) + `src/styles/shared.css` | See `src/styles/AGENTS.md`; canonical classes are `@utility` in shared.css |
| Page layout/nav | `src/routes/_components/BaseLayout.tsx` | See `src/routes/AGENTS.md` |
| Env vars | `.env.example` → `.env` | `VITE_API_URL`, `VITE_APP_NAME` typed in `src/env.d.ts` |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `App` | component | `src/App.tsx` | Router shell: ErrorBoundary → AppProviders → Router; lazy pages; AuthGuard on /dashboard |
| `AppProviders` | component | `src/stores/providers.tsx` | Nests App → Auth → Theme → I18n contexts; re-exports use* hooks |
| `createAuthStore` / `useAuth` | store/hook | `src/stores/auth/store.ts` | Persisted (`ulw.auth`) user/token/status; `login`/`logout`/`setStatus` |
| `createThemeStore` / `useTheme` | store/hook | `src/stores/theme/store.ts` | Persisted (`ulw.theme`) `light\|dark\|system` signal |
| `createI18nStore` / `useI18n` | store/hook | `src/stores/i18n/store.ts` | `locale` + `dict`, `t(key)` with `locale.key` fallback |
| `createAppStore` / `useApp` | store/hook | `src/stores/app/store.ts` | `loading`/`error`; `setError` also clears loading |
| `BaseLayout` | component | `src/routes/_components/BaseLayout.tsx` | Sole layout; only `createEffect` (theme→`data-theme` sync); `showNav` variant |
| `AuthGuard` | component | `src/routes/_components/AuthGuard.tsx` | Redirects to /login unless `status === 'authenticated'` |
| `apiFetch` / `apiHealth` | function | `src/lib/api/client.ts` | Typed fetch, 8s AbortController timeout; `ApiError` on non-ok |
| `ApiError` | class | `src/lib/api/types.ts` | `{ status, data }`; extends Error |
| `Button` | component | `src/components/shared/Button.tsx` | `variant: primary\|ghost`; `cn(base, variants[variant], local.class)` merge (caller wins); splitProps pattern; see `src/components/shared/AGENTS.md` |
| `btn-primary` / `card` / `input` | @utility | `src/styles/shared.css` | Canonical component styles; imported via `@import` in index.css |

## CONVENTIONS
- Imports use explicit `.ts`/`.tsx` extensions (`allowImportingTsExtensions`); type-only imports must use `import type` (`verbatimModuleSyntax`).
- Path alias `~/*` → `src/*` mirrored in `tsconfig.app.json` AND `vite.config.ts` — keep in sync.
- `noUnusedLocals`/`noUnusedParameters` on — no dead exports/params; `tsc -b` is the only linter (no eslint/prettier).
- Tests co-located: `__tests__/<module>.test.ts` next to source; `describe('… (S<N>)')` section tags; run `npm run test` (`vitest run`, jsdom).
- Class merging uses `cn` from `'cn'` (`cn@0.2.6`, clsx + tailwind-merge semantics): `cn(base, variants[variant], local.class)`, caller class wins on conflict; see `src/components/shared/AGENTS.md`.
- Login is mock-only: `auth.login({…}, 'dev-token')` then navigate — no real credential check.

## ANTI-PATTERNS (THIS PROJECT)
- Do NOT expect file-based routing — `src/routes/` layout is cosmetic; register every route in `src/App.tsx`.
- Do NOT import `src/styles/shared.css` directly — it is pulled in via `@import` from `src/index.css`.
- Do NOT hardcode hex colors in components — use `var(--…)` tokens (Button.tsx has zero hex; enforced by tests).
- Do NOT concatenate classes with template strings — use `cn(...)` so caller overrides win (e.g. `justify-start` over `justify-center`); see `src/components/shared/AGENTS.md`.
- Do NOT add a second `createEffect` for theme sync — `BaseLayout.tsx` owns the only one.
- Do NOT use `src/lib/index.ts` — stub (`export const ok = 1`), no importers.

## COMMANDS
```bash
npm run dev        # vite dev server (:5173)
npm run build      # tsc -b && vite build → dist/
npm run test       # vitest run (3 files, 12+ tests)
npm run typecheck  # tsc -b
```
No CI, Dockerfile, or lint script exists. Lockfile is `bun.lock` (bun or npm both work).

## NOTES
- Dark mode is two-stage: `[data-theme='dark']` manual override wins; `prefers-color-scheme` applies only when no explicit choice (`:root:not([data-theme='light'])`).
- Responsive converges on lg (1024px): keep old `@media (max-width:1024px)` blocks, add `md:`/`lg:` Tailwind classes.
- `STYLE_ARCH.md` documents the style system with grep-verifiable commands; `NOTEPAD.md` logs T4–T8 decisions — read both before CSS/layout work.
- `.agents/skills/` (tailwindcss, solidjs, advanced-layouts) + `skills-lock.json` are first-class repo content.
