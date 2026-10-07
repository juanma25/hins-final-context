// components/layout/GddHeader.tsx
"use client"

import { useState } from "react"
import Link from "next/link"

import { GddNotificationsPanel } from "@/components/gdd/GddNotificationsPanel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SheetOpsNotificationsHeader } from "@/components/ui/sheet-ops"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { sheetContentClassName } from "@/lib/sheet-layout"
import { BellIcon, SearchIcon } from "lucide-react"

import { useDashboardParkName } from "@/hooks/use-dashboard-park-name"

export function GddHeader() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const parkName = useDashboardParkName("Parque GDD")

  return (
    <header className="sticky top-0 z-10 shrink-0 bg-background shadow-xs">
      {/* Top bar — trigger + breadcrumb (left), chrome actions (right) */}
      <div className="flex h-14 items-center justify-between gap-3 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="-ml-0.5 shrink-0" />
          <div className="min-w-0 flex-1 [&_[data-slot=breadcrumb-list]]:flex-nowrap [&_[data-slot=breadcrumb-list]]:overflow-hidden [&_[data-slot=breadcrumb-item]]:shrink-0 [&_[data-slot=breadcrumb-page]]:truncate">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/main">Proyectos</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-green-600" />
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="block truncate">
                    {parkName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* SearchButton */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shadow-xs"
            aria-label="Buscar"
          >
            <SearchIcon className="size-4" aria-hidden />
          </Button>

          {/* NotificationBell */}
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

          {/* UserMenu */}
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
    </header>
  )
}
