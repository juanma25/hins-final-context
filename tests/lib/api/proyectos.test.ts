import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from "@/lib/api/client"
import { listProyectos, createProyecto } from "@/lib/api/proyectos"

describe("lib/api/proyectos", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns empty array when backend returns null (e.g. 404)", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    const result = await listProyectos()
    expect(result).toEqual([])
  })

  it("returns the list as-is when backend responds with data", async () => {
    const proyectos = [
      { id: "1", nombre: "P1", modelo: "GDD", ubicacion: "X", fechaAlta: "2026-01-01T00:00:00Z", activo: true },
    ]
    vi.mocked(apiFetch).mockResolvedValue(proyectos)
    const result = await listProyectos()
    expect(result).toEqual(proyectos)
  })

  it("createProyecto posts dto and returns created Proyecto", async () => {
    const created = { id: "2", nombre: "Nuevo", modelo: "GDC", ubicacion: "Y", fechaAlta: "2026-01-01T00:00:00Z", activo: true }
    vi.mocked(apiFetch).mockResolvedValue(created)
    const result = await createProyecto({ nombre: "Nuevo", modelo: "GDC", ubicacion: "Y" })
    expect(apiFetch).toHaveBeenCalledWith("/proyectos", { method: "POST", body: { nombre: "Nuevo", modelo: "GDC", ubicacion: "Y" } })
    expect(result).toEqual(created)
  })
})
