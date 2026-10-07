---
description: "Task list for feature implementation"
---

# Tasks: Layout Contenido del Diálogo de Histórico de Socio

**Input**: Design documents from `/specs/011-socio-historico-dialog-layout/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md (sin data-model.md/contracts/ — cambio puramente de presentación)

**Tests**: No incluidos — cambio de presentación pura (CSS/estructura), exento de Constitution Principio III. Validación vía `tsc`/`lint`/manual (quickstart.md).

**Organization**: Una sola user story (US1, P1) — spec.md no define una segunda historia independiente.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No se requiere inicialización — repo, dependencias y patrón de layout (`lib/dialog-layout.ts`) ya existen.

*(Sin tareas — se omite Phase 1.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No hay prerequisito bloqueante compartido más allá de leer el patrón ya existente (`TermsAndConditionsDialog.tsx`) — no se crean tipos ni funciones nuevas antes de la user story.

*(Sin tareas — se omite Phase 2.)*

---

## Phase 3: User Story 1 - Ver el histórico sin que rompa el diseño de la página (Priority: P1) 🎯 MVP

**Goal**: El diálogo es más grande, permanece contenido en la pantalla, y cada una de las tres tablas tiene su propio scroll independiente (FR-001 a FR-005).

**Independent Test**: Abrir el histórico de un socio con muchas filas en más de un tipo, confirmar que el diálogo no desborda la ventana y que el scroll de una tabla no mueve las otras secciones.

### Implementation for User Story 1

- [X] T001 [US1] En `components/gdcv/SocioHistoricoDialog.tsx`, importar `DIALOG_BODY_SCROLL` y `DIALOG_HEADER_FLUSH` desde `@/lib/dialog-layout`, y cambiar el `className` de `DialogContent` de `"sm:max-w-[600px]"` a un layout flush con límite de alto y ancho mayor: `"flex max-h-[min(90vh,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"` (mismo patrón que `components/legal/TermsAndConditionsDialog.tsx`, ver research.md).
- [X] T002 [US1] En `components/gdcv/SocioHistoricoDialog.tsx`, envolver `DialogHeader` (con el título) en `className={DIALOG_HEADER_FLUSH}` para que quede fuera del área de scroll, y envolver el resto del contenido actual (selector de rango + las tres secciones) en un `<div className={DIALOG_BODY_SCROLL}>` (bloquea que el body completo pueda scrollear si el diálogo no entra en `max-h`, sin afectar aún el scroll por tabla — eso es T003).
- [X] T003 [US1] En `components/gdcv/SocioHistoricoDialog.tsx`, dentro de `HistoricoSectionResult`, envolver el `<Table>` (rama con `rows.length > 0`) en un contenedor `<div className="max-h-64 overflow-y-auto overflow-x-auto rounded-md border">` para que cada tabla tenga su propio scroll vertical y horizontal independiente de las otras secciones y del body general (FR-003, FR-004, FR-005) — no aplica a las ramas `idle`/`loading`/`error`/"sin datos" (no tienen tabla que desbordar).
- [ ] T004 [US1] Verificar visualmente (`npm run dev`, quickstart.md) que con datos reales (rango con muchas filas en Registros y Facturación simultáneamente) el diálogo no desborda la ventana y que hacer scroll en una tabla no mueve las otras — ajustar el valor de `max-h-64` en T003 si dos o tres tablas con pocas filas se ven excesivamente comprimidas o vacías de espacio.

**Checkpoint**: User Story 1 completa — layout contenido, verificable manualmente.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de calidad y alineación con constitution/spec.

- [X] T005 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run test` (suite completa) y confirmar que no se introducen errores/regresiones nuevas respecto al estado previo del repo (Principio V) — este cambio no debería afectar ningún test existente (es puramente de clases/estructura JSX).
- [ ] T006 Seguir quickstart.md → "Validación manual end-to-end" contra el backend real en `http://localhost:3000` y confirmar SC-001, SC-002, SC-003, incluyendo el caso de ventana angosta (FR-005) y el de un histórico sin datos junto a otros con muchas filas (Edge case).

---

## Dependencies & Execution Order

- **User Story 1 (Phase 3)**: T001 antes de T002 (T002 depende de que `DialogContent` ya tenga la estructura flex/flush de T001). T003 depende de T002 (el scroll por tabla vive dentro del body scrollable). T004 es verificación manual, depende de T001-T003 completos.
- **Polish (Phase 5)**: depende de que Phase 3 esté completa.

## Parallel Execution Examples

- Ninguna — todas las tareas de Phase 3 tocan el mismo archivo y son secuenciales por naturaleza (cada una depende de la estructura dejada por la anterior).

## Implementation Strategy

**MVP = User Story 1 (única historia de esta spec)**: T001-T004 entregan el fix completo solicitado.

1. Completar User Story 1 (T001-T004) → validar independientemente (quickstart.md).
2. Completar Polish (T005-T006).
