# Implementation Plan: Vista DIA real + KPI 1M desde datos de 6M

**Branch**: `004-daily-monthly-energy-view` | **Date**: 2026-07-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-daily-monthly-energy-view/spec.md`

## Summary

La pestaña DIA del detalle de parque hoy renderiza una curva horaria 100% mock (`getDailyGenerationData24`); pasa a consultar `GET /parques/{parqueId}/energia?periodo=AAAA-MM-DD` y mostrar los totales reales del día (energía generada, ingreso) con estados real/vacío/error, sin inventar granularidad horaria. La pestaña 1M, que hoy queda vacía, se resuelve sin pedido nuevo: filtra el registro del mes calendario actual dentro de la misma serie mensual (`RegistroEnergiaMensual[]`) ya usada por 6M/1A/TODO. 1A y TODO no cambian — ya reusan esa misma serie.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js App Router (React 19)

**Primary Dependencies**: Next.js, React, Tailwind CSS, shadcn/Radix UI (ya en el stack) — sin dependencias nuevas

**Storage**: N/A (consumo de API HINS existente vía `apiFetch`)

**Testing**: Vitest (`npm run test`) — unit tests para funciones de transformación en `lib/`

**Target Platform**: Web (Next.js Server + Client Components)

**Project Type**: Web app (proyecto único Next.js, sin frontend/backend separados en este repo)

**Performance Goals**: Igual al resto de pestañas de energía ya implementadas (002/003) — respuesta percibida <3s (SC-001), sin requisitos nuevos de throughput.

**Constraints**: No romper el contrato existente de `ParkPerformanceView`/`GddPerformanceView` (alias) ni de `SocioPerformanceView` si llegara a compartir la lógica; mantener Server Component para fetch inicial y Client Component solo donde ya existía interactividad (selector de día).

**Scale/Scope**: Cambio acotado a la vista de detalle de parque: 1 endpoint nuevo de consumo, 1 tipo nuevo, ajustes en 2-3 archivos de `lib/`, 1 componente de vista, 1 page.tsx.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: Se agrega `RegistroEnergiaDia` (forma real de `?periodo=AAAA-MM-DD`) como tipo único de fuente de verdad en `lib/api/types.ts`, sin `any`; el límite externo (respuesta HTTP) ya pasa por `apiFetch` con tipado genérico. PASS.
- **II. Component & Server/Client Boundary Discipline**: El fetch por día se dispara desde el Server Component `app/gdd/performance/page.tsx` (patrón ya usado por `loadRegistrosEnergiaDiaria`); el cambio de día seleccionado sigue siendo estado de cliente en `ParkPerformanceView`, que ya es `"use client"`. Como cambiar de día requiere refetch por día, Phase 0 decide si eso se resuelve con Route Handler (fetch client-side vía boundary propio) en vez de recargar la página completa. PASS condicionado a Decision 2 de research.md.
- **III. Test-First**: Las funciones nuevas de transformación (mapeo de `RegistroEnergiaDia`, filtro del mes actual sobre `RegistroEnergiaMensual[]`) se escriben con test Vitest primero, mismo patrón que `lib/park-energy-series.ts` (ya tiene tests en `tests/lib/`). PASS.
- **IV. Consistent, Accessible UI**: Reusa `CardWithResponsiveTabs`, `KpiPrimary`/`KpiSecondary`, estados de error/vacío ya estandarizados en 002/003 — sin componentes nuevos ad-hoc. PASS.
- **V. Simplicity & Reviewable Change**: Sin dependencias nuevas; cambio acotado a las pestañas DIA/1M, sin tocar 6M/1A/TODO (ya correctos). PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-daily-monthly-energy-view/
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
├── api/
│   ├── types.ts                 # + RegistroEnergiaDia
│   └── energia.ts                # + getEnergiaDelDia(parqueId, periodo)
├── park-energy-series.ts         # + getRegistroDelMesActual(registros, periodoActual)
                                   # + mapeo de RegistroEnergiaDia a totales de la pestaña DIA

components/gdd/
└── ParkPerformanceView.tsx       # pestaña DIA consume dato real; pestaña 1M usa registro del mes actual

app/gdd/performance/
└── page.tsx                      # agrega carga de energía del día seleccionado (Route Handler, ver research.md)

tests/lib/
└── park-energy-series.test.ts    # getRegistroDelMesActual, mapeo de RegistroEnergiaDia
```

**Structure Decision**: Proyecto único Next.js App Router existente (`app/`, `components/`, `lib/`, `tests/`) — no se introduce una nueva carpeta de proyecto ni servicio separado. Todo el cambio vive dentro de la vista de detalle de parque ya existente (`components/gdd/ParkPerformanceView.tsx`, reusada como `GddPerformanceView` vía alias) y su capa de datos (`lib/api/energia.ts`, `lib/park-energy-series.ts`).

## Complexity Tracking

*Sin violaciones de Constitution Check — tabla no aplica.*
