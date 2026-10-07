import { NextResponse } from "next/server"
import { UnauthorizedError } from "@/lib/api/client"
import { getEnergiaDelDia } from "@/lib/api/energia"
import { listRegistrosMedidorPrincipal } from "@/lib/api/medidor-principal"
import type { RegistroMedidorPrincipal } from "@/lib/api/types"
import { getRegistroMasRecienteDelDia, getRegistrosDelDiaOrdenados } from "@/lib/park-energy-series"
import { getArgentinaDayRangeIso } from "@/lib/argentina-day-range"

interface RouteParams {
  params: Promise<{ parqueId: string }>
}

function parsePeriodoToDate(periodo: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(periodo)
  if (!match) return null
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d))
}

/**
 * Igual criterio de aislamiento que el resto de las fuentes de este feature
 * (ver specs/012-comparativa-dimms-huawei): un fallo del medidor principal
 * no debe tumbar la respuesta ni ocultar los datos de Huawei ya resueltos.
 * `UnauthorizedError` se propaga para que el caller la trate igual que la
 * de Huawei (401 único para toda la ruta).
 */
async function loadRegistrosDimmsDelDia(
  parqueId: string,
  periodo: string
): Promise<{ registrosDimms: RegistroMedidorPrincipal[]; dimmsStatus: "ok" | "error" }> {
  const dia = parsePeriodoToDate(periodo)
  if (!dia) {
    return { registrosDimms: [], dimmsStatus: "error" }
  }
  const { desde, hasta } = getArgentinaDayRangeIso(dia)
  try {
    const registrosDimms = await listRegistrosMedidorPrincipal(parqueId, desde, hasta)
    return { registrosDimms, dimmsStatus: "ok" }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error
    return { registrosDimms: [], dimmsStatus: "error" }
  }
}

/**
 * Boundary Server/Client para la pestaña DIA (Principio II) — evita exponer
 * apiFetch/token del backend HINS al cliente. Ver
 * specs/004-daily-monthly-energy-view/contracts/get-parque-energia-dia.md y
 * specs/012-comparativa-dimms-huawei (comparativa DIMMs vs Huawei, gráfico 1D).
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { parqueId } = await params
  const { searchParams } = new URL(request.url)
  const periodo = searchParams.get("periodo")
  if (!periodo) {
    return NextResponse.json({ message: "Falta periodo" }, { status: 400 })
  }

  try {
    const registros = await getEnergiaDelDia(parqueId, periodo)
    const registro = getRegistroMasRecienteDelDia(registros)
    const registrosOrdenados = getRegistrosDelDiaOrdenados(registros)
    const { registrosDimms, dimmsStatus } = await loadRegistrosDimmsDelDia(parqueId, periodo)
    return NextResponse.json({ registro, registros: registrosOrdenados, registrosDimms, dimmsStatus })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al consultar la energía del día" },
      { status: 500 }
    )
  }
}
