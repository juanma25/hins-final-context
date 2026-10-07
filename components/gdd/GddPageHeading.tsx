// components/gdd/GddPageHeading.tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DashboardDownloadsMenu } from "@/components/layout/DashboardDownloadsMenu"
import { ModelBadge } from "@/components/ui/model-badge"
import { RoiCurrencyTabs } from "@/components/ui/roi-currency-tabs"
import { TabsForBlocks } from "@/components/ui/tabs-for-blocks"

import { useDashboardParkName } from "@/hooks/use-dashboard-park-name"

const navTabs = [
  { value: "/gdd/performance", label: "Performance" },
  {
    value: "/gdd/roi",
    label: "Retorno de Inversión",
    labelMobile: "ROI",
  },
]

export function GddPageHeading() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currency = searchParams.get("currency") ?? "usd"
  const isRoiView = pathname === "/gdd/roi"
  const parkName = useDashboardParkName("Parque GDD")

  function handleNavChange(path: string) {
    const params = searchParams.toString()
    router.push(params ? `${path}?${params}` : path)
  }

  function handleCurrencyChange(newCurrency: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (newCurrency === "usd") {
      params.delete("currency")
    } else {
      params.set("currency", newCurrency)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h1 className="min-w-0 max-w-full text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {parkName}
        </h1>
        <ModelBadge model="GDD" />
      </div>
      <div className="flex w-full min-w-0 items-center gap-4 sm:w-auto sm:gap-6">
        {isRoiView && (
          <RoiCurrencyTabs
            value={currency}
            onValueChange={handleCurrencyChange}
          />
        )}
        <TabsForBlocks
          width="fill"
          className="min-w-0 flex-1 sm:flex-initial"
          tabs={navTabs}
          value={pathname}
          onValueChange={handleNavChange}
        />
        <DashboardDownloadsMenu variant="gdd" />
      </div>
    </div>
  )
}
