# Feature Specification: KPI "Energía Generada" del mes actual (datos reales)

**Feature Branch**: `003-monthly-generation-kpi`

**Created**: 2026-07-18

**Status**: Draft

**Input**: User description: "Ahora debemos ajustar el grafico que dice energia generada en el detalle del parque, que es la data del mes actual, se usa este endpoint: {{baseUrl}}/parques/<parqueId>/energia?periodo=2026-07. Ese endpoint va a retornar para cada dia la energia generada: [{ \"fecha\": \"2026-07-18\", \"energiaDiaKwh\": 83.22, \"ingresoDia\": 6082.95 }]"

## Clarifications

### Session 2026-07-18

- Q (implícita, resuelta por evidencia de código): ¿A qué elemento de la vista de performance del parque se refiere "el gráfico que dice energía generada, que es la data del mes actual"? → A: La card KPI destacada ("Energía Generada", hoy mock `highlightAprilCardMock` + sparkline `generationSparklinePoints`) en `ParkPerformanceView` — es la única pieza de la vista que muestra un total del mes actual con una serie de puntos (sparkline), coincidiendo con la forma diaria-dentro-del-mes que devuelve el endpoint nuevo. No se refiere al gráfico de barras mensual ya resuelto en `specs/002-park-energy-chart` (ese usa granularidad mensual, no diaria).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el total de energía generada del mes actual con datos reales (Priority: P1)

Como usuario que revisa el detalle de un parque, quiero ver en la card destacada de energía cuánto generó el parque en el mes en curso con datos reales día por día, no un valor de ejemplo, para confiar en la cifra al evaluar el desempeño reciente del parque.

**Why this priority**: Es el reemplazo central pedido — sin esto no hay entrega de valor.

**Independent Test**: Abrir el detalle de un parque con registros diarios reales para el mes en curso y verificar que el total mostrado en la card coincide con la suma de `energiaDiaKwh` devueltos por el endpoint para ese mes.

**Acceptance Scenarios**:

1. **Given** un parque con registros diarios de energía para el mes actual, **When** el usuario abre la vista de performance del parque, **Then** la card de energía generada muestra el total del mes (suma de `energiaDiaKwh` de todos los días devueltos), no el valor mock.
2. **Given** el parque no tiene ningún registro diario para el mes actual, **When** el usuario abre la vista, **Then** la card muestra un total de 0 / un estado que comunique "sin datos este mes" en vez de un valor de ejemplo o un total inventado.

---

### User Story 2 - Ver la tendencia diaria del mes en la sparkline (Priority: P2)

Como usuario, quiero que la mini-gráfica (sparkline) de la card refleje la evolución día a día real del mes en curso, para detectar de un vistazo si la generación viene creciendo o cayendo.

**Why this priority**: Complementa el valor total (P1) con contexto de tendencia; la card ya tiene el elemento visual, solo se reemplaza su fuente de datos.

**Independent Test**: Cargar un parque con varios días de datos reales dentro del mes actual y verificar que la sparkline tiene un punto por día devuelto, en el mismo orden cronológico, sin puntos de relleno inventados.

**Acceptance Scenarios**:

1. **Given** el endpoint devuelve N días con dato para el mes actual, **When** se renderiza la card, **Then** la sparkline muestra exactamente N puntos, ordenados por fecha ascendente.
2. **Given** un día del mes con `energiaDiaKwh` nulo o ausente, **When** se renderiza la sparkline, **Then** ese día no rompe la serie (se trata como 0 o se omite de forma consistente, sin cortar el resto de los puntos).

---

### User Story 3 - Comparación contra el inicio de operaciones (Priority: P3)

Como usuario, quiero seguir viendo el texto comparativo bajo el total del mes (hoy "8.240 kWh desde el Inicio"), para mantener el contexto histórico que ya ofrece la card.

**Why this priority**: Es un elemento visual ya presente que da contexto adicional, pero no es el dato que este feature reemplaza (no hay equivalente de "acumulado desde el inicio" en el endpoint mensual/diario nuevo); se documenta para decidir explícitamente si queda mock o se oculta.

**Independent Test**: Verificar que, tras el cambio, la card sigue mostrando algún texto de comparación (mock, por excepción documentada) o que fue removido deliberadamente, sin quedar en un estado a medio migrar (texto mock mezclado con datos reales sin aclaración).

**Acceptance Scenarios**:

1. **Given** la card ahora usa datos reales para el total y la sparkline, **When** se revisa el texto comparativo, **Then** ese texto sigue siendo mock por excepción documentada (no hay fuente real equivalente) y no se presenta como si fuera un dato real.

### Edge Cases

- ¿Qué pasa si estamos a inicio de mes y todavía no hay ningún día cargado? La card debe mostrar 0 / estado vacío, no el valor del mes anterior ni un mock.
- ¿Qué pasa si la consulta al endpoint falla (red, servidor)? La card debe distinguir "falló la carga" de "no generó nada este mes", igual que ya se resolvió para el gráfico de barras mensual en `specs/002-park-energy-chart`.
- ¿Qué pasa si el backend devuelve el mismo `fecha` dos veces? Se usa el último recibido para ese día (mismo criterio que la deduplicación por `periodo` ya usada en el gráfico mensual).
- ¿Qué mes se consulta? El mes calendario actual al momento de cargar la vista (no el mes seleccionado en el selector de rango del gráfico de barras, que es una pieza distinta de la misma pantalla).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE reemplazar el valor total de energía generada mostrado en la card destacada por la suma real de `energiaDiaKwh` de todos los días devueltos por el endpoint para el mes calendario actual.
- **FR-002**: El sistema DEBE consultar los registros diarios de energía del parque actualmente visualizado para el mes en curso, identificando el parque por su id y el mes por `periodo` en formato `"YYYY-MM"`.
- **FR-003**: El sistema DEBE reemplazar los puntos de la sparkline de la card por un punto por cada día real devuelto, ordenados cronológicamente.
- **FR-004**: El sistema DEBE tratar un día con `energiaDiaKwh` ausente o nulo sin romper el total ni la sparkline (se computa como 0 en la suma y no corta la serie de puntos).
- **FR-005**: El sistema DEBE mostrar un total de 0 (o estado equivalente claro) cuando no hay ningún día cargado para el mes actual, sin mostrar el valor mock ni un total de un mes distinto.
- **FR-006**: El sistema DEBE distinguir un fallo de carga de la card (error de red/servidor) de la ausencia de datos, siguiendo el mismo criterio ya usado en el gráfico de barras mensual (`specs/002-park-energy-chart`).
- **FR-007**: El título de la card ("Generada en [Mes]") DEBE reflejar el mes calendario actual real, no un mes hardcodeado como hoy ("Generada en Abril").
- **FR-008**: El sistema DEBE eliminar del código el mock que esta card usaba (`highlightAprilCardMock.kwh`, `generationSparklinePoints`) una vez reemplazado por dato real, evitando fuentes de verdad duplicadas para el mismo valor.
- **FR-009**: El texto comparativo bajo el total (hoy "X kWh desde el Inicio") queda fuera de este reemplazo por falta de equivalente real; se mantiene como excepción documentada, sin presentarlo como dato real.

### Key Entities

- **Registro Diario de Energía**: Medición de energía de un parque para un día específico (`fecha` en formato `"YYYY-MM-DD"`); incluye la energía generada del día (`energiaDiaKwh`, puede estar ausente) y el ingreso del día (`ingresoDia`, fuera del alcance visual de este feature). Fuente: `GET /parques/{parqueId}/energia?periodo=YYYY-MM`.
- **Parque**: Entidad ya existente cuyo detalle contiene la card de energía generada del mes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% del valor total y de los puntos de la sparkline mostrados en la card de energía generada del mes provienen de datos reales del parque, sin ningún dato de ejemplo remanente en el total ni en la sparkline.
- **SC-002**: Un usuario puede identificar en menos de 3 segundos si el parque no tiene datos este mes (estado vacío/0 claro) versus si hubo un error de carga.
- **SC-003**: Cero regresiones visuales reportadas en el resto de la vista de performance del parque (gráfico de barras mensual, KPIs secundarios, tabla de historial) tras este cambio.

## Assumptions

- El endpoint `/parques/{parqueId}/energia?periodo=YYYY-MM` devuelve un array de registros diarios `{ fecha: "YYYY-MM-DD"; energiaDiaKwh: number | null; ingresoDia: number | null }`, según la muestra provista por el usuario — no hay swagger/openapi.json actualizado que lo documente todavía (mismo tipo de riesgo ya señalado en `specs/002-park-energy-chart/research.md` Decision 1 para el endpoint mensual sin query param).
- El "mes actual" se determina por la fecha del sistema al momento de cargar la vista (mismo criterio que ya usa el resto del dashboard para "hoy"/mes en curso), no por selección del usuario.
- El texto "X kWh desde el Inicio" bajo el total queda mock por excepción documentada (sin fuente real de acumulado histórico), igual que otros elementos ya exceptuados en `ParkPerformanceView` (ver `specs/002-park-energy-chart/data-model.md`).
- Este feature es independiente de `specs/002-park-energy-chart` (que resolvió el gráfico de barras con granularidad mensual, no diaria) y no lo modifica; ambos conviven en `ParkPerformanceView`.
- El reemplazo aplica a la card destacada de energía generada en `components/gdd/ParkPerformanceView.tsx` (`KpiPrimary` alimentado por `highlightAprilCardMock`/`generationSparklinePoints`); otras vistas con datos de energía mock fuera de esta pantalla quedan fuera de alcance salvo que se indique lo contrario.
