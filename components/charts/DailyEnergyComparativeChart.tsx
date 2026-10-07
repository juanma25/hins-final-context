// components/charts/DailyEnergyComparativeChart.tsx
"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import { ChartContainer } from "@/components/ui/chart"
import { energiaComparativaChartConfig } from "@/data/chart-config"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DailyEnergyComparativePoint {
  /** Hora del punto (ej. "08:00"). */
  label: string
  /** Acumulado DIMMs (medidor principal) hasta esa hora, en kWh — `null` = sin dato. */
  dimmsKwh: number | null
  /** Acumulado Huawei (FusionSolar) hasta esa hora, en kWh — `null` = sin dato. */
  huaweiKwh: number | null
}

function formatKwh(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Sin dato"
  }
  return `${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kWh`
}

function ComparativeDailyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey?: string; value?: number }[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null

  const dimms = payload.find((p) => p.dataKey === "dimmsKwh")
  const huawei = payload.find((p) => p.dataKey === "huaweiKwh")

  return (
    <div className="grid min-w-[10rem] gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: "var(--chart-1)" }} />
            Medidor principal
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">{formatKwh(dimms?.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: "var(--chart-1-muted)" }} />
            FusionSolar
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">{formatKwh(huawei?.value)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Comparativa por hora — medidor principal (DIMMs, acumulado) vs Huawei
 * (FusionSolar, acumulado) — pestaña DIA. Ver
 * specs/012-comparativa-dimms-huawei (gráfico 1D).
 */
export function DailyEnergyComparativeChart({
  data,
  className,
}: {
  data: DailyEnergyComparativePoint[]
  className?: string
}) {
  const gradientId = useId().replace(/:/g, "")
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn("flex h-full min-h-[300px] w-full flex-col gap-2", className)}>
      <div className="flex shrink-0 items-center justify-end gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: "var(--chart-1)" }} />
          Medidor principal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: "var(--chart-1-muted)" }} />
          FusionSolar
        </span>
      </div>
      <ChartContainer
        config={energiaComparativaChartConfig}
        initialDimension={{ width: 320, height: 300 }}
        className="aspect-auto h-full min-h-[260px] w-full flex-1 [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full [&_.recharts-surface]:overflow-hidden"
      >
        <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 20 }}>
          <defs>
            <linearGradient id={`fillDailyDimms-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-dimmsKwh)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--color-dimmsKwh)" stopOpacity={0} />
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
          <Tooltip
            content={({ active, payload, label }) => (
              <ComparativeDailyTooltip
                active={active}
                payload={payload as unknown as { dataKey?: string; value?: number }[]}
                label={label}
              />
            )}
            cursor={{ stroke: "var(--border)" }}
          />
          <Area
            type="monotone"
            dataKey="dimmsKwh"
            stroke="var(--color-dimmsKwh)"
            fill={`url(#fillDailyDimms-${gradientId})`}
            fillOpacity={1}
            strokeWidth={2}
            connectNulls
            dot={{ r: 3, fill: "var(--color-dimmsKwh)" }}
            activeDot={{ r: 4, fill: "var(--color-dimmsKwh)" }}
            isAnimationActive={!prefersReducedMotion}
          />
          <Area
            type="monotone"
            dataKey="huaweiKwh"
            name="FusionSolar"
            stroke="var(--color-huaweiKwh)"
            fill="none"
            strokeWidth={2}
            strokeDasharray="4 3"
            connectNulls
            dot={{ r: 3, fill: "var(--color-huaweiKwh)" }}
            activeDot={{ r: 4, fill: "var(--color-huaweiKwh)" }}
            isAnimationActive={!prefersReducedMotion}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
