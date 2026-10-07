import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { UnauthorizedError } from "@/lib/api/client"

export interface ActionResult<T> {
  entidad?: T
  error?: string
}

interface RunOptions {
  /** `true` para borrados: apiFetch devuelve null en 204/404 y se trata como éxito. */
  allowNull?: boolean
}

/**
 * Helper común de las Server Actions de configuración: try/catch, manejo de
 * sesión expirada y revalidación. Cada entidad expone actions "use server"
 * de una línea que delegan acá (las closures de una fábrica no son actions).
 */
export async function runCrudAction<T>(
  fn: () => Promise<T | null>,
  revalidate: string | string[],
  options: RunOptions = {}
): Promise<ActionResult<T>> {
  let result: T | null
  try {
    result = await fn()
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login")
    return { error: error instanceof Error ? error.message : "Error al guardar los cambios" }
  }
  if (result === null && !options.allowNull) {
    return { error: "El backend no devolvió el registro" }
  }
  for (const path of Array.isArray(revalidate) ? revalidate : [revalidate]) {
    revalidatePath(path)
  }
  return result === null ? {} : { entidad: result }
}
