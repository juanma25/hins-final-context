// components/layout/MainSidebar.tsx — navegación shell Main (/main)
"use client"

import { SidebarNav } from "@/components/layout/SidebarNav"
import { buildMainNav } from "@/lib/admin-nav"
import type { UsuarioRole } from "@/lib/api/types"

const mainUser = {
  name: "HINS Admin",
  email: "admin@hins.example",
  avatar: "",
}

export function MainSidebar({ role }: { role: UsuarioRole | null }) {
  return <SidebarNav groupLabel="Navegación" items={buildMainNav(role)} user={mainUser} />
}
