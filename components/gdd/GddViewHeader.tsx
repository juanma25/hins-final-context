// components/gdd/GddViewHeader.tsx
"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { GddNotificationsPanel } from "@/components/gdd/GddNotificationsPanel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ModelBadge } from "@/components/ui/model-badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SheetOpsNotificationsHeader } from "@/components/ui/sheet-ops"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { sheetContentClassName } from "@/lib/sheet-layout"
import { TabsForBlocks } from "@/components/ui/tabs-for-blocks"
import { BellIcon, DownloadIcon, SearchIcon } from "lucide-react"

import { useDashboardParkName } from "@/hooks/use-dashboard-park-name"

const navTabs = [
  { value: "/gdd/performance", label: "Performance" },
  { value: "/gdd/roi", label: "Retorno de Inversión" },
] as const

export function GddViewHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const parkName = useDashboardParkName("Parque GDD")

  return (
    <div className="shrink-0 bg-background shadow-xs">
      <div className="flex h-11 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-0.5" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shadow-xs"
            aria-label="Buscar"
          >
            <SearchIcon className="size-4" aria-hidden />
          </Button>
          <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative size-8 shadow-xs"
                aria-label="Notificaciones"
                aria-expanded={notificationsOpen}
              >
                <BellIcon className="size-4" aria-hidden />
                <span
                  className="pointer-events-none absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive"
                  aria-hidden
                />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={sheetContentClassName("notifications")}
            >
              <SheetOpsNotificationsHeader
                title="Notificaciones del parque"
                description={`Avisos y comunicaciones para ${parkName}. Solo lectura.`}
              />
              <GddNotificationsPanel />
            </SheetContent>
          </Sheet>
          <div className="hidden items-center gap-2 pl-1 sm:flex">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-medium">Us</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-medium leading-tight">Usr</span>
              <span className="text-[11px] text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </div>
      <header className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {parkName}
          </h1>
          <ModelBadge model="GDD" />
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <TabsForBlocks
            tabs={[...navTabs]}
            value={pathname}
            onValueChange={(v) => router.push(v)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 bg-secondary shadow-xs"
            aria-label="Exportar datos"
          >
            <DownloadIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </header>
    </div>
  )
}
