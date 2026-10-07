// app/gdc/layout.tsx
import type { ReactNode } from "react"

import { getCurrentRole } from "@/lib/api/guards"
import { DashboardMain } from "@/components/layout/DashboardMain"
import { GdcHeader } from "@/components/layout/GdcHeader"
import { GdcLayoutShell } from "@/components/layout/GdcLayoutShell"

export default async function GdcLayout({ children }: { children: ReactNode }) {
  const role = await getCurrentRole()

  return (
    <GdcLayoutShell role={role}>
      <GdcHeader />
      <DashboardMain>{children}</DashboardMain>
    </GdcLayoutShell>
  )
}
