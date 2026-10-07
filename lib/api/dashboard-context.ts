import { getProyecto } from "@/lib/api/proyectos"
import { getPrimaryParque } from "@/lib/api/parques"
import type { Parque, Proyecto } from "@/lib/api/types"

export interface DashboardContext {
  proyecto: Proyecto
  parque: Parque
}

/**
 * Resuelve el Proyecto + Parque real a partir del `proyectoId` en la URL
 * (ver lib/project-presentation.ts hrefForModelo). Usado por cada página de
 * dashboard (mantenimiento, alarmas, dispositivos, energía, roi, socios) para
 * evitar repetir esta resolución. Retorna null si el proyecto no existe o no
 * tiene un parque asociado — la página decide cómo mostrar ese estado.
 */
export async function resolveDashboardContext(proyectoId: string): Promise<DashboardContext | null> {
  const proyecto = await getProyecto(proyectoId)
  if (!proyecto) return null

  const parque = await getPrimaryParque(proyectoId)
  if (!parque) return null

  return { proyecto, parque }
}
