# Implementation Plan: KPI "Energía Generada" del mes actual (datos reales)

**Branch**: `003-monthly-generation-kpi` | **Date**: 2026-07-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-monthly-generation-kpi/spec.md`

## Summary

Reemplazar el mock de la card destacada "Generada en Abril" (`highlightAprilCardMock.kwh` + `generationSparklinePoints`) en `ParkPerformanceView` por datos reales del mes calendario actual, leídos de `GET /parques/{parqueId}/energia?periodo={YYYY-MM del mes actual}`. La respuesta es un array diario `{ fecha: "YYYY-MM-DD"; energiaDiaKwh; ingresoDia }`. El total de la card = suma de `energiaDiaKwh`; la sparkline = un punto por día, ordenado por fecha. El texto "X kWh desde el Inicio" y el título "Generada en Abril" se ajustan (título dinámico al mes actual; texto comparativo queda mock por excepción, ya que no hay endpoint de acumulado histórico).

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router (repo existente)

**Primary Dependencies**: Next.js, React, `KpiPrimary` (ya existente, sparkline vía Recharts interno) — sin dependencias nuevas

**Storage**: N/A (consume API HTTP backend HINS vía `apiFetch`, mismo patrón que `002-park-energy-chart`)

**Testing**: Vitest (`tests/lib/**`)

**Target Platform**: Web (Next.js SSR/CSR híbrido)

**Project Type**: Web application (single Next.js app)

**Performance Goals**: Card refleja el mes actual sin bloquear el resto de la vista (mismo Server Component ya usado para `registrosEnergia` — un fetch adicional en paralelo, no en cascada)

**Constraints**: No romper el gráfico de barras mensual ni la tabla de historial ya resueltos en `002-park-energy-chart`; no reintroducir el mock eliminado de esa feature; mismo criterio de error/vacío ya establecido

**Scale/Scope**: 1 card (`KpiPrimary` "Energía Generada") dentro de `ParkPerformanceView`, un endpoint GET con query param, hasta 31 registros diarios por consulta

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Aplica | Cumplimiento planeado |
|---|---|---|
| I. Type Safety First | Sí | Tipo nuevo `RegistroEnergiaDiario` como single source-of-truth; sin `any`; boundary externo validado en el parseo de `lib/api/energia.ts` |
| II. Server/Client Boundary | Sí | Fetch del mes actual sube al mismo Server Component (`app/gdd/performance/page.tsx`) que ya resuelve `registrosEnergia`; se agrega en paralelo (`Promise.all`), no se agrega fetch client-side |
| III. Test-First (NON-NEGOTIABLE) | Sí | Función pura de suma/mapeo a sparkline testeada primero (mismo patrón que `lib/park-energy-series.ts`) |
| IV. Consistent, Accessible UI | Sí | Reusa `KpiPrimary` existente sin cambios de estilo; estados vacío/error siguen el patrón ya usado en el bloque del gráfico de barras |
| V. Simplicity & Reviewable Change | Sí | Cambio acotado: 1 tipo, 1 función `listEnergiaDiaria`, 1 función pura de agregación, wiring en Server Component + props nuevas; elimina el uso del mock en la card (mock queda solo donde otro consumidor fuera de alcance lo necesita — dev showcase) |

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
-->

```text
lib/api/
├── types.ts                    # + RegistroEnergiaDiario (nuevo, lectura diaria)
└── energia.ts                  # + listEnergiaDiaria(parqueId, periodo)

lib/
└── park-energy-series.ts       # + getMonthlyGenerationTotal / getMonthlySparklinePoints (funciones puras)

components/gdd/
└── ParkPerformanceView.tsx     # KpiPrimary recibe total/sparkline reales por props en vez de highlightAprilCardMock/generationSparklinePoints

data/
└── gdd-performance-mock.ts     # highlightAprilCardMock.kwh / generationSparklinePoints dejan de usarse en ParkPerformanceView; se conservan solo si app/dev/components/page.tsx (showcase, fuera de alcance) los sigue necesitando

app/gdd/performance/page.tsx    # Server Component: agrega listEnergiaDiaria(parque.id, mesActualPeriodo) en paralelo con listEnergia (Promise.all)

tests/lib/
└── park-energy-series.test.ts  # + casos de suma mensual y mapeo a sparkline (vacío, null, orden, dedupe por fecha)
```

**Structure Decision**: Mismo patrón que `002-park-energy-chart`: fetch en Server Component de página, transformación en funciones puras testeadas en `lib/park-energy-series.ts` (ya existente, se extiende), consumo en `ParkPerformanceView` vía props nuevas. Sin proyectos, paquetes ni capas nuevas.

## Complexity Tracking

Sin violaciones a la constitución — tabla no aplica.
