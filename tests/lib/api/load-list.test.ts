import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

import { UnauthorizedError } from "@/lib/api/client"
import { loadList } from "@/lib/api/load-list"

const pageOf = (page: number, total: number) => ({ items: [{ id: String(page) }], total, page, limit: 20 })

describe("loadList", () => {
  beforeEach(() => vi.clearAllMocks())

  it("devuelve la página pedida", async () => {
    const fetcher = vi.fn(async (page: number) => pageOf(page, 45))
    const result = await loadList(fetcher, 2)
    expect(result.page).toBe(2)
    expect(result.loadError).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("reintenta con la última página si la pedida quedó vacía", async () => {
    const fetcher = vi.fn(async (page: number) =>
      page > 3 ? { items: [], total: 45, page, limit: 20 } : pageOf(page, 45)
    )
    const result = await loadList(fetcher, 5)
    expect(fetcher).toHaveBeenLastCalledWith(3)
    expect(result.page).toBe(3)
    expect(result.items).toHaveLength(1)
  })

  it("sesión expirada redirige a /login", async () => {
    await expect(
      loadList(async () => {
        throw new UnauthorizedError()
      }, 1)
    ).rejects.toThrow("REDIRECT:/login")
  })

  it("otro error devuelve loadError y lista vacía", async () => {
    const result = await loadList(async () => {
      throw new Error("backend caído")
    }, 1)
    expect(result).toMatchObject({ items: [], total: 0, page: 1, loadError: "backend caído" })
  })
})
