// components/tipos-cambio/tipoCambioConfig.tsx — configuración de la entidad TipoCambio
import type { EntityConfig } from "@/components/admin/types"
import { SoftBadge } from "@/components/ui/soft-badge"
import {
  createTipoCambioAction,
  deleteTipoCambioAction,
  updateTipoCambioAction,
} from "@/app/main/tipos-cambio/actions"
import { labelOf, PERIODICIDADES, TIPOS_CAMBIO, UNIDAD_TIPO_CAMBIO } from "@/lib/admin-options"
import { validateTipoCambio } from "@/lib/admin-validation"
import type {
  CreateTipoCambioDto,
  Periodicidad,
  TipoCambio,
  TipoCambioTipo,
  UpdateTipoCambioDto,
} from "@/lib/api/types"

const IMPACT_WARNING = "Este cambio puede afectar cálculos existentes (facturación, ROI)."

export const tipoCambioConfig: EntityConfig<TipoCambio, CreateTipoCambioDto, UpdateTipoCambioDto> = {
  title: "Tipos de cambio",
  entityLabel: "Tipo de cambio",
  createLabel: "Nuevo Tipo de cambio",
  columns: [
    { header: "Tipo", cell: (t) => <SoftBadge>{labelOf(TIPOS_CAMBIO, t.tipo)}</SoftBadge> },
    { header: "Periodicidad", cell: (t) => labelOf(PERIODICIDADES, t.periodicidad) },
    { header: "Período", cell: (t) => t.periodo },
    { header: "Valor", cell: (t) => t.valor.toLocaleString("es-AR", { maximumFractionDigits: 6 }) },
    { header: "Unidad", cell: (t) => t.unidad },
  ],
  fields: [
    { name: "tipo", label: "Tipo", kind: "select", options: TIPOS_CAMBIO },
    { name: "periodicidad", label: "Periodicidad", kind: "select", options: PERIODICIDADES },
    {
      name: "periodo",
      label: "Período",
      kind: "text",
      placeholder: "AAAA-MM-DD, AAAA-MM o AAAA según la periodicidad",
    },
    { name: "valor", label: "Valor (ARS por USD)", kind: "number", placeholder: "0" },
  ],
  emptyForm: { tipo: "", periodicidad: "", periodo: "", valor: "" },
  validate: validateTipoCambio,
  toForm: (t) => ({ tipo: t.tipo, periodicidad: t.periodicidad, periodo: t.periodo, valor: String(t.valor) }),
  toCreateDto: (f) => ({
    tipo: f.tipo as TipoCambioTipo,
    periodicidad: f.periodicidad as Periodicidad,
    periodo: f.periodo.trim(),
    valor: Number(f.valor),
    unidad: UNIDAD_TIPO_CAMBIO,
  }),
  toUpdateDto: (f) => ({
    tipo: f.tipo as TipoCambioTipo,
    periodicidad: f.periodicidad as Periodicidad,
    periodo: f.periodo.trim(),
    valor: Number(f.valor),
  }),
  describe: (t) => `el tipo de cambio ${labelOf(TIPOS_CAMBIO, t.tipo).toLowerCase()} del período ${t.periodo}`,
  deleteWarning: IMPACT_WARNING,
  editWarning: IMPACT_WARNING,
  actions: {
    create: createTipoCambioAction,
    update: updateTipoCambioAction,
    remove: deleteTipoCambioAction,
  },
}
