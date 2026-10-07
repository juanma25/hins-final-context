---
description: "Task list for feature implementation"
---

# Tasks: Campos No. Suministro y No. Contrato al Crear Socio (DIMMs)

**Input**: Design documents from `/specs/008-socio-dimms-fields/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/create-socio-form.md, quickstart.md

**Tests**: Incluidos — Constitution Principle III (Test-First for Data & Business Logic) es NON-NEGOTIABLE para la regla de validación condicional (medidor dispara obligatoriedad de suministro/contrato).

**Organization**: Una sola user story (US1, P1) — la spec no define una segunda historia independiente.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No se requiere inicialización — repo, dependencias y test runner ya existen.

- [X] T001 Crear el directorio `tests/components/gdcv/` si no existe, en preparación para el test de esta feature.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extender los tipos compartidos (`CreateSocioDto`, `Socio`) que la única user story necesita. Debe completarse antes de implementar la historia.

- [X] T002 En `lib/api/types.ts`, agregar `suministroNumero: string` y `contratoNumero: string` a `CreateSocioDto` (después de `medidorNumero`) y a `Socio` (después de `medidorNumero`), ver data-model.md.

**Checkpoint**: Tipos extendidos — US1 puede implementarse.

---

## Phase 3: User Story 1 - Alta de socio captura No. de Suministro y No. de Contrato junto al No. de Medidor (Priority: P1) 🎯 MVP

**Goal**: El formulario de alta de socio agrega "No. de Suministro" y "No. de Contrato"; "No. de Medidor" deja de ser obligatorio por sí mismo y pasa a exigir los otros dos solo cuando se completa (FR-001 a FR-005).

**Independent Test**: Abrir el formulario de alta de socio, completar nombre/participación/tipo de cargo, dejar medidor vacío y confirmar (debe permitir); luego completar medidor sin suministro/contrato y confirmar (debe bloquear); luego completar los tres y confirmar (debe crear el socio con los tres valores).

### Tests for User Story 1 (escribir primero, deben fallar antes de implementar)

- [X] T003 [P] [US1] Crear `tests/components/gdcv/CreateSocioDialog.test.ts` con tests para la función de validación pura (a extraer en T004) cubriendo la tabla de `contracts/create-socio-form.md`: (a) los tres vacíos → válido, (b) medidor completo + suministro/contrato completos → válido, (c) medidor completo + suministro vacío → inválido con mensaje sobre "No. de Suministro", (d) medidor completo + contrato vacío → inválido con mensaje sobre "No. de Contrato", (e) medidor completo + ambos vacíos → inválido.
- [X] T004 [P] [US1] Extender `tests/app/gdcv/socios-actions.test.ts` (regresión, sin romper tests existentes) agregando `suministroNumero`/`contratoNumero` al `dto` y al `socio` mockeado en los tests existentes, y un test nuevo que confirme que `createSocioAction` reenvía `suministroNumero`/`contratoNumero` tal cual los recibe (sin filtrarlos), igual que ya hace con `medidorNumero`.

### Implementation for User Story 1

- [X] T005 [US1] En `components/gdcv/CreateSocioDialog.tsx`, extraer una función pura exportada `getSocioFormValidationError(formData)` (ver data-model.md) que implemente la regla: campos base (nombre/participación/tipoCargo) obligatorios como hoy; si `medidorNumero.trim() !== ""`, exigir `suministroNumero` y `contratoNumero` no vacíos, devolviendo el mensaje correspondiente; en cualquier otro caso, `null` (bloquea T003 en verde).
- [X] T006 [US1] En `components/gdcv/CreateSocioDialog.tsx`, agregar `suministroNumero` y `contratoNumero` a `SocioFormData` y `EMPTY_FORM`, agregar los dos inputs de texto (mismo patrón `label` + `Input` que "No. de Medidor") en el JSX del diálogo, y reemplazar la validación inline de `handleCreate` por una llamada a `getSocioFormValidationError` (de T005), usando su resultado para `setError`/bloquear el submit.
- [X] T007 [US1] En `components/gdcv/CreateSocioDialog.tsx`, actualizar `handleCreate` para construir el `dto` enviado a `createSocioAction` incluyendo `medidorNumero`, `suministroNumero` y `contratoNumero` con `.trim()` aplicado (cadena vacía `""` cuando el usuario no los completó, ver research.md), y actualizar `isFormValid` para que ya no exija `medidorNumero` por sí mismo (bloquea T004 en verde vía `socios-actions.test.ts` y satisface FR-002).

**Checkpoint**: User Story 1 completa y probable de forma independiente.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de calidad y alineación con constitution/spec.

- [X] T008 Ejecutar `npm run test -- tests/components/gdcv/CreateSocioDialog.test.ts tests/app/gdcv/socios-actions.test.ts` y confirmar todos los casos de contracts/create-socio-form.md en verde.
- [X] T009 Ejecutar `npm run test` (suite completa), `npm run lint` y `npx tsc --noEmit` y confirmar que no se introducen errores nuevos respecto al estado previo del repo (Principio V).
- [ ] T010 Seguir quickstart.md → "Validación manual end-to-end" contra el backend real en `http://localhost:3000` y confirmar SC-001, SC-002, SC-003, SC-004.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → sin dependencias externas.
- **Foundational (Phase 2)**: T002 bloquea toda la Phase 3 (los tipos deben existir antes de usarlos en el componente o en los tests).
- **User Story 1 (Phase 3)**: T003 y T004 (`[P]`, archivos distintos) antes de T005-T007 (test-first). T005 antes de T006 (T006 consume la función extraída en T005). T007 depende de T006 (mismo bloque `handleCreate`/`isFormValid`).
- **Polish (Phase 4)**: depende de que Phase 3 esté completa.

## Parallel Execution Examples

- T003 y T004 pueden escribirse en paralelo (archivos de test distintos, sin dependencia entre sí).
- T005 depende de T003 en verde/rojo (test-first), pero no depende de T004; T006/T007 son secuenciales entre sí por editar el mismo componente.

## Implementation Strategy

**MVP = User Story 1 completa (única historia de esta spec)**: Setup + Foundational + Phase 3 entregan el flujo completo solicitado.

1. Completar Setup + Foundational (T001-T002).
2. Completar User Story 1 (T003-T007) → validar independientemente (quickstart.md).
3. Completar Polish (T008-T010).
