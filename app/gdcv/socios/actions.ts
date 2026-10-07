"use server"

import { createSocio } from "@/lib/api/socios"
import type { CreateSocioDto, Socio } from "@/lib/api/types"

export interface CreateSocioActionResult {
  socio?: Socio
  error?: string
}

export async function createSocioAction(
  parqueId: string,
  dto: Omit<CreateSocioDto, "parqueId">
): Promise<CreateSocioActionResult> {
  try {
    const socio = await createSocio(parqueId, { ...dto, parqueId })
    if (!socio) {
      return { error: "El backend no devolvió el socio creado" }
    }
    return { socio }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear el socio" }
  }
}
