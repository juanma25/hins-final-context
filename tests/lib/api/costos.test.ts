import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { createCosto, deleteCosto, listCostos, updateCosto } from "@/lib/api/costos"

const raw = {
  id: "1",
  proyectoId: "p1",
  parqueId: "pq1",
  concepto: "Seguro",
  tipoCosto: "FIJO",
  valor: "99.9",
  moneda: "USD",
  unidad: "anual",
}

describe("lib/api/costos", () => {
  beforeEach(() => vi.clearAllMocks())

  it("listCostos filtra por proyectoId y coacciona valor", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [raw], total: 1, page: 1, limit: 20 })
    const result = await listCostos({ page: 1, limit: 20, proyectoId: "p1" })
    expect(apiFetch).toHaveBeenCalledWith("/costos?page=1&limit=20&proyectoId=p1")
    expect(result.items[0].valor).toBe(99.9)
  })

  it("listCostos devuelve página vacía ante null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect((await listCostos({ proyectoId: "p1" })).total).toBe(0)
  })

  it("create / update / delete", async () => {
    vi.mocked(apiFetch).mockResolvedValue(raw)
    const dto = { proyectoId: "p1", parqueId: "pq1", concepto: "Seguro", tipoCosto: "FIJO" as const, valor: 99.9, moneda: "USD", unidad: "anual" }
    await createCosto(dto)
    expect(apiFetch).toHaveBeenCalledWith("/costos", { method: "POST", body: dto })
    await updateCosto("1", { valor: 10 })
    expect(apiFetch).toHaveBeenCalledWith("/costos/1", { method: "PATCH", body: { valor: 10 } })
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await deleteCosto("1")).toBeNull()
    expect(apiFetch).toHaveBeenCalledWith("/costos/1", { method: "DELETE" })
  })
})
