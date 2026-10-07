// app/gdd/roi/page.tsx
import { redirect } from "next/navigation"
import { GddPageHeading } from "@/components/gdd/GddPageHeading"
import { GddRoiView } from "@/components/gdd/GddRoiView"
import { resolveDashboardContext, type DashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"
import { listRoi } from "@/lib/api/roi"
import { computeRealRoiKpis } from "@/lib/roi-kpis"

interface GddRoiPageProps {
  searchParams: Promise<{ proyectoId?: string }>
}

async function loadContext(proyectoId: string): Promise<DashboardContext | null> {
  try {
    return await resolveDashboardContext(proyectoId)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    throw error
  }
}

export default async function GddRoiPage({ searchParams }: GddRoiPageProps) {
  const { proyectoId } = await searchParams
  if (!proyectoId) {
    return <p className="text-sm text-muted-foreground">Falta el parámetro proyectoId.</p>
  }

  const context = await loadContext(proyectoId)
  if (!context) {
    return <p className="text-sm text-muted-foreground">Proyecto o parque no encontrado.</p>
  }

  const registros = await listRoi(context.parque.id)
  const realKpis = computeRealRoiKpis(registros)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <GddPageHeading />
      <GddRoiView realKpis={realKpis} />
    </div>
  )
}
