// app/gdcv/layout.tsx
import type { ReactNode } from "react"

import { GdcvLayoutRoot } from "@/components/layout/GdcvLayoutRoot"
import { getCurrentRole } from "@/lib/api/guards"

export default async function GdcvLayout({ children }: { children: ReactNode }) {
  const role = await getCurrentRole()
  return <GdcvLayoutRoot role={role}>{children}</GdcvLayoutRoot>
}
