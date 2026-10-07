import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"
import { listParquesByProyecto, getPrimaryParque } from "@/lib/api/parques"

describe("lib/api/parques — resolución proyecto→parque", () => {
  afterEach(() => vi.clearAllMocks())

  it("listParquesByProyecto returns [] on null", async () => {
    vi.mocked(apiFetch).mockResolvedValue(null)
    expect(await listParquesByProyecto("p1")).toEqual([])
    expect(apiFetch).toHaveBeenCalledWith("/proyectos/p1/parques")
  })

  it("getPrimaryParque returns the first parque when present", async () => {
    const parques = [{ id: "park-1" }, { id: "park-2" }]
    vi.mocked(apiFetch).mockResolvedValue(parques)
    const result = await getPrimaryParque("p1")
    expect(result).toEqual({ id: "park-1" })
  })

  it("getPrimaryParque returns null when project has no parques", async () => {
    vi.mocked(apiFetch).mockResolvedValue([])
    expect(await getPrimaryParque("p1")).toBeNull()
  })
})
