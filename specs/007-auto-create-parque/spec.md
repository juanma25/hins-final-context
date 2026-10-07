# Feature Specification: Creación Automática de Parque al Crear Proyecto

**Feature Branch**: `007-auto-create-parque`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Cuando se crea un proyecto, se debe crear un parque de una vez, con el mismo nombre del proyecto. API docs: http://localhost:3000/docs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alta de proyecto genera su parque automáticamente (Priority: P1)

Como usuario que da de alta un nuevo proyecto, quiero que el sistema cree automáticamente el parque asociado a ese proyecto en el mismo momento, para no tener que crear el proyecto y luego, en un paso separado, crear su parque manualmente.

**Why this priority**: Es el flujo central solicitado; sin esto el usuario sigue teniendo que hacer dos pasos manuales y el proyecto queda "incompleto" (sin parque) tras su creación.

**Independent Test**: Puede probarse creando un proyecto desde el formulario de alta y verificando que, sin ninguna acción adicional, aparece un parque asociado a ese proyecto, identificable por el nombre del proyecto.

**Acceptance Scenarios**:

1. **Given** el usuario completa el formulario de alta de proyecto con datos válidos, **When** confirma la creación, **Then** el sistema crea el proyecto y, a continuación, crea un parque asociado a ese proyecto sin requerir datos adicionales del usuario.
2. **Given** el proyecto y su parque fueron creados, **When** el usuario visualiza el detalle del proyecto o su listado de parques, **Then** el parque creado se identifica con el mismo nombre que el proyecto.

---

### User Story 2 - Manejo de fallo al crear el parque (Priority: P2)

Como usuario que crea un proyecto, quiero ser informado si el parque asociado no pudo crearse, para saber que el proyecto quedó sin parque y poder actuar en consecuencia.

**Why this priority**: Evita que el usuario asuma que el flujo se completó correctamente cuando en realidad el proyecto quedó en un estado incompleto (creado pero sin parque).

**Independent Test**: Puede probarse simulando un error en la creación del parque (p. ej. backend no disponible) y verificando que el usuario recibe una notificación clara indicando que el proyecto se creó pero el parque no pudo generarse.

**Acceptance Scenarios**:

1. **Given** el proyecto se creó correctamente, **When** la creación del parque asociado falla, **Then** el sistema notifica al usuario que el proyecto existe pero el parque no pudo crearse, sin revertir la creación del proyecto.

---

### Edge Cases

- ¿Qué sucede si el proyecto se crea correctamente pero la creación del parque falla por un error de red o del servidor? El proyecto debe permanecer creado y el usuario debe ser notificado del fallo parcial (ver User Story 2).
- ¿Qué sucede si el usuario intenta crear un segundo parque manualmente para un proyecto que ya tiene su parque automático? El sistema debe permitirlo si el dominio de negocio admite múltiples parques por proyecto (ver Assumptions); no se debe bloquear la creación automática por esta razón.
- ¿Qué sucede si el nombre del proyecto se modifica luego de creado? El nombre mostrado del parque asociado sigue el comportamiento definido en Assumptions (se deriva del proyecto en el momento de la creación, no se sincroniza retroactivamente salvo que la relación proyecto-parque lo exponga dinámicamente).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE crear un parque automáticamente e inmediatamente después de que un proyecto se crea exitosamente, sin requerir una acción manual adicional del usuario.
- **FR-002**: El parque creado automáticamente DEBE quedar asociado al proyecto recién creado.
- **FR-003**: El parque creado automáticamente DEBE identificarse (mostrarse al usuario) con el mismo nombre que el proyecto que lo originó.
- **FR-004**: Si la creación del parque falla, el sistema DEBE conservar el proyecto ya creado y DEBE informar al usuario que el parque no pudo crearse.
- **FR-005**: El sistema DEBE usar 0 (cero) como valor por defecto para la potencia total instalada del parque creado automáticamente, dado que el formulario de alta de proyecto no solicita este dato al usuario.
- **FR-006**: El sistema DEBE usar la fecha de creación del proyecto como fecha de puesta en marcha del parque creado automáticamente, dado que el formulario de alta de proyecto no solicita este dato al usuario.
- **FR-007**: El usuario DEBE poder ver el parque creado automáticamente en el listado de parques del proyecto inmediatamente después de la creación.

### Key Entities

- **Proyecto**: Representa una iniciativa de generación de energía dada de alta por el usuario. Tiene nombre, modelo de negocio y ubicación. Es el disparador de la creación automática del parque.
- **Parque**: Representa la instalación física asociada a un proyecto. Se relaciona con un único proyecto de origen y hereda su identificación visible (nombre) de dicho proyecto. Tiene potencia total instalada y fecha de puesta en marcha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los proyectos creados exitosamente cuentan con al menos un parque asociado inmediatamente después de la creación, sin pasos manuales adicionales.
- **SC-002**: El usuario puede ver el parque asociado a un proyecto recién creado en menos de 5 segundos desde que confirma el alta del proyecto.
- **SC-003**: En el 100% de los casos en que la creación automática del parque falla, el usuario recibe una notificación explícita del fallo en la misma sesión de alta del proyecto.

## Assumptions

- El nombre del parque no se persiste como campo propio en el parque, sino que se deriva del proyecto asociado para su presentación (dado que el modelo de datos de parque expuesto por la API no incluye un campo de nombre propio).
- Un proyecto puede tener más de un parque en el dominio de negocio general, pero esta funcionalidad solo cubre la creación automática de un parque inicial al momento del alta del proyecto.
- La creación automática del parque ocurre en el mismo flujo/transacción lógica del alta del proyecto (inmediatamente después, no en un proceso diferido o asincrónico).
- Si la creación del parque falla, no se revierte la creación del proyecto (se prioriza no perder el proyecto ya creado antes que garantizar atomicidad estricta entre ambas creaciones).
- La potencia total instalada del parque autogenerado inicia en 0 kWp y se espera que el usuario la actualice manualmente más adelante (fuera del alcance de esta funcionalidad).
- La fecha de puesta en marcha del parque autogenerado se toma igual a la fecha de creación del proyecto.
