// components/admin/EntityCrudView.tsx — lista paginada + crear/editar/borrar para cualquier entidad
"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, PlusIcon } from "lucide-react"

import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog"
import { PaginatedTable } from "@/components/admin/PaginatedTable"
import { ResourceFormDialog } from "@/components/admin/ResourceFormDialog"
import type { EntityConfig } from "@/components/admin/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"

interface EntityCrudViewProps<T extends { id: string }, C, U> {
  config: EntityConfig<T, C, U>
  items: T[]
  page: number
  total: number
  limit: number
  /** Filtros u otros controles bajo el encabezado. */
  toolbar?: ReactNode
  /** Si la carga falló, muestra el error con "Reintentar". */
  loadError?: string | null
}

type Dialogo = { kind: "create" } | { kind: "edit"; row: unknown } | { kind: "delete"; row: unknown } | null

export function EntityCrudView<T extends { id: string }, C, U>({
  config,
  items,
  page,
  total,
  limit,
  toolbar,
  loadError,
}: EntityCrudViewProps<T, C, U>) {
  const router = useRouter()
  const [dialog, setDialog] = useState<Dialogo>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const close = () => setDialog(null)
  const editRow = dialog?.kind === "edit" ? (dialog.row as T) : undefined
  const deleteRow = dialog?.kind === "delete" ? (dialog.row as T) : undefined

  const afterSuccess = (message: string) => {
    setNotice(message)
    router.refresh()
  }

  const handleSubmit = async (form: Record<string, string>): Promise<string | null> => {
    const result = editRow
      ? await config.actions.update(editRow.id, config.toUpdateDto(form, editRow))
      : await config.actions.create(config.toCreateDto(form))
    if (result.error) return result.error
    afterSuccess(editRow ? `${config.entityLabel} actualizado correctamente.` : `${config.entityLabel} creado correctamente.`)
    return null
  }

  const handleDelete = () => {
    if (!deleteRow) return
    setDeleteError(null)
    startDelete(async () => {
      const result = await config.actions.remove(deleteRow.id)
      if (result.error) {
        setDeleteError(result.error)
        return
      }
      close()
      afterSuccess(`${config.entityLabel} eliminado correctamente.`)
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-xs">
      <div className="flex items-center justify-between p-6 pb-0">
        <Heading level="h3">{config.title}</Heading>
        <Button
          type="button"
          size="icon"
          className="md:w-auto md:px-2.5 md:gap-2 shadow-xs"
          title={config.createLabel}
          onClick={() => {
            setNotice(null)
            setDialog({ kind: "create" })
          }}
        >
          <PlusIcon className="size-4" aria-hidden />
          <span className="hidden md:inline">{config.createLabel}</span>
        </Button>
      </div>

      {toolbar}

      {notice ? (
        <div className="px-6 pt-4" role="status">
          <Alert variant="success">
            <CheckCircle2Icon aria-hidden />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="p-6 pt-4">
        {loadError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">No se pudo cargar: {loadError}</p>
            <Button type="button" variant="outline" onClick={() => router.refresh()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <PaginatedTable
            ariaLabel={config.title}
            columns={config.columns}
            items={items}
            page={page}
            total={total}
            limit={limit}
            emptyMessage={`Aún no hay ${config.title.toLowerCase()}. Usa “${config.createLabel}” para agregar la primera.`}
            canMutate={config.canMutate}
            onEdit={(row) => {
              setNotice(null)
              setDialog({ kind: "edit", row })
            }}
            onDelete={(row) => {
              setNotice(null)
              setDeleteError(null)
              setDialog({ kind: "delete", row })
            }}
          />
        )}
      </div>

      <ResourceFormDialog
        open={dialog?.kind === "create" || dialog?.kind === "edit"}
        onOpenChange={(open) => !open && close()}
        mode={editRow ? "edit" : "create"}
        title={editRow ? `Editar ${config.entityLabel}` : config.createLabel}
        fields={config.fields}
        initialValues={editRow ? config.toForm(editRow) : config.emptyForm}
        row={editRow}
        validate={config.validate}
        onSubmit={handleSubmit}
        editWarning={config.editWarning}
      />

      <ConfirmDeleteDialog
        open={dialog?.kind === "delete"}
        onOpenChange={(open) => !open && close()}
        description={deleteRow ? config.describe(deleteRow) : ""}
        warning={config.deleteWarning}
        error={deleteError}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
