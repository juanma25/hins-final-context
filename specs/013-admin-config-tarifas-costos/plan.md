# Implementation Plan: Configuración de administrador (Tarifas, Tipos de cambio y Costos)

**Branch**: `013-admin-config-tarifas-costos` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

## Summary

Tres pantallas CRUD (Tarifas, Tipos de cambio, Costos) solo para `HINS_ADMIN`, construidas sobre **un único conjunto de piezas genéricas**: lista paginada del servidor, diálogo de formulario dirigido por configuración, diálogo de confirmación de borrado, helper de paginación en `lib/api` y fábrica de server actions. Cada entidad solo aporta: columnas, campos, validador puro y módulo de acceso a datos. El menú pasa a ser dirigido por datos (una función que decide ítems según contexto y rol), con lo que Tarifas/Tipos de cambio aparecen en el sidebar global y Costos en los tres sidebars de parque.

## Technical Context

**Language/Version**: TypeScript estricto, Next.js App Router (React Server Components + Server Actions)

**Primary Dependencies**: shadcn/Radix existentes (`dialog`, `table`, `pagination`, `button`, `input`, `label`), `lucide-react`. **Sin dependencias nuevas** (ni react-hook-form ni zod; constitución V)

**Storage**: Backend REST (`HINS_API_BASE_URL`), contrato en `http://localhost:3000/docs-json`; sin base local

**Testing**: Vitest 4, entorno node; tests de funciones puras, módulos `lib/api` y server actions (patrón de `tests/lib/api/*`, `tests/app/gdcv/socios-actions.test.ts`)

**Target Platform**: Web (desktop primero, responsive)

**Project Type**: web-app (Next.js monolito frontend/BFF)

**Performance Goals**: 20 filas/página, cambio de página < 2 s (SC-003); paginación del lado servidor

**Constraints**: roles vía `GET /usuarios/me`; el token vive en cookie httpOnly (`hins_session`), así que rol y fetch solo en servidor; `apiFetch` devuelve `null` en 204 y 404

**Scale/Scope**: 3 entidades, ≤ 1.000 registros cada una, 4 sidebars, ~6 rutas

## Constitution Check

| Principio | Estado | Cómo se cumple |
|---|---|---|
| I Type safety | ✅ | Tipos únicos por entidad en `lib/api/types.ts`; coerción de Decimal (string→number) en el borde de `lib/api`; sin `any` |
| II Server/Client | ✅ | Páginas = Server Components que leen `searchParams` y llaman `lib/api`; mutaciones por Server Actions; client solo para tabla interactiva y diálogos |
| III Test-first | ✅ | Validadores, paginación, builders de menú, módulos API y actions con tests antes de implementar |
| IV UI consistente | ✅ | Todo patrón repetido (lista, form, confirmación, selector) es componente compartido; tokens y primitivas existentes |
| V Simplicidad | ✅ | Sin deps nuevas; confirmación sobre `Dialog` existente; `<select>` nativo estilizado en vez de sumar Radix Select |

Re-evaluación post-diseño: sin violaciones. Complexity Tracking vacío.

## Project Structure

### Documentation

```text
specs/013-admin-config-tarifas-costos/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── backend-endpoints.md
│   └── shared-components.md
└── tasks.md            # /speckit-tasks
```

### Source Code

```text
lib/api/
├── paginated.ts            # PaginatedResponse<T>, buildQuery(), toNumber() — compartido por las 3 listas
├── tarifas.ts              # list/create/update/remove
├── costos.ts
├── tipos-cambio.ts
├── guards.ts               # requireAdmin(): getMe() + redirect (server-only)
└── types.ts                # + Tarifa, Costo, TipoCambio y DTOs

lib/
├── admin-nav.ts            # buildMainNav(role), buildParkNav(modelo, proyectoId, role) — fuente única de menús
├── admin-validation.ts     # validadores puros por entidad (tarifa, costo, tipo de cambio) + validatePeriodo
└── admin-options.ts        # MONEDAS, TIPOS_COSTO, PERIODICIDADES, TIPOS_CAMBIO, UNIDADES_SUGERIDAS

components/admin/           # piezas genéricas, reutilizadas por las 3 entidades
├── PaginatedTable.tsx      # tabla + estados vacío/error + PaginationControls + columna de acciones
├── PaginationControls.tsx  # sobre components/ui/pagination.tsx, usa ?page=
├── ResourceFormDialog.tsx  # diálogo crear/editar dirigido por array de campos + validador; prop editWarning; aviso de éxito inline
├── ConfirmDeleteDialog.tsx # sobre ui/dialog, prop `warning`
├── FormField.tsx / SelectField.tsx
├── ListFilters.tsx         # filtros por searchParams (tipo de cambio)
└── EntityCrudView.tsx      # compone tabla + crear + editar + borrar; recibe config de entidad

lib/crud-action.ts          # helper plano runCrudAction(fn, revalidatePath) → {entidad?, error?}; maneja UnauthorizedError. Las actions "use server" por entidad son wrappers de una línea
app/main/tarifas/{page.tsx,actions.ts}
app/main/tipos-cambio/{page.tsx,actions.ts}
app/actions/costos.ts      # actions de costos (revalida las 3 rutas /costos)
app/{gdd,gdc,gdcv}/costos/page.tsx   # 3 wrappers finos sobre un único CostosView
components/{tarifas,tipos-cambio,costos}/*Config.tsx  # columnas + campos de cada entidad

components/layout/
├── SidebarNav.tsx          # render único de ítems (reemplaza el map duplicado en Main/Gdd/Gdc/Gdcv)
└── {Main,Gdd,Gdc,Gdcv}Sidebar.tsx  # reciben `role`, usan buildXNav + SidebarNav

tests/lib/{admin-nav,admin-validation}.test.ts
tests/lib/api/{paginated,tarifas,costos,tipos-cambio,guards}.test.ts
tests/app/{main,actions}/*actions.test.ts
tests/lib/crud-action.test.ts
```

**Structure Decision**: monolito Next.js existente. Se reutiliza `lib/api` + server actions como en socios; la novedad es la capa `components/admin/` genérica y `lib/admin-nav.ts` como fuente única de menú.

## Key Design Decisions (ver research.md)

1. **Rol**: layouts de servidor llaman `getMe()` y pasan `role` a los shells/sidebars; `requireAdmin()` protege cada página (FR-012). El backend ya responde 403 como defensa final.
2. **Rutas**: `/main/tarifas`, `/main/tipos-cambio` (dentro del shell global) y `/{gdd,gdc,gdcv}/costos?proyectoId=` (wrapper fino sobre un solo `CostosView`).
3. **`proyectoId` en el menú**: `buildParkNav` agrega `?proyectoId=` a todos los hrefs (hoy se pierde al navegar).
4. **Paginación**: servidor, `?page=&limit=20`, links `<a>` de `ui/pagination`; al borrar el último de una página se redirige a la anterior.
5. **Borrado**: 204/404 llegan como `null`; se trata como éxito idempotente. Conflictos (409) usan el mensaje del backend.
6. **Acciones**: `"use server"` no admite closures de una fábrica; se usa `runCrudAction` (helper plano) y actions explícitas por entidad.
7. **Acceso denegado**: no admin → `redirect("/main")`.
8. **Estado de tarifa**: `estado` del backend (`HISTORICA|VIGENTE|FUTURA`) oculta acciones en históricas y bloquea `vigenteDesde` salvo en FUTURA.
9. **GDCV layout** hoy es client: se separa un wrapper servidor que resuelve el rol.
