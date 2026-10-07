import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

vi.mock("@/lib/api/client", () => ({
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message = "Sesión expirada o inválida") {
      super(message)
      this.name = "UnauthorizedError"
    }
  },
}))

vi.mock("@/lib/api/dashboard-context", () => ({
  resolveDashboardContext: vi.fn(),
}))

vi.mock("@/lib/api/energia", () => ({
  listEnergia: vi.fn(),
  listEnergiaDiaria: vi.fn(),
}))

vi.mock("@/lib/api/medidor-principal", () => ({
  getConsolidadoMedidorPrincipal: vi.fn(),
}))

vi.mock("@/components/gdd/GddPerformanceView", () => ({
  GddPerformanceView: vi.fn(() => null),
}))

vi.mock("@/components/gdd/GddPageHeading", () => ({
  GddPageHeading: () => null,
}))

import { redirect } from "next/navigation"
import { UnauthorizedError } from "@/lib/api/client"
import { resolveDashboardContext } from "@/lib/api/dashboard-context"
import { listEnergia, listEnergiaDiaria } from "@/lib/api/energia"
import { getConsolidadoMedidorPrincipal } from "@/lib/api/medidor-principal"
import GddPerformancePage from "@/app/gdd/performance/page"
import type { ReactElement } from "react"

function findViewProps(element: ReactElement): Record<string, unknown> {
  const children = (element.props as { children: ReactElement[] }).children
  const view = children[children.length - 1]
  return view.props as Record<string, unknown>
}

const parque = {
  id: "parque-1",
  proyectoId: "proy-1",
  potenciaTotalKwp: 100,
  fechaPuestaEnMarcha: "2026-01-01",
  stationExternalId: null,
  nombreExterno: null,
  direccion: null,
  longitud: null,
  latitud: null,
  contactoNombre: null,
  contactoInfo: null,
}

const proyecto = {
  id: "proy-1",
  nombre: "PSF Test",
  modelo: "GDD" as const,
  ubicacion: "",
  fechaAlta: "2026-01-01",
  activo: true,
}

describe("app/gdd/performance/page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getConsolidadoMedidorPrincipal).mockResolvedValue(null)
  })
  afterEach(() => vi.restoreAllMocks())

  it("passes registroDimmsMesActual: ok to GddPerformanceView when getConsolidadoMedidorPrincipal succeeds", async () => {
    vi.mocked(resolveDashboardContext).mockResolvedValue({ proyecto, parque })
    vi.mocked(listEnergia).mockResolvedValue([])
    vi.mocked(listEnergiaDiaria).mockResolvedValue([])
    const registroDimms = {
      desde: "2026-09-01T00:00:00.000Z",
      hasta: "2026-10-01T00:00:00.000Z",
      totalRegistros: 100,
      energiaActivaExportadaKwh: 1234,
    }
    vi.mocked(getConsolidadoMedidorPrincipal).mockResolvedValue(registroDimms)

    const element = await GddPerformancePage({ searchParams: Promise.resolve({ proyectoId: "proy-1" }) })

    expect(findViewProps(element)).toEqual(
      expect.objectContaining({
        registroDimmsMesActual: { status: "ok", registro: registroDimms },
      })
    )
  })

  it("passes registroDimmsMesActual: sin-medidor (404, not an error) when getConsolidadoMedidorPrincipal resolves null", async () => {
    vi.mocked(resolveDashboardContext).mockResolvedValue({ proyecto, parque })
    vi.mocked(listEnergia).mockResolvedValue([])
    vi.mocked(listEnergiaDiaria).mockResolvedValue([])
    vi.mocked(getConsolidadoMedidorPrincipal).mockResolvedValue(null)

    const element = await GddPerformancePage({ searchParams: Promise.resolve({ proyectoId: "proy-1" }) })

    expect(findViewProps(element)).toEqual(
      expect.objectContaining({ registroDimmsMesActual: { status: "sin-medidor" } })
    )
  })

  it("passes registroDimmsMesActual: error (distinct from sin-medidor) when getConsolidadoMedidorPrincipal throws, without tumbling the page", async () => {
    vi.mocked(resolveDashboardContext).mockResolvedValue({ proyecto, parque })
    vi.mocked(listEnergia).mockResolvedValue([])
    vi.mocked(listEnergiaDiaria).mockResolvedValue([])
    vi.mocked(getConsolidadoMedidorPrincipal).mockRejectedValue(new Error("boom"))

    const element = await GddPerformancePage({ searchParams: Promise.resolve({ proyectoId: "proy-1" }) })

    expect(findViewProps(element)).toEqual(
      expect.objectContaining({ registroDimmsMesActual: { status: "error" } })
    )
  })

  it("redirects to /login when getConsolidadoMedidorPrincipal throws UnauthorizedError", async () => {
    vi.mocked(resolveDashboardContext).mockResolvedValue({ proyecto, parque })
    vi.mocked(listEnergia).mockResolvedValue([])
    vi.mocked(listEnergiaDiaria).mockResolvedValue([])
    vi.mocked(getConsolidadoMedidorPrincipal).mockRejectedValue(new UnauthorizedError())

    await expect(
      GddPerformancePage({ searchParams: Promise.resolve({ proyectoId: "proy-1" }) })
    ).rejects.toThrow("REDIRECT:/login")
    expect(redirect).toHaveBeenCalledWith("/login")
  })

  it("passes registrosDimmsPorRango, fetched per-month in parallel for the chart range", async () => {
    vi.mocked(resolveDashboardContext).mockResolvedValue({ proyecto, parque })
    vi.mocked(listEnergia).mockResolvedValue([
      { periodo: "2026-07", energiaMesKwh: 100, ingresoMes: 1 },
      { periodo: "2026-08", energiaMesKwh: 110, ingresoMes: 1 },
      { periodo: "2026-09", energiaMesKwh: 120, ingresoMes: 1 },
    ])
    vi.mocked(listEnergiaDiaria).mockResolvedValue([])
    vi.mocked(getConsolidadoMedidorPrincipal).mockResolvedValue(null)

    const element = await GddPerformancePage({ searchParams: Promise.resolve({ proyectoId: "proy-1" }) })
    const props = findViewProps(element)

    expect(Array.isArray(props.registrosDimmsPorRango)).toBe(true)
    expect((props.registrosDimmsPorRango as unknown[]).length).toBe(3)
    expect(getConsolidadoMedidorPrincipal).toHaveBeenCalledTimes(4) // 3 range months + 1 current-month card fetch
  })
})
