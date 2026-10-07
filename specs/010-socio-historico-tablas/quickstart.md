# Quickstart: Validar tablas de histórico por socio con campos específicos

## Prerrequisitos

- Backend corriendo en `http://localhost:3000`, operativo (confirmado por el usuario).
- Un parque con al menos un socio, y datos históricos conocidos en algún rango de fechas para ese socio.

## Validación automatizada

```sh
npm run test -- tests/components/ui/date-picker.test.ts tests/components/gdcv/SocioHistoricoDialog.test.ts
```

## Validación manual end-to-end

1. `npm run dev`, ir a la tabla de socios de un parque, clic en "Ver histórico" de un socio.
2. Seleccionar como fecha "desde" el día de **hoy** (el caso que antes fallaba) y luego una fecha "hasta" distinta.
   - **Esperado (fix del bug)**: las tres consultas se disparan de inmediato; no hace falta evitar seleccionar "hoy".
3. Cambiar la fecha "desde" a otro valor distinto, con resultados ya mostrados en pantalla.
   - **Esperado (FR-001, SC-001)**: los tres históricos se vuelven a consultar de inmediato con el nuevo rango.
4. Con datos conocidos en el rango, confirmar que:
   - **Facturación** se ve como tabla con columnas: Última lectura (fecha y hora), Activa exportada T1/T2/T3/T0, Activa importada T0 (FR-002, SC-002).
   - **Registros** se ve como tabla con columnas: Energía activa importada, Tarifa, Demanda activa exportada, Fecha y hora (FR-003, SC-002).
   - **Mediciones** se ve como tabla con columnas: Último registro (fecha y hora), Última lectura (fecha y hora) (FR-004, SC-002).
5. Si algún resultado no trae uno de los campos esperados, confirmar que esa celda se ve vacía/"sin dato" sin romper la fila ni la tabla (FR-006, SC-003).
