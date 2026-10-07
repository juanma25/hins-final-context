"use server"

import { createCosto, deleteCosto, updateCosto } from "@/lib/api/costos"
import type { Costo, CreateCostoDto, UpdateCostoDto } from "@/lib/api/types"
import { runCrudAction } from "@/lib/crud-action"

const PATHS = ["/gdd/costos", "/gdc/costos", "/gdcv/costos"]

export async function createCostoAction(dto: CreateCostoDto) {
  return runCrudAction<Costo>(() => createCosto(dto), PATHS)
}

export async function updateCostoAction(id: string, dto: UpdateCostoDto) {
  return runCrudAction<Costo>(() => updateCosto(id, dto), PATHS)
}

export async function deleteCostoAction(id: string) {
  return runCrudAction<Costo>(() => deleteCosto(id), PATHS, { allowNull: true })
}
