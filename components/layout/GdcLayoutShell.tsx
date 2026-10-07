// components/layout/GdcLayoutShell.tsx
"use client"

import type { ReactNode } from "react"

import { ParkSidebar } from "@/components/layout/ParkSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { UsuarioRole } from "@/lib/api/types"

export function GdcLayoutShell({
  children,
  role,
}: {
  children: ReactNode
  role: UsuarioRole | null
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <ParkSidebar modelo="GDC" role={role} />
      <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>
    </SidebarProvider>
  )
}
