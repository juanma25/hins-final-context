---

description: "Task list for feature implementation"
---

# Tasks: Gráfico de Energía del Parque (datos reales)

**Input**: Design documents from `/specs/002-park-energy-chart/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/get-parque-energia.md](contracts/get-parque-energia.md), [quickstart.md](quickstart.md)

**Tests**: Incluidos — Principio III de la constitución (Test-First, NON-NEGOTIABLE) exige tests antes de implementación para toda lógica de transformación/agregación de datos de dominio.

**Scope real**: Solo `components/gdd/ParkPerformanceView.tsx` (vía alias `GddPerformanceView`) y `app/gdd/performance/page.tsx` usan el mock mensual a reemplazar. `app/gdc/performance/page.tsx` es un stub sin este gráfico; `app/gdcv/performance/page.tsx` usa `GdcvPerformanceView` (componente distinto, no `ParkPerformanceView`) — ambos quedan fuera de alcance de este feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: A qué user story pertenece (US1, US2, US3)

---

## Phase 1: Setup

- [ ] T001 **NO EJECUTABLE en este entorno** — sin `HINS_API_BASE_URL`/token de backend real disponible en sandbox. Se implementó con la forma asumida en research.md Decision 1 (evidencia: muestra provista por el usuario). **Pendiente**: correr `curl` per [quickstart.md](quickstart.md) paso 1 contra un backend real antes de dar el feature por cerrado; si difiere, ajustar `lib/api/types.ts`/`lib/park-energy-series.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo de lectura, acceso a datos y función pura de mapeo que las tres user stories comparten.

**⚠️ CRITICAL**: Ninguna user story puede completarse sin esta fase.

- [X] T002 Agregar tipo `RegistroEnergiaMensual` (`{ periodo: string; energiaMesKwh: number | null; ingresoMes: number | null }`) en `lib/api/types.ts`, sin modificar `RegistrarEnergiaDto`/`RegistroEnergia` existentes (research.md Decision 2)
- [X] T003 [P] Test: `listEnergia` devuelve `[]` cuando `apiFetch` resuelve `null`, y parsea correctamente un array con la forma de `RegistroEnergiaMensual` (incluyendo `energiaMesKwh`/`ingresoMes` nulos) en `tests/lib/api/energia-roi-mantenimiento.test.ts` (actualizar el describe `lib/api/energia` existente; no tocar los tests de `registrarEnergia`/roi/mantenimiento)
- [X] T004 Actualizar `listEnergia` en `lib/api/energia.ts` para tipar su retorno como `Promise<RegistroEnergiaMensual[]>` y mantener el fallback a `[]` en `null` — hace pasar T003
- [X] T005 [P] Test: función pura de mapeo/rango — casos vacío, orden por `periodo`, dedupe de `periodo` duplicado (queda el último), slice `6m`/`1a`/`todo`, y `energiaMesKwh` nulo mapeado sin romper la fila, en `tests/lib/park-energy-series.test.ts` (nuevo archivo)
- [X] T006 Crear `lib/park-energy-series.ts` con función pura `getRealParkEnergySeries(registros: RegistroEnergiaMensual[], range: ChartRangeChip): ParkEnergyRow[]` (ordena por `periodo`, dedupe, slice según research.md Decision 3, mapea con `formatPeriodoLabel` a `{ label, generated: energiaMesKwh ?? 0 }`) — hace pasar T005 (depende de T002)

**Checkpoint**: Tipo, acceso a datos y mapeo listos — las user stories pueden implementarse.

---

## Phase 3: User Story 1 - Ver energía real del parque en el detalle (Priority: P1) 🎯 MVP

**Goal**: El gráfico de energía en la vista de performance del parque muestra datos reales (no mock), reacciona al selector de rango, y muestra un estado vacío claro sin datos.

**Independent Test**: Abrir `/gdd/performance?proyectoId=<id>` para un parque con registros de energía reales y ver que los valores del gráfico coinciden con la respuesta del endpoint; cambiar de rango y ver que la serie se acota; probar un parque sin registros y ver el estado vacío.

### Tests for User Story 1

- [~] T007 [P] [US1] **Omitido**: no hay React Testing Library/jsdom en el repo (`vitest.config.ts` usa `environment: "node"`, solo hay tests de lib puros) — agregarlos para un solo test de componente viola Principio V (no sumar deps sin justificación fuerte). El estado vacío es lógica presentacional exenta de test-first por Principio III ("Pure UI presentation components are exempt"); cubierto por validación manual (quickstart.md paso 3.4) en su lugar.

### Implementation for User Story 1

- [X] T008 [US1] Agregar `listEnergia(parque.id)` a `app/gdd/performance/page.tsx`, junto a `resolveDashboardContext`, y pasar el resultado como nueva prop `registrosEnergia: RegistroEnergiaMensual[] | null` a `GddPerformanceView`/`ParkPerformanceView` (depende de T004) — `null` señaliza fallo de carga (US3), no reemplaza el estado vacío
- [X] T009 [US1] Actualizar `components/gdd/ParkPerformanceView.tsx`: reemplazar `getParkEnergySeries(period)` (import de `data/gdd-performance-mock`) por `getRealParkEnergySeries(registrosEnergia, period)`; recibir `registrosEnergia` como nueva prop de `ParkPerformanceViewProps` (depende de T006, T008)
- [X] T010 [US1] Agregar estado vacío distinguible en el bloque del gráfico de energía de `ParkPerformanceView.tsx` cuando la serie resultante para el rango elegido esté vacía (texto centrado con el mismo patrón de `MantenimientoHistorialTable`: `text-sm text-muted-foreground`)
- [X] T011 [US1] Eliminar `getParkEnergySeries` y `getParkEnergyChartSubtitle` de `data/gdd-performance-mock.ts`; conservar el resto del mock (KPIs, sparklines, `gddParkDetails`) por excepción documentada — cumple FR-008. `PARK_ENERGY_MONTHLY` se conservó renombrado a `GDD_ENERGY_MONTHLY_CANONICAL` porque `lib/dashboard-downloads.ts` (export CSV "Descargar todo", fuera de alcance de este feature) también lo consumía y se hubiera roto el build; `PARK_ENERGY_WEEKLY` sí se eliminó por completo (sin otros consumidores)

**Checkpoint**: User Story 1 funcional y testeable de forma independiente — MVP entregable.

---

## Phase 4: User Story 2 - Manejo de meses sin valor cargado (Priority: P2)

**Goal**: Un mes con `energiaMesKwh` nulo/ausente no rompe el gráfico ni oculta los demás meses, y se distingue visualmente de "generó 0 kWh".

**Independent Test**: Cargar un parque cuya serie tenga algún mes con `energiaMesKwh` nulo y verificar que el gráfico renderiza los demás meses normalmente y señaliza el mes faltante de forma distinta a un valor real de 0.

### Tests for User Story 2

- [X] T012 [P] [US2] Test: `getRealParkEnergySeries` conserva la distinción entre "mes con `energiaMesKwh` nulo" y "mes con `energiaMesKwh: 0`" vía campo `hasData` en `tests/lib/park-energy-series.test.ts` (incluido en T005 desde el inicio, no fue necesario ampliarlo después)

### Implementation for User Story 2

- [X] T013 [US2] `ParkEnergyRow` en `lib/park-energy-series.ts` incluye `hasData: boolean` (`energiaMesKwh !== null && !== undefined`), sin romper el tipo consumido por `ParkEnergyBarChart` (se extendió `ParkEnergyTotalRow` con `hasData?: boolean` opcional, retrocompatible)
- [X] T014 [US2] `components/charts/ParkEnergyBarChart.tsx`: tooltip muestra "Sin dato" en vez de "0 kWh" cuando `hasData === false`, y la barra de ese mes se pinta con `var(--border)` (atenuada) en vez del color normal

**Checkpoint**: User Stories 1 y 2 funcionan juntas de forma independiente.

---

## Phase 5: User Story 3 - Falla o demora en la consulta de energía (Priority: P3)

**Goal**: Si la consulta de energía falla, el gráfico muestra un estado de error distinguible del estado "sin datos", con opción de reintentar.

**Independent Test**: Simular una falla en `listEnergia` (mock de red) y verificar que la vista de performance muestra un estado de error con reintento, no el estado vacío ni un gráfico roto.

### Tests for User Story 3

- [~] T015 [P] [US3] **Omitido** — mismo motivo que T007 (sin infra de component testing; presentacional, exenta por Principio III). Verificado manualmente: `loadRegistrosEnergia` en `app/gdd/performance/page.tsx` captura cualquier error no-`UnauthorizedError` y devuelve `registros: null`, que `ParkPerformanceView` renderiza como estado de error (no vacío) — revisar con quickstart.md paso 3.5

### Implementation for User Story 3

- [X] T016 [US3] `app/gdd/performance/page.tsx`: `loadRegistrosEnergia` envuelve `listEnergia` en try/catch — `UnauthorizedError` redirige a login (mismo patrón que `loadContext`), cualquier otro error devuelve `{ registros: null }` en vez de lanzar
- [X] T017 [US3] Estado de error con botón "Reintentar" (`router.refresh()`, patrón ya usado en `GddViewHeader`/`GddPageHeading`) en `components/gdd/ParkPerformanceView.tsx`, distinto del estado vacío (`energiaLoadFailed = registrosEnergia === null`)

**Checkpoint**: Las tres user stories funcionan de forma independiente y en conjunto.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T018 [P] `eslint`/`tsc --noEmit` sobre los archivos tocados: 0 errores nuevos (2 fallas preexistentes en `MonetaryBarChart.tsx`/`figma-flow-builder.ts`/`ParkEnergyBarChart.tsx:156` confirmadas ya presentes en `main` antes de este feature, via `git stash`). `next build` falla por el mismo error preexistente de `MonetaryBarChart.tsx` (no tocado por este feature) — no se pudo confirmar un build 100% verde en este entorno; ver Notas
- [~] T019 **Parcial** — corrí `vitest run` (46/46 verde) desde este entorno; la validación manual en `/gdd/performance` contra un backend real (pasos 3-4 de quickstart.md) NO se pudo ejecutar acá por falta de `HINS_API_BASE_URL`/backend disponible (mismo bloqueo que T001)
- [X] T020 Verificado con `grep` global: sin referencias muertas a `getParkEnergySeries`/`getParkEnergyChartSubtitle`/`PARK_ENERGY_WEEKLY` en el repo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — correr primero, bloquea todo lo demás si la forma real difiere de la asumida
- **Foundational (Phase 2)**: depende de Setup — bloquea las tres user stories
- **User Story 1 (Phase 3)**: depende de Foundational — sin dependencia de US2/US3
- **User Story 2 (Phase 4)**: depende de Foundational; en la práctica se apoya en los mismos archivos que tocó US1 (`ParkPerformanceView.tsx`, `lib/park-energy-series.ts`) pero es conceptualmente independiente y testeable por separado
- **User Story 3 (Phase 5)**: depende de Foundational; T016/T017 se apoyan en el wiring de página/vista que dejó US1 (T008, T010)
- **Polish (Phase 6)**: depende de las user stories que se decida entregar

### Parallel Opportunities

- T003 y T005 (tests foundational) en paralelo entre sí
- T007 puede escribirse en paralelo a T003/T005 (archivos distintos)
- T012 y T015 en paralelo entre sí (amplían archivos de test distintos/secciones distintas)
- T018 en paralelo con T019/T020 si hay más de una persona

---

## Parallel Example: Foundational

```bash
Task: "Test listEnergia forma real + null-safety en tests/lib/api/energia-roi-mantenimiento.test.ts"
Task: "Test getRealParkEnergySeries (orden, dedupe, slice, null) en tests/lib/park-energy-series.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001 — confirmar contrato real, puede cambiar T002-T006 si difiere)
2. Phase 2: Foundational (T002-T006)
3. Phase 3: User Story 1 (T007-T011)
4. **STOP y VALIDAR**: correr quickstart.md pasos 2-3 contra un parque real
5. Deploy/demo — el mock mensual ya está fuera del código (FR-008 cumplido)

### Incremental Delivery

1. Setup + Foundational → base lista
2. User Story 1 → validar → MVP entregable (gráfico real, estado vacío, sin mock)
3. User Story 2 → validar → manejo de meses sin dato
4. User Story 3 → validar → estado de error con retry
5. Polish (Phase 6)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- Escribir cada test y verificar que falla antes de implementar (Principio III)
- T001 es un gate real: si la forma del endpoint difiere de la asumida en research.md, actualizar `data-model.md`/`contracts/get-parque-energia.md` y ajustar T002/T004/T006 antes de seguir
- No tocar `RegistrarEnergiaDto`, `registrarEnergia`, ni los tests de roi/mantenimiento — fuera de alcance (research.md Decision 2)
- `app/gdc/performance` y `app/gdcv/performance` quedan fuera de alcance (no usan `ParkPerformanceView`)
- **Riesgos abiertos tras la implementación**: (1) T001/T019 no verificados contra backend real en este entorno — correr antes de mergear; (2) `next build` falla por un error de tipos preexistente en `components/charts/MonetaryBarChart.tsx` no relacionado a este feature (confirmado con `git stash` contra `main`) — no bloquea este trabajo pero bloquea un build limpio del repo hasta que se arregle aparte
