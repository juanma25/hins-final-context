# Data Model: Vista DIA real + KPI 1M desde datos de 6M

## Entidad: RegistroEnergiaDia (nueva)

Forma real de lectura de `GET /parques/{parqueId}/energia?periodo=AAAA-MM-DD` — snapshot de energía de un día puntual. Distinta de `RegistroEnergiaDiario` (forma de `?periodo=AAAA-MM`, un array de días dentro de un mes — ver `specs/003-monthly-generation-kpi/data-model.md`).

| Campo | Tipo | Notas |
|---|---|---|
| `capturadoEn` | `string` (ISO datetime) | Timestamp de captura del registro; usado para desempatar si el array trae más de un elemento (research.md Decision 2). |
| `energiaDiaKwh` | `number \| null` | Energía generada del día — valor principal mostrado en la pestaña DIA. |
| `ingresoDia` | `number \| null` | Ingreso del día. |
| `energiaTotalKwh` | `number \| null` | Acumulado histórico del parque a la fecha de captura — mostrado como dato secundario si aplica. |
| `energiaInyectadaDiaKwh` | `number \| null` | Energía inyectada a red del día. |
| `energiaConsumidaDiaKwh` | `number \| null` | Energía consumida del día. |

**Validación**: ningún campo numérico es obligatorio en la respuesta (pueden venir ausentes/`null` para un día sin carga completa, mismo criterio que `RegistroEnergiaDiario`/`RegistroEnergiaMensual`). Un array vacío ⇒ estado "sin datos para este día" (FR-003), no error.

**Relaciones**: se resuelve por parque (`parqueId`, path param) + día (`periodo=AAAA-MM-DD`, query param) — sin relación de persistencia local, es un valor derivado de la respuesta HTTP en cada consulta.

## Entidad existente reutilizada: RegistroEnergiaMensual

Sin cambios de forma (`{ periodo: "YYYY-MM", energiaMesKwh, ingresoMes }`, ver `specs/002-park-energy-chart/data-model.md`). Se agrega una función de acceso derivada:

- `getRegistroDelMesActual(registros: RegistroEnergiaMensual[], periodoActual: string): RegistroEnergiaMensual | null` — busca `registros.find(r => r.periodo === periodoActual)`, `null` si no existe. No introduce un tipo nuevo, es una proyección sobre la entidad ya existente.

## Estado de UI: pestaña DIA (client state, no persistido)

| Campo | Tipo | Notas |
|---|---|---|
| `activeDay` | `Date` | Ya existe en `ParkPerformanceView` (hoy alimenta el mock); se reutiliza como día consultado al backend. |
| `dailyEnergiaState` | `{ status: "loading" \| "ok" \| "empty" \| "error"; data: RegistroEnergiaDia \| null }` | Estado derivado del fetch al Route Handler por cada `activeDay`; reemplaza el uso directo de `getDailyGenerationData24`. |
| `requestId` | `number` (o `AbortController`) | Usado para descartar respuestas fuera de orden al cambiar de día rápido (FR-008). |

## Transiciones de estado — pestaña DIA

```
idle → loading (al montar la pestaña o cambiar activeDay)
loading → ok        (respuesta con ≥1 registro; se toma el más reciente por capturadoEn)
loading → empty      (respuesta = array vacío)
loading → error      (fetch falla o responde no-2xx distinto de 404/vacío)
ok|empty|error → loading  (nuevo cambio de activeDay antes de que la anterior resuelva; la anterior se descarta)
```

No hay persistencia entre sesiones — el estado vive en memoria del componente cliente, igual que `activeDay` hoy.
