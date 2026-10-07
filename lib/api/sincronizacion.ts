import { apiFetch } from "@/lib/api/client"
import type {
  ActualizarConfiguracionSincronizacionDto,
  ConfiguracionSincronizacionDto,
  ModeloSincronizado,
  RegistroEjecucionSincronizacionDto,
} from "@/lib/api/types"

export async function listConfiguraciones(): Promise<ConfiguracionSincronizacionDto[]> {
  const result = await apiFetch<ConfiguracionSincronizacionDto[]>("/sincronizacion/configuraciones")
  return result ?? []
}

export async function updateConfiguracion(
  modelo: ModeloSincronizado,
  dto: ActualizarConfiguracionSincronizacionDto
): Promise<Pick<ConfiguracionSincronizacionDto, "modelo" | "intervaloMs" | "habilitado"> | null> {
  if (dto.intervaloMs !== undefined && dto.intervaloMs < 1) {
    throw new Error("intervaloMs debe ser mayor o igual a 1")
  }
  return apiFetch(`/sincronizacion/configuraciones/${modelo}`, { method: "PATCH", body: dto })
}

export async function listLogs(
  modelo: ModeloSincronizado,
  limit?: number
): Promise<RegistroEjecucionSincronizacionDto[]> {
  const query = `?modelo=${modelo}${limit !== undefined ? `&limit=${limit}` : ""}`
  const result = await apiFetch<RegistroEjecucionSincronizacionDto[]>(`/sincronizacion/logs${query}`)
  return result ?? []
}
