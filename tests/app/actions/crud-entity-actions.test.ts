import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("@/lib/api/tarifas", () => ({ createTarifa: vi.fn(), updateTarifa: vi.fn(), deleteTarifa: vi.fn() }))
vi.mock("@/lib/api/tipos-cambio", () => ({
  createTipoCambio: vi.fn(),
  updateTipoCambio: vi.fn(),
  deleteTipoCambio: vi.fn(),
}))
vi.mock("@/lib/api/costos", () => ({ createCosto: vi.fn(), updateCosto: vi.fn(), deleteCosto: vi.fn() }))

import { revalidatePath } from "next/cache"
import { createCosto, deleteCosto, updateCosto } from "@/lib/api/costos"
import { createTarifa, deleteTarifa, updateTarifa } from "@/lib/api/tarifas"
import { createTipoCambio, deleteTipoCambio, updateTipoCambio } from "@/lib/api/tipos-cambio"
import { createCostoAction, deleteCostoAction, updateCostoAction } from "@/app/actions/costos"
import { createTarifaAction, deleteTarifaAction, updateTarifaAction } from "@/app/main/tarifas/actions"
import {
  createTipoCambioAction,
  deleteTipoCambioAction,
  updateTipoCambioAction,
} from "@/app/main/tipos-cambio/actions"

describe("actions de configuración", () => {
  beforeEach(() => vi.clearAllMocks())

  it("tarifas: create/update pasan el DTO intacto y revalidan", async () => {
    vi.mocked(createTarifa).mockResolvedValue({ id: "1" } as never)
    vi.mocked(updateTarifa).mockResolvedValue({ id: "1" } as never)
    const dto = { nombre: "R", valorEnergia: 1, valorInyeccion: 1, unidad: "u", vigenteDesde: "2026-01-01" }
    expect(await createTarifaAction(dto)).toEqual({ entidad: { id: "1" } })
    expect(createTarifa).toHaveBeenCalledWith(dto)
    await updateTarifaAction("1", { unidad: "x" })
    expect(updateTarifa).toHaveBeenCalledWith("1", { unidad: "x" })
    expect(revalidatePath).toHaveBeenCalledWith("/main/tarifas")
  })

  it("tarifas: reenvía el mensaje de conflicto del backend", async () => {
    vi.mocked(createTarifa).mockRejectedValue(new Error("La fecha debe ser posterior a la última versión"))
    const result = await createTarifaAction({} as never)
    expect(result.error).toBe("La fecha debe ser posterior a la última versión")
  })

  it("tarifas: delete con null (204) es éxito", async () => {
    vi.mocked(deleteTarifa).mockResolvedValue(null)
    expect(await deleteTarifaAction("1")).toEqual({})
  })

  it("tipos de cambio: create/update/delete", async () => {
    vi.mocked(createTipoCambio).mockResolvedValue({ id: "1" } as never)
    vi.mocked(updateTipoCambio).mockResolvedValue({ id: "1" } as never)
    vi.mocked(deleteTipoCambio).mockResolvedValue(null)
    await createTipoCambioAction({ periodo: "2026-10" } as never)
    await updateTipoCambioAction("1", { valor: 1 })
    expect(await deleteTipoCambioAction("1")).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith("/main/tipos-cambio")
  })

  it("costos: revalida las tres rutas", async () => {
    vi.mocked(createCosto).mockResolvedValue({ id: "1" } as never)
    vi.mocked(updateCosto).mockResolvedValue({ id: "1" } as never)
    vi.mocked(deleteCosto).mockResolvedValue(null)
    await createCostoAction({} as never)
    await updateCostoAction("1", { valor: 2 })
    expect(await deleteCostoAction("1")).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith("/gdd/costos")
    expect(revalidatePath).toHaveBeenCalledWith("/gdc/costos")
    expect(revalidatePath).toHaveBeenCalledWith("/gdcv/costos")
  })
})
