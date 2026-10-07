// components/charts/DailyEnergyMeasuresChart.tsx
"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { dailyEnergyMeasuresChartConfig } from "@/data/chart-config"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DailyEnergyMeasurePoint {
  /** Hora del registro (ej. "08:00"), extraída de `capturadoEn`. */
  label: string
  /** `energiaDiaKwh` de ese registro — energía generada acumulada del día a esa hora. */
  kwh: number
}

function formatKwhTooltip(value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(numeric)) {
    return ""
  }
  return `${numeric.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kWh`
}

/**
 * Energía generada real por hora — un punto por cada registro real que el
 * backend capturó ese día (`capturadoEn`), no una curva simulada. Mismo
 * estilo visual que la card "Generada en [mes]" (GenerationSparkline) pero a
 * tamaño completo, con ejes. Ver specs/004-daily-monthly-energy-view.
 */
export function DailyEnergyMeasuresChart({
  data,
  className,
}: {
  data: DailyEnergyMeasurePoint[]
  className?: string
}) {
  const gradientId = useId().replace(/:/g, "")
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <ChartContainer
      config={dailyEnergyMeasuresChartConfig}
      initialDimension={{ width: 320, height: 300 }}
      className={cn(
        "aspect-auto h-full min-h-[300px] w-full [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full [&_.recharts-surface]:overflow-hidden",
        className
      )}
    >
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 20 }}>
        <defs>
          <linearGradient id={`fillDailyMeasures-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-kwh)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-kwh)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground text-xs"
        />
        <YAxis
          hide
          tickLine={false}
          axisLine={false}
          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15 * 10) / 10]}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatKwhTooltip(value)} />} />
        <Area
          type="monotone"
          dataKey="kwh"
          stroke="var(--color-kwh)"
          fill={`url(#fillDailyMeasures-${gradientId})`}
          fillOpacity={1}
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-kwh)" }}
          activeDot={{ r: 4, fill: "var(--color-kwh)" }}
          isAnimationActive={!prefersReducedMotion}
        />
      </AreaChart>
    </ChartContainer>
  )
}
