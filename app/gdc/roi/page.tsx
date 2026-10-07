// app/gdc/roi/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ModelBadge } from "@/components/ui/model-badge"
import { resolveDashboardContext, type DashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"

interface GdcRoiPageProps {
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

export default async function GdcRoiPage({ searchParams }: GdcRoiPageProps) {
  const { proyectoId } = await searchParams
  if (!proyectoId) {
    return <p className="text-sm text-muted-foreground">Falta el parámetro proyectoId.</p>
  }

  const context = await loadContext(proyectoId)
  if (!context) {
    return <p className="text-sm text-muted-foreground">Proyecto o parque no encontrado.</p>
  }

  const parkName = context.parque.nombreExterno ?? context.proyecto.nombre

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <header>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="min-w-0 max-w-full text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {parkName}
          </h1>
          <ModelBadge model="GDC" />
        </div>
      </header>
      <p className="text-sm text-muted-foreground">
        Retorno de inversión GDC — próximamente.
      </p>
      <Button asChild variant="outline" className="w-fit shadow-xs">
        <Link href={`/gdc/mantenimiento?proyectoId=${proyectoId}`}>Ir a Mantenimiento</Link>
      </Button>
    </div>
  )
}
