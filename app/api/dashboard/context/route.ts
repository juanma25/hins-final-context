import { NextResponse } from "next/server"
import { resolveDashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const proyectoId = searchParams.get("proyectoId")
  if (!proyectoId) {
    return NextResponse.json({ message: "Falta proyectoId" }, { status: 400 })
  }

  try {
    const context = await resolveDashboardContext(proyectoId)
    if (!context) {
      return NextResponse.json({ message: "Proyecto o parque no encontrado" }, { status: 404 })
    }
    return NextResponse.json({
      parkName: context.parque.nombreExterno ?? context.proyecto.nombre,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: error.message }, { status: 401 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al resolver el dashboard" },
      { status: 500 }
    )
  }
}
