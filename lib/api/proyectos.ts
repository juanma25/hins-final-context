import { apiFetch } from "@/lib/api/client"
import type { CreateProyectoDto, Proyecto } from "@/lib/api/types"

export async function listProyectos(): Promise<Proyecto[]> {
  const result = await apiFetch<Proyecto[]>("/proyectos")
  return result ?? []
}

export async function createProyecto(dto: CreateProyectoDto): Promise<Proyecto | null> {
  return apiFetch<Proyecto>("/proyectos", { method: "POST", body: dto })
}

/**
 * El contrato no expone GET /proyectos/{id} — se resuelve filtrando el
 * listado completo. Aceptable dado el volumen esperado de proyectos.
 */
export async function getProyecto(id: string): Promise<Proyecto | null> {
  const proyectos = await listProyectos()
  return proyectos.find((p) => p.id === id) ?? null
}
