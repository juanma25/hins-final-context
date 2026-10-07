// components/tarifas/TarifasView.tsx
"use client"

import { EntityCrudView } from "@/components/admin/EntityCrudView"
import { tarifaConfig } from "@/components/tarifas/tarifaConfig"
import type { Tarifa } from "@/lib/api/types"

interface TarifasViewProps {
  items: Tarifa[]
  page: number
  total: number
  limit: number
  loadError: string | null
}

export function TarifasView(props: TarifasViewProps) {
  return <EntityCrudView config={tarifaConfig} {...props} />
}
