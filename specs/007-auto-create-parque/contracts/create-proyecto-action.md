# Contract: `createProyectoAction` (Server Action)

Ubicación: `app/main/actions.ts`. Contrato interno de la aplicación (no HTTP público); documentado porque es el punto de integración entre UI y los dos llamados a la API externa (`createProyecto`, `createParque`).

## Input

```ts
createProyectoAction(dto: CreateProyectoDto): Promise<CreateProyectoActionResult>
```

`CreateProyectoDto` — sin cambios (ver `lib/api/types.ts`): `{ nombre: string; modelo: ModeloNegocio; ubicacion: string; imageUrl?: string }`.

## Output (extendido)

```ts
interface CreateProyectoActionResult {
  proyecto?: Proyecto
  error?: string
  parque?: Parque
  parqueError?: string
}
```

## Comportamiento

1. Llama a `createProyecto(dto)` (sin cambios respecto a hoy).
   - Si falla o retorna `null` → retorna `{ error: ... }` (comportamiento actual, sin `parque`/`parqueError`). No se intenta crear parque.
2. Si el proyecto se crea exitosamente, llama a `createParque({ proyectoId: proyecto.id, potenciaTotalKwp: 0, fechaPuestaEnMarcha: proyecto.fechaAlta })`.
   - Si tiene éxito → retorna `{ proyecto, parque }`.
   - Si falla o retorna `null` → retorna `{ proyecto, parqueError: <mensaje> }` (el proyecto NO se revierte — FR-004).
3. En ambos casos de éxito de proyecto, se llama `revalidatePath("/main")` como hoy.

## Casos de prueba (contract-level, ver quickstart.md para pasos manuales)

| Caso | createProyecto | createParque | Resultado esperado |
|---|---|---|---|
| Happy path | éxito | éxito | `{ proyecto, parque }`, sin `error` ni `parqueError` |
| Falla creación de proyecto | falla/null | no se llama | `{ error }`, sin `proyecto`, sin `parque` |
| Proyecto OK, parque falla | éxito | falla/null | `{ proyecto, parqueError }`, sin `parque` |
