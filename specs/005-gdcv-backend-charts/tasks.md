---

description: "Task list for 005-gdcv-backend-charts"
---

# Tasks: Gráficos GDCV desde backend

**Input**: Design documents from `/specs/005-gdcv-backend-charts/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/energia-gdcv.md](./contracts/energia-gdcv.md), [quickstart.md](./quickstart.md)

**Tests**: Incluidos — Principio III de la constitución (Test-First for Data & Business
Logic) es NON-NEGOTIABLE para funciones que transforman/agregan datos de dominio, y ya
hay precedente directo (`tests/lib/api/energia-roi-mantenimiento.test.ts`,
`tests/app/api/parques/energia-dia.test.ts`) que este feature extiende.

**Organization**: Un solo alcance real de implementación — User Story 1 (Performance).
User Story 2 (ROI) y User Story 3 (diario/mantenimiento) del spec ya están cumplidas
por código existente (`listRoi`+`computeRealRoiKpis`, `listMantenimiento`); sus tasks
son de **verificación**, no de construcción, para dejar constancia y evitar
regresiones.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1 (Performance), US2 (ROI — verificación), US3 (Diario/Mantenimiento — verificación)

## Path Conventions

Proyecto único Next.js App Router — rutas relativas a la raíz del repo, según
`plan.md` → Project Structure.

---

## Phase 1: Setup

**Purpose**: No hay inicialización de proyecto nueva — el stack, test runner y
convenciones ya existen. Esta fase se reduce a confirmar el punto de partida.

- [X] T001 Run `npm run lint` and `npx tsc --noEmit` on current `main`/branch tip to confirm a clean baseline before touching `components/gdcv/GdcvPerformanceView.tsx`, `app/gdcv/performance/page.tsx`

---

## Phase 2: Foundational

**Purpose**: No hay infraestructura bloqueante nueva — `lib/api/energia.ts` y
`lib/park-energy-series.ts` ya existen y ya están testeados (reutilizados sin cambios,
ver research.md Decision 1/2). Esta fase queda vacía por diseño; no bloquea el inicio
de la Fase 3.

**Checkpoint**: N/A — no hay tareas foundational nuevas, se pasa directo a User Story 1.

---

## Phase 3: User Story 1 - Ver rendimiento real de un parque GDCV (Priority: P1) 🎯 MVP

**Goal**: El chart de "Energía Generada del Parque" (6M/1A/TODO/1M/1D) y el KPI
primario "Generada en [mes]" en `/gdcv/performance` muestran datos reales de
`GET /parques/{id}/energia`, con los mismos estados de carga/vacío/error que GDD —
eliminando el uso de `data/gdcv-mock.ts` y `data/gdcv-daily-mock.ts` para este bloque.

**Independent Test**: Abrir `/gdcv/performance?proyectoId=<id>` con un parque GDCV que
tenga registros reales en backend y verificar que los valores del chart y del KPI
coinciden con la respuesta cruda de `GET /parques/{parqueId}/energia` — ver
[quickstart.md](./quickstart.md) Escenario 1/2/3.

### Tests for User Story 1 ⚠️

> **Escribir estos tests PRIMERO y verificar que fallan antes de implementar.**

- [X] T002 [P] [US1] Extend `tests/app/gdcv/performance-page.test.ts` (new file) with a
      test mocking `listEnergia`/`listEnergiaDiaria` (via `vi.mock("@/lib/api/energia")`,
      same pattern as `tests/lib/api/energia-roi-mantenimiento.test.ts`) and
      `resolveDashboardContext`, asserting `GdcvPerformanceView` receives
      `registrosEnergia`, `registrosEnergiaDiaria` and `periodoActual` as props from
      `app/gdcv/performance/page.tsx` (mirrors `app/gdd/performance/page.tsx` behavior)
- [X] T003 [P] [US1] Add test in `tests/app/gdcv/performance-page.test.ts` asserting that
      when `listEnergia` throws (not `UnauthorizedError`), the page still renders with
      `registrosEnergia: null` instead of throwing — same contract as
      `loadRegistrosEnergia` in `app/gdd/performance/page.tsx`
- [X] T004 [P] [US1] Add test in `tests/app/gdcv/performance-page.test.ts` asserting a
      `UnauthorizedError` from `listEnergia`/`listEnergiaDiaria` triggers `redirect("/login")`

### Implementation for User Story 1

- [X] T005 [US1] Update `app/gdcv/performance/page.tsx`: add `loadRegistrosEnergia` and
      `loadRegistrosEnergiaDiaria` helpers plus `currentPeriodo()` copied verbatim from
      `app/gdd/performance/page.tsx` (same error/redirect handling), fetch both in
      parallel via `Promise.all` alongside `resolveDashboardContext`, and pass
      `registrosEnergia`, `registrosEnergiaDiaria`, `periodoActual` as new props to
      `GdcvPerformanceView`
- [X] T006 [US1] Update `components/gdcv/GdcvPerformanceView.tsx` props interface to
      accept `registrosEnergia: RegistroEnergiaMensual[] | null`,
      `registrosEnergiaDiaria: RegistroEnergiaDiario[] | null`, `periodoActual: string`
      (types from `@/lib/api/types`), removing the mock-only prop shape
- [X] T007 [US1] In `components/gdcv/GdcvPerformanceView.tsx`, replace the
      `getGdcvEnergySeries(chartRange)` mock call with `getRealParkEnergySeries` /
      `getRegistroDelMesActual` from `@/lib/park-energy-series` (same functions
      `ParkPerformanceView` uses), building `chartData` for 6M/1A/TODO/1M ranges,
      returning `[]` for "1d" (depends on T006)
- [X] T008 [US1] In `components/gdcv/GdcvPerformanceView.tsx`, replace
      `gdcvGeneradaAbril`/`gdcvGenerationSparkline` mock values in the `KpiPrimary`
      block with `getMonthlyGenerationTotal(registrosEnergiaDiaria)` /
      `getMonthlySparklinePoints(registrosEnergiaDiaria)` from
      `@/lib/park-energy-series`, using `getMonthNameEs(periodoActual)` for the label
      (same as `ParkPerformanceView`) (depends on T006)
- [X] T009 [US1] In `components/gdcv/GdcvPerformanceView.tsx`, add the same
      loading/empty/error branches `ParkPerformanceView` has for the chart area
      (`energiaLoadFailed`, `chartData.length === 0`, "Reintentar" button calling
      `router.refresh()`) so GDCV never silently falls back to mock data on error
      (depends on T007)
- [X] T010 [US1] In `components/gdcv/GdcvPerformanceView.tsx`, replace the "1D" branch's
      hardcoded `MOCK_TODAY`/`getDailyGenerationData24` mock fetch with the same
      client-side `fetch("/api/parques/{parque.id}/energia-dia?periodo=...")` +
      `DailyEnergyTotalsBlock` pattern used in `ParkPerformanceView` (including its
      loading/error UI), reusing the existing route
      `app/api/parques/[parqueId]/energia-dia/route.ts` as-is (depends on T006, T009)
- [X] T011 [US1] Remove now-unused imports in `components/gdcv/GdcvPerformanceView.tsx`
      from `@/data/gdcv-mock` (`gdcvGeneradaAbril`, `gdcvGenerationSparkline`,
      `getGdcvEnergyChartSubtitle`, `getGdcvEnergySeries`) and `@/data/gdcv-daily-mock`
      (`getDailyGenerationData24`, `getDailyPeak`, `getDailyTotal`, `MOCK_TODAY`),
      keeping only what's still used for the out-of-scope socios table (`sociosMock`,
      `gdcvParkDetails`, `gdcvAhorroTotalAbril`, `gdcvPromedioPorUsuario` per
      data-model.md Out of Scope) (depends on T007, T008, T010)

**Checkpoint**: `/gdcv/performance` muestra chart y KPI reales; comportamiento
verificable con [quickstart.md](./quickstart.md) Escenarios 1–3.

---

## Phase 4: User Story 2 - Ver ROI real de un parque GDCV (Priority: P2) — Verificación

**Goal**: Confirmar que `app/gdcv/roi/page.tsx` + `GdcvRoiView` ya cumplen FR-002 del
spec (KPIs superiores desde `listRoi`/`computeRealRoiKpis`) y que no hay regresión
pendiente — no se requiere código nuevo (ver research.md, tabla de auditoría).

**Independent Test**: [quickstart.md](./quickstart.md) Escenario 4, punto 1.

- [X] T012 [P] [US2] Confirm existing test coverage for `computeRealRoiKpis` in
      `tests/lib/api/energia-roi-mantenimiento.test.ts` / `tests/lib/roi-kpis.test.ts`
      (locate via `find tests -iname "*roi*"`) covers null/empty `RegistroRoi[]`
      producing a `null` `RealRoiKpis`; if a gap exists, add the missing case — no
      production code change expected

      **Result**: gap found — no test file existed for `lib/roi-kpis.ts` at all.
      Added `tests/lib/roi-kpis.test.ts` (5 cases: empty array → null, most-recent
      periodo selection, tir formatting, pendienteRecuperar clamped at 0,
      division-by-zero guard). No production code change — `computeRealRoiKpis`
      already behaved correctly.
- [ ] T013 [US2] Manually run [quickstart.md](./quickstart.md) Escenario 4.1 against a
      GDCV proyecto with ROI data and confirm "Inversión Recuperada", "Pendiente de
      recuperar" and "TIR" reflect `listRoi` output; record result in this task's
      checkbox only — no file changes expected unless a defect is found

      **Not run in this session**: requires a live/staging backend with real GDCV ROI
      data, unavailable here. Leave pending for manual QA against a running
      environment before merge.

**Checkpoint**: ROI confirmado sin cambios de código; cualquier defecto encontrado se
registra como nueva task antes de cerrar esta fase.

---

## Phase 5: User Story 3 - Ver datos diarios y de mantenimiento reales (Priority: P3) — Verificación (mantenimiento) + Implementación (diario)

**Goal**: Mantenimiento ya cumple FR-004 (`GdcvMantenimientoView` usa
`listMantenimiento`) — solo verificación. El detalle diario de FR-003 queda cubierto
por T010 (misma vista de performance, rango "1D"); esta fase confirma que no falta
nada adicional.

**Independent Test**: [quickstart.md](./quickstart.md) Escenario 4, punto 2 (mantenimiento) y Escenario 1, punto 4 (diario).

- [ ] T014 [P] [US3] Manually run [quickstart.md](./quickstart.md) Escenario 4.2 against
      a GDCV proyecto with mantenimiento data and confirm the table reflects
      `listMantenimiento(parqueId)`; record result only — no file changes expected
      unless a defect is found

      **Not run in this session**: requires a live/staging backend, unavailable here.
      Code inspection confirms `GdcvMantenimientoView` already calls
      `listMantenimiento(parqueId)` directly (no mock import) — leave pending for
      manual QA confirmation before merge.
- [ ] T015 [US3] Manually run [quickstart.md](./quickstart.md) Escenario 1, punto 4
      (rango "1D") after T010 is implemented and confirm the daily chart comes from
      `/api/parques/{parqueId}/energia-dia`, not `data/gdcv-daily-mock.ts`

      **Not run in this session**: requires a live/staging backend + browser. T010 is
      implemented and `tests/app/gdcv/performance-page.test.ts` covers the data
      plumbing; the remaining browser-level confirmation is pending manual QA.

**Checkpoint**: Todas las vistas de GDCV (performance, ROI, diario, mantenimiento)
verificadas contra backend real, ninguna depende de `data/gdcv-*-mock.ts` salvo la
tabla de socios (fuera de alcance documentado).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cierre de calidad transversal, según Principio V (Simplicity & Reviewable
Change): `npm run lint` y `npm run build`/`tsc --noEmit` deben pasar antes de merge.

- [X] T016 [P] Run `npx tsc --noEmit` and `npm run lint` on the full repo and fix any
      type/lint errors introduced by T005–T011

      **Result**: no new errors — same 6 pre-existing errors/11 warnings as the
      Phase 1 baseline (MonetaryBarChart.tsx, scripts/figma-flow-builder.ts,
      scripts/flow-from-images.ts, components/ui/sidebar.tsx — all unrelated to
      this feature's files).
- [X] T017 [P] Run `npm run test -- tests/lib/park-energy-series.test.ts
      tests/lib/api/energia-roi-mantenimiento.test.ts tests/app/gdcv/performance-page.test.ts`
      and confirm all pass

      **Result**: 50/50 passed across `tests/lib/park-energy-series.test.ts`,
      `tests/lib/api/energia-roi-mantenimiento.test.ts`,
      `tests/app/gdcv/performance-page.test.ts` (new), `tests/lib/roi-kpis.test.ts` (new).
- [ ] T018 Run through [quickstart.md](./quickstart.md) Escenarios 1–4 end to end in
      `npm run dev` against a real or staging backend, confirming SC-001 through SC-004
      from spec.md

      **Not run in this session**: requires a live/staging backend + browser session.
      Pending manual QA before merge, same as T013–T015.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede empezar de inmediato
- **Foundational (Phase 2)**: Vacía — no bloquea nada
- **User Story 1 (Phase 3)**: Depende solo de Phase 1 — es la única fase con código
  nuevo
- **User Story 2 (Phase 4)**: Independiente de Phase 3 — solo verificación, puede
  correr en paralelo
- **User Story 3 (Phase 5)**: T014 (mantenimiento) es independiente y puede correr en
  paralelo con Phase 3; T015 depende de que T010 (Phase 3) esté implementado
- **Polish (Phase 6)**: Depende de que Phase 3 esté completa (y, si se hicieron, 4 y 5)

### Within User Story 1

- T002–T004 (tests) deben escribirse y fallar antes de T005–T011 (implementación)
- T005 (page.tsx) y T006 (props interface) antes de T007/T008/T010 (usan los nuevos props)
- T007, T008 antes de T009 (estados de error envuelven el chart ya migrado)
- T009 antes de T010 (mismo patrón de error se extiende al rango "1D")
- T011 (limpieza de imports) al final, depende de T007/T008/T010

### Parallel Opportunities

- T002, T003, T004 (tests, mismo archivo nuevo pero secciones independientes — revisar
  si conviene un solo commit en vez de paralelizar literalmente)
- T012 (US2) y T014 (US3, mantenimiento) pueden correr en paralelo con toda la Phase 3
- T016 y T017 (Polish) en paralelo entre sí

---

## Parallel Example: User Story 1

```bash
# Tests primero (deben fallar):
Task: "Test app/gdcv/performance/page.tsx passes registrosEnergia/registrosEnergiaDiaria/periodoActual to GdcvPerformanceView"
Task: "Test app/gdcv/performance/page.tsx returns registrosEnergia: null on non-Unauthorized fetch error"
Task: "Test app/gdcv/performance/page.tsx redirects to /login on UnauthorizedError"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (baseline lint/build check)
2. Phase 2: Foundational — vacía, sin trabajo
3. Phase 3: User Story 1 completa (T002–T011)
4. **STOP y VALIDAR**: correr [quickstart.md](./quickstart.md) Escenarios 1–3
5. Esto ya es el MVP — cierra el gap real reportado ("GDCV sigue con mock")

### Incremental Delivery

1. Setup + Foundational → listo de inmediato
2. User Story 1 → validar independientemente → esta es la entrega que resuelve el
   problema original
3. User Story 2 (verificación) y User Story 3 (verificación + T015) → confirman que el
   resto del modelo GDCV no tiene deuda oculta
4. Polish → gate final de lint/build/tests antes de PR

## Notes

- No hay Foundational phase con tareas reales: toda la infraestructura de energía
  (`lib/api/energia.ts`, `lib/park-energy-series.ts`, ruta `energia-dia`) ya existe y
  ya está testeada — reutilizar, no reconstruir (research.md Decision 1/2).
- User Story 2 y 3 son mayormente checklists de verificación, no implementación — si
  al ejecutarlas aparece un defecto real, agregar una task nueva con [P]/[Story]
  correspondiente antes de cerrar esa fase.
- La tabla de socios (`SociosTable`, `sociosMock`) queda explícitamente fuera de
  alcance (data-model.md Out of Scope) — no crear tasks para migrarla en esta feature.
