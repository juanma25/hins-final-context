# Research: Gráfico de Energía del Parque (datos reales)

## Decision 1: Forma real de la respuesta del endpoint

**Decision**: Tratar la respuesta de `GET /parques/{parqueId}/energia` como una lista de `{ periodo: "YYYY-MM"; energiaMesKwh: number | null; ingresoMes: number | null }`, según la muestra de respuesta real provista por el usuario durante `/speckit-clarify`.

**Rationale**: Es la única evidencia de la forma *real* de la respuesta viva. El contrato documentado (`docs/openapi.json`, schema `RegistroEnergia`: `energiaInyectadaKwh`/`energiaGeneradaKwh`/`creditoGenerado`/`ahorroEpec`) y el tipo actualmente codeado en `lib/api/types.ts` + `lib/api/energia.ts` están desalineados con esa muestra — el doc/tipo parece obsoleto respecto al backend real para este endpoint específicamente.

**Alternatives considered**:
- Confiar en el tipo/documento existente (`RegistroEnergia` con inyectada/generada/crédito/ahorro): rechazado porque contradice la respuesta real observada; implementarlo así rompería el gráfico contra el backend real.
- Soportar ambas formas con un parser tolerante: rechazado por complejidad especulativa (Principio V, Simplicidad) sin evidencia de que el backend varíe la forma.

**Follow-up requerido antes/durante implementación**: Verificar contra el backend real (o swagger actualizado) al iniciar tasks — si la forma difiere de la muestra, ajustar `RegistroEnergiaMensual`/mapper antes de continuar. Este archivo documenta la decisión tomada con la evidencia disponible al momento del plan, no una garantía de contrato inmutable.

## Decision 2: Alcance de tipos existentes (`RegistrarEnergiaDto` / `RegistroEnergia` en `lib/api/types.ts`)

**Decision**: No modificar el DTO de escritura (`RegistrarEnergiaDto`, usado por `registrarEnergia` — POST) ni sus tests existentes (`tests/lib/api/energia-roi-mantenimiento.test.ts`). Introducir un tipo nuevo y distinto para la respuesta de lectura mensual que alimenta este gráfico (`RegistroEnergiaMensual` o similar), y actualizar `listEnergia`/`lib/api/energia.ts` para parsear con esa forma.

**Rationale**: El POST (registrar energía) no es parte de este feature y no hay evidencia de que su forma esté mal; cambiar tipos compartidos sin evidencia viola Simplicidad (Principio V) y arriesga romper funcionalidad no relacionada. Aislar el cambio al camino de lectura minimiza blast radius.

**Alternatives considered**: Unificar un solo tipo `RegistroEnergia` para ambos usos — rechazado porque el DTO de escritura y la muestra de lectura ya no coinciden en campos; forzar unificación exige asumir cosas no evidenciadas sobre el POST.

## Decision 3: Mapeo de rango temporal (chips) a datos reales

**Decision**: Los chips de rango existentes son `1d | 1m | 6m | 1a | todo` (`types/chart-range.ts`), no "3 meses" como se nombró informalmente en el spec. Con datos reales mensuales (`periodo` = mes):
- `6m` → últimos 6 registros por `periodo` (orden ascendente).
- `1a` → últimos 12 registros.
- `todo` → todos los registros disponibles, ordenados por `periodo`.
- `1m` y `1d` → sin equivalente en este endpoint (que es 100% mensual); confirmado ya en el spec (FR-009 cubre `1d`). Para `1m`, el punto más simple y consistente con "no hay más granularidad que mensual" es reusar el mismo criterio de `todo`/último mes disponible, o dejar ese chip fuera del control de rango cuando la vista consuma datos reales — a decidir en tasks con el detalle de UI actual del selector.

**Rationale**: Reutiliza el resolutor de rango existente (`lib/chart-range-resolve.ts`) por slicing simple sobre la serie ordenada, sin inventar agregación semanal que el backend no provee.

**Alternatives considered**: Sintetizar una vista semanal a partir de un solo registro mensual (repartir el total en 4) — rechazado, generaría datos ficticios disfrazados de reales, contradice el objetivo del feature (dejar de mostrar mock).

## Decision 4: Dónde vive la transformación (Server Component vs. lib puro)

**Decision**: Seguir el patrón ya establecido en `lib/roi-kpis.ts` (`computeRealRoiKpis`): una función pura en `lib/park-energy-series.ts` (o nombre equivalente) que recibe `RegistroEnergiaMensual[]` + rango, y devuelve `ParkEnergyRow[]` (`{ label, generated }[]`) — la forma que `ParkEnergyBarChart`/`ParkEnergyRow` ya consumen. La llamada a `listEnergia(parqueId)` ocurre en el Server Component (`ParkPerformanceView` es `"use client"`, así que el fetch debe subir a la página o a un Server Component padre que le pase los datos por props — igual que `parque` ya se pasa hoy).

**Rationale**: Cumple Principio II (fetch en Server Components/Route Handlers, no client-side fetch directo) y Principio III (lógica de transformación de datos testeada primero) reusando el patrón ya validado por `roi-kpis.ts`.

**Alternatives considered**: Fetch dentro de `ParkPerformanceView` client component vía route handler propio — rechazado, más superficie nueva que reusar el Server Component existente (`app/gdd/performance/page.tsx`) que ya resuelve `parque`.

## Decision 5: Testing

**Decision**: Vitest ya configurado (`vitest.config.ts`, `tests/lib/api/*.test.ts` existente). Tests nuevos: (a) unit test de la función pura de transformación/slicing por rango (casos: vacío, con nulls, orden, 6m/1a/todo), (b) actualizar/ampliar el test de `lib/api/energia.ts` si su forma de parseo cambia.

**Rationale**: Principio III (test-first) ya tiene runner disponible; no requiere nueva infraestructura.
