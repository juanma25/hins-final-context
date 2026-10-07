# Quickstart: Validar histórico de Registros, Facturación y Mediciones por socio

## Prerrequisitos

- Backend corriendo en `http://localhost:3000` con los tres endpoints confirmados (`/docs`).
- `pnpm install` ya hecho; al menos un parque con al menos un socio creado (ver features 007/008).

## Validación automatizada

```sh
npm run test -- tests/components/gdcv/SocioHistoricoDialog.test.ts tests/app/api/parques/socios-historico-routes.test.ts
```

## Validación manual end-to-end

1. `npm run dev`, ir a la vista de socios de un parque con al menos un socio.
2. En la tabla de socios, hacer clic en el botón de histórico de una fila.
   - **Esperado (FR-001/FR-002)**: se abre el diálogo con selector de rango de fechas, sin datos mostrados aún.
3. Seleccionar solo "desde" (sin "hasta") — confirmar que no se dispara ninguna consulta (FR-003).
4. Seleccionar "hasta" anterior a "desde" — confirmar que el sistema lo bloquea (FR-008, SC-002).
5. Seleccionar un rango válido con datos conocidos.
   - **Esperado (FR-004/FR-005/SC-001)**: en menos de 3 clics desde el paso 2, se ven los tres históricos (Registros, Facturación, Mediciones) diferenciados entre sí.
6. Seleccionar un rango sin datos conocidos para alguno de los tres.
   - **Esperado (FR-006/SC-003)**: ese histórico muestra "sin datos", los otros dos (si tienen datos) se muestran con normalidad.
7. Simular una falla (p. ej. detener el backend) y volver a seleccionar un rango.
   - **Esperado (FR-007/SC-004)**: el/los histórico(s) afectado(s) muestran error + botón de reintentar, sin necesidad de cerrar el diálogo.
