# Research: Gráficos GDCV desde backend

## Contexto de partida

Antes de research, se auditó el estado real de cada vista de GDCV contra su
equivalente GDD para confirmar qué está realmente mockeado hoy (no asumido):

| Vista | Componente | Estado actual |
|---|---|---|
| Performance (chart 6M/1A/TODO + KPI primario) | `components/gdcv/GdcvPerformanceView.tsx` | 100% mock (`data/gdcv-mock.ts`: `getGdcvEnergySeries`, `gdcvGeneradaAbril`, `gdcvGenerationSparkline`) |
| Performance (generación diaria "1D") | ídem, bloque `DailyGenerationChartBlock` | 100% mock (`data/gdcv-daily-mock.ts`) |
| Performance (tabla de socios) | `SociosTable` | 100% mock (`sociosMock`) — **sin entidad backend equivalente**, fuera de alcance |
| ROI (KPIs superiores: inversión recuperada, pendiente, TIR) | `components/gdcv/GdcvRoiView.tsx` | **Ya real** — `app/gdcv/roi/page.tsx` llama `listRoi` + `computeRealRoiKpis` |
| ROI (tabla recupero, curva de proyección, "Recupero Estimado"/"Plazo") | ídem | Mock por excepción ya documentada (sin endpoint de proyección) — mismo estado que GDD |
| Mantenimiento | `components/gdcv/GdcvMantenimientoView.tsx` | **Ya real** — llama `listMantenimiento(parqueId)` |

Conclusión: el gap real y accionable de esta feature es exclusivamente el bloque de
**Performance / energía** (chart de rango + KPI primario + generación diaria). ROI y
Mantenimiento no requieren trabajo adicional más allá de lo ya resuelto — se documentan
como "ya cumplido" y quedan fuera del alcance de implementación (ver data-model.md
Out of Scope), evitando trabajo redundante.

## Decision 1: Reutilizar el contrato de energía ya usado por GDD, sin crear uno nuevo

**Decision**: GDCV consume `GET /parques/{parqueId}/energia` (mensual, vía
`listEnergia`) y `GET /parques/{parqueId}/energia?periodo=YYYY-MM` (diario dentro del
mes, vía `listEnergiaDiaria`) — los mismos dos endpoints y las mismas funciones de
`lib/api/energia.ts` que ya usa GDD. Para el rango "1D" se reutiliza la ruta interna
ya existente `app/api/parques/[parqueId]/energia-dia/route.ts` (snapshot puntual del
día vía `getEnergiaDelDia`).

**Rationale**: Un parque es un parque independientemente del modelo de negocio
(GDD/GDC/GDCV) del proyecto al que pertenece — el backend no diferencia el contrato
de energía por modelo. Duplicar el contrato o crear un endpoint paralelo violaría el
principio de Simplicidad (V) sin ningún beneficio funcional.

**Alternatives considered**:
- Crear un endpoint/contrato específico para GDCV — rechazado: no hay ninguna
  diferencia de dominio entre la energía de un parque GDD y uno GDCV; sería
  complejidad especulativa.
- Mantener el fetch de energía en `GdcvPerformanceView` (client-side) — rechazado:
  violaría el Principio II (fetching de dominio debe vivir en Server
  Component/Route Handler), y rompería paridad con el patrón ya establecido en GDD.

## Decision 2: Reutilizar `lib/park-energy-series.ts` sin bifurcar lógica

**Decision**: Las funciones puras `getRealParkEnergySeries`, `getMonthlyGenerationTotal`,
`getMonthlySparklinePoints` y `getRegistroDelMesActual` (ya testeadas en
`tests/lib/park-energy-series.test.ts`) se usan tal cual desde `GdcvPerformanceView`,
sin crear un módulo `gdcv-energy-series.ts` paralelo.

**Rationale**: Son transformaciones de datos genéricas sobre `RegistroEnergiaMensual`/
`RegistroEnergiaDiario`, no específicas de GDD. Bifurcar el módulo introduciría
duplicación de lógica de negocio que el Principio V prohíbe explícitamente
("Dependencies MUST NOT be added... smallest change").

**Alternatives considered**:
- Copiar las funciones a un módulo `gdcv-*` — rechazado por duplicación innecesaria.
- Renombrar el módulo a algo neutral (`park-energy-series.ts` ya es neutral, no
  menciona GDD) — no aplica, el nombre actual ya es agnóstico al modelo de negocio.

## Decision 3: KPIs derivados sin equivalente en backend (ahorro total, promedio por
usuario) quedan fuera de esta feature

**Decision**: `gdcvAhorroTotalAbril` y `gdcvPromedioPorUsuario` (KPIs secundarios de la
columna derecha) no tienen campo equivalente en `RegistroEnergiaMensual` /
`RegistroEnergiaDiario` (no hay noción de "socio" ni "ahorro por usuario" en el
contrato de energía). Se documentan como excepción-mock explícita, igual criterio que
GDD documenta en `tariffCardMock`/`savingsCardMock` (ver `ParkPerformanceView.tsx`
comentarios).

**Rationale**: Consistente con cómo ya se resolvió el mismo tipo de gap en GDD
(specs/002 y specs/003) — no inventar datos, documentar la excepción y no bloquear el
resto de la vista por un campo sin contrato.

**Alternatives considered**:
- Calcular esos KPIs en el frontend a partir de `Socio[]` (participacionPorcentaje) —
  rechazado: no hay endpoint de energía por socio, solo total por parque; el cálculo
  sería una invención, no un dato real.

## Decision 4: Tabla de socios (`SociosTable`) fuera de alcance

**Decision**: La tabla de socios y sus sheets de detalle (`SocioDetailSheet`,
medidores) siguen usando `sociosMock` — no se tocan en esta feature.

**Rationale**: El spec (FR-001 a FR-004) se limita a energía, ROI, diario y
mantenimiento — entidades ya presentes en el contrato backend (`RegistroEnergia*`,
`RegistroRoi`, `RegistroMantenimiento`). `Socio` sí existe como entidad backend, pero
no hay endpoint que devuelva medidores/consumo por socio; migrar esa tabla es una
feature separada con su propio research de contrato.

**Alternatives considered**: Incluirla en el mismo esfuerzo — rechazado para mantener
el cambio acotado y revisable (Principio V) y porque el contrato de socios+medidores
no está definido en `lib/api/types.ts` hoy.

## Resueltas: NEEDS CLARIFICATION del Technical Context

Ninguna quedó pendiente — el Technical Context se completó directamente a partir del
código existente (mismo stack, mismo test runner, mismo patrón de página que GDD).
