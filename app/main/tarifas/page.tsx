import { TarifasView } from "@/components/tarifas/TarifasView"
import { requireAdmin } from "@/lib/api/guards"
import { loadList } from "@/lib/api/load-list"
import { parsePage } from "@/lib/api/paginated"
import { listTarifas } from "@/lib/api/tarifas"

export default async function TarifasPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin()
  const { page } = await searchParams
  const list = await loadList((p) => listTarifas({ page: p }), parsePage(page))

  return (
    <TarifasView
      items={list.items}
      page={list.page}
      total={list.total}
      limit={list.limit}
      loadError={list.loadError}
    />
  )
}
