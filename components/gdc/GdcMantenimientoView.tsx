// components/gdc/GdcMantenimientoView.tsx
import { ParkMantenimientoView } from "@/components/mantenimiento/ParkMantenimientoView"
import type { Proyecto } from "@/lib/api/types"
import { listMantenimiento } from "@/lib/api/mantenimiento"

interface GdcMantenimientoViewProps {
  proyecto: Proyecto
  parqueId: string
  parqueNombreExterno: string | null
}

export async function GdcMantenimientoView({
  proyecto,
  parqueId,
  parqueNombreExterno,
}: GdcMantenimientoViewProps) {
  const data = await listMantenimiento(parqueId)

  return (
    <ParkMantenimientoView
      parkName={parqueNombreExterno ?? proyecto.nombre}
      modelType="GDC"
      data={data}
    />
  )
}
