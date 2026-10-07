# Feature Specification: Layout Contenido del Diálogo de Histórico de Socio

**Feature Branch**: `011-socio-historico-dialog-layout`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "El diálogo de histórico de socio (SocioHistoricoDialog) ya muestra datos correctamente, pero las tablas (Registros, Facturación, Mediciones) rompen la presentación: no tienen scroll propio y el diálogo es demasiado chico, causando que el contenido se desborde y tape el resto de la página. El diálogo debe ser más grande y cada tabla/sección debe tener scroll contenido para no dañar el layout."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el histórico sin que rompa el diseño de la página (Priority: P1)

Como usuario que consulta el histórico de un socio con muchos resultados, quiero que el diálogo se mantenga contenido y cada tabla tenga su propio scroll, para poder revisar la información sin que el contenido se desborde sobre el resto de la pantalla.

**Why this priority**: Es el defecto reportado — hoy el contenido rompe visualmente la página, haciendo que la funcionalidad ya entregada (histórico con columnas específicas) sea difícil o imposible de usar en la práctica.

**Independent Test**: Puede probarse abriendo el histórico de un socio con datos que generen varias filas en más de uno de los tres históricos, y verificando que el diálogo permanece dentro de los límites de la pantalla y que cada tabla se desplaza internamente en vez de empujar el contenido de la página.

**Acceptance Scenarios**:

1. **Given** el usuario abre el histórico de un socio con muchas filas de resultados en uno o más históricos, **When** el diálogo se muestra, **Then** el diálogo ocupa un tamaño mayor que el actual y permanece contenido dentro de la ventana, sin desbordar sobre el resto de la página.
2. **Given** uno de los históricos (Registros, Facturación o Mediciones) tiene más filas de las que caben en el espacio visible de su sección, **When** el usuario se desplaza dentro de esa sección, **Then** solo esa sección se desplaza (scroll interno), sin mover ni romper el resto del diálogo ni de la página.
3. **Given** el diálogo está abierto con los tres históricos mostrando datos, **When** el usuario revisa cada uno, **Then** puede leer las columnas de cada tabla sin que el ancho de una tabla empuje o corte el contenido de las demás secciones.

---

### Edge Cases

- ¿Qué sucede si uno de los tres históricos no tiene datos ("sin datos en el rango") mientras los otros dos tienen muchas filas? Las secciones sin datos no deben ocupar espacio de scroll innecesario; el layout general sigue siendo estable.
- ¿Qué sucede en pantallas pequeñas (ventanas angostas)? El diálogo y sus tablas deben seguir siendo utilizables, con scroll horizontal dentro de la tabla si las columnas no caben, en vez de romper el ancho de la página.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El diálogo de histórico DEBE mostrarse con un tamaño mayor al actual, de forma que el contenido de los tres históricos tenga espacio razonable para mostrarse sin sentirse comprimido.
- **FR-002**: El diálogo DEBE permanecer contenido dentro de los límites visibles de la pantalla, sin desbordar su contenido sobre el resto de la página, independientemente de la cantidad de filas que tenga cada histórico.
- **FR-003**: Cada una de las tres tablas de histórico (Registros, Facturación, Mediciones) DEBE tener su propio comportamiento de desplazamiento (scroll) cuando su contenido excede el espacio visible asignado a esa sección.
- **FR-004**: El desplazamiento dentro de una tabla de histórico NO DEBE afectar la posición ni el tamaño de las otras secciones del diálogo.
- **FR-005**: Si el ancho de las columnas de una tabla excede el ancho disponible, la tabla DEBE permitir desplazamiento horizontal contenido en vez de forzar el ancho de todo el diálogo o de la página.

### Key Entities

*(No aplica — esta funcionalidad es puramente de presentación/layout sobre datos ya existentes del histórico de socio.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con cualquier cantidad de filas de resultado en los tres históricos, el diálogo nunca excede los límites de la ventana del navegador ni desplaza el contenido de la página detrás de él.
- **SC-002**: El 100% de las tablas de histórico con más filas de las visibles muestran su propio scroll interno, sin requerir que el usuario haga scroll en la página completa para verlas.
- **SC-003**: El usuario puede leer completamente las columnas de cualquiera de los tres históricos sin que el contenido de una tabla se superponga visualmente con otro elemento de la página.

## Assumptions

- Esta funcionalidad es un ajuste de presentación sobre el diálogo ya entregado en la feature 010 (`SocioHistoricoDialog`); no cambia qué datos se consultan, qué columnas se muestran, ni el comportamiento de disparo de la consulta.
- "Diálogo más grande" se refiere a aumentar su ancho y/o alto máximo disponible, no a convertirlo en una vista de pantalla completa; el diálogo sigue siendo modal sobre la página.
- El comportamiento de scroll contenido por sección es aceptable incluso si reduce la cantidad de filas visibles sin desplazarse, priorizando que el layout general nunca se rompa por sobre mostrar todas las filas sin scroll.
