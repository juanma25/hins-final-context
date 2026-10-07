# Implementation Plan: Gráficos GDCV desde backend

**Branch**: `005-gdcv-backend-charts` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-gdcv-backend-charts/spec.md`

## Summary

GDD ya construye su gráfico de performance y sus KPIs desde `GET /parques/{id}/energia`
(mensual/diario) usando `lib/api/energia.ts` + `lib/park-energy-series.ts`, con estados
de carga/vacío/error propios (`components/gdd/ParkPerformanceView.tsx`). GDCV, en cambio,
sigue mostrando ese mismo bloque (chart 6M/1A/TODO + KPI primario + generación diaria)
desde `data/gdcv-mock.ts` y `data/gdcv-daily-mock.ts`. ROI y Mantenimiento en GDCV **ya**
consumen backend parcialmente (`listRoi` + `computeRealRoiKpis`, `listMantenimiento`);
lo que falta ahí es acotado (tabla de recupero y curva de proyección de ROI siguen mock
por falta de endpoint, según excepción ya documentada en GDD/ROI).

El enfoque técnico: reutilizar exactamente el mismo contrato de datos y las mismas
funciones puras de `lib/park-energy-series.ts` y `lib/api/energia.ts` que ya usa GDD,
en vez de crear un camino paralelo para GDCV. `GdcvPerformanceView` pasa de ser
autosuficiente (fetch de mocks) a ser un componente controlado por props reales
(`parque`, `registrosEnergia`, `registrosEnergiaDiaria`, `periodoActual`), igual que
`ParkPerformanceView`. La tabla de socios (`SociosTable`) y sus KPIs derivados
(ahorro total, promedio por usuario) no tienen entidad equivalente en el contrato de
energía y quedan fuera de esta feature — ver Assumptions del spec y data-model.md.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router (existing repo config)

**Primary Dependencies**: React Server/Client Components, `apiFetch` (lib/api/client.ts),
Recharts-based chart components ya existentes (`ParkEnergyBarChart`, `DailyEnergyTotalsBlock`)

**Storage**: N/A (frontend consumidor de API REST ya existente; no hay storage propio)

**Testing**: Vitest (ya introducido en el repo — ver `tests/lib/api/*.test.ts`,
`tests/lib/park-energy-series.test.ts`)

**Target Platform**: Web (Next.js SSR + navegador)

**Project Type**: Web application (single Next.js app, sin separación backend/frontend
en este repo — el backend real es un servicio externo ya consumido vía `apiFetch`)

**Performance Goals**: Igual percepción de carga que GDD (SC-003 del spec); sin
requisito numérico nuevo, reutiliza el mismo patrón de fetch en paralelo con
`Promise.all` ya usado en `app/gdd/performance/page.tsx`.

**Constraints**: No introducir un endpoint o contrato nuevo — reutilizar
`GET /parques/{id}/energia` (mensual y diario) tal como ya lo consume GDD.

**Scale/Scope**: Acota a las vistas de performance de GDCV (chart + KPI primario +
generación diaria). ROI y Mantenimiento quedan fuera de esta feature al estar ya
mayormente resueltos; ver Out of Scope en data-model.md.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — reutiliza tipos existentes (`RegistroEnergiaMensual`,
  `RegistroEnergiaDiario`, `Parque`) de `lib/api/types.ts`; no se introducen `any`.
- **II. Component & Server/Client Boundary Discipline**: PASS — el fetch de energía se
  mueve al Server Component `app/gdcv/performance/page.tsx` (igual patrón que GDD),
  `GdcvPerformanceView` recibe los datos ya resueltos por props.
- **III. Test-First for Data & Business Logic**: PASS (aplica) — las funciones puras
  reutilizadas (`getRealParkEnergySeries`, `getMonthlyGenerationTotal`,
  `getMonthlySparklinePoints`, `getRegistroDelMesActual`) ya tienen tests en
  `tests/lib/park-energy-series.test.ts`; cualquier ajuste nuevo específico de GDCV
  (si lo hubiera) sigue Red→Green→Refactor.
- **IV. Consistent, Accessible UI**: PASS — reutiliza los mismos componentes de UI que
  GDD (`ParkEnergyBarChart`, `DailyEnergyTotalsBlock`, `KpiPrimary`, `KpiSecondary`,
  estados de error/vacío con `Button`/texto ya usados en `ParkPerformanceView`).
- **V. Simplicity & Reviewable Change**: PASS — no se crea infraestructura nueva; se
  elimina código mock y se conecta GDCV al mismo pipeline que ya existe para GDD.

No violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-gdcv-backend-charts/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/gdcv/performance/page.tsx        # cargar registrosEnergia + registrosEnergiaDiaria (Server Component)
app/api/parques/[id]/energia-dia/    # ya existe (usado por GDD) — reutilizado tal cual para 1D en GDCV

components/gdcv/GdcvPerformanceView.tsx  # pasa de auto-fetch mock a componente controlado por props
components/gdd/ParkPerformanceView.tsx   # referencia de patrón (loading/empty/error), no se modifica

lib/api/energia.ts            # ya existe — listEnergia / listEnergiaDiaria reutilizados sin cambios
lib/park-energy-series.ts     # ya existe — funciones puras reutilizadas sin cambios
data/gdcv-mock.ts             # se retira el uso para chart/KPI de energía (queda solo lo fuera de alcance: socios)
data/gdcv-daily-mock.ts       # se retira su uso en GdcvPerformanceView (queda MOCK_TODAY/toDateKey si aún se usan en tests)

tests/lib/park-energy-series.test.ts   # ya cubre las funciones reutilizadas
tests/app/gdcv/                        # nuevos tests de integración de la página (si aplica, ver tasks)
```

**Structure Decision**: Una sola app Next.js (App Router). No hay separación
frontend/backend en este repo — el backend es un servicio externo. La feature es
puramente de "conectar UI existente a datos ya disponibles", replicando el patrón ya
usado en `app/gdd/performance/page.tsx` para `app/gdcv/performance/page.tsx`, y
reutilizando `lib/api/energia.ts` / `lib/park-energy-series.ts` sin duplicarlos.

## Complexity Tracking

*No violations — section not applicable.*
