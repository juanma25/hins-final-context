import { apiFetch } from "@/lib/api/client"
import type { CreateParqueDto, Parque } from "@/lib/api/types"

export async function getParque(id: string): Promise<Parque | null> {
  return apiFetch<Parque>(`/parques/${id}`)
}

export async function createParque(dto: CreateParqueDto): Promise<Parque | null> {
  return apiFetch<Parque>("/parques", { method: "POST", body: dto })
}

/** Lista los parques de un proyecto (`GET /proyectos/{proyectoId}/parques`, publicado en el swagger del backend). */
export async function listParquesByProyecto(proyectoId: string): Promise<Parque[]> {
  const result = await apiFetch<Parque[]>(`/proyectos/${proyectoId}/parques`)
  return result ?? []
}

/** Primer parque de un proyecto — asume 1 parque por proyecto en el uso actual del producto. */
export async function getPrimaryParque(proyectoId: string): Promise<Parque | null> {
  const parques = await listParquesByProyecto(proyectoId)
  return parques[0] ?? null
}
