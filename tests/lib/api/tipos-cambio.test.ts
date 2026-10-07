import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import {
  createTipoCambio,
  deleteTipoCambio,
  listTiposCambio,
  updateTipoCambio,
} from "@/lib/api/tipos-cambio"

const raw = { id: "1", tipo: "REAL", periodicidad: "MENSUAL", periodo: "2026-10", valor: "1200.5", unidad: "ARS/USD" }

describe("lib/api/tipos-cambio", () => {
  beforeEach(() => vi.clearAllMocks())

  it("listTiposCambio aplica filtros y coacciona valor", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [raw], total: 1, page: 1, limit: 20 })
    const result = await listTiposCambio({ page: 1, limit: 20, tipo: "REAL", periodicidad: "MENSUAL" })
    expect(apiFetch).toHaveBeenCalledWith("/tipos-cambio?page=1&limit=20&tipo=REAL&periodicidad=MENSUAL")
    expect(result.items[0].valor).toBe(1200.5)
  })

  it("listTiposCambio devuelve página vacía ante null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect((await listTiposCambio({})).items).toEqual([])
  })

  it("create / update / delete", async () => {
    vi.mocked(apiFetch).mockResolvedValue(raw)
    const dto = { periodo: "2026-10", periodicidad: "MENSUAL" as const, tipo: "REAL" as const, valor: 1200, unidad: "ARS/USD" as const }
    await createTipoCambio(dto)
    expect(apiFetch).toHaveBeenCalledWith("/tipos-cambio", { method: "POST", body: dto })
    await updateTipoCambio("1", { valor: 1300 })
    expect(apiFetch).toHaveBeenCalledWith("/tipos-cambio/1", { method: "PATCH", body: { valor: 1300 } })
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await deleteTipoCambio("1")).toBeNull()
    expect(apiFetch).toHaveBeenCalledWith("/tipos-cambio/1", { method: "DELETE" })
  })
})
