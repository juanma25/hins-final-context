import { describe, it, expect } from "vitest"
import {
  buildComparativaGeneracionMesActual,
  buildComparativaGeneracionSeries,
  buildComparativaGeneracionDiaria,
} from "@/lib/energia-comparativa"
import type {
  ConsolidadoMedidorPrincipal,
  RegistroEnergiaDia,
  RegistroEnergiaMensual,
  RegistroMedidorPrincipal,
} from "@/lib/api/types"

function dimms(periodo: string, kwh: number | null): { periodo: string; dato: ConsolidadoMedidorPrincipal } {
  return {
    periodo,
    dato: {
      desde: `${periodo}-01T00:00:00.000Z`,
      hasta: `${periodo}-28T00:00:00.000Z`,
      totalRegistros: 1,
      energiaActivaExportadaKwh: kwh,
    },
  }
}

describe("lib/energia-comparativa", () => {
  describe("buildComparativaGeneracionMesActual", () => {
    it("combines DIMMs and Huawei values for the same period", () => {
      const punto = buildComparativaGeneracionMesActual(
        "2026-09",
        dimms("2026-09", 1000).dato,
        { periodo: "2026-09", energiaMesKwh: 900, ingresoMes: 100 }
      )
      expect(punto).toEqual({
        periodo: "2026-09",
        label: "Septiembre 2026",
        dimmsKwh: 1000,
        huaweiKwh: 900,
      })
    })

    it("keeps dimmsKwh null when the DIMMs source has no data (not fabricated)", () => {
      const punto = buildComparativaGeneracionMesActual("2026-09", null, {
        periodo: "2026-09",
        energiaMesKwh: 900,
        ingresoMes: 100,
      })
      expect(punto.dimmsKwh).toBeNull()
      expect(punto.huaweiKwh).toBe(900)
    })

    it("keeps huaweiKwh null when the Huawei source has no data (not fabricated)", () => {
      const punto = buildComparativaGeneracionMesActual("2026-09", dimms("2026-09", 1000).dato, null)
      expect(punto.huaweiKwh).toBeNull()
      expect(punto.dimmsKwh).toBe(1000)
    })
  })

  describe("buildComparativaGeneracionSeries", () => {
    it("aligns DIMMs and Huawei points by periodo, sorted ascending", () => {
      const dimmsPorPeriodo = [dimms("2026-08", 800), dimms("2026-07", 700)]
      const huawei: RegistroEnergiaMensual[] = [
        { periodo: "2026-07", energiaMesKwh: 650, ingresoMes: 10 },
        { periodo: "2026-08", energiaMesKwh: 750, ingresoMes: 10 },
      ]

      const series = buildComparativaGeneracionSeries(dimmsPorPeriodo, huawei)

      expect(series).toEqual([
        { periodo: "2026-07", label: "Julio 2026", dimmsKwh: 700, huaweiKwh: 650 },
        { periodo: "2026-08", label: "Agosto 2026", dimmsKwh: 800, huaweiKwh: 750 },
      ])
    })

    it("leaves a gap (null) for a period present in Huawei but missing in DIMMs", () => {
      const dimmsPorPeriodo = [dimms("2026-08", 800)]
      const huawei: RegistroEnergiaMensual[] = [
        { periodo: "2026-07", energiaMesKwh: 650, ingresoMes: 10 },
        { periodo: "2026-08", energiaMesKwh: 750, ingresoMes: 10 },
      ]

      const series = buildComparativaGeneracionSeries(dimmsPorPeriodo, huawei)

      expect(series.find((p) => p.periodo === "2026-07")).toEqual({
        periodo: "2026-07",
        label: "Julio 2026",
        dimmsKwh: null,
        huaweiKwh: 650,
      })
    })

    it("leaves a gap (null) for a period present in DIMMs but missing in Huawei", () => {
      const dimmsPorPeriodo = [dimms("2026-07", 700), dimms("2026-08", 800)]
      const huawei: RegistroEnergiaMensual[] = [
        { periodo: "2026-08", energiaMesKwh: 750, ingresoMes: 10 },
      ]

      const series = buildComparativaGeneracionSeries(dimmsPorPeriodo, huawei)

      expect(series.find((p) => p.periodo === "2026-07")).toEqual({
        periodo: "2026-07",
        label: "Julio 2026",
        dimmsKwh: 700,
        huaweiKwh: null,
      })
    })
  })

  describe("buildComparativaGeneracionDiaria", () => {
    function dimmsRegistro(fechaHora: string, wh: number | null): RegistroMedidorPrincipal {
      return { fechaHora, energiaActivaExportadaWh: wh }
    }
    function huaweiRegistro(capturadoEn: string, kwh: number | null): RegistroEnergiaDia {
      return {
        capturadoEn,
        energiaDiaKwh: kwh,
        ingresoDia: null,
        energiaTotalKwh: null,
        energiaInyectadaDiaKwh: null,
        energiaConsumidaDiaKwh: null,
      }
    }

    it("returns [] when neither source has any registros for the day", () => {
      expect(buildComparativaGeneracionDiaria([], [])).toEqual([])
    })

    it("dimmsKwh is the cumulative sum (Wh→kWh) of DIMMs deltas up to and including that hour", () => {
      const dimms = [
        dimmsRegistro("2026-09-22T08:00:00-03:00", 500), // 0.5 kWh
        dimmsRegistro("2026-09-22T08:15:00-03:00", 500), // +0.5 kWh
        dimmsRegistro("2026-09-22T09:00:00-03:00", 1000), // +1 kWh
      ]
      const result = buildComparativaGeneracionDiaria(dimms, [])

      expect(result).toEqual([
        { label: "08:00", dimmsKwh: 1, huaweiKwh: null },
        { label: "09:00", dimmsKwh: 2, huaweiKwh: null },
      ])
    })

    it("huaweiKwh is the latest known cumulative value at or before that hour (Huawei's field is already cumulative)", () => {
      const huawei = [huaweiRegistro("2026-09-22T08:30:00-03:00", 3.5), huaweiRegistro("2026-09-22T09:10:00-03:00", 5)]
      const result = buildComparativaGeneracionDiaria([], huawei)

      expect(result).toEqual([
        { label: "08:00", dimmsKwh: null, huaweiKwh: 3.5 },
        { label: "09:00", dimmsKwh: null, huaweiKwh: 5 },
      ])
    })

    it("emits one point per hour bucket present in either source (union), aligned by hour", () => {
      const dimms = [dimmsRegistro("2026-09-22T08:00:00-03:00", 500)]
      const huawei = [huaweiRegistro("2026-09-22T09:00:00-03:00", 2)]

      const result = buildComparativaGeneracionDiaria(dimms, huawei)

      expect(result).toEqual([
        { label: "08:00", dimmsKwh: 0.5, huaweiKwh: null },
        { label: "09:00", dimmsKwh: 0.5, huaweiKwh: 2 },
      ])
    })

    it("keeps dimmsKwh null for every point when DIMMs has no registros at all (source unavailable, not fabricated zero)", () => {
      const huawei = [huaweiRegistro("2026-09-22T08:00:00-03:00", 1)]
      const result = buildComparativaGeneracionDiaria([], huawei)
      expect(result.every((p) => p.dimmsKwh === null)).toBe(true)
    })

    it("converts a UTC (Z) Huawei timestamp to Argentina local hour instead of reading the raw UTC digits (regression: was off by 3h)", () => {
      // 17:00 UTC = 14:00 hora Argentina (UTC-3)
      const huawei = [huaweiRegistro("2026-09-22T17:00:00.000Z", 10)]
      const result = buildComparativaGeneracionDiaria([], huawei)
      expect(result).toEqual([{ label: "14:00", dimmsKwh: null, huaweiKwh: 10 }])
    })

    it("keeps huaweiKwh null for every point when Huawei has no registros at all", () => {
      const dimms = [dimmsRegistro("2026-09-22T08:00:00-03:00", 500000)]
      const result = buildComparativaGeneracionDiaria(dimms, [])
      expect(result.every((p) => p.huaweiKwh === null)).toBe(true)
    })

    it("treats a null energiaActivaExportadaWh delta as 0 contribution (not fabricated, not a gap)", () => {
      const dimms = [
        dimmsRegistro("2026-09-22T08:00:00-03:00", 500),
        dimmsRegistro("2026-09-22T09:00:00-03:00", null),
      ]
      const result = buildComparativaGeneracionDiaria(dimms, [])
      expect(result.find((p) => p.label === "09:00")?.dimmsKwh).toBe(0.5)
    })
  })
})
