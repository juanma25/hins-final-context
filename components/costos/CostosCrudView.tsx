// components/costos/CostosCrudView.tsx — cliente: arma la config con proyecto/parques y delega en EntityCrudView
"use client"

import { useMemo } from "react"

import { EntityCrudView } from "@/components/admin/EntityCrudView"
import { buildCostoConfig, type ParqueOption } from "@/components/costos/costoConfig"
import type { Costo } from "@/lib/api/types"

interface CostosCrudViewProps {
  proyectoId: string
  parques: ParqueOption[]
  defaultParqueId: string
  items: Costo[]
  page: number
  total: number
  limit: number
  loadError: string | null
}

export function CostosCrudView({ proyectoId, parques, defaultParqueId, ...listProps }: CostosCrudViewProps) {
  const config = useMemo(
    () => buildCostoConfig(proyectoId, parques, defaultParqueId),
    [proyectoId, parques, defaultParqueId]
  )
  return <EntityCrudView config={config} {...listProps} />
}
