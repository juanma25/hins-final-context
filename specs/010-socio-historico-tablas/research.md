# Research: Tablas de Histórico por Socio con Campos Específicos

## Decision: Causa raíz del bug "nunca dispara consulta"

**Rationale**: `components/gdcv/SocioHistoricoDialog.tsx` pasa `value={desde ?? new Date()}` y `value={hasta ?? new Date()}` a `DatePicker`, porque `DatePickerProps.value` hoy es `Date` no-opcional (`components/ui/date-picker.tsx:16`). Esto hace que, mientras el usuario no ha elegido nada, el `Calendar` (`react-day-picker`, `mode="single"`) muestre "hoy" ya seleccionado visualmente. `react-day-picker` en modo `single` sin `required` deselecciona (retorna `undefined` a `onSelect`) cuando se hace clic en un día ya marcado como seleccionado. `DatePicker.onSelect` es `(date) => { if (date) onValueChange(date) }` — si el usuario clickea justo "hoy" (el día ya "seleccionado" por el fallback), `date` llega `undefined` y `onValueChange` nunca se invoca. El estado `desde`/`hasta` del diálogo permanece `undefined` para siempre en ese caso, `isValidHistoricoRange` nunca es `true`, y ninguna de las tres consultas se dispara — reproduce exactamente "no se hace ninguna consulta" reportado.

**Alternatives considered**:
- Dejar el fallback y solo documentar "no selecciones la fecha de hoy": descartado — es un bug de UX real, no un caso de borde a evitar por el usuario.
- Envolver la lógica de selección en el diálogo para ignorar el toggle-off: descartado — trata el síntoma en un solo consumidor en vez de corregir el componente compartido, dejando el mismo bug latente para cualquier futuro uso de `DatePicker` sin valor inicial.

## Decision: Extender `DatePicker` para aceptar `value: Date | undefined`

**Rationale**: Es el fix correcto en la fuente (Principio V — corregir donde está el defecto, no rodearlo). Los otros dos consumidores (`DailyEnergyTotalsBlock.tsx`, `DailyGenerationChartBlock.tsx`) siempre pasan una `Date` definida hoy, así que ampliar el tipo a `Date | undefined` es un cambio compatible (no requiere tocarlos). Cuando `value` es `undefined`, el trigger muestra un placeholder ("Seleccionar fecha") en vez de fabricar una fecha, y `Calendar` recibe `selected={undefined}` (ningún día pre-marcado), eliminando el toggle-off accidental.

**Alternatives considered**:
- Crear un componente `DateRangePicker` nuevo específico para este diálogo: descartado — el diálogo no necesita selección de rango en un solo calendario (dos `DatePicker` independientes ya alcanzan), y crear un componente nuevo para evitar tocar uno compartido es una abstracción no justificada.

## Decision: Filas tipadas por histórico con fallback "sin dato" por campo ausente

**Rationale**: `payload` sigue siendo `unknown[]` (contrato de la API, sin esquema fijo — feature 009). Para FR-002/FR-003/FR-004/FR-006, se define una función de mapeo por tipo (`mapFacturacionRow`, `mapRegistroRow`, `mapMedicionRow`) que, para cada item del payload, intenta leer cada campo esperado (ej. `ultima_lectura_fecha_hora`) y devuelve `string | undefined` por campo — la tabla renderiza `"—"` (o similar) cuando el valor es `undefined`, sin filtrar la fila completa.

**Alternatives considered**:
- Validar el payload completo con un schema (zod/similar) y descartar filas inválidas: descartado — introduce una dependencia nueva no justificada (Principio V) para un caso ya cubierto por "leer campo por campo con fallback", y violaría FR-006 (que exige mostrar la fila igual, solo con la celda vacía).

## No unresolved NEEDS CLARIFICATION remain.
