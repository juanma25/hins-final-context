import { describe, it, expect } from "vitest"

import { computeRealRoiKpis } from "@/lib/roi-kpis"
import type { RegistroRoi } from "@/lib/api/types"

function registro(overrides: Partial<RegistroRoi>): RegistroRoi {
  return {
    id: "r1",
    parqueId: "p1",
    socioId: null,
    periodo: "2026-01",
    inversionMeta: 1000,
    creditoAcumulado: 250,
    paybackEstimadoMeses: null,
    tir: null,
    ...overrides,
  }
}

describe("computeRealRoiKpis", () => {
  it("returns null for an empty registros array", () => {
    expect(computeRealRoiKpis([])).toBeNull()
  })

  it("derives KPIs from the most recent periodo when multiple registros exist", () => {
    const registros = [
      registro({ periodo: "2026-01", inversionMeta: 1000, creditoAcumulado: 100, tir: 0.1 }),
      registro({ periodo: "2026-03", inversionMeta: 1000, creditoAcumulado: 400, tir: 0.12 }),
      registro({ periodo: "2026-02", inversionMeta: 1000, creditoAcumulado: 250, tir: 0.11 }),
    ]

    const kpis = computeRealRoiKpis(registros)

    expect(kpis).toEqual({
      totalInvertido: 1000,
      inversionRecuperada: 400,
      porcentajeRecuperado: 40,
      pendienteRecuperar: 600,
      tir: "12.00%",
    })
  })

  it("formats tir as em dash when null", () => {
    const kpis = computeRealRoiKpis([registro({ tir: null })])
    expect(kpis?.tir).toBe("—")
  })

  it("clamps pendienteRecuperar at 0 when creditoAcumulado exceeds inversionMeta", () => {
    const kpis = computeRealRoiKpis([registro({ inversionMeta: 1000, creditoAcumulado: 1500 })])
    expect(kpis?.pendienteRecuperar).toBe(0)
  })

  it("returns porcentajeRecuperado 0 when inversionMeta is 0 (avoids division by zero)", () => {
    const kpis = computeRealRoiKpis([registro({ inversionMeta: 0, creditoAcumulado: 0 })])
    expect(kpis?.porcentajeRecuperado).toBe(0)
  })
})
