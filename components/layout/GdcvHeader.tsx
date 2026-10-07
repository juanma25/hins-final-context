// components/layout/GdcvHeader.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchIcon } from "lucide-react"

import { useDashboardParkName } from "@/hooks/use-dashboard-park-name"

export function GdcvHeader() {
  const pathname = usePathname()
  const isSocioFlow = pathname.startsWith("/gdcv/socio")
  const gdcvParkName = useDashboardParkName("Parque GDCV")

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-white shadow-xs">
      <div className="flex h-14 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isSocioFlow ? (
            <img
              src="/images/svg-assets/hins-logo-light.svg"
              alt="HINS"
              className="h-6 w-auto shrink-0"
            />
          ) : (
            <SidebarTrigger className="-ml-0.5 shrink-0" />
          )}
          {!isSocioFlow && (
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
                      {gdcvParkName}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shadow-xs"
            aria-label="Buscar"
          >
            <SearchIcon className="size-4" aria-hidden />
          </Button>
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-medium">Ad</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-medium leading-tight">Admin</span>
              <span className="text-[11px] text-muted-foreground">AGC</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
