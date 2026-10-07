---

description: "Task list for 004-daily-monthly-energy-view"
---

# Tasks: Vista DIA real + KPI 1M desde datos de 6M

**Input**: Design documents from `/specs/004-daily-monthly-energy-view/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/get-parque-energia-dia.md, quickstart.md

**Tests**: Incluidos para funciones de transformación de datos, por Constitución Principio III (Test-First para lógica de negocio, NON-NEGOTIABLE). UI de presentación queda exenta.

**Organization**: Tareas agrupadas por user story (spec.md) para implementación y prueba independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1 (DIA real), US2 (1M real), US3 (error DIA)

## Path Conventions

Proyecto único Next.js App Router (ver plan.md → Project Structure): `app/`, `components/`, `lib/`, `tests/` en la raíz del repo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Sin inicialización de proyecto nueva — stack, lint y test runner ya existen (Constitución: sin dependencias nuevas).

- [X] T001 Confirmar que `npm run test` y `npm run build` corren limpios en la base actual antes de empezar (baseline, sin cambios de código)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo y wrapper de API compartidos por US1 y US2 — deben existir antes de tocar el componente de vista

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta cerrar esta fase

- [X] T002 [P] Agregar tipo `RegistroEnergiaDia` en `lib/api/types.ts` (campos `capturadoEn`, `energiaDiaKwh`, `ingresoDia`, `energiaTotalKwh`, `energiaInyectadaDiaKwh`, `energiaConsumidaDiaKwh`, todos `number | null` salvo `capturadoEn: string`) — ver `data-model.md`
- [X] T003 [P] [US1] Test Vitest en `tests/lib/api/energia.test.ts` para `getEnergiaDelDia(parqueId, periodo)`: pasa `periodo` como query string, devuelve `[]` cuando `apiFetch` resuelve `null` (404) (escribir antes de implementar, Principio III)
- [X] T004 [US1] Implementar `getEnergiaDelDia(parqueId: string, periodo: string): Promise<RegistroEnergiaDia[]>` en `lib/api/energia.ts`, mismo patrón que `listEnergiaDiaria` (depende de T002, T003)

**Checkpoint**: Tipo y wrapper de API listos — las user stories pueden empezar

---

## Phase 3: User Story 1 - Ver datos reales del día en la pestaña DIA (Priority: P1) 🎯 MVP

**Goal**: La pestaña DIA consulta el endpoint diario puntual y muestra los totales reales del día seleccionado, con estados real/vacío, sin curva horaria inventada.

**Independent Test**: Abrir el detalle de un parque con registro real para hoy, ir a la pestaña DIA, verificar que los totales mostrados coinciden con la respuesta del endpoint; cambiar de día y verificar que se refleja el día correcto incluso con cambios rápidos.

### Tests for User Story 1 ⚠️

- [X] T005 [P] [US1] Test Vitest en `tests/lib/park-energy-series.test.ts` para `getRegistroMasRecienteDelDia(registros: RegistroEnergiaDia[])`: array vacío → `null`; un registro → ese registro; varios registros → el de `capturadoEn` más reciente (research.md Decision 2)
- [X] T006 [P] [US1] Test para el Route Handler `app/api/parques/[parqueId]/energia-dia/route.ts` en `tests/app/api/parques/energia-dia.test.ts`: 200 con el registro más reciente, `periodo` faltante → 400, `apiFetch` resuelve `null`/`[]` → 200 con `null` (o 404 explícito, definir en implementación), `UnauthorizedError` → 401

### Implementation for User Story 1

- [X] T007 [US1] Implementar `getRegistroMasRecienteDelDia` en `lib/park-energy-series.ts` para que T005 pase
- [X] T008 [US1] Crear Route Handler `GET` en `app/api/parques/[parqueId]/energia-dia/route.ts`: lee `periodo` de `searchParams`, llama `getEnergiaDelDia`, resuelve con `getRegistroMasRecienteDelDia`, mapea `UnauthorizedError`→401 igual que `app/api/dashboard/context/route.ts` (depende de T004, T007; hace pasar T006)
- [X] T009 [P] [US1] Crear `DailyEnergyTotalsBlock` en `components/charts/DailyEnergyTotalsBlock.tsx`: reusa navegación de día de `DailyGenerationChartBlock` (`DatePicker`, flechas prev/next) pero renderiza totales (`energiaDiaKwh`, `ingresoDia`) en vez de la curva `DailyGenerationChart` — reemplaza el uso de `DailyPoint[]`/mock
- [X] T010 [US1] En `components/gdd/ParkPerformanceView.tsx`: reemplazar el bloque `period === "1d"` (hoy usa `getDailyGenerationData24`/`DailyGenerationChartBlock`) por `DailyEnergyTotalsBlock`, con fetch a `/api/parques/{parque.id}/energia-dia?periodo=<activeDay AAAA-MM-DD>` en un `useEffect` disparado por `activeDay`, usando `AbortController` para descartar respuestas fuera de orden (FR-008) (depende de T008, T009)
- [X] T011 [US1] En `components/gdd/ParkPerformanceView.tsx`: manejar estado "sin datos para este día" (respuesta `null`/vacía) mostrando el mismo patrón de mensaje vacío ya usado por 6M/1A/TODO (depende de T010)
- [X] T012 [US1] Eliminar el import y uso de `getDailyGenerationData24`, `getDailyPeak`, `getDailyTotal`, `MOCK_TODAY` (donde ya no haga falta) y `formatDailyPeakLabel`/`formatChartDayLong` que solo servían al mock, dejando `activeDay` como único estado de día real (depende de T010, T011)

**Checkpoint**: Pestaña DIA funcional con datos reales, independiente de US2/US3

---

## Phase 4: User Story 2 - Ver el valor del mes actual en la pestaña 1M (Priority: P1)

**Goal**: La pestaña 1M muestra el registro mensual real del mes calendario actual, tomado de la misma serie ya cargada para 6M, sin pedido nuevo al backend.

**Independent Test**: Abrir un parque cuya serie mensual incluya el mes actual, ir a la pestaña 1M, verificar que el valor coincide con el último punto de 6M. Repetir sin registro del mes actual y verificar estado "sin datos".

### Tests for User Story 2 ⚠️

- [X] T013 [P] [US2] Test Vitest en `tests/lib/park-energy-series.test.ts` para `getRegistroDelMesActual(registros: RegistroEnergiaMensual[], periodoActual: string)`: registro presente → lo devuelve; ausente → `null`; `energiaMesKwh` nulo → devuelve el registro igual (no lo trata como "sin dato", ver Edge Case de spec.md)

### Implementation for User Story 2

- [X] T014 [US2] Implementar `getRegistroDelMesActual` en `lib/park-energy-series.ts` para que T013 pase (research.md Decision 4)
- [X] T015 [US2] En `components/gdd/ParkPerformanceView.tsx`: en la rama `period === "1m"`, usar `getRegistroDelMesActual(registrosEnergia ?? [], periodoActual)` en vez de `getRealParkEnergySeries` (que hoy devuelve `[]` para `"1m"`) para poblar `chartData`/el valor mostrado (depende de T014)
- [X] T016 [US2] Mostrar estado "sin datos este mes" en la pestaña 1M cuando `getRegistroDelMesActual` devuelve `null`, reusando el mismo componente de estado vacío que 6M/1A/TODO (depende de T015)

**Checkpoint**: Pestañas DIA (US1) y 1M (US2) funcionales de forma independiente; 1A/TODO sin cambios (research.md Decision 5, verificado — no requiere tarea)

---

## Phase 5: User Story 3 - Falla en la consulta de energía del día (Priority: P3)

**Goal**: La pestaña DIA distingue un error de carga de un día sin datos, con opción de reintentar.

**Independent Test**: Simular que el fetch a `/api/parques/{id}/energia-dia` falla (network error o 5xx) y verificar que se muestra un estado de error distinto del estado vacío, con botón de reintentar.

### Implementation for User Story 3

- [X] T017 [US3] En `components/gdd/ParkPerformanceView.tsx`: capturar el caso de fetch fallido (catch del `fetch`/response no-2xx distinto de 404) en un estado `"error"` separado de `"empty"`, con el mismo patrón de mensaje + botón "Reintentar" (`router.refresh()` o re-disparar el `useEffect`) ya usado en la rama `energiaLoadFailed` de 6M (depende de T010, T011)

**Checkpoint**: Las 3 user stories funcionan de forma independiente y en conjunto

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y limpieza — cubre SC-001..SC-004 de spec.md

- [X] T018 [P] Actualizar el comentario JSDoc de `registrosEnergiaDiaria`/`periodoActual` en `ParkPerformanceView.tsx` que hoy dice "vista diaria sigue en datos mock" — ya no aplica tras US1
- [X] T019 Ejecutar `npm run test` y `npm run build` — deben pasar sin warnings nuevos
- [X] T020 Ejecutar manualmente el checklist de `quickstart.md` (pestañas DIA, 1M, 1A, TODO) contra un parque real — NOTA: no verificable en este entorno (requiere backend HINS real + browser); código listo, validación manual pendiente del usuario

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Setup — bloquea US1 (T004 requiere T002/T003)
- **US1 (Phase 3)**: Depende de Foundational (T004, T002)
- **US2 (Phase 4)**: Independiente de Foundational más allá de tipos ya existentes (`RegistroEnergiaMensual` ya existe) — puede correr en paralelo con US1 una vez cerrada Phase 2
- **US3 (Phase 5)**: Depende de US1 (T010, T011) — extiende el mismo bloque de estado de la pestaña DIA
- **Polish (Phase 6)**: Depende de US1 + US2 + US3

### User Story Dependencies

- **US1 (P1)**: Depende de Foundational (T002-T004). Sin dependencia de US2.
- **US2 (P1)**: Depende de Foundational solo por convención de fase; en la práctica solo usa tipos ya existentes (`RegistroEnergiaMensual`) — puede implementarse en paralelo a US1 por otra persona.
- **US3 (P3)**: Depende de US1 (reutiliza el bloque de estado de la pestaña DIA creado en T010/T011).

### Parallel Opportunities

- T002 y T003 en paralelo (archivos distintos)
- T005 y T006 en paralelo (archivos de test distintos)
- T009 en paralelo con T005-T008 (componente de presentación, sin depender del Route Handler hasta integrarse en T010)
- Toda la Phase 4 (US2) en paralelo con Phase 3 (US1) una vez cerrada Phase 2 — tocan funciones distintas en el mismo archivo `lib/park-energy-series.ts`, coordinar merge de T007/T014 si se paralelizan

---

## Parallel Example: Foundational + US1 arranque

```bash
# En paralelo tras cerrar Setup:
Task: "Agregar tipo RegistroEnergiaDia en lib/api/types.ts"
Task: "Test Vitest para getEnergiaDelDia en tests/lib/api/energia.test.ts"

# Luego, en paralelo dentro de US1:
Task: "Test para getRegistroMasRecienteDelDia en tests/lib/park-energy-series.test.ts"
Task: "Test para Route Handler energia-dia en tests/app/api/parques/energia-dia.test.ts"
Task: "Crear DailyEnergyTotalsBlock en components/charts/DailyEnergyTotalsBlock.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational)
2. Completar Phase 3 (US1 — pestaña DIA real)
3. **DETENER y VALIDAR**: pestaña DIA muestra datos reales, estados vacío/día-navegación correctos
4. Deploy/demo si corresponde

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 (DIA real) → validar independiente → demo (MVP, corrige el bug más visible)
3. US2 (1M real) → validar independiente → demo (corrige la pestaña vacía)
4. US3 (error DIA) → validar independiente → demo (refinamiento de confiabilidad)
5. Polish → build/test verde, quickstart validado end-to-end

### Parallel Team Strategy

Con 2 personas: Persona A toma US1 (Phase 3, incluye Foundational primero), Persona B toma US2 (Phase 4) en paralelo tras Foundational — ambas tocan `lib/park-energy-series.ts` en funciones distintas, coordinar el merge. US3 (Phase 5) solo puede empezar cuando US1 esté mergeado.

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- [Story] mapea cada tarea a su user story para trazabilidad
- Tests escritos antes de la implementación correspondiente (Principio III, NON-NEGOTIABLE) — deben fallar antes de T004/T007/T008/T014
- Commitear tras cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la story de forma independiente
- No hay cambios en 1A/TODO (research.md Decision 5) — no se generan tareas para eso, ya está resuelto en el código actual
