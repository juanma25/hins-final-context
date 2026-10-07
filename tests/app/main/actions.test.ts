import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/api/proyectos", () => ({
  createProyecto: vi.fn(),
}))
vi.mock("@/lib/api/parques", () => ({
  createParque: vi.fn(),
}))
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createProyecto } from "@/lib/api/proyectos"
import { createParque } from "@/lib/api/parques"
import { createProyectoAction } from "@/app/main/actions"
import type { CreateProyectoDto, Proyecto, Parque } from "@/lib/api/types"

const dto: CreateProyectoDto = {
  nombre: "Parque Arroyo Cabral",
  modelo: "GDD",
  ubicacion: "Arroyo Cabral",
}

const proyecto: Proyecto = {
  id: "proj-1",
  nombre: dto.nombre,
  modelo: dto.modelo,
  ubicacion: dto.ubicacion,
  fechaAlta: "2026-09-15T00:00:00.000Z",
  activo: true,
}

const parque: Parque = {
  id: "parque-1",
  proyectoId: proyecto.id,
  potenciaTotalKwp: 0,
  fechaPuestaEnMarcha: proyecto.fechaAlta,
  stationExternalId: null,
  nombreExterno: null,
  direccion: null,
  longitud: null,
  latitud: null,
  contactoNombre: null,
  contactoInfo: null,
}

describe("createProyectoAction", () => {
  afterEach(() => vi.resetAllMocks())

  it("happy path: creates proyecto and parque, returns { proyecto, parque }", async () => {
    vi.mocked(createProyecto).mockResolvedValue(proyecto)
    vi.mocked(createParque).mockResolvedValue(parque)

    const result = await createProyectoAction(dto)

    expect(createParque).toHaveBeenCalledWith({
      proyectoId: proyecto.id,
      potenciaTotalKwp: 0,
      fechaPuestaEnMarcha: proyecto.fechaAlta,
    })
    expect(result).toEqual({ proyecto, parque })
    expect(result.error).toBeUndefined()
    expect(result.parqueError).toBeUndefined()
  })

  it("returns { error } and never calls createParque when createProyecto fails", async () => {
    vi.mocked(createProyecto).mockResolvedValue(null)

    const result = await createProyectoAction(dto)

    expect(result.error).toBeTruthy()
    expect(result.proyecto).toBeUndefined()
    expect(result.parque).toBeUndefined()
    expect(createParque).not.toHaveBeenCalled()
  })

  it("returns { error } and never calls createParque when createProyecto throws", async () => {
    vi.mocked(createProyecto).mockRejectedValue(new Error("nombre duplicado"))

    const result = await createProyectoAction(dto)

    expect(result).toEqual({ error: "nombre duplicado" })
    expect(createParque).not.toHaveBeenCalled()
  })

  it("proyecto OK, parque falla: returns { proyecto, parqueError } without throwing", async () => {
    vi.mocked(createProyecto).mockResolvedValue(proyecto)
    vi.mocked(createParque).mockRejectedValue(new Error("backend no disponible"))

    const result = await createProyectoAction(dto)

    expect(result.proyecto).toEqual(proyecto)
    expect(result.parque).toBeUndefined()
    expect(result.parqueError).toBe("backend no disponible")
  })

  it("proyecto OK, createParque resuelve null: returns { proyecto, parqueError }", async () => {
    vi.mocked(createProyecto).mockResolvedValue(proyecto)
    vi.mocked(createParque).mockResolvedValue(null)

    const result = await createProyectoAction(dto)

    expect(result.proyecto).toEqual(proyecto)
    expect(result.parque).toBeUndefined()
    expect(result.parqueError).toBeTruthy()
  })
})
