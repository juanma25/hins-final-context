// components/gdcv/SocioHistoricoDialog.tsx — Histórico de Registros/Facturación/Mediciones de un socio
"use client"

import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DIALOG_BODY_SCROLL, DIALOG_HEADER_FLUSH } from "@/lib/dialog-layout"
import { cn } from "@/lib/utils"

const NO_DATA_PLACEHOLDER = "—"

/**
 * La API devuelve cada registro histórico como objeto plano (sin wrapper
 * `payload`), con campos en camelCase — algunos vienen como `string`, otros
 * como `number`, y ausentes se representan como `null`. Se normalizan todos
 * a `string` para mostrar, y `null`/`undefined`/faltante quedan `undefined`.
 */
function readStringField(item: unknown, field: string): string | undefined {
  if (typeof item !== "object" || item === null) return undefined
  const value = (item as Record<string, unknown>)[field]
  if (value === null || value === undefined) return undefined
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return undefined
}

export interface FacturacionRow {
  [key: string]: string | undefined
  ultimaLecturaFechaHora?: string
  ultimaLecturaActivaExportadaT1?: string
  ultimaLecturaActivaExportadaT2?: string
  ultimaLecturaActivaExportadaT3?: string
  ultimaLecturaActivaExportadaT0?: string
  ultimaLecturaActivaImportadaT0?: string
}

export interface RegistroRow {
  [key: string]: string | undefined
  energiaActivaImportada?: string
  tarifa?: string
  demandaActivaExportada?: string
  fechaHora?: string
}

export interface MedicionRow {
  [key: string]: string | undefined
  ultimoRegistroFechaHora?: string
  ultimaLecturaFechaHora?: string
}

export function mapFacturacionRow(item: unknown): FacturacionRow {
  return {
    ultimaLecturaFechaHora: readStringField(item, "ultimaLecturaFechaHora"),
    ultimaLecturaActivaExportadaT1: readStringField(item, "ultimaLecturaActivaExportadaT1"),
    ultimaLecturaActivaExportadaT2: readStringField(item, "ultimaLecturaActivaExportadaT2"),
    ultimaLecturaActivaExportadaT3: readStringField(item, "ultimaLecturaActivaExportadaT3"),
    ultimaLecturaActivaExportadaT0: readStringField(item, "ultimaLecturaActivaExportadaT0"),
    ultimaLecturaActivaImportadaT0: readStringField(item, "ultimaLecturaActivaImportadaT0"),
  }
}

export function mapRegistroRow(item: unknown): RegistroRow {
  return {
    energiaActivaImportada: readStringField(item, "energiaActivaImportada"),
    tarifa: readStringField(item, "tarifa"),
    demandaActivaExportada: readStringField(item, "demandaActivaExportada"),
    fechaHora: readStringField(item, "fechaHora"),
  }
}

export function mapMedicionRow(item: unknown): MedicionRow {
  return {
    ultimoRegistroFechaHora: readStringField(item, "ultimoRegistroFechaHora"),
    ultimaLecturaFechaHora: readStringField(item, "ultimaLecturaFechaHora"),
  }
}

export function isValidHistoricoRange(desde: Date | undefined, hasta: Date | undefined): boolean {
  if (!desde || !hasta) return false
  return hasta.getTime() >= desde.getTime()
}

type HistoricoQueryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: unknown[] }
  | { status: "error"; message: string }

type HistoricoRow = Record<string, string | undefined>

interface ColumnConfig {
  label: string
  value: (row: HistoricoRow) => string | undefined
}

interface HistoricoSectionConfig {
  key: "registros" | "facturacion" | "mediciones"
  label: string
  path: string
  mapRow: (item: unknown) => HistoricoRow
  columns: ColumnConfig[]
}

const REGISTRO_SECTION: HistoricoSectionConfig = {
  key: "registros",
  label: "Registros",
  path: "registros",
  mapRow: mapRegistroRow,
  columns: [
    { label: "Energía activa importada", value: (r) => r.energiaActivaImportada },
    { label: "Tarifa", value: (r) => r.tarifa },
    { label: "Demanda activa exportada", value: (r) => r.demandaActivaExportada },
    { label: "Fecha y hora", value: (r) => r.fechaHora },
  ],
}

const FACTURACION_SECTION: HistoricoSectionConfig = {
  key: "facturacion",
  label: "Facturación",
  path: "facturacion",
  mapRow: mapFacturacionRow,
  columns: [
    { label: "Última lectura (fecha y hora)", value: (r) => r.ultimaLecturaFechaHora },
    { label: "Activa exportada T1", value: (r) => r.ultimaLecturaActivaExportadaT1 },
    { label: "Activa exportada T2", value: (r) => r.ultimaLecturaActivaExportadaT2 },
    { label: "Activa exportada T3", value: (r) => r.ultimaLecturaActivaExportadaT3 },
    { label: "Activa exportada T0", value: (r) => r.ultimaLecturaActivaExportadaT0 },
    { label: "Activa importada T0", value: (r) => r.ultimaLecturaActivaImportadaT0 },
  ],
}

const MEDICION_SECTION: HistoricoSectionConfig = {
  key: "mediciones",
  label: "Mediciones",
  path: "mediciones",
  mapRow: mapMedicionRow,
  columns: [
    { label: "Último registro (fecha y hora)", value: (r) => r.ultimoRegistroFechaHora },
    { label: "Última lectura (fecha y hora)", value: (r) => r.ultimaLecturaFechaHora },
  ],
}

const SECTIONS: HistoricoSectionConfig[] = [REGISTRO_SECTION, FACTURACION_SECTION, MEDICION_SECTION]

const IDLE_STATE: HistoricoQueryState = { status: "idle" }

interface SocioHistoricoDialogProps {
  parqueId: string
  socioId: string
  socioNombre: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export async function fetchHistorico(
  parqueId: string,
  socioId: string,
  path: string,
  desde: Date,
  hasta: Date
): Promise<unknown[]> {
  const desdeIso = desde.toISOString()
  const hastaIso = hasta.toISOString()
  const response = await fetch(
    `/api/parques/${parqueId}/socios/${socioId}/${path}?desde=${desdeIso}&hasta=${hastaIso}`
  )
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `Error ${response.status} al consultar ${path}`)
  }
  return (await response.json()) as unknown[]
}

export function SocioHistoricoDialog({
  parqueId,
  socioId,
  socioNombre,
  open,
  onOpenChange,
}: SocioHistoricoDialogProps) {
  const [desde, setDesde] = useState<Date | undefined>(undefined)
  const [hasta, setHasta] = useState<Date | undefined>(undefined)
  const [states, setStates] = useState<Record<HistoricoSectionConfig["key"], HistoricoQueryState>>({
    registros: IDLE_STATE,
    facturacion: IDLE_STATE,
    mediciones: IDLE_STATE,
  })

  const runQuery = (section: HistoricoSectionConfig, rangeDesde: Date, rangeHasta: Date) => {
    setStates((prev) => ({ ...prev, [section.key]: { status: "loading" } }))
    fetchHistorico(parqueId, socioId, section.path, rangeDesde, rangeHasta)
      .then((data) => {
        setStates((prev) => ({ ...prev, [section.key]: { status: "success", data } }))
      })
      .catch((error: unknown) => {
        setStates((prev) => ({
          ...prev,
          [section.key]: {
            status: "error",
            message: error instanceof Error ? error.message : "Error al consultar",
          },
        }))
      })
  }

  const runAllQueries = (rangeDesde: Date, rangeHasta: Date) => {
    for (const section of SECTIONS) {
      runQuery(section, rangeDesde, rangeHasta)
    }
  }

  const handleRangeChange = (nextDesde: Date | undefined, nextHasta: Date | undefined) => {
    setDesde(nextDesde)
    setHasta(nextHasta)
    if (isValidHistoricoRange(nextDesde, nextHasta)) {
      runAllQueries(nextDesde as Date, nextHasta as Date)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setDesde(undefined)
      setHasta(undefined)
      setStates({ registros: IDLE_STATE, facturacion: IDLE_STATE, mediciones: IDLE_STATE })
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,48rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className={DIALOG_HEADER_FLUSH}>
          <DialogTitle>Histórico de {socioNombre}</DialogTitle>
        </DialogHeader>

        <div className={cn(DIALOG_BODY_SCROLL, "flex flex-col gap-6")}>
          <div className="flex items-center gap-3">
            <DatePicker value={desde} placeholder="Desde" onValueChange={(d) => handleRangeChange(d, hasta)} />
            <span className="text-sm text-muted-foreground">a</span>
            <DatePicker value={hasta} placeholder="Hasta" onValueChange={(d) => handleRangeChange(desde, d)} />
          </div>

          {!isValidHistoricoRange(desde, hasta) && desde && hasta ? (
            <Alert variant="destructive">
              <AlertDescription>La fecha &quot;hasta&quot; no puede ser anterior a &quot;desde&quot;.</AlertDescription>
            </Alert>
          ) : null}

          {SECTIONS.map((section) => (
            <div key={section.key} className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-foreground">{section.label}</h4>
              <HistoricoSectionResult
                section={section}
                state={states[section.key]}
                onRetry={() => {
                  if (isValidHistoricoRange(desde, hasta)) {
                    runQuery(section, desde as Date, hasta as Date)
                  }
                }}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function HistoricoSectionResult({
  section,
  state,
  onRetry,
}: {
  section: HistoricoSectionConfig
  state: HistoricoQueryState
  onRetry: () => void
}) {
  if (state.status === "idle") {
    return <p className="text-sm text-muted-foreground">Selecciona un rango de fechas para consultar.</p>
  }
  if (state.status === "loading") {
    return <Skeleton className="h-16 w-full" />
  }
  if (state.status === "error") {
    return (
      <Alert variant="destructive" className="flex items-center justify-between gap-4">
        <AlertDescription>{state.message}</AlertDescription>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      </Alert>
    )
  }

  const rows = state.data.map((item) => section.mapRow(item))

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos en el rango seleccionado.</p>
  }

  return (
    <div className="max-h-64 overflow-y-auto overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {section.columns.map((column) => (
              <TableHead key={column.label}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {section.columns.map((column) => (
                <TableCell key={column.label}>
                  {column.value(row) ?? NO_DATA_PLACEHOLDER}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
