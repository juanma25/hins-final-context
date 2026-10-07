# Data Model: KPI "Energía Generada" del mes actual (datos reales)

## RegistroEnergiaDiario (nuevo — lectura)

Fuente: `GET /parques/{parqueId}/energia?periodo=YYYY-MM` (ver [research.md](research.md) Decision 1).

| Campo | Tipo | Nullable | Notas |
|---|---|---|---|
| `fecha` | `string` | no | Formato `"YYYY-MM-DD"`. Clave de fila. |
| `energiaDiaKwh` | `number` | sí | Energía generada del día. Ausente/`null` = día sin dato cargado. |
| `ingresoDia` | `number` | sí | Ingreso del día. Fuera del alcance visual de este feature (mismo criterio que `ingresoMes` en `002-park-energy-chart`). |

No tiene relación directa con `RegistroEnergiaMensual` (otro endpoint/forma) — son entidades de lectura independientes que comparten el mismo path base.

## Derivados (funciones puras, no persistidos)

- **Total mensual** = `Σ energiaDiaKwh` de todos los `RegistroEnergiaDiario` del mes (nulls tratados como 0).
- **Sparkline** = lista de `{ value: number }` (uno por día, `energiaDiaKwh ?? 0`), ordenada por `fecha` ascendente, deduplicada por `fecha` (último recibido gana).

## Relaciones

- `Parque` (existente) 1—N `RegistroEnergiaDiario`, vía `parqueId` (path param) + `periodo` (query param, mes actual).
- Sin estados/transiciones — mediciones inmutables por día.

## Reglas de validación / transformación

- Orden: ascendente por `fecha` (string sort funciona por ser `YYYY-MM-DD`).
- Duplicados por `fecha`: queda el último recibido (mismo criterio que dedupe por `periodo` en `002-park-energy-chart`).
- `energiaDiaKwh` nulo/ausente: 0 en la suma, no rompe la sparkline (mismo criterio `hasData` ya usado en `ParkEnergyRow`, aplicable aquí si se decide señalizar visualmente — la spec no lo exige para la sparkline, solo que no rompa).
