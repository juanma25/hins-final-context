# Quickstart: Validar alta y listado real de Socios GDCV

## Prerequisitos

- Backend real accesible con al menos un `Proyecto` de `modelo: "GDCV"` y su `Parque`
  asociado.
- Ese parque puede tener 0 o más `Socio` registrados, para probar ambos estados.
- `npm run dev` corriendo localmente.

## Escenario 1 — Alta de socio vía modal (US1, P1)

1. Navegar a `/gdcv/performance?proyectoId=<id-de-un-proyecto-GDCV>`.
2. En la sección "Socios del Parque", hacer clic en "Nuevo Socio".
3. Verificar que se abre un modal con campos: nombre, participación (%), tipo de
   cargo, número de medidor.
4. Completar todos los campos con datos válidos y confirmar.
5. Verificar que el modal se cierra y el nuevo socio aparece en la tabla sin recargar
   el navegador (SC-001, SC-002).
6. Recargar la página manualmente y confirmar que el socio persiste (fue creado en
   backend, no solo en estado local).

**Referencia**: [contracts/socios.md](./contracts/socios.md),
[data-model.md](./data-model.md#flujo-de-alta-formulario--refresh)

## Escenario 2 — Validación de formulario (edge case)

1. Abrir el modal "Nuevo Socio" y hacer clic en "Crear" sin completar ningún campo.
2. Verificar que se muestran errores de validación y no se envía ninguna solicitud
   (revisar Network tab: no debe haber un POST a `/parques/{id}/socios`).

## Escenario 3 — Error del servidor al crear (edge case)

1. Completar el formulario con datos válidos pero forzar una falla del backend (por
   ejemplo, un número de medidor duplicado si el backend lo valida).
2. Verificar que se muestra un mensaje de error y el modal permanece abierto con los
   datos ya ingresados (FR-006) — no se pierden al reintentar.

## Escenario 4 — Listado real, sin datos (US2, P1)

1. Navegar a `/gdcv/performance?proyectoId=<id-de-un-proyecto-GDCV-sin-socios>`.
2. Verificar que la tabla "Socios del Parque" muestra un estado vacío explícito
   ("Sin socios registrados"), no las filas de `sociosMock` (Alfredo Isaac SA, Agro
   Sur Industrial, etc. — ver `data/gdcv-mock.ts`).

## Escenario 5 — Listado real, con datos (US2, P1)

1. Navegar a `/gdcv/performance?proyectoId=<id-de-un-proyecto-GDCV-con-socios>`.
2. Verificar que la tabla muestra exactamente los socios devueltos por
   `GET /parques/{parqueId}/socios` (comparar nombre, participación, tipo de cargo,
   medidor contra la respuesta cruda del endpoint).
3. Verificar que las columnas sin equivalente en el contrato (potencia asociada,
   energía generada, ahorro) muestran `"—"` en vez de un valor inventado.

## Escenario 6 — Error de backend al listar (edge case)

1. Simular una falla en `GET /parques/{parqueId}/socios` (backend caído o 500/401
   forzado en un entorno de prueba).
2. Verificar que la tabla muestra un estado de error explícito, y que un 401 redirige
   a `/login` (mismo comportamiento ya validado para energía en 005).

## Validación automatizada

- `npm run test -- tests/lib/socio-presentation.test.ts` — nuevo, cubre
  `mapSocioToRow` (incluyendo columnas degradadas a `"—"`).
- `npm run test -- tests/app/gdcv/performance-page.test.ts` — extendido para cubrir
  el paso de `socios` por props (null en error, `[]` en vacío, array real con datos).
