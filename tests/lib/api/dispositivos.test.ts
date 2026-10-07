import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { listDispositivos } from "@/lib/api/dispositivos"

describe("lib/api/dispositivos", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns empty array on null (404)", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listDispositivos("p1")).toEqual([])
  })

  it("keeps backend order (descendente por ultimaSincronizacion) and tolerates null datosMonitoreo", async () => {
    const dispositivos = [
      { id: "1", parqueId: "p1", externalDeviceId: "e1", serialNumber: null, nombre: null, tipoId: 1, modelo: null, softwareVersion: null, datosMonitoreo: null, ultimaSincronizacion: "2026-02-01T00:00:00Z" },
      { id: "2", parqueId: "p1", externalDeviceId: "e2", serialNumber: "SN1", nombre: "Inversor", tipoId: 2, modelo: "X", softwareVersion: "1.0", datosMonitoreo: { volt: 220 }, ultimaSincronizacion: "2026-01-01T00:00:00Z" },
    ]
    vi.mocked(apiFetch).mockResolvedValue(dispositivos)
    const result = await listDispositivos("p1")
    expect(result).toEqual(dispositivos)
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/dispositivos")
  })
})
