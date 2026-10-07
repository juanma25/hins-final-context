// components/mantenimiento/ParkMantenimientoView.tsx
import { MantenimientoHistorialTable } from "@/components/mantenimiento/MantenimientoHistorialTable"
import { ModelBadge, type ParkModel } from "@/components/ui/model-badge"
import type { RegistroMantenimiento } from "@/lib/api/types"

interface ParkMantenimientoViewProps {
  parkName: string
  modelType: ParkModel
  data: RegistroMantenimiento[]
}

export function ParkMantenimientoView({
  parkName,
  modelType,
  data,
}: ParkMantenimientoViewProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <header>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="min-w-0 max-w-full text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {parkName}
          </h1>
          <ModelBadge model={modelType} />
        </div>
      </header>

      <MantenimientoHistorialTable data={data} />
    </div>
  )
}
