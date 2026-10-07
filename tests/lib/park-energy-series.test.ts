import { describe, it, expect } from "vitest"

import {
  getRealParkEnergySeries,
  getGenerationHistoryRows,
  getMonthlyGenerationTotal,
  getMonthlySparklinePoints,
  getRegistroMasRecienteDelDia,
  getRegistrosDelDiaOrdenados,
  getRegistroDelMesActual,
} from "@/lib/park-energy-series"
import type { RegistroEnergiaDia, RegistroEnergiaDiario, RegistroEnergiaMensual } from "@/lib/api/types"

describe("lib/park-energy-series", () => {
  it("returns [] for an empty registros list", () => {
    expect(getRealParkEnergySeries([], "6m")).toEqual([])
  })

  it("orders by periodo ascending regardless of input order", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-03", energiaMesKwh: 300, ingresoMes: 30 },
      { periodo: "2026-01", energiaMesKwh: 100, ingresoMes: 10 },
      { periodo: "2026-02", energiaMesKwh: 200, ingresoMes: 20 },
    ]
    const result = getRealParkEnergySeries(registros, "todo")
    expect(result.map((r) => r.generated)).toEqual([100, 200, 300])
  })

  it("dedupes repeated periodo, keeping the last one received", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-01", energiaMesKwh: 100, ingresoMes: 10 },
      { periodo: "2026-01", energiaMesKwh: 999, ingresoMes: 90 },
    ]
    const result = getRealParkEnergySeries(registros, "todo")
    expect(result).toHaveLength(1)
    expect(result[0].generated).toBe(999)
  })

  it("slices last 6 months for range 6m", () => {
    const registros: RegistroEnergiaMensual[] = Array.from({ length: 12 }, (_, i) => ({
      periodo: `2026-${String(i + 1).padStart(2, "0")}`,
      energiaMesKwh: i,
      ingresoMes: i,
    }))
    const result = getRealParkEnergySeries(registros, "6m")
    expect(result).toHaveLength(6)
    expect(result[0].generated).toBe(6)
    expect(result[5].generated).toBe(11)
  })

  it("slices last 12 months for range 1a", () => {
    const registros: RegistroEnergiaMensual[] = Array.from({ length: 15 }, (_, i) => ({
      periodo: `2025-${String((i % 12) + 1).padStart(2, "0")}`,
      energiaMesKwh: i,
      ingresoMes: i,
    }))
    const result = getRealParkEnergySeries(registros, "1a")
    expect(result).toHaveLength(12)
  })

  it("returns all months for range todo", () => {
    const registros: RegistroEnergiaMensual[] = Array.from({ length: 20 }, (_, i) => ({
      periodo: `${2023 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`,
      energiaMesKwh: i,
      ingresoMes: i,
    }))
    expect(getRealParkEnergySeries(registros, "todo")).toHaveLength(20)
  })

  it("returns [] for range 1d (not served by this endpoint)", () => {
    const registros: RegistroEnergiaMensual[] = [{ periodo: "2026-01", energiaMesKwh: 1, ingresoMes: 1 }]
    expect(getRealParkEnergySeries(registros, "1d")).toEqual([])
  })

  it("maps a null energiaMesKwh to generated: 0 with hasData: false, without dropping the month", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-01", energiaMesKwh: 100, ingresoMes: 10 },
      { periodo: "2026-02", energiaMesKwh: null, ingresoMes: null },
    ]
    const result = getRealParkEnergySeries(registros, "todo")
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ generated: 100, hasData: true })
    expect(result[1]).toMatchObject({ generated: 0, hasData: false })
  })

  it("formats the label from periodo YYYY-MM to a readable month/year", () => {
    const registros: RegistroEnergiaMensual[] = [{ periodo: "2026-07", energiaMesKwh: 1, ingresoMes: 1 }]
    const result = getRealParkEnergySeries(registros, "todo")
    expect(result[0].label).toBe("Julio 2026")
  })
})

describe("lib/park-energy-series getGenerationHistoryRows", () => {
  it("returns [] for an empty registros list", () => {
    expect(getGenerationHistoryRows([])).toEqual([])
  })

  it("orders rows by periodo descending (most recent first)", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-01", energiaMesKwh: 100, ingresoMes: 10 },
      { periodo: "2026-03", energiaMesKwh: 300, ingresoMes: 30 },
      { periodo: "2026-02", energiaMesKwh: 200, ingresoMes: 20 },
    ]
    const result = getGenerationHistoryRows(registros)
    expect(result.map((r) => r.period)).toEqual(["Marzo 2026", "Febrero 2026", "Enero 2026"])
  })

  it("maps energiaMesKwh to energyGenerated and zeroes out every other column", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-07", energiaMesKwh: 18190.5, ingresoMes: 53518.69 },
    ]
    const result = getGenerationHistoryRows(registros)
    expect(result[0]).toEqual({
      period: "Julio 2026",
      energyGenerated: "18.191 kWh",
      energyAcquired: "0 kWh",
      energyFromOtherSources: "0 kWh",
      totalEnergy: "0 kWh",
      acquiredPercent: "0%",
      totalPercent: "0%",
      estimatedSavings: "$ 0",
    })
  })

  it("maps a null energiaMesKwh to 0 kWh generated instead of dropping the row", () => {
    const registros: RegistroEnergiaMensual[] = [{ periodo: "2026-01", energiaMesKwh: null, ingresoMes: null }]
    const result = getGenerationHistoryRows(registros)
    expect(result[0].energyGenerated).toBe("0 kWh")
  })

  it("dedupes repeated periodo, keeping the last one received", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-01", energiaMesKwh: 100, ingresoMes: 10 },
      { periodo: "2026-01", energiaMesKwh: 999, ingresoMes: 90 },
    ]
    const result = getGenerationHistoryRows(registros)
    expect(result).toHaveLength(1)
    expect(result[0].energyGenerated).toBe("999 kWh")
  })
})

describe("lib/park-energy-series getMonthlyGenerationTotal", () => {
  it("returns 0 for an empty registros list", () => {
    expect(getMonthlyGenerationTotal([])).toBe(0)
  })

  it("sums energiaDiaKwh across days, treating null as 0", () => {
    const registros: RegistroEnergiaDiario[] = [
      { fecha: "2026-07-01", energiaDiaKwh: 10, ingresoDia: 1 },
      { fecha: "2026-07-02", energiaDiaKwh: null, ingresoDia: null },
      { fecha: "2026-07-03", energiaDiaKwh: 5.5, ingresoDia: 1 },
    ]
    expect(getMonthlyGenerationTotal(registros)).toBe(15.5)
  })

  it("dedupes repeated fecha, keeping the last one received, before summing", () => {
    const registros: RegistroEnergiaDiario[] = [
      { fecha: "2026-07-01", energiaDiaKwh: 10, ingresoDia: 1 },
      { fecha: "2026-07-01", energiaDiaKwh: 999, ingresoDia: 1 },
    ]
    expect(getMonthlyGenerationTotal(registros)).toBe(999)
  })
})

describe("lib/park-energy-series getMonthlySparklinePoints", () => {
  it("returns [] for an empty registros list", () => {
    expect(getMonthlySparklinePoints([])).toEqual([])
  })

  it("returns one point per day, ordered by fecha ascending", () => {
    const registros: RegistroEnergiaDiario[] = [
      { fecha: "2026-07-03", energiaDiaKwh: 30, ingresoDia: 1 },
      { fecha: "2026-07-01", energiaDiaKwh: 10, ingresoDia: 1 },
      { fecha: "2026-07-02", energiaDiaKwh: 20, ingresoDia: 1 },
    ]
    expect(getMonthlySparklinePoints(registros)).toEqual([
      { value: 10 },
      { value: 20 },
      { value: 30 },
    ])
  })

  it("maps a null energiaDiaKwh to 0 without cutting the series", () => {
    const registros: RegistroEnergiaDiario[] = [
      { fecha: "2026-07-01", energiaDiaKwh: 10, ingresoDia: 1 },
      { fecha: "2026-07-02", energiaDiaKwh: null, ingresoDia: null },
      { fecha: "2026-07-03", energiaDiaKwh: 30, ingresoDia: 1 },
    ]
    expect(getMonthlySparklinePoints(registros)).toEqual([
      { value: 10 },
      { value: 0 },
      { value: 30 },
    ])
  })

  it("dedupes repeated fecha, keeping the last one received", () => {
    const registros: RegistroEnergiaDiario[] = [
      { fecha: "2026-07-01", energiaDiaKwh: 10, ingresoDia: 1 },
      { fecha: "2026-07-01", energiaDiaKwh: 999, ingresoDia: 1 },
    ]
    expect(getMonthlySparklinePoints(registros)).toEqual([{ value: 999 }])
  })
})

describe("lib/park-energy-series getRegistroMasRecienteDelDia", () => {
  it("returns null for an empty registros list", () => {
    expect(getRegistroMasRecienteDelDia([])).toBeNull()
  })

  it("returns the single registro when there is only one", () => {
    const registro: RegistroEnergiaDia = {
      capturadoEn: "2026-07-20T14:41:56.703Z",
      energiaDiaKwh: 93.61,
      ingresoDia: 6843.04,
      energiaTotalKwh: 901509.7,
      energiaInyectadaDiaKwh: 0,
      energiaConsumidaDiaKwh: 0,
    }
    expect(getRegistroMasRecienteDelDia([registro])).toEqual(registro)
  })

  it("returns the registro with the most recent capturadoEn when there are several", () => {
    const older: RegistroEnergiaDia = {
      capturadoEn: "2026-07-20T08:00:00.000Z",
      energiaDiaKwh: 10,
      ingresoDia: 1,
      energiaTotalKwh: 100,
      energiaInyectadaDiaKwh: 0,
      energiaConsumidaDiaKwh: 0,
    }
    const newer: RegistroEnergiaDia = {
      capturadoEn: "2026-07-20T14:41:56.703Z",
      energiaDiaKwh: 93.61,
      ingresoDia: 6843.04,
      energiaTotalKwh: 901509.7,
      energiaInyectadaDiaKwh: 0,
      energiaConsumidaDiaKwh: 0,
    }
    expect(getRegistroMasRecienteDelDia([older, newer])).toEqual(newer)
    expect(getRegistroMasRecienteDelDia([newer, older])).toEqual(newer)
  })
})

describe("lib/park-energy-series getRegistrosDelDiaOrdenados", () => {
  it("returns [] for an empty registros list", () => {
    expect(getRegistrosDelDiaOrdenados([])).toEqual([])
  })

  it("orders by capturadoEn ascending regardless of input order", () => {
    const a: RegistroEnergiaDia = {
      capturadoEn: "2026-07-20T06:00:00.000Z",
      energiaDiaKwh: 10,
      ingresoDia: 1,
      energiaTotalKwh: 100,
      energiaInyectadaDiaKwh: 0,
      energiaConsumidaDiaKwh: 0,
    }
    const b: RegistroEnergiaDia = {
      capturadoEn: "2026-07-20T12:00:00.000Z",
      energiaDiaKwh: 50,
      ingresoDia: 5,
      energiaTotalKwh: 140,
      energiaInyectadaDiaKwh: 0,
      energiaConsumidaDiaKwh: 0,
    }
    const c: RegistroEnergiaDia = {
      capturadoEn: "2026-07-20T18:00:00.000Z",
      energiaDiaKwh: 93.61,
      ingresoDia: 6843.04,
      energiaTotalKwh: 901509.7,
      energiaInyectadaDiaKwh: 0,
      energiaConsumidaDiaKwh: 0,
    }
    expect(getRegistrosDelDiaOrdenados([c, a, b])).toEqual([a, b, c])
  })
})

describe("lib/park-energy-series getRegistroDelMesActual", () => {
  it("returns null for an empty registros list", () => {
    expect(getRegistroDelMesActual([], "2026-07")).toBeNull()
  })

  it("returns the registro matching the current periodo", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-06", energiaMesKwh: 100, ingresoMes: 10 },
      { periodo: "2026-07", energiaMesKwh: 200, ingresoMes: 20 },
    ]
    expect(getRegistroDelMesActual(registros, "2026-07")).toEqual({
      periodo: "2026-07",
      energiaMesKwh: 200,
      ingresoMes: 20,
    })
  })

  it("returns null when the series has no registro for the current periodo", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-06", energiaMesKwh: 100, ingresoMes: 10 },
    ]
    expect(getRegistroDelMesActual(registros, "2026-07")).toBeNull()
  })

  it("returns the registro even when energiaMesKwh is null, without treating it as missing", () => {
    const registros: RegistroEnergiaMensual[] = [
      { periodo: "2026-07", energiaMesKwh: null, ingresoMes: null },
    ]
    expect(getRegistroDelMesActual(registros, "2026-07")).toEqual({
      periodo: "2026-07",
      energiaMesKwh: null,
      ingresoMes: null,
    })
  })
})
