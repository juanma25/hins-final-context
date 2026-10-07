// components/layout/ParkSidebar.tsx — sidebar único de parque (GDD / GDC / GDCV)
"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { SidebarNav } from "@/components/layout/SidebarNav"
import { buildParkNav } from "@/lib/admin-nav"
import type { ModeloNegocio, UsuarioRole } from "@/lib/api/types"

const PARK_USERS: Record<ModeloNegocio, { name: string; email: string; avatar: string }> = {
  GDD: { name: "Cooperativa Eléctrica", email: "energia@coop.example", avatar: "" },
  GDC: { name: "Admin del Parque", email: "admin@gdc.example", avatar: "" },
  GDCV: { name: "Admin del Parque", email: "admin@gdcv.example", avatar: "" },
}

function ParkNav({ modelo, role }: { modelo: ModeloNegocio; role: UsuarioRole | null }) {
  const proyectoId = useSearchParams().get("proyectoId")
  return (
    <SidebarNav
      groupLabel="Parque"
      items={buildParkNav(modelo, proyectoId, role)}
      user={PARK_USERS[modelo]}
    />
  )
}

export function ParkSidebar({ modelo, role }: { modelo: ModeloNegocio; role: UsuarioRole | null }) {
  return (
    <Suspense fallback={<SidebarNavFallback modelo={modelo} role={role} />}>
      <ParkNav modelo={modelo} role={role} />
    </Suspense>
  )
}

/** Mientras se resuelven los searchParams: mismo menú sin `?proyectoId`. */
function SidebarNavFallback({ modelo, role }: { modelo: ModeloNegocio; role: UsuarioRole | null }) {
  return <SidebarNav groupLabel="Parque" items={buildParkNav(modelo, null, role)} user={PARK_USERS[modelo]} />
}
