---
description: "Task list for feature implementation"
---

# Tasks: Histórico de Registros, Facturación y Mediciones por Socio

**Input**: Design documents from `/specs/009-socio-historico-dialog/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/date-range-validation.md, quickstart.md

**Tests**: Incluidos — Constitution Principle III (Test-First for Data & Business Logic) es NON-NEGOTIABLE para la validación de rango y para los Route Handlers (boundary que traduce errores del backend).

**Organization**: US1 (P1, flujo principal) y US2 (P2, manejo de sin-datos/error) — spec.md.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Crear los directorios de test que faltan.

- [X] T001 Crear `tests/app/api/parques/socios-historico-routes.test.ts` (archivo vacío o con `describe.skip` inicial) y confirmar que `tests/components/gdcv/` ya existe (de la feature 008).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos y capa de acceso a datos compartidos por ambas user stories.

**⚠️ CRITICAL**: Ninguna user story puede implementarse hasta terminar esta fase.

- [X] T002 [P] En `lib/api/types.ts`, agregar `RegistroHistorico`, `FacturacionHistorico` y `MedicionHistorico` (ver data-model.md), con `payload: unknown[]`.
- [X] T003 En `lib/api/socios-historico.ts` (nuevo), agregar `listRegistrosSocio(parqueId, socioId, desde, hasta)`, `listFacturacionSocio(...)` y `listMedicionesSocio(...)`, cada una llamando `apiFetch` a `/parques/${parqueId}/socios/${socioId}/{registros|facturacion|mediciones}?desde=${desde}&hasta=${hasta}` y retornando `[]` si `apiFetch` resuelve `null` (mismo patrón que `lib/api/roi.ts`/`lib/api/energia.ts`). Depende de T002 (tipos).

**Checkpoint**: Tipos y funciones de acceso a datos listos — US1 y US2 pueden implementarse.

---

## Phase 3: User Story 1 - Consultar histórico de un socio filtrando por fecha (Priority: P1) 🎯 MVP

**Goal**: Botón por fila en la tabla de socios que abre un diálogo con selector de rango de fechas; al elegir un rango válido, se consultan y muestran los tres históricos (FR-001 a FR-005, FR-008, FR-009).

**Independent Test**: Clic en el botón de un socio → diálogo con selector de fechas → elegir rango válido → ver los tres históricos mostrados y diferenciados.

### Tests for User Story 1 (escribir primero, deben fallar antes de implementar)

- [X] T004 [P] [US1] En `tests/components/gdcv/SocioHistoricoDialog.test.ts`, testear `isValidHistoricoRange` (ver contracts/date-range-validation.md) cubriendo la tabla completa: ambos undefined → false, solo uno definido → false, hasta < desde → false, hasta >= desde → true.
- [X] T005 [P] [US1] En `tests/app/api/parques/socios-historico-routes.test.ts`, testear el Route Handler de `registros` (mockeando `listRegistrosSocio`): 200 con `desde`/`hasta` presentes → responde el array recibido; sin `desde` o sin `hasta` → responde 400; `UnauthorizedError` → responde 401 (mismo patrón que `tests/app/api/parques/energia-dia.test.ts`).

### Implementation for User Story 1

- [X] T006 [P] [US1] Crear `app/api/parques/[parqueId]/socios/[socioId]/registros/route.ts`, `.../facturacion/route.ts` y `.../mediciones/route.ts` (mismo patrón que `app/api/parques/[parqueId]/energia-dia/route.ts`): leer `desde`/`hasta` de `searchParams`, 400 si falta alguno, llamar a la función correspondiente de `lib/api/socios-historico.ts` (T003), traducir `UnauthorizedError` a 401 y cualquier otro error a 500 (bloquea T005 en verde).
- [X] T007 [US1] Crear `components/gdcv/SocioHistoricoDialog.tsx` con: props `parqueId`, `socioId`, `socioNombre`, `open`, `onOpenChange`; estado de rango (`desde`/`hasta` como `Date | undefined`, dos `DatePicker` reusados de `components/ui/date-picker.tsx`); función exportada `isValidHistoricoRange` (T004); tres estados `HistoricoQueryState` (ver data-model.md) para registros/facturación/mediciones.
- [X] T008 [US1] En `SocioHistoricoDialog.tsx`, al cambiar el rango y que `isValidHistoricoRange` sea `true`, disparar en paralelo (`Promise.allSettled`, no `Promise.all` — ver research.md) fetch a los tres Route Handlers de T006, actualizando cada uno de los tres `HistoricoQueryState` de forma independiente (loading → success/error) sin esperar a los otros dos.
- [X] T009 [US1] En `SocioHistoricoDialog.tsx`, renderizar las tres secciones (Registros, Facturación, Mediciones) claramente diferenciadas (encabezado por sección, ver FR-005), cada una mostrando su propio estado: `idle`/`loading` (spinner o texto), `success` con datos (lista simple/genérica de los items del payload, ver Assumptions de spec.md), o su estado vacío/error (implementados en Fase 4, US2).
- [X] T010 [US1] En `components/gdcv/SociosTable.tsx`, agregar un botón por fila (ícono, junto al menú de acciones existente) que abra `SocioHistoricoDialog` para ese socio (`parqueId`, `socio.id`, `socio.nombre`), disponible para todos los socios (con o sin medidor, FR-009).

**Checkpoint**: User Story 1 completa y probable de forma independiente.

---

## Phase 4: User Story 2 - Manejo de rango sin resultados o con error (Priority: P2)

**Goal**: Cada uno de los tres históricos distingue "sin datos" de "error", y permite reintentar solo el histórico fallido (FR-006, FR-007).

**Independent Test**: Seleccionar un rango sin datos conocidos → ver "sin datos" en ese histórico; simular fallo de un histórico → ver error + reintentar solo en ese histórico, con los otros dos intactos.

### Tests for User Story 2 (escribir primero, deben fallar antes de implementar)

- [X] T011 [P] [US2] En `tests/components/gdcv/SocioHistoricoDialog.test.ts`, agregar tests que, mockeando `fetch` para que un histórico resuelva `[]` y otro rechace, verifiquen que el componente termina en estado `success (data: [])` para el primero y `error` para el segundo, sin que uno afecte al otro (renderizando el componente o testeando el reducer/estado si se extrae aparte).
- [X] T012 [P] [US2] En `tests/app/api/parques/socios-historico-routes.test.ts`, extender los Route Handlers de `facturacion` y `mediciones` con los mismos casos de T005 (200/400/401), confirmando que los tres route handlers son consistentes entre sí.

### Implementation for User Story 2

- [X] T013 [US2] En `SocioHistoricoDialog.tsx`, para cada sección en estado `success` con `data.length === 0`, mostrar un mensaje "Sin datos en el rango seleccionado" distinguible visualmente del estado de error (FR-006, SC-003).
- [X] T014 [US2] En `SocioHistoricoDialog.tsx`, para cada sección en estado `error`, mostrar el mensaje de error y un botón "Reintentar" que vuelve a disparar solo la consulta de esa sección (no las otras dos) reusando la misma función de fetch de T008 (FR-007, SC-004).

**Checkpoint**: User Story 2 completa — comportamiento de "sin datos" vs "error" resuelto para los tres históricos.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de calidad y alineación con constitution/spec.

- [X] T015 Ejecutar `npm run test -- tests/components/gdcv/SocioHistoricoDialog.test.ts tests/app/api/parques/socios-historico-routes.test.ts` y confirmar todos los casos en verde.
- [X] T016 Ejecutar `npm run test` (suite completa), `npm run lint` y `npx tsc --noEmit`, confirmando que no se introducen errores nuevos respecto al estado previo del repo (Principio V).
- [ ] T017 Seguir quickstart.md → "Validación manual end-to-end" contra el backend real en `http://localhost:3000` y confirmar SC-001 a SC-004.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → sin dependencias externas.
- **Foundational (Phase 2)**: T002 → T003 (T003 usa los tipos de T002). Bloquea Phase 3 y Phase 4.
- **User Story 1 (Phase 3)**: T004/T005 (`[P]`, test-first) antes de T006-T010. T006 depende de T003; T007 depende de T004 (usa `isValidHistoricoRange`); T008 depende de T006 y T007; T009 depende de T008; T010 depende de T007 (importa el diálogo).
- **User Story 2 (Phase 4)**: depende de Phase 3 completa (extiende el mismo componente y los mismos route handlers). T011/T012 (test-first) antes de T013/T014.
- **Polish (Phase 5)**: depende de que Phase 3 y Phase 4 estén completas.

## Parallel Execution Examples

- T002 no tiene paralelos previos; una vez hecho, T004 y T005 pueden escribirse en paralelo (archivos de test distintos).
- Los tres Route Handlers de T006 son internamente paralelizables entre sí (archivos distintos, mismo patrón) aunque se liste como una sola tarea por ser casi idénticos.
- T011 y T012 (`[P]`) pueden escribirse en paralelo.

## Implementation Strategy

**MVP = User Story 1 (Phase 1 + 2 + 3)**: entrega el flujo principal (botón → diálogo → rango → tres históricos mostrados), con manejo básico de estados (loading/éxito) aunque sin distinguir aún "sin datos" de "error" de forma pulida.

1. Completar Setup + Foundational (T001-T003).
2. Completar User Story 1 (T004-T010) → validar independientemente (quickstart.md, pasos 1-5) → MVP entregable.
3. Completar User Story 2 (T011-T014) → validar independientemente (quickstart.md, pasos 6-7).
4. Completar Polish (T015-T017).
