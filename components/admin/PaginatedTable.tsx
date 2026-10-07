// components/admin/PaginatedTable.tsx — tabla con paginación de servidor y acciones por fila
"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"

import { PaginationControls } from "@/components/admin/PaginationControls"
import type { ColumnDef } from "@/components/admin/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface PaginatedTableProps<T extends { id: string }> {
  ariaLabel: string
  columns: ColumnDef<T>[]
  items: T[]
  page: number
  total: number
  limit: number
  emptyMessage: string
  canMutate?: (row: T) => boolean
  onEdit: (row: T) => void
  onDelete: (row: T) => void
}

export function PaginatedTable<T extends { id: string }>({
  ariaLabel,
  columns,
  items,
  page,
  total,
  limit,
  emptyMessage,
  canMutate,
  onEdit,
  onDelete,
}: PaginatedTableProps<T>) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="space-y-6">
      <Table aria-label={ariaLabel}>
        <TableHeader>
          <TableRow className="h-14 hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.header} className={cn("text-sm font-medium text-muted-foreground", c.className)}>
                {c.header}
              </TableHead>
            ))}
            <TableHead className="w-24 text-right text-sm font-medium text-muted-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            items.map((row) => {
              const mutable = canMutate ? canMutate(row) : true
              return (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell key={c.header} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    {mutable ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shadow-xs"
                          aria-label="Editar"
                          title="Editar"
                          onClick={() => onEdit(row)}
                        >
                          <PencilIcon className="size-4" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 shadow-xs"
                          aria-label="Eliminar"
                          title="Eliminar"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2Icon className="size-4" aria-hidden />
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {from} a {to} de {total} registros
        </p>
        <PaginationControls page={page} total={total} limit={limit} />
      </div>
    </div>
  )
}
