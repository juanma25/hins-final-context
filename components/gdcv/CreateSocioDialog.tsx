// components/gdcv/CreateSocioDialog.tsx — Dialog for creating a new Socio

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { createSocioAction } from "@/app/gdcv/socios/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TIPO_CARGO_LABELS } from "@/lib/socio-presentation"
import type { CreateSocioDto, TipoCargo } from "@/lib/api/types"

interface CreateSocioDialogProps {
  parqueId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SocioFormData {
  nombre: string
  participacionPorcentaje: string
  tipoCargo: TipoCargo | undefined
  medidorNumero: string
  suministroNumero: string
  contratoNumero: string
}

const EMPTY_FORM: SocioFormData = {
  nombre: "",
  participacionPorcentaje: "",
  tipoCargo: undefined,
  medidorNumero: "",
  suministroNumero: "",
  contratoNumero: "",
}

const TIPO_CARGO_OPTIONS: TipoCargo[] = ["CON_POTENCIA", "SIN_POTENCIA"]

/**
 * No. de Medidor es opcional; si se completa, dispara la obligatoriedad de
 * No. de Suministro y No. de Contrato (ver specs/008-socio-dimms-fields).
 */
export function getSocioFormValidationError(formData: SocioFormData): string | null {
  if (!formData.nombre.trim()) {
    return "Por favor ingresa el nombre del socio"
  }
  const participacionValue = Number(formData.participacionPorcentaje)
  const isParticipacionValid =
    formData.participacionPorcentaje.trim() !== "" &&
    Number.isFinite(participacionValue) &&
    participacionValue > 0 &&
    participacionValue <= 100
  if (!isParticipacionValid) {
    return "Por favor ingresa un porcentaje de participación válido (0–100)"
  }
  if (!formData.tipoCargo) {
    return "Por favor selecciona el tipo de cargo"
  }
  if (formData.medidorNumero.trim() !== "") {
    if (!formData.suministroNumero.trim()) {
      return "Por favor ingresa el número de suministro"
    }
    if (!formData.contratoNumero.trim()) {
      return "Por favor ingresa el número de contrato"
    }
  }
  return null
}

export function CreateSocioDialog({ parqueId, open, onOpenChange }: CreateSocioDialogProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<SocioFormData>(EMPTY_FORM)
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

  const participacionValue = Number(formData.participacionPorcentaje)
  const validationError = getSocioFormValidationError(formData)
  const isFormValid = validationError === null

  const handleCreate = () => {
    const formError = getSocioFormValidationError(formData)
    if (formError) {
      setError(formError)
      return
    }

    setError(null)
    startTransition(async () => {
      const dto: Omit<CreateSocioDto, "parqueId"> = {
        nombre: formData.nombre.trim(),
        participacionPorcentaje: participacionValue,
        tipoCargo: formData.tipoCargo as TipoCargo,
        medidorNumero: formData.medidorNumero.trim(),
        suministroNumero: formData.suministroNumero.trim(),
        contratoNumero: formData.contratoNumero.trim(),
      }
      const result = await createSocioAction(parqueId, dto)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      handleOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Socio</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Nombre
            </label>
            <Input
              placeholder="Ej: Alfredo Isaac SA"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          {/* Participación */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Participación (%)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Ej: 15"
              value={formData.participacionPorcentaje}
              onChange={(e) =>
                setFormData({ ...formData, participacionPorcentaje: e.target.value })
              }
            />
          </div>

          {/* Tipo de Cargo */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Tipo de Cargo
            </label>
            <ToggleGroup
              type="single"
              value={formData.tipoCargo}
              onValueChange={(value) => {
                if (value) {
                  setFormData({ ...formData, tipoCargo: value as TipoCargo })
                }
              }}
              variant="outline"
              className="w-full [&_[data-state=on]]:bg-primary [&_[data-state=on]]:text-primary-foreground"
            >
              {TIPO_CARGO_OPTIONS.map((tipo) => (
                <ToggleGroupItem key={tipo} value={tipo} className="flex-1">
                  {TIPO_CARGO_LABELS[tipo]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* N° de Medidor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              N° de Medidor
            </label>
            <Input
              placeholder="Ingresar..."
              value={formData.medidorNumero}
              onChange={(e) => setFormData({ ...formData, medidorNumero: e.target.value })}
            />
          </div>

          {/* N° de Suministro */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              N° de Suministro
            </label>
            <Input
              placeholder="Ingresar..."
              value={formData.suministroNumero}
              onChange={(e) => setFormData({ ...formData, suministroNumero: e.target.value })}
            />
          </div>

          {/* N° de Contrato */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              N° de Contrato
            </label>
            <Input
              placeholder="Ingresar..."
              value={formData.contratoNumero}
              onChange={(e) => setFormData({ ...formData, contratoNumero: e.target.value })}
            />
          </div>

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
