import { apiFetch } from "@/lib/api/client"
import { buildQuery, DEFAULT_PAGE_SIZE, emptyPage, toNumber, type PaginatedResponse } from "@/lib/api/paginated"
import type {
  CreateTipoCambioDto,
  Periodicidad,
  TipoCambio,
  TipoCambioTipo,
  UpdateTipoCambioDto,
} from "@/lib/api/types"

function normalize(raw: TipoCambio): TipoCambio {
  return { ...raw, valor: toNumber(raw.valor) }
}

export async function listTiposCambio(params: {
  page?: number
  limit?: number
  tipo?: TipoCambioTipo
  periodicidad?: Periodicidad
  desde?: string
  hasta?: string
}): Promise<PaginatedResponse<TipoCambio>> {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, tipo, periodicidad, desde, hasta } = params
  const result = await apiFetch<PaginatedResponse<TipoCambio>>(
    `/tipos-cambio${buildQuery({ page, limit, tipo, periodicidad, desde, hasta })}`
  )
  if (!result) return emptyPage(page, limit)
  return { ...result, items: result.items.map(normalize) }
}

export async function createTipoCambio(dto: CreateTipoCambioDto): Promise<TipoCambio | null> {
  const result = await apiFetch<TipoCambio>("/tipos-cambio", { method: "POST", body: dto })
  return result ? normalize(result) : null
}

export async function updateTipoCambio(id: string, dto: UpdateTipoCambioDto): Promise<TipoCambio | null> {
  const result = await apiFetch<TipoCambio>(`/tipos-cambio/${id}`, { method: "PATCH", body: dto })
  return result ? normalize(result) : null
}

export async function deleteTipoCambio(id: string): Promise<null> {
  await apiFetch(`/tipos-cambio/${id}`, { method: "DELETE" })
  return null
}
