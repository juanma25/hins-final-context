# Implementation Plan: Creación Automática de Parque al Crear Proyecto

**Branch**: `007-auto-create-parque` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-auto-create-parque/spec.md`

## Summary

Al crear un proyecto exitosamente desde `createProyectoAction`, el sistema debe invocar automáticamente `createParque` con `proyectoId` del proyecto recién creado, `potenciaTotalKwp: 0` y `fechaPuestaEnMarcha` igual a `proyecto.fechaAlta`. Si la creación del parque falla, el proyecto ya creado se conserva y se devuelve un resultado que indica éxito parcial (proyecto creado, parque no) para que la UI lo notifique. El nombre "del parque" no se persiste — se deriva mostrando `proyecto.nombre` dondequiera que la UI liste parques por proyecto (ya soportado por `getPrimaryParque`/`listParquesByProyecto`).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js App Router (React 19)

**Primary Dependencies**: Next.js Server Actions, existing `lib/api/*` fetch wrappers (`apiFetch`), Vitest for tests

**Storage**: N/A (remoto vía API REST — backend en `http://localhost:3000`, ver `contracts/openapi.json` existente en el repo)

**Testing**: Vitest (`npm run test` / `vitest run`), siguiendo el patrón de `tests/lib/api/proyectos.test.ts` y `tests/app/gdcv/socios-actions.test.ts`

**Target Platform**: Web (Next.js server actions ejecutando server-side; consumido desde el formulario de alta de proyecto en `app/main`)

**Project Type**: Web application (single Next.js project, no frontend/backend split — el "backend" es un servicio externo ya integrado vía `lib/api`)

**Performance Goals**: La creación del parque debe completarse como parte de la misma acción de alta (mismo round-trip percibido por el usuario, sin polling); no hay requisito de throughput adicional más allá del ya existente para alta de proyectos.

**Constraints**: No modificar el contrato de `CreateParqueDto` (fijo por el backend); no romper `getPrimaryParque`/`listParquesByProyecto` ya usados en el resto de la app; no revertir el proyecto si el parque falla (ver FR-004).

**Scale/Scope**: Cambio acotado a `app/main/actions.ts` (y su tipo de resultado) más tests correspondientes; no requiere nuevas rutas ni nuevos endpoints.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — reutiliza `CreateParqueDto`/`Parque`/`Proyecto` ya tipados en `lib/api/types.ts`; sin `any` nuevo.
- **II. Component & Server/Client Boundary Discipline**: PASS — la creación de parque se agrega dentro de `createProyectoAction`, que ya es un Server Action (`"use server"`); no se introduce fetch client-side.
- **III. Test-First for Data & Business Logic**: APLICA — `createProyectoAction` orquesta lógica de negocio (creación encadenada + manejo de fallo parcial); se escriben tests (Red) antes de modificar la acción (Green), siguiendo el patrón de `tests/app/gdcv/socios-actions.test.ts`.
- **IV. Consistent, Accessible UI**: APLICA parcialmente — si la UI de alta de proyecto muestra el resultado, la notificación de fallo parcial debe reusar el patrón de toast/alert existente en el formulario, no un componente nuevo. Se verifica en implementación, no bloquea el plan.
- **V. Simplicity & Reviewable Change**: PASS — cambio mínimo, sin nuevas dependencias, sin abstracciones especulativas (no se crea una "capa de orquestación" genérica; se encadena la llamada directamente en la acción existente).

No violations. Complexity Tracking no aplica.

## Project Structure

### Documentation (this feature)

```text
specs/007-auto-create-parque/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
└── main/
    ├── actions.ts        # createProyectoAction — se extiende para encadenar createParque
    └── page.tsx          # consumidor de la acción (posible ajuste de UI para fallo parcial)

lib/
└── api/
    ├── proyectos.ts       # createProyecto (sin cambios)
    ├── parques.ts         # createParque, listParquesByProyecto, getPrimaryParque (sin cambios de contrato)
    └── types.ts            # CreateProyectoDto, Proyecto, CreateParqueDto, Parque (sin cambios)

tests/
└── app/
    └── main/
        └── actions.test.ts   # nuevo — cubre encadenamiento y fallo parcial
```

**Structure Decision**: Proyecto Next.js único ya existente (Option 1 adaptada a App Router). No se agregan directorios nuevos de alto nivel; el cambio vive en `app/main/actions.ts` con su test en `tests/app/main/actions.test.ts`, siguiendo la ubicación en espejo usada por `tests/app/gdcv/socios-actions.test.ts`.

## Complexity Tracking

*No violations — sección no aplica.*
