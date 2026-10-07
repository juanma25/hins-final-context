import { describe, it, expect } from "vitest"

import { buildMainNav, buildParkNav } from "@/lib/admin-nav"

const titles = (items: { title: string }[]) => items.map((i) => i.title)

describe("buildMainNav", () => {
  it("admin ve Proyectos, Tarifas y Tipos de cambio", () => {
    const nav = buildMainNav("HINS_ADMIN")
    expect(titles(nav)).toEqual(["Proyectos", "Tarifas", "Tipos de cambio"])
    expect(nav.map((i) => i.href)).toEqual(["/main", "/main/tarifas", "/main/tipos-cambio"])
  })

  it.each(["GDD_OWNER", "AGC", "SOCIO", null] as const)("%s solo ve Proyectos", (role) => {
    expect(titles(buildMainNav(role))).toEqual(["Proyectos"])
  })
})

describe("buildParkNav", () => {
  it("admin ve Costos y no Tarifas/Tipos de cambio", () => {
    const nav = titles(buildParkNav("GDCV", "p1", "HINS_ADMIN"))
    expect(nav).toEqual(["Performance", "Retorno de inversión", "Mantenimiento", "Costos"])
  })

  it("no admin no ve Costos", () => {
    expect(titles(buildParkNav("GDD", "p1", "AGC"))).not.toContain("Costos")
    expect(titles(buildParkNav("GDD", "p1", null))).not.toContain("Costos")
  })

  it("conserva proyectoId en los hrefs y usa el prefijo del modelo", () => {
    const nav = buildParkNav("GDC", "abc 1", "HINS_ADMIN")
    expect(nav.map((i) => i.href)).toEqual([
      "/gdc/performance?proyectoId=abc%201",
      "/gdc/roi?proyectoId=abc%201",
      "/gdc/mantenimiento?proyectoId=abc%201",
      "/gdc/costos?proyectoId=abc%201",
    ])
  })

  it("sin proyectoId deja los hrefs sin query", () => {
    expect(buildParkNav("GDD", null, "AGC")[0].href).toBe("/gdd/performance")
  })
})
