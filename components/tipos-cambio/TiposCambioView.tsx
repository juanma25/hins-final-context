// components/tipos-cambio/TiposCambioView.tsx
"use client"

import { EntityCrudView } from "@/components/admin/EntityCrudView"
import { ListFilters, type FilterDef } from "@/components/admin/ListFilters"
import { tipoCambioConfig } from "@/components/tipos-cambio/tipoCambioConfig"
import { PERIODICIDADES, TIPOS_CAMBIO } from "@/lib/admin-options"
import type { TipoCambio } from "@/lib/api/types"

const FILTERS: FilterDef[] = [
  { param: "tipo", label: "Tipo", options: TIPOS_CAMBIO },
  { param: "periodicidad", label: "Periodicidad", options: PERIODICIDADES },
]

interface TiposCambioViewProps {
  items: TipoCambio[]
  page: number
  total: number
  limit: number
  loadError: string | null
}

export function TiposCambioView(props: TiposCambioViewProps) {
  return <EntityCrudView config={tipoCambioConfig} toolbar={<ListFilters filters={FILTERS} />} {...props} />
}
