import type { RegistroRoi } from "@/lib/api/types"

export interface RealRoiKpis {
  totalInvertido: number
  inversionRecuperada: number
  porcentajeRecuperado: number
  pendienteRecuperar: number
  tir: string
}

/**
 * KPIs de ROI directamente derivables de RegistroRoi (el registro más reciente
 * por periodo). "Recupero Estimado", "Plazo" y el timeline/curva de proyección
 * NO tienen equivalente en el contrato (no hay fecha de inicio/payback total
 * ni escenarios optimista/conservador) — se mantienen mock, misma excepción
 * documentada para las vistas de Performance (ver data-model.md).
 */
export function computeRealRoiKpis(registros: RegistroRoi[]): RealRoiKpis | null {
  if (registros.length === 0) return null

  const latest = [...registros].sort((a, b) => b.periodo.localeCompare(a.periodo))[0]
  const porcentajeRecuperado =
    latest.inversionMeta > 0 ? (latest.creditoAcumulado / latest.inversionMeta) * 100 : 0

  return {
    totalInvertido: latest.inversionMeta,
    inversionRecuperada: latest.creditoAcumulado,
    porcentajeRecuperado,
    pendienteRecuperar: Math.max(latest.inversionMeta - latest.creditoAcumulado, 0),
    tir: latest.tir !== null ? `${(latest.tir * 100).toFixed(2)}%` : "—",
  }
}
