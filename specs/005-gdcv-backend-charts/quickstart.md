# Quickstart: Validar gráficos GDCV desde backend

## Prerequisitos

- Backend real accesible (o el mock server usado en desarrollo) con al menos un
  `Proyecto` de `modelo: "GDCV"` y su `Parque` asociado.
- Ese parque debe tener registros en `GET /parques/{id}/energia` (mensual) para poder
  validar el caso "con datos"; y opcionalmente ningún registro en otro parque GDCV
  para validar el caso "vacío".
- `npm run dev` corriendo localmente.

## Escenario 1 — Datos reales (US1, P1)

1. Iniciar sesión y navegar a `/gdcv/performance?proyectoId=<id-de-un-proyecto-GDCV-con-datos>`.
2. Verificar que el chart de "Energía Generada del Parque" (rangos 6M/1A/TODO/1M)
   muestra los mismos valores que devuelve `GET /parques/{parqueId}/energia`
   (comparar contra la respuesta cruda del endpoint).
3. Verificar que el KPI primario "Generada en [mes actual]" y su sparkline coinciden
   con `GET /parques/{parqueId}/energia?periodo=<mes-actual>`.
4. Cambiar al rango "1D" y verificar que el gráfico horario se carga desde
   `/api/parques/{parqueId}/energia-dia?periodo=<hoy>` (Network tab), no desde
   `data/gdcv-daily-mock.ts`.

**Referencia**: [contracts/energia-gdcv.md](./contracts/energia-gdcv.md),
[data-model.md](./data-model.md#estados-de-la-vista-derivados-no-persistidos)

## Escenario 2 — Sin datos (edge case)

1. Navegar a `/gdcv/performance?proyectoId=<id-de-un-proyecto-GDCV-sin-registros>`.
2. Verificar que el chart muestra "Sin registros de energía para este período" y que
   el KPI primario muestra `—` sin inventar un valor, en cualquier rango.

## Escenario 3 — Error de backend (edge case)

1. Simular una falla en `GET /parques/{parqueId}/energia` (apagar backend o forzar
   401/500 en un entorno de prueba).
2. Verificar que la vista muestra "No se pudo cargar la energía del parque." con un
   botón "Reintentar", y que un 401 redirige a `/login` (comportamiento ya validado
   en GDD, debe replicarse igual en GDCV).

## Escenario 4 — Confirmar que ROI y Mantenimiento ya cumplen (no deben regresionar)

1. Navegar a `/gdcv/roi?proyectoId=<id>` y confirmar que "Inversión Recuperada",
   "Pendiente de recuperar" y "TIR" siguen reflejando `listRoi` (sin cambios
   esperados en esta feature).
2. Navegar a `/gdcv/mantenimiento?proyectoId=<id>` y confirmar que la tabla sigue
   viniendo de `listMantenimiento` (sin cambios esperados).

## Validación automatizada

- `npm run test -- tests/lib/park-energy-series.test.ts` — las funciones puras
  reutilizadas por GDCV deben seguir pasando sin modificación.
- Nuevo test de integración de página (ver tasks.md) para
  `app/gdcv/performance/page.tsx`, siguiendo el mismo patrón que el test existente
  de `app/gdd/performance/page.tsx` (si existe) o el de
  `tests/lib/api/energia-roi-mantenimiento.test.ts` como referencia de mocking de
  `apiFetch`.
