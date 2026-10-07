// components/layout/GdcvLayoutRoot.tsx — alterna shell con/sin sidebar según la ruta (/gdcv/socio*)
"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { DashboardMain } from "@/components/layout/DashboardMain"
import { GdcvHeader } from "@/components/layout/GdcvHeader"
import { GdcvLayoutShell } from "@/components/layout/GdcvLayoutShell"
import { GdcvLayoutShellNoSidebar } from "@/components/layout/GdcvLayoutShellNoSidebar"
import type { UsuarioRole } from "@/lib/api/types"

export function GdcvLayoutRoot({ children, role }: { children: ReactNode; role: UsuarioRole | null }) {
  const pathname = usePathname()
  const isSocioRoute = pathname.startsWith("/gdcv/socio")

  const content = (
    <>
      <GdcvHeader />
      <DashboardMain>{children}</DashboardMain>
    </>
  )

  return isSocioRoute ? (
    <GdcvLayoutShellNoSidebar>{content}</GdcvLayoutShellNoSidebar>
  ) : (
    <GdcvLayoutShell role={role}>{content}</GdcvLayoutShell>
  )
}
