import { apiFetch } from "@/lib/api/client"
import type { CreateSocioDto, Socio } from "@/lib/api/types"

export async function listSocios(parqueId: string): Promise<Socio[]> {
  const result = await apiFetch<Socio[]>(`/parques/${parqueId}/socios`)
  return result ?? []
}

export async function createSocio(parqueId: string, dto: CreateSocioDto): Promise<Socio | null> {
  return apiFetch<Socio>(`/parques/${parqueId}/socios`, { method: "POST", body: dto })
}
