# Data Model: Creación Automática de Parque al Crear Proyecto

No se introducen entidades ni campos nuevos. Se reutilizan los tipos existentes en `lib/api/types.ts`.

## Proyecto (existente, sin cambios)

| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| nombre | string | Fuente del nombre mostrado para el parque asociado (FR-003) |
| modelo | ModeloNegocio | |
| ubicacion | string | |
| fechaAlta | string (ISO 8601) | Usada como `fechaPuestaEnMarcha` del parque autogenerado (FR-006) |
| activo | boolean | |
| imageUrl | string? | |

## Parque (existente, sin cambios)

| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| proyectoId | string | Relación con Proyecto (FR-002) |
| potenciaTotalKwp | number | Se envía `0` en la creación automática (FR-005) |
| fechaPuestaEnMarcha | string (ISO 8601) | Se envía igual a `Proyecto.fechaAlta` (FR-006) |
| stationExternalId | string \| null | No aplica a esta funcionalidad |
| nombreExterno | string \| null | No es el "nombre" mostrado; viene de sincronización externa, no se setea aquí |
| direccion, longitud, latitud, contactoNombre, contactoInfo | varios \| null | No aplica a esta funcionalidad |

## Relación

- Un `Proyecto` origina exactamente un `Parque` automático al momento de su creación (relación 1:1 para este flujo; el dominio general admite 1:N vía `listParquesByProyecto`, ver Assumptions en spec.md).
- El "nombre" del parque no es un campo persistido: es un valor derivado en la capa de presentación (`proyecto.nombre` del `Proyecto` relacionado vía `proyectoId`).

## Resultado de la acción (nuevo, in-memory únicamente — no persistido)

Extensión de `CreateProyectoActionResult` (`app/main/actions.ts`):

| Campo | Tipo | Notas |
|---|---|---|
| proyecto | Proyecto? | Igual que hoy |
| error | string? | Igual que hoy — error al crear el *proyecto* |
| parque | Parque? | Nuevo — parque creado automáticamente, si tuvo éxito |
| parqueError | string? | Nuevo — mensaje de fallo si el proyecto se creó pero el parque no (FR-004) |

No hay migraciones ni cambios de esquema de backend: este resultado es un tipo TypeScript interno del Server Action, no una entidad persistida.
