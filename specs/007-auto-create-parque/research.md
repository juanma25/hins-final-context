# Research: Creación Automática de Parque al Crear Proyecto

## Decision: Encadenar `createParque` dentro de `createProyectoAction`

**Rationale**: `createProyectoAction` (`app/main/actions.ts`) ya es el único punto de entrada Server Action para el alta de proyecto y ya usado por la UI en `app/main/page.tsx`. Encadenar la llamada ahí evita introducir una nueva acción, un nuevo endpoint interno, o lógica duplicada de creación. `createParque` ya existe en `lib/api/parques.ts` y no requiere cambios.

**Alternatives considered**:
- *Crear el parque en el backend automáticamente (trigger a nivel de API)*: descartado — está fuera de alcance del repo frontend y el contrato OpenAPI actual no lo documenta como comportamiento del backend.
- *Nueva Server Action separada `createProyectoConParqueAction` que orquesta ambas*: descartado por Principio V (Simplicity) — duplicaría la acción existente sin necesidad; extender la acción actual es el cambio más pequeño.

## Decision: Valores por defecto de `CreateParqueDto` — `potenciaTotalKwp: 0`, `fechaPuestaEnMarcha: proyecto.fechaAlta`

**Rationale**: Resuelto en clarificación de spec (spec.md, respuestas Q1/Q2). El formulario de alta de proyecto no solicita estos datos; se usa 0 kWp como placeholder editable luego y la fecha de alta del proyecto ya devuelta por `createProyecto` (`Proyecto.fechaAlta`) como fecha de puesta en marcha, evitando pedir un dato adicional al usuario en este flujo.

**Alternatives considered**:
- Pedir estos datos en el propio formulario de alta de proyecto: descartado por alcance (fuera de esta funcionalidad; cambiaría el formulario existente).
- Usar `new Date().toISOString()` en cliente en vez de `proyecto.fechaAlta`: descartado — `fechaAlta` es la fuente de verdad devuelta por el backend en la misma respuesta de creación, evita desincronización de reloj cliente/servidor.

## Decision: Manejo de fallo parcial (proyecto creado, parque falla)

**Rationale**: FR-004 exige no revertir el proyecto. Se extiende `CreateProyectoActionResult` con un campo opcional (p.ej. `parqueError?: string`) para que la UI pueda distinguir "todo OK", "proyecto OK, parque falló" y "proyecto falló" sin necesitar una segunda llamada de red ni lanzar excepción que oculte el proyecto ya creado.

**Alternatives considered**:
- Lanzar una excepción si falla el parque: descartado — perdería la referencia al proyecto ya creado en el resultado devuelto a la UI, violando FR-004.
- Reintentar automáticamente la creación del parque: fuera de alcance (no pedido en spec; añadiría complejidad no justificada por Principio V).

## Decision: Nombre del parque se deriva de `proyecto.nombre`, no se persiste en `Parque`

**Rationale**: `CreateParqueDto`/`Parque` (lib/api/types.ts) no tienen campo `nombre`; el único campo relacionado es `nombreExterno` (sincronizado desde integración externa, no seteable en creación). La UI ya tiene `getPrimaryParque(proyectoId)`/`listParquesByProyecto(proyectoId)` para resolver el parque de un proyecto; mostrar `proyecto.nombre` junto al parque resuelto satisface FR-003 sin cambios de contrato de datos.

**Alternatives considered**:
- Solicitar al backend agregar campo `nombre` a `Parque`: fuera de alcance (cambio de contrato externo, no controlado por este repo).

## No unresolved NEEDS CLARIFICATION remain.
