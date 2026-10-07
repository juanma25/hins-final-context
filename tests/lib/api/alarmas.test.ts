import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { listAlarmas } from "@/lib/api/alarmas"

describe("lib/api/alarmas", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns empty array on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listAlarmas("p1")).toEqual([])
  })

  it("calls endpoint without query when estado omitted", async () => {
    vi.mocked(apiFetch).mockResolvedValue([])
    await listAlarmas("p1")
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/alarmas")
  })

  it("appends estado filter as query param", async () => {
    vi.mocked(apiFetch).mockResolvedValue([])
    await listAlarmas("p1", "ACTIVA")
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/alarmas?estado=ACTIVA")
  })

  it("tolerates nullable causa/causaId/fechaLimpiada", async () => {
    const alarmas = [
      {
        id: "a1", parqueId: "p1", dispositivoId: null, externalAlarmId: 1, esnCodeExterno: null,
        nombre: "Falla", causa: null, causaId: null, tipo: 1, severidad: 3,
        fechaGenerada: "2026-02-01T00:00:00Z", estado: "ACTIVA", fechaLimpiada: null,
        ultimaSincronizacion: "2026-02-01T00:00:00Z",
      },
    ]
    vi.mocked(apiFetch).mockResolvedValue(alarmas)
    expect(await listAlarmas("p1")).toEqual(alarmas)
  })
})
