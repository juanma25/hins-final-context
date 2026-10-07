import { apiFetch } from "@/lib/api/client"
import type { Dispositivo } from "@/lib/api/types"

/** El backend ya ordena por ultimaSincronizacion descendente. */
export async function listDispositivos(parqueId: string): Promise<Dispositivo[]> {
  const result = await apiFetch<Dispositivo[]>(`/parques/${parqueId}/dispositivos`)
  return result ?? []
}
