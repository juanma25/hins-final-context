import { apiFetch } from "@/lib/api/client"
import type {
  RegistrarEnergiaDto,
  RegistroEnergia,
  RegistroEnergiaDia,
  RegistroEnergiaDiario,
  RegistroEnergiaMensual,
} from "@/lib/api/types"

export async function listEnergia(parqueId: string): Promise<RegistroEnergiaMensual[]> {
  const result = await apiFetch<RegistroEnergiaMensual[]>(`/parques/${parqueId}/energia`)
  return result ?? []
}

/** Granularidad diaria dentro de un mes — ver specs/003-monthly-generation-kpi. */
export async function listEnergiaDiaria(parqueId: string, periodo: string): Promise<RegistroEnergiaDiario[]> {
  const result = await apiFetch<RegistroEnergiaDiario[]>(`/parques/${parqueId}/energia?periodo=${periodo}`)
  return result ?? []
}

/** Snapshot de un día puntual — ver specs/004-daily-monthly-energy-view/research.md. */
export async function getEnergiaDelDia(parqueId: string, periodo: string): Promise<RegistroEnergiaDia[]> {
  const result = await apiFetch<RegistroEnergiaDia[]>(`/parques/${parqueId}/energia?periodo=${periodo}`)
  return result ?? []
}

export async function registrarEnergia(parqueId: string, dto: RegistrarEnergiaDto): Promise<RegistroEnergia | null> {
  return apiFetch<RegistroEnergia>(`/parques/${parqueId}/energia`, { method: "POST", body: dto })
}
