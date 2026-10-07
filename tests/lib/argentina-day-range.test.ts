import { describe, it, expect } from "vitest"
import { getArgentinaDayRangeIso, getArgentinaCurrentHour } from "@/lib/argentina-day-range"

describe("getArgentinaDayRangeIso", () => {
  it("returns the Argentina calendar day (UTC-3, no DST) as an explicit-offset ISO range", () => {
    const range = getArgentinaDayRangeIso(new Date(2026, 8, 22)) // 22 sep 2026 (mes 0-indexado)
    expect(range).toEqual({
      desde: "2026-09-22T00:00:00-03:00",
      hasta: "2026-09-23T00:00:00-03:00",
    })
  })

  it("rolls hasta over to the next month/year correctly", () => {
    const range = getArgentinaDayRangeIso(new Date(2026, 11, 31)) // 31 dic 2026
    expect(range).toEqual({
      desde: "2026-12-31T00:00:00-03:00",
      hasta: "2027-01-01T00:00:00-03:00",
    })
  })

  it("uses the Date's own calendar-day components (year/month/day), not UTC time-of-day", () => {
    const range = getArgentinaDayRangeIso(new Date(2026, 0, 5))
    expect(range).toEqual({
      desde: "2026-01-05T00:00:00-03:00",
      hasta: "2026-01-06T00:00:00-03:00",
    })
  })
})

describe("getArgentinaCurrentHour", () => {
  it("converts a UTC instant to the Argentina wall-clock hour (UTC-3)", () => {
    expect(getArgentinaCurrentHour(new Date("2026-09-22T17:30:00.000Z"))).toBe(14)
  })

  it("rolls back across midnight correctly", () => {
    expect(getArgentinaCurrentHour(new Date("2026-09-22T02:00:00.000Z"))).toBe(23)
  })
})
