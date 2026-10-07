# Implementation Plan: Integración con API Real y Eliminación de Mocks

**Branch**: `001-api-integration-remove-mocks` | **Date**: 2026-07-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-api-integration-remove-mocks/spec.md`

## Summary

Reemplazar todas las fuentes de datos simuladas (`data/*-mock.ts`, constantes de
`lib/park-config.ts`) por consumo real del backend HINS descrito en
`docs/openapi.json`: auth (JWT Bearer), usuarios, proyectos, parques, socios,
dispositivos, alarmas, energía, ROI, mantenimiento y sincronización. Donde el
nombre de un campo/tipo/enum del frontend difiera del contrato, se renombra en
el frontend para igualar el backend (el contrato es la fuente de verdad).
Enfoque técnico: capa de acceso a datos tipada en `lib/api/`, consumida desde
Server Components / Route Handlers / Server Actions (no fetch directo desde
cliente), usando únicamente `fetch` nativo de Next.js — sin nuevas
dependencias de data-fetching.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), Next.js 16 (App Router), React 19

**Primary Dependencies**: Next.js, React, Tailwind CSS 4, shadcn/Radix UI, `@tanstack/react-table`, `date-fns`, `recharts`. Nueva dependencia: ninguna — se usa `fetch` nativo para consumo HTTP.

**Storage**: N/A (el frontend no persiste datos; toda persistencia vive en el backend HINS consumido vía HTTP)

**Testing**: NEEDS CLARIFICATION → no existe test runner instalado en el repo. La Constitución (Principio III) exige tests antes de implementar lógica de dominio (mapeo/validación de datos de API), y marca la instalación de un runner (Vitest o Jest) como prerequisito. Se resuelve en Fase 0 (research.md) qué runner adoptar y cómo integrarlo sin fricción con Next.js 16 / React 19.

**Target Platform**: Next.js App Router, SSR + Route Handlers, navegador moderno (Chrome/Edge/Safari/Firefox recientes)

**Project Type**: Web application (Next.js full-stack: Server Components + Route Handlers como backend-for-frontend hacia el backend HINS externo)

**Performance Goals**: Sin metas de throughput propias (el frontend no es el cuello de botella); las páginas de listado (proyectos, parques, dispositivos, alarmas) deben renderizar en menos de 1s percibido con datos ya cargados en servidor, consistente con SC-005 del spec (errores visibles en <1s).

**Constraints**: Todas las llamadas a endpoints protegidos MUST incluir `Authorization: Bearer <JWT>` (FR-002); sin refresh token en el contrato, por lo que expiración de sesión redirige a login; base URL del backend MUST ser configurable por variable de entorno (hoy `http://localhost:3000` en local, según Assumptions del spec).

**Scale/Scope**: ~10 recursos del dominio (Usuario, Proyecto, Parque, Socio, Dispositivo, Alarma, RegistroEnergia, RegistroRoi, RegistroMantenimiento, ConfiguracionSincronizacion), 20 endpoints, 3 dashboards (GDD, GDC, GDCV) + vista Socio + panel admin (`main`) + sincronización.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|---|---|---|
| I. Type Safety First | Tipos derivados 1:1 de los schemas de `docs/openapi.json` en `types/api/` o `lib/api/types.ts`; sin `any` salvo en el límite de deserialización JSON, con parseo/guard explícito. | PASS (a diseñar en Fase 1 data-model.md) |
| II. Component & Server/Client Boundary Discipline | Toda llamada a los 20 endpoints se hace desde Server Components, Route Handlers o Server Actions en `lib/api/`; componentes cliente reciben datos ya resueltos como props. Reutiliza componentes shadcn/Radix existentes, sin duplicar UI. | PASS |
| III. Test-First for Data & Business Logic (NON-NEGOTIABLE) | Requiere runner de tests inexistente hoy. Se resuelve en Phase 0 (research.md) — instalar Vitest antes de escribir la capa de mapeo/parseo de `lib/api/`, con tests Red→Green para cada función de transformación de datos (fechas, nulabilidad, filtros de alarmas, etc.) antes de implementarla. | GATE CONDICIONADO — bloquea inicio de Fase 2 (tasks) hasta research.md confirmar runner y ubicación de tests. |
| IV. Consistent, Accessible UI | Estados de carga/vacío/error se construyen con componentes shadcn/Radix ya presentes (no nueva librería); accesibilidad (WCAG 2.1 AA) se mantiene igual que en las pantallas actuales, solo cambia el origen del dato. | PASS |
| V. Simplicity & Reviewable Change | Sin nuevas dependencias (fetch nativo, sin axios/react-query); cambio se divide en PRs por dominio (auth, proyectos/parques, dispositivos/alarmas, energía/roi/mantenimiento, sincronización) siguiendo las prioridades P1/P2/P3 del spec. | PASS |

No hay violaciones de constitución que requieran justificación en Complexity Tracking — la única condición abierta (runner de test) se resuelve en Phase 0, no es una violación sino un prerequisito ya anticipado por la propia Constitución.

### Post-Design Re-check (tras Phase 1)

| Principio | Estado tras diseño |
|---|---|
| I. Type Safety First | PASS — `data-model.md` fija tipos 1:1 con `contracts/openapi.json`, sin `any`. |
| II. Component & Server/Client Boundary Discipline | PASS — `research.md` §2 confirma todo fetch server-side vía `lib/api/client.ts` + Route Handler solo para `Set-Cookie` en login. |
| III. Test-First for Data & Business Logic | PASS — `research.md` §1 resuelve el runner (Vitest); `quickstart.md` incluye `pnpm test` como gate de verificación. |
| IV. Consistent, Accessible UI | PASS — sin nuevos componentes de UI, se reutiliza lo existente para estados carga/vacío/error. |
| V. Simplicity & Reviewable Change | PASS — única dependencia nueva es Vitest (devDependency, no runtime); sin capas de mapeo permanentes (research.md §4). |

Todos los gates PASS. Listo para `/speckit-tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/001-api-integration-remove-mocks/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command) — copia anotada del contrato consumido
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Next.js App Router — proyecto único (frontend que consume backend externo vía HTTP)
lib/
├── api/
│   ├── client.ts            # wrapper fetch: base URL, Bearer token, manejo 401/403/404
│   ├── types.ts              # tipos TS 1:1 con schemas de docs/openapi.json
│   ├── auth.ts                # login/register/token storage
│   ├── usuarios.ts
│   ├── proyectos.ts
│   ├── parques.ts
│   ├── socios.ts
│   ├── dispositivos.ts
│   ├── alarmas.ts
│   ├── energia.ts
│   ├── roi.ts
│   ├── mantenimiento.ts
│   └── sincronizacion.ts
├── park-config.ts             # SE ELIMINA (constantes reemplazadas por datos reales de /parques)
└── ...(resto de utils sin cambios)

app/
├── main/                      # dashboard admin: proyectos/parques — consume lib/api/proyectos.ts, parques.ts
├── gdd/ gdc/ gdcv/             # dashboards por modelo de negocio — consumen lib/api/{dispositivos,alarmas,energia,roi,mantenimiento}.ts
├── gdcv/socio/                 # vista Socio, scoped por participación — mismo lib/api, filtrado por rol
└── api/
    └── auth/
        ├── login/route.ts      # Route Handler: único proxy necesario — setea cookie httpOnly (research.md §2)
        └── register/route.ts   # Route Handler: idem, para registro

data/
├── new-project-mock.ts         # SE MANTIENE (solo enum de tipos de proyecto, sin datos de ejemplo)
└── *-mock.ts (resto)           # SE ELIMINAN tras reemplazo por lib/api/*

tests/
└── lib/api/                    # unit tests de parseo/transformación (Vitest), Red antes de cada función
```

**Structure Decision**: Proyecto único Next.js (Option 1 adaptada) — no hay backend propio que construir, el "backend" es externo (`docs/openapi.json`). Se agrega una capa `lib/api/` como único punto de acceso HTTP, consumida desde Server Components/Route Handlers, respetando el límite server/client de la Constitución (Principio II). No se introduce carpeta `backend/` porque el backend ya existe y es externo.

## Complexity Tracking

> No hay violaciones de Constitution Check que requieran justificación. Tabla omitida.
