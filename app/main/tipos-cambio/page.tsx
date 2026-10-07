import { TiposCambioView } from "@/components/tipos-cambio/TiposCambioView"
import { PERIODICIDADES, TIPOS_CAMBIO } from "@/lib/admin-options"
import { requireAdmin } from "@/lib/api/guards"
import { loadList } from "@/lib/api/load-list"
import { parsePage } from "@/lib/api/paginated"
import { listTiposCambio } from "@/lib/api/tipos-cambio"
import type { Periodicidad, TipoCambioTipo } from "@/lib/api/types"

const pick = <V extends string>(options: readonly { value: V }[], value: string | undefined): V | undefined =>
  options.find((o) => o.value === value)?.value

export default async function TiposCambioPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tipo?: string; periodicidad?: string }>
}) {
  await requireAdmin()
  const { page, tipo, periodicidad } = await searchParams
  const filters: { tipo?: TipoCambioTipo; periodicidad?: Periodicidad } = {
    tipo: pick(TIPOS_CAMBIO, tipo),
    periodicidad: pick(PERIODICIDADES, periodicidad),
  }
  const list = await loadList((p) => listTiposCambio({ page: p, ...filters }), parsePage(page))

  return (
    <TiposCambioView
      items={list.items}
      page={list.page}
      total={list.total}
      limit={list.limit}
      loadError={list.loadError}
    />
  )
}
