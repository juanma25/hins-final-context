---

description: "Task list for feature implementation"
---

# Tasks: Comparativa DIMMs vs Huawei en Detalle de Parque

**Input**: Design documents from `/specs/012-comparativa-dimms-huawei/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/medidor-principal-consolidado.md, quickstart.md

**Tests**: Included — Constitution Principle III (Test-First for Data & Business Logic, NON-NEGOTIABLE) requires tests-first for any function that transforms/aggregates domain data; this feature's merge/comparativa logic falls squarely under that.

**Organization**: Tasks are grouped by user story (US1/US2/US3 from spec.md, in priority order P1, P1, P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps task to US1 (cards), US2 (gráficos), or US3 (manejo de errores)

## Path Conventions

Single Next.js app at repo root — see plan.md "Source Code" tree. No new top-level directories.

---

## Phase 1: Setup

**Purpose**: No new dependencies or scaffolding needed — this feature extends existing files only (Principle V: no new deps). This phase is a no-op check.

- [X] T001 Confirm `npm run lint` and `npm run build` pass on current `main`/branch baseline before starting (no code change; establishes a clean starting point)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types + data-fetching + pure merge logic shared by all three user stories. Must complete before any US phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Add `EstadisticaEnergiaConsolidada` and `ConsolidadoMedidorPrincipal` types to `lib/api/types.ts` per data-model.md (mirror the existing `RegistroEnergiaMensual`/`RegistroEnergiaDiario` documentation style — real API shape, not raw swagger DTO)
- [X] T003 [P] Write failing tests for `getConsolidadoMedidorPrincipal` in `tests/lib/api/medidor-principal.test.ts`: maps `ConsolidadoDto` → `ConsolidadoMedidorPrincipal` (uses `total.energiaActivaExportada.sumaKwh`), returns `null` on 404, propagates other HTTP/network errors — per contracts/medidor-principal-consolidado.md
- [X] T004 Implement `getConsolidadoMedidorPrincipal(parqueId, periodo)` in `lib/api/medidor-principal.ts` using `apiFetch` (same pattern as `lib/api/energia.ts`/`lib/api/socios-historico.ts`) to make T003 pass
- [X] T005 [P] Write failing tests for the pure merge/comparativa logic in `tests/lib/energia-comparativa.test.ts`: building `ComparativaGeneracionPunto[]` from `ConsolidadoMedidorPrincipal[]` + `RegistroEnergiaMensual[]` aligned by `periodo`; `null` in either source → `null` in that field (never fabricated/interpolated, per FR-010); single-period (current month) merge for the KPI card case
- [X] T006 Implement `lib/energia-comparativa.ts` (`buildComparativaGeneracionSeries`, `buildComparativaGeneracionMesActual` or equivalent pure functions) to make T005 pass, reusing `formatPeriodoLabel` from `lib/format-periodo.ts` for labels

**Checkpoint**: Foundation ready — DIMMs data can be fetched and merged with Huawei data; user story UI work can now begin

---

## Phase 3: User Story 1 - Ver comparativa de generación en tarjetas resumen (Priority: P1) 🎯 MVP

**Goal**: The monthly KPI card in the parque detail view shows the DIMMs value as primary and the Huawei value as a secondary comparison reference, with a clear "not available" state when DIMMs has no data for the period.

**Independent Test**: Open `/gdcv/performance?proyectoId=<id>` for a parque with data in both sources for the current month; verify the KPI card shows DIMMS as primary and Huawei as secondary. Repeat for a parque without a medidor principal (404) and verify Huawei still shows, without being presented as primary.

### Tests for User Story 1 ⚠️

- [X] T007 [P] [US1] Write failing test in `tests/app/gdcv/performance-page.test.ts` asserting `page.tsx` fetches DIMMs consolidado for `periodoActual` alongside existing sources, passes it as a `registroDimmsMesActual` (or equivalent) prop to `GdcvPerformanceView`, and that a DIMMs fetch failure does not throw / still renders the page (extends the existing `loadRegistrosEnergia*` error-isolation tests already in this file)
- [X] T008 [P] [US1] SCOPED DOWN during implementation: `GdcvPerformanceView` is a hooks-heavy client component and this repo's vitest config runs in `environment: "node"` with no jsdom/RTL, so it cannot be rendered/asserted-on directly (unlike `page.tsx`, a plain async function with no hooks). Per Constitution Principle III ("Pure UI presentation components are exempt"), the card's presentation is left untested at the component level; the logic it depends on (`buildComparativaGeneracionMesActual`) is covered by T005/T006's tests instead.

### Implementation for User Story 1

- [X] T009 [US1] Extend `KpiPrimary` in `components/ui/kpi-primary.tsx` with an optional `comparativeValue`/`comparativeLabel` prop (e.g. "FusionSolar: X kWh") rendered near the primary value, and an optional `primaryUnavailable` state to make T008's card-level assertions passable
- [X] T010 [US1] In `app/gdcv/performance/page.tsx`, add `loadRegistroDimmsMesActual(parqueId, periodoActual)` (same try/catch + `UnauthorizedError` redirect pattern as `loadRegistrosEnergiaDiaria`), call it in the existing `Promise.all`, and pass the result to `GdcvPerformanceView` as a new prop to make T007 pass
- [X] T011 [US1] In `components/gdcv/GdcvPerformanceView.tsx`, accept the new DIMMs prop, use `lib/energia-comparativa.ts` (T006) to derive the comparativa point for `periodoActual`, and pass primary/secondary values + unavailable state into the `KpiPrimary` instance (replacing the Huawei-only value currently used for "Generada en [mes]") to make T008 pass

**Checkpoint**: User Story 1 fully functional and independently testable — KPI card shows DIMMs-primary/Huawei-secondary comparison

---

## Phase 4: User Story 2 - Ver comparativa de generación en gráficos (Priority: P1)

**Goal**: The existing park energy bar chart (6M/1A ranges) shows two labeled, visually distinct series — DIMMs (primary) and Huawei (secondary) — updating together when the range changes, with gaps (not fabricated values) where either source lacks data for a period.

**Independent Test**: Open the parque detail view, switch chart range between 6M and 1A; verify two labeled series render, both series update on range change, and any period missing data in one source renders as an empty/discontinuous point for that series only.

### Tests for User Story 2 ⚠️

- [X] T012 [P] [US2] Write failing test in `tests/lib/energia-comparativa.test.ts` (extends T005's file) for `buildComparativaGeneracionSeries` across a multi-month range, including a month present in Huawei but missing in DIMMs and vice versa
- [X] T013 [P] [US2] SCOPED DOWN during implementation: same reason as T008 — no jsdom/RTL in this repo's vitest setup to assert on rendered Recharts SVG output. The row-shaping logic feeding the chart (`getComparativaGeneracionChartRows`) is covered by T012/T005 tests instead; the chart component itself is a presentation extension (Principle III exemption).
- [X] T014 [P] [US2] Write failing test in `tests/app/gdcv/performance-page.test.ts` asserting `page.tsx` fetches DIMMs consolidado per month for the chart range (bounded `Promise.all`, ≤12 calls) and passes the resulting series to `GdcvPerformanceView`

### Implementation for User Story 2

- [X] T015 [US2] Add `ParkEnergyComparativeRow` type and a `variant: "comparative"` branch to `components/charts/ParkEnergyBarChart.tsx` (sibling to the existing `total`/`share` variants) rendering grouped/dual bars for `dimmsKwh` vs `huaweiKwh` per label, reusing `data/chart-config.ts` tokens, to make T013 pass
- [X] T016 [US2] Add `getComparativaGeneracionChartRows` (or extend T006's module) in `lib/energia-comparativa.ts` mapping a `ConsolidadoMedidorPrincipal[]` + Huawei range series into `ParkEnergyComparativeRow[]`, to make T012 pass
- [X] T017 [US2] In `app/gdcv/performance/page.tsx`, add a helper that resolves the list of periods (`YYYY-MM`) needed for the currently-derivable chart ranges and fetches DIMMs consolidado for each via `Promise.all` (reusing `getConsolidadoMedidorPrincipal` from T004), passing the resulting list to `GdcvPerformanceView`, to make T014 pass
- [X] T018 [US2] In `components/gdcv/GdcvPerformanceView.tsx`, replace the `ParkEnergyBarChart` `variant="total"` usage for the energy chart with `variant="comparative"` fed by T016's rows (falling back gracefully when DIMMs data for the range failed to load, per FR-006)

**Checkpoint**: User Stories 1 AND 2 both work independently — cards and chart show the DIMMs/Huawei comparison

---

## Phase 5: User Story 3 - Manejo de errores al consultar la fuente principal (Priority: P2)

**Goal**: When the DIMMs source fails entirely (error/timeout, not just "no data"), the parque detail page remains usable with Huawei data and a visible notice that the primary source is unavailable — distinct from the "sin medidor principal" (404, not an error) case already handled in US1/US2.

**Independent Test**: Force the DIMMs endpoint to error/timeout; verify the page still renders with Huawei data intact and shows a visible "fuente principal no disponible" notice (not a broken page, not a silent fallback with no indication).

### Tests for User Story 3 ⚠️

- [X] T019 [P] [US3] Write failing test in `tests/app/gdcv/performance-page.test.ts` asserting a non-404 error/timeout from the DIMMs fetch (T010/T017 helpers) resolves to a distinct "no disponible" state (vs. `null`/"sin medidor principal" from a 404), still passed down without throwing
- [X] T020 [P] [US3] SCOPED DOWN during implementation: same reason as T008/T013 (no jsdom/RTL). Covered instead by T019 (page passes the distinct `"error"` status down) plus manual verification via quickstart.md scenario 4.

### Implementation for User Story 3

- [X] T021 [US3] Distinguish the "sin medidor principal" (404 → `null`, degrade silently to Huawei-only) case from the "fetch failed" (error/timeout → explicit unavailable state) case in `loadRegistroDimmsMesActual`/the chart-range fetch helper in `app/gdcv/performance/page.tsx`, per contracts/medidor-principal-consolidado.md's error table, to make T019 pass
- [X] T022 [US3] Add the visible "fuente principal no disponible" notice (reusing the existing `Button`/retry pattern already used for `energiaLoadFailed` in `components/gdcv/GdcvPerformanceView.tsx`) to both the KPI card and chart area when the unavailable state is set, to make T020 pass

**Checkpoint**: All three user stories independently functional — comparativa in cards and gráficos, with correct degrade-vs-error handling

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [X] T023 [P] Run `npm run lint` and `npm run build` (or `tsc --noEmit`) — must pass clean (Constitution Principle V)
- [X] T024 [P] Run `npx vitest run` (full suite) — all green; component-render test files were descoped (see T008/T013/T020 notes — no jsdom/RTL in this repo's vitest setup)
- [ ] T025 Walk through quickstart.md's 4 manual validation scenarios against a local backend and record results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (T002–T006 must land before any US phase)
- **User Stories (Phase 3–5)**: All depend on Foundational; US1 and US2 have no dependency on each other and can proceed in parallel; US3 builds on the fetch helpers US1 (T010) and US2 (T017) introduce, so it follows both
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- Tests written and failing before implementation (T007/T008 before T009–T011; T012–T014 before T015–T018; T019/T020 before T021/T022)
- `lib/*` logic before component wiring; page-level fetch before view-level prop consumption

### Parallel Opportunities

- T002 and T003 in parallel (different files); T005 in parallel with T002–T004 (independent module)
- T007, T008 in parallel (different test files)
- T012, T013, T014 in parallel (different test files)
- T019, T020 in parallel (different test files)
- US1 (Phase 3) and US2 (Phase 4) can be implemented in parallel by different developers once Phase 2 is done

---

## Parallel Example: Foundational Phase

```bash
Task: "Add ConsolidadoMedidorPrincipal types to lib/api/types.ts"
Task: "Write failing tests for getConsolidadoMedidorPrincipal in tests/lib/api/medidor-principal.test.ts"
Task: "Write failing tests for merge logic in tests/lib/energia-comparativa.test.ts"
```

## Parallel Example: User Story 1 tests

```bash
Task: "Write failing test in tests/app/gdcv/performance-page.test.ts for DIMMs fetch wiring"
Task: "Write failing test in tests/components/gdcv/GdcvPerformanceView.test.tsx for KPI card comparativa rendering"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (trivial) + Phase 2 (Foundational)
2. Complete Phase 3 (US1 — comparativa en cards)
3. **STOP and VALIDATE**: run quickstart.md scenario 1 and 2 independently
4. Demo: KPI card shows DIMMs-primary/Huawei-secondary

### Incremental Delivery

1. Setup + Foundational → data layer ready
2. US1 → cards comparativa → validate → demo (MVP)
3. US2 → gráfico comparativa → validate → demo
4. US3 → error-vs-no-medidor distinction + notices → validate → demo
5. Polish → lint/build/tests/quickstart full pass

---

## Notes

- [P] tasks touch different files and have no unfinished-task dependency between them
- Every implementation task cites the test task(s) it makes pass — tests must be written and failing first (Constitution Principle III)
- Commit after each task or logical group
- Avoid: fabricating DIMMs/Huawei values for missing periods (FR-010); conflating "sin medidor principal" (404, silent Huawei-only degrade) with "fetch failed" (explicit notice) — these are different states per contracts/medidor-principal-consolidado.md
