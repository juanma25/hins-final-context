# Implementation Plan: Campos No. Suministro y No. Contrato al Crear Socio (DIMMs)

**Branch**: `008-socio-dimms-fields` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-socio-dimms-fields/spec.md`

## Summary

`CreateSocioDialog` (`components/gdcv/CreateSocioDialog.tsx`) agrega dos campos de texto libre — "No. de Suministro" y "No. de Contrato" — junto al ya existente "No. de Medidor". "No. de Medidor" deja de ser obligatorio por sí mismo: la validación del formulario pasa a exigir los tres juntos solo si el usuario completa "No. de Medidor" (FR-002/FR-005). Se extiende `CreateSocioDto`/`Socio` en `lib/api/types.ts` con `suministroNumero`/`contratoNumero` (tipados como `string`, ya que la API los declara requeridos), y cuando el usuario no ingresa medidor, los tres campos se envían como cadena vacía `""` (única representación de "sin dato" compatible con el tipo `string` requerido por el contrato de la API — ver research.md).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js App Router (React 19)

**Primary Dependencies**: Server Action existente `createSocioAction` (`app/gdcv/socios/actions.ts`), componente cliente `CreateSocioDialog` (shadcn `Input`/`Dialog`/`ToggleGroup`), Vitest

**Storage**: N/A (remoto vía API REST en `http://localhost:3000`, endpoint `POST /parques/{parqueId}/socios`)

**Testing**: Vitest, siguiendo `tests/app/gdcv/socios-actions.test.ts` ya existente (se extiende, no se reemplaza)

**Target Platform**: Web (formulario de alta de socio, hoy únicamente montado bajo `app/gdcv/...`)

**Project Type**: Web application (mismo proyecto Next.js único que el resto del repo)

**Performance Goals**: Sin cambios de performance; el alta sigue siendo una sola llamada `POST` como hoy.

**Constraints**: No romper el contrato `CreateSocioDto` (fijo por backend, ambos campos nuevos `string` requeridos); no introducir selector de "modelo" ni de "API" en el formulario (FR-004 — DIMMs no es visible en UI); mantener compatibilidad con socios ya creados sin estos campos (Socio existente puede no tener `suministroNumero`/`contratoNumero` en datos históricos, aunque el tipo los declare requeridos por venir siempre del backend en altas nuevas).

**Scale/Scope**: Cambio acotado a `lib/api/types.ts`, `components/gdcv/CreateSocioDialog.tsx`, y sus tests; no se toca `app/gdcv/socios/actions.ts` (ya reenvía el DTO completo sin filtrar campos) ni el endpoint.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — se extiende `CreateSocioDto`/`Socio` en `lib/api/types.ts` (única fuente de verdad ya existente); sin `any`.
- **II. Component & Server/Client Boundary Discipline**: PASS — el cambio vive en el Client Component `CreateSocioDialog` (ya `"use client"`) y reutiliza el Server Action `createSocioAction` sin alterar el límite servidor/cliente.
- **III. Test-First for Data & Business Logic**: APLICA — la nueva regla de validación condicional (medidor dispara suministro/contrato obligatorios) es lógica de negocio extraída a una función pura testeable; se escribe test (Red) antes de implementar (Green).
- **IV. Consistent, Accessible UI**: PASS — los dos campos nuevos reusan el mismo patrón `label` + `Input` shadcn ya usado para "No. de Medidor"; no se crea componente nuevo.
- **V. Simplicity & Reviewable Change**: PASS — cambio mínimo en un componente y un archivo de tipos existentes, sin nuevas dependencias ni abstracciones (la validación condicional se extrae como función pura simple, no como un "framework" de validación).

No violations. Complexity Tracking no aplica.

## Project Structure

### Documentation (this feature)

```text
specs/008-socio-dimms-fields/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/
└── api/
    └── types.ts                          # CreateSocioDto, Socio — se agregan suministroNumero, contratoNumero

components/
└── gdcv/
    └── CreateSocioDialog.tsx             # UI + validación condicional (medidor → suministro/contrato obligatorios)

app/
└── gdcv/
    └── socios/
        └── actions.ts                    # createSocioAction — sin cambios (ya reenvía el DTO completo)

tests/
├── app/
│   └── gdcv/
│       └── socios-actions.test.ts        # sin cambios de comportamiento nuevo (regresión)
└── components/
    └── gdcv/
        └── CreateSocioDialog.test.ts     # nuevo — cubre la validación condicional extraída
```

**Structure Decision**: Proyecto Next.js único ya existente. La lógica de validación condicional (FR-005) se extrae a una función pura exportada desde `components/gdcv/CreateSocioDialog.tsx` (o un módulo hermano si crece) para poder testearla sin renderizar el componente, siguiendo Principio III.

## Complexity Tracking

*No violations — sección no aplica.*
