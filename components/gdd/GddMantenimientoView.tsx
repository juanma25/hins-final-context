// components/gdd/GddMantenimientoView.tsx
import { ParkMantenimientoView } from "@/components/mantenimiento/ParkMantenimientoView"
import type { Proyecto } from "@/lib/api/types"
import { listMantenimiento } from "@/lib/api/mantenimiento"

interface GddMantenimientoViewProps {
  proyecto: Proyecto
  parqueId: string
  parqueNombreExterno: string | null
}

export async function GddMantenimientoView({
  proyecto,
  parqueId,
  parqueNombreExterno,
}: GddMantenimientoViewProps) {
  const data = await listMantenimiento(parqueId)

  return (
    <ParkMantenimientoView
      parkName={parqueNombreExterno ?? proyecto.nombre}
      modelType="GDD"
      data={data}
    />
  )
}
