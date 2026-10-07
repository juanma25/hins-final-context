import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { listUsuarios, getUsuario, getMe, updateUsuario, deactivateUsuario } from "@/lib/api/usuarios"

describe("lib/api/usuarios", () => {
  afterEach(() => vi.restoreAllMocks())

  it("listUsuarios returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listUsuarios()).toEqual([])
  })

  it("getUsuario returns null on 404", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await getUsuario("x")).toBeNull()
  })

  it("getMe calls /usuarios/me", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: "1", email: "a@b.com", nombre: "A", role: "SOCIO" })
    await getMe()
    expect(apiFetch).toHaveBeenCalledWith("/usuarios/me")
  })

  it("updateUsuario patches role/activo", async () => {
    const updated = { id: "1", email: "a@b.com", nombre: "A", role: "AGC", activo: true }
    vi.mocked(apiFetch).mockResolvedValue(updated)
    const result = await updateUsuario("1", { role: "AGC" })
    expect(apiFetch).toHaveBeenCalledWith("/usuarios/1", { method: "PATCH", body: { role: "AGC" } })
    expect(result).toEqual(updated)
  })

  it("deactivateUsuario deletes and returns activo:false shape", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: "1", activo: false })
    const result = await deactivateUsuario("1")
    expect(apiFetch).toHaveBeenCalledWith("/usuarios/1", { method: "DELETE" })
    expect(result).toEqual({ id: "1", activo: false })
  })
})
