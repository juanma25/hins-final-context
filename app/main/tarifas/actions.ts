"use server"

import { createTarifa, deleteTarifa, updateTarifa } from "@/lib/api/tarifas"
import type { CreateTarifaDto, Tarifa, UpdateTarifaDto } from "@/lib/api/types"
import { runCrudAction } from "@/lib/crud-action"

const PATH = "/main/tarifas"

export async function createTarifaAction(dto: CreateTarifaDto) {
  return runCrudAction<Tarifa>(() => createTarifa(dto), PATH)
}

export async function updateTarifaAction(id: string, dto: UpdateTarifaDto) {
  return runCrudAction<Tarifa>(() => updateTarifa(id, dto), PATH)
}

export async function deleteTarifaAction(id: string) {
  return runCrudAction<Tarifa>(() => deleteTarifa(id), PATH, { allowNull: true })
}
