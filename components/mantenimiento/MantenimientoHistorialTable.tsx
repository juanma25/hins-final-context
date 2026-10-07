// components/mantenimiento/MantenimientoHistorialTable.tsx
"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  PlusCircleIcon,
} from "lucide-react"

import { MantenimientoDetailSheet } from "@/components/mantenimiento/MantenimientoDetailSheet"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RegistroMantenimiento } from "@/lib/api/types"
import { formatPeriodoLabel } from "@/lib/format-periodo"
import { formatCurrency } from "@/lib/format-currency"
import { stickyStartCellClassName } from "@/lib/table-utils"
import { cn } from "@/lib/utils"

function formatCantidad(n: number): string {
  return n === 1 ? "1 tarea" : `${n} tareas`
}

function sortableHeader(
  column: Column<RegistroMantenimiento, unknown>,
  label: string
) {
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      className="flex cursor-pointer select-none items-center text-left"
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
        <ArrowUp
          className="ml-2 size-4 shrink-0 text-muted-foreground"
          aria-label="Ascendente"
        />
      ) : sorted === "desc" ? (
        <ArrowDown
          className="ml-2 size-4 shrink-0 text-muted-foreground"
          aria-label="Descendente"
        />
      ) : (
        <ArrowUpDown
          className="ml-2 size-4 shrink-0 text-muted-foreground"
          aria-label="No ordenado"
        />
      )}
    </button>
  )
}

const columns: ColumnDef<RegistroMantenimiento>[] = [
  {
    accessorKey: "periodo",
    enableHiding: false,
    enableSorting: true,
    meta: { label: "Período", sticky: "start" },
    header: ({ column }) => sortableHeader(column, "Período"),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-muted-foreground">
        {formatPeriodoLabel(row.original.periodo)}
      </span>
    ),
  },
  {
    accessorKey: "cantidadMantenciones",
    enableSorting: true,
    meta: { label: "Cantidad de Mantenciones" },
    header: ({ column }) =>
      sortableHeader(column, "Cantidad de Mantenciones"),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {formatCantidad(row.original.cantidadMantenciones)}
      </span>
    ),
  },
  {
    accessorKey: "costosAsociados",
    enableSorting: true,
    meta: { label: "Costos Asociados" },
    header: ({ column }) => sortableHeader(column, "Costos Asociados"),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {formatCurrency(row.original.costosAsociados, "ars", "full")}
      </span>
    ),
  },
]

interface MantenimientoHistorialTableProps {
  data: RegistroMantenimiento[]
}

export function MantenimientoHistorialTable({
  data,
}: MantenimientoHistorialTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedRow, setSelectedRow] = useState<RegistroMantenimiento | null>(
    null
  )
  const [sheetOpen, setSheetOpen] = useState(false)

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  function handleRowClick(row: RegistroMantenimiento) {
    setSelectedRow(row)
    setSheetOpen(true)
  }

  function handleNuevoClick() {
    // Placeholder — flujo "Nueva mantención" pendiente
  }

  return (
    <>
      <div className="rounded-xl bg-white shadow-xs">
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-semibold text-foreground">
            Historial de Mantenimiento
          </h3>
          <Button
            type="button"
            variant="default"
            size="default"
            className="gap-1.5 shadow-xs"
            aria-label="Nueva mantención"
            onClick={handleNuevoClick}
          >
            <PlusCircleIcon className="size-4" aria-hidden />
            Nuevo
          </Button>
        </div>

        <div className="space-y-6 p-6 pt-4">
          <Table aria-label="Historial de mantenimiento del parque">
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group h-14 cursor-pointer"
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={stickyStartCellClassName(
                          cell.column.columnDef.meta
                        )}
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
                    Sin registros de mantenimiento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <MantenimientoDetailSheet
        row={selectedRow}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
