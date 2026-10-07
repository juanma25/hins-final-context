// components/layout/MainLayoutShell.tsx — shell exclusiva de /main
"use client"

import type { ReactNode } from "react"

import { MainSidebar } from "@/components/layout/MainSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { UsuarioRole } from "@/lib/api/types"

export function MainLayoutShell({ children, role }: { children: ReactNode; role: UsuarioRole | null }) {
  return (
    <SidebarProvider defaultOpen={false} className="h-screen overflow-hidden">
      <MainSidebar role={role} />
      <SidebarInset className="flex min-h-0 flex-col overflow-x-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
