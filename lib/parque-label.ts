import type { Parque } from "@/lib/api/types"

/** Nombre legible de un parque para selectores y columnas. */
export function parqueLabel(parque: Pick<Parque, "nombreExterno">, index: number): string {
  return parque.nombreExterno?.trim() || `Parque ${index + 1}`
}
