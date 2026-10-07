// components/costos/costoConfig.tsx — configuración de la entidad Costo (depende del proyecto/parques)
import type { EntityConfig } from "@/components/admin/types"
import { SoftBadge } from "@/components/ui/soft-badge"
import { createCostoAction, deleteCostoAction, updateCostoAction } from "@/app/actions/costos"
import { labelOf, MONEDAS, TIPOS_COSTO, UNIDADES_SUGERIDAS, type SelectOption } from "@/lib/admin-options"
import { validateCosto } from "@/lib/admin-validation"
import type { Costo, CreateCostoDto, TipoCosto, UpdateCostoDto } from "@/lib/api/types"

export type ParqueOption = SelectOption

/**
 * La config depende del proyecto (id) y de sus parques (selector y columna
 * "Parque"); `defaultParqueId` es el parque que se está viendo.
 */
export function buildCostoConfig(
  proyectoId: string,
  parques: readonly ParqueOption[],
  defaultParqueId: string
): EntityConfig<Costo, CreateCostoDto, UpdateCostoDto> {
  return {
    title: "Costos",
    entityLabel: "Costo",
    createLabel: "Nuevo Costo",
    columns: [
      { header: "Parque", cell: (c) => labelOf(parques, c.parqueId) },
      { header: "Concepto", cell: (c) => c.concepto },
      { header: "Tipo", cell: (c) => <SoftBadge>{labelOf(TIPOS_COSTO, c.tipoCosto)}</SoftBadge> },
      { header: "Valor", cell: (c) => c.valor.toLocaleString("es-AR", { maximumFractionDigits: 6 }) },
      { header: "Moneda", cell: (c) => c.moneda },
      { header: "Unidad", cell: (c) => c.unidad },
    ],
    fields: [
      { name: "parqueId", label: "Parque", kind: "select", options: parques },
      { name: "concepto", label: "Concepto", kind: "text", placeholder: "Ej: Seguro" },
      { name: "tipoCosto", label: "Tipo de costo", kind: "select", options: TIPOS_COSTO },
      { name: "valor", label: "Valor", kind: "number", placeholder: "0" },
      { name: "moneda", label: "Moneda", kind: "select", options: MONEDAS },
      { name: "unidad", label: "Unidad", kind: "text", placeholder: "Ej: anual", suggestions: UNIDADES_SUGERIDAS },
    ],
    emptyForm: { parqueId: defaultParqueId, concepto: "", tipoCosto: "", valor: "", moneda: "", unidad: "" },
    validate: validateCosto,
    toForm: (c) => ({
      parqueId: c.parqueId,
      concepto: c.concepto,
      tipoCosto: c.tipoCosto,
      valor: String(c.valor),
      moneda: c.moneda,
      unidad: c.unidad,
    }),
    toCreateDto: (f) => ({
      proyectoId,
      parqueId: f.parqueId,
      concepto: f.concepto.trim(),
      tipoCosto: f.tipoCosto as TipoCosto,
      valor: Number(f.valor),
      moneda: f.moneda,
      unidad: f.unidad.trim(),
    }),
    toUpdateDto: (f) => ({
      parqueId: f.parqueId,
      concepto: f.concepto.trim(),
      tipoCosto: f.tipoCosto as TipoCosto,
      valor: Number(f.valor),
      moneda: f.moneda,
      unidad: f.unidad.trim(),
    }),
    describe: (c) => `el costo “${c.concepto}”`,
    actions: { create: createCostoAction, update: updateCostoAction, remove: deleteCostoAction },
  }
}
