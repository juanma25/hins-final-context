export const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

/** Formatea un `periodo` del contrato ("YYYY-MM") a label legible ("Marzo 2026"). */
export function formatPeriodoLabel(periodo: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo)
  if (!match) return periodo
  const [, year, month] = match
  const monthName = MONTH_NAMES_ES[Number(month) - 1]
  return monthName ? `${monthName} ${year}` : periodo
}

/** Nombre de mes en español a partir de `periodo` ("YYYY-MM" → "Julio"), sin el año. */
export function getMonthNameEs(periodo: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo)
  if (!match) return periodo
  const [, , month] = match
  return MONTH_NAMES_ES[Number(month) - 1] ?? periodo
}
