# Contract: Socios de parque GDCV

No se define un contrato HTTP nuevo — `lib/api/socios.ts` ya implementa ambos
endpoints indicados por el usuario. Este documento fija el contrato **interno** de la
Server Action y del mapeo de presentación que esta feature agrega.

## `GET /parques/{parqueId}/socios` (ya existente)

Usado vía `listSocios(parqueId)` (`lib/api/socios.ts`).

**Response** `Socio[]`:
```json
[
  {
    "id": "s1",
    "parqueId": "p1",
    "nombre": "Alfredo Isaac SA",
    "participacionPorcentaje": 15,
    "tipoCargo": "SIN_POTENCIA",
    "medidorNumero": "3543871",
    "usuarioId": null
  }
]
```
Consumido por: `app/gdcv/performance/page.tsx` → `GdcvPerformanceView` →
`SociosTable` (vía `mapSocioToRow`).

## `POST /parques/{parqueId}/socios` (ya existente)

Usado vía `createSocio(parqueId, dto)` (`lib/api/socios.ts`).

**Request** `CreateSocioDto`:
```json
{
  "parqueId": "p1",
  "nombre": "Nuevo Socio SA",
  "participacionPorcentaje": 10,
  "tipoCargo": "CON_POTENCIA",
  "medidorNumero": "9999999"
}
```

**Response** `Socio | null` (`null` si el backend no devuelve el registro creado —
la Server Action lo trata como error, igual criterio que `createProyectoAction`).

## Server Action nueva: `createSocioAction`

`app/gdcv/socios/actions.ts`, espejo exacto de `app/main/actions.ts`:

```ts
"use server"

export interface CreateSocioActionResult {
  socio?: Socio
  error?: string
}

export async function createSocioAction(
  parqueId: string,
  dto: Omit<CreateSocioDto, "parqueId">
): Promise<CreateSocioActionResult>
```

- Llama `createSocio(parqueId, { ...dto, parqueId })`.
- Si `createSocio` devuelve `null` → `{ error: "El backend no devolvió el socio creado" }`.
- Si lanza → `{ error: error.message }` (mismo catch-all que `createProyectoAction`).
- No hace `revalidatePath` explícito (a diferencia de `createProyectoAction`, que sí
  invalida `/main`): el refresh lo dispara `router.refresh()` del lado cliente sobre la
  página de performance actual, que ya vive bajo un `proyectoId` de query string
  variable — revalidar por ruta fija no aplica aquí.

## Compatibilidad

Ningún contrato HTTP existente cambia de forma. Se agrega únicamente la Server Action
interna y el mapeo de presentación (`lib/socio-presentation.ts`), ambos nuevos y sin
impacto en consumidores existentes de `lib/api/socios.ts`.
