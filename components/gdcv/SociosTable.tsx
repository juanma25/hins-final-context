// components/gdcv/SociosTable.tsx
"use client"

import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateSocioDialog } from "@/components/gdcv/CreateSocioDialog"
import { SocioHistoricoDialog } from "@/components/gdcv/SocioHistoricoDialog"
import { Heading } from "@/components/ui/heading"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SheetContentDetail } from "@/components/ui/sheet-ops"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MedidorDetalle, SocioRow } from "@/data/gdcv-mock"
import { parseKwhDisplay, parsePercentDisplay } from "@/lib/format-energy"
import { stickyStartCellClassName } from "@/lib/table-utils"
import { cn } from "@/lib/utils"
import {
  GDCV_SOCIO_DEMO_ID,
  getSocioShareUrl,
} from "@/lib/gdcv-socio-auth"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  HistoryIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ShareIcon,
  TableIcon,
} from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function socioHasMultipleMedidores(row: SocioRow): boolean {
  return (row.medidores?.length ?? 0) > 1
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────
// parseKwhDisplay and parsePercentDisplay imported from @/lib/format-energy

function parseMoneyDisplay(value: string): number {
  const digits = value.replace(/[^\d]/g, "")
  return digits ? parseInt(digits, 10) : 0
}

// ─── Sortable header ──────────────────────────────────────────────────────────

function sortableHeader(
  column: Column<SocioRow, unknown>,
  label: string
) {
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      className="flex items-center cursor-pointer select-none text-left"
      onClick={() => {
        if (sorted === false) {
          column.toggleSorting(false)
        } else if (sorted === "asc") {
          column.toggleSorting(true)
        } else {
          column.clearSorting()
        }
      }}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 size-4 shrink-0 text-muted-foreground" aria-label="Ascendente" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 size-4 shrink-0 text-muted-foreground" aria-label="Descendente" />
      ) : (
        <ArrowUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" aria-label="No ordenado" />
      )}
    </button>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

function createColumns(onHistoricoClick: (socio: SocioRow) => void): ColumnDef<SocioRow>[] {
  return [
  {
    accessorKey: "nombre",
    enableHiding: false,
    enableSorting: false,
    meta: { label: "Socio", sticky: "start", stickyWidth: "wide" },
    header: "Socio",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar size="default" className="after:border-0">
          <AvatarFallback className="bg-green-100 text-green-700 text-xs font-medium">
            {getInitials(row.original.nombre)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">
          {row.original.nombre}
        </span>
        {row.original.tipo === "Virtual" && (
          <Badge
            variant="secondary"
            className="shrink-0 border-transparent bg-[#FFFBEB] text-[#92400E] text-xs font-medium hover:bg-[#FFFBEB]"
          >
            Virtual
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "medidor",
    enableSorting: true,
    meta: { label: "Medidor" },
    header: ({ column }) => sortableHeader(column, "Medidor"),
    cell: ({ row }) => {
      const medidores = row.original.medidores
      if (socioHasMultipleMedidores(row.original) && medidores) {
        return (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
            <span className="tabular-nums">{medidores.length}</span>
            <span>Medidores &gt;</span>
          </span>
        )
      }
      return (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.original.medidor}
        </span>
      )
    },
  },
  {
    accessorKey: "participacion",
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      parsePercentDisplay(rowA.original.participacion) -
      parsePercentDisplay(rowB.original.participacion),
    meta: { label: "Participación (%)" },
    header: ({ column }) => sortableHeader(column, "Participación (%)"),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.participacion}</span>
    ),
  },
  {
    accessorKey: "potenciaAsociada",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const parseKwp = (value: string): number => {
        const m = value.match(/[\d]+(?:[.,][\d]+)?/)
        return m ? parseFloat(m[0].replace(",", ".")) : 0
      }
      return parseKwp(rowA.original.potenciaAsociada) -
             parseKwp(rowB.original.potenciaAsociada)
    },
    meta: { label: "Potencia Asociada" },
    header: ({ column }) => sortableHeader(column, "Potencia Asociada"),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.potenciaAsociada}</span>
    ),
  },
  {
    accessorKey: "energiaGenerada",
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      parseKwhDisplay(rowA.original.energiaGenerada) -
      parseKwhDisplay(rowB.original.energiaGenerada),
    meta: { label: "Energía Generada" },
    header: ({ column }) => sortableHeader(column, "Energía Generada"),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.energiaGenerada}</span>
    ),
  },
  {
    accessorKey: "ahorroGenerado",
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      parseMoneyDisplay(rowA.original.ahorroGenerado) -
      parseMoneyDisplay(rowB.original.ahorroGenerado),
    meta: { label: "Ahorro Generado" },
    header: ({ column }) => sortableHeader(column, "Ahorro Generado"),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.ahorroGenerado}</span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shadow-xs"
          aria-label={`Ver histórico — ${row.original.nombre}`}
          title="Ver histórico"
          onClick={(e) => {
            e.stopPropagation()
            onHistoricoClick(row.original)
          }}
        >
          <HistoryIcon className="size-4" aria-hidden />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shadow-xs"
              aria-label={`Acciones — ${row.original.nombre}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontalIcon className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              Ver detalle
            </DropdownMenuItem>
            {row.original.id === GDCV_SOCIO_DEMO_ID ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  const url = getSocioShareUrl(window.location.origin)
                  void navigator.clipboard.writeText(url)
                }}
              >
                <ShareIcon className="size-4 mr-2" aria-hidden />
                Compartir
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SociosTableProps {
  /** Parque activo — el alta vía "Nuevo Socio" se registra contra este parque. */
  parqueId: string
  data: SocioRow[]
  /** `true` cuando la consulta de socios al backend falló — distinto de `data: []` (sin socios registrados). */
  loadFailed?: boolean
  onRetry?: () => void
  onRowClick: (socio: SocioRow) => void
  /** Medidor puntual dentro del sheet intermedio → SocioDetailSheet. */
  onMedidorClick?: (socio: SocioRow, medidor: MedidorDetalle) => void
  /** Control opcional del sheet intermedio (para volver desde SocioDetailSheet). */
  medidoresSheetSocio?: SocioRow | null
  onMedidoresSheetOpenChange?: (socio: SocioRow | null) => void
}

export function SociosTable({
  parqueId,
  data,
  loadFailed = false,
  onRetry,
  onRowClick,
  onMedidorClick,
  medidoresSheetSocio,
  onMedidoresSheetOpenChange,
}: SociosTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [internalMedidoresSheet, setInternalMedidoresSheet] =
    useState<SocioRow | null>(null)
  const [createSocioOpen, setCreateSocioOpen] = useState(false)
  const [historicoSocio, setHistoricoSocio] = useState<SocioRow | null>(null)

  const columns = useMemo(
    () => createColumns((socio) => setHistoricoSocio(socio)),
    []
  )

  const isMedidoresSheetControlled = onMedidoresSheetOpenChange !== undefined
  const medidoresSheet = isMedidoresSheetControlled
    ? (medidoresSheetSocio ?? null)
    : internalMedidoresSheet

  function updateMedidoresSheet(socio: SocioRow | null) {
    if (isMedidoresSheetControlled) {
      onMedidoresSheetOpenChange?.(socio)
    } else {
      setInternalMedidoresSheet(socio)
    }
  }

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const fromRow = pageIndex * pageSize + 1
  const toRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <>
    <div className="bg-white rounded-xl shadow-xs">

      {/* Section header */}
      <div className="flex items-center justify-between p-6 pb-0">
        <Heading level="h3">
          Socios del Parque
        </Heading>
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:w-auto md:px-2.5 md:gap-2 shadow-xs"
                title="Ver columnas"
              >
                <TableIcon className="size-4" aria-hidden />
                <span className="hidden md:inline">Ver columnas</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(val) => col.toggleVisibility(val)}
                  >
                    {(col.columnDef.meta as { label?: string })?.label ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New socio */}
          <Button
            type="button"
            size="icon"
            className="md:w-auto md:px-2.5 md:gap-2 shadow-xs"
            title="Nuevo Socio"
            onClick={() => setCreateSocioOpen(true)}
          >
            <PlusIcon className="size-4" aria-hidden />
            <span className="hidden md:inline">Nuevo Socio</span>
          </Button>
        </div>
      </div>

      {/* Table + pagination */}
      <div className="p-6 pt-4 space-y-6">
        <Table aria-label="Socios del parque">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="h-14 hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-sm font-medium text-muted-foreground",
                      stickyStartCellClassName(header.column.columnDef.meta)
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loadFailed ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      No se pudo cargar el listado de socios.
                    </p>
                    {onRetry ? (
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        Reintentar
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group h-14 cursor-pointer"
                  onClick={() => {
                    if (socioHasMultipleMedidores(row.original)) {
                      updateMedidoresSheet(row.original)
                      return
                    }
                    onRowClick(row.original)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={stickyStartCellClassName(cell.column.columnDef.meta)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Sin socios registrados para este parque.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {fromRow} a {toRow} de {totalRows} registros
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>

      {/* Sheet: detalle de medidores (solo socios con +1 medidor) */}
      <SheetContentDetail
        open={!!medidoresSheet}
        onOpenChange={(open) => { if (!open) updateMedidoresSheet(null) }}
        title={medidoresSheet ? `${medidoresSheet.nombre} > Medidores` : "Medidores"}
        scrollVariant="flush"
      >
        {medidoresSheet?.medidores && (
          <div className="p-6 pt-0">
            <Table aria-label={`Medidores de ${medidoresSheet.nombre}`}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-sm font-medium text-muted-foreground">Medidor</TableHead>
                  <TableHead className="text-sm font-medium text-muted-foreground">Potencia</TableHead>
                  <TableHead className="text-sm font-medium text-muted-foreground">Energía</TableHead>
                  <TableHead className="text-sm font-medium text-muted-foreground">Participación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medidoresSheet.medidores.map((m: MedidorDetalle) => (
                  <TableRow key={m.numero} className="h-12">
                    <TableCell>
                      <button
                        type="button"
                        className="text-sm font-medium tabular-nums text-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                        onClick={() => {
                          onMedidorClick?.(medidoresSheet, m)
                          updateMedidoresSheet(null)
                        }}
                      >
                        {m.numero}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{m.potenciaAsociada}</TableCell>
                    <TableCell className="text-sm tabular-nums">{m.energiaGenerada}</TableCell>
                    <TableCell className="text-sm tabular-nums">{m.participacion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="h-12 font-medium bg-muted/40">
                  <TableCell className="text-sm">Total</TableCell>
                  <TableCell className="text-sm tabular-nums">{medidoresSheet.potenciaAsociada}</TableCell>
                  <TableCell className="text-sm tabular-nums">{medidoresSheet.energiaGenerada}</TableCell>
                  <TableCell className="text-sm tabular-nums">{medidoresSheet.participacion}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </SheetContentDetail>

      <CreateSocioDialog
        parqueId={parqueId}
        open={createSocioOpen}
        onOpenChange={setCreateSocioOpen}
      />

      {historicoSocio ? (
        <SocioHistoricoDialog
          parqueId={parqueId}
          socioId={historicoSocio.id}
          socioNombre={historicoSocio.nombre}
          open={!!historicoSocio}
          onOpenChange={(open) => { if (!open) setHistoricoSocio(null) }}
        />
      ) : null}
    </>
  )
}
