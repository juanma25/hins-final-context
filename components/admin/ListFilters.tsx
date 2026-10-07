// components/admin/ListFilters.tsx — filtros por searchParams (reinician ?page)
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { SelectField } from "@/components/admin/SelectField"
import type { SelectOption } from "@/lib/admin-options"

export interface FilterDef {
  param: string
  label: string
  options: readonly SelectOption[]
}

export function ListFilters({ filters }: { filters: FilterDef[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const change = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(param, value)
    else params.delete(param)
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-4 px-6 pt-4">
      {filters.map((f) => (
        <div key={f.param} className="w-full sm:w-48">
          <SelectField
            label={f.label}
            options={f.options}
            placeholder="Todos"
            value={searchParams.get(f.param) ?? ""}
            onValueChange={(v) => change(f.param, v)}
          />
        </div>
      ))}
    </div>
  )
}
