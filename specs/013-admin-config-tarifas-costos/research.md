# Research: Configuración de administrador

| # | Tema | Decisión | Motivo | Alternativas |
|---|---|---|---|---|
| 1 | Detectar `HINS_ADMIN` | `getMe()` en layouts/páginas de servidor; pasar `role` por props a sidebars | Token en cookie httpOnly, `lib/api` es server-only; `getMe()` ya existe y no se usa | Leer JWT en cliente (imposible, httpOnly); `proxy.ts` global (más alcance, auth aún no cubierta) |
| 2 | Protección por URL | `requireAdmin()` en cada página + 403 del backend | Mínimo, testable, consistente con `redirect("/login")` existente | Middleware global |
| 3 | Paginación | Servidor, `page`/`limit` en query; links vía `ui/pagination.tsx` (hoy sin uso) | Backend ya devuelve `{items,total,page,limit}` (límite 1–100, default 20); evita traer todo | `getPaginationRowModel` de TanStack (cliente, como `SociosTable`) — no escala con el contrato |
| 4 | Formularios | `useState` + validador puro por entidad, igual a `getSocioFormValidationError` | Patrón existente; sin deps nuevas; testeable | react-hook-form + zod (viola V) |
| 5 | Confirmación de borrado | `ConfirmDeleteDialog` sobre `ui/dialog` | `alert-dialog` no existe; Dialog alcanza | Agregar Radix AlertDialog |
| 6 | Selects | `SelectField` sobre `<select>` nativo con estilos de `Input` | No existe `ui/select`; accesible por defecto | Radix Select |
| 7 | Feedback de éxito/error | Mensaje inline en el diálogo + `router.refresh()`; sin toasts | No hay sonner; patrón de `CreateSocioDialog` | Agregar sonner |
| 8 | Decimales | `toNumber()` en `lib/api/paginated.ts` al mapear respuestas | Prisma serializa Decimal como string (ver `medidor-principal.ts`) | Confiar en el tipo de swagger |
| 9 | Menú dirigido por datos | `lib/admin-nav.ts` + `SidebarNav` único | Hoy 4 sidebars duplican el map; FR-013 | Copiar ítems en cada sidebar |
| 10 | Mutaciones | Helper plano `runCrudAction(fn, revalidate)` en `lib/crud-action.ts` + actions `"use server"` de una línea por entidad | Mismo shape que `createSocioAction`; una sola implementación de try/catch/UnauthorizedError; las Server Actions no admiten closures de fábrica | Fábrica de actions (no registrable) |
| 11 | Selector de parque (Costos) | `listParquesByProyecto(proyectoId)`; columna "Parque" cruzando ids con ese listado | `CostoResponseDto` no trae nombre; no hay `GET /parques` global | Pedir cambio de backend |
| 12 | Moneda/Unidad | `MONEDAS=[ARS,USD]` fija; `UNIDADES_SUGERIDAS` vía `<datalist>`; tipo de cambio `unidad` fija `ARS/USD` | FR-015; backend acepta texto libre | — |
| 13 | Advertencia de impacto | `warning` en `ConfirmDeleteDialog` y `editWarning` en `ResourceFormDialog` | FR-016 | — |
| 15 | Éxito y acceso denegado | Aviso inline de éxito sobre la tabla; no admin → redirect `/main`; sesión expirada → `/login` | FR-011, FR-012 | Toasts (sin dependencia) |
| 14 | Códigos de error | `apiFetch` solo expone `message`; se muestra tal cual (409/400/403) | Suficiente para escenarios 7 y 2 (mensaje del backend + validación previa en cliente) | Exponer `status` en el error (cambio mayor en client) |

Sin `NEEDS CLARIFICATION` pendientes.
