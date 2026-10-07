# Feature Specification: Tablas de Histórico por Socio con Campos Específicos

**Feature Branch**: `010-socio-historico-tablas`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "al hacer clic en el detalle del medidor, no veo que consulte el histórico de facturacion, registros y mediciones, ya la api devuelve todo, de facturación necesitamos una tabla con el campo ultima_lectura_fecha_hora y ultima_lectura_activa_exportada_t1, ultima_lectura_activa_exportada_t2, ultima_lectura_activa_exportada_t3, ultima_lectura_activa_exportada_t0 y ultima_lectura_activa_importada_t0. De registros necesitamos: energia_activa_importada, tarifa, demanda_activa_exportada y fecha_hora. De mediciones necesitamos: ultimo_registro_fecha_hora y ultima_lectura_fecha_hora. Al cambiar la fecha debe dispararse la consulta. Actualmente no se hace ninguna consulta, la API esta operativa. Endpoints: GET /parques/{parqueId}/socios/{socioId}/registros, /facturacion, /mediciones."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cambiar el rango de fechas siempre dispara la consulta (Priority: P1)

Como usuario que consulta el histórico de un socio, quiero que, cada vez que cambio la fecha "desde" o "hasta", el sistema consulte de inmediato los tres históricos, para no tener que adivinar si mi cambio de fecha fue tomado en cuenta.

**Why this priority**: Es el defecto reportado — hoy cambiar la fecha no dispara ninguna consulta, dejando la funcionalidad de histórico inutilizable aunque la API esté operativa.

**Independent Test**: Puede probarse abriendo el histórico de un socio, seleccionando una fecha "desde" y una "hasta", y verificando que los tres históricos se consultan y muestran resultados sin ninguna acción adicional del usuario.

**Acceptance Scenarios**:

1. **Given** el diálogo de histórico está abierto para un socio, **When** el usuario selecciona una fecha "desde" y luego una fecha "hasta" válidas, **Then** el sistema consulta de inmediato los tres históricos (Registros, Facturación, Mediciones) para ese rango.
2. **Given** el diálogo ya muestra resultados para un rango, **When** el usuario cambia la fecha "desde" o la fecha "hasta" a un nuevo valor válido, **Then** el sistema vuelve a consultar los tres históricos de inmediato con el nuevo rango, sin requerir un clic adicional de "buscar" o similar.

---

### User Story 2 - Ver cada histórico como tabla con sus campos específicos (Priority: P1)

Como usuario que revisa el histórico de un socio, quiero ver cada uno de los tres históricos (Facturación, Registros, Mediciones) en una tabla con columnas específicas y con nombres legibles, para poder leer la información sin interpretar datos crudos.

**Why this priority**: Es el segundo requisito central solicitado; sin columnas específicas, el usuario no puede aprovechar la información que la API ya devuelve.

**Independent Test**: Puede probarse consultando un rango con datos conocidos y verificando que cada histórico se muestra como tabla con exactamente las columnas solicitadas para ese tipo, con una fila por resultado.

**Acceptance Scenarios**:

1. **Given** la consulta de Facturación devuelve resultados, **When** se muestran en el diálogo, **Then** aparecen en una tabla con las columnas: fecha y hora de última lectura, última lectura activa exportada T1, T2, T3, T0, y última lectura activa importada T0.
2. **Given** la consulta de Registros devuelve resultados, **When** se muestran en el diálogo, **Then** aparecen en una tabla con las columnas: energía activa importada, tarifa, demanda activa exportada, y fecha y hora.
3. **Given** la consulta de Mediciones devuelve resultados, **When** se muestran en el diálogo, **Then** aparecen en una tabla con las columnas: fecha y hora del último registro, y fecha y hora de última lectura.
4. **Given** un resultado individual de cualquiera de los tres históricos no trae uno de los campos esperados, **When** se muestra su fila en la tabla, **Then** esa celda se muestra vacía o con un indicador de "sin dato", sin romper el resto de la tabla ni de la fila.

---

### Edge Cases

- ¿Qué sucede si el usuario cambia una fecha a un valor que vuelve el rango inválido (hasta anterior a desde)? No se dispara ninguna consulta nueva y se mantiene el bloqueo ya existente (ver feature 009, FR-008), sin perder los resultados del último rango válido mostrado hasta que se corrija.
- ¿Qué sucede si dentro del mismo histórico hay resultados con y sin alguno de los campos esperados? Cada fila se evalúa de forma independiente; solo las celdas de campos faltantes en esa fila puntual se muestran vacías.
- ¿Qué sucede si el usuario cambia la fecha mientras la consulta anterior todavía está en curso? La consulta anterior se descarta y solo se muestra el resultado de la consulta más reciente para cada histórico (ver feature 009, comportamiento ya definido para consultas en curso).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE disparar la consulta de los tres históricos inmediatamente al seleccionar o cambiar cualquiera de las dos fechas del rango ("desde" u "hasta"), siempre que el rango resultante sea válido, sin requerir una acción de confirmación adicional.
- **FR-002**: El histórico de Facturación DEBE mostrarse como tabla con las columnas: fecha y hora de última lectura, última lectura activa exportada T1, última lectura activa exportada T2, última lectura activa exportada T3, última lectura activa exportada T0, y última lectura activa importada T0.
- **FR-003**: El histórico de Registros DEBE mostrarse como tabla con las columnas: energía activa importada, tarifa, demanda activa exportada, y fecha y hora.
- **FR-004**: El histórico de Mediciones DEBE mostrarse como tabla con las columnas: fecha y hora del último registro, y fecha y hora de última lectura.
- **FR-005**: Cada fila de cada tabla DEBE corresponder a un resultado individual devuelto por la consulta de ese histórico para el rango seleccionado.
- **FR-006**: Si un resultado no incluye uno de los campos esperados por su tabla, el sistema DEBE mostrar esa celda vacía o con un indicador de "sin dato", sin omitir la fila completa.
- **FR-007**: El comportamiento ya definido para "sin datos en el rango" y "error al consultar" (ver feature 009) DEBE seguir aplicando por separado a cada una de las tres tablas.

### Key Entities

- **Fila de Facturación**: Un resultado histórico de facturación de un socio, con fecha/hora de última lectura y los valores de energía activa exportada por franja horaria (T1, T2, T3, T0) y activa importada (T0).
- **Fila de Registros**: Un resultado histórico de registros de un socio, con energía activa importada, tarifa aplicada, demanda activa exportada y fecha/hora del registro.
- **Fila de Mediciones**: Un resultado histórico de mediciones de un socio, con fecha/hora del último registro y fecha/hora de la última lectura.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los cambios de fecha (desde u hasta) que resultan en un rango válido disparan una nueva consulta de los tres históricos, sin necesidad de una acción adicional.
- **SC-002**: El 100% de los resultados de Facturación, Registros y Mediciones se muestran en una tabla con exactamente las columnas definidas para su tipo (FR-002 a FR-004).
- **SC-003**: El 100% de las celdas correspondientes a campos ausentes en un resultado se muestran de forma clara como "sin dato", sin generar errores visibles ni filas rotas.

## Assumptions

- Esta funcionalidad refina el diálogo de histórico ya entregado en la feature 009 (`specs/009-socio-historico-dialog`): mismo punto de entrada (botón "Ver histórico" por fila en la tabla de socios), mismos tres endpoints ya integrados, mismo manejo de "sin datos"/"error" por histórico — solo cambia (a) que el disparo de la consulta ocurre en cada cambio de fecha en vez de solo cuando el rango se completa por primera vez, y (b) que el contenido se presenta en tablas con columnas específicas en vez de una vista genérica.
- Los nombres de campo mencionados (`ultima_lectura_fecha_hora`, `energia_activa_importada`, etc.) son las claves tal como las devuelve la API dentro de cada resultado; no se transforman ni renombran a nivel de datos, solo se traducen a etiquetas legibles en la columna de la tabla.
- Los valores de fecha/hora se muestran tal como los devuelve la API (sin definir en esta funcionalidad un formato de presentación específico más allá de ser legibles), y los valores numéricos (energía, tarifa, demanda) se muestran sin formato adicional salvo el que ya use el resto de la aplicación para magnitudes similares.
- No se agregan columnas de ordenamiento, filtrado adicional ni exportación a estas tablas; siguen siendo de solo lectura, igual que en la feature 009.
