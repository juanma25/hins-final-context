import { describe, it, expect } from "vitest"

import {
  validateCosto,
  validatePeriodo,
  validateTarifa,
  validateTipoCambio,
} from "@/lib/admin-validation"

const tarifaOk = {
  nombre: "Residencial",
  valorEnergia: "10.5",
  valorInyeccion: "8",
  unidad: "ARS/kWh",
  vigenteDesde: "2026-11-01",
}

describe("validateTarifa", () => {
  it("acepta datos válidos", () => {
    expect(validateTarifa(tarifaOk, "create")).toBeNull()
  })
  it("exige nombre solo al crear", () => {
    expect(validateTarifa({ ...tarifaOk, nombre: " " }, "create")).toMatch(/nombre/i)
    expect(validateTarifa({ ...tarifaOk, nombre: "" }, "edit")).toBeNull()
  })
  it("valores numéricos ≥ 0", () => {
    expect(validateTarifa({ ...tarifaOk, valorEnergia: "" }, "create")).toMatch(/energía/i)
    expect(validateTarifa({ ...tarifaOk, valorEnergia: "-1" }, "create")).toMatch(/energía/i)
    expect(validateTarifa({ ...tarifaOk, valorInyeccion: "x" }, "create")).toMatch(/inyección/i)
    expect(validateTarifa({ ...tarifaOk, valorInyeccion: "0" }, "create")).toBeNull()
  })
  it("exige unidad y fecha YYYY-MM-DD", () => {
    expect(validateTarifa({ ...tarifaOk, unidad: "" }, "create")).toMatch(/unidad/i)
    expect(validateTarifa({ ...tarifaOk, vigenteDesde: "01/11/2026" }, "create")).toMatch(/fecha/i)
    expect(validateTarifa({ ...tarifaOk, vigenteDesde: "2026-02-31" }, "create")).toMatch(/fecha/i)
  })
})

describe("validatePeriodo", () => {
  it("valida formato según periodicidad", () => {
    expect(validatePeriodo("DIARIA", "2026-10-07")).toBeNull()
    expect(validatePeriodo("MENSUAL", "2026-10")).toBeNull()
    expect(validatePeriodo("ANUAL", "2026")).toBeNull()
    expect(validatePeriodo("MENSUAL", "2026")).toMatch(/AAAA-MM/)
    expect(validatePeriodo("DIARIA", "2026-10")).toMatch(/AAAA-MM-DD/)
    expect(validatePeriodo("ANUAL", "26")).toMatch(/AAAA/)
    expect(validatePeriodo("MENSUAL", "2026-13")).toMatch(/AAAA-MM/)
  })
})

describe("validateTipoCambio", () => {
  const ok = { tipo: "REAL", periodicidad: "MENSUAL", periodo: "2026-10", valor: "1200" }
  it("acepta datos válidos", () => {
    expect(validateTipoCambio(ok, "create")).toBeNull()
  })
  it("exige tipo y periodicidad", () => {
    expect(validateTipoCambio({ ...ok, tipo: "" }, "create")).toMatch(/tipo/i)
    expect(validateTipoCambio({ ...ok, periodicidad: "" }, "create")).toMatch(/periodicidad/i)
  })
  it("período incompatible con periodicidad", () => {
    expect(validateTipoCambio({ ...ok, periodo: "2026" }, "create")).toMatch(/AAAA-MM/)
  })
  it("valor > 0", () => {
    expect(validateTipoCambio({ ...ok, valor: "0" }, "create")).toMatch(/valor/i)
    expect(validateTipoCambio({ ...ok, valor: "" }, "create")).toMatch(/valor/i)
  })
})

describe("validateCosto", () => {
  const ok = {
    parqueId: "pq1",
    concepto: "Seguro",
    tipoCosto: "FIJO",
    valor: "100",
    moneda: "USD",
    unidad: "anual",
  }
  it("acepta datos válidos", () => {
    expect(validateCosto(ok, "create")).toBeNull()
  })
  it("exige parque, concepto, tipo, unidad", () => {
    expect(validateCosto({ ...ok, parqueId: "" }, "create")).toMatch(/parque/i)
    expect(validateCosto({ ...ok, concepto: " " }, "create")).toMatch(/concepto/i)
    expect(validateCosto({ ...ok, tipoCosto: "" }, "create")).toMatch(/tipo/i)
    expect(validateCosto({ ...ok, unidad: "" }, "create")).toMatch(/unidad/i)
  })
  it("valor ≥ 0 y moneda en la lista", () => {
    expect(validateCosto({ ...ok, valor: "-5" }, "create")).toMatch(/valor/i)
    expect(validateCosto({ ...ok, valor: "0" }, "create")).toBeNull()
    expect(validateCosto({ ...ok, moneda: "EUR" }, "create")).toMatch(/moneda/i)
  })
})
