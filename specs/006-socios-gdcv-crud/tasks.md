---

description: "Task list for 006-socios-gdcv-crud"
---

# Tasks: Alta y listado real de Socios GDCV

**Input**: Design documents from `/specs/006-socios-gdcv-crud/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/socios.md](./contracts/socios.md), [quickstart.md](./quickstart.md)

**Tests**: Incluidos — Principio III de la constitución (Test-First for Data &
Business Logic, NON-NEGOTIABLE) aplica directamente a `mapSocioToRow` (transforma
datos de dominio) y a la Server Action `createSocioAction`; mismo criterio ya seguido
en `005-gdcv-backend-charts`.

**Organization**: Tasks agrupadas por user story. La Fase 2 (Foundational) incluye el
mapeo de datos y el fetch real de `listSocios`, porque **ambas** historias (US1 y US2)
dependen de que la tabla ya reciba datos reales por props — sin eso, ni el alta (US1)
ni el listado (US2) son verificables. US1 (modal + alta) y US2 (estados vacío/error del
listado real) se mantienen como fases separadas para que cada una sea entregable y
testeable de forma independiente sobre esa base común.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1 (Alta vía modal), US2 (Listado real — estados vacío/error)

## Path Conventions

Proyecto único Next.js App Router — rutas relativas a la raíz del repo, según
`plan.md` → Project Structure.

---

## Phase 1: Setup

**Purpose**: No hay inicialización de proyecto nueva — stack, test runner y Server
Actions ya existen (`app/main/actions.ts`). Esta fase confirma el punto de partida.

- [X] T001 Run `npx tsc --noEmit` and `npm run lint` on current branch tip to confirm a
      clean baseline before touching `components/gdcv/SociosTable.tsx`,
      `components/gdcv/GdcvPerformanceView.tsx`, `app/gdcv/performance/page.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Conectar la tabla de socios a datos reales del backend — sin esto,
ninguna de las dos historias de usuario es verificable independientemente.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational ⚠️

> **Escribir estos tests PRIMERO y verificar que fallan antes de implementar.**

- [X] T002 [P] Create `tests/lib/socio-presentation.test.ts` with cases for
      `mapSocioToRow`: maps `nombre`/`medidorNumero`/`participacionPorcentaje` (as
      `"N%"` string) correctly; sets `potenciaAsociada`, `energiaGenerada`,
      `ahorroGenerado` to `"—"`; sets `medidores` and `tipo` to `undefined`; and for
      `TIPO_CARGO_LABELS` asserts both `CON_POTENCIA`/`SIN_POTENCIA` map to their
      Spanish labels (per data-model.md mapping table)
- [X] T003 [P] Extend `tests/app/gdcv/performance-page.test.ts` with a case mocking
      `listSocios` (via `vi.mock("@/lib/api/socios")`) asserting
      `app/gdcv/performance/page.tsx` passes a `socios: Socio[] | null` prop to
      `GdcvPerformanceView` (same pattern as the existing `registrosEnergia` assertion
      from 005), including a case where `listSocios` throws a non-Unauthorized error
      → `socios: null`, and a case where it throws `UnauthorizedError` → redirect

### Implementation for Foundational

- [X] T004 [P] Create `lib/socio-presentation.ts` with `mapSocioToRow(socio: Socio): SocioRow`
      and `TIPO_CARGO_LABELS: Record<TipoCargo, string>` per data-model.md mapping
      table (depends on T002 failing first)
- [X] T005 Update `app/gdcv/performance/page.tsx`: add `loadSocios(parqueId)` helper
      mirroring `loadRegistrosEnergia`'s error isolation (`UnauthorizedError` →
      `redirect("/login")`, other errors → `{ socios: null }`), call `listSocios` from
      `@/lib/api/socios` in the same `Promise.all` already fetching
      registros/registrosDiaria, and pass `socios` as a new prop to
      `GdcvPerformanceView` (depends on T003 failing first)
- [X] T006 Update `components/gdcv/GdcvPerformanceView.tsx` props interface to accept
      `socios: Socio[] | null` (type from `@/lib/api/types`), map it via
      `mapSocioToRow` (memoized) before passing `data` to `SociosTable`, removing the
      `sociosMock` import for this purpose (depends on T004, T005)

**Checkpoint**: `/gdcv/performance` tabla de socios ya recibe y renderiza datos reales
del backend (sin manejo de estado vacío/error todavía — eso es US2).

---

## Phase 3: User Story 1 - Registrar un nuevo socio desde la vista de performance GDCV (Priority: P1) 🎯 MVP

**Goal**: El botón "Nuevo Socio" abre un modal de alta; al confirmar con datos
válidos, el socio se crea en backend y la tabla se actualiza sin recargar la página.

**Independent Test**: Abrir `/gdcv/performance?proyectoId=<id>`, clic en "Nuevo
Socio", completar el formulario, confirmar, y verificar que el nuevo socio aparece en
la tabla sin recargar — ver [quickstart.md](./quickstart.md) Escenario 1.

### Tests for User Story 1 ⚠️

> **Escribir estos tests PRIMERO y verificar que fallan antes de implementar.**

- [X] T007 [P] [US1] Create `tests/app/gdcv/socios-actions.test.ts` mocking
      `@/lib/api/socios` (`vi.mock`, same pattern as
      `tests/lib/api/energia-roi-mantenimiento.test.ts`), asserting
      `createSocioAction(parqueId, dto)`: (a) returns `{ socio }` on success, (b)
      returns `{ error }` when `createSocio` resolves `null`, (c) returns
      `{ error: error.message }` when `createSocio` throws

### Implementation for User Story 1

- [X] T008 [US1] Create `app/gdcv/socios/actions.ts` (`"use server"`) with
      `createSocioAction(parqueId, dto)` per contracts/socios.md — mirrors
      `app/main/actions.ts` `createProyectoAction` exactly (no `revalidatePath`, per
      research.md Decision 3) (depends on T007 failing first)
- [X] T009 [US1] Create `components/gdcv/CreateSocioDialog.tsx` — Dialog + controlled
      form (`nombre`, `participacionPorcentaje` as number input, `tipoCargo` as a
      `ToggleGroup`/select using `TIPO_CARGO_LABELS` from `lib/socio-presentation.ts`,
      `medidorNumero`), manual validation gating the "Crear" button (mirrors
      `components/main/NewProjectDialog.tsx` structure: `useState` form + `error`
      state + `useTransition`), calling `createSocioAction` on submit, `router.refresh()`
      + close on success, inline error message preserving form data on failure
      (depends on T004, T008)
- [X] T010 [US1] Update `components/gdcv/SociosTable.tsx`: add `onClick` to the
      existing "Nuevo Socio" button (`SociosTable.tsx:358-366`) to open
      `CreateSocioDialog`, managing its `open` state the same way the component
      already manages `medidoresSheetSocio` (local `useState` unless a controlling
      prop is passed) (depends on T009)

**Checkpoint**: Alta de socio funcional end-to-end; verificable con
[quickstart.md](./quickstart.md) Escenarios 1–3.

---

## Phase 4: User Story 2 - Ver el listado real de socios de un parque GDCV (Priority: P1)

**Goal**: La tabla de socios muestra estados explícitos de vacío y error en lugar de
sustituir con `sociosMock`, completando FR-008/FR-009 sobre la base ya conectada en la
Fase 2.

**Independent Test**: Abrir un parque GDCV sin socios y confirmar el estado vacío;
simular una falla de `listSocios` y confirmar el estado de error — ver
[quickstart.md](./quickstart.md) Escenarios 4–6.

### Tests for User Story 2 ⚠️

> **Escribir estos tests PRIMERO y verificar que fallan antes de implementar.**

- [X] T011 [P] [US2] Extend `tests/app/gdcv/performance-page.test.ts` (if not already
      covered by T003) with an explicit case for `listSocios` resolving `[]` →
      `socios: []` passed through unchanged (distinguishing "vacío" from "error: null")

      **Result**: already covered — added as part of T003's extension ("passes
      socios: [] (vacío, distinto de error) when listSocios resolves an empty array").

### Implementation for User Story 2

- [X] T012 [US2] Update `components/gdcv/GdcvPerformanceView.tsx` (or
      `components/gdcv/SociosTable.tsx`, whichever owns the render branch) to show
      "Sin socios registrados para este parque" when `socios` (mapped) is an empty
      array, and "No se pudo cargar el listado de socios." with a retry affordance
      (mirrors the `energiaLoadFailed` branch pattern in `ParkPerformanceView.tsx`)
      when `socios === null` — never falling back to `sociosMock` (depends on T006)

**Checkpoint**: Todos los estados de la tabla de socios (con datos, vacío, error)
verificados contra backend real; verificable con [quickstart.md](./quickstart.md)
Escenarios 4–6.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cierre de calidad transversal, Principio V — `npm run lint` y
`tsc --noEmit` deben pasar antes de merge.

- [X] T013 [P] Run `npx tsc --noEmit` and `npm run lint` on the full repo and fix any
      type/lint errors introduced by T004–T012

      **Result**: no new errors — same 6 pre-existing errors/11 warnings as the
      Phase 1 baseline (unrelated files: MonetaryBarChart.tsx,
      scripts/figma-flow-builder.ts, scripts/flow-from-images.ts,
      components/ui/sidebar.tsx).
- [X] T014 [P] Run `npm run test -- tests/lib/socio-presentation.test.ts
      tests/app/gdcv/socios-actions.test.ts tests/app/gdcv/performance-page.test.ts`
      and confirm all pass

      **Result**: 15/15 passed.
- [ ] T015 Run through [quickstart.md](./quickstart.md) Escenarios 1–6 end to end in
      `npm run dev` against a real or staging backend, confirming SC-001 through
      SC-004 from spec.md

      **Not run in this session**: requires a live/staging backend + browser session,
      unavailable here. All automated checks (T013, T014) pass; pending manual QA
      before merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Phase 1 — **bloquea** US1 y US2
- **User Story 1 (Phase 3)**: Depende de Foundational — independiente de US2
- **User Story 2 (Phase 4)**: Depende de Foundational — independiente de US1 (puede
  correr en paralelo con Phase 3 si hay dos desarrolladores)
- **Polish (Phase 5)**: Depende de Phase 3 y Phase 4 completas

### Within Foundational

- T002, T003 (tests) antes de T004, T005 (implementación)
- T004 (mapeo) y T005 (page.tsx fetch) pueden correr en paralelo — archivos distintos
- T006 depende de T004 y T005 (consume ambos)

### Within User Story 1

- T007 (test) antes de T008 (Server Action)
- T008 antes de T009 (el diálogo llama la action)
- T009 antes de T010 (el botón abre el diálogo ya creado)

### Within User Story 2

- T011 (test) antes de T012 (implementación)

### Parallel Opportunities

- T002 y T003 (Foundational tests, archivos distintos)
- T004 y T005 (Foundational implementación, archivos distintos)
- Toda la Phase 3 (US1) en paralelo con toda la Phase 4 (US2) una vez completada
  Foundational
- T013 y T014 (Polish) en paralelo

---

## Parallel Example: Foundational

```bash
Task: "Create tests/lib/socio-presentation.test.ts covering mapSocioToRow and TIPO_CARGO_LABELS"
Task: "Extend tests/app/gdcv/performance-page.test.ts covering socios prop from listSocios"
```

## Parallel Example: User Story 1 vs User Story 2

```bash
# Con dos desarrolladores, tras completar Foundational:
Developer A: T007 → T008 → T009 → T010  (US1 — alta vía modal)
Developer B: T011 → T012              (US2 — estados vacío/error)
```

---

## Implementation Strategy

### MVP First (Foundational + User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (bloquea todo lo demás)
3. Complete Phase 3: User Story 1
4. **STOP y VALIDAR**: correr [quickstart.md](./quickstart.md) Escenarios 1–3 — esto
   ya resuelve el pedido explícito del usuario ("modal para Nuevo Socio" +
   "actualizar la lista")
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → tabla ya conectada a backend real (sin estados especiales)
2. User Story 1 → alta funcional, validar independientemente → esto ya es el MVP
3. User Story 2 → estados vacío/error explícitos, validar independientemente
4. Polish → gate final de lint/build/tests antes de PR

## Notes

- `lib/api/socios.ts` (`listSocios`, `createSocio`) y los tipos `Socio`/`CreateSocioDto`
  **ya existen** — ninguna task los recrea, solo se consumen (research.md Decision 0
  / auditoría inicial).
- Edición/baja de socios, columnas de energía/ahorro/potencia por socio y
  multi-medidor quedan explícitamente fuera de alcance (data-model.md Out of Scope) —
  no crear tasks para ellas en esta feature.
- Si al ejecutar T015 (quickstart manual) aparece un defecto real, agregar una task
  nueva con `[P]`/`[Story]` correspondiente antes de cerrar esa fase, mismo criterio
  usado en `005-gdcv-backend-charts`.
