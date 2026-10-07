# Feature Specification: Gráficos GDCV desde backend

**Feature Branch**: `005-gdcv-backend-charts`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "Los proyectos de tipo GDD ya construyen sus gráficos a partir de datos reales del backend, pero los proyectos de tipo GDCV siguen usando datos mock/hardcodeados. Necesitamos que los gráficos de GDCV se construyan a partir del backend, igual que en GDD."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver rendimiento real de un parque GDCV (Priority: P1)

Un usuario (socio o administrador) con un proyecto de tipo GDCV abre la vista de rendimiento (performance) de su parque y espera ver los gráficos de generación de energía construidos con los datos reales del backend, tal como ya ocurre para proyectos GDD.

**Why this priority**: Es la vista más consultada por los usuarios de GDCV y actualmente muestra datos ficticios, lo que genera desconfianza en el producto y decisiones basadas en información incorrecta.

**Independent Test**: Puede probarse abriendo un parque GDCV real con datos de generación cargados en backend y verificando que los valores mostrados en el gráfico de performance coinciden con los del backend, no con `data/gdcv-mock.ts`.

**Acceptance Scenarios**:

1. **Given** un parque GDCV con datos de generación de energía en el backend, **When** el usuario abre la vista de performance, **Then** el gráfico muestra los valores reales del backend para el período seleccionado.
2. **Given** el backend no tiene datos para el período solicitado, **When** el usuario abre la vista de performance, **Then** el sistema muestra un estado vacío/sin datos claro, sin recurrir a datos mock.
3. **Given** el backend responde con error o está inaccesible, **When** el usuario abre la vista de performance, **Then** el sistema muestra un mensaje de error, sin caer nunca en datos mock como reemplazo silencioso.

---

### User Story 2 - Ver retorno de inversión (ROI) real de un parque GDCV (Priority: P2)

Un socio con un proyecto GDCV abre la vista de ROI y espera ver el cálculo construido con datos reales de generación e inversión del backend.

**Why this priority**: El ROI es un dato financiero sensible que impacta directamente la confianza del socio en la plataforma; mostrarlo mockeado es un riesgo mayor que solo un gráfico informativo.

**Independent Test**: Puede probarse abriendo la vista de ROI de un parque GDCV con datos de inversión y generación reales en backend, y verificando que las cifras coinciden con las esperadas según esos datos, no con `data/gdcv-roi-mock.ts`.

**Acceptance Scenarios**:

1. **Given** un parque GDCV con datos de inversión y generación en backend, **When** el usuario abre la vista de ROI, **Then** los valores mostrados (retorno, período de recupero, etc.) se calculan a partir de esos datos reales.
2. **Given** datos de inversión incompletos en backend para ese parque, **When** el usuario abre la vista de ROI, **Then** el sistema indica qué información falta en lugar de completar con valores mock.

---

### User Story 3 - Ver datos diarios y de mantenimiento reales (Priority: P3)

Un usuario abre las vistas de detalle diario y de mantenimiento de un parque GDCV y espera ver información real proveniente del backend, igual que en las vistas de performance y ROI.

**Why this priority**: Completa la paridad con GDD en todas las vistas de GDCV, pero es de menor impacto inmediato porque se consulta con menor frecuencia que performance y ROI.

**Independent Test**: Puede probarse abriendo la vista diaria/mantenimiento de un parque GDCV y verificando que los datos coinciden con backend, no con `data/gdcv-daily-mock.ts` ni `data/gdcv-agc-mock.ts`.

**Acceptance Scenarios**:

1. **Given** un parque GDCV con registros diarios de generación en backend, **When** el usuario abre la vista de detalle diario, **Then** los valores mostrados coinciden con los del backend.
2. **Given** un parque GDCV con datos de mantenimiento en backend, **When** el usuario abre la vista de mantenimiento, **Then** la información mostrada proviene del backend.

---

### Edge Cases

- ¿Qué ocurre si un parque GDCV aún no tiene ningún dato cargado en backend (proyecto recién creado)? El sistema debe mostrar un estado vacío, nunca datos mock como relleno.
- ¿Qué ocurre si la respuesta del backend llega parcial (algunos campos ausentes) para un parque GDCV? El sistema debe reflejar solo lo disponible y señalar lo faltante, sin inventar valores.
- ¿Qué ocurre durante la carga de datos (loading) en las vistas GDCV? Debe mostrarse un estado de carga consistente con el ya usado en GDD, no un placeholder con datos mock.
- ¿Qué ocurre si el usuario cambia entre distintos parques GDCV rápidamente? Cada vista debe reflejar los datos del parque actualmente seleccionado, sin mostrar datos residuales del anterior ni mock.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST construir los gráficos de la vista de performance de GDCV a partir de datos de generación de energía obtenidos del backend, eliminando el uso de `data/gdcv-mock.ts` para ese fin.
- **FR-002**: El sistema MUST construir los cálculos y gráficos de la vista de ROI de GDCV a partir de datos reales del backend, eliminando el uso de `data/gdcv-roi-mock.ts` para ese fin.
- **FR-003**: El sistema MUST construir la vista de detalle diario de GDCV a partir de datos reales del backend, eliminando el uso de `data/gdcv-daily-mock.ts` para ese fin.
- **FR-004**: El sistema MUST construir la vista de mantenimiento de GDCV a partir de datos reales del backend, eliminando el uso de `data/gdcv-agc-mock.ts` para ese fin.
- **FR-005**: El sistema MUST mostrar un estado vacío explícito cuando el backend no tiene datos disponibles para el parque/período solicitado, en lugar de sustituir con datos mock.
- **FR-006**: El sistema MUST mostrar un estado de error explícito cuando la petición al backend falla, en lugar de sustituir con datos mock.
- **FR-007**: El comportamiento de carga, vacío y error de las vistas GDCV MUST ser consistente con el ya implementado para las vistas equivalentes de GDD.
- **FR-008**: El sistema MUST seguir seleccionando el parque correcto vía `proyectoId` para GDCV, de la misma forma en que ya se resuelve para GDD.

### Key Entities

- **Parque (GDCV)**: Instalación de generación distribuida bajo el modelo GDCV; posee datos de generación de energía, inversión y mantenimiento asociados en el backend.
- **Dato de generación de energía**: Serie de valores de energía generada por un parque en el tiempo (diario/mensual), usada para construir los gráficos de performance.
- **Dato de inversión/ROI**: Información financiera asociada a un parque GDCV usada para calcular el retorno de inversión.
- **Registro de mantenimiento**: Información de eventos o estado de mantenimiento de un parque GDCV.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los parques GDCV con datos cargados en backend muestran gráficos de performance que reflejan exactamente esos datos, verificado por comparación directa contra la respuesta del backend.
- **SC-002**: Ninguna vista de GDCV (performance, ROI, diario, mantenimiento) presenta datos provenientes de los archivos mock una vez completada la migración.
- **SC-003**: Los usuarios de proyectos GDCV experimentan los mismos tiempos de carga percibidos que los usuarios de GDD para vistas equivalentes (sin degradación notable).
- **SC-004**: El 100% de los escenarios de "sin datos" o "error de backend" en GDCV muestran un mensaje claro al usuario en lugar de datos inventados.

## Assumptions

- El backend ya expone (o expondrá antes de la implementación) endpoints equivalentes para GDCV a los que hoy alimentan las vistas de GDD; su definición técnica exacta se resuelve en la fase de planificación, no en esta especificación.
- La prioridad P1 (performance) es la vista con mayor uso y por eso se aborda primero; ROI y detalle diario/mantenimiento pueden entregarse en iteraciones posteriores sin bloquear la primera.
- Los archivos `data/gdcv-*-mock.ts` se retiran progresivamente a medida que cada vista migra a backend, no todos de una vez.
- Los modelos de datos y contratos de API para GDCV son análogos, aunque no necesariamente idénticos, a los ya usados por GDD (ver `lib/api/energia.ts`, `lib/park-energy-series.ts`).
