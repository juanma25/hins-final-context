# Research: Vista DIA real + KPI 1M desde datos de 6M

## Decision 1 — Forma de respuesta del endpoint diario puntual

**Decision**: `GET /parques/{parqueId}/energia?periodo=AAAA-MM-DD` devuelve un array de 0..N objetos con forma:

```json
{
  "capturadoEn": "2026-07-20T14:41:56.703Z",
  "energiaDiaKwh": 93.61,
  "ingresoDia": 6843.04,
  "energiaTotalKwh": 901509.7,
  "energiaInyectadaDiaKwh": 0,
  "energiaConsumidaDiaKwh": 0
}
```

Es la misma muestra provista por el usuario en el pedido. Se modela como tipo nuevo `RegistroEnergiaDia` — no reutiliza `RegistroEnergiaDiario` (`{ fecha, energiaDiaKwh, ingresoDia }`), que es la forma de `?periodo=AAAA-MM` (un array de días dentro de un mes, spec 003). Mismo path base, tercer shape distinto según formato del `periodo` — igual patrón de riesgo que 002/003 (confirmar contra backend real antes de cerrar integración).

**Rationale**: Los campos no coinciden 1:1 con `RegistroEnergiaDiario` (agrega `capturadoEn`, `energiaTotalKwh`, `energiaInyectadaDiaKwh`, `energiaConsumidaDiaKwh`; no tiene `fecha` explícita — el día ya está implícito en el `periodo` pedido). Forzar el tipo existente perdería esos campos o inventaría una relación falsa entre ambos endpoints.

**Alternatives considered**:
- Reusar `RegistroEnergiaDiario` y ampliarlo con campos opcionales → rechazado: mezclaría dos contratos con semántica distinta (uno es "un día dentro de una lista mensual", el otro es "el snapshot de un día puntual") bajo un solo tipo, violando Principio I (fuente de verdad única y honesta por forma real de API).

## Decision 2 — Múltiples registros el mismo día

**Decision**: Si el array trae más de un elemento, se usa el de `capturadoEn` más reciente (orden descendente, primer elemento tras ordenar).

**Rationale**: `capturadoEn` es un timestamp de captura, no de negocio — sugiere que el backend puede persistir más de una lectura/snapshot por día (ej. recálculos). El valor más reciente es el más confiable para representar "el día" en la UI, mismo criterio que otras vistas del proyecto usan "último valor conocido" para snapshots.

**Alternatives considered**: sumar todos los registros del día → rechazado, `energiaDiaKwh`/`energiaTotalKwh` ya son acumulados, sumarlos duplicaría el total. Tomar el primero sin ordenar → rechazado, no hay garantía de que el array venga ordenado.

## Decision 3 — Cómo se dispara el fetch al cambiar de día en la pestaña DIA

**Decision**: Nuevo Route Handler `GET /api/parques/{parqueId}/energia-dia?periodo=AAAA-MM-DD` que internamente llama a `getEnergiaDelDia` (wrapper de `apiFetch`, mismo patrón que `listEnergiaDiaria`). El cliente (`ParkPerformanceView`, ya `"use client"`) llama a ese Route Handler vía `fetch` al montar la pestaña DIA y cada vez que el usuario cambia de día, en vez de recargar toda la página server-side.

**Rationale**: Cumple Principio II (Server/Client Boundary Discipline: "nunca fetch client-side a endpoints internos sin un Route Handler boundary de por medio") sin forzar un full-page reload por cada cambio de día — mismo patrón ya usado por `app/api/dashboard/context/route.ts` para exponer datos server-side a un cliente sin desnudar el token del backend HINS en el navegador. Además resuelve naturalmente FR-008 (descartar respuestas fuera de orden): cada fetch del cliente puede llevar un identificador de la solicitud más reciente y descartar respuestas obsoletas con el patrón estándar (AbortController / comparación de última fecha pedida).

**Alternatives considered**:
- Server Action que retorna los datos del día → rechazado por simplicidad de invalidación de carrera (FR-008) y porque el resto de la vista ya sigue el patrón Route Handler para date-scoped data del cliente.
- Recargar `app/gdd/performance/page.tsx` completo vía `router.push` con un query param de día → rechazado: recarga innecesaria de `registrosEnergia`/`registrosEnergiaDiaria` (6M/1M) solo para cambiar un día, y pierde estado de pestaña activa entre navegaciones.

## Decision 4 — Origen del valor de la pestaña 1M

**Decision**: Se agrega `getRegistroDelMesActual(registros: RegistroEnergiaMensual[], periodoActual: string)` en `lib/park-energy-series.ts` que busca el registro cuyo `periodo === periodoActual` dentro de la misma serie ya cargada para 6M/1A/TODO (`registrosEnergia`, prop ya recibida por `ParkPerformanceView`). No se agrega ningún fetch nuevo para 1M.

**Rationale**: El pedido del usuario es explícito ("En la 1M muestra el valor del mes actual que viene en la data que usamos en 6M") y el dato ya está disponible en memoria — pedirlo de nuevo sería una llamada redundante, contra Principio V (Simplicity).

**Alternatives considered**: derivar 1M de `registrosEnergiaDiaria` (suma del mes, ya usada por el KPI destacado de 003) → rechazado, mezclaría la fuente mensual (`energiaMesKwh`, ya cerrado como número del mes por el backend) con una suma cliente-side de diarios que puede no coincidir exactamente; el pedido del usuario apunta puntualmente a "la data que usamos en 6M" (`RegistroEnergiaMensual[]`).

## Decision 5 — Alcance de 1A/TODO

**Decision**: Sin cambios. `getRealParkEnergySeries` (`lib/park-energy-series.ts`) ya resuelve `1a` como `sorted.slice(-12)` y `todo` como el array completo, sobre la misma serie mensual que alimenta 6M — exactamente lo pedido ("1A ... usar la misma de 6M, y todo, usar la misma de 6M").

**Rationale**: Verificado leyendo el código actual (`lib/park-energy-series.ts`); no hay bug ni gap ahí. Se documenta para no reabrir como pendiente.

**Alternatives considered**: N/A — no hay decisión de diseño nueva, solo confirmación de estado actual.
