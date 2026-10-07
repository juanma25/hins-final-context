# Implementation Plan: Comparativa DIMMs vs Huawei en Detalle de Parque

**Branch**: `012-comparativa-dimms-huawei` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-comparativa-dimms-huawei/spec.md`

## Summary

En `GdcvPerformanceView` (detalle de parque real, `app/gdcv/performance/page.tsx`), la card KPI principal y el gráfico de energía del parque hoy solo muestran datos de Huawei (vía `listEnergia`/`listEnergiaDiaria`). Se agrega una segunda fuente — el medidor principal DIMMs, vía `GET /parques/{parqueId}/medidor-principal/registros/consolidado?periodo=YYYY-MM` — como dato principal, dejando Huawei como referencia secundaria. Se sigue el mismo patrón ya usado por `lib/api/socios-historico.ts` y `lib/api/energia.ts` (fetch server-side, `null` en fallo sin tumbar la página) y se reutilizan los componentes `KpiPrimary`/`KpiSecondary`/`ParkEnergyBarChart` existentes, extendiéndolos para aceptar una serie secundaria en vez de crear componentes nuevos.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router (React 19 Server/Client Components)

**Primary Dependencies**: Next.js, existing `lib/api/client.ts` (`apiFetch`), shadcn/Radix UI, Recharts (via `components/ui/chart.tsx` + `ParkEnergyBarChart`)

**Storage**: N/A (remote API only, no local persistence)

**Testing**: Vitest (existing `tests/` tree — see `tests/app/gdcv/performance-page.test.ts`, `tests/lib/*.test.ts`)

**Target Platform**: Web (Next.js server + browser), existing GDCV admin dashboard

**Project Type**: Web application (single Next.js app, no separate frontend/backend split)

**Performance Goals**: No new perf targets beyond existing page; DIMMs monthly-range chart calls are bounded (≤12 requests for a 1-year range) and run via `Promise.all` server-side, consistent with existing `loadRegistrosEnergia*` pattern.

**Constraints**: Must not block page render if DIMMs source fails (Principle: existing error-isolation pattern in `GdcvPerformanceView`/`app/gdcv/performance/page.tsx`); must not fabricate data for missing periods (spec FR-010).

**Scale/Scope**: One page (`app/gdcv/performance/page.tsx`) + its view component (`GdcvPerformanceView`), one new `lib/api/*` module, one new type set, chart/card component extensions — no new routes, no schema/DB changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: New `ConsolidadoMedidorPrincipal` types added to `lib/api/types.ts` as the single source of truth, mirroring the existing `RegistroEnergia*` pattern (documented real API shape, not swagger DTO copy-paste). No `any`. **PASS**.
- **II. Component & Server/Client Boundary Discipline**: DIMMs data fetched server-side in `app/gdcv/performance/page.tsx` (Server Component), passed as props into `GdcvPerformanceView` (existing Client Component boundary) — same boundary already used for `registrosEnergia`/`registrosEnergiaDiaria`/`socios`. No new client-side fetch to internal endpoints. Reuses `KpiPrimary`, `KpiSecondary`, `ParkEnergyBarChart`, `CardWithResponsiveTabs` — extended via props, not duplicated. **PASS**.
- **III. Test-First for Data & Business Logic**: New pure functions (mapping/aggregating DIMMs consolidado + merging with Huawei series for chart/card display) get Vitest tests written first (Red→Green), consistent with existing `tests/lib/*.test.ts` and `tests/app/gdcv/*.test.ts`. **PASS** (planned, enforced in tasks phase).
- **IV. Consistent, Accessible UI**: Secondary-series styling reuses existing chart config/token patterns (`data/chart-config.ts`) and shadcn card primitives; no ad-hoc components. **PASS**.
- **V. Simplicity & Reviewable Change**: No new dependencies. Reuses existing fetch/error-isolation pattern and existing chart/card components rather than introducing new ones. Scope stays to one page + its data layer. **PASS**.

No violations — Complexity Tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/012-comparativa-dimms-huawei/
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
├── types.ts                       # + ConsolidadoMedidorPrincipal types (EXTEND)
└── medidor-principal.ts           # NEW: getConsolidadoMedidorPrincipal(parqueId, periodo)

lib/
└── energia-comparativa.ts         # NEW: pure functions merging DIMMs + Huawei series for cards/chart

app/gdcv/performance/
└── page.tsx                       # EXTEND: fetch DIMMs consolidado (current period + chart range), pass as props

components/gdcv/
└── GdcvPerformanceView.tsx        # EXTEND: render comparative KPI card + comparative chart series

components/charts/
└── ParkEnergyBarChart.tsx         # EXTEND: optional secondary series/bar per point

components/ui/
├── kpi-primary.tsx                # EXTEND: optional secondary/comparative value slot
└── kpi-secondary.tsx              # EXTEND if needed for secondary comparison display

tests/
├── lib/energia-comparativa.test.ts        # NEW (test-first)
└── app/gdcv/performance-page.test.ts      # EXTEND (already modified in working tree)
```

**Structure Decision**: Single Next.js app (existing structure, no new top-level directories). All changes are additive extensions to the existing GDCV performance detail page and its data layer, following the same `lib/api/*.ts` + Server Component fetch + Client Component props pattern already used for `registrosEnergia`, `registrosEnergiaDiaria`, and `socios-historico`.

## Complexity Tracking

*No Constitution Check violations — table not applicable.*
