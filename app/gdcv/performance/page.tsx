// app/gdcv/performance/page.tsx
import { redirect } from "next/navigation"
import { GdcvPageHeading } from "@/components/gdcv/GdcvPageHeading"
import { GdcvPerformanceView } from "@/components/gdcv/GdcvPerformanceView"
import { resolveDashboardContext, type DashboardContext } from "@/lib/api/dashboard-context"
import { UnauthorizedError } from "@/lib/api/client"
import { listEnergia, listEnergiaDiaria } from "@/lib/api/energia"
import { listSocios } from "@/lib/api/socios"
import { getConsolidadoMedidorPrincipal } from "@/lib/api/medidor-principal"
import type { RegistroDimmsMesActual, RegistroDimmsPorPeriodo } from "@/lib/energia-comparativa"
import type { RegistroEnergiaDiario, RegistroEnergiaMensual, Socio } from "@/lib/api/types"

interface GdcvPerformancePageProps {
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
 * error del gráfico (igual criterio que app/gdd/performance/page.tsx).
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
 * página, solo el estado de error de la tabla de socios.
 */
async function loadSocios(parqueId: string): Promise<{ socios: Socio[] | null }> {
  try {
    const socios = await listSocios(parqueId)
    return { socios }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    return { socios: null }
  }
}

/**
 * Igual criterio que loadRegistrosEnergia: una falla acá no debe tumbar la
 * página, solo el estado de la card KPI comparativa. 404 (sin medidor
 * principal configurado) es una condición de negocio, distinta de un fallo
 * transitorio — ver contracts/medidor-principal-consolidado.md.
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
 * por llamada (ver research.md Decision 2) — se pide uno por mes visible en
 * el rango de gráfico (acotado a los últimos 12 meses de registrosEnergia),
 * en paralelo. Cada período fallido individualmente queda como `dato: null`
 * (mismo tratamiento que "sin datos" para ese punto del gráfico).
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

export default async function GdcvPerformancePage({ searchParams }: GdcvPerformancePageProps) {
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
    { socios },
    registroDimmsMesActual,
  ] = await Promise.all([
    loadRegistrosEnergia(context.parque.id),
    loadRegistrosEnergiaDiaria(context.parque.id, periodoActual),
    loadSocios(context.parque.id),
    loadRegistroDimmsMesActual(context.parque.id, periodoActual),
  ])

  const registrosDimmsPorRango = await loadRegistrosDimmsPorRango(context.parque.id, registrosEnergia)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <GdcvPageHeading />
      <GdcvPerformanceView
        parque={context.parque}
        registrosEnergia={registrosEnergia}
        registrosEnergiaDiaria={registrosEnergiaDiaria}
        periodoActual={periodoActual}
        socios={socios}
        registroDimmsMesActual={registroDimmsMesActual}
        registrosDimmsPorRango={registrosDimmsPorRango}
      />
    </div>
  )
}
