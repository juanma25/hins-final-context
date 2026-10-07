import { describe, it, expect, vi, afterEach } from "vitest"
import {
  isValidHistoricoRange,
  fetchHistorico,
  mapFacturacionRow,
  mapRegistroRow,
  mapMedicionRow,
} from "@/components/gdcv/SocioHistoricoDialog"

describe("isValidHistoricoRange", () => {
  it("returns false when both dates are undefined", () => {
    expect(isValidHistoricoRange(undefined, undefined)).toBe(false)
  })

  it("returns false when only desde is defined", () => {
    expect(isValidHistoricoRange(new Date("2026-01-01"), undefined)).toBe(false)
  })

  it("returns false when only hasta is defined", () => {
    expect(isValidHistoricoRange(undefined, new Date("2026-01-31"))).toBe(false)
  })

  it("returns false when hasta is before desde", () => {
    expect(isValidHistoricoRange(new Date("2026-01-31"), new Date("2026-01-01"))).toBe(false)
  })

  it("returns true when hasta equals desde", () => {
    expect(isValidHistoricoRange(new Date("2026-01-15"), new Date("2026-01-15"))).toBe(true)
  })

  it("returns true when hasta is after desde", () => {
    expect(isValidHistoricoRange(new Date("2026-01-01"), new Date("2026-01-31"))).toBe(true)
  })
})

describe("fetchHistorico", () => {
  const desde = new Date("2026-01-01")
  const hasta = new Date("2026-01-31")

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("resolves an empty array when the route returns no data (sin datos)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    )
    const result = await fetchHistorico("p1", "s1", "registros", desde, hasta)
    expect(result).toEqual([])
  })

  it("resolves the data as-is when the route returns items", async () => {
    const data = [{ id: "h1", obtenidoEn: "2026-01-15T00:00:00.000Z", tarifa: "0" }]
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => data })
    )
    const result = await fetchHistorico("p1", "s1", "facturacion", desde, hasta)
    expect(result).toEqual(data)
  })

  it("throws with the backend message when the route responds with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "backend no disponible" }),
      })
    )
    await expect(fetchHistorico("p1", "s1", "mediciones", desde, hasta)).rejects.toThrow(
      "backend no disponible"
    )
  })
})

describe("mapFacturacionRow", () => {
  it("maps all expected fields when present (API usa camelCase)", () => {
    const item = {
      ultimaLecturaFechaHora: "2026-01-15T00:00:00.000Z",
      ultimaLecturaActivaExportadaT1: "10",
      ultimaLecturaActivaExportadaT2: "20",
      ultimaLecturaActivaExportadaT3: "30",
      ultimaLecturaActivaExportadaT0: "40",
      ultimaLecturaActivaImportadaT0: "50",
    }
    expect(mapFacturacionRow(item)).toEqual({
      ultimaLecturaFechaHora: "2026-01-15T00:00:00.000Z",
      ultimaLecturaActivaExportadaT1: "10",
      ultimaLecturaActivaExportadaT2: "20",
      ultimaLecturaActivaExportadaT3: "30",
      ultimaLecturaActivaExportadaT0: "40",
      ultimaLecturaActivaImportadaT0: "50",
    })
  })

  it("coerces numeric fields to string, and maps null/missing fields to undefined", () => {
    const item = {
      ultimaLecturaFechaHora: "2026-01-15T00:00:00.000Z",
      ultimaLecturaActivaExportadaT1: 10,
      ultimaLecturaActivaExportadaT2: null,
    }
    const row = mapFacturacionRow(item)
    expect(row.ultimaLecturaFechaHora).toBe("2026-01-15T00:00:00.000Z")
    expect(row.ultimaLecturaActivaExportadaT1).toBe("10")
    expect(row.ultimaLecturaActivaExportadaT2).toBeUndefined()
    expect(row.ultimaLecturaActivaExportadaT3).toBeUndefined()
  })

  it("does not throw for a non-object item", () => {
    expect(() => mapFacturacionRow(null)).not.toThrow()
    expect(mapFacturacionRow(null)).toEqual({})
  })
})

describe("mapRegistroRow", () => {
  it("maps a real API sample (flat record, camelCase, no payload wrapper)", () => {
    const item = {
      id: "d23520ad-2905-46e4-9add-2daa2b53055e",
      socioId: "587ca25a-da5a-4552-9c58-de17cc209d08",
      fechaHora: "2026-09-16T16:45:00",
      energiaActivaImportada: "0",
      tarifa: "0",
      demandaActivaExportada: "0",
    }
    expect(mapRegistroRow(item)).toEqual({
      energiaActivaImportada: "0",
      tarifa: "0",
      demandaActivaExportada: "0",
      fechaHora: "2026-09-16T16:45:00",
    })
  })

  it("maps null fields to undefined without throwing (registro sin datos aún recolectados)", () => {
    const item = { fechaHora: null, energiaActivaImportada: null, tarifa: null, demandaActivaExportada: null }
    const row = mapRegistroRow(item)
    expect(row.fechaHora).toBeUndefined()
    expect(row.energiaActivaImportada).toBeUndefined()
    expect(row.demandaActivaExportada).toBeUndefined()
    expect(row.tarifa).toBeUndefined()
  })
})

describe("mapMedicionRow", () => {
  it("maps all expected fields when present (API usa camelCase)", () => {
    const item = {
      ultimoRegistroFechaHora: "2026-01-15T00:00:00.000Z",
      ultimaLecturaFechaHora: "2026-01-16T00:00:00.000Z",
    }
    expect(mapMedicionRow(item)).toEqual({
      ultimoRegistroFechaHora: "2026-01-15T00:00:00.000Z",
      ultimaLecturaFechaHora: "2026-01-16T00:00:00.000Z",
    })
  })

  it("maps missing fields to undefined without throwing", () => {
    const row = mapMedicionRow({})
    expect(row.ultimoRegistroFechaHora).toBeUndefined()
    expect(row.ultimaLecturaFechaHora).toBeUndefined()
  })
})
