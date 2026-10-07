# Contract: `DatePicker` con `value: Date | undefined`

Ubicación: `components/ui/date-picker.tsx`.

## Cambio de firma

```ts
export interface DatePickerProps {
  value: Date | undefined   // antes: Date
  onValueChange: (date: Date) => void
  disabled?: (date: Date) => boolean
  formatLabel?: (date: Date) => string
  placeholder?: string       // nuevo — texto del trigger cuando value es undefined (default: "Seleccionar fecha")
  className?: string
  align?: "start" | "center" | "end"
}
```

## Comportamiento

| `value` | Trigger muestra | `Calendar.selected` |
|---|---|---|
| `undefined` | `placeholder` (default "Seleccionar fecha") | `undefined` — ningún día pre-marcado |
| `Date` | `formatLabel(value)` (como hoy) | `value` |

- `onSelect` del `Calendar` interno sigue siendo `(date) => { if (date) onValueChange(date) }` — sin cambios; el fix está en que, al no fabricar una `Date` falsa, no hay día pre-seleccionado que el usuario pueda "deseleccionar" accidentalmente.
- Consumidores existentes (`DailyEnergyTotalsBlock.tsx`, `DailyGenerationChartBlock.tsx`) siguen pasando `Date` no-`undefined` — sin cambios de comportamiento para ellos.

## Consumo en `SocioHistoricoDialog`

- `<DatePicker value={desde} onValueChange={...} placeholder="Desde" />` y `<DatePicker value={hasta} onValueChange={...} placeholder="Hasta" />` — ya no usan el fallback `?? new Date()`.
- Cada `onValueChange` sigue disparando las tres consultas en cuanto `isValidHistoricoRange(desde, hasta)` es `true`, en cada cambio (FR-001) — comportamiento que la feature 009 ya tenía correcto una vez que el estado logra completarse; el bug estaba únicamente en que el estado nunca llegaba a completarse.
