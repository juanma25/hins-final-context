---
description: "Task list for feature implementation"
---

# Tasks: Tablas de Histórico por Socio con Campos Específicos

**Input**: Design documents from `/specs/010-socio-historico-tablas/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/date-picker-undefined.md, quickstart.md

**Tests**: Incluidos — Constitution Principle III (Test-First for Data & Business Logic) es NON-NEGOTIABLE para el fix de `DatePicker` (soporte `undefined`) y para las funciones de mapeo fila-cruda → columnas por tipo.

**Organization**: US1 (P1, fix del disparo de consulta) y US2 (P1, tablas con columnas específicas) — ambas P1 por ser correcciones/entregas del mismo pedido bloqueante; US1 es prerequisito funcional real de US2 (sin datos disparados, no hay nada que tabular).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No se requiere inicialización — repo, dependencias y test runner ya existen.

- [X] T001 Crear el directorio `tests/components/ui/` si no existe, en preparación para el test de `DatePicker`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extender `DatePicker` para aceptar `value: Date | undefined` — corrige la causa raíz del bug (research.md) y es prerequisito de ambas user stories (sin esto, US1 no puede corregirse y US2 no tiene datos que mostrar).

**⚠️ CRITICAL**: Ninguna user story puede completarse hasta terminar esta fase.

### Tests (escribir primero, deben fallar antes de implementar)

- [X] T002 [P] En `tests/components/ui/date-picker.test.ts`, testear que `DatePicker` con `value={undefined}` renderiza el `placeholder` (default "Seleccionar fecha") en el trigger en vez de una fecha, y que con `value={someDate}` renderiza `formatLabel(someDate)` (regresión del comportamiento actual).

### Implementation

- [X] T003 En `components/ui/date-picker.tsx`, cambiar `DatePickerProps.value` a `Date | undefined`, agregar `placeholder?: string` (default `"Seleccionar fecha"`), y en el trigger renderizar `placeholder` cuando `value` es `undefined` en vez de `formatLabel(value)`; pasar `selected={value}` (ahora puede ser `undefined`) al `Calendar` interno sin fabricar una `Date` (bloquea T002 en verde).

**Checkpoint**: `DatePicker` soporta "sin selección" de forma honesta — US1 y US2 pueden completarse.

---

## Phase 3: User Story 1 - Cambiar el rango de fechas siempre dispara la consulta (Priority: P1) 🎯 MVP

**Goal**: Al elegir/cambiar cualquiera de las dos fechas y quedar un rango válido, las tres consultas se disparan de inmediato, incluyendo cuando la fecha elegida es "hoy" (el caso que antes fallaba silenciosamente) (FR-001).

**Independent Test**: Abrir el histórico de un socio, elegir "hoy" como "desde" y otra fecha como "hasta" → verificar que las tres consultas se disparan; luego cambiar "desde" a otra fecha → verificar que se vuelven a disparar sin acción adicional.

### Implementation for User Story 1

- [X] T004 [US1] En `components/gdcv/SocioHistoricoDialog.tsx`, reemplazar `<DatePicker value={desde ?? new Date()} ...>` y `<DatePicker value={hasta ?? new Date()} ...>` por `<DatePicker value={desde} placeholder="Desde" ...>` y `<DatePicker value={hasta} placeholder="Hasta" ...>` (ya no se fabrica una fecha de reemplazo, usando el `DatePicker` extendido en T003).

**Checkpoint**: User Story 1 completa — el bug de "nunca dispara consulta" queda corregido, verificable manualmente (quickstart.md, paso 2).

---

## Phase 4: User Story 2 - Ver cada histórico como tabla con sus campos específicos (Priority: P1)

**Goal**: Facturación, Registros y Mediciones se muestran como tablas con las columnas exactas pedidas (FR-002 a FR-006), tolerando campos ausentes por fila.

**Independent Test**: Con un rango que devuelve datos conocidos, verificar que cada histórico se ve como tabla con las columnas de su tipo, una fila por item de `payload`, y que un campo ausente en un item se ve como celda vacía sin romper la fila.

### Tests for User Story 2 (escribir primero, deben fallar antes de implementar)

- [X] T005 [P] [US2] En `tests/components/gdcv/SocioHistoricoDialog.test.ts`, testear `mapFacturacionRow`, `mapRegistroRow` y `mapMedicionRow` (ver data-model.md): (a) un item con todos los campos presentes mapea cada campo a su clave tipada; (b) un item sin uno de los campos esperados mapea ese campo a `undefined` sin lanzar error y sin afectar los demás campos de la misma fila.

### Implementation for User Story 2

- [X] T006 [US2] En `components/gdcv/SocioHistoricoDialog.tsx`, agregar `mapFacturacionRow(item: unknown): FacturacionRow`, `mapRegistroRow(item: unknown): RegistroRow` y `mapMedicionRow(item: unknown): MedicionRow` (ver data-model.md) — cada una lee los campos esperados de `item` con un guard de tipo (`typeof === "string"` u similar) y usa `undefined` cuando el campo no existe o no es del tipo esperado (bloquea T005 en verde).
- [X] T007 [US2] En `components/gdcv/SocioHistoricoDialog.tsx`, reemplazar el bloque `<pre>{JSON.stringify(state.data, ...)}</pre>` de `HistoricoSectionResult` por tres variantes de tabla (reusando `Table`/`TableHeader`/`TableRow`/`TableHead`/`TableBody`/`TableCell` de `components/ui/table.tsx`, mismo patrón que `SociosTable.tsx`): una por tipo de histórico, aplanando todos los items de `payload` de `state.data` en filas vía la función de mapeo correspondiente (T006), y mostrando `"—"` para cualquier campo `undefined` en la celda.

**Checkpoint**: User Story 2 completa — los tres históricos muestran tablas legibles con las columnas pedidas.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de calidad y alineación con constitution/spec.

- [X] T008 Ejecutar `npm run test -- tests/components/ui/date-picker.test.ts tests/components/gdcv/SocioHistoricoDialog.test.ts` y confirmar todos los casos en verde.
- [X] T009 Ejecutar `npm run test` (suite completa), `npm run lint` y `npx tsc --noEmit`, confirmando que no se introducen errores nuevos respecto al estado previo del repo (Principio V) — prestar atención a `DailyEnergyTotalsBlock.tsx`/`DailyGenerationChartBlock.tsx` (únicos otros consumidores de `DatePicker`) para confirmar que no se rompen con el cambio de tipo de `value`.
- [ ] T010 Seguir quickstart.md → "Validación manual end-to-end" contra el backend real en `http://localhost:3000` y confirmar el fix del disparo (paso 2-3) y las tres tablas con datos reales (paso 4-5).

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → sin dependencias externas.
- **Foundational (Phase 2)**: T002 (test-first) antes de T003. Bloquea Phase 3 y Phase 4.
- **User Story 1 (Phase 3)**: T004 depende de T003 (usa la nueva prop `placeholder`/`value: undefined`).
- **User Story 2 (Phase 4)**: T005 (test-first) antes de T006. T007 depende de T006 (usa las funciones de mapeo) y, en la práctica, de T004 (mismo archivo `SocioHistoricoDialog.tsx`) — se recomienda completar Phase 3 antes de Phase 4 aunque ambas dependan solo de Phase 2 en términos de datos.
- **Polish (Phase 5)**: depende de que Phase 3 y Phase 4 estén completas.

## Parallel Execution Examples

- T002 no tiene paralelos previos (primera tarea de test); una vez hecho T003, T004 y T005 podrían escribirse en paralelo si se gestionan con cuidado los conflictos de edición sobre `SocioHistoricoDialog.tsx` (mismo archivo) — en la práctica, secuencial es más seguro dado que ambas tocan el mismo componente.
- T008/T009/T010 son secuenciales entre sí (cada uno valida el resultado del anterior).

## Implementation Strategy

**MVP = User Story 1 (Setup + Foundational + Phase 3)**: corrige el bug bloqueante (ninguna consulta se disparaba) — deja la vista genérica de la feature 009 funcionando de nuevo, aunque sin las columnas específicas todavía.

1. Completar Setup + Foundational (T001-T003).
2. Completar User Story 1 (T004) → validar independientemente (quickstart.md, pasos 2-3) → MVP entregable (bug corregido).
3. Completar User Story 2 (T005-T007) → validar independientemente (quickstart.md, pasos 4-5).
4. Completar Polish (T008-T010).
