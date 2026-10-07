import { MONEDAS } from "@/lib/admin-options"

export type FormMode = "create" | "edit"

/** Valores de formulario: siempre strings (inputs controlados). */
export type FormValues = Record<string, string>

const isBlank = (v: string | undefined) => !v || v.trim() === ""

function parseNumber(v: string | undefined): number | null {
  if (isBlank(v)) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function validatePeriodo(periodicidad: string, periodo: string): string | null {
  const value = periodo.trim()
  switch (periodicidad) {
    case "DIARIA":
      return isValidDate(value) ? null : "El período diario debe tener formato AAAA-MM-DD"
    case "MENSUAL":
      return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? null : "El período mensual debe tener formato AAAA-MM"
    case "ANUAL":
      return /^\d{4}$/.test(value) ? null : "El período anual debe tener formato AAAA"
    default:
      return "Selecciona la periodicidad"
  }
}

export function validateTarifa(form: FormValues, mode: FormMode): string | null {
  if (mode === "create" && isBlank(form.nombre)) return "Ingresa el nombre de la tarifa"
  const energia = parseNumber(form.valorEnergia)
  if (energia === null || energia < 0) return "Ingresa un valor de energía válido (≥ 0)"
  const inyeccion = parseNumber(form.valorInyeccion)
  if (inyeccion === null || inyeccion < 0) return "Ingresa un valor de inyección válido (≥ 0)"
  if (isBlank(form.unidad)) return "Ingresa la unidad"
  if (!isValidDate(form.vigenteDesde?.trim() ?? "")) return "Ingresa una fecha de vigencia válida (AAAA-MM-DD)"
  return null
}

export function validateTipoCambio(form: FormValues, _mode: FormMode): string | null {
  if (isBlank(form.tipo)) return "Selecciona el tipo"
  if (isBlank(form.periodicidad)) return "Selecciona la periodicidad"
  const periodoError = validatePeriodo(form.periodicidad, form.periodo ?? "")
  if (periodoError) return periodoError
  const valor = parseNumber(form.valor)
  if (valor === null || valor <= 0) return "Ingresa un valor mayor a 0"
  return null
}

export function validateCosto(form: FormValues, _mode: FormMode): string | null {
  if (isBlank(form.parqueId)) return "Selecciona el parque"
  if (isBlank(form.concepto)) return "Ingresa el concepto"
  if (isBlank(form.tipoCosto)) return "Selecciona el tipo de costo"
  const valor = parseNumber(form.valor)
  if (valor === null || valor < 0) return "Ingresa un valor válido (≥ 0)"
  if (!MONEDAS.some((m) => m.value === form.moneda)) return "Selecciona la moneda"
  if (isBlank(form.unidad)) return "Ingresa la unidad"
  return null
}
