// app/gdd/mantenimiento/page.tsx
import { redirect } from "next/navigation"
import { GddMantenimientoView } from "@/components/gdd/GddMantenimientoView"
import { resolveDashboardContext, type DashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"

interface GddMantenimientoPageProps {
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

export default async function GddMantenimientoPage({ searchParams }: GddMantenimientoPageProps) {
  const { proyectoId } = await searchParams
  if (!proyectoId) {
    return <p className="text-sm text-muted-foreground">Falta el parámetro proyectoId.</p>
  }

  const context = await loadContext(proyectoId)
  if (!context) {
    return <p className="text-sm text-muted-foreground">Proyecto o parque no encontrado.</p>
  }

  return (
    <GddMantenimientoView
      proyecto={context.proyecto}
      parqueId={context.parque.id}
      parqueNombreExterno={context.parque.nombreExterno}
    />
  )
}
