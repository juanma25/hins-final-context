import { apiFetch } from "@/lib/api/client"
import { buildQuery, DEFAULT_PAGE_SIZE, emptyPage, toNumber, type PaginatedResponse } from "@/lib/api/paginated"
import type { CreateTarifaDto, Tarifa, UpdateTarifaDto } from "@/lib/api/types"

function normalize(raw: Tarifa): Tarifa {
  return { ...raw, valorEnergia: toNumber(raw.valorEnergia), valorInyeccion: toNumber(raw.valorInyeccion) }
}

export async function listTarifas(params: {
  page?: number
  limit?: number
  nombre?: string
}): Promise<PaginatedResponse<Tarifa>> {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, nombre } = params
  const result = await apiFetch<PaginatedResponse<Tarifa>>(`/tarifas${buildQuery({ page, limit, nombre })}`)
  if (!result) return emptyPage(page, limit)
  return { ...result, items: result.items.map(normalize) }
}

export async function createTarifa(dto: CreateTarifaDto): Promise<Tarifa | null> {
  const result = await apiFetch<Tarifa>("/tarifas", { method: "POST", body: dto })
  return result ? normalize(result) : null
}

export async function updateTarifa(id: string, dto: UpdateTarifaDto): Promise<Tarifa | null> {
  const result = await apiFetch<Tarifa>(`/tarifas/${id}`, { method: "PATCH", body: dto })
  return result ? normalize(result) : null
}

export async function deleteTarifa(id: string): Promise<null> {
  await apiFetch(`/tarifas/${id}`, { method: "DELETE" })
  return null
}
