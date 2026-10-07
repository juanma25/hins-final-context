import type { ErrorResponse } from "@/lib/api/types"

export class UnauthorizedError extends Error {
  constructor(message = "Sesión expirada o inválida") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Sin acceso") {
    super(message)
    this.name = "ForbiddenError"
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  token?: string
  body?: unknown
}

function getBaseUrl(): string {
  const baseUrl = process.env.HINS_API_BASE_URL
  if (!baseUrl) {
    throw new Error("HINS_API_BASE_URL no está configurada")
  }
  return baseUrl
}

/**
 * Lee el token de sesión desde la cookie httpOnly cuando se ejecuta dentro de
 * un request de Next.js (Server Component/Route Handler). Fuera de ese
 * contexto (tests unitarios, scripts) retorna undefined en vez de lanzar.
 */
async function getSessionTokenIfAvailable(): Promise<string | undefined> {
  try {
    const { getToken } = await import("@/lib/api/session")
    return await getToken()
  } catch {
    return undefined
  }
}

/**
 * Cliente HTTP centralizado hacia el backend HINS (contracts/openapi.json).
 * 401 -> UnauthorizedError, 403 -> ForbiddenError (mensaje del backend), 404 -> null.
 */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T | null> {
  const { token: explicitToken, body, headers, ...rest } = options
  const token = explicitToken ?? (await getSessionTokenIfAvailable())

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (response.status === 401) {
    const data = (await safeJson(response)) as ErrorResponse | null
    throw new UnauthorizedError(data?.message)
  }

  if (response.status === 403) {
    const data = (await safeJson(response)) as ErrorResponse | null
    throw new ForbiddenError(data?.message)
  }

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const data = (await safeJson(response)) as ErrorResponse | null
    throw new Error(data?.message ?? `Error ${response.status} al llamar ${path}`)
  }

  return (await safeJson(response)) as T
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}
