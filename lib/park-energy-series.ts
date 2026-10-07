import type { RegistroEnergiaDia, RegistroEnergiaDiario, RegistroEnergiaMensual } from "@/lib/api/types"
import { formatCurrency } from "@/lib/format-currency"
import { formatPeriodoLabel } from "@/lib/format-periodo"
import type { ChartRangeChip } from "@/types/chart-range"
import type { ConsumptionHistoryRow } from "@/data/gdd-performance-mock"

export type ParkEnergyRow = {
  label: string
  generated: number
  hasData: boolean
}

function sortByPeriodoAscDeduped(registros: RegistroEnergiaMensual[]): RegistroEnergiaMensual[] {
  const byPeriodo = new Map<string, RegistroEnergiaMensual>()
  for (const registro of registros) {
    byPeriodo.set(registro.periodo, registro)
  }
  return [...byPeriodo.values()].sort((a, b) => a.periodo.localeCompare(b.periodo))
}

/**
 * Mapea registros mensuales reales a las filas que ya consume ParkEnergyBarChart,
 * acotando por rango. Cada registro es ya un punto mensual — no se agrega/suma
 * nada dentro de un bucket (ver research.md Decision 3).
 */
export function getRealParkEnergySeries(
  registros: RegistroEnergiaMensual[],
  range: ChartRangeChip
): ParkEnergyRow[] {
  const sorted = sortByPeriodoAscDeduped(registros)

  const sliced = (() => {
    switch (range) {
      case "6m":
        return sorted.slice(-6)
      case "1a":
        return sorted.slice(-12)
      case "todo":
        return sorted
      case "1m":
      case "1d":
      default:
        return []
    }
  })()

  return sliced.map((registro) => ({
    label: formatPeriodoLabel(registro.periodo),
    generated: registro.energiaMesKwh ?? 0,
    hasData: registro.energiaMesKwh !== null && registro.energiaMesKwh !== undefined,
  }))
}

function formatKwh(value: number): string {
  return `${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })} kWh`
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`
}

/**
 * Filas de la tabla "Historial de Generación" (ConsumptionHistoryTable) con
 * datos reales para período y energía generada. El resto de las columnas
 * (adquirida, otras fuentes, total, porcentajes, ahorro) no tiene equivalente
 * en GET /parques/{parqueId}/energia y se muestra en 0 por decisión explícita
 * del usuario — no hay excepción-mock que resolver, es el valor real.
 */
export function getGenerationHistoryRows(
  registros: RegistroEnergiaMensual[]
): ConsumptionHistoryRow[] {
  const sorted = sortByPeriodoAscDeduped(registros).reverse()

  return sorted.map((registro) => ({
    period: formatPeriodoLabel(registro.periodo),
    energyGenerated: formatKwh(registro.energiaMesKwh ?? 0),
    energyAcquired: formatKwh(0),
    energyFromOtherSources: formatKwh(0),
    totalEnergy: formatKwh(0),
    acquiredPercent: formatPercent(0),
    totalPercent: formatPercent(0),
    estimatedSavings: formatCurrency(0, "ars", "full"),
  }))
}

function sortByFechaAscDeduped(registros: RegistroEnergiaDiario[]): RegistroEnergiaDiario[] {
  const byFecha = new Map<string, RegistroEnergiaDiario>()
  for (const registro of registros) {
    byFecha.set(registro.fecha, registro)
  }
  return [...byFecha.values()].sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/** Suma de energiaDiaKwh del mes (nulls tratados como 0) — total de la card destacada. */
export function getMonthlyGenerationTotal(registros: RegistroEnergiaDiario[]): number {
  return sortByFechaAscDeduped(registros).reduce(
    (total, registro) => total + (registro.energiaDiaKwh ?? 0),
    0
  )
}

/** Un punto por día real, orden cronológico — sparkline de la card destacada. */
export function getMonthlySparklinePoints(registros: RegistroEnergiaDiario[]): { value: number }[] {
  return sortByFechaAscDeduped(registros).map((registro) => ({
    value: registro.energiaDiaKwh ?? 0,
  }))
}

/**
 * Si el endpoint diario puntual devuelve más de un registro para el mismo día,
 * se usa el de `capturadoEn` más reciente — ver research.md Decision 2.
 */
export function getRegistroMasRecienteDelDia(registros: RegistroEnergiaDia[]): RegistroEnergiaDia | null {
  if (registros.length === 0) {
    return null
  }
  return [...registros].sort((a, b) => b.capturadoEn.localeCompare(a.capturadoEn))[0]
}

/** Registros del día ordenados por `capturadoEn` ascendente — serie horaria real para graficar. */
export function getRegistrosDelDiaOrdenados(registros: RegistroEnergiaDia[]): RegistroEnergiaDia[] {
  return [...registros].sort((a, b) => a.capturadoEn.localeCompare(b.capturadoEn))
}

/**
 * Registro mensual del mes calendario actual dentro de la misma serie ya
 * consultada para 6M/1A/TODO — sin pedido adicional al backend (research.md
 * Decision 4).
 */
export function getRegistroDelMesActual(
  registros: RegistroEnergiaMensual[],
  periodoActual: string
): RegistroEnergiaMensual | null {
  return registros.find((registro) => registro.periodo === periodoActual) ?? null
}
