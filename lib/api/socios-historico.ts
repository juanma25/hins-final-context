import { apiFetch } from "@/lib/api/client"
import type { RegistroHistorico, FacturacionHistorico, MedicionHistorico } from "@/lib/api/types"

export async function listRegistrosSocio(
  parqueId: string,
  socioId: string,
  desde: string,
  hasta: string
): Promise<RegistroHistorico[]> {
  const result = await apiFetch<RegistroHistorico[]>(
    `/parques/${parqueId}/socios/${socioId}/registros?desde=${desde}&hasta=${hasta}`
  )
  return result ?? []
}

export async function listFacturacionSocio(
  parqueId: string,
  socioId: string,
  desde: string,
  hasta: string
): Promise<FacturacionHistorico[]> {
  const result = await apiFetch<FacturacionHistorico[]>(
    `/parques/${parqueId}/socios/${socioId}/facturacion?desde=${desde}&hasta=${hasta}`
  )
  return result ?? []
}

export async function listMedicionesSocio(
  parqueId: string,
  socioId: string,
  desde: string,
  hasta: string
): Promise<MedicionHistorico[]> {
  const result = await apiFetch<MedicionHistorico[]>(
    `/parques/${parqueId}/socios/${socioId}/mediciones?desde=${desde}&hasta=${hasta}`
  )
  return result ?? []
}
