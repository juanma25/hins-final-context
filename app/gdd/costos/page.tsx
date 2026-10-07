import { CostosView } from "@/components/costos/CostosView"

export default function CostosPage(props: { searchParams: Promise<{ proyectoId?: string; page?: string }> }) {
  return <CostosView searchParams={props.searchParams} />
}
