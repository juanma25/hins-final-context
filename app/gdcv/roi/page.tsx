// app/gdcv/roi/page.tsx
import { redirect } from "next/navigation"
import { GdcvPageHeading } from "@/components/gdcv/GdcvPageHeading"
import { GdcvRoiView } from "@/components/gdcv/GdcvRoiView"
import { resolveDashboardContext, type DashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"
import { listRoi } from "@/lib/api/roi"
import { computeRealRoiKpis } from "@/lib/roi-kpis"

interface GdcvRoiPageProps {
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

export default async function GdcvRoiPage({ searchParams }: GdcvRoiPageProps) {
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
      <GdcvPageHeading />
      <GdcvRoiView realKpis={realKpis} />
    </div>
  )
}
