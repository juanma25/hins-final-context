import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/socios", () => ({
  createSocio: vi.fn(),
}))

import { createSocio } from "@/lib/api/socios"
import { createSocioAction } from "@/app/gdcv/socios/actions"
import type { CreateSocioDto, Socio } from "@/lib/api/types"

const dto: Omit<CreateSocioDto, "parqueId"> = {
  nombre: "Nuevo Socio SA",
  participacionPorcentaje: 10,
  tipoCargo: "CON_POTENCIA",
  medidorNumero: "9999999",
  suministroNumero: "S-1",
  contratoNumero: "C-1",
}

describe("createSocioAction", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns { socio } on success", async () => {
    const socio: Socio = {
      id: "s1",
      parqueId: "p1",
      nombre: dto.nombre,
      participacionPorcentaje: dto.participacionPorcentaje,
      tipoCargo: dto.tipoCargo,
      medidorNumero: dto.medidorNumero,
      suministroNumero: dto.suministroNumero,
      contratoNumero: dto.contratoNumero,
      usuarioId: null,
    }
    vi.mocked(createSocio).mockResolvedValue(socio)

    const result = await createSocioAction("p1", dto)

    expect(createSocio).toHaveBeenCalledWith("p1", { ...dto, parqueId: "p1" })
    expect(result).toEqual({ socio })
  })

  it("reenvía suministroNumero y contratoNumero sin filtrarlos, incluso vacíos", async () => {
    const emptyDto: Omit<CreateSocioDto, "parqueId"> = {
      ...dto,
      medidorNumero: "",
      suministroNumero: "",
      contratoNumero: "",
    }
    vi.mocked(createSocio).mockResolvedValue({
      id: "s2",
      parqueId: "p1",
      ...emptyDto,
      usuarioId: null,
    })

    await createSocioAction("p1", emptyDto)

    expect(createSocio).toHaveBeenCalledWith("p1", { ...emptyDto, parqueId: "p1" })
  })

  it("returns { error } when createSocio resolves null", async () => {
    vi.mocked(createSocio).mockResolvedValue(null)

    const result = await createSocioAction("p1", dto)

    expect(result.error).toBeTruthy()
    expect(result.socio).toBeUndefined()
  })

  it("returns { error: error.message } when createSocio throws", async () => {
    vi.mocked(createSocio).mockRejectedValue(new Error("medidor duplicado"))

    const result = await createSocioAction("p1", dto)

    expect(result).toEqual({ error: "medidor duplicado" })
  })
})
