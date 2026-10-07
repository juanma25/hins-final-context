# Implementation Plan: Alta y listado real de Socios GDCV

**Branch**: `006-socios-gdcv-crud` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-socios-gdcv-crud/spec.md`

## Summary

`lib/api/socios.ts` (`listSocios`, `createSocio`) and the types `Socio`/`CreateSocioDto`
already exist and already target `GET`/`POST /parques/{parqueId}/socios` — nothing new
to build on the API-client layer. What's missing is entirely on the UI side:
`components/gdcv/SociosTable.tsx` is fed `sociosMock` from `data/gdcv-mock.ts` via
`GdcvPerformanceView`, and its "Nuevo Socio" button (`SociosTable.tsx:358-366`) has no
`onClick` — no modal exists.

The technical approach mirrors the *only* existing create-entity flow in the repo,
`components/main/NewProjectDialog.tsx` + `app/main/actions.ts` (`createProyectoAction`):
a client Dialog with local `useState` form state (no new form library), a `"use server"`
action wrapping `createSocio`, and `router.refresh()` on success to re-pull the Server
Component page (which re-fetches `listSocios`) — same pattern already established for
energía in `005-gdcv-backend-charts` (page fetches, view receives data by props).

The real design work is reconciling the display-only `SocioRow` shape (participación,
potencia asociada, energía generada, ahorro, medidores múltiples) against the basic
`Socio` entity the backend actually returns (nombre, participación %, tipoCargo,
medidorNumero — no energy/savings breakdown, no multi-medidor). Per spec Assumptions,
those extra columns are out of scope for this feature; data-model.md defines exactly
what degrades.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js App Router (existing repo config)

**Primary Dependencies**: React Server/Client Components, Next.js Server Actions
(`"use server"`, `revalidatePath`), `apiFetch` (`lib/api/client.ts`), shadcn `Dialog`
(`components/ui/dialog.tsx`) — no new dependency (no react-hook-form/zod in this repo;
plain controlled inputs, consistent with `NewProjectDialog.tsx`)

**Storage**: N/A (frontend consumer of the existing external REST backend)

**Testing**: Vitest — same conventions as `005-gdcv-backend-charts`
(`vi.mock("@/lib/api/client")`, page-level tests via direct function invocation)

**Target Platform**: Web (Next.js SSR + navegador)

**Project Type**: Web application (single Next.js app; backend is an external service
already consumed via `apiFetch`)

**Performance Goals**: Alta completable en <1 min (SC-001); sin requisito numérico de
throughput nuevo.

**Constraints**: No introducir contrato nuevo — reutilizar
`GET/POST /parques/{parqueId}/socios` tal cual ya expone `lib/api/socios.ts`. No
agregar dependencias de formularios (mantener consistencia con `NewProjectDialog.tsx`).

**Scale/Scope**: Acota a: (1) modal de alta de socio, (2) tabla de socios alimentada
por backend real en la vista de performance de GDCV. Edición/baja de socios, columnas
de energía/ahorro por socio y multi-medidor quedan fuera de alcance (ver data-model.md
Out of Scope).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — reutiliza `Socio`/`CreateSocioDto` ya tipados en
  `lib/api/types.ts`; no `any`. `TipoCargo` se mapea a labels de UI mediante un objeto
  literal tipado (`Record<TipoCargo, string>`), no strings sueltos.
- **II. Component & Server/Client Boundary Discipline**: PASS — el alta se hace vía
  Server Action (`"use server"`), el listado se sigue resolviendo en el Server
  Component `app/gdcv/performance/page.tsx` (mismo patrón ya establecido para energía
  en 005), nunca fetch directo desde el cliente a un endpoint interno propio.
- **III. Test-First for Data & Business Logic**: PASS — el mapeo `Socio` (backend) →
  `SocioRow` (tabla) es lógica de transformación de dominio y requiere tests Red→Green
  antes de implementar, igual criterio que `lib/park-energy-series.ts` en 005.
- **IV. Consistent, Accessible UI**: PASS — reutiliza `Dialog`/`Button`/`Input` de
  shadcn ya existentes, replicando el layout de `NewProjectDialog.tsx` en vez de crear
  un patrón visual nuevo.
- **V. Simplicity & Reviewable Change**: PASS — no se agrega form library ni
  abstracción nueva; se elimina `sociosMock` como fuente de la tabla y se conecta al
  mismo pipeline ya usado por `createProyectoAction`.

No violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-socios-gdcv-crud/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/gdcv/performance/page.tsx       # agrega fetch de listSocios(parqueId), pasa socios por props
app/gdcv/socios/actions.ts          # NUEVO — "use server" createSocioAction(parqueId, dto), espejo de app/main/actions.ts

components/gdcv/CreateSocioDialog.tsx   # NUEVO — Dialog + form, espejo de components/main/NewProjectDialog.tsx
components/gdcv/SociosTable.tsx         # agrega onClick al botón "Nuevo Socio" (abre el dialog), recibe data ya real
components/gdcv/GdcvPerformanceView.tsx # deja de importar sociosMock; recibe socios: Socio[] | null por props

lib/api/socios.ts                # ya existe — listSocios/createSocio reutilizados sin cambios
lib/socio-presentation.ts        # NUEVO — mapSocioToRow(Socio) → SocioRow (transforma, degrada columnas fuera de alcance), TIPO_CARGO_LABELS

tests/lib/socio-presentation.test.ts        # NUEVO — tests del mapeo (Red antes de implementar)
tests/app/gdcv/performance-page.test.ts     # extendido — cubre paso de `socios` por props (ya existe de 005)
```

**Structure Decision**: Se mantiene la misma app Next.js única. Se sigue el patrón ya
usado dos veces en el repo (`NewProjectDialog`/`createProyectoAction` para alta;
`app/gdd/performance/page.tsx` / `app/gdcv/performance/page.tsx` para fetch-en-servidor
+ props) en vez de introducir un tercer patrón.

## Complexity Tracking

*No violations — section not applicable.*
