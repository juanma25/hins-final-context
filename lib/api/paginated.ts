export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export const DEFAULT_PAGE_SIZE = 20

/** Arma `?a=1&b=2` omitiendo valores vacíos o undefined. */
export function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

/** Prisma serializa Decimal como string: se coacciona al borde de lib/api. */
export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

export function parsePage(value: string | undefined): number {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

/** Retrocede a la última página con datos si la solicitada quedó vacía (p.ej. tras borrar). */
export function clampPage(page: number, total: number, limit: number): number {
  const lastPage = Math.max(1, Math.ceil(total / limit))
  return Math.min(Math.max(1, page), lastPage)
}

export function emptyPage<T>(page = 1, limit = DEFAULT_PAGE_SIZE): PaginatedResponse<T> {
  return { items: [], total: 0, page, limit }
}

/** Páginas visibles: primera, última y ventana ±1 alrededor de la actual (null = elipsis). */
export function getPageWindow(page: number, totalPages: number): (number | null)[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | null)[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(null)
    result.push(p)
  })
  return result
}
