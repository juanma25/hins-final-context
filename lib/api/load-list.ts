import { redirect } from "next/navigation"

import { UnauthorizedError } from "@/lib/api/client"
import { clampPage, DEFAULT_PAGE_SIZE, type PaginatedResponse } from "@/lib/api/paginated"

export interface LoadedList<T> extends PaginatedResponse<T> {
  loadError: string | null
}

/**
 * Carga común de las listas de configuración: sesión expirada → /login,
 * otros errores → estado de error con "Reintentar", y si la página pedida
 * quedó vacía (p.ej. tras borrar el último registro) retrocede a la última válida.
 */
export async function loadList<T>(
  fetcher: (page: number) => Promise<PaginatedResponse<T>>,
  page: number
): Promise<LoadedList<T>> {
  try {
    let result = await fetcher(page)
    const clamped = clampPage(page, result.total, result.limit)
    if (result.items.length === 0 && result.total > 0 && clamped !== page) {
      result = await fetcher(clamped)
    }
    return { ...result, loadError: null }
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login")
    return {
      items: [],
      total: 0,
      page,
      limit: DEFAULT_PAGE_SIZE,
      loadError: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
