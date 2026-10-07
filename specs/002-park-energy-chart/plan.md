# Implementation Plan: Gráfico de Energía del Parque (datos reales)

**Branch**: `002-park-energy-chart` | **Date**: 2026-07-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-park-energy-chart/spec.md`

## Summary

Reemplazar la serie mensual mock (`getParkEnergySeries` en `data/gdd-performance-mock.ts`) del gráfico de energía en `ParkPerformanceView` por datos reales leídos de `GET /parques/{parqueId}/energia`. La respuesta real observada tiene forma `{ periodo: "YYYY-MM"; energiaMesKwh; ingresoMes }`, distinta del tipo `RegistroEnergia` hoy codeado (`energiaInyectadaKwh`/`energiaGeneradaKwh`/...) — se introduce un tipo de lectura nuevo y una función pura de mapeo/rango (patrón ya usado en `lib/roi-kpis.ts`), sin tocar el DTO de escritura existente. El fetch sube al Server Component que ya resuelve `parque` (`app/gdd/performance/page.tsx` y equivalentes gdc/gdcv), pasando los datos por props al client component existente.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router (repo existente)

**Primary Dependencies**: Next.js, React, Recharts (`ParkEnergyBarChart` ya existente), Tailwind/shadcn — sin dependencias nuevas

**Storage**: N/A (consume API HTTP backend HINS vía `apiFetch`)

**Testing**: Vitest (`vitest.config.ts`, `tests/lib/**` ya existente)

**Target Platform**: Web (Next.js SSR/CSR híbrido)

**Project Type**: Web application (single Next.js app, sin frontend/backend separados en este repo)

**Performance Goals**: Cambio de rango del gráfico refleja datos reales en <2s en condiciones normales de red (SC-003)

**Constraints**: No romper `RegistrarEnergiaDto`/POST ni sus tests existentes; no introducir mock nuevo; 1D fuera de alcance (FR-009)

**Scale/Scope**: 1 vista (`ParkPerformanceView`, reusada en gdd/gdc/gdcv vía alias), un endpoint GET, hasta ~N meses por parque (bajo volumen, sin paginación esperada)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Aplica | Cumplimiento planeado |
|---|---|---|
| I. Type Safety First | Sí | Tipo nuevo de lectura (`RegistroEnergiaMensual`) como single source-of-truth, sin `any`; boundary externo (respuesta HTTP) validado en el punto de parseo de `lib/api/energia.ts` (ver research.md Decision 1/2) |
| II. Server/Client Boundary | Sí | Fetch de energía sube al Server Component de página (mismo patrón que `parque` hoy); `ParkPerformanceView` sigue siendo client component pero recibe los datos por props, no hace fetch propio |
| III. Test-First (NON-NEGOTIABLE) | Sí | Función pura de mapeo/rango escrita test-first (Vitest ya disponible); tests existentes de `lib/api/energia.ts` no deben romperse |
| IV. Consistent, Accessible UI | Sí | Reusa `ParkEnergyBarChart`/`ChartContainer` existentes sin estilos ad-hoc; estados vacío/error reusan componentes ya usados en dashboards |
| V. Simplicity & Reviewable Change | Sí | Cambio acotado a: 1 tipo nuevo, 1 función de mapeo, actualización de `listEnergia`, wiring en Server Component + prop nueva en `ParkPerformanceView`; elimina el mock (FR-008) en vez de dejarlo en paralelo |

Sin violaciones — no se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/api/
├── types.ts                    # + RegistroEnergiaMensual (nuevo, lectura); RegistrarEnergiaDto/RegistroEnergia (escritura) sin cambios
└── energia.ts                  # listEnergia() actualizado a la forma real de lectura

lib/
└── park-energy-series.ts       # nuevo — función pura: RegistroEnergiaMensual[] + rango -> ParkEnergyRow[]

components/gdd/
└── ParkPerformanceView.tsx     # recibe energía real por props en vez de getParkEnergySeries(period) del mock

data/
└── gdd-performance-mock.ts     # PARK_ENERGY_MONTHLY/WEEKLY + getParkEnergySeries eliminados (FR-008); resto del mock (KPIs, sparklines) queda intacto por excepción documentada

app/gdd/performance/page.tsx    # Server Component: agrega listEnergia(parque.id) junto a resolveDashboardContext
app/gdc/performance/page.tsx    # ídem si reusa ParkPerformanceView/alias
app/gdcv/performance/page.tsx   # ídem si reusa ParkPerformanceView/alias

tests/lib/
├── park-energy-series.test.ts          # nuevo — test-first de la función de mapeo/rango
└── api/energia-roi-mantenimiento.test.ts  # existente — actualizar casos de listEnergia a la forma real
```

**Structure Decision**: Next.js App Router single-project (no hay separación frontend/backend en este repo). Se sigue el patrón ya validado por la integración de ROI (`lib/roi-kpis.ts` + `app/gdd/performance` resolviendo `parque`): fetch en Server Component de página, transformación en función pura testeada, consumo en el client component de vista existente vía props nuevas — sin crear proyectos, paquetes ni capas nuevas.

## Complexity Tracking

Sin violaciones a la constitución — tabla no aplica.
