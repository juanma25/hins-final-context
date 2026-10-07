# Feature Specification: Vista DIA real + KPI 1M desde datos de 6M

**Feature Branch**: `004-daily-monthly-energy-view`

**Created**: 2026-07-20

**Status**: Draft

**Input**: User description: "en la vista de detalle de parques, actualmente se tiene la vision DIA (Datos fijos), 1M (sin datos aunque tenemos el mes actual en la vision de 6M), 6M está ok. 1A es para pedir los datos de todo el año, usar la misma de 6M, y todo, usar la misma de 6M. Para implementar la de dia, consumir este endpoint: {{baseUrl}}/parques/<id del parque>/energia?periodo=AAAA-MM-DD ... Con ello puedes graficar la pestaña de dia. En la 1M muestra el valor del mes actual que viene en la data que usamos en 6M"

## Clarifications

### Session 2026-07-20

- Q: El endpoint diario devuelve un único registro (no una serie horaria) con `energiaDiaKwh`, `ingresoDia`, `energiaTotalKwh`, `energiaInyectadaDiaKwh`, `energiaConsumidaDiaKwh` y `capturadoEn`. La pestaña DIA hoy muestra un gráfico horario mock (24 puntos). → A: La pestaña DIA deja de mostrar una curva horaria simulada y pasa a mostrar los totales reales del día consultado (energía generada, ingreso del día, y el resto de los campos disponibles) como KPI(s) del día, igual que 1M/6M/1A muestran totales por período — no hay dato horario real disponible, no se debe inventar una curva.
- Q: ¿De dónde sale el valor que debe mostrar la pestaña 1M? → A: De los mismos registros mensuales reales que ya se piden para 6M/1A/TODO (`GET /parques/{id}/energia`, sin `periodo`), filtrando el registro cuyo `periodo` es el mes calendario actual — sin pedir un endpoint nuevo para 1M.
- Q: La pestaña 1A hoy ya toma los últimos 12 registros de la misma serie mensual usada por 6M/TODO (no pide un endpoint separado). → A: Mantener ese comportamiento sin cambios; el pedido de "usar la misma de 6M para 1A y TODO" ya está resuelto por el código actual — se documenta acá para dejar constancia y que no se reabra como si faltara implementar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver datos reales del día en la pestaña DIA (Priority: P1)

Como usuario que revisa el detalle de un parque, quiero que la pestaña DIA muestre la energía real generada en el día seleccionado (no una curva de ejemplo fija), para confiar en el dato al evaluar el desempeño diario del parque.

**Why this priority**: Es el reemplazo central pedido — la pestaña DIA es hoy 100% mock; sin esto no hay entrega de valor.

**Independent Test**: Abrir el detalle de un parque, seleccionar la pestaña DIA para un día con registro real y verificar que los totales mostrados (energía del día, ingreso del día) coinciden con lo devuelto por el endpoint de energía para ese día.

**Acceptance Scenarios**:

1. **Given** un parque con registro de energía para el día actual, **When** el usuario abre la pestaña DIA, **Then** se muestra la energía generada real de ese día (`energiaDiaKwh`) y el ingreso real (`ingresoDia`), no valores de ejemplo.
2. **Given** el usuario navega a un día distinto dentro de la pestaña DIA, **When** selecciona esa fecha, **Then** el sistema consulta el endpoint de energía para ese día puntual y actualiza los totales mostrados.
3. **Given** un día sin ningún registro de energía, **When** el usuario lo selecciona en la pestaña DIA, **Then** se muestra un estado claro de "sin datos para este día" en lugar de un valor de ejemplo o un total inventado.

---

### User Story 2 - Ver el valor del mes actual en la pestaña 1M (Priority: P1)

Como usuario que revisa el detalle de un parque, quiero que la pestaña 1M muestre el valor real del mes en curso, para no encontrarme con un gráfico vacío cuando cambio de 6M a 1M.

**Why this priority**: Bug visible hoy — la pestaña existe pero no muestra nada aunque el dato ya está disponible en el mismo pedido que alimenta 6M; corregirlo no requiere endpoint nuevo, es la corrección de mayor impacto por menor esfuerzo.

**Independent Test**: Abrir el detalle de un parque con registros mensuales que incluyan el mes calendario actual, ir a la pestaña 1M y verificar que se muestra el registro de ese mes (mismo valor que aparece como el punto más reciente en 6M).

**Acceptance Scenarios**:

1. **Given** la serie mensual real (la misma usada por 6M) incluye un registro para el mes calendario en curso, **When** el usuario abre la pestaña 1M, **Then** se muestra ese registro (energía generada del mes) en vez de un gráfico vacío.
2. **Given** la serie mensual real no tiene ningún registro para el mes en curso, **When** el usuario abre la pestaña 1M, **Then** se muestra un estado de "sin datos este mes" en lugar de un gráfico vacío sin explicación.

---

### User Story 3 - Falla en la consulta de energía del día (Priority: P3)

Como usuario, quiero saber si la pestaña DIA no pudo cargar los datos del día seleccionado, para no confundir un error de carga con "el parque no generó energía ese día".

**Why this priority**: Mejora de confiabilidad percibida sobre el flujo ya funcional de P1; refinamiento de manejo de errores, consistente con el resto de las pestañas (6M/1A/TODO ya distinguen error de vacío).

**Independent Test**: Simular una falla en la consulta de energía diaria y verificar que la pestaña DIA muestra un estado de error con opción de reintentar, distinto del estado "sin datos para este día".

**Acceptance Scenarios**:

1. **Given** la consulta al endpoint de energía diaria falla, **When** el usuario está en la pestaña DIA, **Then** se muestra un estado de error (no un total vacío silencioso) con opción de reintentar.

---

### Edge Cases

- ¿Qué pasa si el endpoint diario devuelve más de un registro para el mismo día? → Se usa el más reciente por `capturadoEn`; no se suman ni promedian múltiples registros del mismo día.
- ¿Qué pasa si el usuario cambia rápido de día en día dentro de la pestaña DIA (varios clics seguidos)? → Cada cambio de día dispara su propia consulta; el usuario debe ver siempre el resultado correspondiente al último día seleccionado, no una respuesta de una consulta anterior ya descartada.
- ¿Qué pasa si el mes actual sí tiene registro pero con `energiaMesKwh` nulo/ausente? → La pestaña 1M trata ese registro igual que 6M/1A tratan un mes sin valor: se muestra como dato faltante, no como cero indistinguible de "generó cero".
- ¿Qué pasa al abrir la pestaña DIA por primera vez, sin que el usuario haya elegido un día? → Se consulta y muestra el día actual por defecto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE consultar la energía real de un día puntual del parque (`GET /parques/{parqueId}/energia?periodo=AAAA-MM-DD`) al abrir la pestaña DIA o al cambiar de día dentro de ella.
- **FR-002**: La pestaña DIA DEBE mostrar, para el día consultado, la energía generada real (`energiaDiaKwh`) y el ingreso real (`ingresoDia`) devueltos por el endpoint, reemplazando los datos fijos/mock actuales.
- **FR-003**: La pestaña DIA DEBE distinguir tres estados: dato real disponible, sin registro para ese día (vacío) y falla en la consulta (error con reintento) — sin mostrar ninguno de estos como si fuera otro.
- **FR-004**: La pestaña 1M DEBE mostrar el registro mensual real correspondiente al mes calendario actual, obtenido de la misma serie mensual ya consultada para 6M/1A/TODO, sin realizar un pedido adicional al backend.
- **FR-005**: Si la serie mensual no contiene un registro para el mes calendario actual, la pestaña 1M DEBE mostrar un estado de "sin datos" en vez de un gráfico vacío sin explicación.
- **FR-006**: Las pestañas 1A y TODO DEBEN seguir usando la misma serie mensual real ya consultada para 6M (sin endpoint ni pedido adicional), acotando la cantidad de meses mostrados según corresponda a cada pestaña.
- **FR-007**: El sistema NO DEBE inventar una curva horaria u otros puntos intermedios para el día seleccionado — el endpoint diario no provee esa granularidad, por lo que la pestaña DIA muestra totales del día, no una serie horaria simulada.
- **FR-008**: Al cambiar de día seleccionado en la pestaña DIA mientras una consulta anterior sigue en curso, el sistema DEBE mostrar el resultado correspondiente al día seleccionado más recientemente, descartando respuestas fuera de orden.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario que abre la pestaña DIA de un parque con datos reales ve el total de energía del día en menos de 3 segundos, sin datos de ejemplo mezclados con datos reales.
- **SC-002**: 100% de las pestañas de período (DIA, 1M, 6M, 1A, TODO) muestran datos reales o un estado explícito de "sin datos"/"error" — ninguna queda en blanco sin explicación.
- **SC-003**: Cambiar de pestaña 6M a 1M en un parque con mes actual cargado muestra el valor de ese mes sin recargar la página ni requerir una acción adicional del usuario.
- **SC-004**: Cambiar de día dentro de la pestaña DIA refleja siempre el día efectivamente seleccionado, incluso si el usuario cambia de día varias veces seguidas antes de que la primera consulta responda.

## Assumptions

- El endpoint diario (`?periodo=AAAA-MM-DD`) devuelve como máximo un registro relevante por día; si devuelve varios, se usa el de `capturadoEn` más reciente.
- La pestaña DIA no tiene un requisito de mostrar curva horaria — se documenta como cambio de expectativa respecto al mock actual (que sí simulaba 24 puntos), dado que el endpoint real no ofrece esa granularidad.
- El texto/etiqueta exacta de cada estado ("sin datos", "error", etc.) sigue el mismo lenguaje ya usado en 6M/1A/TODO (specs `002-park-energy-chart`), sin necesidad de definir copy nuevo en este spec.
- El mes calendario actual para la pestaña 1M se determina igual que hoy para la card de energía generada (`periodoActual`, ver `003-monthly-generation-kpi`).
