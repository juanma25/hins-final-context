# Feature Specification: Configuración de administrador (Tarifas, Tipos de cambio y Costos)

**Feature Branch**: `013-admin-config-tarifas-costos`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "Agregar opciones de configuración para el admin: Tarifas y Tipos de cambio en el menú global (solo admin) y Costos dentro de un proyecto. Cada una con lista paginada, botón crear, y editar/borrar por fila. Reutilizar patrones y componentes existentes."

## Clarifications

### Session 2026-10-07

- Q: ¿En qué vistas de proyecto aparece "Costos"? → A: En los tres sidebars de parque (GDD, GDC y GDCV), solo admin; la lista se filtra por el proyecto que se está viendo y el parque por defecto del formulario es el actual.
- Q: ¿Cómo se ingresan Moneda y Unidad en Costos y Tarifas? → A: Moneda con lista fija (ARS, USD); Unidad con sugerencias pero admite texto libre. La lista vive en un solo lugar compartido.
- Q: ¿Qué pasa con una tarifa o tipo de cambio ya usado? → A: Se permite editar y borrar; la confirmación advierte que puede afectar cálculos existentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar Tarifas (Priority: P1)

El administrador HINS entra a "Tarifas" desde el menú lateral global y ve una lista paginada de versiones de tarifa (nombre, valor energía, valor inyección, unidad, vigente desde). Puede crear una tarifa nueva, agregar una nueva versión a una tarifa existente (mismo nombre), editar una versión vigente o futura y eliminarla.

**Why this priority**: Las tarifas alimentan la facturación y el ROI; sin ellas no se puede mantener la configuración económica. Además establece los componentes compartidos (lista paginada, formulario, confirmación de borrado, ítems de menú) que usan las otras dos historias.

**Independent Test**: Iniciar sesión como admin, abrir Tarifas, crear una tarifa, editarla, eliminarla y verificar paginación con más de una página de datos.

**Acceptance Scenarios**:

1. **Given** un admin en el menú global, **When** observa el menú lateral, **Then** ve las opciones Proyectos, Tarifas y Tipos de cambio.
2. **Given** un admin en Tarifas con más registros que el tamaño de página, **When** navega a la página siguiente, **Then** ve el siguiente grupo de registros y el indicador de página/total actualizado.
3. **Given** el formulario de crear, **When** completa nombre, valores, unidad y fecha de vigencia válidos y confirma, **Then** la tarifa aparece en la lista y se informa el éxito.
4. **Given** una tarifa con nombre existente, **When** el admin crea otra con el mismo nombre y fecha de vigencia posterior a la última versión, **Then** se agrega como nueva versión.
5. **Given** una versión de tarifa vigente o futura, **When** el admin la edita o elimina (con confirmación), **Then** el cambio se refleja en la lista.
6. **Given** una versión pasada (no vigente ni futura), **When** el admin ve su fila, **Then** las acciones editar y borrar no están disponibles.
7. **Given** una fecha de vigencia no posterior a la última versión, **When** intenta guardar, **Then** ve un mensaje de error claro y no se guarda nada.

---

### User Story 2 - Gestionar Tipos de cambio (Priority: P2)

El admin entra a "Tipos de cambio" y ve una lista paginada (tipo: PROYECTO/REAL, periodicidad: DIARIA/MENSUAL/ANUAL, período, valor, unidad ARS/USD). Puede crear, editar y borrar registros, y filtrar por tipo y periodicidad.

**Why this priority**: Necesario para convertir costos y facturación entre monedas, pero depende menos de otros módulos que las tarifas.

**Independent Test**: Crear un tipo de cambio mensual, editar su valor, filtrar por tipo, eliminarlo.

**Acceptance Scenarios**:

1. **Given** el admin en Tipos de cambio, **When** pulsa Crear e ingresa tipo, periodicidad, período con el formato correspondiente a la periodicidad y valor > 0, **Then** el registro aparece en la lista.
2. **Given** un período con formato incompatible con la periodicidad (ej. "2026" con MENSUAL), **When** intenta guardar, **Then** ve un error de validación.
3. **Given** un registro existente, **When** lo edita o elimina (con confirmación), **Then** la lista refleja el cambio.
4. **Given** la lista, **When** aplica filtro por tipo o periodicidad, **Then** solo ve los registros coincidentes, paginados.

---

### User Story 3 - Gestionar Costos dentro de un proyecto (Priority: P2)

Al entrar a un proyecto, el menú lateral cambia: desaparecen Tarifas y Tipos de cambio y aparece "Costos". Allí el admin ve una lista paginada de costos del proyecto (parque, concepto, tipo FIJO/VARIABLE, valor, moneda, unidad) y puede crear, editar y borrar.

**Why this priority**: Completa la configuración económica por proyecto; requiere el contexto de proyecto.

**Independent Test**: Entrar a un proyecto, verificar el menú, crear un costo asociado a un parque del proyecto, editarlo y eliminarlo.

**Acceptance Scenarios**:

1. **Given** un admin dentro de un proyecto, **When** observa el menú, **Then** ve Costos y no ve Tarifas ni Tipos de cambio.
2. **Given** un admin en un parque GDD, GDC o GDCV, **When** observa el menú, **Then** ve Costos en los tres tipos.
3. **Given** el formulario de crear costo, **When** elige un parque, **Then** solo se ofrecen parques del proyecto actual.
4. **Given** costos de varios proyectos, **When** el admin abre Costos de un proyecto, **Then** solo ve los de ese proyecto.
5. **Given** un costo existente, **When** lo edita o elimina (con confirmación), **Then** la lista refleja el cambio.

---

### User Story 4 - Visibilidad restringida por rol (Priority: P1)

Solo el rol HINS_ADMIN ve y accede a Tarifas, Tipos de cambio y Costos. Los demás roles no ven las opciones ni pueden entrar por URL directa.

**Why this priority**: Son datos económicos sensibles; la restricción es requisito de seguridad.

**Independent Test**: Con un usuario no admin, verificar que el menú no muestra las opciones y que acceder por URL directa lo redirige o muestra acceso denegado.

**Acceptance Scenarios**:

1. **Given** un usuario no admin, **When** observa el menú, **Then** no ve Tarifas, Tipos de cambio ni Costos.
2. **Given** un usuario no admin, **When** abre por URL directa una de las pantallas, **Then** no puede ver ni operar datos.

---

### Edge Cases

- Lista vacía: se muestra estado vacío con invitación a crear.
- Borrar el único registro de la última página: la lista retrocede a la página anterior válida.
- Error del servicio (conexión, validación, conflicto): mensaje claro, sin perder lo ingresado en el formulario.
- Doble envío del formulario: se evita crear duplicados.
- Borrado cancelado en la confirmación: no cambia nada.
- Edición de una tarifa futura con fecha que cruza versiones vecinas: se rechaza con mensaje explicativo.
- Un parque que no pertenece al proyecto no puede asignarse a un costo.
- Sesión expirada durante una operación: se redirige a `/login`; sin rol admin: se redirige a `/main`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El menú lateral global MUST mostrar Proyectos, Tarifas y Tipos de cambio al admin; los demás roles ven el menú actual sin Tarifas ni Tipos de cambio.
- **FR-002**: Dentro de un proyecto (sidebars GDD, GDC y GDCV), el menú MUST ocultar Tarifas y Tipos de cambio y mostrar Costos, solo para admin.
- **FR-003**: Cada sección (Tarifas, Tipos de cambio, Costos) MUST mostrar una lista paginada con total de registros y navegación entre páginas.
- **FR-004**: Cada sección MUST ofrecer un botón de crear que abre un formulario con validación de campos.
- **FR-005**: Cada fila MUST ofrecer acciones de editar y borrar; borrar MUST requerir confirmación explícita.
- **FR-006**: Tarifas MUST permitir crear una tarifa nueva o agregar una versión a una existente; editar y borrar MUST limitarse a versiones vigentes o futuras.
- **FR-007**: Tipos de cambio MUST validar que el período coincida con la periodicidad (diaria AAAA-MM-DD, mensual AAAA-MM, anual AAAA) y que el valor sea mayor a 0; MUST permitir filtrar por tipo y periodicidad.
- **FR-008**: La lista de Costos MUST estar acotada al proyecto que se está viendo; en el formulario el parque se elige entre los parques de ese proyecto y por defecto es el parque que se está viendo.
- **FR-009**: Los valores monetarios MUST validarse como no negativos (tarifas, costos) o positivos (tipos de cambio).
- **FR-010**: Los datos MUST obtenerse y modificarse contra el backend según su contrato publicado (swagger); sin datos simulados.
- **FR-011**: Tras crear, editar o borrar, la lista MUST actualizarse y mostrar un aviso inline de éxito (o el mensaje de error si falla).
- **FR-012**: El acceso a las tres secciones MUST estar restringido al rol HINS_ADMIN, también por URL directa; un usuario sin ese rol es redirigido a `/main` sin ver datos.
- **FR-013**: Lista paginada, formulario de crear/editar, confirmación de borrado, mensajes de estado y entradas de menú MUST ser componentes/utilidades únicos reutilizados por las tres secciones, sin lógica duplicada; deben seguir los patrones visuales y de interacción existentes (p. ej. gestión de socios).
- **FR-014**: Los textos de la interfaz MUST estar en español y ser consistentes con el resto de la aplicación.
- **FR-015**: Moneda MUST elegirse de una lista fija (ARS, USD); Unidad (tarifas y costos) MUST ofrecer sugerencias y admitir texto libre. Las opciones están definidas en un único lugar compartido.
- **FR-016**: Al editar o borrar una tarifa o un tipo de cambio, el diálogo (de edición o de confirmación de borrado) MUST advertir que el cambio puede afectar cálculos existentes (facturación, ROI).

### Key Entities

- **Tarifa (versión)**: nombre, valor de energía, valor de inyección, unidad, fecha de vigencia desde. Varias versiones comparten nombre y forman un historial.
- **Tipo de cambio**: tipo (PROYECTO/REAL), periodicidad (DIARIA/MENSUAL/ANUAL), período, valor, unidad (ARS/USD).
- **Costo**: proyecto, parque, concepto, tipo (FIJO/VARIABLE), valor, moneda, unidad.
- **Proyecto / Parque**: contexto al que pertenecen los costos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un admin crea, edita o elimina un registro en cualquiera de las tres secciones en menos de 1 minuto.
- **SC-002**: El 100% de los usuarios no admin no ve ni accede a las tres secciones.
- **SC-003**: Las tres secciones muestran 20 registros por página y cambian de página en menos de 2 segundos con conjuntos de hasta 1.000 registros.
- **SC-004**: El 100% de los intentos con datos inválidos muestra un mensaje que indica el campo y el motivo, sin guardar datos.
- **SC-005**: El comportamiento de lista, formulario y borrado es idéntico en las tres secciones (mismos elementos y mensajes).
- **SC-006**: Agregar una cuarta sección de configuración similar requiere solo definir sus columnas, campos y acceso a datos, sin nuevos componentes de lista, diálogo o confirmación.

## Assumptions

- Tamaño de página por defecto: 20 registros.
- Tarifas se listan como versiones; ver el historial por nombre es un filtro opcional por nombre.
- La unidad de tipo de cambio es ARS/USD.
- La autenticación y roles existen o se completan por separado; esta feature aplica la restricción HINS_ADMIN con el mecanismo disponible.
- Fuera de alcance: importación masiva, historial de auditoría, conversión automática de monedas en dashboards.
