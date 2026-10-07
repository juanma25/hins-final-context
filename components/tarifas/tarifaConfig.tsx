// components/tarifas/tarifaConfig.tsx — configuración de la entidad Tarifa para EntityCrudView
import type { EntityConfig } from "@/components/admin/types"
import { SoftBadge } from "@/components/ui/soft-badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { createTarifaAction, deleteTarifaAction, updateTarifaAction } from "@/app/main/tarifas/actions"
import { UNIDADES_SUGERIDAS } from "@/lib/admin-options"
import { validateTarifa } from "@/lib/admin-validation"
import type { CreateTarifaDto, Tarifa, TarifaEstado, UpdateTarifaDto } from "@/lib/api/types"

const ESTADO_LABEL: Record<TarifaEstado, string> = {
  HISTORICA: "Histórica",
  VIGENTE: "Vigente",
  FUTURA: "Futura",
}

const IMPACT_WARNING = "Este cambio puede afectar cálculos existentes (facturación, ROI)."

const formatValor = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 6 })

export const tarifaConfig: EntityConfig<Tarifa, CreateTarifaDto, UpdateTarifaDto> = {
  title: "Tarifas",
  entityLabel: "Tarifa",
  createLabel: "Nueva Tarifa",
  columns: [
    { header: "Nombre", cell: (t) => t.nombre },
    { header: "Valor energía", cell: (t) => formatValor(t.valorEnergia) },
    { header: "Valor inyección", cell: (t) => formatValor(t.valorInyeccion) },
    { header: "Unidad", cell: (t) => t.unidad },
    { header: "Vigente desde", cell: (t) => t.vigenteDesde },
    { header: "Vigente hasta", cell: (t) => t.vigenteHasta ?? "—" },
    {
      header: "Estado",
      cell: (t) =>
        t.estado === "VIGENTE" ? (
          <StatusBadge status="current">{ESTADO_LABEL[t.estado]}</StatusBadge>
        ) : (
          <SoftBadge>{ESTADO_LABEL[t.estado]}</SoftBadge>
        ),
    },
  ],
  fields: [
    {
      name: "nombre",
      label: "Nombre",
      kind: "text",
      placeholder: "Ej: Residencial",
      disabled: (mode) => mode === "edit",
    },
    { name: "valorEnergia", label: "Valor de energía", kind: "number", placeholder: "0" },
    { name: "valorInyeccion", label: "Valor de inyección", kind: "number", placeholder: "0" },
    { name: "unidad", label: "Unidad", kind: "text", placeholder: "Ej: ARS/kWh", suggestions: UNIDADES_SUGERIDAS },
    {
      name: "vigenteDesde",
      label: "Vigente desde",
      kind: "date",
      // El backend solo permite cambiar la fecha en versiones futuras.
      disabled: (mode, row) => mode === "edit" && (row as Tarifa | undefined)?.estado !== "FUTURA",
    },
  ],
  emptyForm: { nombre: "", valorEnergia: "", valorInyeccion: "", unidad: "", vigenteDesde: "" },
  validate: validateTarifa,
  toForm: (t) => ({
    nombre: t.nombre,
    valorEnergia: String(t.valorEnergia),
    valorInyeccion: String(t.valorInyeccion),
    unidad: t.unidad,
    vigenteDesde: t.vigenteDesde.slice(0, 10),
  }),
  toCreateDto: (f) => ({
    nombre: f.nombre.trim(),
    valorEnergia: Number(f.valorEnergia),
    valorInyeccion: Number(f.valorInyeccion),
    unidad: f.unidad.trim(),
    vigenteDesde: f.vigenteDesde,
  }),
  toUpdateDto: (f, row) => ({
    valorEnergia: Number(f.valorEnergia),
    valorInyeccion: Number(f.valorInyeccion),
    unidad: f.unidad.trim(),
    ...(row.estado === "FUTURA" ? { vigenteDesde: f.vigenteDesde } : {}),
  }),
  describe: (t) => `la tarifa “${t.nombre}” (vigente desde ${t.vigenteDesde.slice(0, 10)})`,
  canMutate: (t) => t.estado !== "HISTORICA",
  deleteWarning: IMPACT_WARNING,
  editWarning: IMPACT_WARNING,
  actions: { create: createTarifaAction, update: updateTarifaAction, remove: deleteTarifaAction },
}
