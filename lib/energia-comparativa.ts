import type {
  ConsolidadoMedidorPrincipal,
  RegistroEnergiaDia,
  RegistroEnergiaMensual,
  RegistroMedidorPrincipal,
} from "@/lib/api/types"
import { formatPeriodoLabel } from "@/lib/format-periodo"

/** Estado de la consulta DIMMs para el período actual — ver app/gdcv/performance/page.tsx. */
export type RegistroDimmsMesActual =
  | { status: "ok"; registro: ConsolidadoMedidorPrincipal }
  | { status: "sin-medidor" }
  | { status: "error" }

export interface RegistroDimmsPorPeriodo {
  periodo: string
  dato: ConsolidadoMedidorPrincipal | null
}

/**
 * Punto de comparación DIMMs (principal) vs Huawei (secundario) para un mismo
 * período — null en cualquiera de los dos campos significa "sin dato para ese
 * período en esa fuente", nunca un valor inventado/interpolado (FR-010).
 */
export interface ComparativaGeneracionPunto {
  periodo: string
  label: string
  dimmsKwh: number | null
  huaweiKwh: number | null
}

/** Punto de comparación para el período actualmente consultado (card KPI). */
export function buildComparativaGeneracionMesActual(
  periodo: string,
  dimms: ConsolidadoMedidorPrincipal | null,
  huawei: RegistroEnergiaMensual | null
): ComparativaGeneracionPunto {
  return {
    periodo,
    label: formatPeriodoLabel(periodo),
    dimmsKwh: dimms?.energiaActivaExportadaKwh ?? null,
    huaweiKwh: huawei?.energiaMesKwh ?? null,
  }
}

/**
 * Serie comparativa multi-mes para el gráfico de rango (6M/1A), alineando por
 * `periodo` los consolidados DIMMs (uno por mes consultado) con la serie
 * mensual de Huawei ya existente.
 */
export function buildComparativaGeneracionSeries(
  dimmsPorPeriodo: { periodo: string; dato: ConsolidadoMedidorPrincipal | null }[],
  huawei: RegistroEnergiaMensual[]
): ComparativaGeneracionPunto[] {
  const dimmsByPeriodo = new Map(dimmsPorPeriodo.map(({ periodo, dato }) => [periodo, dato]))
  const huaweiByPeriodo = new Map(huawei.map((r) => [r.periodo, r]))

  const periodos = [...new Set([...dimmsByPeriodo.keys(), ...huaweiByPeriodo.keys()])].sort(
    (a, b) => a.localeCompare(b)
  )

  return periodos.map((periodo) => ({
    periodo,
    label: formatPeriodoLabel(periodo),
    dimmsKwh: dimmsByPeriodo.get(periodo)?.energiaActivaExportadaKwh ?? null,
    huaweiKwh: huaweiByPeriodo.get(periodo)?.energiaMesKwh ?? null,
  }))
}

/**
 * Hora del día en Argentina (UTC-3 fijo, sin DST) para un timestamp ISO
 * 8601, sea cual sea su offset original (DIMMs trae `-03:00` explícito,
 * Huawei trae `Z`/UTC) — parsea a instante UTC real y resta 3hs, en vez de
 * leer los dígitos crudos del string o depender de `Date#getHours()`
 * (que usa la zona horaria del runtime, no necesariamente Argentina).
 */
function hourOf(iso: string): number {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return Number.NaN
  return (date.getUTCHours() + 24 - 3) % 24
}

export interface ComparativaGeneracionDiariaPunto {
  label: string
  dimmsKwh: number | null
  huaweiKwh: number | null
}

/**
 * Serie comparativa por hora para el gráfico 1D, alineando el medidor
 * principal (DIMMs, deltas de intervalo acumulados hora a hora) con Huawei
 * (ya reportado como acumulado-al-momento-de-captura). Un punto solo por
 * cada hora con al menos un registro en alguna de las dos fuentes — no se
 * fabrica una grilla de 24 horas ni se interpola (FR-010). `null` en un
 * campo significa "esa fuente no tiene datos en absoluto para el día"; un
 * registro con delta `null` cuenta como 0 (no es un hueco fabricado, es el
 * dato real del intervalo).
 */
export function buildComparativaGeneracionDiaria(
  dimmsRegistros: RegistroMedidorPrincipal[],
  huaweiRegistros: RegistroEnergiaDia[]
): ComparativaGeneracionDiariaPunto[] {
  const huaweiSorted = [...huaweiRegistros].sort((a, b) => a.capturadoEn.localeCompare(b.capturadoEn))

  const hours = [
    ...new Set([
      ...dimmsRegistros.map((r) => hourOf(r.fechaHora)),
      ...huaweiSorted.map((r) => hourOf(r.capturadoEn)),
    ]),
  ]
    .filter((h) => !Number.isNaN(h))
    .sort((a, b) => a - b)

  return hours.map((hour) => {
    const dimmsKwh =
      dimmsRegistros.length === 0
        ? null
        : dimmsRegistros
            .filter((r) => hourOf(r.fechaHora) <= hour)
            .reduce((sum, r) => sum + (r.energiaActivaExportadaWh ?? 0), 0) / 1000

    const huaweiUpToHour = huaweiSorted.filter((r) => hourOf(r.capturadoEn) <= hour)
    const huaweiKwh = huaweiUpToHour.length === 0 ? null : (huaweiUpToHour.at(-1)?.energiaDiaKwh ?? null)

    return {
      label: `${String(hour).padStart(2, "0")}:00`,
      dimmsKwh,
      huaweiKwh,
    }
  })
}

/** Filas listas para `ParkEnergyBarChart` `variant="comparative"` (mismo `label`/`dimmsKwh`/`huaweiKwh`). */
export function getComparativaGeneracionChartRows(
  dimmsPorPeriodo: { periodo: string; dato: ConsolidadoMedidorPrincipal | null }[],
  huawei: RegistroEnergiaMensual[]
): { label: string; dimmsKwh: number | null; huaweiKwh: number | null }[] {
  return buildComparativaGeneracionSeries(dimmsPorPeriodo, huawei).map(({ label, dimmsKwh, huaweiKwh }) => ({
    label,
    dimmsKwh,
    huaweiKwh,
  }))
}
