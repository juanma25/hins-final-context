"use client"

import { useMemo, useState } from "react"

import { NewProjectDialog } from "@/components/main/NewProjectDialog"
import { ProjectCard } from "@/components/main/ProjectCard"
import { Button } from "@/components/ui/button"
import { TabsForBlocks } from "@/components/ui/tabs-for-blocks"
import type { ModeloNegocio, Proyecto } from "@/lib/api/types"
import { DownloadIcon, PlusCircleIcon } from "lucide-react"

const PROJECT_FILTER_TABS = [
  { value: "todos", label: "Todos" },
  { value: "GDCV", label: "GDCV" },
  { value: "GDD", label: "GDD" },
  { value: "GDC", label: "GDC" },
] as const

type ProjectFilter = (typeof PROJECT_FILTER_TABS)[number]["value"]

interface ProjectsViewProps {
  initialProyectos: Proyecto[]
}

export function ProjectsView({ initialProyectos }: ProjectsViewProps) {
  const [filter, setFilter] = useState<ProjectFilter>("todos")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)

  const visibleProyectos = useMemo(() => {
    if (filter === "todos") return initialProyectos
    return initialProyectos.filter((p) => p.modelo === (filter as ModeloNegocio))
  }, [initialProyectos, filter])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Proyectos
        </h1>
        <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-4 sm:w-auto sm:gap-6">
          <TabsForBlocks
            className="min-w-0 flex-1 sm:flex-initial"
            tabs={[...PROJECT_FILTER_TABS]}
            value={filter}
            onValueChange={(v) => setFilter(v as ProjectFilter)}
          />
          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <Button
              type="button"
              variant="default"
              size="default"
              className="gap-1.5 shadow-xs"
              aria-label="Crear nuevo proyecto"
              onClick={() => setShowNewProjectDialog(true)}
            >
              <PlusCircleIcon className="size-4" aria-hidden />
              Nuevo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shadow-xs"
              aria-label="Exportar"
            >
              <DownloadIcon className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {visibleProyectos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProyectos.map((proyecto) => (
            <ProjectCard key={proyecto.id} proyecto={proyecto} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-white">
          <p className="text-sm text-muted-foreground">
            {initialProyectos.length === 0
              ? "Todavía no hay proyectos creados."
              : "No hay proyectos para este filtro."}
          </p>
        </div>
      )}

      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
      />
    </div>
  )
}
