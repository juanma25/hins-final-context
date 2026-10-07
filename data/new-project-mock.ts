// data/new-project-mock.ts — enum de UI para el diálogo de nuevo proyecto, alineado a ModeloNegocio del contrato

import type { ModeloNegocio } from "@/lib/api/types"

export interface NewProjectFormData {
  nombre: string
  modelo?: ModeloNegocio
  ubicacion: string
  medidor?: string // GDD only — no forma parte de CreateProyectoDto, uso futuro (creación de Socio)
  socios?: string // GDCV only — no forma parte de CreateProyectoDto, uso futuro (creación de Socio)
}

export const PROJECT_TYPES: { value: ModeloNegocio; label: string }[] = [
  { value: "GDCV", label: "Comunitario" },
  { value: "GDD", label: "Dueño" },
  { value: "GDC", label: "Consumo" },
]
