import type { Socio, TipoCargo } from "@/lib/api/types"
import type { SocioRow } from "@/data/gdcv-mock"

export const TIPO_CARGO_LABELS: Record<TipoCargo, string> = {
  CON_POTENCIA: "Con Potencia",
  SIN_POTENCIA: "Sin Potencia",
}

/**
 * potenciaAsociada/energiaGenerada/ahorroGenerado y medidores (multi-medidor) no
 * tienen equivalente en el contrato real de Socio — se degradan a "—"/undefined
 * en vez de inventar un valor (ver specs/006-socios-gdcv-crud/data-model.md).
 */
export function mapSocioToRow(socio: Socio): SocioRow {
  return {
    id: socio.id,
    nombre: socio.nombre,
    medidor: socio.medidorNumero,
    participacion: `${socio.participacionPorcentaje}%`,
    potenciaAsociada: "—",
    energiaGenerada: "—",
    ahorroGenerado: "—",
  }
}
