import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

import { revalidatePath } from "next/cache"
import { UnauthorizedError } from "@/lib/api/client"
import { runCrudAction } from "@/lib/crud-action"

describe("runCrudAction", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve la entidad y revalida", async () => {
    const result = await runCrudAction(async () => ({ id: "1" }), "/main/tarifas")
    expect(result).toEqual({ entidad: { id: "1" } })
    expect(revalidatePath).toHaveBeenCalledWith("/main/tarifas")
  })

  it("revalida varias rutas", async () => {
    await runCrudAction(async () => ({ id: "1" }), ["/a", "/b"])
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it("null con allowNull (borrado) es éxito", async () => {
    const result = await runCrudAction(async () => null, "/x", { allowNull: true })
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalled()
  })

  it("null sin allowNull es error", async () => {
    const result = await runCrudAction(async () => null, "/x")
    expect(result.error).toBeDefined()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("reenvía el mensaje del error", async () => {
    const result = await runCrudAction(async () => {
      throw new Error("Fecha fuera de orden")
    }, "/x")
    expect(result).toEqual({ error: "Fecha fuera de orden" })
  })

  it("UnauthorizedError redirige a /login", async () => {
    await expect(
      runCrudAction(async () => {
        throw new UnauthorizedError()
      }, "/x")
    ).rejects.toThrow("REDIRECT:/login")
  })
})
