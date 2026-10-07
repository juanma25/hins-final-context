# Feature Specification: Histórico de Registros, Facturación y Mediciones por Socio

**Feature Branch**: `009-socio-historico-dialog`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "En la tabla de socios de un parque (que ya muestra el medidor de cada socio), agregar un botón por fila para abrir un diálogo que permita filtrar por rango de fechas y consultar, para ese socio: histórico de Registros, Facturación y Mediciones. Al seleccionar el rango de fechas se consumen GET /parques/{parqueId}/socios/{socioId}/registros, /facturacion y /mediciones (todos con params desde/hasta, confirmados en la API)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar histórico de un socio filtrando por fecha (Priority: P1)

Como usuario que ve la tabla de socios de un parque, quiero abrir, para un socio en particular, un diálogo donde pueda elegir un rango de fechas y ver su histórico de Registros, Facturación y Mediciones en ese rango, para revisar la información recolectada de ese socio sin salir de la tabla.

**Why this priority**: Es el requisito central solicitado; sin esto no hay forma de consultar estos tres históricos desde la tabla de socios.

**Independent Test**: Puede probarse haciendo clic en el botón de un socio en la tabla, seleccionando un rango de fechas en el diálogo, y verificando que se muestran los históricos de Registros, Facturación y Mediciones correspondientes a ese socio y ese rango.

**Acceptance Scenarios**:

1. **Given** el usuario ve la tabla de socios de un parque, **When** hace clic en el botón de histórico de un socio, **Then** se abre un diálogo con un selector de rango de fechas para ese socio.
2. **Given** el diálogo de histórico está abierto para un socio, **When** el usuario selecciona un rango de fechas (desde/hasta), **Then** el sistema consulta y muestra el histórico de Registros, Facturación y Mediciones de ese socio para ese rango.
3. **Given** el usuario ya consultó un rango de fechas para un socio, **When** cambia el rango de fechas en el mismo diálogo, **Then** el sistema vuelve a consultar y actualiza los tres históricos mostrados con el nuevo rango.

---

### User Story 2 - Manejo de rango sin resultados o con error (Priority: P2)

Como usuario que consulta el histórico de un socio, quiero saber claramente cuándo un rango de fechas no tiene datos o cuándo la consulta falló, para no confundir "sin datos" con "algo salió mal".

**Why this priority**: Evita que el usuario interprete una pantalla vacía como un error del sistema o viceversa, mejorando la confianza en los datos mostrados.

**Independent Test**: Puede probarse seleccionando un rango de fechas sin datos conocidos y verificando el mensaje de "sin resultados"; y simulando un fallo de red/backend y verificando el mensaje de error, en cada uno de los tres históricos de forma independiente entre sí.

**Acceptance Scenarios**:

1. **Given** el usuario selecciona un rango de fechas sin datos para uno de los tres históricos, **When** la consulta se completa, **Then** ese histórico muestra un mensaje indicando que no hay datos en ese rango, sin afectar a los otros dos históricos.
2. **Given** la consulta de uno de los tres históricos falla, **When** el usuario ve el diálogo, **Then** ese histórico muestra un mensaje de error y una opción para reintentar, mientras los otros dos históricos siguen mostrando su propio resultado con normalidad.

---

### Edge Cases

- ¿Qué sucede si el usuario no selecciona ningún rango de fechas? El diálogo no debe consultar los históricos hasta que el usuario elija un rango; se asume que no hay un rango por defecto (ver Assumptions).
- ¿Qué sucede si el usuario selecciona una fecha "hasta" anterior a la fecha "desde"? El sistema debe impedir esa selección o corregirla antes de consultar, en vez de enviar un rango inválido al backend.
- ¿Qué sucede si el usuario cierra el diálogo mientras una consulta está en curso? La consulta en curso se descarta sin mostrar su resultado; al reabrir el diálogo para el mismo u otro socio, no debe mostrar datos de una consulta anterior descartada.
- ¿Qué sucede con socios que no tienen medidor asignado? Esta funcionalidad no depende del medidor del socio; el botón de histórico está disponible para cualquier socio de la tabla, tenga o no medidor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La tabla de socios de un parque DEBE incluir, para cada socio listado, un botón que permita abrir su histórico de Registros, Facturación y Mediciones.
- **FR-002**: Al hacer clic en ese botón, el sistema DEBE abrir un diálogo asociado a ese socio, con un selector de rango de fechas (fecha "desde" y fecha "hasta").
- **FR-003**: El sistema NO DEBE consultar ningún histórico hasta que el usuario haya seleccionado un rango de fechas completo (desde y hasta) en el diálogo.
- **FR-004**: Al seleccionar o cambiar un rango de fechas válido, el sistema DEBE consultar, para el socio del diálogo, el histórico de Registros, el histórico de Facturación y el histórico de Mediciones correspondientes a ese rango.
- **FR-005**: El sistema DEBE mostrar los tres históricos (Registros, Facturación, Mediciones) de forma diferenciada entre sí dentro del mismo diálogo, de modo que el usuario pueda identificar a cuál corresponde cada resultado.
- **FR-006**: Si la consulta de uno de los tres históricos no devuelve datos para el rango seleccionado, el sistema DEBE indicarlo explícitamente para ese histórico, sin impedir que los otros dos históricos se muestren.
- **FR-007**: Si la consulta de uno de los tres históricos falla, el sistema DEBE indicarlo explícitamente para ese histórico y ofrecer una forma de reintentar esa consulta, sin impedir que los otros dos históricos se muestren.
- **FR-008**: El sistema DEBE impedir que el usuario seleccione o confirme un rango de fechas donde "hasta" sea anterior a "desde".
- **FR-009**: El botón de histórico DEBE estar disponible para todos los socios listados en la tabla, independientemente de si el socio tiene o no número de medidor asignado.

### Key Entities

- **Histórico de Registros de un Socio**: Conjunto de resultados recolectados para un socio en un rango de fechas, agrupados por el momento en que fueron obtenidos.
- **Histórico de Facturación de un Socio**: Conjunto de resultados de facturación recolectados para un socio en un rango de fechas, agrupados por el momento en que fueron obtenidos.
- **Histórico de Mediciones de un Socio**: Conjunto de resultados de mediciones recolectadas para un socio, agrupados por el momento en que fueron obtenidos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde la tabla de socios, un usuario puede llegar a ver el histórico de Registros, Facturación y Mediciones de un socio en menos de 3 clics (abrir diálogo, seleccionar desde, seleccionar hasta).
- **SC-002**: El 100% de los rangos de fechas inválidos (hasta anterior a desde) son bloqueados antes de intentar cualquier consulta.
- **SC-003**: El 100% de las consultas sin resultados muestran un mensaje de "sin datos" distinguible de un mensaje de error, por cada uno de los tres históricos.
- **SC-004**: El 100% de las fallas en la consulta de un histórico permiten reintentar esa consulta específica sin tener que cerrar y reabrir el diálogo completo.

## Assumptions

- El diálogo muestra los tres históricos (Registros, Facturación, Mediciones) simultáneamente para el mismo rango de fechas seleccionado, en vez de requerir seleccionar cuál consultar; esto se ajusta a que el pedido original menciona los tres juntos como parte de un mismo flujo de consulta.
- No hay un rango de fechas por defecto al abrir el diálogo; el usuario debe elegirlo explícitamente antes de ver cualquier resultado.
- El contenido de cada resultado histórico (los datos concretos devueltos) se presenta de forma genérica/legible dado que su estructura interna no está estandarizada por el negocio; el detalle exacto de esa presentación se resuelve en la fase de planificación, no en esta especificación.
- Esta funcionalidad es de solo consulta (lectura); no permite editar, exportar ni eliminar datos históricos.
