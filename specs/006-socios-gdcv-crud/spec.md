# Feature Specification: Alta y listado real de Socios GDCV

**Feature Branch**: `006-socios-gdcv-crud`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "Vamos a agregar un modal para que al dar clic en Nuevo Socio, se pueda desplegar el formulario de creación de socios. Luego la tabla de Socios del parque debe venir del endpoint: {{baseUrl}}/parques/:parqueId/socios. Vamos a dejar de usar datos mock, luego de registrar un socio, se deberia actualizar la lista"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar un nuevo socio desde la vista de performance GDCV (Priority: P1)

Un administrador u operador que gestiona un parque GDCV hace clic en "Nuevo Socio" en la tabla de "Socios del Parque" y ve un formulario modal donde carga los datos del nuevo socio (nombre, participación, tipo de cargo, número de medidor). Al confirmar, el socio queda registrado y disponible de inmediato en la tabla, sin recargar la página.

**Why this priority**: Sin la posibilidad de dar de alta socios reales, la tabla nunca podrá reflejar datos reales — es el requisito bloqueante para todo lo demás.

**Independent Test**: Puede probarse abriendo un parque GDCV, haciendo clic en "Nuevo Socio", completando el formulario con datos válidos y confirmando que el nuevo socio aparece en la tabla al cerrar el modal, sin necesidad de refrescar el navegador.

**Acceptance Scenarios**:

1. **Given** la vista de performance de un parque GDCV, **When** el usuario hace clic en "Nuevo Socio", **Then** se abre un modal con el formulario de alta de socio.
2. **Given** el modal de alta de socio abierto, **When** el usuario completa todos los campos requeridos con datos válidos y confirma, **Then** el socio se registra, el modal se cierra y la tabla de socios se actualiza mostrando el nuevo registro sin recargar la página.
3. **Given** el modal de alta de socio abierto, **When** el usuario intenta confirmar con campos requeridos vacíos o inválidos, **Then** el sistema muestra los errores de validación correspondientes y no envía la solicitud.
4. **Given** el modal de alta de socio abierto, **When** el usuario cancela o cierra el modal sin confirmar, **Then** no se crea ningún socio y la tabla permanece sin cambios.
5. **Given** el formulario enviado, **When** el registro falla por un error del servidor, **Then** el sistema muestra un mensaje de error claro y mantiene el modal abierto con los datos ingresados para reintentar.

---

### User Story 2 - Ver el listado real de socios de un parque GDCV (Priority: P1)

Un usuario que abre la vista de performance de un parque GDCV espera ver en la tabla "Socios del Parque" únicamente los socios reales registrados para ese parque, no datos de ejemplo.

**Why this priority**: Es la contraparte de lectura de la misma promesa que el registro (US1): sin esto, aunque se pueda crear un socio, la tabla seguiría mostrando datos de ejemplo mezclados o inconsistentes. Ambas historias son necesarias para una migración completa y se entregan juntas como el mismo incremento mínimo viable.

**Independent Test**: Puede probarse abriendo un parque GDCV con socios ya registrados en backend y confirmando que la tabla muestra exactamente esos socios (nombre, participación, tipo de cargo, medidor), y que un parque sin socios registrados muestra la tabla vacía en lugar de datos de ejemplo.

**Acceptance Scenarios**:

1. **Given** un parque GDCV con socios registrados en backend, **When** el usuario abre la vista de performance, **Then** la tabla muestra exactamente esos socios y sus datos.
2. **Given** un parque GDCV sin socios registrados, **When** el usuario abre la vista de performance, **Then** la tabla se muestra vacía con un mensaje claro, sin datos de ejemplo.
3. **Given** una falla al consultar el listado de socios, **When** el usuario abre la vista de performance, **Then** el sistema muestra un estado de error en la tabla, sin caer en datos de ejemplo como reemplazo silencioso.

---

### Edge Cases

- ¿Qué ocurre si dos usuarios registran un socio para el mismo parque casi simultáneamente? Cada alta exitosa debe reflejarse correctamente sin perder registros (la actualización de la tabla se basa en una nueva consulta al backend, no en un conteo local).
- ¿Qué ocurre si el número de medidor ingresado ya está en uso en ese parque? El sistema debe mostrar el error que el backend devuelva y permitir corregir el dato sin perder el resto de lo ya completado.
- ¿Qué ocurre si el usuario abre el modal, empieza a cargar datos y cambia de parque/proyecto antes de confirmar? El modal debe cerrarse o invalidarse; el alta nunca debe aplicarse a un parque distinto del que estaba activo cuando se abrió el modal.
- ¿Qué ocurre con las columnas de la tabla que hoy muestran información por medidor individual (consumo, generación) que no forma parte del registro básico de un socio? Ver Assumptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un botón "Nuevo Socio" en la tabla de Socios del Parque que, al hacer clic, abre un formulario modal de alta de socio.
- **FR-002**: El formulario de alta MUST solicitar, como mínimo: nombre del socio, porcentaje de participación, tipo de cargo y número de medidor.
- **FR-003**: El sistema MUST validar los campos requeridos del formulario antes de enviar la solicitud de alta, mostrando errores claros por campo cuando falten o sean inválidos.
- **FR-004**: Al confirmar el formulario con datos válidos, el sistema MUST registrar el socio contra el parque actualmente activo.
- **FR-005**: Tras un alta exitosa, el sistema MUST refrescar el listado de socios mostrado en la tabla sin requerir que el usuario recargue la página.
- **FR-006**: Si el alta falla, el sistema MUST mostrar un mensaje de error y preservar los datos ingresados en el modal para permitir reintentar sin volver a escribir todo.
- **FR-007**: La tabla de Socios del Parque MUST obtener su listado desde el backend real para el parque activo, eliminando el uso de datos mock (`data/gdcv-mock.ts` sociosMock / `data/gdcv-socio-mock.ts`) como fuente de esa tabla.
- **FR-008**: El sistema MUST mostrar un estado vacío explícito cuando el parque no tiene socios registrados, en lugar de sustituir con datos mock.
- **FR-009**: El sistema MUST mostrar un estado de error explícito cuando la consulta del listado de socios falla, en lugar de sustituir con datos mock.

### Key Entities

- **Socio**: Persona o entidad con participación en un parque GDCV. Atributos clave: nombre, parque al que pertenece, porcentaje de participación, tipo de cargo (con/sin potencia), número de medidor asociado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede completar el alta de un nuevo socio (abrir modal, completar formulario, confirmar) en menos de 1 minuto.
- **SC-002**: El 100% de las altas exitosas de socio se reflejan en la tabla sin recargar la página.
- **SC-003**: El 100% de las vistas de "Socios del Parque" de proyectos GDCV muestran únicamente datos provenientes del backend, sin ningún dato de `sociosMock`/`data/gdcv-socio-mock.ts`.
- **SC-004**: El 100% de los escenarios de "sin socios" o "error al cargar socios" muestran un mensaje claro al usuario en lugar de datos inventados.

## Assumptions

- El endpoint `GET /parques/{parqueId}/socios` y `POST /parques/{parqueId}/socios` ya están disponibles en el backend según lo indicado por el usuario; su contrato exacto (campos, validaciones del lado servidor) se confirma en la fase de planificación.
- Las columnas de la tabla que hoy dependen de datos por medidor individual, no cubiertos por el registro básico de un socio (por ejemplo consumo/generación desglosados, enlaces de acceso del socio), quedan fuera de alcance de esta feature — se documentan como excepción o se simplifican en la fase de planificación, sin bloquear el alta ni el listado básico.
- El formulario de alta cubre únicamente la creación de un socio nuevo; edición y baja de socios existentes quedan fuera de alcance de esta feature.
- No se requiere paginación ni búsqueda especial más allá de la ya existente en la tabla — la fuente de datos cambia, la interacción de tabla (orden, columnas visibles, paginación) se mantiene igual.
