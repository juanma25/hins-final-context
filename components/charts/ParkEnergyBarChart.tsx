// components/charts/ParkEnergyBarChart.tsx
"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { getChartBarDensity } from "@/lib/chart-bar-density"
import { formatChartPeriodTooltipLabel } from "@/lib/format-chart-period-tooltip"
import { cn } from "@/lib/utils"

export type ParkEnergyTotalRow = { label: string; generated: number; hasData?: boolean }

export type ParkEnergyShareRow = ParkEnergyTotalRow & {
  miParte: number
  resto: number
}

/** Fila comparativa DIMMs (principal) vs Huawei (secundaria) — ver specs/012-comparativa-dimms-huawei. */
export type ParkEnergyComparativeRow = {
  label: string
  dimmsKwh: number | null
  huaweiKwh: number | null
}

type ParkEnergyBarChartBaseProps = {
  chartConfig: ChartConfig
  className?: string
}

type ParkEnergyBarChartTotalProps = ParkEnergyBarChartBaseProps & {
  variant?: "total"
  data: ParkEnergyTotalRow[]
}

type ParkEnergyBarChartShareProps = ParkEnergyBarChartBaseProps & {
  variant: "share"
  data: ParkEnergyShareRow[]
}

type ParkEnergyBarChartComparativeProps = ParkEnergyBarChartBaseProps & {
  variant: "comparative"
  data: ParkEnergyComparativeRow[]
}

export type ParkEnergyBarChartProps =
  | ParkEnergyBarChartTotalProps
  | ParkEnergyBarChartShareProps
  | ParkEnergyBarChartComparativeProps

function barFill(index: number, total: number, hasData?: boolean): string {
  if (hasData === false) {
    return "var(--border)"
  }
  if (index === total - 1) {
    return "var(--chart-1)"
  }
  return "var(--chart-1-muted)"
}

function formatKwh(value: number, maxFractionDigits = 0): string {
  return `${value.toLocaleString("es-AR", { maximumFractionDigits: maxFractionDigits })} kWh`
}

function formatKwhCompact(value: number): string {
  const hasDecimals = value % 1 !== 0
  return formatKwh(value, hasDecimals ? 1 : 0)
}

function getShareStackColor(
  chartConfig: ChartConfig,
  key: "resto" | "miParte",
  fallback: string
): string {
  const entry = chartConfig[key]
  return entry && "color" in entry && entry.color ? String(entry.color) : fallback
}

const SHARE_COLOR_RESTO = "var(--chart-stack-autoconsumo)"
const SHARE_COLOR_MI_PARTE = "var(--chart-stack-inyectada)"

type ShareTooltipProps = {
  active?: boolean
  payload?: { dataKey?: string; value?: number; payload?: ParkEnergyShareRow }[]
  label?: string | number
  rows: ParkEnergyShareRow[]
}

function ShareTooltip({ active, payload, label, rows }: ShareTooltipProps) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  if (!row) return null

  const index = rows.findIndex((d) => d.label === row.label)
  const prevTotal = index > 0 ? (rows[index - 1]?.generated ?? 0) : 0
  const delta = row.generated - prevTotal

  return (
    <div className="grid min-w-[10rem] gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium text-foreground">
        {formatChartPeriodTooltipLabel(String(label ?? row.label))}
      </p>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Total parque</span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatKwhCompact(row.generated)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: SHARE_COLOR_MI_PARTE }}
            />
            Mi parte
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatKwhCompact(row.miParte)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: SHARE_COLOR_RESTO }}
            />
            Resto del parque
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatKwhCompact(row.resto)}
          </span>
        </div>
      </div>
      {index > 0 ? (
        <p className="text-muted-foreground">
          {`${delta >= 0 ? "+" : ""}${delta.toLocaleString("es-AR", {
            maximumFractionDigits: 1,
          })} kWh vs mes anterior`}
        </p>
      ) : null}
    </div>
  )
}

type StackBarLabelProps = {
  x?: string | number
  y?: string | number
  width?: string | number
  index?: number
}

function renderShareTotalLabel(rows: ParkEnergyShareRow[]) {
  return (props: StackBarLabelProps) => {
    const index = props.index ?? -1
    const row = rows[index]
    if (
      !row ||
      props.x == null ||
      props.y == null ||
      props.width == null
    ) {
      return <text />
    }

    return (
      <text
        x={Number(props.x) + Number(props.width) / 2}
        y={Number(props.y) - 6}
        textAnchor="middle"
        fill="var(--foreground)"
        fontSize={10}
        fontWeight={500}
      >
        {formatKwhCompact(row.generated)}
      </text>
    )
  }
}

function ParkEnergyBarChartTotal({
  data,
  chartConfig,
  className,
}: ParkEnergyBarChartTotalProps) {
  const isMobile = useIsMobile()
  const n = data.length
  const density = getChartBarDensity(n, isMobile)

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        "aspect-auto h-[300px] min-h-[300px] w-full [&_.recharts-responsive-container]:!h-full",
        className
      )}
    >
      <BarChart
        data={data}
        margin={{
          left: 4,
          right: 8,
          top: density.showBarLabels ? 28 : 8,
          bottom: density.xAxisAngle ? 8 : 4,
        }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-border/60"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={density.xAxisAngle}
          textAnchor={density.xAxisAngle ? "end" : "middle"}
          height={density.xAxisHeight}
          interval={density.xAxisInterval}
          className="text-muted-foreground text-[10px] sm:text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground"
          tickFormatter={(v) => `${v}`}
        />
        {density.showTooltip ? (
          <ChartTooltip
            cursor={{ fill: "transparent" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  formatChartPeriodTooltipLabel(String(value ?? ""))
                }
                formatter={(value, _name, item) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value)
                  const index =
                    typeof item?.payload?.label === "string"
                      ? data.findIndex((d) => d.label === item.payload?.label)
                      : -1
                  const row = index >= 0 ? data[index] : undefined

                  if (row?.hasData === false) {
                    return (
                      <span className="text-muted-foreground">Sin dato</span>
                    )
                  }

                  const delta =
                    index > 0
                      ? numericValue - (data[index - 1]?.generated ?? 0)
                      : 0

                  return (
                    <div className="grid gap-1">
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {numericValue.toLocaleString("es-AR", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        kWh
                      </span>
                      <span className="text-muted-foreground">
                        {`${delta >= 0 ? "+" : ""}${delta.toLocaleString("es-AR", {
                          maximumFractionDigits: 0,
                        })} kWh vs mes anterior`}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
        ) : null}
        <Bar
          dataKey="generated"
          radius={n <= 16 ? [6, 6, 0, 0] : 0}
          barSize={density.barSize}
          background={false}
          minPointSize={0}
        >
          {data.map((row, index) => (
            <Cell key={`cell-${index}`} fill={barFill(index, n, row.hasData)} />
          ))}
          {density.showBarLabels ? (
            <LabelList
              position="top"
              dataKey="generated"
              className="fill-foreground text-[10px] font-medium"
              formatter={(value: unknown) =>
                typeof value === "number"
                  ? `${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })} kWh`
                  : ""
              }
            />
          ) : null}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

function ParkEnergyBarChartShare({
  data,
  chartConfig,
  className,
}: ParkEnergyBarChartShareProps) {
  const isMobile = useIsMobile()
  const n = data.length
  const density = getChartBarDensity(n, isMobile)
  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        "aspect-auto h-[300px] min-h-[300px] w-full [&_.recharts-responsive-container]:!h-full",
        className
      )}
    >
      <BarChart
        data={data}
        margin={{
          left: 4,
          right: 8,
          top: density.showBarLabels ? 28 : 8,
          bottom: density.xAxisAngle ? 8 : 4,
        }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-border/60"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={density.xAxisAngle}
          textAnchor={density.xAxisAngle ? "end" : "middle"}
          height={density.xAxisHeight}
          interval={density.xAxisInterval}
          className="text-muted-foreground text-[10px] sm:text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground"
          tickFormatter={(v) => `${v}`}
        />
        {density.showTooltip ? (
          <Tooltip
            content={({ active, payload, label }) => (
              <ShareTooltip
                active={active}
                payload={
                  payload as unknown as ShareTooltipProps["payload"]
                }
                label={label}
                rows={data}
              />
            )}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
        ) : null}
        <Bar
          dataKey="resto"
          stackId="park"
          fill={getShareStackColor(
            chartConfig,
            "resto",
            SHARE_COLOR_RESTO
          )}
          radius={0}
          barSize={density.barSize}
        />
        <Bar
          dataKey="miParte"
          stackId="park"
          fill={getShareStackColor(
            chartConfig,
            "miParte",
            SHARE_COLOR_MI_PARTE
          )}
          radius={n <= 16 ? [6, 6, 0, 0] : 0}
          barSize={density.barSize}
          label={
            density.showBarLabels ? renderShareTotalLabel(data) : false
          }
        />
      </BarChart>
    </ChartContainer>
  )
}

function ComparativeTooltip({
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
      <p className="font-medium text-foreground">
        {formatChartPeriodTooltipLabel(String(label ?? ""))}
      </p>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: "var(--chart-1)" }} />
            Medidor principal
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {typeof dimms?.value === "number" ? formatKwhCompact(dimms.value) : "Sin dato"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: "var(--chart-1-muted)" }} />
            FusionSolar
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {typeof huawei?.value === "number" ? formatKwhCompact(huawei.value) : "Sin dato"}
          </span>
        </div>
      </div>
    </div>
  )
}

function ParkEnergyBarChartComparative({
  data,
  chartConfig,
  className,
}: ParkEnergyBarChartComparativeProps) {
  const isMobile = useIsMobile()
  const n = data.length
  const density = getChartBarDensity(n, isMobile)

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        "aspect-auto h-[300px] min-h-[300px] w-full [&_.recharts-responsive-container]:!h-full",
        className
      )}
    >
      <BarChart
        data={data}
        margin={{
          left: 4,
          right: 8,
          top: 8,
          bottom: density.xAxisAngle ? 8 : 4,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={density.xAxisAngle}
          textAnchor={density.xAxisAngle ? "end" : "middle"}
          height={density.xAxisHeight}
          interval={density.xAxisInterval}
          className="text-muted-foreground text-[10px] sm:text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground"
          tickFormatter={(v) => `${v}`}
        />
        {density.showTooltip ? (
          <Tooltip
            content={({ active, payload, label }) => (
              <ComparativeTooltip
                active={active}
                payload={payload as unknown as { dataKey?: string; value?: number }[]}
                label={label}
              />
            )}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
        ) : null}
        <Bar
          dataKey="dimmsKwh"
          name="Medidor principal"
          fill="var(--chart-1)"
          radius={n <= 16 ? [6, 6, 0, 0] : 0}
          barSize={density.barSize}
        />
        <Bar
          dataKey="huaweiKwh"
          name="FusionSolar"
          fill="var(--chart-1-muted)"
          radius={n <= 16 ? [6, 6, 0, 0] : 0}
          barSize={density.barSize}
        />
      </BarChart>
    </ChartContainer>
  )
}

export function ParkEnergyBarChart(props: ParkEnergyBarChartProps) {
  if (props.variant === "share") {
    return <ParkEnergyBarChartShare {...props} />
  }
  if (props.variant === "comparative") {
    return <ParkEnergyBarChartComparative {...props} />
  }
  return <ParkEnergyBarChartTotal {...props} />
}
