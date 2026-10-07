import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { createTarifa, deleteTarifa, listTarifas, updateTarifa } from "@/lib/api/tarifas"

const raw = {
  id: "1",
  nombre: "Res",
  valorEnergia: "10.5",
  valorInyeccion: "8",
  unidad: "ARS/kWh",
  vigenteDesde: "2026-01-01",
  vigenteHasta: null,
  estado: "VIGENTE",
}

describe("lib/api/tarifas", () => {
  beforeEach(() => vi.clearAllMocks())

  it("listTarifas arma la query y coacciona decimales", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [raw], total: 1, page: 2, limit: 20 })
    const result = await listTarifas({ page: 2, limit: 20, nombre: "Res" })
    expect(apiFetch).toHaveBeenCalledWith("/tarifas?page=2&limit=20&nombre=Res")
    expect(result.items[0].valorEnergia).toBe(10.5)
    expect(result.items[0].valorInyeccion).toBe(8)
    expect(result.total).toBe(1)
  })

  it("listTarifas devuelve página vacía ante null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listTarifas({ page: 1 })).toEqual({ items: [], total: 0, page: 1, limit: 20 })
  })

  it("createTarifa hace POST", async () => {
    vi.mocked(apiFetch).mockResolvedValue(raw)
    const dto = { nombre: "Res", valorEnergia: 10.5, valorInyeccion: 8, unidad: "ARS/kWh", vigenteDesde: "2026-01-01" }
    const result = await createTarifa(dto)
    expect(apiFetch).toHaveBeenCalledWith("/tarifas", { method: "POST", body: dto })
    expect(result?.valorEnergia).toBe(10.5)
  })

  it("updateTarifa hace PATCH", async () => {
    vi.mocked(apiFetch).mockResolvedValue(raw)
    await updateTarifa("1", { unidad: "USD/kWh" })
    expect(apiFetch).toHaveBeenCalledWith("/tarifas/1", { method: "PATCH", body: { unidad: "USD/kWh" } })
  })

  it("deleteTarifa hace DELETE y tolera null (204)", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await deleteTarifa("1")).toBeNull()
    expect(apiFetch).toHaveBeenCalledWith("/tarifas/1", { method: "DELETE" })
  })
})
