import Image from "next/image"
import Link from "next/link"

import { Card } from "@/components/ui/card"
import { SoftBadge } from "@/components/ui/soft-badge"
import type { Proyecto } from "@/lib/api/types"
import { getProjectCoverImage, hrefForModelo } from "@/lib/project-presentation"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  proyecto: Proyecto
}

/** Estilo tipo botón secundario sin elemento <button> (evita anidar interactivos dentro de <Link>). */
function AccessCta({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-full items-center justify-center rounded-md border border-input bg-background",
        "text-sm font-medium text-foreground shadow-xs",
        "group-hover/card:border-foreground/20"
      )}
    >
      {label}
    </span>
  )
}

export function ProjectCard({ proyecto }: ProjectCardProps) {
  const href = hrefForModelo(proyecto.modelo, proyecto.id)
  const coverImageUrl = getProjectCoverImage(proyecto)
  const remoteImage = coverImageUrl?.startsWith("http") ?? false

  const inner = (
    <Card className="group/card flex h-full flex-col overflow-hidden p-0 shadow-xs ring-0 transition-shadow cursor-pointer hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {coverImageUrl ? (
          remoteImage ? (
            <Image
              src={coverImageUrl}
              alt={proyecto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={proyecto.nombre}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div
            className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,#e7e5e4_0px,#e7e5e4_8px,#f5f5f4_8px,#f5f5f4_16px)]"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <SoftBadge className="bg-white/95 font-medium shadow-xs">{proyecto.modelo}</SoftBadge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-0 pb-6 px-6">
        <h3 className="text-base font-semibold leading-snug text-foreground m-0">
          {proyecto.nombre}
        </h3>
        <div className="flex-1" />
        <AccessCta label="Acceder" />
      </div>
    </Card>
  )

  return (
    <Link
      href={href}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {inner}
    </Link>
  )
}
