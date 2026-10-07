// lib/dashboard-downloads.ts

import JSZip from "jszip"

import type {
  DashboardDownloadOption,
  DashboardDownloadsVariant,
} from "@/data/dashboard-downloads-mock"
import {
  gdcvRoiHistorico,
  gdcvRoiProyectado,
} from "@/data/gdcv-agc-mock"
import { GDCV_ENERGY_MONTHLY_CANONICAL } from "@/data/gdcv-mock"
import {
  consumptionHistoryMock,
  GDD_ENERGY_MONTHLY_CANONICAL,
} from "@/data/gdd-performance-mock"
import {
  gddRoiHistorico,
  gddRoiProyectado,
} from "@/data/gdd-roi-mock"
import {
  gdcvMantenimientoHistorialMock,
  gddMantenimientoHistorialMock,
} from "@/data/mantenimiento-mock"

export const DASHBOARD_DOWNLOAD_ALL_LABEL = "Descargar todo"

type DashboardExportFile = {
  filename: string
  content: string
}

function escapeCsvCell(value: string | number): string {
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function rowsToCsv(headers: string[], rows: Array<Array<string | number>>): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ]
  return `\uFEFF${lines.join("\n")}`
}

function slugifyFilename(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  anchor.click()
  URL.revokeObjectURL(url)
}

function buildTarifasExport(): DashboardExportFile {
  return {
    filename: "historial-de-tarifas.csv",
    content: rowsToCsv(
      [
        "Periodo",
        "Energia generada",
        "Energia adquirida",
        "Energia otras fuentes",
        "Energia total",
        "% adquirida",
        "% total",
        "Ahorro estimado",
      ],
      consumptionHistoryMock.map((row) => [
        row.period,
        row.energyGenerated,
        row.energyAcquired,
        row.energyFromOtherSources,
        row.totalEnergy,
        row.acquiredPercent,
        row.totalPercent,
        row.estimatedSavings,
      ])
    ),
  }
}

function buildGeneracionExport(variant: DashboardDownloadsVariant): DashboardExportFile {
  const rows =
    variant === "gdd"
      ? GDD_ENERGY_MONTHLY_CANONICAL.map((row) => [row.label, `${row.generated} MWh`])
      : GDCV_ENERGY_MONTHLY_CANONICAL.map((row) => [row.label, `${row.generated} MWh`])

  return {
    filename: "historial-de-generacion.csv",
    content: rowsToCsv(["Periodo", "Generacion"], rows),
  }
}

function buildMantenimientoExport(
  variant: DashboardDownloadsVariant
): DashboardExportFile {
  const rows =
    variant === "gdd"
      ? gddMantenimientoHistorialMock
      : gdcvMantenimientoHistorialMock

  return {
    filename: "historial-de-mantenimiento.csv",
    content: rowsToCsv(
      ["Periodo", "Cantidad mantenciones", "Costo asociado", "En curso"],
      rows.map((row) => [
        row.periodo,
        row.cantidadMantenciones,
        row.costoAsociado,
        row.enCurso ? "Si" : "No",
      ])
    ),
  }
}

function buildRecuperoExport(variant: DashboardDownloadsVariant): DashboardExportFile {
  const historico = variant === "gdd" ? gddRoiHistorico : gdcvRoiHistorico
  const proyectado = variant === "gdd" ? gddRoiProyectado : gdcvRoiProyectado

  const historicoRows = historico.map((row) => [
    "Historico",
    row.periodo,
    row.capRecuperado,
    row.capRecuperadoAcumulado,
    row.porcentajeRecuperacion,
  ])

  const proyectadoRows = proyectado.map((row) => [
    "Proyectado",
    row.periodo,
    row.ahorroEstimado,
    row.pendienteRecuperar,
    row.progresoEstimado,
    row.estado,
  ])

  return {
    filename: "recupero-de-inversion.csv",
    content: rowsToCsv(
      ["Tipo", "Periodo", "Valor 1", "Valor 2", "Valor 3", "Estado"],
      [
        ...historicoRows.map((row) => [...row, ""]),
        ...proyectadoRows,
      ]
    ),
  }
}

export function buildDashboardExportFile(
  option: DashboardDownloadOption,
  variant: DashboardDownloadsVariant
): DashboardExportFile {
  switch (option.id) {
    case "tarifas":
      return buildTarifasExport()
    case "generacion":
      return buildGeneracionExport(variant)
    case "mantenimiento":
      return buildMantenimientoExport(variant)
    case "recupero":
      return buildRecuperoExport(variant)
    default:
      return {
        filename: `${slugifyFilename(option.label)}.csv`,
        content: rowsToCsv(["Dataset"], [[option.label]]),
      }
  }
}

export function downloadDashboardExport(
  option: DashboardDownloadOption,
  variant: DashboardDownloadsVariant
): void {
  const file = buildDashboardExportFile(option, variant)
  const blob = new Blob([file.content], { type: "text/csv;charset=utf-8" })
  triggerBrowserDownload(blob, file.filename)
}

export async function downloadAllDashboardExports(
  options: readonly DashboardDownloadOption[],
  variant: DashboardDownloadsVariant
): Promise<void> {
  const zip = new JSZip()
  const dateStamp = new Date().toISOString().slice(0, 10)

  for (const option of options) {
    const file = buildDashboardExportFile(option, variant)
    zip.file(file.filename, file.content)
  }

  const blob = await zip.generateAsync({ type: "blob" })
  triggerBrowserDownload(blob, `hins-${variant}-export-${dateStamp}.zip`)
}
