import { describe, it, expect } from "vitest"

import { buildQuery, clampPage, parsePage, toNumber } from "@/lib/api/paginated"

describe("lib/api/paginated", () => {
  it("buildQuery omite vacíos y undefined", () => {
    expect(buildQuery({ page: 2, limit: 20, nombre: "", tipo: undefined })).toBe("?page=2&limit=20")
    expect(buildQuery({})).toBe("")
  })

  it("toNumber coacciona strings decimales", () => {
    expect(toNumber("12.5")).toBe(12.5)
    expect(toNumber(3)).toBe(3)
    expect(toNumber(null)).toBe(0)
    expect(toNumber("abc")).toBe(0)
  })

  it("parsePage devuelve ≥ 1", () => {
    expect(parsePage(undefined)).toBe(1)
    expect(parsePage("0")).toBe(1)
    expect(parsePage("-3")).toBe(1)
    expect(parsePage("abc")).toBe(1)
    expect(parsePage("4")).toBe(4)
  })

  it("clampPage retrocede si la página queda vacía", () => {
    expect(clampPage(3, 41, 20)).toBe(3)
    expect(clampPage(4, 41, 20)).toBe(3)
    expect(clampPage(2, 0, 20)).toBe(1)
    expect(clampPage(1, 5, 20)).toBe(1)
  })
})

import { getPageWindow } from "@/lib/api/paginated"

describe("getPageWindow", () => {
  it("muestra todas las páginas si son pocas", () => {
    expect(getPageWindow(2, 3)).toEqual([1, 2, 3])
  })
  it("inserta elipsis en los saltos", () => {
    expect(getPageWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10])
    expect(getPageWindow(1, 10)).toEqual([1, 2, null, 10])
    expect(getPageWindow(10, 10)).toEqual([1, null, 9, 10])
  })
})
