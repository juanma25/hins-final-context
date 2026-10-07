# Implementation Plan: Layout Contenido del Diálogo de Histórico de Socio

**Branch**: `011-socio-historico-dialog-layout` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-socio-historico-dialog-layout/spec.md`

## Summary

`SocioHistoricoDialog` hoy usa `DialogContent className="sm:max-w-[600px]"` sin límite de alto ni `overflow`, así que el contenido (tres tablas potencialmente largas) crece sin control y rompe el layout de la página (según el screenshot del usuario). Se aplica el patrón ya existente en el repo para diálogos con contenido largo (`TermsAndConditionsDialog.tsx`: `DialogContent` con `flex max-h-[...] flex-col overflow-hidden`, header flush, body scrollable vía `DIALOG_BODY_SCROLL`), ampliando el ancho máximo del diálogo, y además dando a **cada una** de las tres tablas su propio contenedor con `max-h` + `overflow-y-auto overflow-x-auto` (scroll independiente por sección, FR-003/FR-004), en vez de un único scroll de body como en `TermsAndConditionsDialog`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js App Router (React 19)

**Primary Dependencies**: shadcn `Dialog` (`components/ui/dialog.tsx`), utilidades ya existentes en `lib/dialog-layout.ts` (`DIALOG_BODY_SCROLL`, `DIALOG_HEADER_FLUSH`), Tailwind CSS

**Storage**: N/A — sin cambios de datos ni de contratos de API

**Testing**: Sin lógica nueva de negocio (es CSS/layout puro) — Constitution Principio III exime componentes de presentación pura; se valida con `npx tsc --noEmit`/lint (sin regresiones) y verificación manual (quickstart.md), no se agregan tests unitarios nuevos.

**Target Platform**: Web — mismo diálogo (`components/gdcv/SocioHistoricoDialog.tsx`)

**Project Type**: Web application (mismo proyecto Next.js único)

**Performance Goals**: N/A — cambio puramente visual, sin impacto de performance.

**Constraints**: Reusar el patrón de layout ya establecido en el repo (`TermsAndConditionsDialog.tsx` + `lib/dialog-layout.ts`) en vez de inventar uno nuevo (Principio V); no cambiar el comportamiento de datos/consulta ya corregido en la feature 010.

**Scale/Scope**: Cambios acotados a `components/gdcv/SocioHistoricoDialog.tsx` (estructura y clases de `DialogContent`/secciones); sin cambios en `lib/dialog-layout.ts` salvo que se necesite una constante nueva reutilizable para "scroll de sección" (a decidir en Phase 1 si aplica a más de un consumidor).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — sin cambios de tipos/datos.
- **II. Component & Server/Client Boundary Discipline**: PASS — sin cambios de fetching; se reutilizan primitivas `Dialog`/`Table` ya existentes en vez de duplicar.
- **III. Test-First for Data & Business Logic**: N/A — cambio puramente de presentación (CSS/estructura), sin lógica de negocio nueva; exento por la cláusula de "componentes de presentación pura" del Principio III.
- **IV. Consistent, Accessible UI**: PASS — reutiliza tokens/patrones ya definidos (`lib/dialog-layout.ts`) en vez de valores ad-hoc; mantiene contraste y foco accesibles del `Dialog` existente.
- **V. Simplicity & Reviewable Change**: PASS — reutiliza el patrón de scroll ya usado en `TermsAndConditionsDialog.tsx`; no se introduce una librería de virtualización ni un sistema de layout nuevo para un problema ya resuelto en el repo con CSS.

No violations. Complexity Tracking no aplica.

## Project Structure

### Documentation (this feature)

```text
specs/011-socio-historico-dialog-layout/
├── plan.md
├── research.md
├── data-model.md      # N/A — se omite (sin entidades de datos nuevas)
├── quickstart.md
├── contracts/         # N/A — se omite (sin contratos de interfaz nuevos)
└── tasks.md
```

### Source Code (repository root)

```text
components/
└── gdcv/
    └── SocioHistoricoDialog.tsx   # DialogContent más grande + contenido con overflow-hidden; cada tabla envuelta en su propio scroll contenedor

lib/
└── dialog-layout.ts               # posible constante nueva para "scroll de sección" si aplica a más de un lugar (evaluado en Phase 1)
```

**Structure Decision**: Un solo archivo de componente cambia de estructura interna; no se agregan archivos nuevos salvo, potencialmente, una constante compartida en `lib/dialog-layout.ts` si el patrón de "scroll por sección" resulta reutilizable (se decide en el diseño, Phase 1).

## Complexity Tracking

*No violations — sección no aplica.*
