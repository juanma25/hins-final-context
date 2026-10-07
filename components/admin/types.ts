// components/admin/types.ts — contrato de configuración de una entidad CRUD
import type { ReactNode } from "react"

import type { SelectOption } from "@/lib/admin-options"
import type { FormMode, FormValues } from "@/lib/admin-validation"
import type { ActionResult } from "@/lib/crud-action"

export interface ColumnDef<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export interface FieldDef {
  name: string
  label: string
  kind: "text" | "number" | "date" | "select"
  placeholder?: string
  options?: readonly SelectOption[]
  /** Sugerencias (datalist) para campos de texto libre. */
  suggestions?: readonly string[]
  /** Deshabilita el campo según modo y fila (ej. nombre inmutable al editar). */
  disabled?: (mode: FormMode, row?: unknown) => boolean
}

export interface EntityConfig<T extends { id: string }, C, U> {
  /** Título de la sección, ej. "Tarifas". */
  title: string
  /** Singular para diálogos, ej. "tarifa". */
  entityLabel: string
  createLabel: string
  columns: ColumnDef<T>[]
  fields: FieldDef[]
  emptyForm: FormValues
  validate: (form: FormValues, mode: FormMode) => string | null
  toForm: (row: T) => FormValues
  toCreateDto: (form: FormValues) => C
  toUpdateDto: (form: FormValues, row: T) => U
  /** Descripción del registro para la confirmación de borrado. */
  describe: (row: T) => string
  /** Si es false, la fila no muestra editar/borrar (ej. tarifa histórica). */
  canMutate?: (row: T) => boolean
  deleteWarning?: string
  editWarning?: string
  actions: {
    create: (dto: C) => Promise<ActionResult<T>>
    update: (id: string, dto: U) => Promise<ActionResult<T>>
    remove: (id: string) => Promise<ActionResult<T>>
  }
}
