import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/api/usuarios", () => ({ getMe: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

import { getMe } from "@/lib/api/usuarios"
import { UnauthorizedError } from "@/lib/api/client"
import { getCurrentRole, requireAdmin } from "@/lib/api/guards"

describe("lib/api/guards", () => {
  beforeEach(() => vi.clearAllMocks())

  it("requireAdmin deja pasar a HINS_ADMIN", async () => {
    vi.mocked(getMe).mockResolvedValue({ id: "1", email: "a@b.c", nombre: "A", role: "HINS_ADMIN" })
    await expect(requireAdmin()).resolves.toBeUndefined()
  })

  it("requireAdmin redirige a /main si el rol no es admin", async () => {
    vi.mocked(getMe).mockResolvedValue({ id: "1", email: "a@b.c", nombre: "A", role: "AGC" })
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/main")
  })

  it("requireAdmin redirige a /login si la sesión expiró", async () => {
    vi.mocked(getMe).mockRejectedValue(new UnauthorizedError())
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login")
  })

  it("requireAdmin redirige a /main si getMe devuelve null", async () => {
    vi.mocked(getMe).mockResolvedValue(null)
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/main")
  })

  it("getCurrentRole devuelve null ante cualquier error", async () => {
    vi.mocked(getMe).mockRejectedValue(new Error("boom"))
    expect(await getCurrentRole()).toBeNull()
  })

  it("getCurrentRole devuelve el rol", async () => {
    vi.mocked(getMe).mockResolvedValue({ id: "1", email: "a@b.c", nombre: "A", role: "SOCIO" })
    expect(await getCurrentRole()).toBe("SOCIO")
  })
})
