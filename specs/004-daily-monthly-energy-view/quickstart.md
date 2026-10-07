# Quickstart: Vista DIA real + KPI 1M desde datos de 6M

## Prerrequisitos

- `HINS_API_BASE_URL` configurada y backend HINS accesible con al menos un parque que tenga:
  - Registros mensuales (`GET /parques/{id}/energia`) incluyendo el mes calendario actual (para validar 1M).
  - Al menos un registro diario puntual (`GET /parques/{id}/energia?periodo=AAAA-MM-DD` para hoy) (para validar DIA).
- Sesión autenticada (cookie de sesión válida — mismo flujo que el resto del dashboard GDD).
- `npm install` ya corrido; `npm run test` y `npm run build` disponibles.

## Validar pestaña 1M (User Story 2)

1. `npm run dev`, ir a `/gdd/performance?proyectoId=<id con parque válido>`.
2. En la card "Energía Generada del Parque", click en la pestaña **1M**.
3. **Esperado**: se muestra el registro del mes calendario actual (mismo valor que aparece como último punto en la pestaña 6M) — no un gráfico vacío.
4. Repetir con un parque cuya serie mensual NO incluya el mes actual. **Esperado**: estado "sin datos este mes", no un gráfico vacío sin explicación.

## Validar pestaña DIA (User Story 1)

1. En la misma vista, click en la pestaña **DIA**.
2. **Esperado**: se dispara una consulta a `GET /api/parques/{parqueId}/energia-dia?periodo=<hoy AAAA-MM-DD>` (ver Network tab) y se muestran los totales reales del día (energía generada, ingreso) — no la curva horaria mock anterior.
3. Cambiar de día con el selector existente. **Esperado**: nueva consulta por el día seleccionado, totales actualizados.
4. Cambiar de día varias veces rápido (antes de que la primera respuesta llegue). **Esperado**: el total final mostrado corresponde siempre al último día seleccionado (FR-008) — verificar simulando latencia (throttling de red en devtools).
5. Seleccionar un día sin registros. **Esperado**: estado "sin datos para este día".
6. Simular falla de red/backend (ej. apagar backend momentáneamente). **Esperado**: estado de error con botón de reintentar (User Story 3), distinto del estado "sin datos".

## Validar que 1A/TODO no cambiaron (Decision 5)

1. Click en pestañas **1A** y **TODO**.
2. **Esperado**: mismo comportamiento que antes de este feature (últimos 12 meses / histórico completo de la misma serie mensual) — sin regresión.

## Tests automatizados

```bash
npm run test -- park-energy-series
npm run build
```

- `getRegistroDelMesActual` y el mapeo de `RegistroEnergiaDia` deben tener tests Vitest cubriendo: registro presente, ausente, múltiples registros del día (se toma el más reciente por `capturadoEn`), campos numéricos `null`.
