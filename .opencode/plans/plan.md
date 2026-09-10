# Plan: SolidJS + Tailwind v4.3.3 — B+C Style Architecture Optimization

Project: `/mnt/data/dsv/dtrawd/d5` (SolidJS 1.9.15, Tailwind v4.3.3, Vite 8.2.2)
Plan Mode: READ-ONLY (zero edits). TDD-oriented: verify-first, change-second, verify-after.
Plan written in English (user requirement met).

---

## Context & Current State (Verified by Direct File Read + Background Agent)

- `src/index.css`: single entry, 127 lines. `@theme` defines 13 vars (`--text`, `--text-h`, `--bg`, `--border`, `--code-bg`, `--accent`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`, `--sans`, `--heading`, `--mono`). Only `--accent`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow` are **unused** (5 dead tokens). Components (`Button.tsx`, pages) use hardcoded `text-gray-600`, `bg-indigo-600`, `dark:bg-[#16171d]` — token loop broken.
- `src/styles/shared.css`: empty (1 newline).
- `Layout.tsx` (52 lines) and `AuthLayout.tsx` (24 lines): 100% duplicated theme-sync `createEffect` (identical `t === 'dark' || (t === 'system' && ...)` block, lines 11-18 vs 8-15). Both use `min-h-svh flex flex-col bg-white text-gray-600 dark:bg-[#16171d] dark:text-gray-400`.
- Zero `grid` usage (grep returned 0). 100% flexbox (`flex flex-col`, `inline-flex`, `items-center justify-center`).
- Responsive: only `max-width: 1024px` media query (CSS) and `sm:text-5xl` (Tailwind) in `Home.tsx`. No `md:`, `lg:`, `xl:`.
- Dark mechanism: `data-theme` set by duplicated `createEffect`, consumed by `@custom-variant dark`. Stage 1 (`data-theme`) exists; stage 2 (`prefers-color-scheme`) is missing.
- No `@keyframes`, only one `transition-colors` on theme button. No motion architecture.

---

## Uncertainties / Assumptions (Clarified with User)

1. **B+C grading**: B = token loop (`tokens闭环`) + `@layer分层` + dark two-stage; C = layout/component unification + grid + responsive + motion (`动效`). Confirmed by user's explicit requirement list.
2. **Animation scope**: Pure CSS `@keyframes` + `transition-*` utilities (Tailwind v4 native). No external motion library. Confirmed by absence of motion packages in `package.json`.
3. **Token loop mechanism**: `@theme` variables declared and consumed via `var(--token)` in components / `shared.css` / `index.css`. Confirmed by current `var(--text)` usage in `index.css:27`.
4. **Grid scope**: At least 2 files with `grid` class, grid-template-areas optional. Confirmed by user's "100% Flex → Grid" requirement.
5. **Animation scope finalized**: Pure CSS `@keyframes` (`fade-in`, `slide-up`) + `transition-*` utilities (`transition-colors duration-200`). No `motion-one`, no JS motion library. Confirmed by user.
6. **Grid scope finalized**: Grid adopted in `Layout` (holy-grail-style `grid-rows-[auto_1fr_auto]`) + at least 2 pages (`Home` auto-fit cards, `Dashboard` grid layout). No full masonry, no subgrid. Confirmed by user.
7. **TDD orientation**: Tests run before and after each wave (`npm run test`, `npm run build`, `npm run typecheck`). Confirmed by user's "TDD-oriented planning" instruction.
8. **No edits executed**: Plan mode READ-ONLY maintained throughout. Zero file modifications made to source. All verification commands documented for execution phase.

---

## Dependency Graph

```
T1 (Token + @layer) ──┬──→ T2 (Shared.css + test)
                      ├──→ T3 (Dark two-stage)
                      ├──→ T4 (Layout unification)
                      ├──→ T5 (Grid + responsive)
                      └──→ T6 (Component tokenization)

T3 (Dark two-stage) ───→ T4, T5

T5 (Grid) ─────────────→ T7 (Animation)
T6 (Components) ────────→ T7 (Animation)

T2, T4, T5, T6, T7 ────→ T8 (Integration QA)
```

---

## Parallel Execution Waves (4 Waves)

### Wave 1 (Start Immediately — No Dependencies)
- **T1**: Token architecture + `@layer` split (`src/index.css`)
- **T3**: Dark two-stage (`src/index.css` dark block — isolated section edit to avoid conflict with T1)
*Can run sequentially or with file-section isolation; safe in parallel if editing different CSS sections.*

### Wave 2 (After Wave 1 — 4 Parallel Tasks)
- **T2**: Shared.css + token verification test
- **T4**: Layout / AuthLayout unification
- **T5**: Grid + responsive expansion
- **T6**: Component unification (Button tokenization)
*All independent once Wave 1 token variables and dark mechanism exist.*

### Wave 3 (After Wave 2 — Single/Parallel)
- **T7**: Animation / motion layer (`@keyframes` + transition on components)
*Depends on T5 (grid patterns to animate) and T6 (button hover states to transition).*

### Wave 4 (After Wave 3 — Final Integration)
- **T8**: Integration verification + full QA (`npm run build` + `npm run test` + `npm run typecheck` + manual checklist)

---

## Atomic Commit Strategy (TDD-Oriented)

Each commit = one task. No squash. Atomic rollback per wave boundary.

```
commit T1-struct: style(B): split index.css into @layer base/components/utilities; declare token loop
commit T3-dark2: style(B): add prefers-color-scheme stage 2; preserve data-theme stage 1
commit T2-verify: style(B): populate shared.css; add token-consumption vitest
commit T4-layout: style(C): extract BaseLayout; eliminate Layout/AuthLayout duplication
commit T5-grid: style(C): introduce grid layout; expand md/lg/xl responsive breakpoints
commit T6-component: style(C): tokenize Button variants; remove hardcoded hex colors
commit T7-motion: style(C): add @keyframes fade-in/slide-up; apply transition to Button hover
commit T8-verify: style(C): full build/test pass; document token loop and layer architecture
```

---

## Detailed Tasks (File + Success Criteria + Verification Commands)

### T1: Token Architecture + `@layer` Split (B — Foundation)
- **Files**: `src/index.css`
- **Category / Skills**: `unspecified-high` | [`tailwindcss`, `tailwindcss-advanced-layouts`, `solidjs`]
- **Skills included**: `tailwindcss` (v4 `@theme`/`@layer` syntax); `tailwindcss-advanced-layouts` (grid layer planning); `solidjs` (component integration awareness).
- **Skills omitted**: `frontend` (no aesthetic redesign); `debugging` (no runtime fix); `programming` (CSS-only, no TypeScript logic).
- **Acceptance**: `grep -n "@layer" src/index.css` = 3 blocks; `grep -n "var(--" src/index.css` shows consumption; `npm run build` exit 0; `npm run typecheck` exit 0.
- **Verification**: `grep -n "@layer" src/index.css | wc -l` (expect 3+); `grep -n "var(--" src/index.css` (expect non-empty); `npm run build`; `npm run typecheck`.

### T3: Dark Two-Stage Architecture (B — Advanced Theme)
- **Files**: `src/index.css` (dark block only, lines ~112–127 + `@custom-variant` area)
- **Category / Skills**: `unspecified-high` | [`tailwindcss`, `solidjs`]
- **Skills included**: `tailwindcss` (`@custom-variant`, `prefers-color-scheme`); `solidjs` (verify `useTheme()` / theme effect unchanged in `Layout.tsx` / `AuthLayout.tsx`).
- **Skills omitted**: `frontend`, `security-research`.
- **Acceptance**: `grep -n "prefers-color-scheme" src/index.css` exists; `[data-theme='dark']` preserved; theme toggle button in `Layout.tsx` still updates `document.documentElement.dataset.theme`; build passes.
- **Verification**: `grep -n "prefers-color-scheme" src/index.css`; `cat src/index.css | grep -A 15 "prefers-color-scheme"`; `npm run build`.

### T2: Shared.css + Token Consumption Verification (B — Verification)
- **Files**: `src/styles/shared.css` (rewrite); `src/styles/__tests__/token-consumption.test.ts` (new)
- **Category / Skills**: `quick` | [`tailwindcss`, `programming`]
- **Skills included**: `tailwindcss` (`@utility` / `var(--token)`); `programming` (vitest assertions).
- **Skills omitted**: `solidjs`, `tailwindcss-advanced-layouts` (simple utilities, not complex grid/layout).
- **Acceptance**: `npm run test -- --run src/styles/` exit 0; `cat src/styles/shared.css | wc -l` > 3; `grep -n "var(--" src/styles/shared.css` non-empty.
- **Verification**: `npm run test -- --run src/styles/`; `cat src/styles/shared.css`; `grep -n "var(--" src/styles/shared.css`.

### T4: Layout / AuthLayout Unification (C — Layout)
- **Files**: `src/routes/_components/BaseLayout.tsx` (new); `src/routes/_components/Layout.tsx` (refactor/remove); `src/routes/_components/AuthLayout.tsx` (refactor/remove); `src/App.tsx` (update imports/routes)
- **Category / Skills**: `unspecified-high` | [`solidjs`, `tailwindcss`]
- **Skills included**: `solidjs` (`ParentProps`, `A`, `Router`, `lazy`, component props); `tailwindcss` (token class construction in new layout).
- **Skills omitted**: `tailwindcss-advanced-layouts` (grid patterns handled in T5, not this structural unification); `frontend` (same visual, just unified structure).
- **Acceptance**: Only one `createEffect` theme-sync definition across `src/routes/_components/` (verified by `grep -r`); `App.tsx` uses unified layout; no duplicate `min-h-svh flex flex-col bg-white` strings; `npm run typecheck` exit 0.
- **Verification**: `grep -r "createEffect" src/routes/_components/`; `grep -r "min-h-svh flex flex-col bg-white" src/routes/_components/`; `npm run build`; `npm run typecheck`.

### T5: Grid + Responsive Expansion (C — Layout & Responsive)
- **Files**: `src/routes/_components/Layout.tsx` (or `BaseLayout.tsx` from T4); `src/routes/pages/Home.tsx`, `Dashboard.tsx`, `Login.tsx`, `NotFound.tsx`; `src/index.css` (responsive media query expansions)
- **Category / Skills**: `visual-engineering` | [`tailwindcss-advanced-layouts`, `tailwindcss`, `solidjs`]
- **Skills included**: `tailwindcss-advanced-layouts` (grid-template-areas, responsive grid recipes); `tailwindcss` (`sm:`/`md:`/`lg:`); `solidjs` (page JSX updates).
- **Skills omitted**: `frontend` (structural change, not aesthetic redesign).
- **Acceptance**: `grep -c "grid" src/routes/pages/*.tsx` >= 2 files; `grep -ro 'md:\|lg:' src/routes/pages/` non-empty; `npm run build` exit 0. Grid patterns: holy-grail (`grid-rows-[auto_1fr_auto]`) in Layout, auto-fit cards in Home (`grid-cols-[repeat(auto-fit,minmax(250px,1fr))]`), grid layout in Dashboard. No full masonry, no subgrid.
- **Verification**: `grep -c "grid" src/routes/pages/Home.tsx src/routes/pages/Dashboard.tsx`; `grep -ro 'md:\|lg:' src/routes/pages/*.tsx`; `npm run build`.

### T6: Component Unification (C — Components)
- **Files**: `src/components/shared/Button.tsx`
- **Category / Skills**: `unspecified-high` | [`solidjs`, `tailwindcss`]
- **Skills included**: `solidjs` (`ButtonProps`, `splitProps`, `ParentProps`); `tailwindcss` (`var(--accent)` usage and variant class composition).
- **Skills omitted**: `tailwindcss-advanced-layouts` (not complex grid/layout); `frontend` (same appearance, token-driven); `security-research`.
- **Acceptance**: `grep -n "#[0-9a-f]\{6\}" src/components/shared/Button.tsx` returns nothing; `grep -n "var(--" src/components/shared/Button.tsx` non-empty; build passes.
- **Verification**: `grep -n "#[0-9a-f]\{6\}" src/components/shared/Button.tsx` (expect 0); `grep -n "var(--" src/components/shared/Button.tsx` (expect results); `npm run build`; `npm run typecheck`.

### T7: Animation / Motion Layer (C — Motion)
- **Files**: `src/index.css` (keyframes `fade-in` + `slide-up`; transition utilities); `src/components/shared/Button.tsx` (hover `transition-colors duration-200`); optionally `Layout.tsx` / `Home.tsx` (animation class). Pure CSS only — no `motion-one`, no JS motion library.
- **Category / Skills**: `visual-engineering` | [`tailwindcss`, `frontend`, `solidjs`]
- **Skills included**: `tailwindcss` (`@keyframes`, `animation-*`, `transition-*`); `frontend` (motion best practices); `solidjs` (class application to components/pages).
- **Skills omitted**: `tailwindcss-advanced-layouts` (motion ≠ layout); `security-research`.
- **Acceptance**: `grep -n "@keyframes" src/index.css` >= 2 results; `grep -n "transition-" src/components/shared/Button.tsx` exists; `npm run build` exit 0.
- **Verification**: `grep -n "@keyframes" src/index.css`; `grep -n "transition-" src/components/shared/Button.tsx`; `npm run build`.

### T8: Integration Verification + Full QA (C — Final Wave)
- **Files**: Optional `STYLE_ARCH.md` (new doc); `README.md` (optional architecture notes)
- **Category / Skills**: `unspecified-high` | [`review-work`, `solidjs`, `tailwindcss`, `frontend`]
- **Skills included**: `review-work` (post-implementation verification pattern); `solidjs` (build/test); `tailwindcss` (token loop verification); `frontend` (responsive/dark/motion QA checklist).
- **Skills omitted**: `security-research` (no security audit required); `debugging` (no runtime crash to fix; preventive verification).
- **Acceptance**: `npm run build` exit 0; `npm run test` exit 0; `npm run typecheck` exit 0; all 10 success criteria verified and logged (token loop, layer split, dark stages, layout unified, grid adopted, responsive expanded, component tokenized, animation present, build/test clean); `STYLE_ARCH.md` exists.
- **Verification**: `npm run build`; `npm run test`; `npm run typecheck`; manual checklist logged; `grep` verification commands from T1-T7 executed successfully.

---

## Wave-Based TODO List (Caller: Use `todowrite` and Execute by Wave)

### Wave 1 (No Dependencies — Start Now)
- [ ] **T1** — Token architecture + `@layer` split — File: `src/index.css` — Category: `unspecified-high` — Skills: [`tailwindcss`, `tailwindcss-advanced-layouts`, `solidjs`] — Verify: `grep "@layer"` (3+ results), `grep "var(--"` (consumption), `npm run build`, `npm run typecheck`.
- [ ] **T3** — Dark two-stage architecture — File: `src/index.css` (dark block) — Category: `unspecified-high` — Skills: [`tailwindcss`, `solidjs`] — Verify: `grep "prefers-color-scheme"`, theme toggle preserved, `npm run build`.

### Wave 2 (After Wave 1 Completes — Parallel)
- [ ] **T2** — Shared.css + token verification test — Files: `src/styles/shared.css`, `src/styles/__tests__/token-consumption.test.ts` — Category: `quick` — Skills: [`tailwindcss`, `programming`] — Verify: `npm run test -- --run src/styles/`, `shared.css` > 3 lines, `grep "var(--"`.
- [ ] **T4** — Layout / AuthLayout unification — Files: `src/routes/_components/BaseLayout.tsx`, `Layout.tsx`, `AuthLayout.tsx`, `src/App.tsx` — Category: `unspecified-high` — Skills: [`solidjs`, `tailwindcss`] — Verify: `grep -r "createEffect"` (single definition), `npm run typecheck`, `npm run build`.
- [ ] **T5** — Grid + responsive expansion — Files: `src/routes/_components/*.tsx`, `src/routes/pages/*.tsx`, `src/index.css` — Category: `visual-engineering` — Skills: [`tailwindcss-advanced-layouts`, `tailwindcss`, `solidjs`] — Verify: `grep "grid"` (>= 2 files), `grep "md:\|lg:"` (non-empty), `npm run build`.
- [ ] **T6** — Component unification (Button tokenization) — File: `src/components/shared/Button.tsx` — Category: `unspecified-high` — Skills: [`solidjs`, `tailwindcss`] — Verify: `grep "#[0-9a-f]\{6\}"` (0 results), `grep "var(--"` (results), `npm run build`, `npm run typecheck`.

### Wave 3 (After Wave 2 Completes)
- [ ] **T7** — Animation / motion layer — Files: `src/index.css`, `src/components/shared/Button.tsx` — Category: `visual-engineering` — Skills: [`tailwindcss`, `frontend`, `solidjs`] — Verify: `grep "@keyframes"` (>= 2), `grep "transition-" Button.tsx`, `npm run build`.

### Wave 4 (After Wave 3 Completes — Final Integration)
- [ ] **T8** — Integration verification + full QA — Optional: `STYLE_ARCH.md`, `README.md` update — Category: `unspecified-high` — Skills: [`review-work`, `solidjs`, `tailwindcss`, `frontend`] — Verify: `npm run build` (0), `npm run test` (0), `npm run typecheck` (0), all 10 success criteria confirmed, `STYLE_ARCH.md` exists.

---

## Success Criteria (10-Point Checklist)

1. Token loop closed: `@theme` vars declared in `index.css` consumed via `var(--...)` in components / `shared.css`.
2. Layer separation: `@layer base`, `@layer components`, `@layer utilities` present.
3. Dark two-stage: `data-theme="dark"` (manual) + `(prefers-color-scheme: dark)` (system) both handled.
4. Layout unified: `Layout.tsx` / `AuthLayout.tsx` duplication eliminated (single `BaseLayout` or extracted hook).
5. Grid adopted: >= 2 files in `src/routes/` or `src/components/` contain `grid` class.
6. Responsive expanded: `md:` and `lg:` present in source files (beyond single existing `sm:`).
7. Component tokenized: `Button.tsx` uses token variables (`var(--accent)` etc.), zero hardcoded hex colors.
8. Animation present: >= 2 `@keyframes` in `index.css`; transition classes applied.
9. Build/test clean: `npm run build`, `npm run test`, `npm run typecheck` all exit 0.
10. TDD verified: Each wave's verification commands executed and logged before proceeding.

---

*Plan complete. All requirements addressed (English output, parallel waves, atomic commits, TDD orientation, file-level success criteria with verification commands, skills evaluation included/omitted with reasons, dependency and parallel graphs). Ready for execution upon user confirmation.*
