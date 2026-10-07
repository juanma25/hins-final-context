// components/ui/kpi-primary.tsx
import { Card } from "@/components/ui/card"
import { IconBadge } from "@/components/ui/icon-badge"
import { SoftBadge } from "@/components/ui/soft-badge"
import { GenerationSparkline } from "@/components/charts/GenerationSparkline"
import { generationSparklineConfig } from "@/data/chart-config"
import { type LucideIcon } from "lucide-react"

interface KpiPrimaryProps {
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  delta: string
  sparklineData?: { value: number }[]
  /**
   * Valor de referencia secundaria (comparativa, ej. Huawei/FusionSolar)
   * mostrado junto al valor principal — ver specs/012-comparativa-dimms-huawei.
   */
  comparativeLabel?: string
  comparativeValue?: string
  /** true cuando la fuente principal no tiene dato para este período (distinto de "sin medidor"/"error", ver caller). */
  primaryUnavailable?: boolean
}

export function KpiPrimary({
  icon, label, value, unit, delta, sparklineData,
  comparativeLabel, comparativeValue, primaryUnavailable,
}: KpiPrimaryProps) {
  const indexed = sparklineData?.map((d, i) => ({ i, value: d.value })) ?? []

  return (
    <Card className="bg-white py-0 shadow-xs ring-0 rounded-xl overflow-hidden">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start gap-4">
          <IconBadge icon={icon} size="lg" />
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-lg font-semibold text-[#0A0A0A]">{label}</p>
            {primaryUnavailable ? (
              <p className="text-sm text-muted-foreground">
                Dato principal no disponible
              </p>
            ) : (
              <p className="text-4xl font-bold text-[#0A0A0A]">
                {value}
                {unit && <span className="text-xl font-semibold ml-1">{unit}</span>}
              </p>
            )}
            {comparativeValue && (
              <p className="text-sm text-muted-foreground">
                {comparativeLabel ?? "Comparativa"}: {comparativeValue}
                {unit && ` ${unit}`}
              </p>
            )}
          </div>
        </div>
        {indexed.length > 0 && (
          <div className="mx-[-16px]">
            <GenerationSparkline
              data={indexed}
              chartConfig={generationSparklineConfig}
              className="aspect-auto h-14 w-full"
            />
          </div>
        )}
        <SoftBadge>{delta}</SoftBadge>
      </div>
    </Card>
  )
}
