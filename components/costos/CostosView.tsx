// components/costos/CostosView.tsx — Server Component compartido por /gdd, /gdc y /gdcv /costos
import { redirect } from "next/navigation"

import { CostosCrudView } from "@/components/costos/CostosCrudView"
import { UnauthorizedError } from "@/lib/api/client"
import { listCostos } from "@/lib/api/costos"
import { requireAdmin } from "@/lib/api/guards"
import { loadList } from "@/lib/api/load-list"
import { parsePage } from "@/lib/api/paginated"
import { listParquesByProyecto } from "@/lib/api/parques"
import type { Parque } from "@/lib/api/types"
import { parqueLabel } from "@/lib/parque-label"
import { resolveDashboardContext } from "@/lib/api/dashboard-context"

interface CostosViewProps {
  searchParams: Promise<{ proyectoId?: string; page?: string }>
}

export async function CostosView({ searchParams }: CostosViewProps) {
  await requireAdmin()

  const { proyectoId, page } = await searchParams
  if (!proyectoId) {
    return <p className="text-sm text-muted-foreground">Falta el parámetro proyectoId.</p>
  }

  let parques: Parque[]
  let currentParqueId: string | undefined
  try {
    parques = await listParquesByProyecto(proyectoId)
    currentParqueId = (await resolveDashboardContext(proyectoId))?.parque.id
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login")
    throw error
  }
  if (parques.length === 0) {
    return <p className="text-sm text-muted-foreground">Proyecto o parque no encontrado.</p>
  }

  const list = await loadList((p) => listCostos({ page: p, proyectoId }), parsePage(page))

  return (
    <CostosCrudView
      proyectoId={proyectoId}
      parques={parques.map((p, i) => ({ value: p.id, label: parqueLabel(p, i) }))}
      defaultParqueId={currentParqueId ?? parques[0].id}
      items={list.items}
      page={list.page}
      total={list.total}
      limit={list.limit}
      loadError={list.loadError}
    />
  )
}
