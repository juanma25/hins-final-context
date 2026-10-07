# Feature Specification: Integración con API Real y Eliminación de Mocks

**Feature Branch**: `001-api-integration-remove-mocks`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "A partir del contrato del backend @docs/openapi.json realiza la implementación de consumo de la API y elimina el uso de datos mocks, en caso de discrepancia de nombres, ajustalos para que correspondan con el backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Administrador ve datos reales de proyectos y parques (Priority: P1)

Un usuario con rol HINS_ADMIN abre el dashboard principal y las vistas de proyecto/parque, y ve la lista real de proyectos, parques, potencia instalada, fecha de puesta en marcha y demás atributos tal como existen en el backend, no valores de ejemplo fijos.

**Why this priority**: Es el flujo base de todo el sistema — sin datos reales de proyectos/parques, ninguna otra vista (dispositivos, alarmas, energía, ROI, mantenimiento) tiene sentido, porque todas cuelgan de un `parqueId` real.

**Independent Test**: Con un token JWT válido de un usuario HINS_ADMIN y al menos un proyecto/parque creado en el backend, cargar `/main` y la vista de detalle de parque; verificar que los valores mostrados coinciden con la respuesta de `GET /proyectos` y `GET /parques/{id}` y que ningún archivo `data/*-mock.ts` fue usado para poblar la pantalla.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con rol HINS_ADMIN y proyectos existentes en el backend, **When** visita el dashboard de proyectos, **Then** la lista mostrada coincide exactamente con la respuesta de `GET /proyectos`.
2. **Given** un parque existente, **When** el usuario abre su vista de detalle, **Then** los campos (potencia, ubicación, dirección, contacto) provienen de `GET /parques/{id}` y no de constantes locales (`park-config.ts` o mocks).
3. **Given** el backend no tiene proyectos cargados, **When** el usuario visita el dashboard, **Then** se muestra un estado vacío claro, no datos de ejemplo.

---

### User Story 2 - Socio/AGC/Owner ve dispositivos, alarmas, energía, ROI y mantenimiento de su parque (Priority: P2)

Un usuario con rol GDD_OWNER, AGC o SOCIO consulta las vistas de dispositivos, alarmas, registros de energía, ROI y mantenimiento de un parque al que tiene acceso, y ve datos reales devueltos por el backend, respetando el alcance de acceso de su rol (un SOCIO solo ve su propio parque).

**Why this priority**: Es el valor central del producto (monitoreo real de la operación); depende de que User Story 1 exista (necesita un parque real), pero es el corazón del uso diario.

**Independent Test**: Autenticado como SOCIO de un parque específico, solicitar dispositivos/alarmas/energía/roi/mantenimiento de ese parque y confirmar que los datos coinciden con las respuestas del backend; intentar acceder a un parque ajeno y confirmar que se recibe y maneja el error 403.

**Acceptance Scenarios**:

1. **Given** un SOCIO con participación en un parque, **When** consulta dispositivos de ese parque, **Then** la lista viene de `GET /parques/{parqueId}/dispositivos` ordenada por `ultimaSincronizacion` descendente, tal como especifica el contrato.
2. **Given** un SOCIO sin participación en un parque, **When** intenta consultar alarmas de ese parque, **Then** el sistema muestra un mensaje de acceso denegado basado en la respuesta 403 del backend, sin datos simulados de respaldo.
3. **Given** un parque con alarmas activas y limpias, **When** se filtra por `estado=ACTIVA`, **Then** solo se muestran alarmas activas, replicando el filtro soportado por `GET /parques/{parqueId}/alarmas`.
4. **Given** un parque sin registros de ROI aún, **When** el usuario abre la vista de ROI, **Then** se muestra un estado vacío en vez de la data mock histórica actual.

---

### User Story 3 - Administrador gestiona usuarios, sincronización y registra datos operativos (Priority: P3)

Un usuario HINS_ADMIN administra usuarios (listar, ver, actualizar, dar de baja), registra energía/ROI/mantenimiento para un parque, crea proyectos/parques/socios, y administra la configuración de sincronización con proveedores externos (estaciones, dispositivos, energía, alarmas), todo contra el backend real.

**Why this priority**: Son operaciones administrativas menos frecuentes que las consultas diarias (P1/P2), pero necesarias para que el sistema sea operable sin intervención manual en base de datos.

**Independent Test**: Autenticado como HINS_ADMIN, crear un proyecto, luego un parque asociado, luego un socio; verificar que cada entidad creada aparece en listados subsiguientes vía las respuestas reales del backend, y que ninguna pantalla de administración conserva datos mock como fallback.

**Acceptance Scenarios**:

1. **Given** un HINS_ADMIN, **When** crea un proyecto con nombre, modelo de negocio y ubicación, **Then** el proyecto creado aparece en `GET /proyectos` con los mismos datos devueltos por `POST /proyectos`.
2. **Given** un HINS_ADMIN, **When** actualiza el rol o estado activo de un usuario, **Then** el cambio se refleja al recargar `GET /usuarios/{id}`.
3. **Given** un HINS_ADMIN, **When** consulta o actualiza el intervalo/habilitado de sincronización para un modelo (ESTACIONES, DISPOSITIVOS, ENERGIA, ALARMAS), **Then** los valores mostrados y actualizados corresponden exactamente a `GET`/`PATCH /sincronizacion/configuraciones/{modelo}`.
4. **Given** un HINS_ADMIN, **When** consulta logs de ejecución de sincronización para un modelo, **Then** la lista viene de `GET /sincronizacion/logs` respetando el límite solicitado.

---

### Edge Cases

- ¿Qué pasa si el backend devuelve 401 (token vencido/ inválido) en cualquier llamada? El sistema debe redirigir a login o mostrar mensaje de sesión expirada, sin caer en datos mock como respaldo silencioso.
- ¿Qué pasa si el backend devuelve 403 por rol no autorizado o SOCIO sin participación en el parque? El sistema debe mostrar un mensaje de acceso denegado explícito, no una pantalla vacía ambigua ni datos falsos.
- ¿Qué pasa si el backend devuelve 404 (parque/usuario inexistente)? El sistema debe mostrar un estado "no encontrado", no fallback a mocks.
- ¿Qué pasa si un campo nullable del contrato (p. ej. `serialNumber`, `causa`, `fechaLimpiada`) viene `null`? La UI debe manejar el valor ausente de forma legible (placeholder tipo "—" o "Sin datos"), no un error de render.
- ¿Qué pasa si un nombre de campo usado hoy en el frontend (p. ej. camelCase en inglés o alias local) no coincide con el contrato (p. ej. español: `potenciaTotalKwp`, `fechaPuestaEnMarcha`)? Debe renombrarse el campo en frontend para igualar el contrato — no se agregan capas de mapeo/alias permanentes.
- ¿Qué pasa si la respuesta de un listado viene vacía (`[]`)? Cada vista debe mostrar su propio estado vacío en vez de reusar datos de ejemplo previos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST consumir todos los endpoints definidos en `docs/openapi.json` (auth, usuarios, proyectos, parques, socios, dispositivos, alarmas, energía, ROI, mantenimiento, sincronización) para poblar las pantallas correspondientes, en lugar de los archivos `data/*-mock.ts`.
- **FR-002**: El sistema MUST enviar el header `Authorization: Bearer <JWT>` en toda solicitud a un endpoint que lo requiera según el contrato (todos excepto `/auth/register` y `/auth/login`).
- **FR-003**: El sistema MUST renombrar cualquier campo, tipo o enum del frontend cuyo nombre difiera del contrato del backend (por ejemplo, entidades y atributos en español tal como los define `openapi.json`: `nombre`, `modelo`, `ubicacion`, `potenciaTotalKwp`, `fechaPuestaEnMarcha`, `parqueId`, roles `HINS_ADMIN`/`GDD_OWNER`/`AGC`/`SOCIO`, etc.), de modo que coincidan exactamente con el contrato, incluyendo tipos de datos y nulabilidad.
- **FR-004**: El sistema MUST eliminar el uso de los archivos de datos mock en `data/*-mock.ts` y `lib/park-config.ts` (constantes de potencia/autoconsumo/inversión) una vez reemplazados por llamadas reales, salvo los que representen únicamente enumeraciones de dominio sin datos de ejemplo (p. ej. definición de tipos de proyecto), que se mantienen documentados como excepción.
- **FR-005**: El sistema MUST propagar y mostrar errores de backend (401, 403, 404, 409) de forma distinguible para el usuario, sin sustituir la respuesta fallida por datos simulados.
- **FR-006**: El sistema MUST restringir la visibilidad de datos de parque (dispositivos, alarmas, energía, ROI, mantenimiento) según el rol del usuario autenticado y su participación como socio, reflejando las reglas de autorización descritas en el contrato (HINS_ADMIN, GDD_OWNER, AGC, SOCIO con alcance a su propio parque).
- **FR-007**: El sistema MUST implementar el flujo de login (`POST /auth/login`) y registro (`POST /auth/register`) contra el backend real, almacenando y utilizando el `access_token` devuelto para solicitudes subsiguientes.
- **FR-008**: El sistema MUST permitir a HINS_ADMIN listar, ver, actualizar y dar de baja usuarios (`GET/PATCH/DELETE /usuarios`, `/usuarios/{id}`, `/usuarios/me`) contra el backend real.
- **FR-009**: El sistema MUST permitir crear y listar proyectos, parques y socios (`POST`/`GET /proyectos`, `/parques`, `/parques/{parqueId}/socios`) contra el backend real, reemplazando cualquier simulación existente (p. ej. `console.log` en el diálogo de creación de proyecto).
- **FR-010**: El sistema MUST permitir registrar y listar energía, ROI y mantenimiento por parque (`POST`/`GET /parques/{parqueId}/energia|roi|mantenimiento`) contra el backend real.
- **FR-011**: El sistema MUST permitir a HINS_ADMIN listar y actualizar configuraciones de sincronización (`GET /sincronizacion/configuraciones`, `PATCH /sincronizacion/configuraciones/{modelo}`) y listar logs de ejecución (`GET /sincronizacion/logs`), contra el backend real.
- **FR-012**: El sistema MUST manejar valores nulos de campos opcionales del contrato (p. ej. `serialNumber`, `causa`, `causaId`, `fechaLimpiada`, `stationExternalId`) sin romper el render de la interfaz.
- **FR-013**: El sistema MUST listar alarmas de un parque con soporte de filtro opcional por `estado` (`ACTIVA`/`LIMPIA`) tal como lo permite el contrato.

### Key Entities *(include if feature involves data)*

- **Usuario**: cuenta con acceso al sistema; atributos: id, email, nombre, role (HINS_ADMIN, GDD_OWNER, AGC, SOCIO), activo.
- **Proyecto**: iniciativa de negocio bajo un modelo (GDD, GDC, GDCV); atributos: id, nombre, modelo, ubicación, fecha de alta, activo. Se relaciona con uno o más Parques.
- **Parque**: instalación física asociada a un proyecto; atributos: id, proyectoId, potencia total (kWp), fecha de puesta en marcha, identificadores externos de estación, dirección, coordenadas, contacto. Contiene Dispositivos, Alarmas, registros de Energía, ROI y Mantenimiento; puede tener Socios.
- **Socio**: participante con interés económico en un parque; atributos: id, parqueId, nombre, porcentaje de participación, tipo de cargo (con/sin potencia), número de medidor, usuario asociado opcional.
- **Dispositivo**: equipo monitoreado dentro de un parque; atributos: id, parqueId, identificador externo, número de serie, nombre, tipo, modelo, versión de software, datos de monitoreo, última sincronización.
- **Alarma**: evento de alarma de un dispositivo/parque; atributos: id, parqueId, dispositivoId opcional, identificador externo, nombre, causa, tipo, severidad, fecha generada, estado (ACTIVA/LIMPIA), fecha limpiada, última sincronización.
- **RegistroEnergia**: registro periódico de energía de un parque; atributos: id, parqueId, periodo, energía inyectada/generada (kWh), crédito generado, ahorro EPEC.
- **RegistroRoi**: registro periódico de retorno de inversión de un parque/socio; atributos: id, parqueId, socioId opcional, periodo, inversión meta, crédito acumulado, payback estimado, TIR.
- **RegistroMantenimiento**: registro periódico de mantenimiento de un parque; atributos: id, parqueId, periodo, cantidad de mantenciones, costos asociados, detalle.
- **ConfiguracionSincronizacion**: configuración de sincronización con proveedor externo por modelo (ESTACIONES, DISPOSITIVOS, ENERGIA, ALARMAS); atributos: modelo, intervalo en ms, habilitado, última ejecución (estado, fechas, registros procesados/omitidos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las pantallas que hoy leen de `data/*-mock.ts` obtienen sus datos de llamadas al backend real tras completar esta funcionalidad.
- **SC-002**: Cero referencias a archivos `data/*-mock.ts` de datos de ejemplo permanecen importadas en código de producción (se permite retener únicamente definiciones de enumeraciones de dominio, documentadas como excepción).
- **SC-003**: Un usuario de cada rol (HINS_ADMIN, GDD_OWNER, AGC, SOCIO) puede completar su flujo principal (ver datos de su(s) parque(s) autorizados) sin encontrar un error no manejado, verificado manualmente contra el backend real.
- **SC-004**: El 100% de los nombres de campos y valores de enumeración usados en la interfaz coinciden exactamente (mismo string, mismo casing) con los definidos en `docs/openapi.json`.
- **SC-005**: Toda solicitud que reciba 401/403/404 del backend resulta en un mensaje visible al usuario en menos de 1 segundo desde la respuesta, sin pantalla en blanco ni dato simulado.

## Assumptions

- El backend descrito en `docs/openapi.json` (`http://localhost:3000` en entorno local) está disponible y accesible durante el desarrollo e integración; para otros entornos (staging/producción) se asume una URL base configurable por variable de entorno.
- El flujo de autenticación es el estándar JWT Bearer descrito en el contrato: login devuelve `access_token`, que se adjunta a cada solicitud posterior; no hay refresh token en el contrato, por lo que expiración de sesión se maneja re-dirigiendo a login.
- Los archivos `data/*-mock.ts` que sólo definen tipos e enumeraciones de dominio sin datos de ejemplo (p. ej. tipos de proyecto en `new-project-mock.ts`) pueden conservarse; los que contienen datos de ejemplo (parques, ROI, energía, mantenimiento, socios) deben eliminarse una vez reemplazados.
- Los ajustes de nombres para eliminar discrepancias se aplican en el código frontend (tipos, componentes, hooks) para igualar el contrato; el contrato del backend (`docs/openapi.json`) se trata como fuente de verdad y no se modifica.
- El feature de creación de proyecto vía diálogo (`NewProjectDialog.tsx`), actualmente simulado con `console.log`, se conecta a `POST /proyectos` como parte de esta funcionalidad.
- Los detalles de UI para estados de carga, vacío y error se implementan con patrones ya existentes en el sistema de diseño (shadcn/Radix), sin introducir nuevas librerías.
