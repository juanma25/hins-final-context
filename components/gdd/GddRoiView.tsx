// components/gdd/GddRoiView.tsx
"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { GddRoiRecuperoTable, type GddRoiCurrency } from "@/components/gdd/GddRoiRecuperoTable"
import { ROIProjectionChart } from "@/components/charts/ROIProjectionChart"
import { Card } from "@/components/ui/card"
import { CardWithContent } from "@/components/ui/card-with-content"
import { KpiProgressBar } from "@/components/ui/kpi-progress-bar"
import { KpiSecondaryMetric } from "@/components/ui/kpi-secondary-metric"
import { KpiWithAsset } from "@/components/ui/kpi-with-asset"
import { KpiWithTimeline } from "@/components/ui/kpi-with-timeline"

import { gddRoiKpis, TIPO_CAMBIO_ARS, gddRoiProjectionData, GDD_ROI_FECHA_HOY } from "@/data/gdd-roi-mock"
import { useIsMobile } from "@/hooks/use-is-mobile"
import {
  formatCurrency,
  formatRoiFromUsdResponsive,
} from "@/lib/format-currency"
import type { RealRoiKpis } from "@/lib/roi-kpis"

interface GddRoiViewProps {
  /** KPIs reales derivados de RegistroRoi (lib/roi-kpis.ts), o null si el parque
   * aún no tiene registros de ROI cargados. "Recupero Estimado", "Plazo" y la
   * curva de proyección siguen en mock — sin equivalente en el contrato (ver
   * data-model.md, misma excepción documentada que Performance). */
  realKpis: RealRoiKpis | null
}

export function GddRoiView({ realKpis }: GddRoiViewProps) {
  const searchParams = useSearchParams()
  const currency = (searchParams.get("currency") ?? "usd") as GddRoiCurrency
  const isMobile = useIsMobile()
  const [tablaTab, setTablaTab] = useState<"proyectado" | "historico">("proyectado")

  const fmt = (valueUsd: number, desktopMode: "full" | "axis" = "full") =>
    formatRoiFromUsdResponsive(
      valueUsd,
      currency,
      TIPO_CAMBIO_ARS,
      isMobile,
      desktopMode
    )

  const kpis = {
    ...gddRoiKpis,
    ...(realKpis
      ? {
          totalInvertido: realKpis.totalInvertido,
          inversionRecuperada: realKpis.inversionRecuperada,
          porcentajeRecuperado: realKpis.porcentajeRecuperado,
          pendienteRecuperar: realKpis.pendienteRecuperar,
          tir: realKpis.tir,
        }
      : {}),
  }

  const pct = kpis.porcentajeRecuperado
  const totalInvertidoCompact = fmt(kpis.totalInvertido, "axis")

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div className="grid min-h-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr_auto]">
        <KpiWithAsset
          label="Inversión Recuperada"
          value={fmt(kpis.inversionRecuperada)}
          asset={
            <KpiProgressBar
              percent={pct}
              bottomLabels={{
                left: { value: formatCurrency(0, currency) },
                right: {
                  label: "Total Invertido:",
                  value: fmt(kpis.totalInvertido),
                },
              }}
            />
          }
          bottomLabel="Pendiente de recuperar"
          bottomValue={fmt(kpis.pendienteRecuperar)}
        />

        <KpiWithTimeline
          label="Recupero Estimado"
          value={kpis.recuperoEstimado}
          metricBadge="Payback"
          timelineData={kpis.timeline}
        />

        <Card className="flex h-full min-h-0 flex-col bg-white p-6 shadow-xs ring-0 rounded-xl">
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-6 lg:content-between">
            <KpiSecondaryMetric
              label="TIR"
              value={kpis.tir}
              size="standard"
              valueClassName="text-green-600"
              className="min-w-0"
            />
            <KpiSecondaryMetric
              label="Plazo"
              value={kpis.plazo}
              size="standard"
              className="min-w-0 lg:items-start lg:text-left items-center text-center"
            />
            <KpiSecondaryMetric
              label="Invertido"
              value={totalInvertidoCompact}
              size="standard"
              className="min-w-0 items-end text-right lg:items-start lg:text-left"
            />
          </div>
        </Card>
      </div>

      <GddRoiRecuperoTable
        variant={tablaTab}
        onVariantChange={setTablaTab}
        currency={currency}
      />

      <CardWithContent
        title="Curva de Recuperación"
        className="flex min-h-0 flex-col"
      >
        <ROIProjectionChart
          data={gddRoiProjectionData}
          inversionMeta={kpis.totalInvertido}
          fechaHoy={GDD_ROI_FECHA_HOY}
          showRangeChips={true}
          showScenarioBands={true}
          className="h-full min-h-[420px] w-full"
        />
      </CardWithContent>
    </div>
  )
}
