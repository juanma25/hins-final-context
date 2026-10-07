import { apiFetch } from "@/lib/api/client"
import type { ConsolidadoMedidorPrincipal, RegistroMedidorPrincipal } from "@/lib/api/types"

/**
 * El backend serializa campos Decimal (Prisma) como string en JSON para no
 * perder precisión — `EstadisticaEnergiaDto`/`RegistroHistoricoDto` los
 * tipan como `number` en swagger pero en runtime pueden llegar como string.
 * Sin coerción, sumarlos concatena strings en vez de sumar (bug real
 * observado: valores astronómicos en el gráfico 1D). `""`/no numérico → null.
 */
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

interface EstadisticaEnergiaDto {
  suma: number | string | null
  sumaKwh: number | string | null
  maximo: number | string | null
  promedio: number | string | null
}

interface ConsolidadoDto {
  desde: string
  hasta: string
  total: {
    registros: number
    energiaActivaExportada: EstadisticaEnergiaDto
  }
}

/**
 * Registros consolidados del medidor principal (DIMMs) del parque para un
 * período — fuente principal de la comparativa. `null` cuando el parque no
 * tiene medidor principal configurado (404, condición de negocio, no error).
 * Ver specs/012-comparativa-dimms-huawei/contracts/medidor-principal-consolidado.md.
 */
export async function getConsolidadoMedidorPrincipal(
  parqueId: string,
  periodo: string
): Promise<ConsolidadoMedidorPrincipal | null> {
  const dto = await apiFetch<ConsolidadoDto>(
    `/parques/${parqueId}/medidor-principal/registros/consolidado?periodo=${periodo}`
  )
  if (!dto) return null

  return {
    desde: dto.desde,
    hasta: dto.hasta,
    totalRegistros: dto.total.registros,
    energiaActivaExportadaKwh: toNumberOrNull(dto.total.energiaActivaExportada.sumaKwh),
  }
}

interface RegistroHistoricoDto {
  fechaHora: string
  energiaActivaExportada: number | string | null
}

/**
 * Registros crudos del medidor principal (DIMMs) en una ventana — fuente
 * principal de la comparativa diaria (gráfico 1D). Cada registro es el
 * delta de energía de su intervalo (confirmado, no una lectura acumulada).
 * `desde`/`hasta` van tal cual como querystring — el caller resuelve el
 * rango horario (ver lib/argentina-day-range.ts). `[]` en 404 (sin medidor
 * principal) — mismo criterio que el resto de las listas de este módulo.
 */
export async function listRegistrosMedidorPrincipal(
  parqueId: string,
  desde: string,
  hasta: string
): Promise<RegistroMedidorPrincipal[]> {
  const params = new URLSearchParams({ desde, hasta })
  const registros = await apiFetch<RegistroHistoricoDto[]>(
    `/parques/${parqueId}/medidor-principal/registros?${params.toString()}`
  )
  return (registros ?? []).map((r) => ({
    fechaHora: r.fechaHora,
    energiaActivaExportadaWh: toNumberOrNull(r.energiaActivaExportada),
  }))
}
