import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/socios-historico", () => ({
  listRegistrosSocio: vi.fn(),
  listFacturacionSocio: vi.fn(),
  listMedicionesSocio: vi.fn(),
}))
vi.mock("@/lib/api/client", () => ({
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message = "Sesión expirada o inválida") {
      super(message)
      this.name = "UnauthorizedError"
    }
  },
}))

import {
  listRegistrosSocio,
  listFacturacionSocio,
  listMedicionesSocio,
} from "@/lib/api/socios-historico"
import { UnauthorizedError } from "@/lib/api/client"
import { GET as GET_REGISTROS } from "@/app/api/parques/[parqueId]/socios/[socioId]/registros/route"
import { GET as GET_FACTURACION } from "@/app/api/parques/[parqueId]/socios/[socioId]/facturacion/route"
import { GET as GET_MEDICIONES } from "@/app/api/parques/[parqueId]/socios/[socioId]/mediciones/route"

function makeRequest(desde?: string, hasta?: string): Request {
  const params = new URLSearchParams()
  if (desde) params.set("desde", desde)
  if (hasta) params.set("hasta", hasta)
  const qs = params.toString()
  return new Request(`http://localhost/api/parques/p1/socios/s1/registros${qs ? `?${qs}` : ""}`)
}

const routeParams = { params: Promise.resolve({ parqueId: "p1", socioId: "s1" }) }

describe.each([
  { name: "registros", GET: GET_REGISTROS, mockFn: listRegistrosSocio },
  { name: "facturacion", GET: GET_FACTURACION, mockFn: listFacturacionSocio },
  { name: "mediciones", GET: GET_MEDICIONES, mockFn: listMedicionesSocio },
])("GET /api/parques/[parqueId]/socios/[socioId]/$name", ({ GET, mockFn }) => {
  afterEach(() => vi.restoreAllMocks())

  it("returns 400 when desde is missing", async () => {
    const response = await GET(makeRequest(undefined, "2026-01-31"), routeParams)
    expect(response.status).toBe(400)
  })

  it("returns 400 when hasta is missing", async () => {
    const response = await GET(makeRequest("2026-01-01", undefined), routeParams)
    expect(response.status).toBe(400)
  })

  it("returns 200 with the data as-is when desde and hasta are present", async () => {
    const data = [{ id: "h1", obtenidoEn: "2026-01-15T00:00:00.000Z", payload: [] }]
    vi.mocked(mockFn).mockResolvedValue(data)

    const response = await GET(makeRequest("2026-01-01", "2026-01-31"), routeParams)
    const body = await response.json()

    expect(mockFn).toHaveBeenCalledWith("p1", "s1", "2026-01-01", "2026-01-31")
    expect(response.status).toBe(200)
    expect(body).toEqual(data)
  })

  it("returns 401 when the session is unauthorized", async () => {
    vi.mocked(mockFn).mockRejectedValue(new UnauthorizedError())
    const response = await GET(makeRequest("2026-01-01", "2026-01-31"), routeParams)
    expect(response.status).toBe(401)
  })

  it("returns 500 on unexpected errors", async () => {
    vi.mocked(mockFn).mockRejectedValue(new Error("boom"))
    const response = await GET(makeRequest("2026-01-01", "2026-01-31"), routeParams)
    expect(response.status).toBe(500)
  })
})
