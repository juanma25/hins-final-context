# Data Model: Campos No. Suministro y No. Contrato al Crear Socio (DIMMs)

## CreateSocioDto (extendido)

| Campo | Tipo | Notas |
|---|---|---|
| parqueId | string | Sin cambios |
| nombre | string | Sin cambios |
| participacionPorcentaje | number | Sin cambios |
| tipoCargo | TipoCargo | Sin cambios |
| medidorNumero | string | Sin cambios de tipo; en UI pasa de obligatorio a opcional (FR-002) — si el usuario no lo completa, se envía `""` |
| suministroNumero | string | **Nuevo** — obligatorio en UI solo si `medidorNumero` no está vacío (FR-005); se envía `""` si no aplica |
| contratoNumero | string | **Nuevo** — misma regla que `suministroNumero` |

## Socio (extendido)

| Campo | Tipo | Notas |
|---|---|---|
| id | string | Sin cambios |
| parqueId | string | Sin cambios |
| nombre | string | Sin cambios |
| participacionPorcentaje | number | Sin cambios |
| tipoCargo | TipoCargo | Sin cambios |
| medidorNumero | string | Sin cambios de tipo |
| suministroNumero | string | **Nuevo** |
| contratoNumero | string | **Nuevo** |
| usuarioId | string \| null | Sin cambios |

## Regla de validación (nueva, in-memory — formulario, no persistida)

Función pura (Phase 2 la ubica en un archivo concreto):

```
getSocioFormValidationError(formData: {
  nombre: string
  participacionPorcentaje: string
  tipoCargo: TipoCargo | undefined
  medidorNumero: string
  suministroNumero: string
  contratoNumero: string
}): string | null
```

- Si `nombre`, `participacionPorcentaje` o `tipoCargo` faltan → error existente (sin cambios).
- Si `medidorNumero.trim() !== ""` y (`suministroNumero.trim() === ""` o `contratoNumero.trim() === ""`) → error indicando el campo faltante.
- En cualquier otro caso → `null` (formulario válido).

No hay migración ni cambio de esquema de backend — `suministroNumero`/`contratoNumero` ya existen en el contrato de la API (`CreateSocioDto`), solo se consumen desde el frontend.
