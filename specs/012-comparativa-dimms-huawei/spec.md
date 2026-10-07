# Feature Specification: Comparativa DIMMs vs Huawei en Detalle de Parque

**Feature Branch**: `012-comparativa-dimms-huawei`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Comparativa DIMMs vs Huawei FusionSolar en detalle de parque: usar endpoint /parques/<parqueId>/medidor-principal/registros/consolidado?periodo=<Año-mes> como fuente principal (DIMMs) y datos actuales de FusionSolar como secundarios para comparación. Graficos y cards del detalle de parque deben mostrar ambas fuentes comparativamente (DIMMs principal, Huawei secundario)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver comparativa de generación en tarjetas resumen (Priority: P1)

Como usuario que consulta el detalle de un parque, quiero ver las tarjetas resumen de generación mostrando el valor del medidor principal (DIMMs) como dato principal y el valor de FusionSolar como referencia secundaria, para poder detectar diferencias entre lo medido por el medidor oficial y lo reportado por el inversor.

**Why this priority**: Es el cambio de mayor visibilidad inmediata y el que resuelve la necesidad central: dejar de mostrar solo datos de FusionSolar y priorizar el medidor principal como fuente de verdad.

**Independent Test**: Abrir el detalle de un parque con datos disponibles en ambas fuentes para el período actual y verificar que las tarjetas muestran el valor DIMMs destacado y el valor Huawei como referencia secundaria (con su diferencia o variación).

**Acceptance Scenarios**:

1. **Given** un parque con registros consolidados DIMMs y datos FusionSolar disponibles para el mes actual, **When** el usuario abre el detalle del parque, **Then** las tarjetas de generación muestran el valor DIMMs como dato principal y el valor Huawei como dato secundario/comparativo.
2. **Given** un parque sin datos DIMMs disponibles para el período consultado, **When** el usuario abre el detalle del parque, **Then** el sistema indica claramente que el dato principal no está disponible y muestra el dato Huawei con una indicación de que es el único dato disponible (sin presentarlo como si fuera el principal).

---

### User Story 2 - Ver comparativa de generación en gráficos (Priority: P1)

Como usuario que analiza el desempeño de un parque, quiero ver los gráficos de generación (diaria/mensual) con dos series superpuestas o comparadas, una para DIMMs (principal) y otra para Huawei (secundaria), para poder evaluar visualmente la consistencia entre ambas fuentes a lo largo del tiempo.

**Why this priority**: Los gráficos son la herramienta principal de análisis de tendencia; sin la comparativa visual, el usuario no puede detectar desvíos sistemáticos entre fuentes.

**Independent Test**: Abrir el detalle de un parque y verificar que los gráficos existentes de generación muestran ambas series (DIMMs y Huawei) diferenciadas visualmente (color, etiqueta, leyenda), con DIMMs identificado como la serie principal.

**Acceptance Scenarios**:

1. **Given** un parque con datos de ambas fuentes para el período seleccionado, **When** el usuario visualiza el gráfico de generación, **Then** se muestran dos series claramente etiquetadas ("Medidor principal" y "FusionSolar" o equivalente) con distinción visual entre principal y secundaria.
2. **Given** un parque con datos solo en una de las dos fuentes para parte del rango del gráfico, **When** el usuario visualiza el gráfico, **Then** la serie sin datos para ese tramo se muestra vacía o discontinua sin generar errores ni valores inventados.
3. **Given** el usuario cambia el período/mes consultado, **When** se selecciona un nuevo período, **Then** ambas series del gráfico se actualizan para reflejar el nuevo período consultado.

---

### User Story 3 - Manejo de errores al consultar la fuente principal (Priority: P2)

Como usuario, quiero que si la consulta al medidor principal (DIMMs) falla, el sistema siga mostrando el detalle del parque con los datos de Huawei disponibles y un aviso de que el dato principal no pudo obtenerse, para no perder acceso a la información aunque una fuente falle.

**Why this priority**: Da robustez a la funcionalidad principal; sin este comportamiento, un fallo en la fuente principal dejaría toda la pantalla de detalle inutilizable.

**Independent Test**: Simular una respuesta de error o timeout del endpoint DIMMs y verificar que la pantalla de detalle sigue siendo utilizable mostrando los datos Huawei disponibles junto con un aviso visible del problema con la fuente principal.

**Acceptance Scenarios**:

1. **Given** el endpoint del medidor principal responde con error o no responde, **When** el usuario abre el detalle del parque, **Then** el sistema muestra los datos de Huawei disponibles, marca la fuente principal como "no disponible" y no bloquea ni rompe la vista.

---

### Edge Cases

- ¿Qué pasa si un parque no tiene medidor principal configurado (no aplica DIMMs)? El sistema debe mostrar solo los datos Huawei sin presentar un error de "fuente principal no disponible", indicando que ese parque no cuenta con medidor principal.
- ¿Cómo se comporta la comparativa cuando el período consultado es un mes en curso con datos parciales en ambas fuentes? Se muestran los datos parciales disponibles en ambas series, alineados por fecha/hora.
- ¿Qué pasa si los valores DIMMs y Huawei difieren significativamente (ej. >10%)? El sistema muestra la diferencia como dato informativo, sin bloquear la visualización ni marcar automáticamente ningún valor como erróneo.
- ¿Qué pasa si el usuario consulta un período histórico sin datos en ninguna de las dos fuentes? Se muestra un estado vacío claro para ambas series/tarjetas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE obtener los datos de generación del medidor principal (DIMMs) del parque consultado usando el período (año-mes) correspondiente a la vista de detalle.
- **FR-002**: El sistema DEBE mostrar los datos DIMMs como la fuente principal en las tarjetas resumen de generación del detalle de parque.
- **FR-003**: El sistema DEBE mostrar los datos de Huawei (FusionSolar) como fuente secundaria de comparación en las mismas tarjetas resumen, claramente diferenciada visualmente de la fuente principal.
- **FR-004**: El sistema DEBE mostrar en los gráficos de generación del detalle de parque dos series comparables: una para DIMMs (principal) y otra para Huawei (secundaria), diferenciadas por etiqueta y estilo visual.
- **FR-005**: El sistema DEBE actualizar ambas series (tarjetas y gráficos) cuando el usuario cambia el período/mes consultado en el detalle de parque.
- **FR-006**: El sistema DEBE indicar visualmente cuando la fuente principal (DIMMs) no tiene datos disponibles para el período consultado, sin ocultar los datos de Huawei que sí estén disponibles.
- **FR-007**: El sistema DEBE indicar visualmente cuando la fuente secundaria (Huawei) no tiene datos disponibles, sin afectar la disponibilidad de los datos DIMMs.
- **FR-008**: El sistema DEBE seguir mostrando el detalle del parque de forma utilizable cuando la consulta a la fuente principal falla (error o timeout), mostrando un aviso del problema y los datos secundarios disponibles.
- **FR-009**: El sistema DEBE alinear temporalmente (por día/período) los valores de ambas fuentes al graficarlos, de modo que la comparación sea consistente punto a punto.
- **FR-010**: El sistema NO DEBE inventar o interpolar valores para períodos sin datos en alguna de las fuentes; los tramos sin datos se muestran vacíos.

### Key Entities

- **Registro Consolidado del Medidor Principal (DIMMs)**: Representa la generación de energía medida por el medidor principal de un parque para un período (año-mes) determinado; es la fuente de datos principal en la comparativa.
- **Dato de Generación Huawei (FusionSolar)**: Representa la generación de energía reportada por el sistema del inversor para el mismo parque y período; actúa como fuente secundaria de referencia en la comparativa.
- **Comparativa de Generación**: Agrupa ambos datos (DIMMs y Huawei) para un mismo parque y período, usada para poblar tarjetas resumen y gráficos del detalle de parque.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El usuario puede identificar en menos de 5 segundos, al abrir el detalle de un parque, cuál es el valor principal (DIMMs) y cuál es el valor de referencia secundaria (Huawei) en las tarjetas resumen.
- **SC-002**: El 100% de los gráficos de generación existentes en el detalle de parque muestran ambas series (DIMMs y Huawei) cuando hay datos disponibles para el período consultado.
- **SC-003**: Ante un fallo de la fuente principal, el detalle del parque permanece visible y utilizable en el 100% de los casos, mostrando los datos secundarios disponibles.
- **SC-004**: El usuario puede comparar visualmente la diferencia entre ambas fuentes para cualquier período consultado sin necesidad de navegar a otra pantalla.

## Assumptions

- El endpoint `/parques/<parqueId>/medidor-principal/registros/consolidado?periodo=<Año-mes>` ya existe y provee los registros consolidados de generación del medidor principal para el parque y período indicados.
- Los datos de Huawei (FusionSolar) actualmente mostrados en el detalle de parque siguen disponibles vía la integración existente y se reutilizan como fuente secundaria.
- No todos los parques tienen necesariamente un medidor principal configurado; en esos casos la comparativa se degrada a mostrar solo Huawei.
- El período de comparación por defecto es el mes actualmente seleccionado en la vista de detalle de parque (mismo criterio que usa hoy la vista para consultar Huawei).
- La comparación se limita a la vista de detalle de parque existente (tarjetas y gráficos ya presentes), sin agregar nuevas pantallas.
