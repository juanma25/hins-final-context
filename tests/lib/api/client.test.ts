import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("lib/api/client", () => {
  const originalFetch = global.fetch
  const originalEnv = process.env.HINS_API_BASE_URL

  beforeEach(() => {
    process.env.HINS_API_BASE_URL = "http://localhost:3000"
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.HINS_API_BASE_URL = originalEnv
    vi.restoreAllMocks()
  })

  it("throws UnauthorizedError on 401", async () => {
    const { apiFetch, UnauthorizedError } = await import("@/lib/api/client")
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 401, message: "Unauthorized" }), { status: 401 })
    )
    await expect(apiFetch("/usuarios/me")).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it("throws ForbiddenError with backend message on 403", async () => {
    const { apiFetch, ForbiddenError } = await import("@/lib/api/client")
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 403, message: "Sin acceso al parque" }), { status: 403 })
    )
    await expect(apiFetch("/parques/x/alarmas")).rejects.toMatchObject({
      constructor: ForbiddenError,
      message: "Sin acceso al parque",
    })
  })

  it("returns null on 404", async () => {
    const { apiFetch } = await import("@/lib/api/client")
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 404, message: "No encontrado" }), { status: 404 })
    )
    const result = await apiFetch("/parques/inexistente")
    expect(result).toBeNull()
  })

  it("attaches Authorization Bearer header when token provided", async () => {
    const { apiFetch } = await import("@/lib/api/client")
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    global.fetch = fetchMock
    await apiFetch("/usuarios/me", { token: "abc123" })
    const [, init] = fetchMock.mock.calls[0]
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer abc123")
  })

  it("resolves against HINS_API_BASE_URL", async () => {
    const { apiFetch } = await import("@/lib/api/client")
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    global.fetch = fetchMock
    await apiFetch("/usuarios/me")
    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe("http://localhost:3000/usuarios/me")
  })
})
