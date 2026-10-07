import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from "@/lib/api/client"
import { getParque, createParque } from "@/lib/api/parques"

describe("lib/api/parques", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns null when backend returns 404", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    const result = await getParque("inexistente")
    expect(result).toBeNull()
  })

  it("passes through nullable fields untouched", async () => {
    const parque = {
      id: "1",
      proyectoId: "p1",
      potenciaTotalKwp: 100,
      fechaPuestaEnMarcha: "2026-01-01T00:00:00Z",
      stationExternalId: null,
      nombreExterno: null,
      direccion: null,
      longitud: null,
      latitud: null,
      contactoNombre: null,
      contactoInfo: null,
    }
    vi.mocked(apiFetch).mockResolvedValue(parque)
    const result = await getParque("1")
    expect(result).toEqual(parque)
  })

  it("createParque posts dto and returns created Parque", async () => {
    const created = {
      id: "2", proyectoId: "p1", potenciaTotalKwp: 50, fechaPuestaEnMarcha: "2026-01-01T00:00:00Z",
      stationExternalId: null, nombreExterno: null, direccion: null, longitud: null, latitud: null,
      contactoNombre: null, contactoInfo: null,
    }
    vi.mocked(apiFetch).mockResolvedValue(created)
    const dto = { proyectoId: "p1", potenciaTotalKwp: 50, fechaPuestaEnMarcha: "2026-01-01" }
    const result = await createParque(dto)
    expect(apiFetch).toHaveBeenCalledWith("/parques", { method: "POST", body: dto })
    expect(result).toEqual(created)
  })
})
