# Research: KPI "Energía Generada" del mes actual (datos reales)

## Decision 1: Forma real de la respuesta del endpoint con `?periodo=`

**Decision**: Tratar la respuesta de `GET /parques/{parqueId}/energia?periodo=YYYY-MM` como una lista de `{ fecha: "YYYY-MM-DD"; energiaDiaKwh: number | null; ingresoDia: number | null }`, según la muestra provista por el usuario.

**Rationale**: Es la única evidencia disponible; no hay swagger/openapi.json actualizado que documente el query param `periodo` (el `docs/openapi.json` del repo solo describe el GET sin query param, ya usado en `002-park-energy-chart`). Mismo riesgo ya señalado ahí (research.md Decision 1) — se repite el patrón de verificación contra backend real antes de dar el feature por cerrado.

**Alternatives considered**: Reusar el tipo `RegistroEnergiaMensual` (`periodo`/`energiaMesKwh`) asumiendo que el query param solo filtra pero mantiene la forma mensual — rechazado porque la muestra provista es explícitamente diaria (`fecha`, no `periodo`; `energiaDiaKwh`, no `energiaMesKwh`).

## Decision 2: Qué mes se consulta

**Decision**: El mes calendario actual (`new Date()` al momento del request en el Server Component), formateado a `"YYYY-MM"`.

**Rationale**: La spec (FR-002, Edge Cases) fija esto explícitamente — es el mismo criterio ya usado en el resto del dashboard para "hoy" (`MOCK_TODAY` en `data/gdcv-daily-mock.ts` es la única excepción, y es mock de la vista horaria "1D", no de este KPI).

**Alternatives considered**: Derivar el mes del rango seleccionado en el gráfico de barras (`period` state en `ParkPerformanceView`) — rechazado, la card de KPI es conceptualmente independiente del selector de rango del gráfico (ver spec Edge Cases, último ítem); acoplarlos sería una sorpresa de UX no pedida.

## Decision 3: Dónde vive el fetch y la agregación

**Decision**: Nueva función `listEnergiaDiaria(parqueId, periodo)` en `lib/api/energia.ts` (mismo archivo que `listEnergia`), llamada desde `app/gdd/performance/page.tsx` en paralelo con `listEnergia` vía `Promise.all`. Dos funciones puras nuevas en `lib/park-energy-series.ts`: `getMonthlyGenerationTotal(registros): number` (suma con null→0) y `getMonthlySparklinePoints(registros): { value: number }[]` (un punto por día, ordenado por `fecha`, dedupe por `fecha` quedando el último).

**Rationale**: Reusa el archivo/patrón ya establecido en `002-park-energy-chart` en vez de crear módulos nuevos (Principio V). El fetch en paralelo evita que un fetch lento bloquee al otro (ambos son independientes — gráfico mensual vs. card del mes actual).

**Alternatives considered**: Derivar el total/sparkline del mes actual a partir de `registrosEnergia` (los registros *mensuales* ya cargados para el gráfico de barras) — rechazado: esos registros son un punto por mes (`energiaMesKwh`), no tienen desagregación diaria; no sirven para la sparkline pedida.

## Decision 4: Manejo de error/vacío de la card

**Decision**: Mismo criterio que el gráfico de barras (`002-park-energy-chart` FR-005/FR-006): `registrosDiarios === null` → estado de error con retry; `[]` (o suma 0) → total 0 sin mock, sin fila de error.

**Rationale**: Consistencia de UX ya validada en la misma pantalla; reusar el mismo booleano de patrón (`xLoadFailed`) que ya existe para `registrosEnergia`.

## Decision 5: Título dinámico y texto comparativo mock

**Decision**: El título de la card pasa de `"Generada en Abril"` (hardcodeado) a `` `Generada en ${nombreMesActualCapitalizado}` `` derivado de la fecha real. El texto comparativo ("X kWh desde el Inicio") permanece como mock explícito (FR-009) — no se inventa un cálculo real sin fuente.

**Rationale**: Spec FR-007/FR-009 lo pide explícitamente; ya existe `formatPeriodoLabel`/lógica de nombres de mes en español (`lib/format-periodo.ts`) reusable para el nombre del mes.

## Decision 6: Testing

**Decision**: Extender `tests/lib/park-energy-series.test.ts` (no crear archivo nuevo) con casos para las dos funciones nuevas: vacío, suma con nulls, dedupe por `fecha`, orden cronológico de la sparkline.

**Rationale**: Mismo archivo/patrón que ya cubre `getRealParkEnergySeries`/`getGenerationHistoryRows`; evita fragmentar tests de un mismo módulo.
