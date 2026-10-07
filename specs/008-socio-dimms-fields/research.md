# Research: Campos No. Suministro y No. Contrato al Crear Socio (DIMMs)

## Decision: Enviar `""` (cadena vacía) para `medidorNumero`/`suministroNumero`/`contratoNumero` cuando el usuario no ingresa medidor

**Rationale**: La API (`CreateSocioDto` en `contracts/openapi.json` vía `/docs-json`) tipa los tres campos como `string` requerido — no admite `null`/`undefined` en el esquema. La spec (FR-002/FR-005) exige permitir el alta sin estos tres datos. La única representación de "sin dato" compatible con `string` requerido, sin cambiar el contrato del backend, es la cadena vacía.

**Alternatives considered**:
- Omitir las claves del body cuando están vacías: descartado — el esquema las marca `required`, el backend puede rechazar el body por campos faltantes (riesgo no verificable sin acceso a la implementación del backend).
- Pedir al backend que acepte `null`: fuera de alcance (cambio de contrato externo no controlado por este repo).

## Decision: Extraer la validación condicional a una función pura testeable

**Rationale**: Constitution Principio III exige tests antes de implementar para lógica de negocio. La regla "si hay medidor, exigir suministro y contrato" es una validación de negocio, no presentación pura; extraerla a una función (p. ej. `getSocioFormValidationErrors(formData)` o similar) permite testearla sin montar el componente React, siguiendo el patrón ya usado en `lib/socio-presentation.ts` para otra lógica de presentación de socios.

**Alternatives considered**:
- Dejar la validación inline dentro de `handleCreate` (como hoy): descartado — dificulta el test-first aislado sin renderizar el diálogo completo; el resto del formulario puede seguir con validación inline simple (campos siempre obligatorios), solo esta regla condicional se extrae.

## Decision: No agregar selector de modelo/API en el formulario

**Rationale**: Resuelto en clarificación de spec — "DIMMs" es una de las dos APIs externas ya conectadas al sistema (no un `ModeloNegocio` ni una opción de UI). El formulario de alta de socio no necesita saber ni preguntar por esto; los campos se agregan de forma incondicional respecto al modelo.

**Alternatives considered**:
- Agregar un enum "DIMMs" a `ModeloNegocio`: descartado explícitamente por el usuario — no aplica a este alcance.

## No unresolved NEEDS CLARIFICATION remain.
