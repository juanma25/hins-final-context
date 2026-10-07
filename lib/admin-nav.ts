import {
  ArrowLeftRightIcon,
  LayoutDashboardIcon,
  TagIcon,
  TrendingUpIcon,
  WalletIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"

import type { ModeloNegocio, UsuarioRole } from "@/lib/api/types"

export interface NavItem {
  title: string
  /** Ruta con query (si aplica) para el link. */
  href: string
  icon: LucideIcon
}

/** Pathname sin query, para comparar con `usePathname()`. */
export function navItemPath(item: NavItem): string {
  return item.href.split("?")[0]
}

const isAdmin = (role: UsuarioRole | null | undefined) => role === "HINS_ADMIN"

/** Menú del shell global (/main). Tarifas y Tipos de cambio: solo admin. */
export function buildMainNav(role: UsuarioRole | null | undefined): NavItem[] {
  const items: NavItem[] = [{ title: "Proyectos", href: "/main", icon: LayoutDashboardIcon }]
  if (isAdmin(role)) {
    items.push(
      { title: "Tarifas", href: "/main/tarifas", icon: TagIcon },
      { title: "Tipos de cambio", href: "/main/tipos-cambio", icon: ArrowLeftRightIcon }
    )
  }
  return items
}

/** Menú de un parque (GDD/GDC/GDCV). Costos: solo admin. Conserva `?proyectoId`. */
export function buildParkNav(
  modelo: ModeloNegocio,
  proyectoId: string | null | undefined,
  role: UsuarioRole | null | undefined
): NavItem[] {
  const base = `/${modelo.toLowerCase()}`
  const query = proyectoId ? `?proyectoId=${encodeURIComponent(proyectoId)}` : ""
  const items: NavItem[] = [
    { title: "Performance", href: `${base}/performance${query}`, icon: LayoutDashboardIcon },
    { title: "Retorno de inversión", href: `${base}/roi${query}`, icon: TrendingUpIcon },
    { title: "Mantenimiento", href: `${base}/mantenimiento${query}`, icon: WrenchIcon },
  ]
  if (isAdmin(role)) {
    items.push({ title: "Costos", href: `${base}/costos${query}`, icon: WalletIcon })
  }
  return items
}
