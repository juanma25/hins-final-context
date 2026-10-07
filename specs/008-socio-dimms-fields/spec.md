# Feature Specification: Campos No. Suministro y No. Contrato al Crear Socio (DIMMs)

**Feature Branch**: `008-socio-dimms-fields`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Al crear un socio, para el modelo DIMMs debemos agregar 2 campos más: No. Suministro y No. Contrato, además del No. de Medidor existente. API confirmada (suministroNumero, contratoNumero, ambos requeridos en CreateSocioDto junto con medidorNumero)."

## Clarifications

### Session 2026-09-15

- Q: "modelo DIMMs" no corresponde a ningún `ModeloNegocio` existente (GDD, GDC, GDCV) ni requiere una opción en el formulario — ¿qué es? → A: DIMMs es una de las dos APIs externas ya conectadas al sistema; no se selecciona ni se muestra en el formulario de alta de socio.
- Q: ¿"No. de Suministro" y "No. de Contrato" son obligatorios siempre, o condicionados? → A: Se piden junto con "No. de Medidor" — si se ingresa No. de Medidor, los otros dos son obligatorios; si No. de Medidor queda vacío, ninguno de los dos es obligatorio (lo que implica que "No. de Medidor" pasa de ser siempre obligatorio a ser opcional-disparador).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alta de socio captura No. de Suministro y No. de Contrato junto al No. de Medidor (Priority: P1)

Como usuario que da de alta un socio, quiero poder ingresar el número de suministro y el número de contrato del socio cuando ingreso su número de medidor, para que el registro del socio quede completo con los datos que exige el negocio para los socios medidos.

**Why this priority**: Es el requisito central solicitado; sin estos campos el alta de socio queda incompleta para los socios que sí tienen medidor, y la API ahora los exige como obligatorios en ese caso.

**Independent Test**: Puede probarse abriendo el formulario de alta de socio, completando nombre, participación, tipo de cargo y número de medidor, y verificando que el formulario exige también No. de Suministro y No. de Contrato antes de permitir confirmar, y que el socio se crea exitosamente con los tres números guardados.

**Acceptance Scenarios**:

1. **Given** el usuario completa el número de medidor en el formulario de alta de socio, **When** completa también No. de Suministro y No. de Contrato y confirma, **Then** el socio se crea exitosamente y los tres números quedan asociados al socio.
2. **Given** el usuario completó el número de medidor, **When** deja vacío el No. de Suministro o el No. de Contrato e intenta confirmar, **Then** el sistema le impide continuar y le indica cuál campo obligatorio falta.
3. **Given** el usuario deja vacío el número de medidor, **When** intenta confirmar el alta sin completar No. de Suministro ni No. de Contrato, **Then** el sistema permite continuar sin exigir esos dos campos.

---

### Edge Cases

- ¿Qué sucede si el usuario ingresa el mismo valor en No. de Medidor, No. de Suministro y No. de Contrato? El sistema no debe bloquear esto salvo que el backend lo rechace; no hay regla de negocio conocida que prohíba valores iguales entre estos tres campos.
- ¿Qué sucede con socios ya existentes que fueron creados antes de este cambio y no tienen No. de Suministro ni No. de Contrato? Quedan fuera de alcance de esta funcionalidad (no se migran datos existentes); solo aplica a altas nuevas.
- ¿Qué sucede si el usuario completa No. de Suministro o No. de Contrato pero deja vacío el No. de Medidor? El No. de Medidor sigue siendo el campo que determina la obligatoriedad de los otros dos (FR-005); no se exige nada adicional en este caso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario de alta de socio DEBE incluir un campo "No. de Suministro" y un campo "No. de Contrato", además del campo "No. de Medidor" ya existente.
- **FR-002**: El campo "No. de Medidor" DEBE dejar de ser obligatorio en sí mismo y pasar a ser el disparador de obligatoriedad de los otros dos campos (ver FR-005); el usuario DEBE poder confirmar el alta de un socio sin completar ninguno de los tres.
- **FR-003**: El sistema DEBE enviar los valores ingresados de "No. de Medidor", "No. de Suministro" y "No. de Contrato" al crear el socio, junto con el resto de los datos ya enviados hoy (nombre, participación, tipo de cargo).
- **FR-004**: El formulario de alta de socio DEBE incluir "No. de Suministro" y "No. de Contrato" para todos los socios, sin condicionarlos a un modelo de negocio ni pedir al usuario que seleccione un modelo/API en el formulario — "DIMMs" es una de las dos APIs externas ya integradas al sistema y no es una opción visible ni seleccionable en el formulario de alta de socio.
- **FR-005**: El sistema DEBE tratar "No. de Medidor" como el campo que determina si "No. de Suministro" y "No. de Contrato" son obligatorios: si el usuario completa "No. de Medidor", el sistema DEBE exigir también "No. de Suministro" y "No. de Contrato" antes de permitir confirmar el alta; si el usuario deja "No. de Medidor" vacío, el sistema NO DEBE exigir "No. de Suministro" ni "No. de Contrato".

### Key Entities

- **Socio**: Persona o entidad con participación en un parque. Ya tiene nombre, porcentaje de participación y tipo de cargo; el número de medidor pasa de obligatorio a opcional, y se le agregan número de suministro y número de contrato (obligatorios solo si hay número de medidor).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los socios creados con número de medidor quedan registrados también con No. de Suministro y No. de Contrato, sin necesidad de completarlos después por otra vía.
- **SC-002**: El 100% de los intentos de alta de socio con número de medidor completado pero No. de Suministro o No. de Contrato vacíos son bloqueados antes de enviarse, con un mensaje que identifica el campo faltante.
- **SC-003**: El 100% de los intentos de alta de socio sin número de medidor se completan sin que el sistema exija No. de Suministro ni No. de Contrato.
- **SC-004**: El tiempo para completar el alta de socio con los dos campos nuevos no aumenta en más de 15 segundos respecto al flujo actual, para el caso en que se ingresa número de medidor.

## Assumptions

- Los campos "No. de Suministro" y "No. de Contrato" son de texto libre (como "No. de Medidor" hoy), sin formato ni validación adicional más allá de ser obligatorios cuando aplica.
- No se requiere migrar ni completar retroactivamente estos campos para socios ya existentes.
- La UI de estos campos reutiliza el mismo patrón visual (input + etiqueta) ya usado para "No. de Medidor" en el formulario de alta de socio.
- Cuando el usuario no completa "No. de Medidor" (y por lo tanto tampoco "No. de Suministro"/"No. de Contrato"), el sistema envía estos tres campos al backend según lo que su contrato de datos acepte para representar "sin dato" (por ejemplo cadena vacía), ya que el detalle exacto de esa representación es una decisión técnica que se resuelve en la fase de planificación, no en esta especificación.
