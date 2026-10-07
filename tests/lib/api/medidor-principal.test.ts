import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { getConsolidadoMedidorPrincipal, listRegistrosMedidorPrincipal } from "@/lib/api/medidor-principal"

const consolidadoDto = {
  desde: "2026-09-01T00:00:00.000Z",
  hasta: "2026-10-01T00:00:00.000Z",
  porTarifa: [
    {
      tarifa: 1,
      registros: 2880,
      energiaActivaExportada: { suma: 12345000, sumaKwh: 12345, maximo: 500, promedio: 4287.8 },
      demandaActivaExportada: { suma: 49380000, maximo: 2000, promedio: 17151.2 },
    },
  ],
  total: {
    registros: 2880,
    energiaActivaExportada: { suma: 12345000, sumaKwh: 12345, maximo: 500, promedio: 4287.8 },
    demandaActivaExportada: { suma: 49380000, maximo: 2000, promedio: 17151.2 },
  },
}

describe("lib/api/medidor-principal", () => {
  afterEach(() => vi.restoreAllMocks())

  it("maps ConsolidadoDto to ConsolidadoMedidorPrincipal, using total.energiaActivaExportada.sumaKwh", async () => {
    vi.mocked(apiFetch).mockResolvedValue(consolidadoDto)

    const result = await getConsolidadoMedidorPrincipal("p1", "2026-09")

    expect(apiFetch).toHaveBeenCalledWith(
      "/parques/p1/medidor-principal/registros/consolidado?periodo=2026-09"
    )
    expect(result).toEqual({
      desde: "2026-09-01T00:00:00.000Z",
      hasta: "2026-10-01T00:00:00.000Z",
      totalRegistros: 2880,
      energiaActivaExportadaKwh: 12345,
    })
  })

  it("returns null when apiFetch returns null (404 — sin medidor principal)", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)

    expect(await getConsolidadoMedidorPrincipal("p1", "2026-09")).toBeNull()
  })

  it("maps a null sumaKwh (ningún registro informó el valor) to energiaActivaExportadaKwh: null", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ...consolidadoDto,
      total: {
        ...consolidadoDto.total,
        energiaActivaExportada: { suma: null, sumaKwh: null, maximo: null, promedio: null },
      },
    })

    const result = await getConsolidadoMedidorPrincipal("p1", "2026-09")

    expect(result?.energiaActivaExportadaKwh).toBeNull()
  })

  it("propagates non-404 errors (network/HTTP failures) instead of swallowing them", async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error("boom"))

    await expect(getConsolidadoMedidorPrincipal("p1", "2026-09")).rejects.toThrow("boom")
  })
})

describe("lib/api/medidor-principal listRegistrosMedidorPrincipal", () => {
  afterEach(() => vi.restoreAllMocks())

  const registroDto = {
    id: "r1",
    medidorId: "m1",
    obtenidoEn: "2026-09-22T03:05:00.000Z",
    desde: "2026-09-22T02:50:00.000Z",
    hasta: "2026-09-22T03:05:00.000Z",
    fechaHora: "2026-09-22T00:05:00-03:00",
    energiaActivaExportada: 1234,
  }

  it("calls the endpoint with desde/hasta and maps RegistroHistoricoDto[] to the slim shape", async () => {
    vi.mocked(apiFetch).mockResolvedValue([registroDto])

    const result = await listRegistrosMedidorPrincipal(
      "p1",
      "2026-09-22T00:00:00-03:00",
      "2026-09-23T00:00:00-03:00"
    )

    expect(apiFetch).toHaveBeenCalledWith(
      "/parques/p1/medidor-principal/registros?desde=2026-09-22T00%3A00%3A00-03%3A00&hasta=2026-09-23T00%3A00%3A00-03%3A00"
    )
    expect(result).toEqual([
      { fechaHora: "2026-09-22T00:05:00-03:00", energiaActivaExportadaWh: 1234 },
    ])
  })

  it("returns [] when apiFetch returns null (404 — sin medidor principal)", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)

    expect(await listRegistrosMedidorPrincipal("p1", "d", "h")).toEqual([])
  })

  it("maps a null energiaActivaExportada to energiaActivaExportadaWh: null", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ ...registroDto, energiaActivaExportada: null }])

    const result = await listRegistrosMedidorPrincipal("p1", "d", "h")

    expect(result[0]?.energiaActivaExportadaWh).toBeNull()
  })

  it("coerces a string-typed energiaActivaExportada (Prisma Decimal serialized as string) to a real number", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ ...registroDto, energiaActivaExportada: "1234.5" }])

    const result = await listRegistrosMedidorPrincipal("p1", "d", "h")

    expect(result[0]?.energiaActivaExportadaWh).toBe(1234.5)
    expect(typeof result[0]?.energiaActivaExportadaWh).toBe("number")
  })

  it("maps a non-numeric string to null instead of NaN", async () => {
    vi.mocked(apiFetch).mockResolvedValue([{ ...registroDto, energiaActivaExportada: "n/a" }])

    const result = await listRegistrosMedidorPrincipal("p1", "d", "h")

    expect(result[0]?.energiaActivaExportadaWh).toBeNull()
  })
})
