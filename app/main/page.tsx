import { redirect } from "next/navigation"
import { ProjectsView } from "@/components/main/ProjectsView"
import { listProyectos } from "@/lib/api/proyectos"
import { UnauthorizedError } from "@/lib/api/client"
import type { Proyecto } from "@/lib/api/types"

async function loadProyectos(): Promise<Proyecto[]> {
  try {
    return await listProyectos()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login")
    }
    throw error
  }
}

export default async function MainPage() {
  const proyectos = await loadProyectos()
  return <ProjectsView initialProyectos={proyectos} />
}
