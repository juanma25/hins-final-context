---

description: "Task list for feature implementation"
---

# Tasks: KPI "Energía Generada" del mes actual (datos reales)

**Input**: Design documents from `/specs/003-monthly-generation-kpi/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/get-parque-energia-diaria.md](contracts/get-parque-energia-diaria.md), [quickstart.md](quickstart.md)

**Tests**: Incluidos — Principio III (Test-First, NON-NEGOTIABLE) exige tests antes de implementación para toda lógica de transformación/agregación de datos de dominio.

**Scope real**: Solo la card `KpiPrimary` "Generada en Abril" dentro de `components/gdd/ParkPerformanceView.tsx` (vía alias `GddPerformanceView`) y `app/gdd/performance/page.tsx`. No toca el gráfico de barras mensual ni la tabla de historial, ya resueltos en `specs/002-park-energy-chart`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: A qué user story pertenece (US1, US2, US3)

---

## Phase 1: Setup

- [~] T001 **NO EJECUTABLE en este entorno** — mismo bloqueo que `002-park-energy-chart` T001 (sin `HINS_API_BASE_URL`/backend real en sandbox). Implementado con la forma asumida en research.md Decision 1. **Pendiente**: correr `curl` per [quickstart.md](quickstart.md) paso 1 antes de mergear.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo de lectura diaria, acceso a datos y funciones puras de agregación que las tres user stories comparten.

**⚠️ CRITICAL**: Ninguna user story puede completarse sin esta fase.

- [X] T002 Agregar tipo `RegistroEnergiaDiario` (`{ fecha: string; energiaDiaKwh: number | null; ingresoDia: number | null }`) en `lib/api/types.ts`
- [X] T003 [P] Test: `listEnergiaDiaria(parqueId, periodo)` construye la URL con query param `periodo` y devuelve `[]` cuando `apiFetch` resuelve `null`, en `tests/lib/api/energia-roi-mantenimiento.test.ts` (ampliado)
- [X] T004 Agregar `listEnergiaDiaria(parqueId, periodo): Promise<RegistroEnergiaDiario[]>` en `lib/api/energia.ts` (`/parques/${parqueId}/energia?periodo=${periodo}`) — pasa T003
- [X] T005 [P] Test: `getMonthlyGenerationTotal`/`getMonthlySparklinePoints` (vacío, suma con null→0, dedupe por `fecha`, orden ascendente, null no corta la sparkline) en `tests/lib/park-energy-series.test.ts` (ampliado)
- [X] T006 `getMonthlyGenerationTotal`/`getMonthlySparklinePoints` en `lib/park-energy-series.ts` (helper `sortByFechaAscDeduped` propio, mismo patrón que `sortByPeriodoAscDeduped`) — pasa T005
- [X] T007 `getMonthNameEs(periodo: string): string` en `lib/format-periodo.ts` (reusa `MONTH_NAMES_ES`, antes privado como `MONTH_NAMES` — exportado sin otros consumidores afectados). Recibe `periodo` ("YYYY-MM"), no `Date`: el mes se calcula una vez en el Server Component (`currentPeriodo()`) y se pasa como prop, evitando desajuste de "hoy" entre servidor y cliente

**Checkpoint**: Tipo, acceso a datos y agregación listos — las user stories pueden implementarse.

---

## Phase 3: User Story 1 - Ver el total de energía generada del mes actual con datos reales (Priority: P1) 🎯 MVP

**Goal**: La card destacada "Energía Generada" muestra el total real del mes calendario actual (suma de `energiaDiaKwh`), con título dinámico, en vez del valor mock `830,17`.

**Independent Test**: Abrir `/gdd/performance?proyectoId=<id>` para un parque con registros diarios reales del mes en curso y ver que el total de la card coincide con la suma manual de la respuesta del endpoint; probar un parque sin registros este mes y ver 0.

### Implementation for User Story 1

- [X] T008 [US1] `currentPeriodo()` + `loadRegistrosEnergiaDiaria(parqueId, periodo)` en `app/gdd/performance/page.tsx` (mismo patrón try/catch que `loadRegistrosEnergia`), corriendo en paralelo con `loadRegistrosEnergia` vía `Promise.all`
- [X] T009 [US1] `registrosEnergiaDiaria` + `periodoActual` pasados como props a `GddPerformanceView`/`ParkPerformanceView`
- [X] T010 [US1] `ParkPerformanceView.tsx`: `highlightAprilCardMock.kwh` reemplazado por `getMonthlyGenerationTotal(...)`, título dinámico vía `getMonthNameEs(periodoActual)`; agregado además estado de error distinguible (`monthlyGenerationFailed`, FR-006) que muestra "—" y "No se pudo cargar este mes" — no estaba explícito en este task originalmente pero lo exigía spec FR-006

**Checkpoint**: User Story 1 funcional y testeable de forma independiente — MVP entregable.

---

## Phase 4: User Story 2 - Ver la tendencia diaria del mes en la sparkline (Priority: P2)

**Goal**: La sparkline de la card refleja un punto por cada día real del mes en curso, ordenado cronológicamente, sin puntos inventados ni cortes por días con dato nulo.

**Independent Test**: Cargar un parque con varios días de datos reales y verificar que la sparkline tiene exactamente N puntos en orden cronológico; un día con `energiaDiaKwh` nulo no corta la serie.

### Implementation for User Story 2

- [X] T011 [US2] `generationSparklinePoints.map(...)` reemplazado por `getMonthlySparklinePoints(registrosEnergiaDiaria ?? [])` como `sparklineData` de `KpiPrimary` (`[]` cuando `monthlyGenerationFailed`)

**Checkpoint**: User Stories 1 y 2 funcionan juntas de forma independiente.

---

## Phase 5: User Story 3 - Comparación contra el inicio de operaciones (Priority: P3)

**Goal**: El texto comparativo ("X kWh desde el Inicio") sigue presente como excepción mock documentada, sin mezclarse de forma engañosa con el dato real ya migrado (total/sparkline).

**Independent Test**: Revisar la card tras el cambio y confirmar que el texto comparativo sigue ahí (mock) mientras el total y la sparkline ya son reales, sin inconsistencia visual ni afirmación de que ese texto es un dato real.

### Implementation for User Story 3

- [X] T012 [US3] Documentado en JSDoc de `ParkPerformanceViewProps.registrosEnergiaDiaria` y comentario inline junto a `highlightAprilCardMock.compareBadge` que ese texto sigue mock por falta de endpoint de acumulado histórico

**Checkpoint**: Las tres user stories funcionan de forma independiente y en conjunto.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T013 [P] `tsc --noEmit` limpio en archivos tocados (0 errores nuevos); `eslint` limpio salvo warning preexistente `chartSubtitle` (de `002-park-energy-chart`, no tocado por esta feature); `next build` falla por el mismo error preexistente de `MonetaryBarChart.tsx` confirmado ajeno (no se repitió el `git stash` porque ya está documentado en `002-park-energy-chart/tasks.md`)
- [~] T014 **Parcial** — `vitest run` 60/60 verde desde este entorno; validación manual en `/gdd/performance` contra backend real (quickstart pasos 3-4) NO ejecutable acá, mismo bloqueo que T001
- [X] T015 Confirmado: `generationSparklinePoints` solo queda usado por `app/dev/components/page.tsx` (showcase, fuera de alcance); `highlightAprilCardMock.kwh`/`.title` sin consumidores — se dejaron en `data/gdd-performance-mock.ts` sin eliminar (bajo riesgo, no rompen nada; limpieza opcional a futuro si se decide que el showcase tampoco los necesita)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — bloquea todo si la forma real difiere de la asumida
- **Foundational (Phase 2)**: depende de Setup — bloquea las tres user stories
- **User Story 1 (Phase 3)**: depende de Foundational — sin dependencia de US2/US3
- **User Story 2 (Phase 4)**: depende de Foundational y de T010 (misma prop `registrosEnergiaDiaria` y el mismo bloque JSX de la card que dejó US1) — conceptualmente independiente pero comparte archivo
- **User Story 3 (Phase 5)**: depende de T010 — es solo un ajuste de documentación/consistencia, sin lógica nueva
- **Polish (Phase 6)**: depende de las user stories que se decida entregar

### Parallel Opportunities

- T003 y T005 (tests foundational) en paralelo entre sí
- T007 puede escribirse en paralelo a T003/T005/T004/T006 (archivo distinto)
- T013 en paralelo con T014/T015 si hay más de una persona

---

## Parallel Example: Foundational

```bash
Task: "Test listEnergiaDiaria (query param, null-safety) en tests/lib/api/energia-roi-mantenimiento.test.ts"
Task: "Test getMonthlyGenerationTotal + getMonthlySparklinePoints en tests/lib/park-energy-series.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001 — confirmar contrato real)
2. Phase 2: Foundational (T002-T007)
3. Phase 3: User Story 1 (T008-T010)
4. **STOP y VALIDAR**: correr quickstart.md pasos 2-3 contra un parque real
5. Deploy/demo — total real, título dinámico

### Incremental Delivery

1. Setup + Foundational → base lista
2. User Story 1 → validar → MVP entregable (total real)
3. User Story 2 → validar → sparkline real
4. User Story 3 → validar → texto mock documentado, sin ambigüedad
5. Polish (Phase 6)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- Escribir cada test y verificar que falla antes de implementar (Principio III)
- T001 es un gate real: si el query param no cambia la granularidad a diaria, revisar el enfoque completo antes de seguir
- No tocar `registrarEnergia`, el gráfico de barras mensual, ni la tabla de historial — fuera de alcance (ya resueltos en `002-park-energy-chart`)
- `app/dev/components/page.tsx` (showcase) queda fuera de alcance — sigue usando el mock si lo necesita
- **Riesgos abiertos tras la implementación**: (1) T001/T014 no verificados contra backend real en este entorno — correr antes de mergear (curl con `?periodo=` y confirmar que la forma es diaria, no mensual filtrada); (2) `next build` sigue fallando por el error preexistente en `MonetaryBarChart.tsx` (no relacionado, ya reportado en `002-park-energy-chart/tasks.md`)
