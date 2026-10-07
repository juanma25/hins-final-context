# Research: Comparativa DIMMs vs Huawei en Detalle de Parque

## Decision 1: Endpoint y forma real de datos DIMMs

**Decision**: Usar `GET /parques/{parqueId}/medidor-principal/registros/consolidado?periodo=YYYY-MM`, que devuelve un `ConsolidadoDto` único (no una serie diaria) para el período pedido: `{ desde, hasta, porTarifa: ConsolidadoTarifaDto[], total: ConsolidadoTotalDto }`, donde `total.energiaActivaExportada.sumaKwh` es el valor de generación total del período en kWh (puede ser `null` si ningún registro informó el valor).

**Rationale**: Confirmado contra swagger local (`http://localhost:3000/docs-json`, schema `ConsolidadoDto`/`ConsolidadoTotalDto`/`EstadisticaEnergiaDto`). Es el mismo patrón de "consolidado por tarifa con total general" ya usado por el endpoint análogo de socio (`/parques/{parqueId}/socios/{socioId}/registros/consolidado`, ya consumido en la feature 009/010 vecina). 404 = "Parque inexistente o sin medidor principal", lo cual es una condición de negocio distinta de un error transitorio (ver Decision 3).

**Alternatives considered**:
- Endpoint por medidor genérico (`/parques/{parqueId}/medidores/{medidorId}/registros/consolidado`) — descartado: requiere conocer el id del medidor principal como si fuera uno más; el endpoint dedicado `medidor-principal` ya resuelve esa referencia server-side.
- Usar `desde`/`hasta` en vez de `periodo` — descartado para el caso base (mes actual/mes seleccionado): `periodo=YYYY-MM` es más simple y es el mismo criterio que ya usa `listEnergiaDiaria(parqueId, periodo)` para Huawei, permitiendo reusar el mismo período calculado en `page.tsx`.

## Decision 2: Granularidad para el gráfico comparativo (no solo la card)

**Decision**: El endpoint DIMMs consolidado no expone una serie diaria/mensual multi-período en una sola llamada — cada llamada con `periodo=YYYY-MM` devuelve un único total para ese mes. Para poblar el gráfico de rango (6M/1A) con la serie comparativa, se hacen N llamadas en paralelo (`Promise.all`), una por cada período/mes visible en el rango, igual que ya se resuelve `registrosEnergia` para Huawei pero por-mes en vez de recibir la serie completa en una sola respuesta.

**Rationale**: El rango máximo soportado por `CHART_RANGE_TABS` es acotado (6m/1a), por lo que el peor caso es 12 llamadas en paralelo — aceptable para un fetch server-side en `page.tsx`, consistente con el `Promise.all` que ya usa la página para las 3 fuentes existentes (`loadRegistrosEnergia`, `loadRegistrosEnergiaDiaria`, `loadSocios`).

**Alternatives considered**:
- Pedir todo el rango con `desde`/`hasta` en una sola llamada — descartado: la respuesta sigue siendo un único consolidado agregado para todo el rango, no una serie por mes; no sirve para graficar una tendencia.
- Limitar la comparativa de gráfico solo al mes actual (1M) y dejar 6M/1A solo con Huawei — descartado como default: no cumple FR-004 (ambas series en los gráficos existentes); se mantiene como fallback silencioso solo si una consulta puntual de un mes falla (ese mes queda sin punto DIMMs, ver Decision 3), no como recorte de alcance.

## Decision 3: Manejo de errores y datos faltantes (fuente principal vs secundaria)

**Decision**: Seguir el mismo criterio ya documentado en `app/gdcv/performance/page.tsx` (`loadRegistrosEnergia`, `loadRegistrosEnergiaDiaria`, `loadSocios`): cada fuente se resuelve en su propio `try/catch`, `null` = falló la consulta (distinto de "sin datos" = respuesta vacía/valor `null` en el DTO). Un fallo de la fuente DIMMs no debe interrumpir el render de la página ni ocultar los datos Huawei ya disponibles (FR-008); se propaga un estado "fuente principal no disponible" al componente para que lo muestre de forma explícita (FR-006), y de forma simétrica para Huawei (FR-007).

**Rationale**: Reutiliza un patrón ya probado y testeado en el repo (mismo componente, mismo archivo) en vez de introducir un mecanismo nuevo de manejo de errores. `UnauthorizedError` sigue redirigiendo a `/login` igual que las otras fuentes.

**Alternatives considered**: Cargar DIMMs client-side (como el patrón `1d` de energía diaria vía `/api/parques/[parqueId]/energia-dia`) — descartado como default: el valor mensual/rango no depende de interacción del usuario (no hay navegación día-a-día como en el bloque `1d`), así que no hay necesidad de la complejidad de un route handler + fetch client-side; se resuelve server-side igual que `registrosEnergia`.

## Decision 4: Presentación comparativa en cards y gráfico

**Decision**: Extender `KpiPrimary` (card "Generada en [mes]") para aceptar un valor comparativo secundario (Huawei) mostrado junto al valor principal (DIMMs) en vez de reemplazarlo. Extender `ParkEnergyBarChart` para aceptar una segunda serie de barras/línea por punto (Huawei) además de la principal (DIMMs), reusando `data/chart-config.ts` para la paleta ya existente en vez de definir colores nuevos.

**Rationale**: Cumple Principio IV (reusar componentes/design tokens existentes) y evita duplicar componentes de card/gráfico solo para el caso comparativo.

**Alternatives considered**: Crear componentes nuevos `ComparativeKpiCard`/`ComparativeBarChart` — descartado por Principio V (simplicidad): la necesidad se resuelve extendiendo props de los componentes existentes sin duplicar su lógica de layout/responsive ya resuelta.
