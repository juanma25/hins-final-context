import type { Parque } from "@/lib/api/types"
import type { ParkDetailsMetric } from "@/components/ui/park-details-card"
import { formatNullable } from "@/lib/utils"

function formatFechaPuestaEnMarcha(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" })
}

/**
 * Métricas reales del Parque para ParkDetailsCard. "Potencia Acople" y
 * "Equipamiento" del mock original eran a nivel Dispositivo, sin equivalente
 * en Parque — se reemplazan por Dirección y Contacto (también reales).
 */
export function parqueToDetailsMetrics(
  parque: Parque
): readonly [ParkDetailsMetric, ParkDetailsMetric, ParkDetailsMetric, ParkDetailsMetric] {
  return [
    { label: "Capacidad Instalada", value: `${parque.potenciaTotalKwp} kWp` },
    { label: "Fecha de Inicio", value: formatFechaPuestaEnMarcha(parque.fechaPuestaEnMarcha) },
    { label: "Dirección", value: formatNullable(parque.direccion) },
    { label: "Contacto", value: formatNullable(parque.contactoNombre) },
  ] as const
}
