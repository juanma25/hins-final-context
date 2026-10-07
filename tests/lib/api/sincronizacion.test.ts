import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { listConfiguraciones, updateConfiguracion, listLogs } from "@/lib/api/sincronizacion"

describe("lib/api/sincronizacion", () => {
  afterEach(() => vi.clearAllMocks())

  it("listConfiguraciones returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listConfiguraciones()).toEqual([])
  })

  it("updateConfiguracion rejects intervaloMs < 1 without calling backend", async () => {
    await expect(updateConfiguracion("ALARMAS", { intervaloMs: 0 })).rejects.toThrow()
    expect(apiFetch).not.toHaveBeenCalled()
  })

  it("updateConfiguracion patches valid intervaloMs", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ modelo: "ALARMAS", intervaloMs: 5000, habilitado: true })
    const result = await updateConfiguracion("ALARMAS", { intervaloMs: 5000, habilitado: true })
    expect(apiFetch).toHaveBeenCalledWith("/sincronizacion/configuraciones/ALARMAS", {
      method: "PATCH",
      body: { intervaloMs: 5000, habilitado: true },
    })
    expect(result).toEqual({ modelo: "ALARMAS", intervaloMs: 5000, habilitado: true })
  })

  it("listLogs passes modelo and limit as query params", async () => {
    vi.mocked(apiFetch).mockResolvedValue([])
    await listLogs("ALARMAS", 10)
    expect(apiFetch).toHaveBeenCalledWith("/sincronizacion/logs?modelo=ALARMAS&limit=10")
  })

  it("listLogs omits limit when not provided", async () => {
    vi.mocked(apiFetch).mockResolvedValue([])
    await listLogs("ENERGIA")
    expect(apiFetch).toHaveBeenCalledWith("/sincronizacion/logs?modelo=ENERGIA")
  })
})
