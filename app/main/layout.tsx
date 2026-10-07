import type { ReactNode } from "react"

import { getCurrentRole } from "@/lib/api/guards"
import { MainHeader } from "@/components/layout/MainHeader"
import { MainLayoutShell } from "@/components/layout/MainLayoutShell"
import { PageTransition } from "@/components/ui/page-transition"

export default async function MainLayout({ children }: { children: ReactNode }) {
  const role = await getCurrentRole()

  return (
    <MainLayoutShell role={role}>
      <MainHeader />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 bg-background-subtle">
        <PageTransition>{children}</PageTransition>
      </main>
    </MainLayoutShell>
  )
}
