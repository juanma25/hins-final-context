import { apiFetch } from "@/lib/api/client"
import type { RegistrarRoiDto, RegistroRoi } from "@/lib/api/types"

export async function listRoi(parqueId: string): Promise<RegistroRoi[]> {
  const result = await apiFetch<RegistroRoi[]>(`/parques/${parqueId}/roi`)
  return result ?? []
}

export async function registrarRoi(parqueId: string, dto: RegistrarRoiDto): Promise<RegistroRoi | null> {
  return apiFetch<RegistroRoi>(`/parques/${parqueId}/roi`, { method: "POST", body: dto })
}
