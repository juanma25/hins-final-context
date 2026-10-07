// components/gdcv/GdcvMantenimientoView.tsx
import { ParkMantenimientoView } from "@/components/mantenimiento/ParkMantenimientoView"
import type { Proyecto } from "@/lib/api/types"
import { listMantenimiento } from "@/lib/api/mantenimiento"

interface GdcvMantenimientoViewProps {
  proyecto: Proyecto
  parqueId: string
  parqueNombreExterno: string | null
}

export async function GdcvMantenimientoView({
  proyecto,
  parqueId,
  parqueNombreExterno,
}: GdcvMantenimientoViewProps) {
  const data = await listMantenimiento(parqueId)

  return (
    <ParkMantenimientoView
      parkName={parqueNombreExterno ?? proyecto.nombre}
      modelType="GDCV"
      data={data}
    />
  )
}
