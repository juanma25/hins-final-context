# Research: Alta y listado real de Socios GDCV

## Contexto de partida

Auditoría del estado real (no asumido) antes de research:

| Pieza | Estado actual |
|---|---|
| `GET /parques/{parqueId}/socios` | **Ya implementado** en `lib/api/socios.ts` (`listSocios`) — sin uso en ninguna vista todavía |
| `POST /parques/{parqueId}/socios` | **Ya implementado** en `lib/api/socios.ts` (`createSocio`) — sin uso en ninguna vista todavía |
| Tipos `Socio`/`CreateSocioDto` | Ya en `lib/api/types.ts` — completos y ya alineados al contrato |
| Tabla "Socios del Parque" | 100% mock — `SociosTable` recibe `data: SocioRow[]` desde `sociosMock` (`data/gdcv-mock.ts`) vía `GdcvPerformanceView` |
| Botón "Nuevo Socio" | Existe visualmente (`SociosTable.tsx:358-366`), sin `onClick` — no hay modal ni formulario |

Conclusión: el gap es puramente de UI — capa de datos (contrato + funciones de fetch)
ya construida en una feature anterior no documentada explícitamente para socios, solo
falta consumirla.

## Decision 1: Reutilizar el patrón Dialog + Server Action de `NewProjectDialog`/`createProyectoAction`, no crear uno nuevo

**Decision**: `CreateSocioDialog` replica exactamente la estructura de
`components/main/NewProjectDialog.tsx`: `useState` para el form, validación manual
antes de habilitar el botón "Crear", `useTransition` + Server Action, `router.refresh()`
+ cierre del modal en éxito, mensaje de error inline en fallo (sin cerrar el modal, sin
perder los datos ingresados — cumple FR-006).

**Rationale**: Es el único patrón de creación de entidad que existe en el repo. Crear
un segundo patrón (por ejemplo con una librería de formularios) violaría el Principio V
(Simplicidad) sin beneficio — no hay problema nuevo que justifique una abstracción
distinta.

**Alternatives considered**:
- Introducir `react-hook-form` + `zod` — rechazado: no está en `package.json`, y
  agregar una dependencia nueva para un formulario de 4 campos no está justificado
  (Constitution → "Dependencies MUST NOT be added for functionality achievable with
  existing project dependencies").
- Fetch client-side directo a `/parques/{id}/socios` desde `CreateSocioDialog` (sin
  Server Action) — rechazado: violaría el Principio II (mutaciones deben pasar por
  Server Action/Route Handler, no fetch directo desde el cliente a un endpoint interno
  propio) y rompería paridad con el único precedente existente.

## Decision 2: Fetch de `listSocios` en el Server Component de la página, no en el cliente

**Decision**: `app/gdcv/performance/page.tsx` agrega un `loadSocios(parqueId)` con el
mismo criterio de aislamiento de errores que `loadRegistrosEnergia`/
`loadRegistrosEnergiaDiaria` (introducidos en `005-gdcv-backend-charts`): una falla acá
no tumba la página completa, solo produce el estado de error de la tabla. El resultado
se pasa a `GdcvPerformanceView` → `SociosTable` por props.

**Rationale**: Consistencia total con el patrón ya usado y ya revisado para energía en
005 — mismo Server Component, mismo criterio de `null` = error vs `[]` = vacío, mismo
manejo de `UnauthorizedError` → `redirect("/login")`.

**Alternatives considered**:
- Fetch dentro de `GdcvPerformanceView` (client) con `useEffect` — rechazado: mismo
  argumento que Decision 1, y además perdería el paralelismo ya establecido
  (`Promise.all` junto a energía) para el fetch inicial de la página.

## Decision 3: `router.refresh()` como mecanismo de actualización tras el alta

**Decision**: Tras un `createSocio` exitoso, `CreateSocioDialog` llama
`router.refresh()` (igual que `NewProjectDialog`). Esto re-ejecuta el Server Component
`app/gdcv/performance/page.tsx`, que vuelve a llamar `listSocios(parqueId)` y baja el
array actualizado por props — sin necesidad de estado local duplicado en el cliente ni
de splicing manual de la lista.

**Rationale**: Es exactamente el mecanismo ya usado y aceptado para proyectos; no hay
motivo para introducir estado cliente-only (que se desincronizaría con la fuente real
apenas otro usuario cree un socio) cuando ya existe un mecanismo de re-fetch server-side
funcional en el repo. También resuelve el edge case de spec.md sobre altas casi
simultáneas de dos usuarios: cada refresh vuelve a pedir el estado real, no cuenta
localmente.

**Alternatives considered**:
- Actualización optimista en estado local del array de socios — rechazado: added
  complexity y riesgo de divergencia de datos (violación de Principio V) sin beneficio
  medible dado que SC-001 (<1 min para completar el alta) no depende de una UI
  optimista, solo de que el flujo sea fluido.

## Decision 4: Mapeo `Socio` → `SocioRow` con degradación explícita de columnas fuera de alcance

**Decision**: Se crea `lib/socio-presentation.ts` con `mapSocioToRow(socio: Socio): SocioRow`
y `TIPO_CARGO_LABELS: Record<TipoCargo, string>` (`{ CON_POTENCIA: "Con Potencia",
SIN_POTENCIA: "Sin Potencia" }`). El mapeo puebla `id`, `nombre`, `medidor`
(= `medidorNumero`), `participacion` (= `${participacionPorcentaje}%`), y usa
`tipo: undefined` salvo que el backend indique explícitamente un socio "Virtual" (no
existe ese campo en `Socio` — se omite, ver Key Entities). Los campos
`potenciaAsociada`, `energiaGenerada`, `ahorroGenerado` — sin equivalente en el
contrato — se completan con un valor placeholder explícito (`"—"`) en vez de
inventar un número, y `medidores` (multi-medidor) queda siempre `undefined` (un socio
= un medidor, según el contrato real).

**Rationale**: Igual criterio ya aplicado en `005-gdcv-backend-charts` Decision 3 para
KPIs sin equivalente backend — no inventar datos, mostrar la ausencia explícitamente.
Aísla el degradado en un único punto (`socio-presentation.ts`) en vez de esparcir
condicionales en `SociosTable`/`GdcvPerformanceView`.

**Alternatives considered**:
- Quitar esas columnas de la tabla directamente — rechazado por alcance: cambiar el
  layout de la tabla es una decisión de producto que el spec no pide explícitamente
  (el pedido es "que la tabla venga del endpoint", no "rediseñar columnas"); mantener
  las columnas con `"—"` preserva el layout visual mientras dice la verdad sobre los
  datos, y deja la decisión de quitarlas para una iteración de UX separada si se pide.

## Resueltas: NEEDS CLARIFICATION del Technical Context

Ninguna quedó pendiente.
