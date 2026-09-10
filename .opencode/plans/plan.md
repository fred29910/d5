# Plan: SolidJS+Vite+TS Production Architecture (ulw) — d5 repo

## Context
Repo: /mnt/data/dsv/dtrawd/d5 | Template: solid-js ^1.9.15 + vite + ts (bun.lock) | No router/store/api/test/env | Notepad contract /tmp/ulw-20260910-arch.md (S1 happy GET /api/health; S2 edge store persistence/reconcile; S3 regression: #/404 renders NotFound, #/dashboard unauth -> /login, build exit 0). Existing strict flags preserved: noUnusedLocals/noUnusedParameters/erasableSyntaxOnly/verbatimModuleSyntax/jsx:preserve+jsxImportSource solid-js; strict NOT explicitly on (preserve). All imports must use `import type` due to `verbatimModuleSyntax`. LOC ceiling: 250/file. TDD orientation (RED -> GREEN). No commits. Category + skills + dependency + parallel waves required.

Assumptions (from user spec): add `@solidjs/router`, `@solid-primitives/storage`, `vitest` (+ `@solidjs/testing-library` optional for component tests). Keep strict OFF. TDD: vitest for api/store; manual curl + agent-browser for S3 UI regression.

## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| W0.1 Vite+alias+env | None | Foundation |
| W0.2 tsconfig paths | W0.1 | Needs vite alias match |
| W0.3 .env/.env.example/env.d.ts | W0.1 | Needs VITE_ types |
| W1.1 api/types.ts | W0.3 | Reads env types |
| W1.2 api/client.ts | W1.1 | Uses response types |
| W1.3 api tests (RED->GREEN) | W1.2 | TDD cycle |
| W2.1 app store | W1.1, W0.3 | Consumes api types/env |
| W2.2 auth store (persist) | W2.1, W0.3 | Uses makePersisted/storage |
| W2.3 theme store (persist) | W2.2 | Shared persistence pattern |
| W2.4 i18n store | W2.3 | Uses same provider structure |
| W2.5 providers + hooks | W2.1-W2.4 | Integrates all stores |
| W2.6 store tests (S2) | W2.1-W2.5 | TDD RED->GREEN |
| W3.1 routes/index (Router+lazy) | W2.5 | Needs providers/context |
| W3.2 AuthGuard | W2.2 | Uses auth store |
| W3.3 Layout | W2.3, W2.4 | Theme/i18n |
| W3.4 NotFound / Error pages | W3.1 | Route definitions |
| W3.5 App.tsx (Router+providers) | W3.1-W3.4 | Replaces counter |
| W3.6 index.tsx providers wrap | W3.5 | Mount order |
| W4.1 styles/shared components | W3.6 | Visual layer |
| W4.2 full verification (S1+S2+S3) | W1.3, W2.6, W3.6, W4.1 | Integration QA |

Critical path: W0.1 -> W1.2 -> W2.5 -> W3.5 -> W4.2

## Parallel Execution Graph

Wave 0 (Start immediately — config/env):
- W0.1 vite.config.ts + tsconfig.app.json paths + src/env.d.ts
- W0.2 .env.example + .env (no secrets)
- W0.3 alias resolution (~/* -> src/*)
(Parallel safe; all independent)

Wave 1 (After Wave 0 — lib/api):
- W1.1 src/lib/api/types.ts
- W1.2 src/lib/api/client.ts
- W1.3 src/lib/api/__tests__/client.test.ts (RED->GREEN)
(Parallel: W1.1 + W1.2 can overlap; W1.3 after W1.2)

Wave 2 (After Wave 1 — stores/providers):
- W2.1 src/stores/app/store.ts
- W2.2 src/stores/auth/store.ts (+ persist)
- W2.3 src/stores/theme/store.ts (+ persist)
- W2.4 src/stores/i18n/store.ts
- W2.5 src/stores/providers.tsx + hooks (useApp/useAuth/useTheme/useI18n)
- W2.6 src/stores/__tests__/*.test.ts (S2 contracts)
(Parallel within wave: W2.1-2.4 independent after W1; W2.5 after W2.1-2.4; W2.6 after W2.5)

Wave 3 (After Wave 2 — routing/app):
- W3.1 src/routes/index.tsx (Router, lazy, Layout, 404/500)
- W3.2 src/routes/_components/AuthGuard.tsx
- W3.3 src/routes/pages/Dashboard.tsx (lazy import)
- W3.4 src/routes/pages/Login.tsx + NotFound.tsx
- W3.5 src/App.tsx (Router root + provider wrap)
- W3.6 src/index.tsx (provider mount)
(W3.1-3.4 parallel; W3.5 depends W3.1; W3.6 depends W3.5)

Wave 4 (After Wave 3 — styles + full verification):
- W4.1 src/styles/shared.css + src/components/shared/Button.tsx (250 LOC cap)
- W4.2 Verification: tsc -b exit 0, vite build exit 0, curl /dist/index.html exists, manual QA (S1 GET 200, S2 localStorage ulw.*, S3 #/404 / #/dashboard redirect)
(W4.1 independent after W3.6; W4.2 after all)

Estimated parallel speedup: ~45% vs sequential (Waves 0-3 have high parallelism; critical path is linear through store -> routes -> app).

## Tasks

### Task W0.1: Config / Alias / Env Types
**Where**: vite.config.ts, tsconfig.app.json, src/env.d.ts
**Why**: Foundation; `~/*` alias; `verbatimModuleSyntax` requires `import type`; env types needed before any store uses `VITE_`.
**How**: Edit vite.config.ts: add `resolve.alias { '~/*': path.resolve(__dirname, 'src/*') }`. Add `paths: { '~/*': ['./src/*'] }` to tsconfig.app.json compilerOptions. Create src/env.d.ts declaring `VITE_API_URL: string` and `NODE_ENV`. Preserve `noUnusedLocals/noUnusedParameters/erasableSyntaxOnly/verbatimModuleSyntax/jsx:preserve+jsxImportSource`. Do NOT add `strict: true`.
**Delegation**: Category `quick` (config edits). Skills: [`programming`] (type-safe TS config).
**Depends On**: None
**Acceptance Criteria (verifiable)**:
- `cat vite.config.ts` shows alias `~/*` mapped to `src/*`.
- `cat tsconfig.app.json` includes `paths` with `~/*` and retains original flags.
- `cat src/env.d.ts` exists and exports interface with `VITE_API_URL: string`.
- `npx tsc -b --noEmit` (after types added) exits 0.

### Task W0.2: Env Files
**Where**: .env.example, .env
**Why**: Provides `VITE_API_URL` contract for S1 (GET /api/health) without committing secrets.
**How**: .env.example: `VITE_API_URL=http://localhost:5173/api`. .env (ignored by .gitignore? check; if not, add `.env` to .gitignore): same value for dev. No secrets.
**Delegation**: Category `quick`.
**Depends On**: W0.3 (needs env.d.ts first to reference types, though file creation order can reverse; plan says W0.3 includes env.d.ts, so W0.2 can be parallel with W0.3 or before)
**Acceptance Criteria**:
- `.env.example` exists with `VITE_API_URL=...`
- `.env` exists and `.gitignore` excludes it (check `.gitignore` contains `.env`)
- `cat .env` shows no secrets

### Task W0.3: Env Type Integration
**Where**: src/env.d.ts (already covered in W0.1). Confirm path alias works.
**How**: Confirm `import { API_URL } from '~/lib/api/client'` resolves in build. Create `src/lib/index.ts` with dummy export to verify alias.
**Delegation**: Category `quick`.
**Depends On**: W0.1
**Acceptance Criteria**:
- `ls src/lib/` shows directory
- `cat src/lib/index.ts` exports dummy `export const ok = 1;`
- `vite build` resolves alias (no `Failed to resolve import` error)

### Task W1.1: API Types
**Where**: src/lib/api/types.ts
**Why**: Type-safe contracts for S1 (GET /api/health -> 200 + JSON schema); used by client/store/routes.
**How**: Define `type HealthResponse = { status: 'ok'; version: string; timestamp: string }`; `type ApiError = { message: string; status: number }`; export interfaces. All imports with `import type` if importing from other modules; here self-contained.
**Delegation**: Category `programming`. Skills: [`solidjs`, `programming`].
**Depends On**: W0.1, W0.2 (env types available)
**Acceptance Criteria**:
- File < 250 LOC (target: < 50)
- `import type` used where appropriate
- `npx tsc -b` passes (no `any` leaks)
- Types include at minimum `HealthResponse` and `ApiError`

### Task W1.2: API Client
**Where**: src/lib/api/client.ts
**Why**: Central fetch wrapper; TDD RED->GREEN; supports S1 happy path and S2 optimistic/reconcile patterns (though reconcile is store-level, client provides raw data).
**How**: Export `async function apiHealth(): Promise<HealthResponse>` using `fetch` to `import.meta.env.VITE_API_URL`. Add basic `ApiError` throw on non-ok. Use `import type` for type annotations in function signatures. No `any`.
**Delegation**: Category `unspecified-high` (complex logic: error handling, env integration). Skills: [`solidjs`, `programming`].
**Depends On**: W1.1
**Acceptance Criteria**:
- `cat src/lib/api/client.ts` < 250 LOC
- Uses `import.meta.env.VITE_API_URL`
- Throws `ApiError` on non-200
- `cat src/lib/api/client.ts` contains `apiHealth` function

### Task W1.3: API Client TDD Tests (S1)
**Where**: src/lib/api/__tests__/client.test.ts
**Why**: Contract S1: `vitest api-client GREEN`; RED->GREEN cycle.
**How**: Install vitest + `@solidjs/testing-library` (optional; use vitest `vi.fn()` to mock `global.fetch`). Write test: mock fetch returning `{ status: 'ok', version: '1.0.0', timestamp: '2026-09-10' }`; expect `await apiHealth()` resolves with correct shape; mock error response; expect throws. All `import type` for mock types.
**Delegation**: Category `deep` (TDD logic-heavy). Skills: [`solidjs`, `programming`, `debugging`].
**Depends On**: W1.2
**Acceptance Criteria**:
- `npx vitest run src/lib/api/__tests__/client.test.ts` exits 0 (GREEN)
- File exists with at least 3 assertions (ok-200, schema match, error throw)
- `cat src/lib/api/__tests__/client.test.ts` uses `import type` where types referenced

### Task W2.1: App Store
**Where**: src/stores/app/store.ts
**Why**: Global reactive state; uses `createStore` + `produce` (patterns.md) for multi-field updates; not persisted (scoped app-level).
**How**: `createStore<{ loading: boolean; error: string | null }>(...)`. Export `useApp()` hook that reads store from context/provider. Use `produce` in setters. < 250 LOC.
**Delegation**: Category `unspecified-high`. Skills: [`solidjs`, `programming`].
**Depends On**: W1.1 (types), W0.3 (env for initialization)
**Acceptance Criteria**:
- File < 150 LOC
- Exports `createAppStore` or `useApp`
- Contains `produce` usage
- `npx tsc -b` passes

### Task W2.2: Auth Store + Persistence
**Where**: src/stores/auth/store.ts
**Why**: S2 contract: empty token keeps idle; persistence via `@solid-primitives/storage`. Uses `makePersisted` (from `@solid-primitives/storage`).
**How**: Define `createPersisted` signal or store with `makePersisted` (check `@solid-primitives/storage` docs; typically `createStorageSignal` or `makePersisted` on a signal/store). Given the user mentions `makePersisted` and `produce/reconcile`, design: `const [auth, setAuth] = makePersisted(createSignal<AuthState>({ token: null, user: null }), { storage: localStorage, name: 'ulw.auth' })`. Update with `produce` for nested updates. < 250 LOC.
**Delegation**: Category `deep`. Skills: [`solidjs`, `programming`].
**Depends On**: W2.1 (provider structure), W0.3 (env types optional)
**Acceptance Criteria**:
- File < 200 LOC
- Uses `@solid-primitives/storage` (`makePersisted` or equivalent)
- Storage key contains `ulw.` (e.g., `ulw.auth`)
- `useAuth()` hook exported
- `localStorage.getItem('ulw.auth')` works after set (manual check)

### Task W2.3: Theme Store + Persistence
**Where**: src/stores/theme/store.ts
**Why**: S2 edge: illegal theme value falls back to `system`; persistence.
**How**: `createSignal<'light' | 'dark' | 'system'>('system')` with `makePersisted`. Add validation: if stored value not in allowed set, reset to `system`. Use `createMemo` for derived `effectiveTheme`.
**Delegation**: Category `unspecified-high`. Skills: [`solidjs`, `programming`].
**Depends On**: W2.2 (persistence pattern established)
**Acceptance Criteria**:
- File < 150 LOC
- Storage key `ulw.theme`
- Illegal value reset logic present (e.g., `if (!['light','dark','system'].includes(val)) reset()`)
- `useTheme()` exported

### Task W2.4: i18n Store
**Where**: src/stores/i18n/store.ts
**Why**: Generic multi-lang support; no persistence required by spec but can share provider.
**How**: `createStore<{ locale: string; dict: Record<string, string> }>({ locale: 'en', dict: {} })`. Export `useI18n()` hook. Use `import type` for dict types.
**Delegation**: Category `quick`. Skills: [`programming`].
**Depends On**: W2.3
**Acceptance Criteria**:
- File < 150 LOC
- `useI18n()` exported
- `t('key')` helper exported

### Task W2.5: Providers + Hooks Integration
**Where**: src/stores/providers.tsx, src/stores/hooks.ts (or index.ts)
**Why**: Combine all stores; mount order; `makePersisted` initialization; provider composition.
**How**: Create `AppProviders` component that wraps `ThemeContext.Provider`, `AuthContext.Provider`, `AppContext.Provider`, `I18nContext.Provider`. Each provider gets value from store. Hooks use `useContext`. < 250 LOC.
**Delegation**: Category `unspecified-high`. Skills: [`solidjs`, `programming`].
**Depends On**: W2.1-W2.4
**Acceptance Criteria**:
- `src/stores/providers.tsx` exports `AppProviders`
- `src/stores/index.ts` (or hooks file) exports `useApp`, `useAuth`, `useTheme`, `useI18n`
- No `any` usage; all `import type` for imports
- `npx tsc -b` passes

### Task W2.6: Store Tests (S2 Contract)
**Where**: src/stores/__tests__/*.test.ts
**Why**: S2 verification: empty token idle; theme illegal value reset; persistence restore; cross-tab `localStorage` recovery.
**How**: Test auth: empty token -> `user()` null; set token -> `user()` set; theme: set illegal value -> reset to system; persistence: set value, simulate reload via new `makePersisted` call, assert restored; use `unwrap` (from `solid-js/store`) to read raw state in assertions.
**Delegation**: Category `deep` (logic-heavy TDD). Skills: [`solidjs`, `programming`, `debugging`].
**Depends On**: W2.5
**Acceptance Criteria**:
- `npx vitest run src/stores/__tests__/` exits 0
- At least 4 test cases: auth idle/auth set; theme illegal reset; persistence restore; cross-tab recovery
- `cat src/stores/__tests__/auth.test.ts` contains `unwrap` usage

### Task W3.1: Routes + Router Setup
**Where**: src/routes/index.tsx, src/routes/_components/Layout.tsx
**Why**: Solid Router (routing.md): Router, lazy routes, Layout, 404/500, preload/cache optional.
**How**: `Router root={Layout}`; `Route path="/" component={lazy(() => import('../pages/Home'))}`; `Route path="/login" component={lazy(...)}`; `Route path="/dashboard" component={lazy(...)}`; `Route path="*404" component={lazy(() => import('../pages/NotFound'))}`. Add `Route path="/dashboard" preload={() => checkAuth()}` per routing.md. Use `import { lazy } from 'solid-js'`. Layout includes nav with `<A>` links (routing.md). < 250 LOC.
**Delegation**: Category `unspecified-high`. Skills: [`solidjs`, `programming`].
**Depends On**: W2.5 (providers context needed for AuthGuard inside routes)
**Acceptance Criteria**:
- File < 250 LOC
- Contains `lazy` imports
- Contains `Router`, `Route` from `@solidjs/router`
- Contains `Layout` component
- `npx tsc -b` passes with `@solidjs/router` types

### Task W3.2: AuthGuard Component
**Where**: src/routes/_components/AuthGuard.tsx
**Why**: Protected routes (S3): `/dashboard` unauth -> redirect `/login`.
**How**: Component using `useAuth()` from store; `Show when={isAuthenticated()} fallback={<Navigate href="/login" />}` (routing.md). Exports `AuthGuard`. < 150 LOC. `import type` for props.
**Delegation**: Category `quick`. Skills: [`solidjs`].
**Depends On**: W2.2, W3.1 (router types available)
**Acceptance Criteria**:
- File < 150 LOC
- Uses `useAuth()`
- Uses `Navigate` from `@solidjs/router`
- Contains `Show` with `fallback`

### Task W3.3: Lazy Page Components (Dashboard / Login / NotFound)
**Where**: src/routes/pages/Dashboard.tsx, Login.tsx, NotFound.tsx
**Why**: Route targets; lazy loaded; Dashboard protected; Login public.
**How**: Dashboard: uses `useApp()` (loading state); Login: basic form using `createForm` pattern (optional minimal); NotFound: simple message. Each < 200 LOC. `import type` for props/types.
**Delegation**: Category `visual-engineering` (UI structure). Skills: [`solidjs`, `frontend`].
**Depends On**: W3.1
**Acceptance Criteria**:
- Each file < 200 LOC
- Dashboard imports `useApp` or `useAuth`
- NotFound renders message matching `/404`

### Task W3.4: App.tsx + index.tsx Replacement
**Where**: src/App.tsx, src/index.tsx
**Why**: Replace single-file counter; mount providers; integrate Router.
**How**: App.tsx: `<AppProviders><Router>...</Router></AppProviders>` (no counter code). index.tsx: `render(() => <App />, document.getElementById('root')!)` (preserve mount point). < 100 LOC each.
**Delegation**: Category `quick`. Skills: [`solidjs`, `programming`].
**Depends On**: W3.1-W3.3, W2.5
**Acceptance Criteria**:
- `cat src/App.tsx` has no `createSignal` counter
- Contains `<AppProviders>` and `<Router>`
- `cat src/index.tsx` renders `<App />`
- `vite build` exits 0

### Task W4.1: Shared Styles + Components
**Where**: src/styles/shared.css, src/components/shared/Button.tsx (optional), src/components/shared/LayoutNav.tsx
**Why**: Production-level visual layer; 250 LOC cap; accessibility (patterns.md focus management, live regions optional minimal).
**How**: Shared CSS: variables for light/dark (`[data-theme="dark"]`). Button component: polymorphic `as` prop (optional minimal). All files < 250 LOC. `import type` for props.
**Delegation**: Category `visual-engineering`. Skills: [`solidjs`, `frontend`].
**Depends On**: W3.4 (UI layers need mounted app)
**Acceptance Criteria**:
- Each file < 250 LOC
- `src/components/shared/Button.tsx` exports component
- CSS uses CSS variables or `data-theme` selectors
- `npx tsc -b` passes

### Task W4.2: Full Verification (S1 + S2 + S3)
**Where**: Manual + automated verification commands
**Why**: Integration QA; regression check; not a code edit wave — verification.
**How**: 
(1) `npx tsc -b` -> exit 0 (strict flags preserved, no `any`).
(2) `npx vite build` -> exit 0; `ls dist/index.html` exists.
(3) `curl -s -o /dev/null -w "%{http_code}" file://$(pwd)/dist/index.html` -> 200.
(4) `npx vitest run` (api + store tests) -> GREEN.
(5) Manual S1: inspect `src/lib/api/client.ts` and confirm `VITE_API_URL` is used; manual curl to `http://localhost:5173/api/health` if server running; expect JSON.
(6) Manual S2: open browser devtools; set `localStorage.setItem('ulw.auth', '{"token":"t","user":{"name":"test"}}')`; reload; check `useAuth()` reads it; set illegal theme `ulw.theme='invalid'`; reload; theme resets to `system`.
(7) Manual S3: visit `/#/404` -> NotFound rendered; visit `/#/dashboard` (unauth) -> redirect to `/login`; `vite build` still exit 0.
**Delegation**: Category `deep` (integration logic). Skills: [`solidjs`, `programming`, `debugging`, `visual-qa`].
**Depends On**: W1.3, W2.6, W3.6, W4.1
**Acceptance Criteria**:
- `tsc -b` exit 0
- `vite build` exit 0
- `dist/index.html` exists
- `vitest run` GREEN (S1+S2 tests)
- S3 manual checks: `#404` shows NotFound; `#dashboard` unauth -> `/login`; counter replaced but build passes

## Commit Strategy (Atomic — not executed now, for reference)

Commit per wave/task boundary (atomic, no bundle commits):
1. `chore(config): vite alias + tsconfig paths + env.d.ts` (W0.1)
2. `chore(env): .env.example/.env` (W0.2)
3. `feat(api): types + client` (W1.1+1.2)
4. `test(api): TDD RED->GREEN for client` (W1.3)
5. `feat(stores): app/auth/theme/i18n + providers` (W2.1-2.5)
6. `test(stores): S2 persistence/reconcile/edge` (W2.6)
7. `feat(routes): Router + lazy + AuthGuard + Layout` (W3.1-3.4)
8. `feat(app): App.tsx + index.tsx provider mount` (W3.5-3.6)
9. `feat(styles): shared components + CSS` (W4.1)
10. `chore(verify): full QA logs (S1/S2/S3) + build artifacts` (W4.2 — no source change unless fix)

No commit executed (plan mode; user instructed no commits).

## Success Criteria (Final)

- All files created at exact paths listed above.
- Each file < 250 LOC (verified by `wc -l` or read inspection).
- All TypeScript imports using `import type` where appropriate (verified by `grep -r 'import type' src/lib/ src/stores/ src/routes/`).
- `verbatimModuleSyntax` preserved; `noUnusedLocals/noUnusedParameters` preserved (verified by `cat tsconfig.app.json`).
- `vite build` exit 0; `dist/index.html` exists.
- `tsc -b` exit 0 (strict flags intact).
- Vitest GREEN for `src/lib/api/__tests__/client.test.ts` and `src/stores/__tests__/*.test.ts`.
- S1 manual: `/api/health` returns JSON matching `HealthResponse` schema.
- S2 manual: `localStorage` keys `ulw.auth` and `ulw.theme` persist and recover; illegal theme resets to `system`; empty token = idle state.
- S3 manual: `/#/404` renders `NotFound`; `/#/dashboard` unauth redirects `/login`; build exit 0; original counter replaced.

## TODO List (ADD THESE) — Caller executes by wave

### Wave 0 (Config/Env — no dependencies)
- [ ] **W0.1 Config / Alias / Env Types** — `vite.config.ts` alias; `tsconfig.app.json` paths; `src/env.d.ts`; verify `npx tsc -b` exit 0 — Category: `quick` — Skills: [`programming`]
- [ ] **W0.2 Env Files** — `.env.example`, `.env`, `.gitignore` excludes `.env` — Category: `quick` — Skills: [`programming`]
- [ ] **W0.3 Alias Resolution Check** — `src/lib/index.ts` dummy export; `vite build` resolves `~/lib` — Category: `quick` — Skills: [`programming`]

### Wave 1 (API — depends Wave 0)
- [ ] **W1.1 API Types** — `src/lib/api/types.ts` (`HealthResponse`, `ApiError`) — Category: `programming` — Skills: [`solidjs`, `programming`]
- [ ] **W1.2 API Client** — `src/lib/api/client.ts` (`apiHealth`, `VITE_API_URL`, error throw) — Category: `unspecified-high` — Skills: [`solidjs`, `programming`]
- [ ] **W1.3 API TDD Test (S1)** — `src/lib/api/__tests__/client.test.ts` RED->GREEN — Category: `deep` — Skills: [`solidjs`, `programming`, `debugging`]

### Wave 2 (Stores — depends Wave 1 for types; parallel within wave)
- [ ] **W2.1 App Store** — `src/stores/app/store.ts` (`createStore` + `produce`) — Category: `unspecified-high` — Skills: [`solidjs`, `programming`]
- [ ] **W2.2 Auth Store + Persist** — `src/stores/auth/store.ts` (`makePersisted`, `ulw.auth`) — Category: `deep` — Skills: [`solidjs`, `programming`]
- [ ] **W2.3 Theme Store + Persist** — `src/stores/theme/store.ts` (`ulw.theme`, illegal reset) — Category: `unspecified-high` — Skills: [`solidjs`, `programming`]
- [ ] **W2.4 i18n Store** — `src/stores/i18n/store.ts` (`useI18n`, `t`) — Category: `quick` — Skills: [`programming`]
- [ ] **W2.5 Providers + Hooks** — `src/stores/providers.tsx`, hooks index (`useApp`, `useAuth`, `useTheme`, `useI18n`) — Category: `unspecified-high` — Skills: [`solidjs`, `programming`]
- [ ] **W2.6 Store Tests (S2)** — `src/stores/__tests__/*.test.ts` (persist/reconcile/edge) — Category: `deep` — Skills: [`solidjs`, `programming`, `debugging`]

### Wave 3 (Routing/App — depends Wave 2)
- [ ] **W3.1 Routes + Router** — `src/routes/index.tsx`, `src/routes/_components/Layout.tsx` (lazy, Router, 404) — Category: `unspecified-high` — Skills: [`solidjs`, `programming`]
- [ ] **W3.2 AuthGuard** — `src/routes/_components/AuthGuard.tsx` (`Show` + `Navigate`) — Category: `quick` — Skills: [`solidjs`]
- [ ] **W3.3 Page Components** — `src/routes/pages/Dashboard.tsx`, `Login.tsx`, `NotFound.tsx` — Category: `visual-engineering` — Skills: [`solidjs`, `frontend`]
- [ ] **W3.4 App + Index Replacement** — `src/App.tsx` (Router + providers, no counter), `src/index.tsx` mount — Category: `quick` — Skills: [`solidjs`, `programming`]

### Wave 4 (Styles + Full QA — depends Wave 3)
- [ ] **W4.1 Shared Styles/Components** — `src/styles/shared.css`, `src/components/shared/Button.tsx` — Category: `visual-engineering` — Skills: [`solidjs`, `frontend`]
- [ ] **W4.2 Full Verification (S1+S2+S3)** — `tsc -b` exit 0, `vite build` exit 0, `dist/index.html`, vitest GREEN, manual S1/S2/S3 checks — Category: `deep` — Skills: [`solidjs`, `programming`, `debugging`, `visual-qa`]

Execution instructions: Fire Wave 0 in parallel; after Wave 0 complete, fire Wave 1 (W1.1+W1.2 parallel, then W1.3); Wave 2 (W2.1-W2.4 parallel, W2.5 after, W2.6 after); Wave 3 (W3.1-W3.3 parallel, W3.4 after); Wave 4 (W4.1, then W4.2). Final QA: verify all acceptance criteria above.
