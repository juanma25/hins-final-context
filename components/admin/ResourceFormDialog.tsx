// components/admin/ResourceFormDialog.tsx — diálogo crear/editar dirigido por configuración
"use client"

import { useState, useTransition } from "react"

import { SelectField } from "@/components/admin/SelectField"
import { TextField } from "@/components/admin/FormField"
import type { FieldDef } from "@/components/admin/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { FormMode, FormValues } from "@/lib/admin-validation"

interface ResourceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: FormMode
  title: string
  fields: FieldDef[]
  initialValues: FormValues
  /** Fila editada (para `disabled` de campos). */
  row?: unknown
  validate: (form: FormValues, mode: FormMode) => string | null
  /** Devuelve un mensaje de error o null si se guardó. */
  onSubmit: (form: FormValues) => Promise<string | null>
  editWarning?: string
}

export function ResourceFormDialog(props: ResourceFormDialogProps) {
  // `key` en el padre reinicia el estado al abrir/cambiar de fila.
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {props.open ? <FormBody {...props} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function FormBody({
  onOpenChange,
  mode,
  title,
  fields,
  initialValues,
  row,
  validate,
  onSubmit,
  editWarning,
}: ResourceFormDialogProps) {
  const [form, setForm] = useState<FormValues>(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const setValue = (name: string, value: string) => setForm((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return
    const validationError = validate(form, mode)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    startTransition(async () => {
      const submitError = await onSubmit(form)
      if (submitError) {
        setError(submitError)
        return
      }
      onOpenChange(false)
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-6">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      {fields.map((field) => {
        const disabled = field.disabled?.(mode, row) ?? false
        if (field.kind === "select") {
          return (
            <SelectField
              key={field.name}
              label={field.label}
              options={field.options ?? []}
              value={form[field.name] ?? ""}
              disabled={disabled}
              onValueChange={(v) => setValue(field.name, v)}
            />
          )
        }
        return (
          <TextField
            key={field.name}
            label={field.label}
            type={field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text"}
            step={field.kind === "number" ? "any" : undefined}
            placeholder={field.placeholder}
            suggestions={field.suggestions}
            value={form[field.name] ?? ""}
            disabled={disabled}
            onChange={(e) => setValue(field.name, e.target.value)}
          />
        )
      })}

      {mode === "edit" && editWarning ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{editWarning}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
          Cancelar
        </Button>
      </DialogFooter>
    </form>
  )
}
