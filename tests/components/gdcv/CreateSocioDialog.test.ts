import { describe, it, expect } from "vitest"
import { getSocioFormValidationError } from "@/components/gdcv/CreateSocioDialog"

const baseForm = {
  nombre: "Alfredo Isaac SA",
  participacionPorcentaje: "15",
  tipoCargo: "CON_POTENCIA" as const,
  medidorNumero: "",
  suministroNumero: "",
  contratoNumero: "",
}

describe("getSocioFormValidationError", () => {
  it("returns null when medidor, suministro and contrato are all empty", () => {
    expect(getSocioFormValidationError(baseForm)).toBeNull()
  })

  it("returns null when medidor, suministro and contrato are all filled", () => {
    expect(
      getSocioFormValidationError({
        ...baseForm,
        medidorNumero: "M1",
        suministroNumero: "S1",
        contratoNumero: "C1",
      })
    ).toBeNull()
  })

  it("returns an error mentioning No. de Suministro when medidor is filled but suministro is empty", () => {
    const error = getSocioFormValidationError({
      ...baseForm,
      medidorNumero: "M1",
      suministroNumero: "",
      contratoNumero: "C1",
    })
    expect(error).toMatch(/suministro/i)
  })

  it("returns an error mentioning No. de Contrato when medidor is filled but contrato is empty", () => {
    const error = getSocioFormValidationError({
      ...baseForm,
      medidorNumero: "M1",
      suministroNumero: "S1",
      contratoNumero: "",
    })
    expect(error).toMatch(/contrato/i)
  })

  it("returns an error when medidor is filled and both suministro and contrato are empty", () => {
    const error = getSocioFormValidationError({
      ...baseForm,
      medidorNumero: "M1",
      suministroNumero: "",
      contratoNumero: "",
    })
    expect(error).toBeTruthy()
  })

  it("still validates base fields (nombre) before the medidor rule", () => {
    const error = getSocioFormValidationError({ ...baseForm, nombre: "" })
    expect(error).toMatch(/nombre/i)
  })
})
