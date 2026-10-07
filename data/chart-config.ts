// data/chart-config.ts
import type { ChartConfig } from "@/components/ui/chart"
import { participacionChartData } from "@/data/gdcv-socio-mock"

export const socioAhorroStackChartConfig = {
  inyectada: {
    label: "Energía Inyectada",
    color: "var(--chart-stack-inyectada)",
  },
  autoconsumo: {
    label: "Autoconsumo Virtual",
    color: "var(--chart-stack-autoconsumo)",
  },
  impuestos: {
    label: "Ahorro de Impuestos",
    color: "var(--chart-stack-impuestos)",
  },
} satisfies ChartConfig

export const parkEnergyBarChartConfig = {
  generated: {
    label: "Energía generada (kWh)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export const generationSparklineConfig = {
  value: {
    label: "kWh",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/** Curva recuperación ROI — semánticas alineadas a design-system § paleta financiera (Zinc real/proyección, Green favorable, Rose cautela). */
export const roiRecoveryChartConfig = {
  real: {
    label: "Real",
    color: "var(--foreground)",
  },
  base: {
    label: "Base",
    color: "rgba(82, 82, 91, 0.62)",
  },
  optimista: {
    label: "Optimista",
    color: "var(--chart-1)",
  },
  conservador: {
    label: "Conservador",
    /** Rose 400 — design-system § paleta financiera cautela */
    color: "#fb7185",
  },
} satisfies ChartConfig

export const gdcvEnergyBarChartConfig = {
  generated: {
    label: "Energía generada (kWh)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/** Comparativa DIMMs (principal) vs Huawei/FusionSolar (secundaria) — ver specs/012-comparativa-dimms-huawei. */
export const energiaComparativaChartConfig = {
  dimmsKwh: {
    label: "Medidor principal",
    color: "var(--chart-1)",
  },
  huaweiKwh: {
    label: "FusionSolar",
    color: "var(--chart-1-muted)",
  },
} satisfies ChartConfig

/** Apilado cuotaparte — mismos tokens que Monetary (green base + amber tope). */
export const parkEnergyShareChartConfig = {
  resto: {
    label: "Resto del parque",
    color: "var(--chart-stack-autoconsumo)",
  },
  miParte: {
    label: "Mi parte",
    color: "var(--chart-stack-inyectada)",
  },
} satisfies ChartConfig

export const dailyGenerationChartConfig = {
  kw: {
    label: "Generación",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/** Energía generada por hora, real (GET /parques/{id}/energia?periodo=AAAA-MM-DD) — pestaña DIA. */
export const dailyEnergyMeasuresChartConfig = {
  kwh: {
    label: "Generada",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

/** Alias del mismo preset que `roiRecoveryChartConfig` para GDCV/agc/socio */
export const gdcvRoiRecoveryChartConfig = roiRecoveryChartConfig

/** Donut participación por socio — un entry por slice (color desde mock). */
export const participacionChartConfig = Object.fromEntries(
  participacionChartData.map((slice) => [
    slice.name,
    { label: slice.name, color: slice.color },
  ])
) satisfies ChartConfig
