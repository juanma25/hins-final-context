// components/gdd/ParkPerformanceView.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ConsumptionHistoryTable } from "@/components/gdd/ConsumptionHistoryTable"
import { DailyEnergyTotalsBlock } from "@/components/charts/DailyEnergyTotalsBlock"
import { ParkEnergyBarChart } from "@/components/charts/ParkEnergyBarChart"
import { CHART_RANGE_TABS } from "@/components/gdd/chart-range-options"
import { CardWithResponsiveTabs } from "@/components/ui/card-with-responsive-tabs"
import { ParkDetailsCard } from "@/components/ui/park-details-card"
import { GDD_PERFORMANCE_TOP_ROW_GRID } from "@/components/ui/performance-placeholder-card"
import { KpiPrimary } from "@/components/ui/kpi-primary"
import { KpiSecondary } from "@/components/ui/kpi-secondary"
import { energiaComparativaChartConfig } from "@/data/chart-config"
import {
  gddParkDetails,
  highlightAprilCardMock,
  savingsCardMock,
  tariffCardMock,
} from "@/data/gdd-performance-mock"
import { toDateKey } from "@/data/gdcv-daily-mock"
import { getMonthNameEs } from "@/lib/format-periodo"
import {
  getGenerationHistoryRows,
  getMonthlyGenerationTotal,
  getMonthlySparklinePoints,
  getRegistroDelMesActual,
} from "@/lib/park-energy-series"
import {
  buildComparativaGeneracionMesActual,
  getComparativaGeneracionChartRows,
} from "@/lib/energia-comparativa"
import type { RegistroDimmsMesActual, RegistroDimmsPorPeriodo } from "@/lib/energia-comparativa"
import { parqueToDetailsMetrics } from "@/lib/park-details-metrics"
import type {
  Parque,
  RegistroEnergiaDia,
  RegistroEnergiaDiario,
  RegistroEnergiaMensual,
  RegistroMedidorPrincipal,
} from "@/lib/api/types"
import type { ChartRangeChip } from "@/types/chart-range"
import { DollarSignIcon, ZapIcon } from "lucide-react"

type DailyEnergiaResult =
  | { key: string; status: "ok"; registros: RegistroEnergiaDia[]; registrosDimms: RegistroMedidorPrincipal[] }
  | { key: string; status: "error" }

interface ParkPerformanceViewProps {
  /** Parque real — las métricas de ParkDetailsCard se derivan de acá. */
  parque: Parque
  /**
   * Registros reales de energía mensual (GET /parques/{id}/energia), usados
   * por 6M/1A/TODO y por 1M (registro del mes calendario actual dentro de
   * esta misma serie — ver specs/004-daily-monthly-energy-view).
   * `null` = la consulta falló (estado de error, distinto de lista vacía = sin datos).
   */
  registrosEnergia: RegistroEnergiaMensual[] | null
  /**
   * Registros diarios reales del mes actual (GET /parques/{id}/energia?periodo=YYYY-MM),
   * usados por la card destacada "Generada en [mes]". `null` = falló la carga.
   * El texto comparativo ("X kWh desde el Inicio") sigue mock por excepción documentada
   * — no hay endpoint de acumulado histórico (ver specs/003-monthly-generation-kpi).
   */
  registrosEnergiaDiaria: RegistroEnergiaDiario[] | null
  /** Mes consultado para registrosEnergiaDiaria, formato "YYYY-MM" — resuelto en el servidor. */
  periodoActual: string
  /**
   * Estado de la consulta al medidor principal (DIMMs) para `periodoActual` —
   * fuente principal de la comparativa de la card KPI. Ver
   * specs/012-comparativa-dimms-huawei.
   */
  registroDimmsMesActual: RegistroDimmsMesActual
  /**
   * Consolidados DIMMs por mes, uno por período visible en el rango de
   * gráfico (6M/1A) — fuente principal de la comparativa del gráfico.
   */
  registrosDimmsPorRango: RegistroDimmsPorPeriodo[]
}

export function ParkPerformanceView({
  parque,
  registrosEnergia,
  registrosEnergiaDiaria,
  periodoActual,
  registroDimmsMesActual,
  registrosDimmsPorRango,
}: ParkPerformanceViewProps) {
  const router = useRouter()
  const today = useMemo(() => new Date(), [])
  const [period, setPeriod] = useState<ChartRangeChip>("6m")
  const [activeDay, setActiveDay] = useState<Date>(today)
  const [dailyEnergia, setDailyEnergia] = useState<DailyEnergiaResult | null>(null)
  const dailyEnergiaKey = `${parque.id}:${toDateKey(activeDay)}`
  const isDailyLoading = period === "1d" && dailyEnergia?.key !== dailyEnergiaKey

  const registroMesActual = useMemo(
    () => getRegistroDelMesActual(registrosEnergia ?? [], periodoActual),
    [registrosEnergia, periodoActual]
  )

  const energiaLoadFailed = registrosEnergia === null

  const comparativaMesActual = useMemo(
    () =>
      buildComparativaGeneracionMesActual(
        periodoActual,
        registroDimmsMesActual.status === "ok" ? registroDimmsMesActual.registro : null,
        registroMesActual
      ),
    [periodoActual, registroDimmsMesActual, registroMesActual]
  )

  const dimmsMesActualNoDisponible = registroDimmsMesActual.status === "error"

  const comparativaChartRows = useMemo(
    () => getComparativaGeneracionChartRows(registrosDimmsPorRango, registrosEnergia ?? []),
    [registrosDimmsPorRango, registrosEnergia]
  )

  const dimmsRangoNoDisponible =
    registrosDimmsPorRango.length > 0 && registrosDimmsPorRango.every((r) => r.dato === null)

  const comparativeChartData = useMemo(() => {
    if (period === "1d" || registrosEnergia === null) {
      return []
    }
    if (period === "1m") {
      return [
        {
          label: comparativaMesActual.label,
          dimmsKwh: comparativaMesActual.dimmsKwh,
          huaweiKwh: comparativaMesActual.huaweiKwh,
        },
      ]
    }
    const slice = period === "6m" ? -6 : period === "1a" ? -12 : undefined
    return slice ? comparativaChartRows.slice(slice) : comparativaChartRows
  }, [period, registrosEnergia, comparativaMesActual, comparativaChartRows])

  const generationHistoryRows = useMemo(
    () => getGenerationHistoryRows(registrosEnergia ?? []),
    [registrosEnergia]
  )

  const monthlyGenerationFailed = registrosEnergiaDiaria === null

  const monthlyGenerationTotal = useMemo(
    () => getMonthlyGenerationTotal(registrosEnergiaDiaria ?? []),
    [registrosEnergiaDiaria]
  )

  const monthlySparklinePoints = useMemo(
    () => getMonthlySparklinePoints(registrosEnergiaDiaria ?? []),
    [registrosEnergiaDiaria]
  )

  useEffect(() => {
    if (period !== "1d") return

    const controller = new AbortController()
    const key = dailyEnergiaKey

    fetch(`/api/parques/${parque.id}/energia-dia?periodo=${toDateKey(activeDay)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Falla al consultar la energía del día")
        return response.json() as Promise<{
          registros: RegistroEnergiaDia[]
          registrosDimms: RegistroMedidorPrincipal[]
        }>
      })
      .then(({ registros, registrosDimms }) => setDailyEnergia({ key, status: "ok", registros, registrosDimms }))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setDailyEnergia({ key, status: "error" })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dailyEnergiaKey deriva de activeDay/parque.id, ya listados
  }, [period, activeDay, parque.id])

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className={GDD_PERFORMANCE_TOP_ROW_GRID}>
        <ParkDetailsCard
          imageSrc={gddParkDetails.imageSrc}
          imageAlt={gddParkDetails.imageAlt}
          metrics={parqueToDetailsMetrics(parque)}
          className="h-full"
        />
        <CardWithResponsiveTabs
          title="Energía Generada del Parque"
          tabs={CHART_RANGE_TABS}
          activeTab={period}
          defaultTab="6m"
          onTabChange={(v) => setPeriod(v as ChartRangeChip)}
          className="h-full"
        >
          {period === "1d" ? (
            isDailyLoading ? (
              <div className="flex min-h-[300px] w-full flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">Cargando…</p>
              </div>
            ) : dailyEnergia?.status === "error" ? (
              <div className="flex min-h-[300px] w-full flex-1 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">
                  No se pudo cargar la energía del día.
                </p>
                <Button variant="outline" size="sm" onClick={() => setActiveDay(new Date(activeDay))}>
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className="min-h-[300px] w-full flex-1">
                <DailyEnergyTotalsBlock
                  activeDay={activeDay}
                  today={today}
                  onActiveDayChange={setActiveDay}
                  registros={dailyEnergia?.status === "ok" ? dailyEnergia.registros : []}
                  registrosDimms={dailyEnergia?.status === "ok" ? dailyEnergia.registrosDimms : []}
                  className="h-full min-h-[300px]"
                />
              </div>
            )
          ) : energiaLoadFailed ? (
            <div className="flex min-h-[300px] w-full flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                No se pudo cargar la energía del parque.
              </p>
              <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                Reintentar
              </Button>
            </div>
          ) : comparativeChartData.length === 0 ? (
            <div className="flex min-h-[300px] w-full flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Sin registros de energía para este período.
              </p>
            </div>
          ) : (
            <div className="min-h-[300px] w-full flex-1">
              {dimmsRangoNoDisponible && (
                <p className="mb-2 text-xs text-muted-foreground">
                  Medidor principal no disponible para este rango — mostrando solo FusionSolar.
                </p>
              )}
              <ParkEnergyBarChart
                variant="comparative"
                data={comparativeChartData}
                chartConfig={energiaComparativaChartConfig}
                className="h-full min-h-[300px]"
              />
            </div>
          )}
        </CardWithResponsiveTabs>

        <div className="flex h-full flex-col gap-4 sm:gap-6">
          <KpiPrimary
            icon={ZapIcon}
            label={`Generada en ${getMonthNameEs(periodoActual)}`}
            value={
              comparativaMesActual.dimmsKwh === null
                ? "—"
                : comparativaMesActual.dimmsKwh.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
            }
            unit="kWh"
            primaryUnavailable={registroDimmsMesActual.status !== "ok"}
            comparativeLabel="FusionSolar"
            comparativeValue={
              monthlyGenerationFailed
                ? undefined
                : monthlyGenerationTotal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
            }
            delta={
              dimmsMesActualNoDisponible
                ? "No se pudo cargar el medidor principal"
                : registroDimmsMesActual.status === "sin-medidor"
                  ? "Parque sin medidor principal"
                  : monthlyGenerationFailed
                    ? "No se pudo cargar este mes"
                    // Mock por excepción documentada: sin endpoint de acumulado
                    // histórico desde el inicio (ver specs/003-monthly-generation-kpi).
                    : highlightAprilCardMock.compareBadge
            }
            sparklineData={monthlyGenerationFailed ? [] : monthlySparklinePoints}
          />

          <div className="grid flex-1 grid-cols-2 gap-4 sm:gap-6">
            <KpiSecondary
              icon={DollarSignIcon}
              label={savingsCardMock.label}
              value={savingsCardMock.amount}
              delta={savingsCardMock.deltaBadge}
            />
            <KpiSecondary
              icon={DollarSignIcon}
              label={tariffCardMock.label}
              value={`${tariffCardMock.value} ${tariffCardMock.unit}`}
              delta={tariffCardMock.deltaBadge}
              infoTooltip={{ content: "Ver tarifas vigentes", href: "#" }}
            />
          </div>
        </div>
      </div>

      <ConsumptionHistoryTable data={generationHistoryRows} />
    </div>
  )
}
