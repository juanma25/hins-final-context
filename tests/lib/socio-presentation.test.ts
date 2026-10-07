import { describe, it, expect } from "vitest"

import { mapSocioToRow, TIPO_CARGO_LABELS } from "@/lib/socio-presentation"
import type { Socio } from "@/lib/api/types"

function socio(overrides: Partial<Socio> = {}): Socio {
  return {
    id: "s1",
    parqueId: "p1",
    nombre: "Alfredo Isaac SA",
    participacionPorcentaje: 15,
    tipoCargo: "SIN_POTENCIA",
    medidorNumero: "3543871",
    suministroNumero: "",
    contratoNumero: "",
    usuarioId: null,
    ...overrides,
  }
}

describe("mapSocioToRow", () => {
  it("maps nombre, medidorNumero and participacionPorcentaje", () => {
    const row = mapSocioToRow(socio())
    expect(row.id).toBe("s1")
    expect(row.nombre).toBe("Alfredo Isaac SA")
    expect(row.medidor).toBe("3543871")
    expect(row.participacion).toBe("15%")
  })

  it("degrades columns with no backend equivalent to em dash", () => {
    const row = mapSocioToRow(socio())
    expect(row.potenciaAsociada).toBe("—")
    expect(row.energiaGenerada).toBe("—")
    expect(row.ahorroGenerado).toBe("—")
  })

  it("never sets medidores (multi-medidor) or tipo — no backend equivalent", () => {
    const row = mapSocioToRow(socio())
    expect(row.medidores).toBeUndefined()
    expect(row.tipo).toBeUndefined()
  })
})

describe("TIPO_CARGO_LABELS", () => {
  it("maps CON_POTENCIA and SIN_POTENCIA to Spanish labels", () => {
    expect(TIPO_CARGO_LABELS.CON_POTENCIA).toBe("Con Potencia")
    expect(TIPO_CARGO_LABELS.SIN_POTENCIA).toBe("Sin Potencia")
  })
})
