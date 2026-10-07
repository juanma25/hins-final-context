// components/mantenimiento/MantenimientoDetailSheet.tsx
"use client"

import { SheetContentDetail } from "@/components/ui/sheet-ops"
import type { RegistroMantenimiento } from "@/lib/api/types"
import { formatMantenimientoSheetTitle } from "@/lib/mantenimiento-format"
import { formatPeriodoLabel } from "@/lib/format-periodo"
import { formatNullable } from "@/lib/utils"

interface MantenimientoDetailSheetProps {
  row: RegistroMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MantenimientoDetailSheet({
  row,
  open,
  onOpenChange,
}: MantenimientoDetailSheetProps) {
  if (!row) return null

  return (
    <SheetContentDetail
      open={open}
      onOpenChange={onOpenChange}
      title={formatMantenimientoSheetTitle(formatPeriodoLabel(row.periodo))}
      showFooter={false}
    >
      <p className="text-sm text-muted-foreground">
        {formatNullable(row.detalle)}
      </p>
    </SheetContentDetail>
  )
}
