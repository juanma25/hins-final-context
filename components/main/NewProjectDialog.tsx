// components/main/NewProjectDialog.tsx — Dialog for creating new projects

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { createProyectoAction } from "@/app/main/actions"
import { Button } from "@/components/ui/button"
import { ModelBadge, type ParkModel } from "@/components/ui/model-badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputWithIconButton } from "@/components/ui/input-with-icon-button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PROJECT_TYPES, type NewProjectFormData } from "@/data/new-project-mock"
import type { ModeloNegocio } from "@/lib/api/types"
import { ParkingMeter } from "lucide-react"

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMPTY_FORM: NewProjectFormData = { nombre: "", modelo: undefined, ubicacion: "" }

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<NewProjectFormData>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleReset = () => {
    setFormData(EMPTY_FORM)
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset()
    }
    onOpenChange(isOpen)
  }

  const handleCreate = () => {
    if (!formData.nombre.trim()) {
      setError("Por favor ingresa el nombre del parque")
      return
    }
    if (!formData.ubicacion.trim()) {
      setError("Por favor ingresa la ubicación del parque")
      return
    }
    if (!formData.modelo) {
      setError("Por favor selecciona el tipo de parque")
      return
    }
    if (formData.modelo === "GDD" && !formData.medidor?.trim()) {
      setError("Por favor ingresa el número de medidor")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createProyectoAction({
        nombre: formData.nombre.trim(),
        modelo: formData.modelo as ModeloNegocio,
        ubicacion: formData.ubicacion.trim(),
      })
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      if (result.parqueError) {
        setError(`El proyecto se creó, pero el parque no pudo generarse: ${result.parqueError}`)
        return
      }
      handleOpenChange(false)
    })
  }

  const isFormValid =
    formData.nombre.trim() !== "" &&
    formData.ubicacion.trim() !== "" &&
    formData.modelo &&
    (formData.modelo !== "GDD" || formData.medidor?.trim())

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Proyecto</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Nombre
            </label>
            <Input
              placeholder="Ej: Parque San Francisco"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </div>

          {/* Ubicación */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Ubicación
            </label>
            <Input
              placeholder="Ej: Río Cuarto, Córdoba"
              value={formData.ubicacion}
              onChange={(e) =>
                setFormData({ ...formData, ubicacion: e.target.value })
              }
            />
          </div>

          {/* Tipo de Parque */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Tipo de Parque
            </label>
            <ToggleGroup
              type="single"
              value={formData.modelo}
              onValueChange={(value) => {
                if (value) {
                  setFormData({ ...formData, modelo: value as ModeloNegocio })
                }
              }}
              variant="outline"
              className="w-full [&_[data-state=on]]:bg-primary [&_[data-state=on]]:text-primary-foreground"
            >
              {PROJECT_TYPES.map((type) => (
                <ToggleGroupItem key={type.value} value={type.value} className="flex-1">
                  <ModelBadge model={type.value as ParkModel} />
                  <span className="ml-2">{type.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* N° de Medidor (condicional - GDD) */}
          {formData.modelo === "GDD" && (
            <InputWithIconButton
              label="N° de Medidor"
              icon={ParkingMeter}
              iconButtonLabel="Buscar medidor"
              iconTooltip="N° de medidor del parque"
              placeholder="Ingresar..."
              value={formData.medidor || ""}
              onChange={(e) =>
                setFormData({ ...formData, medidor: e.target.value })
              }
              onIconClick={() => {
                // Prototipo: acción de búsqueda/validación de medidor
              }}
            />
          )}

          {/* Cantidad de Socios (condicional - GDCV) */}
          {formData.modelo === "GDCV" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Cantidad de Socios
              </label>
              <Input
                placeholder="Ej: 15"
                value={formData.socios || ""}
                onChange={(e) =>
                  setFormData({ ...formData, socios: e.target.value })
                }
              />
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="default"
            onClick={handleCreate}
            disabled={!isFormValid || isPending}
          >
            {isPending ? "Creando..." : "Crear"}
          </Button>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
