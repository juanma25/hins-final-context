// components/admin/PaginationControls.tsx — paginación por ?page= sobre ui/pagination
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { getPageWindow } from "@/lib/api/paginated"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  page: number
  total: number
  limit: number
}

export function PaginationControls({ page, total, limit }: PaginationControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(target))
    return `${pathname}?${params.toString()}`
  }
  const go = (target: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(hrefFor(target))
  }

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        {page > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={hrefFor(page - 1)} onClick={go(page - 1)} />
          </PaginationItem>
        ) : null}
        {getPageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <PaginationItem key={`e${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href={hrefFor(p)} isActive={p === page} onClick={go(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        {page < totalPages ? (
          <PaginationItem>
            <PaginationNext href={hrefFor(page + 1)} onClick={go(page + 1)} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  )
}
