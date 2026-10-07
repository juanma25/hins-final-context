// app/gdd/performance/page.tsx
import { redirect } from "next/navigation"
import { GddPageHeading } from "@/components/gdd/GddPageHeading"
import { GddPerformanceView } from "@/components/gdd/GddPerformanceView"
import { resolveDashboardContext, type DashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"
import { listEnergia, listEnergiaDiaria } from "@/lib/api/energia"
import { getConsolidadoMedidorPrincipal } from "@/lib/api/medidor-principal"
import type { RegistroDimmsMesActual, RegistroDimmsPorPeriodo } from "@/lib/energia-comparativa"
import type { RegistroEnergiaDiario, RegistroEnergiaMensual } from "@/lib/api/types"

interface GddPerformancePageProps {
  searchParams: Promise<{ proyectoId?: string }>
}

async function loadContext(proyectoId: string): Promise<DashboardContext | null> {
  try {
    return await resolveDashboardContext(proyectoId)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    throw error
  }
}

/**
 * Carga los registros de energía por separado del contexto proyecto/parque:
 * una falla acá no debe tumbar toda la página, solo mostrar el estado de
 * error del gráfico (User Story 3 — distinto del estado vacío).
 */
async function loadRegistrosEnergia(parqueId: string): Promise<{ registros: RegistroEnergiaMensual[] | null }> {
  try {
    const registros = await listEnergia(parqueId)
    return { registros }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    return { registros: null }
  }
}

function currentPeriodo(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Igual criterio que loadRegistrosEnergia: una falla acá no debe tumbar la
 * página, solo el estado de error de la card de energía del mes actual.
 */
async function loadRegistrosEnergiaDiaria(
  parqueId: string,
  periodo: string
): Promise<{ registros: RegistroEnergiaDiario[] | null }> {
  try {
    const registros = await listEnergiaDiaria(parqueId, periodo)
    return { registros }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    return { registros: null }
  }
}

/**
 * Igual criterio que loadRegistrosEnergia: una falla acá no debe tumbar la
 * página, solo el estado de la card KPI comparativa. 404 (sin medidor
 * principal configurado) es una condición de negocio, distinta de un fallo
 * transitorio — ver specs/012-comparativa-dimms-huawei/contracts/medidor-principal-consolidado.md.
 */
async function loadRegistroDimmsMesActual(
  parqueId: string,
  periodo: string
): Promise<RegistroDimmsMesActual> {
  try {
    const registro = await getConsolidadoMedidorPrincipal(parqueId, periodo)
    return registro ? { status: "ok", registro } : { status: "sin-medidor" }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    return { status: "error" }
  }
}

/**
 * El endpoint DIMMs consolidado solo devuelve el total de un único período
 * por llamada — se pide uno por mes visible en el rango de gráfico (acotado
 * a los últimos 12 meses de registrosEnergia), en paralelo. Cada período
 * fallido individualmente queda como `dato: null` (mismo tratamiento que
 * "sin datos" para ese punto del gráfico).
 */
async function loadRegistrosDimmsPorRango(
  parqueId: string,
  registrosEnergia: RegistroEnergiaMensual[] | null
): Promise<RegistroDimmsPorPeriodo[]> {
  const periodos = [...new Set((registrosEnergia ?? []).map((r) => r.periodo))]
    .sort((a, b) => a.localeCompare(b))
    .slice(-12)

  return Promise.all(
    periodos.map(async (periodo) => {
      try {
        const dato = await getConsolidadoMedidorPrincipal(parqueId, periodo)
        return { periodo, dato }
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          redirect("/login")
        }
        return { periodo, dato: null }
      }
    })
  )
}

export default async function GddPerformancePage({ searchParams }: GddPerformancePageProps) {
  const { proyectoId } = await searchParams
  if (!proyectoId) {
    return <p className="text-sm text-muted-foreground">Falta el parámetro proyectoId.</p>
  }

  const context = await loadContext(proyectoId)
  if (!context) {
    return <p className="text-sm text-muted-foreground">Proyecto o parque no encontrado.</p>
  }

  const periodoActual = currentPeriodo()
  const [
    { registros: registrosEnergia },
    { registros: registrosEnergiaDiaria },
    registroDimmsMesActual,
  ] = await Promise.all([
    loadRegistrosEnergia(context.parque.id),
    loadRegistrosEnergiaDiaria(context.parque.id, periodoActual),
    loadRegistroDimmsMesActual(context.parque.id, periodoActual),
  ])

  const registrosDimmsPorRango = await loadRegistrosDimmsPorRango(context.parque.id, registrosEnergia)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <GddPageHeading />
      <GddPerformanceView
        parque={context.parque}
        registrosEnergia={registrosEnergia}
        registrosEnergiaDiaria={registrosEnergiaDiaria}
        periodoActual={periodoActual}
        registroDimmsMesActual={registroDimmsMesActual}
        registrosDimmsPorRango={registrosDimmsPorRango}
      />
    </div>
  )
}
