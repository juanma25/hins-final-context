# Data Model

Tipos únicos en `lib/api/types.ts`. Los valores numéricos se coaccionan a `number` en el borde.

## Tarifa (versión)
`id`, `nombre`, `valorEnergia ≥ 0`, `valorInyeccion ≥ 0`, `unidad` (sugerida, libre), `vigenteDesde` (YYYY-MM-DD), `vigenteHasta: string|null`, `estado: HISTORICA|VIGENTE|FUTURA`.
- Crear: todos menos `vigenteHasta`/`estado`/`id`. Mismo `nombre` ⇒ nueva versión; `vigenteDesde` posterior a la última.
- Editar: `valorEnergia`, `valorInyeccion`, `unidad`; `vigenteDesde` solo si `FUTURA`, > hoy y entre vecinas. `nombre` inmutable.
- Acciones editar/borrar: solo `VIGENTE` y `FUTURA`.

## TipoCambio
`id`, `tipo: PROYECTO|REAL`, `periodicidad: DIARIA|MENSUAL|ANUAL`, `periodo`, `valor > 0`, `unidad: "ARS/USD"`.
- Regla: `periodo` DIARIA `AAAA-MM-DD`, MENSUAL `AAAA-MM`, ANUAL `AAAA` (`validatePeriodo`).
- Único por (periodo, periodicidad, tipo): 409 del backend.
- Filtros de lista: `tipo`, `periodicidad`.

## Costo
`id`, `proyectoId`, `parqueId`, `concepto`, `tipoCosto: FIJO|VARIABLE`, `valor ≥ 0`, `moneda ∈ {ARS,USD}`, `unidad`.
- `parqueId` debe pertenecer a `proyectoId` (selector acotado; 400 del backend como respaldo).
- Lista filtrada por `proyectoId`; columna Parque resuelta con los parques del proyecto.

## Genéricos
- `PaginatedResponse<T> = { items: T[]; total: number; page: number; limit: number }`
- `ActionResult<T> = { entidad?: T; error?: string }`
- `NavItem = { title: string; href: string; icon: LucideIcon }`
- `EntityConfig<T, F>` ver [contracts/shared-components.md](contracts/shared-components.md)
