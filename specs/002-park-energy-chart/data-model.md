# Data Model: Gráfico de Energía del Parque (datos reales)

## RegistroEnergiaMensual (nuevo — lectura)

Fuente: `GET /parques/{parqueId}/energia` (ver [research.md](research.md) Decision 1).

| Campo | Tipo | Nullable | Notas |
|---|---|---|---|
| `periodo` | `string` | no | Formato `"YYYY-MM"`. Único por parque+mes en el caso esperado; ver Edge Case de duplicados en spec. |
| `energiaMesKwh` | `number` | sí | Energía generada del mes. Ausente/`null` = mes sin dato cargado (FR-007). |
| `ingresoMes` | `number` | sí | Ingreso del mes. Fuera del alcance visual de este gráfico (spec Assumptions), se retiene en el tipo por completitud del contrato pero no se grafica. |

No tiene `id` propio en la muestra observada — se usa `periodo` como clave de fila para el gráfico.

## ParkEnergyRow (existente — sin cambios)

Ya definido en `data/gdd-performance-mock.ts` y consumido por `components/charts/ParkEnergyBarChart.tsx`:

```ts
type ParkEnergyRow = { label: string; generated: number }
```

Mapeo: `RegistroEnergiaMensual` → `ParkEnergyRow` = `{ label: formatPeriodoLabel(periodo), generated: energiaMesKwh ?? 0 }`, preservando qué meses tenían `null` de forma separada para poder distinguir "sin dato" de "generó 0" (ver Edge Case / User Story 2 — la UI decide cómo señalizarlo, p. ej. tooltip o marca visual, no forma parte del tipo de datos en sí).

## Relaciones

- `Parque` (existente, `lib/api/types.ts`) 1—N `RegistroEnergiaMensual`, vía `parqueId` (path param, no viaja en cada fila de la muestra observada — a confirmar contra backend real).
- No hay estados/transiciones — son mediciones inmutables por mes.

## Reglas de validación / transformación

- Orden: ascendente por `periodo` (string sort funciona por ser `YYYY-MM`) antes de cualquier slice de rango.
- Duplicados por `periodo`: quedarse con el último recibido (spec Edge Cases).
- Rango `6m`/`1a`/`todo`: slice de los últimos N meses de la serie ordenada (ver research.md Decision 3).
- Rango `1d`: no aplica a esta fuente (FR-009); la vista sigue usando su fuente actual para esa vista horaria.
