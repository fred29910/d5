# src/stores — AGENTS.md

## OVERVIEW
Four context stores (app/auth/i18n/theme) aggregated by `providers.tsx` into nested providers.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| New global state | `<domain>/store.ts` + wire into `providers.tsx` | Copy `app/store.ts` shape: `createXStore` + `XContext` + `useX` |
| Auth flow | `auth/store.ts` | Persisted key `ulw.auth`; `login(user, token)` / `logout()` / `setStatus()` |
| Theme toggle | `theme/store.ts` | Persisted key `ulw.theme`; `isTheme()` guard resets corrupt values to `'system'` |
| Copy/text | `i18n/store.ts` | `setLocale` / `setDict` / `t(key)` (`locale.key` → `key` → key fallback) |
| Loading/error | `app/store.ts` | `setError` also clears `loading` via `produce` |

## CONVENTIONS
- Each store file repeats the same boilerplate: `createStore` (or persisted signal) → actions → `createContext` → `useX` hook that throws outside `AppProviders`. No shared helper — copy the pattern.
- Persistence via `makePersisted` from `@solid-primitives/storage` (auth, theme only).
- Mutations use `produce((draft) => …)` from `solid-js/store`.
- Provider nesting order in `providers.tsx`: App → Auth → Theme → I18n; hooks re-exported from there.
- Tests: `__tests__/stores.test.ts` wraps usage in `createRoot((dispose) => …)`; clears localStorage in `beforeEach`.

## ANTI-PATTERNS
- Do NOT call `useX` outside `AppProviders` — it throws by design.
- Do NOT persist app/i18n stores — only auth/theme use `makePersisted` (storage keys `ulw.*` are a public contract).
- Do NOT read `theme()` for styling in components — styling keys off `document.documentElement.dataset.theme` (synced by BaseLayout effect).
