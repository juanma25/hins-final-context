import { NextResponse } from "next/server"
import { UnauthorizedError } from "@/lib/api/client"
import { listMedicionesSocio } from "@/lib/api/socios-historico"

interface RouteParams {
  params: Promise<{ parqueId: string; socioId: string }>
}

/**
 * Boundary Server/Client (Principio II) para el histórico de Mediciones del
 * socio — ver specs/009-socio-historico-dialog/contracts/date-range-validation.md.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { parqueId, socioId } = await params
  const { searchParams } = new URL(request.url)
  const desde = searchParams.get("desde")
  const hasta = searchParams.get("hasta")
  if (!desde || !hasta) {
    return NextResponse.json({ message: "Falta desde/hasta" }, { status: 400 })
  }

  try {
    const mediciones = await listMedicionesSocio(parqueId, socioId, desde, hasta)
    return NextResponse.json(mediciones)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al consultar mediciones del socio" },
      { status: 500 }
    )
  }
}
