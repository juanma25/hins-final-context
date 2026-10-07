"use server"

import { createTipoCambio, deleteTipoCambio, updateTipoCambio } from "@/lib/api/tipos-cambio"
import type { CreateTipoCambioDto, TipoCambio, UpdateTipoCambioDto } from "@/lib/api/types"
import { runCrudAction } from "@/lib/crud-action"

const PATH = "/main/tipos-cambio"

export async function createTipoCambioAction(dto: CreateTipoCambioDto) {
  return runCrudAction<TipoCambio>(() => createTipoCambio(dto), PATH)
}

export async function updateTipoCambioAction(id: string, dto: UpdateTipoCambioDto) {
  return runCrudAction<TipoCambio>(() => updateTipoCambio(id, dto), PATH)
}

export async function deleteTipoCambioAction(id: string) {
  return runCrudAction<TipoCambio>(() => deleteTipoCambio(id), PATH, { allowNull: true })
}
