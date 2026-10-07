---
description: "Task list for Configuración de administrador (Tarifas, Tipos de cambio y Costos)"
---

# Tasks: Configuración de administrador (Tarifas, Tipos de cambio y Costos)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Incluidos. La constitución (III) exige test-first para lógica de datos/validación. Escribir cada test y verlo fallar antes de implementar. Los componentes de presentación quedan exentos.

**Format**: `- [ ] T### [P?] [US?] Descripción con ruta`. `[P]` = archivos distintos, sin dependencia pendiente.

## Phase 1: Setup

- [X] T001 Agregar tipos `Tarifa`, `TarifaEstado`, `Costo`, `TipoCosto`, `TipoCambio`, `Periodicidad`, `TipoCambioTipo` y DTOs de create/update en `lib/api/types.ts`
- [X] T002 [P] Crear `lib/admin-options.ts` con `MONEDAS` (ARS, USD), `TIPOS_COSTO`, `PERIODICIDADES`, `TIPOS_CAMBIO`, `UNIDADES_SUGERIDAS` (única fuente, FR-015)

## Phase 2: Foundational (bloquea todas las historias)

**Tests primero (deben fallar)**

- [X] T003 [P] Test de `buildQuery`, `toNumber`, `parsePage`, `clampPage` en `tests/lib/api/paginated.test.ts`
- [X] T004 [P] Test de `buildMainNav(role)` y `buildParkNav(modelo, proyectoId, role)` (admin vs no admin, conserva `?proyectoId`) en `tests/lib/admin-nav.test.ts`
- [X] T005 [P] Test de `requireAdmin()` (admin pasa; otro rol redirige a `/main`; `UnauthorizedError` redirige a `/login`) en `tests/lib/api/guards.test.ts`
- [X] T006 [P] Test de `runCrudAction` (éxito, `null`, error con mensaje reenviado, `UnauthorizedError` → redirect `/login`, remove `null` = éxito, `revalidatePath`) en `tests/lib/crud-action.test.ts`

**Implementación**

- [X] T007 [P] Crear `lib/api/paginated.ts` (`PaginatedResponse<T>`, `buildQuery`, `toNumber`, `parsePage`, `clampPage`)
- [X] T008 [P] Crear `lib/admin-nav.ts` (`NavItem`, `buildMainNav`, `buildParkNav`) como fuente única de menús
- [X] T009 [P] Crear `lib/api/guards.ts` con `requireAdmin()` usando `getMe()` de `lib/api/usuarios.ts` y `redirect`
- [X] T010 Crear `lib/crud-action.ts` con `runCrudAction(fn, revalidate)` devolviendo `{entidad?, error?}`, manejando `UnauthorizedError` (helper plano; las actions `"use server"` por entidad lo envuelven)
- [X] T011 [P] Crear `components/admin/FormField.tsx` y `components/admin/SelectField.tsx` (`<select>` nativo con estilos de `components/ui/input.tsx`, `label` asociado con `htmlFor`)
- [X] T012 [P] Crear `components/admin/ConfirmDeleteDialog.tsx` sobre `components/ui/dialog.tsx` (prop `warning`, estado pendiente)
- [X] T013 [P] Crear `components/admin/PaginationControls.tsx` sobre `components/ui/pagination.tsx` usando `?page=` y conservando otros params
- [X] T014 Crear `components/admin/PaginatedTable.tsx` (tabla `components/ui/table.tsx`, estado vacío/error con "Reintentar", columna de acciones editar/borrar, `PaginationControls`) siguiendo el estilo de `components/gdcv/SociosTable.tsx` (depende de T013)
- [X] T015 Crear `components/admin/ResourceFormDialog.tsx` dirigido por `FieldDef[]` + `validate`, patrón de `components/gdcv/CreateSocioDialog.tsx` (`useTransition`, error inline, prop `editWarning`, reset al cerrar, `router.refresh()`) (depende de T011)
- [X] T016 Crear `components/admin/EntityCrudView.tsx` y tipos `EntityConfig`/`FieldDef`/`ColumnDef` que componen T012, T014, T015, el botón Crear y un aviso inline de éxito tras crear/editar/borrar (FR-011) (depende de T012, T014, T015)
- [X] T017 [P] Crear `components/layout/SidebarNav.tsx` (render único de `NavItem[]`, `isActive`, tooltips) tomando el markup de `components/layout/MainSidebar.tsx`

**Checkpoint**: piezas genéricas listas; T003-T006 en verde.

## Phase 3: US4 — Visibilidad restringida por rol (P1)

**Goal**: solo `HINS_ADMIN` ve y accede a las opciones; los menús cambian según contexto.
**Independent Test**: usuario admin vs no admin: menú global, menú de parque GDD/GDC/GDCV y URL directa.

- [X] T018 [US4] Resolver rol en servidor: `app/main/layout.tsx` y `app/gdd/layout.tsx` llaman `getMe()` y pasan `role` a `MainLayoutShell`/`GddLayoutShell` en `components/layout/`
- [X] T019 [US4] Hacer `app/gdc/layout.tsx` igual que T018 hacia `components/layout/GdcLayoutShell.tsx`
- [X] T020 [US4] Separar `app/gdcv/layout.tsx` (hoy client) en wrapper servidor que resuelve el rol + shell client en `components/layout/GdcvLayoutShell.tsx`, preservando la variante sin sidebar de `/gdcv/socio*`
- [X] T021 [US4] Refactorizar `components/layout/MainSidebar.tsx` para usar `buildMainNav(role)` + `SidebarNav` (agrega Tarifas y Tipos de cambio solo admin)
- [X] T022 [US4] Refactorizar `components/layout/{Gdd,Gdc,Gdcv}Sidebar.tsx` para usar `buildParkNav(modelo, proyectoId, role)` (leer `proyectoId` con `useSearchParams`, dentro de `Suspense`) + `SidebarNav`; agrega Costos solo admin y elimina el `nav` duplicado
- [ ] T023 [US4] Verificar manualmente quickstart escenarios 1, 4 (menú) y 5 con usuario no admin

## Phase 4: US1 — Gestionar Tarifas (P1) 🎯 MVP

**Goal**: CRUD paginado de versiones de tarifa.
**Independent Test**: crear, agregar versión, editar futura, borrar con advertencia, fila histórica sin acciones, paginar.

**Tests primero**

- [X] T024 [P] [US1] Test `validateTarifa` (campos requeridos, valores ≥ 0, fecha `YYYY-MM-DD`, modo edit sin `nombre`) en `tests/lib/admin-validation.test.ts`
- [X] T025 [P] [US1] Test del módulo API de tarifas (paths, query `page/limit/nombre`, coerción de decimales, delete `null`) en `tests/lib/api/tarifas.test.ts`
- [X] T026 [P] [US1] Test de actions de tarifas y de `canMutate` por `estado` en `tests/app/main/tarifas-actions.test.ts`

**Implementación**

- [X] T027 [P] [US1] Crear `lib/admin-validation.ts` con `validateTarifa` (mensajes en español, función pura)
- [X] T028 [US1] Crear `lib/api/tarifas.ts` (`listTarifas`, `createTarifa`, `updateTarifa`, `deleteTarifa`) con `apiFetch` y `buildQuery`
- [X] T029 [US1] Crear `app/main/tarifas/actions.ts` con 3 actions `"use server"` (create/update/remove) que envuelven `runCrudAction` sobre `lib/api/tarifas.ts`
- [X] T030 [P] [US1] Crear `components/tarifas/tarifaConfig.tsx` (`EntityConfig`: columnas incl. `StatusBadge` de `estado`, campos, `toForm`, `canMutate` = no `HISTORICA`, `vigenteDesde` deshabilitado salvo `FUTURA`, `nombre` deshabilitado en edit, `deleteWarning` y `editWarning` FR-016)
- [X] T031 [US1] Crear `app/main/tarifas/page.tsx` (Server Component: `requireAdmin()`, `parsePage`, `listTarifas`, `EntityCrudView`; `UnauthorizedError` → `/login`)
- [X] T032 [US1] Usar `clampPage` en `app/main/tarifas/page.tsx` para retroceder a la página anterior si la actual queda vacía tras borrar (test ya cubierto en T003)
- [ ] T033 [US1] Validar quickstart escenario 2

## Phase 5: US2 — Gestionar Tipos de cambio (P2)

**Goal**: CRUD paginado con filtros tipo/periodicidad.
**Independent Test**: crear MENSUAL `2026-10`, error con `2026`, filtrar, editar, borrar.

- [X] T034 [P] [US2] Test `validatePeriodo` y `validateTipoCambio` (formato por periodicidad, valor > 0) en `tests/lib/admin-validation.test.ts`
- [X] T035 [P] [US2] Test del módulo API de tipos de cambio (filtros `tipo`, `periodicidad`, `desde`, `hasta`) en `tests/lib/api/tipos-cambio.test.ts`
- [X] T036 [P] [US2] Test de actions en `tests/app/main/tipos-cambio-actions.test.ts`
- [X] T037 [P] [US2] Agregar `validatePeriodo`/`validateTipoCambio` a `lib/admin-validation.ts`
- [X] T038 [US2] Crear `lib/api/tipos-cambio.ts`
- [X] T039 [US2] Crear `app/main/tipos-cambio/actions.ts` con 3 actions `"use server"` sobre `runCrudAction`
- [X] T040 [P] [US2] Crear `components/admin/ListFilters.tsx` (filtros por searchParams, reinicia `page`, reutilizable) con `SelectField`
- [X] T041 [P] [US2] Crear `components/tipos-cambio/tipoCambioConfig.tsx` (`unidad` fija `ARS/USD`, `deleteWarning`, `editWarning`)
- [X] T042 [US2] Crear `app/main/tipos-cambio/page.tsx` (`requireAdmin()`, filtros, lista)
- [ ] T043 [US2] Validar quickstart escenario 3

## Phase 6: US3 — Gestionar Costos dentro de un proyecto (P2)

**Goal**: CRUD paginado de costos del proyecto en GDD, GDC y GDCV.
**Independent Test**: en cada tipo de parque, crear/editar/borrar un costo con parque del proyecto.

- [X] T044 [P] [US3] Test `validateCosto` (concepto, tipo, valor ≥ 0, moneda ∈ MONEDAS, parque requerido) en `tests/lib/admin-validation.test.ts`
- [X] T045 [P] [US3] Test del módulo API de costos (filtro `proyectoId`, coerción) en `tests/lib/api/costos.test.ts`
- [X] T046 [P] [US3] Test de actions de costos en `tests/app/actions/costos-actions.test.ts`
- [X] T047 [P] [US3] Agregar `validateCosto` a `lib/admin-validation.ts`
- [X] T048 [US3] Crear `lib/api/costos.ts`
- [X] T049 [US3] Crear `app/actions/costos.ts` con 3 actions `"use server"` sobre `runCrudAction` (revalida `/gdd/costos`, `/gdc/costos`, `/gdcv/costos`)
- [X] T050 [P] [US3] Crear `components/costos/costoConfig.tsx` (parque como `SelectField` con parques del proyecto; columna Parque resuelta por id y parque por defecto = el actual; lista filtrada solo por `proyectoId`; sin warnings)
- [X] T051 [US3] Crear `components/costos/CostosView.tsx` (Server Component: `requireAdmin()`, `proyectoId`, `listCostos`, `listParquesByProyecto`, `EntityCrudView`)
- [X] T052 [P] [US3] Crear wrappers `app/gdd/costos/page.tsx`, `app/gdc/costos/page.tsx`, `app/gdcv/costos/page.tsx` que solo renderizan `CostosView` (falta `proyectoId` → mensaje existente)
- [ ] T053 [US3] Validar quickstart escenario 4

## Phase 7: Polish

- [X] T054 [P] Eliminar código duplicado residual (arrays `nav` antiguos, markup de sidebar repetido) y confirmar con `grep` que no quedan listas/diálogos/confirmaciones ad hoc (FR-013, SC-006)
- [X] T055 [P] Accesibilidad: foco en diálogos, `aria-label` en botones icono, labels asociados, contraste (constitución IV)
- [X] T056 [P] Actualizar comentario desactualizado "endpoint asumido" en `lib/api/parques.ts` y documentar la feature en `BACKEND_INTEGRATION.md`
- [ ] T057 Ejecutar `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` y todo el [quickstart.md](quickstart.md); verificar paginación con ~1.000 registros (SC-003)

## Dependencies & Order

- Setup → Foundational → historias. Foundational bloquea todo.
- US4 y US1 son P1; US1 no necesita US4 para probarse por URL, pero el MVP completo requiere ambas (menú + acceso).
- US2 y US3 dependen solo de Foundational (+ `validation` compartido en T027). US2 y US3 son independientes entre sí.
- `lib/admin-validation.ts` lo editan T027, T037, T047: no paralelizar entre historias sobre ese archivo.

## Parallel Examples

- Foundational: T003-T006 juntos; luego T007, T008, T009, T011, T012, T013, T017.
- US1: T024-T026 juntos; T027 y T030 en paralelo.
- Tras Foundational: una persona en US1 y otra en US3 (archivos distintos salvo validation).

## Implementation Strategy

1. MVP = Setup + Foundational + US4 + US1 (menú, protección, Tarifas completas).
2. Incremento 2: US2 (Tipos de cambio).
3. Incremento 3: US3 (Costos en 3 tipos de parque).
4. Polish y verificación final.
