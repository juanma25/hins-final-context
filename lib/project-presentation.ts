import type { ModeloNegocio, Proyecto } from "@/lib/api/types"

export function getProjectCoverImage(proyecto: Pick<Proyecto, "imageUrl">): string | undefined {
  const { imageUrl } = proyecto
  if (!imageUrl) return undefined
  return /^https?:\/\//.test(imageUrl) ? imageUrl : `/${imageUrl.replace(/^\/+/, "")}`
}

/**
 * Ruta de dashboard según el modelo de negocio del proyecto, parametrizada
 * por proyectoId (query param) — las páginas de cada dashboard resuelven el
 * Parque real vía lib/api/parques.ts getPrimaryParque(proyectoId).
 */
export function hrefForModelo(modelo: ModeloNegocio, proyectoId: string): string {
  const base = modelo === "GDD" ? "/gdd/performance" : modelo === "GDC" ? "/gdc/performance" : "/gdcv/performance"
  return `${base}?proyectoId=${proyectoId}`
}
