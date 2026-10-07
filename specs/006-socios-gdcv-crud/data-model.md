# Data Model: Alta y listado real de Socios GDCV

## Entidades reutilizadas (sin cambios)

### `Socio` (existente, `lib/api/types.ts`)
```ts
interface Socio {
  id: string
  parqueId: string
  nombre: string
  participacionPorcentaje: number
  tipoCargo: TipoCargo        // "CON_POTENCIA" | "SIN_POTENCIA"
  medidorNumero: string
  usuarioId: string | null
}
```
Fuente: `listSocios(parqueId)` → `GET /parques/{parqueId}/socios`.

### `CreateSocioDto` (existente, `lib/api/types.ts`)
```ts
interface CreateSocioDto {
  parqueId: string
  nombre: string
  participacionPorcentaje: number
  tipoCargo: TipoCargo
  medidorNumero: string
}
```
Consumido por: `createSocio(parqueId, dto)` → `POST /parques/{parqueId}/socios`.

## Entidad nueva de presentación

### `SocioRow` (existente en `data/gdcv-mock.ts`, mapeo nuevo hacia ella)
```ts
interface SocioRow {
  id: string
  nombre: string
  medidor: string
  medidores?: MedidorDetalle[]
  participacion: string
  potenciaAsociada: string
  energiaGenerada: string
  ahorroGenerado: string
  tipo?: "Virtual"
}
```

**Mapeo `Socio` → `SocioRow`** (nuevo, `lib/socio-presentation.ts`, función
`mapSocioToRow`):

| `SocioRow` field | Origen | Nota |
|---|---|---|
| `id` | `socio.id` | — |
| `nombre` | `socio.nombre` | — |
| `medidor` | `socio.medidorNumero` | — |
| `participacion` | `` `${socio.participacionPorcentaje}%` `` | — |
| `medidores` | siempre `undefined` | El contrato es 1 socio = 1 medidor (ver Out of Scope) |
| `potenciaAsociada` | `"—"` | Sin equivalente en `Socio` (ver research.md Decision 4) |
| `energiaGenerada` | `"—"` | Sin equivalente en `Socio` |
| `ahorroGenerado` | `"—"` | Sin equivalente en `Socio` |
| `tipo` | `undefined` | Sin equivalente en `Socio` (no hay flag "Virtual" en el contrato) |

### `TIPO_CARGO_LABELS` (nuevo, `lib/socio-presentation.ts`)
```ts
const TIPO_CARGO_LABELS: Record<TipoCargo, string> = {
  CON_POTENCIA: "Con Potencia",
  SIN_POTENCIA: "Sin Potencia",
}
```
Usado por el formulario de `CreateSocioDialog` para el selector de tipo de cargo
(value real = `TipoCargo`, label visible = string en español).

## Estados de la vista (derivados, no persistidos)

Mismo modelo de 3 estados que la tabla de energía (005):

- **Vacío**: `listSocios` devuelve `[]` → tabla muestra "Sin socios registrados para
  este parque" en lugar de `sociosMock` (FR-008).
- **Error**: `listSocios` falla → `socios === null` en `GdcvPerformanceView`, tabla
  muestra mensaje de error (FR-009), sin caer en mock.
- **Con datos**: `socios` mapeados vía `mapSocioToRow` a la tabla existente.

## Flujo de alta (formulario → refresh)

1. Usuario abre `CreateSocioDialog` (estado `open` controlado por `SociosTable`/
   `GdcvPerformanceView`, igual patrón que el sheet de detalle ya existente).
2. Formulario controlado (`useState`) con: `nombre` (string), `participacionPorcentaje`
   (number, 0–100), `tipoCargo` (select con `TIPO_CARGO_LABELS`), `medidorNumero`
   (string). Validación manual antes de habilitar "Crear" (igual que
   `NewProjectDialog.isFormValid`).
3. Confirmar → Server Action `createSocioAction(parqueId, dto)` → `createSocio` →
   éxito: `router.refresh()` + cerrar modal; error: mensaje inline, modal permanece
   abierto con los datos ingertados (FR-006).
4. `router.refresh()` re-ejecuta `app/gdcv/performance/page.tsx`, que vuelve a llamar
   `listSocios(parqueId)` — la tabla recibe el array actualizado por props (FR-005).

## Fuera de alcance (sin cambios en esta feature)

- **Edición y baja de socios existentes**: solo alta y listado (spec.md Assumptions).
- **Multi-medidor por socio** (`MedidorDetalle[]`, hoy usado por 1 socio mock con 2
  medidores): el contrato real es 1 socio = 1 medidor; `medidores` queda siempre
  `undefined` en el mapeo.
- **Columnas de energía/ahorro/potencia por socio**: sin endpoint que las provea a
  nivel socio (solo a nivel parque, ver `005-gdcv-backend-charts`); se muestran como
  `"—"` en vez de inventarse.
- **`SocioDetailSheet`** (sheet de detalle al hacer clic en una fila): sigue mostrando
  los datos de `SocioDetalle`/mock asociados a esas columnas fuera de alcance; no se
  toca en esta feature — su contenido es consistente con lo que la tabla ahora
  muestra (`"—"` donde no hay dato real).
