# Feature Specification: Gráfico de Energía del Parque (datos reales)

**Feature Branch**: `002-park-energy-chart`

**Created**: 2026-07-17

**Status**: Draft

**Input**: User description: "vamos a consulta la energia del parque con este endpoint y graficar esos datos: {{baseUrl}}/parques/<parqueId>/energia. De esta forma podemos quitar el grafico mensual mock que tiene el detalle del parque"

## Clarifications

### Session 2026-07-17

- Q: ¿Cómo tratamos la granularidad de los registros de energía para el gráfico? → A: El endpoint real de energía del parque devuelve un registro por mes con forma `{ periodo: "YYYY-MM", energiaMesKwh: number, ingresoMes: number }` — no la forma `energiaInyectadaKwh`/`energiaGeneradaKwh`/`creditoGenerado`/`ahorroEpec` asumida originalmente. Cada registro es ya un punto mensual; no se agregan múltiples registros por bucket. La vista diaria (1D) queda fuera de alcance de este endpoint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver energía real del parque en el detalle (Priority: P1)

Como usuario que revisa el detalle de un parque, quiero ver el gráfico de energía generada mensual con datos reales del parque, no con datos de ejemplo, para poder confiar en la información al tomar decisiones operativas.

**Why this priority**: Es el objetivo central del pedido — reemplaza un mock por dato real; sin esto no hay entrega de valor.

**Independent Test**: Abrir el detalle de un parque con registros de energía existentes y verificar que el gráfico muestra valores que coinciden con los registros devueltos por el endpoint de energía del parque.

**Acceptance Scenarios**:

1. **Given** un parque con registros de energía almacenados, **When** el usuario abre la vista de performance del parque, **Then** el gráfico de energía muestra los valores mensuales generados provenientes de esos registros reales.
2. **Given** el usuario cambia el rango de tiempo del gráfico (ej. 3M, 6M, 1A), **When** selecciona un nuevo rango, **Then** el gráfico se actualiza mostrando únicamente los meses reales correspondientes a ese rango.
3. **Given** un parque sin ningún registro de energía cargado, **When** el usuario abre su vista de performance, **Then** el gráfico muestra un estado vacío claro en lugar de datos de ejemplo o un gráfico roto.

---

### User Story 2 - Manejo de meses sin valor cargado (Priority: P2)

Como usuario, quiero que el gráfico siga siendo legible aunque algún mes no tenga energía cargada todavía (por ejemplo el mes en curso), para no perder visibilidad del parque por datos parciales.

**Why this priority**: Los registros reales pueden tener el mes presente pero el valor de energía aún sin cargar; el gráfico debe degradar con gracia y no quedar en blanco por un mes faltante.

**Independent Test**: Cargar un parque cuya serie de meses tenga algún `energiaMesKwh` nulo o ausente y verificar que el gráfico igual se renderiza, mostrando los meses con valor y tratando el mes faltante como cero o vacío de forma consistente (no como error).

**Acceptance Scenarios**:

1. **Given** un mes de la serie con `energiaMesKwh` nulo o ausente, **When** se renderiza el gráfico, **Then** los demás meses muestran su valor normalmente y el mes sin dato no rompe el gráfico ni se muestra como un valor engañoso (ej. no se dibuja como cero visualmente idéntico a "generó cero kWh" sin distinción).

---

### User Story 3 - Falla o demora en la consulta de energía (Priority: P3)

Como usuario, quiero saber si el gráfico no pudo cargar los datos de energía (por ejemplo por una falla de red), para no confundir un error con "el parque no generó energía".

**Why this priority**: Mejora de confiabilidad percibida, pero el flujo principal (P1) ya funciona sin esto; es un refinamiento de manejo de errores.

**Independent Test**: Simular una falla en la consulta de energía y verificar que se muestra un mensaje de error/reintento en el gráfico, distinto del estado "sin datos".

**Acceptance Scenarios**:

1. **Given** la consulta al endpoint de energía del parque falla, **When** el usuario está en la vista de performance, **Then** el gráfico muestra un estado de error (no un gráfico vacío silencioso) con opción de reintentar.

### Edge Cases

- ¿Qué pasa si el parque tiene registros de energía fuera del rango de fechas seleccionado (ej. todos anteriores a "6M")? El gráfico debe mostrar el rango vacío, no registros de otros rangos.
- ¿Qué pasa si el `parqueId` de la URL no corresponde a un parque existente? El gráfico no debe intentar renderizar; la vista de detalle ya maneja el caso de parque inexistente fuera de este alcance.
- ¿Qué pasa si el backend devuelve dos registros para el mismo `periodo` (mes duplicado)? El sistema DEBE usar un único punto por mes en el gráfico (el último recibido) para evitar series con meses repetidos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE reemplazar los datos de ejemplo (mock) del gráfico de energía en la vista de performance del parque por los registros de energía reales del parque consultado.
- **FR-002**: El sistema DEBE consultar los registros de energía correspondientes al parque actualmente visualizado, identificado por su id de parque.
- **FR-003**: El gráfico DEBE representar, para cada mes (`periodo`) devuelto, la energía generada del parque (`energiaMesKwh`) a lo largo del tiempo, un punto por mes.
- **FR-004**: El sistema DEBE seguir soportando la selección de rango temporal existente en la vista (ej. 3 meses/6 meses/1 año), filtrando la serie mensual real según el rango elegido, sin necesidad de agregar/sumar múltiples registros por punto ya que cada registro es un mes.
- **FR-005**: El sistema DEBE mostrar un estado vacío distinguible cuando el parque no tiene registros de energía para el rango seleccionado.
- **FR-006**: El sistema DEBE mostrar un estado de error distinguible cuando la consulta de energía no puede completarse, sin confundirlo con "sin datos".
- **FR-007**: El sistema DEBE tratar los meses con `energiaMesKwh` ausente o nulo sin romper el renderizado del gráfico ni ocultar los demás meses.
- **FR-008**: El sistema DEBE eliminar del código la fuente de datos de ejemplo (mock) que este gráfico usaba, una vez reemplazada por el dato real, para no dejar rutas muertas ni fuentes de verdad duplicadas.
- **FR-009**: La vista diaria (rango "1D") NO se alimenta de este endpoint (que solo devuelve granularidad mensual) y queda fuera de alcance de este cambio; sigue con su fuente de datos actual.

### Key Entities

- **Registro de Energía Mensual**: Medición de energía asociada a un parque para un mes (`periodo` en formato "YYYY-MM"); incluye la energía generada del mes (`energiaMesKwh`, puede estar ausente) y el ingreso del mes (`ingresoMes`); un registro por mes.
- **Parque**: Entidad ya existente cuyo detalle contiene la vista de performance donde se muestra este gráfico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los valores mostrados en el gráfico de energía del parque provienen de datos reales del parque, sin ningún dato de ejemplo remanente.
- **SC-002**: Un usuario puede identificar en menos de 3 segundos si el parque no tiene datos de energía para el rango elegido (estado vacío claro) versus si hubo un error de carga.
- **SC-003**: El cambio de rango temporal en el gráfico refleja los datos reales correspondientes en menos de 2 segundos en condiciones normales de red.
- **SC-004**: Cero regresiones visuales reportadas en el resto de la vista de performance del parque tras el reemplazo del mock (KPIs, sparklines y demás bloques no relacionados con este gráfico siguen funcionando igual).

## Assumptions

- El endpoint de energía del parque (`/parques/<parqueId>/energia`) devuelve una lista de registros mensuales con forma `{ periodo: "YYYY-MM", energiaMesKwh: number, ingresoMes: number }`; no incluye separación entre energía generada e inyectada. El acceso a datos existente (`lib/api/energia.ts`, tipo `RegistroEnergia`) asume una forma distinta (`energiaInyectadaKwh`/`energiaGeneradaKwh`/`creditoGenerado`/`ahorroEpec`) y debe actualizarse para reflejar la forma real antes de consumirse en el gráfico.
- Cada registro ya representa un punto mensual completo; no se requiere agregación por suma de múltiples registros por bucket temporal (a diferencia de lo asumido originalmente).
- Los rangos temporales del selector existente que aplican a este gráfico (3 meses/6 meses/1 año) se mantienen sin cambios de UX; solo cambia el origen de los datos. El rango "1D" no aplica a este endpoint (ver FR-009).
- El campo `ingresoMes` no forma parte del alcance visual de este gráfico salvo que se indique lo contrario; solo se usa `energiaMesKwh`.
- El reemplazo aplica a la vista de performance del parque (`ParkPerformanceView`) que hoy usa `getParkEnergySeries` del mock `gdd-performance-mock`; otras vistas con datos de energía mock fuera de esta pantalla quedan fuera de alcance salvo que se indique lo contrario.
