function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function toArgentinaMidnightIso(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}T00:00:00-03:00`
}

/**
 * Rango [desde, hasta) del día calendario en Argentina (UTC-3 fijo, sin DST)
 * para un `Date` dado — usa sus componentes de calendario locales
 * (año/mes/día), igual criterio que `toDateKey` (data/gdcv-daily-mock.ts).
 * Usado para consultar GET /parques/{parqueId}/medidor-principal/registros
 * (filtra por fechaHora, hora local del parque).
 */
export function getArgentinaDayRangeIso(date: Date): { desde: string; hasta: string } {
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

  return {
    desde: toArgentinaMidnightIso(date.getFullYear(), date.getMonth() + 1, date.getDate()),
    hasta: toArgentinaMidnightIso(nextDay.getFullYear(), nextDay.getMonth() + 1, nextDay.getDate()),
  }
}

/**
 * Hora actual en Argentina (UTC-3 fijo, sin DST) a partir de un instante —
 * mismo criterio de conversión que `hourOf` en lib/energia-comparativa.ts.
 * Usado para recortar puntos "futuros" del día en curso (ver
 * specs/012-comparativa-dimms-huawei): un registro con `fechaHora` posterior
 * a la hora real (reloj de dispositivo mal calibrado, dato de prueba) no
 * debería graficarse como si ya hubiera ocurrido.
 */
export function getArgentinaCurrentHour(now: Date = new Date()): number {
  return (now.getUTCHours() + 24 - 3) % 24
}
