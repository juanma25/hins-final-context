import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { listEnergia, listEnergiaDiaria, getEnergiaDelDia, registrarEnergia } from "@/lib/api/energia"
import { listRoi, registrarRoi } from "@/lib/api/roi"
import { listMantenimiento, registrarMantenimiento } from "@/lib/api/mantenimiento"

describe("lib/api/energia", () => {
  afterEach(() => vi.restoreAllMocks())

  it("listEnergia returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listEnergia("p1")).toEqual([])
  })

  it("listEnergia parses the real monthly response shape, including nullable fields", async () => {
    const registros = [
      { periodo: "2026-07", energiaMesKwh: 18190.5, ingresoMes: 53518.69 },
      { periodo: "2026-06", energiaMesKwh: null, ingresoMes: null },
    ]
    vi.mocked(apiFetch).mockResolvedValue(registros)
    expect(await listEnergia("p1")).toEqual(registros)
  })

  it("listEnergiaDiaria returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listEnergiaDiaria("p1", "2026-07")).toEqual([])
  })

  it("listEnergiaDiaria calls the endpoint with periodo as query param and parses the daily shape", async () => {
    const registros = [
      { fecha: "2026-07-18", energiaDiaKwh: 83.22, ingresoDia: 6082.95 },
      { fecha: "2026-07-17", energiaDiaKwh: null, ingresoDia: null },
    ]
    vi.mocked(apiFetch).mockResolvedValue(registros)
    const result = await listEnergiaDiaria("p1", "2026-07")
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/energia?periodo=2026-07")
    expect(result).toEqual(registros)
  })

  it("getEnergiaDelDia returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await getEnergiaDelDia("p1", "2026-07-20")).toEqual([])
  })

  it("getEnergiaDelDia calls the endpoint with periodo as query param and parses the daily-snapshot shape", async () => {
    const registros = [
      {
        capturadoEn: "2026-07-20T14:41:56.703Z",
        energiaDiaKwh: 93.61,
        ingresoDia: 6843.04,
        energiaTotalKwh: 901509.7,
        energiaInyectadaDiaKwh: 0,
        energiaConsumidaDiaKwh: 0,
      },
    ]
    vi.mocked(apiFetch).mockResolvedValue(registros)
    const result = await getEnergiaDelDia("p1", "2026-07-20")
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/energia?periodo=2026-07-20")
    expect(result).toEqual(registros)
  })

  it("registrarEnergia posts dto to parqueId endpoint", async () => {
    const created = { id: "1", parqueId: "p1", periodo: "2026-01", energiaInyectadaKwh: null, energiaGeneradaKwh: null, creditoGenerado: null, ahorroEpec: null }
    vi.mocked(apiFetch).mockResolvedValue(created)
    const result = await registrarEnergia("p1", { periodo: "2026-01" })
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/energia", { method: "POST", body: { periodo: "2026-01" } })
    expect(result).toEqual(created)
  })
})

describe("lib/api/roi", () => {
  afterEach(() => vi.restoreAllMocks())

  it("listRoi returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listRoi("p1")).toEqual([])
  })

  it("registrarRoi posts dto to parqueId endpoint", async () => {
    const created = { id: "1", parqueId: "p1", socioId: null, periodo: "2026-01", inversionMeta: 100, creditoAcumulado: 10, paybackEstimadoMeses: null, tir: null }
    vi.mocked(apiFetch).mockResolvedValue(created)
    const dto = { periodo: "2026-01", inversionMeta: 100, creditoAcumulado: 10 }
    const result = await registrarRoi("p1", dto)
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/roi", { method: "POST", body: dto })
    expect(result).toEqual(created)
  })
})

describe("lib/api/mantenimiento", () => {
  afterEach(() => vi.restoreAllMocks())

  it("listMantenimiento returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listMantenimiento("p1")).toEqual([])
  })

  it("registrarMantenimiento posts dto to parqueId endpoint", async () => {
    const created = { id: "1", parqueId: "p1", periodo: "2026-01", cantidadMantenciones: 2, costosAsociados: 500, detalle: null }
    vi.mocked(apiFetch).mockResolvedValue(created)
    const dto = { periodo: "2026-01", cantidadMantenciones: 2, costosAsociados: 500 }
    const result = await registrarMantenimiento("p1", dto)
    expect(apiFetch).toHaveBeenCalledWith("/parques/p1/mantenimiento", { method: "POST", body: dto })
    expect(result).toEqual(created)
  })
})
