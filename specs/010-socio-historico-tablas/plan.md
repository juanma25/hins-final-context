# Implementation Plan: Tablas de Histórico por Socio con Campos Específicos

**Branch**: `010-socio-historico-tablas` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-socio-historico-tablas/spec.md`

## Summary

Dos correcciones sobre `SocioHistoricoDialog` (feature 009): (1) el bug raíz de "nunca dispara consulta" es que `components/ui/date-picker.tsx` no soporta `value: undefined` — el diálogo le pasa `desde ?? new Date()`, lo que pre-selecciona visualmente "hoy" en el calendario; `react-day-picker` en `mode="single"` deselecciona (retorna `undefined`) al reclickear un día ya seleccionado, así que si el primer clic del usuario cae justo en la fecha de hoy, `onValueChange` nunca se dispara y el estado nunca se completa (ver research.md). Se corrige extendiendo `DatePicker` para aceptar `value: Date | undefined` de forma honesta. (2) Se reemplaza la vista genérica `JSON.stringify` de cada histórico por tres tablas con columnas específicas (Facturación, Registros, Mediciones — ver data-model.md), tolerando campos ausentes por fila (FR-006).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js App Router (React 19)

**Primary Dependencies**: `react-day-picker` (vía `components/ui/calendar.tsx`/`date-picker.tsx`), shadcn `Table` (ya usado en `SociosTable.tsx`), Vitest

**Storage**: N/A — reutiliza los tres endpoints y Route Handlers ya integrados en la feature 009 (`GET /parques/{parqueId}/socios/{socioId}/{registros|facturacion|mediciones}`), sin cambios en `lib/api/socios-historico.ts` ni en los Route Handlers.

**Testing**: Vitest — se extiende `tests/components/gdcv/SocioHistoricoDialog.test.ts` y se agrega test para el `DatePicker` extendido.

**Target Platform**: Web — mismo diálogo (`components/gdcv/SocioHistoricoDialog.tsx`) abierto desde el botón "Ver histórico" de `SociosTable`.

**Project Type**: Web application (mismo proyecto Next.js único)

**Performance Goals**: Sin cambios — las tres consultas siguen disparándose en paralelo (comportamiento ya correcto de la feature 009); esta feature corrige que el disparo ocurra en absoluto y en cada cambio válido de fecha (FR-001).

**Constraints**: `DatePicker` es un componente compartido (`components/ui/date-picker.tsx`) — el cambio a `value: Date | undefined` no debe romper a otros consumidores existentes del componente (ver research.md, se audita su único otro uso). Los nombres de campo de la API (`ultima_lectura_fecha_hora`, etc.) se muestran tal cual, sin transformación de datos (solo traducción a etiqueta de columna).

**Scale/Scope**: Cambios en `components/ui/date-picker.tsx` (soporte `undefined`), `components/gdcv/SocioHistoricoDialog.tsx` (fix de disparo + tres tablas con columnas específicas), sin cambios en capa de datos/Route Handlers.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Type Safety First**: PASS — se tipan explícitamente las tres filas (`FacturacionRow`, `RegistroRow`, `MedicionRow` o equivalente) leyendo campos de `payload: unknown[]` con guards/casts explícitos y fallback "sin dato" cuando el campo no es del tipo esperado (boundary externo ya reconocido en feature 009).
- **II. Component & Server/Client Boundary Discipline**: PASS — sin cambios en el boundary; se reutilizan los Route Handlers ya existentes.
- **III. Test-First for Data & Business Logic**: APLICA — la función que extrae/mapea cada fila cruda del `payload` a las columnas tipadas (tolerando campos ausentes) es lógica de negocio testeable; se escribe test antes de implementar. El fix de `DatePicker` (soporte `undefined`) también se cubre con test antes de implementar.
- **IV. Consistent, Accessible UI**: PASS — se usa `Table`/`TableHeader`/`TableRow`/`TableCell` ya existentes (mismo patrón que `SociosTable`) en vez de un layout ad-hoc; el trigger de `DatePicker` sin selección muestra un placeholder legible ("Seleccionar fecha") en vez de fabricar una fecha falsa.
- **V. Simplicity & Reviewable Change**: PASS — se corrige el componente compartido existente en vez de crear un `DatePicker` paralelo; las tres tablas usan la misma estructura de columnas fijas por tipo, sin una capa de configuración genérica no solicitada.

No violations. Complexity Tracking no aplica.

## Project Structure

### Documentation (this feature)

```text
specs/010-socio-historico-tablas/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
components/
├── ui/
│   └── date-picker.tsx                  # value: Date | undefined, placeholder cuando no hay selección
└── gdcv/
    └── SocioHistoricoDialog.tsx          # fix de disparo (ya no depende del fallback) + 3 tablas con columnas específicas

tests/
└── components/
    ├── ui/
    │   └── date-picker.test.ts            # nuevo — cubre value: undefined
    └── gdcv/
        └── SocioHistoricoDialog.test.ts   # extendido — mapeo de fila cruda a columnas por tipo
```

**Structure Decision**: Mismo proyecto Next.js único; no se agregan archivos de "capa de datos" nuevos porque no cambia el contrato con el backend (feature 009 ya lo resolvió) — el trabajo es UI (selector de fecha honesto + tablas tipadas).

## Complexity Tracking

*No violations — sección no aplica.*
