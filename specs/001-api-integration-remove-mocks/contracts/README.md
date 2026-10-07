# Contracts

`openapi.json` en este directorio es una copia exacta (sin modificar) de
`docs/openapi.json` en la raíz del repo, tomada el 2026-07-16 como la versión
del contrato contra la que se planificó esta funcionalidad.

El backend (`docs/openapi.json`) es la fuente de verdad — ver FR-003 del
[spec](../spec.md). Esta copia existe solo para trazabilidad del plan; si el
contrato cambia en la raíz del repo, re-sincronizar esta copia antes de
retomar planificación.

Endpoints cubiertos (20): `/auth/register`, `/auth/login`, `/usuarios`,
`/usuarios/me`, `/usuarios/{id}` (GET/PATCH/DELETE), `/proyectos` (GET/POST),
`/parques` (POST), `/parques/{id}` (GET), `/parques/{parqueId}/socios`
(GET/POST), `/parques/{parqueId}/dispositivos` (GET),
`/parques/{parqueId}/alarmas` (GET), `/parques/{parqueId}/energia`
(GET/POST), `/parques/{parqueId}/roi` (GET/POST),
`/parques/{parqueId}/mantenimiento` (GET/POST),
`/sincronizacion/configuraciones` (GET), `/sincronizacion/configuraciones/{modelo}`
(PATCH), `/sincronizacion/logs` (GET).
