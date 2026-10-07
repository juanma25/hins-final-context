import { apiFetch } from "@/lib/api/client"
import type { Alarma, EstadoAlarma } from "@/lib/api/types"

/** El backend ya ordena por fechaGenerada descendente. */
export async function listAlarmas(parqueId: string, estado?: EstadoAlarma): Promise<Alarma[]> {
  const query = estado ? `?estado=${estado}` : ""
  const result = await apiFetch<Alarma[]>(`/parques/${parqueId}/alarmas${query}`)
  return result ?? []
}
