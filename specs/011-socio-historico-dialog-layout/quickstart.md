# Quickstart: Validar layout contenido del diálogo de histórico de socio

## Prerrequisitos

- Backend corriendo en `http://localhost:3000`, con un socio que tenga suficientes filas históricas en al menos uno de los tres tipos (Registros/Facturación/Mediciones) para forzar scroll (ver captura del reporte original: >10 filas alcanza).

## Validación automatizada

```sh
npx tsc --noEmit
npm run lint
npm run test
```

Sin tests unitarios nuevos (cambio de presentación pura, exento por Constitution Principio III) — la validación real es visual (ver abajo).

## Validación manual end-to-end

1. `npm run dev`, abrir el histórico de un socio con datos conocidos en los tres tipos.
2. Seleccionar un rango de fechas que devuelva muchas filas en más de un histórico (como en el reporte original).
3. **Esperado (FR-001, SC-001)**: el diálogo se ve notablemente más grande que antes y permanece dentro de los límites de la ventana del navegador — no debe empujar ni tapar el contenido de la página detrás de él.
4. **Esperado (FR-003, FR-004, SC-002)**: hacer scroll dentro de la tabla de "Registros" (si tiene muchas filas) NO debe mover la posición de "Facturación" ni "Mediciones" — cada tabla se desplaza de forma independiente.
5. **Esperado (FR-005)**: si se reduce el ancho de la ventana del navegador, cada tabla permite scroll horizontal contenido en vez de romper el ancho del diálogo o de la página.
6. Repetir con un histórico sin datos ("Sin datos en el rango seleccionado") junto a otros con muchas filas — **esperado (Edge case)**: el layout general sigue estable, sin espacios de scroll vacíos extraños para la sección sin datos.
