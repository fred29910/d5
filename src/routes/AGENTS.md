# src/routes — AGENTS.md

## OVERVIEW
Lazy pages + one shared layout/guard pair; routing is declared in `src/App.tsx`, this directory is organizational only.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add a page | `pages/<Name>.tsx` + register `<Route>` in `src/App.tsx` | `export default function`; file alone does NOT create a route |
| Change layout/nav | `_components/BaseLayout.tsx` | Sole layout; `showNav={false}` gives centered login variant |
| Protect a route | `_components/AuthGuard.tsx` wraps component | Checks `auth.state.status === 'authenticated'` → else `<Navigate href="/login">` |
| Public pages | `pages/Home.tsx`, `pages/NotFound.tsx` | Home calls `apiHealth()`; NotFound is `*404` route |

## CONVENTIONS
- Pages are `lazy(() => import('./routes/pages/X.tsx'))` in App.tsx with `<Suspense>` fallback — keep default exports.
- Layout composition lives in App.tsx (`MainLayout` nav-on, `LoginLayout` nav-off), not in this dir.
- Responsive: `px-4 md:px-6 lg:px-8` containers; grids `grid-cols-[repeat(auto-fit,minmax(250px,1fr))]` (Home) / `md:grid-cols-[1fr_300px]` (Dashboard).
- Reuse `card` class + `Button` component; page-specific CSS does not exist.

## ANTI-PATTERNS
- Do NOT add files here expecting auto-routing — nothing scans this directory.
- Do NOT add a second layout wrapper — extend `BaseLayout` props instead (T4 deleted Layout.tsx/AuthLayout.tsx duplicates).
- Do NOT put `createEffect` in pages for theme — `BaseLayout.tsx` owns the only theme-sync effect.
