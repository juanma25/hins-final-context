# Data Model: Gráficos GDCV desde backend

No se introducen entidades ni tipos nuevos. Esta feature conecta UI existente de
GDCV a entidades ya definidas en `lib/api/types.ts` y ya consumidas por GDD.

## Entidades reutilizadas

### `Parque` (existente)
Ya recibido como prop en `GdcvPerformanceView` (`parque: Parque`). Sin cambios.

### `RegistroEnergiaMensual` (existente)
```ts
interface RegistroEnergiaMensual {
  periodo: string            // "YYYY-MM"
  energiaMesKwh: number | null
  ingresoMes: number | null
}
```
Fuente: `listEnergia(parqueId)` → `GET /parques/{id}/energia`.
Uso en GDCV: rangos 6M/1A/TODO/1M del chart de performance (idéntico a GDD).

### `RegistroEnergiaDiario` (existente)
```ts
interface RegistroEnergiaDiario {
  fecha: string               // "YYYY-MM-DD"
  energiaDiaKwh: number | null
  ingresoDia: number | null
}
```
Fuente: `listEnergiaDiaria(parqueId, periodo)` → `GET /parques/{id}/energia?periodo=YYYY-MM`.
Uso en GDCV: total y sparkline del KPI primario "Generada en [mes]" (idéntico a GDD).

### `RegistroEnergiaDia` (existente)
```ts
interface RegistroEnergiaDia {
  capturadoEn: string
  energiaDiaKwh: number | null
  ingresoDia: number | null
  energiaTotalKwh: number | null
  energiaInyectadaDiaKwh: number | null
  energiaConsumidaDiaKwh: number | null
}
```
Fuente: `GET /api/parques/{id}/energia-dia?periodo=YYYY-MM-DD` (ruta interna ya
existente, usada hoy por GDD). Uso en GDCV: rango "1D" del chart de performance.

## Estados de la vista (derivados, no persistidos)

Mismo modelo de estados que `ParkPerformanceView` (GDD), aplicado a
`GdcvPerformanceView`:

- **Loading** (rango "1D"): mientras la petición a `energia-dia` está en vuelo.
- **Error**: `registrosEnergia === null` (falla `listEnergia`) o el fetch de
  `energia-dia` rechaza — muestra mensaje + botón "Reintentar", nunca sustituye por
  mock (FR-006).
- **Vacío**: `registrosEnergia` es `[]` o el rango calculado no tiene puntos — muestra
  "Sin registros de energía para este período" (FR-005).
- **Con datos**: pinta `ParkEnergyBarChart` / `DailyEnergyTotalsBlock` con los datos
  reales.

## Mapeo de props: antes → después

`GdcvPerformanceView` deja de auto-resolver datos mock y pasa a recibir por props lo
mismo que ya recibe `ParkPerformanceView`:

| Prop nueva | Tipo | Reemplaza |
|---|---|---|
| `registrosEnergia` | `RegistroEnergiaMensual[] \| null` | `getGdcvEnergySeries` / `gdcvGeneradaAbril` (mock) |
| `registrosEnergiaDiaria` | `RegistroEnergiaDiario[] \| null` | `gdcvGenerationSparkline` (mock) |
| `periodoActual` | `string` (`"YYYY-MM"`) | — (nuevo, resuelto en servidor) |

`parque` se mantiene sin cambios (ya era real).

## Fuera de alcance (sin cambios en esta feature)

- **`Socio` / tabla de socios**: entidad backend existe (`lib/api/types.ts`), pero no
  hay endpoint de energía/medidores por socio — `SociosTable` sigue en
  `sociosMock` (ver research.md Decision 4).
- **ROI — tabla de recupero y curva de proyección**: sin endpoint de proyección
  histórica/futura; excepción ya documentada, igual que en GDD.
- **KPIs "ahorro total" / "promedio por usuario"**: sin campo equivalente en el
  contrato de energía (ver research.md Decision 3).
