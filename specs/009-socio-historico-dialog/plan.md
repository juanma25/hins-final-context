# Implementation Plan: Histórico de Registros, Facturación y Mediciones por Socio

**Branch**: `009-socio-historico-dialog` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-socio-historico-dialog/spec.md`

## Summary

Se agrega un botón de acción por fila en `SociosTable` (`components/gdcv/SociosTable.tsx`) que abre un nuevo `SocioHistoricoDialog` con un selector de rango de fechas (reusando `DatePicker`/`Calendar` ya existentes). Al confirmarse un rango válido (`desde`/`hasta`, `desde <= hasta`), el diálogo consulta en paralelo tres nuevos Route Handlers (`app/api/parques/[parqueId]/socios/[socioId]/{registros,facturacion,mediciones}/route.ts`) que actúan como boundary servidor/cliente (mismo patrón que `energia-dia/route.ts`) hacia `lib/api/socios-historico.ts` (nuevo), el cual llama a los tres endpoints backend confirmados. Cada uno de los tres históricos se muestra y maneja su estado (cargando/sin datos/error+reintentar) de forma independiente entre sí (FR-006, FR-007).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js App Router (React 19)

**Primary Dependencies**: shadcn `Dialog`/`Calendar`/`Popover` (via `DatePicker` existente), `@tanstack/react-table` (ya usado en `SociosTable`), Vitest

**Storage**: N/A (remoto vía API REST en `http://localhost:3000`; nuevos endpoints confirmados: `GET /parques/{parqueId}/socios/{socioId}/registros`, `/facturacion`, `/mediciones`, todos con query params `desde`/`hasta`)

**Testing**: Vitest, siguiendo el patrón de `tests/app/api/parques/[parqueId]/energia-dia/route.test.ts` (Route Handler) y tests existentes de componentes en `tests/components/gdcv/`

**Target Platform**: Web — diálogo montado desde `SociosTable`, hoy usado en `GdcvPerformanceView`/`app/gdcv/performance`

**Project Type**: Web application (mismo proyecto Next.js único)

**Performance Goals**: Las tres consultas se disparan en paralelo (no en cascada) al confirmar un rango, para que el tiempo de espera percibido sea el de la consulta más lenta, no la suma de las tres.

**Constraints**: No exponer el token de sesión del backend al cliente — las tres consultas deben pasar por Route Handlers (Principio II), igual que `energia-dia`; el payload de cada item histórico es `type: object` sin esquema fijo por el backend (ver research.md) — no se puede tipar su contenido interno de forma estricta.

**Scale/Scope**: Nuevo `lib/api/socios-historico.ts`, 3 Route Handlers, 1 componente de diálogo nuevo (`SocioHistoricoDialog`), 1 botón nuevo en `SociosTable`, tipos nuevos en `lib/api/types.ts` (`RegistroHistorico`, `FacturacionHistorico`, `MedicionHistorico`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — se agregan tipos `RegistroHistorico`/`FacturacionHistorico`/`MedicionHistorico` en `lib/api/types.ts` con `payload: unknown[]` explícito (única forma honesta de tipar un contenido de esquema libre confirmado por la API — ver research.md), documentado como excepción permitida ("verified external-data boundary").
- **II. Component & Server/Client Boundary Discipline**: PASS — las tres consultas pasan por Route Handlers nuevos (mismo patrón que `energia-dia/route.ts`), nunca `apiFetch` directo desde el diálogo cliente.
- **III. Test-First for Data & Business Logic**: APLICA — la validación del rango de fechas (desde <= hasta) y el mapeo de datos/estados del diálogo son lógica testeable; se escriben tests antes de implementar.
- **IV. Consistent, Accessible UI**: PASS — se reutilizan `Dialog`, `DatePicker`/`Calendar`, `Button` y el patrón de estado "sin datos"/"error + reintentar" ya usado en `SociosTable` (`loadFailed`/`onRetry`).
- **V. Simplicity & Reviewable Change**: PASS — un diálogo, un archivo de tipos extendido, tres route handlers casi idénticos al patrón ya existente; sin nuevas dependencias.

No violations. Complexity Tracking no aplica.

## Project Structure

### Documentation (this feature)

```text
specs/009-socio-historico-dialog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
lib/
└── api/
    ├── types.ts                                   # + RegistroHistorico, FacturacionHistorico, MedicionHistorico
    └── socios-historico.ts                         # nuevo — listRegistrosSocio/listFacturacionSocio/listMedicionesSocio

app/
└── api/
    └── parques/
        └── [parqueId]/
            └── socios/
                └── [socioId]/
                    ├── registros/route.ts           # nuevo — boundary GET con desde/hasta
                    ├── facturacion/route.ts         # nuevo
                    └── mediciones/route.ts          # nuevo

components/
└── gdcv/
    ├── SociosTable.tsx                              # + botón "Ver histórico" por fila
    └── SocioHistoricoDialog.tsx                      # nuevo — selector de rango + 3 secciones de resultado

tests/
├── app/
│   └── api/
│       └── parques/
│           └── socios-historico-routes.test.ts       # nuevo
└── components/
    └── gdcv/
        └── SocioHistoricoDialog.test.ts               # nuevo
```

**Structure Decision**: Proyecto Next.js único existente. Se replica el patrón ya usado para `energia-dia` (Route Handler por consulta con filtro) en vez de crear un mecanismo genérico de "proxy con query params", siguiendo Principio V (no abstracción especulativa).

## Complexity Tracking

*No violations — sección no aplica.*
