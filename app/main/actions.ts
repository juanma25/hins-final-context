"use server"

import { revalidatePath } from "next/cache"
import { createProyecto } from "@/lib/api/proyectos"
import { createParque } from "@/lib/api/parques"
import type { CreateProyectoDto, Proyecto, Parque } from "@/lib/api/types"

export interface CreateProyectoActionResult {
  proyecto?: Proyecto
  error?: string
  parque?: Parque
  parqueError?: string
}

export async function createProyectoAction(dto: CreateProyectoDto): Promise<CreateProyectoActionResult> {
  let proyecto: Proyecto
  try {
    const created = await createProyecto(dto)
    if (!created) {
      return { error: "El backend no devolvió el proyecto creado" }
    }
    proyecto = created
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear el proyecto" }
  }
  revalidatePath("/main")

  try {
    const parque = await createParque({
      proyectoId: proyecto.id,
      potenciaTotalKwp: 0,
      fechaPuestaEnMarcha: proyecto.fechaAlta,
    })
    if (!parque) {
      return { proyecto, parqueError: "El backend no devolvió el parque creado" }
    }
    return { proyecto, parque }
  } catch (error) {
    return { proyecto, parqueError: error instanceof Error ? error.message : "Error al crear el parque" }
  }
}
