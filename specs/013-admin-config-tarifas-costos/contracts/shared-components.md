# Contratos de componentes/helpers compartidos

```ts
// lib/api/paginated.ts
type PaginatedResponse<T> = { items: T[]; total: number; page: number; limit: number }
buildQuery(params: Record<string, string|number|undefined>): string   // omite vacíos
toNumber(v: unknown): number
parsePage(sp: string|undefined): number                                // ≥1
clampPage(page: number, total: number, limit: number): number          // retrocede si la página queda vacía

// lib/admin-nav.ts  (única fuente de menús)
buildMainNav(role: UsuarioRole): NavItem[]                             // Proyectos (+ Tarifas, Tipos de cambio si HINS_ADMIN)
buildParkNav(modelo: ModeloNegocio, proyectoId: string, role: UsuarioRole): NavItem[]
                                                                       // Performance, ROI, Mantenimiento (+ Costos si HINS_ADMIN); hrefs con ?proyectoId

// components/admin
type FieldDef<F> = { name: keyof F; label: string; kind: "text"|"number"|"date"|"select"|"datalist";
                     options?: readonly {value:string;label:string}[]; disabled?: (mode, row?) => boolean }
type ColumnDef<T> = { header: string; cell: (row: T) => ReactNode }
type EntityConfig<T, F> = {
  title: string; createLabel: string
  columns: ColumnDef<T>[]
  fields: FieldDef<F>[]
  validate(form: F, mode: "create"|"edit"): string | null              // función pura testeable
  toForm(row: T): F
  canMutate?(row: T): boolean                                          // p.ej. tarifa no histórica
  deleteWarning?: string                                               // FR-016
  editWarning?: string                                                 // FR-016
}
<EntityCrudView config page total items actions filters? />            // compone todo
// app/actions/crud.ts
// lib/crud-action.ts
runCrudAction<T>(fn: () => Promise<T|null>, revalidate: string|string[]): Promise<ActionResult<T>>   // UnauthorizedError → redirect('/login')
// cada entidad: export async function createXAction(dto){ "use server"; return runCrudAction(() => createX(dto), '/ruta') }
```
