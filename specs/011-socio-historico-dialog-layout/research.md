# Research: Layout Contenido del Diálogo de Histórico de Socio

## Decision: Reusar el patrón `max-h + overflow-hidden + DIALOG_BODY_SCROLL` de `TermsAndConditionsDialog.tsx`

**Rationale**: El repo ya resuelve "diálogo con contenido potencialmente largo que no debe romper el layout" en `components/legal/TermsAndConditionsDialog.tsx`: `DialogContent` usa `className="flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"`, con `DialogHeader` flush (`DIALOG_HEADER_FLUSH`, fuera del área de scroll) y un `<div className={DIALOG_BODY_SCROLL}>` (`min-h-0 flex-1 overflow-y-auto ...`) envolviendo el contenido. `SocioHistoricoDialog` hoy no tiene ninguno de estos límites (`className="sm:max-w-[600px]"` sin `max-h`/`overflow`), lo que permite que el contenido crezca sin límite (causa raíz del bug reportado, según el screenshot).

**Alternatives considered**:
- Definir un `max-h`/`overflow` ad-hoc distinto para este diálogo: descartado — reusar la constante ya nombrada (`DIALOG_BODY_SCROLL`) mantiene el "ritmo" visual documentado ahí mismo ("mismo ritmo que SHEET_OPS_SCROLL") y evita un tercer patrón de scroll en el repo (Principio V).

## Decision: Cada tabla de histórico tiene su propio contenedor con scroll, además del scroll general del body

**Rationale**: FR-003/FR-004 exigen que el scroll de una tabla no mueva ni afecte a las otras secciones — un único `DIALOG_BODY_SCROLL` en todo el body (como en `TermsAndConditionsDialog`, que solo tiene texto) no alcanza aquí, porque scrollear para ver más filas de "Registros" empujaría "Facturación"/"Mediciones" fuera de vista igual que hoy. Se agrega un contenedor por tabla con `max-h-[16rem]` (o similar, a definir en el componente) + `overflow-y-auto overflow-x-auto`, de modo que cada tabla se desplaza de forma independiente dentro de su propio espacio acotado, y el body general (`DIALOG_BODY_SCROLL`) solo se usa para desplazarse entre las tres secciones si el diálogo completo no entra en el alto disponible.

**Alternatives considered**:
- Solo agrandar el diálogo sin limitar el alto de cada tabla individualmente (un único scroll de body): descartado — no cumple FR-003 (cada tabla con su propio scroll) tal como lo pide el usuario explícitamente ("cada tabla/sección debe tener scroll contenido").
- Virtualización de filas (react-window o similar): descartado — nueva dependencia no justificada (Principio V) para listas del tamaño esperado en este dominio (históricos de un socio en un rango de fechas, no miles de filas).

## Decision: Ampliar el ancho máximo del diálogo

**Rationale**: FR-001 pide que el diálogo sea "más grande"; dado que las tablas de Facturación tienen 6 columnas y Registros 4, un ancho mayor (p. ej. `sm:max-w-4xl` en vez de `sm:max-w-[600px]`) reduce la necesidad de scroll horizontal en la mayoría de los casos, dejando el scroll horizontal por tabla (FR-005) como recurso para pantallas angostas o columnas con contenido largo, no como comportamiento normal en pantallas de escritorio.

**Alternatives considered**:
- Mantener el ancho actual y confiar solo en scroll horizontal: descartado — no resuelve la queja de "diálogo demasiado chico" reportada explícitamente.

## No unresolved NEEDS CLARIFICATION remain.
