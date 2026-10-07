import { apiFetch } from "@/lib/api/client"
import { buildQuery, DEFAULT_PAGE_SIZE, emptyPage, toNumber, type PaginatedResponse } from "@/lib/api/paginated"
import type { Costo, CreateCostoDto, UpdateCostoDto } from "@/lib/api/types"

function normalize(raw: Costo): Costo {
  return { ...raw, valor: toNumber(raw.valor) }
}

export async function listCostos(params: {
  page?: number
  limit?: number
  proyectoId?: string
  parqueId?: string
}): Promise<PaginatedResponse<Costo>> {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, proyectoId, parqueId } = params
  const result = await apiFetch<PaginatedResponse<Costo>>(`/costos${buildQuery({ page, limit, proyectoId, parqueId })}`)
  if (!result) return emptyPage(page, limit)
  return { ...result, items: result.items.map(normalize) }
}

export async function createCosto(dto: CreateCostoDto): Promise<Costo | null> {
  const result = await apiFetch<Costo>("/costos", { method: "POST", body: dto })
  return result ? normalize(result) : null
}

export async function updateCosto(id: string, dto: UpdateCostoDto): Promise<Costo | null> {
  const result = await apiFetch<Costo>(`/costos/${id}`, { method: "PATCH", body: dto })
  return result ? normalize(result) : null
}

export async function deleteCosto(id: string): Promise<null> {
  await apiFetch(`/costos/${id}`, { method: "DELETE" })
  return null
}
