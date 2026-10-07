import type { Periodicidad, TipoCambioTipo, TipoCosto } from "@/lib/api/types"

export interface SelectOption<V extends string = string> {
  value: V
  label: string
}

/** Única fuente de opciones para formularios y filtros de configuración de admin. */
export const MONEDAS: readonly SelectOption[] = [
  { value: "ARS", label: "ARS" },
  { value: "USD", label: "USD" },
]

export const TIPOS_COSTO: readonly SelectOption<TipoCosto>[] = [
  { value: "FIJO", label: "Fijo" },
  { value: "VARIABLE", label: "Variable" },
]

export const PERIODICIDADES: readonly SelectOption<Periodicidad>[] = [
  { value: "DIARIA", label: "Diaria" },
  { value: "MENSUAL", label: "Mensual" },
  { value: "ANUAL", label: "Anual" },
]

export const TIPOS_CAMBIO: readonly SelectOption<TipoCambioTipo>[] = [
  { value: "PROYECTO", label: "Proyecto" },
  { value: "REAL", label: "Real" },
]

export const UNIDAD_TIPO_CAMBIO = "ARS/USD" as const

export const UNIDADES_SUGERIDAS: readonly string[] = ["ARS/kWh", "USD/kWh", "mensual", "anual", "kWh"]

export function labelOf(options: readonly SelectOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}
