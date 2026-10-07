# Data Model: Comparativa DIMMs vs Huawei en Detalle de Parque

## Entities

### `ConsolidadoMedidorPrincipal` (nuevo, `lib/api/types.ts`)

Forma real de lectura de `GET /parques/{parqueId}/medidor-principal/registros/consolidado?periodo=YYYY-MM` (confirmada por swagger, distinta del DTO de escritura — mismo criterio ya documentado para `RegistroEnergiaMensual`/`RegistroEnergiaDiario`).

```ts
export interface EstadisticaEnergiaConsolidada {
  suma: number | null       // Wh
  sumaKwh: number | null    // kWh — valor usado como "generación DIMMs" comparativa
  maximo: number | null     // Wh, pico de registro de 15 min
  promedio: number | null   // Wh, promedio por registro de 15 min
}

export interface ConsolidadoMedidorPrincipal {
  desde: string              // ISO 8601, inicio efectivo del rango
  hasta: string              // ISO 8601, fin efectivo del rango (exclusivo)
  totalRegistros: number
  energiaActivaExportadaKwh: number | null   // = total.energiaActivaExportada.sumaKwh
}
```

- **Validation rules**: `energiaActivaExportadaKwh` puede ser `null` (ningún registro informó el valor en el período) — se trata como "sin datos DIMMs para ese período", no como error (FR-010: no inventar/interpolar).
- Se mapea desde el `ConsolidadoDto` completo del backend, quedándose solo con los campos que la UI necesita (no se persiste `porTarifa` — fuera de alcance de esta comparativa).

### `ComparativaGeneracionPunto` (nuevo, `lib/energia-comparativa.ts`)

Punto de comparación para un mismo período, usado tanto por la card KPI como por el gráfico.

```ts
export interface ComparativaGeneracionPunto {
  periodo: string                 // "YYYY-MM"
  label: string                   // label de eje/leyenda (reusa formatPeriodoLabel)
  dimmsKwh: number | null         // null = sin dato DIMMS para ese período
  huaweiKwh: number | null        // null = sin dato Huawei para ese período
}
```

- **Relationships**: se construye combinando `ConsolidadoMedidorPrincipal[]` (uno por mes consultado) con `RegistroEnergiaMensual[]` (Huawei, ya existente), alineados por `periodo`.
- **State/derivation**: puramente derivado (no persistido); recalculado en cada fetch de página o cambio de rango de gráfico.

### Estado de disponibilidad de fuente (no una entidad de datos, sino un flag de UI)

```ts
type FuenteStatus = "ok" | "sin-datos" | "no-disponible" // no-disponible = falló la consulta (network/HTTP), sin-datos = respuesta ok pero valor null
```

- Se deriva por fuente (DIMMs, Huawei) y se usa para las indicaciones de FR-006/FR-007/FR-008 (ver research.md Decision 3).
