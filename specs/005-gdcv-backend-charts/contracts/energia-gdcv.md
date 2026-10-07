# Contract: Energía de parque para vistas GDCV

No se define un contrato nuevo. Esta feature reutiliza, sin modificarlos, los
contratos ya en producción para GDD:

## `GET /parques/{parqueId}/energia`

Usado vía `listEnergia(parqueId)` (`lib/api/energia.ts`).

**Response** `RegistroEnergiaMensual[]`:
```json
[
  { "periodo": "2026-01", "energiaMesKwh": 12345.6, "ingresoMes": 98765.4 }
]
```
Consumido por: rangos 6M / 1A / TODO / 1M del chart de performance.

## `GET /parques/{parqueId}/energia?periodo=YYYY-MM`

Usado vía `listEnergiaDiaria(parqueId, periodo)` (`lib/api/energia.ts`).

**Response** `RegistroEnergiaDiario[]`:
```json
[
  { "fecha": "2026-01-15", "energiaDiaKwh": 456.7, "ingresoDia": 3210.5 }
]
```
Consumido por: KPI primario "Generada en [mes]" (total + sparkline).

## `GET /api/parques/{parqueId}/energia-dia?periodo=YYYY-MM-DD`

Ruta interna ya existente (`app/api/parques/[parqueId]/energia-dia/route.ts`),
consumida client-side por `fetch` (igual patrón que `ParkPerformanceView`).

**Response**:
```json
{ "registros": [ { "capturadoEn": "2026-01-15T08:00:00Z", "energiaDiaKwh": 12.3, "ingresoDia": 90.1, "energiaTotalKwh": 12.3, "energiaInyectadaDiaKwh": null, "energiaConsumidaDiaKwh": null } ] }
```
Consumido por: rango "1D" del chart de performance.

## Compatibilidad

Ningún contrato cambia de forma. El único cambio es *quién* los invoca: se agrega
GDCV como segundo consumidor de los mismos endpoints, con el mismo mapeo de estados
(loading/error/vacío/con-datos) que GDD.
