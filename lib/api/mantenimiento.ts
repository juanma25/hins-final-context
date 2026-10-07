import { apiFetch } from "@/lib/api/client"
import type { RegistrarMantenimientoDto, RegistroMantenimiento } from "@/lib/api/types"

export async function listMantenimiento(parqueId: string): Promise<RegistroMantenimiento[]> {
  const result = await apiFetch<RegistroMantenimiento[]>(`/parques/${parqueId}/mantenimiento`)
  return result ?? []
}

export async function registrarMantenimiento(
  parqueId: string,
  dto: RegistrarMantenimientoDto
): Promise<RegistroMantenimiento | null> {
  return apiFetch<RegistroMantenimiento>(`/parques/${parqueId}/mantenimiento`, { method: "POST", body: dto })
}
