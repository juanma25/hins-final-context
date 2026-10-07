"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Nombre real del parque activo, resuelto vía /api/dashboard/context a partir
 * de ?proyectoId= en la URL. Usado por los headers de dashboard (breadcrumb)
 * que son Client Components sin acceso directo a lib/api/* (server-only).
 */
export function useDashboardParkName(fallback: string): string {
  const searchParams = useSearchParams()
  const proyectoId = searchParams.get("proyectoId")
  const [parkName, setParkName] = useState(fallback)

  useEffect(() => {
    if (!proyectoId) {
      return
    }
    let cancelled = false
    fetch(`/api/dashboard/context?proyectoId=${proyectoId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.parkName) {
          setParkName(data.parkName)
        }
      })
      .catch(() => {
        // mantiene el fallback ante error de red
      })
    return () => {
      cancelled = true
    }
  }, [proyectoId, fallback])

  return parkName
}
