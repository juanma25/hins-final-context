---
description: "Task list for feature implementation"
---

# Tasks: Creación Automática de Parque al Crear Proyecto

**Input**: Design documents from `/specs/007-auto-create-parque/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/create-proyecto-action.md, quickstart.md

**Tests**: Incluidos — Constitution Principle III (Test-First for Data & Business Logic) es NON-NEGOTIABLE para `createProyectoAction`, que orquesta lógica de negocio (creación encadenada + fallo parcial).

**Organization**: Tareas agrupadas por user story (spec.md) para permitir implementación y prueba independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 o US2 (spec.md)
- Rutas de archivo exactas incluidas en cada descripción

## Path Conventions

Proyecto Next.js único (ver plan.md → Project Structure): `app/main/actions.ts`, `lib/api/*`, `tests/app/main/actions.test.ts`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No se requiere inicialización de proyecto — repo, dependencias y test runner (Vitest) ya existen.

- [X] T001 Confirmar que `tests/app/main/` no existe aún; crear el directorio `tests/app/main/` si falta, en preparación para el archivo de test de esta feature.

**Checkpoint**: No hay tareas de setup adicionales — continuar directo a Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extender el tipo de resultado compartido por ambas user stories (US1 la usa para `parque`, US2 para `parqueError`). Debe completarse antes de implementar cualquier historia.

**⚠️ CRITICAL**: Ninguna user story puede implementarse hasta terminar esta fase.

- [X] T002 Extender `CreateProyectoActionResult` en `app/main/actions.ts` agregando los campos opcionales `parque?: Parque` y `parqueError?: string`, e importar `Parque` desde `@/lib/api/types` (ver data-model.md → "Resultado de la acción").

**Checkpoint**: Tipo de resultado extendido — US1 y US2 pueden implementarse.

---

## Phase 3: User Story 1 - Alta de proyecto genera su parque automáticamente (Priority: P1) 🎯 MVP

**Goal**: Al crear un proyecto exitosamente, el sistema crea automáticamente su parque asociado (mismo `proyectoId`, `potenciaTotalKwp: 0`, `fechaPuestaEnMarcha` = `fechaAlta` del proyecto) sin pasos manuales adicionales (FR-001, FR-002, FR-005, FR-006).

**Independent Test**: Crear un proyecto desde el formulario de alta y verificar que, sin acción adicional, existe un parque asociado a ese proyecto (vía `getPrimaryParque`/`listParquesByProyecto`) con los valores por defecto esperados.

### Tests for User Story 1 (escribir primero, deben fallar antes de implementar)

- [X] T003 [P] [US1] Test "happy path" en `tests/app/main/actions.test.ts`: mockear `createProyecto` (retorna `Proyecto` con `fechaAlta` fija) y `createParque` (retorna `Parque`); llamar `createProyectoAction`; assertar que `createParque` fue invocado con `{ proyectoId: proyecto.id, potenciaTotalKwp: 0, fechaPuestaEnMarcha: proyecto.fechaAlta }` y que el resultado es `{ proyecto, parque }` sin `error` ni `parqueError` (ver contracts/create-proyecto-action.md, caso "Happy path").

### Implementation for User Story 1

- [X] T004 [US1] En `app/main/actions.ts`, importar `createParque` desde `@/lib/api/parques` y, dentro de `createProyectoAction`, tras obtener `proyecto` exitosamente, invocar `createParque({ proyectoId: proyecto.id, potenciaTotalKwp: 0, fechaPuestaEnMarcha: proyecto.fechaAlta })` y retornar `{ proyecto, parque }` cuando esta llamada tenga éxito (bloquea T003 en verde).
- [X] T005 [US1] Verificar (manualmente, sin modificar código) que `getPrimaryParque`/`listParquesByProyecto` en `lib/api/parques.ts` siguen resolviendo correctamente el parque recién creado por `proyectoId` — no requiere cambios de código, solo confirma que FR-002/FR-007 quedan satisfechos por el código ya existente.
- [X] T006 [P] [US1] Si `app/main/page.tsx` muestra el resultado de `createProyectoAction`, actualizar el consumo para leer también `result.parque` y mostrar el nombre del parque como `proyecto.nombre` (FR-003) donde corresponda en la UI ya existente — reusar componentes shadcn/Radix existentes (Principio IV), sin crear componentes nuevos.

**Checkpoint**: User Story 1 completa y probable de forma independiente — proyecto + parque se crean juntos con valores por defecto correctos.

---

## Phase 4: User Story 2 - Manejo de fallo al crear el parque (Priority: P2)

**Goal**: Si la creación del proyecto tiene éxito pero la del parque falla, el proyecto se conserva y el usuario es notificado del fallo parcial (FR-004).

**Independent Test**: Simular un error en `createParque` (mock que rechaza o retorna `null`) y verificar que `createProyectoAction` retorna el `proyecto` ya creado junto con `parqueError`, sin lanzar excepción ni perder el proyecto.

### Tests for User Story 2 (escribir primero, deben fallar antes de implementar)

- [X] T007 [P] [US2] Test "proyecto OK, parque falla" en `tests/app/main/actions.test.ts`: mockear `createProyecto` con éxito y `createParque` para que rechace (throw) o retorne `null`; assertar que el resultado es `{ proyecto, parqueError: <string> }`, que `proyecto` está presente, y que no se lanza excepción fuera de la función (ver contracts/create-proyecto-action.md, caso "Proyecto OK, parque falla").
- [X] T008 [P] [US2] Test de regresión "falla creación de proyecto" en `tests/app/main/actions.test.ts`: mockear `createProyecto` para que rechace o retorne `null`; assertar que el resultado es `{ error: <string> }`, sin `proyecto`, sin `parque`, sin `parqueError`, y que `createParque` NO fue invocado (ver contracts/create-proyecto-action.md, caso "Falla creación de proyecto").

### Implementation for User Story 2

- [X] T009 [US2] En `app/main/actions.ts`, envolver la llamada a `createParque` (agregada en T004) en su propio `try/catch` (o verificación de `null`) independiente del `try/catch` de `createProyecto`, de modo que un fallo en `createParque` retorne `{ proyecto, parqueError: error instanceof Error ? error.message : "Error al crear el parque" }` en lugar de propagar la excepción (bloquea T007 y T008 en verde).
- [X] T010 [P] [US2] Si `app/main/page.tsx` consume el resultado de la acción, agregar el manejo de `result.parqueError` reusando el patrón de notificación/alerta ya existente en el formulario (Principio IV: no introducir componente nuevo) para informar al usuario que el proyecto se creó pero el parque no.

**Checkpoint**: User Story 2 completa — fallo parcial no revierte el proyecto y es comunicado al usuario.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de calidad y alineación con constitution/spec.

- [X] T011 Ejecutar `npm run test -- tests/app/main/actions.test.ts` y confirmar los 3 casos de contracts/create-proyecto-action.md en verde.
- [X] T012 Ejecutar `npm run lint` y `npm run build` (o `tsc --noEmit`) sobre el repo completo y confirmar que pasan sin errores (Principio V).
- [ ] T013 Seguir quickstart.md → "Validación manual end-to-end" y "Validación de fallo parcial" contra el backend real en `http://localhost:3000` y confirmar SC-001, SC-002, SC-003.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → sin dependencias externas.
- **Foundational (Phase 2)**: T002 depende de Setup (T001) solo por orden de directorio, no por contenido; bloquea Phase 3 y Phase 4.
- **User Story 1 (Phase 3)**: depende de Foundational (T002). T003 antes de T004 (test-first). T005 es solo verificación, sin dependencia de código. T006 depende de T004.
- **User Story 2 (Phase 4)**: depende de Foundational (T002) y de la llamada a `createParque` introducida en T004 (US1), ya que T009 modifica ese mismo bloque de código. T007/T008 antes de T009 (test-first). T010 depende de T009.
- **Polish (Phase 5)**: depende de que Phase 3 y Phase 4 estén completas.

**Nota de independencia**: Aunque US2 depende técnicamente del código agregado en T004 (mismo archivo, mismo bloque), es independientemente *probable y entregable*: T007/T008 pueden escribirse en paralelo a T003, y US2 puede implementarse (T009) inmediatamente después de T004 sin esperar a T005/T006.

## Parallel Execution Examples

- Dentro de Phase 3: T003 y T006 pueden avanzar en paralelo una vez exista T002 (T006 no depende del contenido final de T004, solo de la forma del resultado ya fijada en T002).
- Dentro de Phase 4: T007 y T008 son `[P]` entre sí (mismo archivo de test pero casos independientes — coordinar merge si se editan en paralelo el mismo archivo).
- Entre historias: T003 (test US1) y T007/T008 (tests US2) pueden escribirse en paralelo por ser aserciones sobre comportamientos distintos, aunque compartan archivo de test.

## Implementation Strategy

**MVP = User Story 1 (Phase 1 + 2 + 3)**: entrega el flujo principal solicitado (creación automática del parque). User Story 2 (fallo parcial) es un incremento de robustez que puede entregarse inmediatamente después sin retrabajo de US1.

1. Completar Setup + Foundational (T001-T002).
2. Completar User Story 1 (T003-T006) → validar independientemente (quickstart.md, sección end-to-end) → MVP entregable.
3. Completar User Story 2 (T007-T010) → validar independientemente (quickstart.md, sección fallo parcial).
4. Completar Polish (T011-T013).
