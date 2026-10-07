# Contrato consumido: GET /parques/{parqueId}/energia?periodo=YYYY-MM

Este feature no expone una interfaz nueva; consume el backend HINS. Documenta el contrato **asumido**, según la muestra provista por el usuario (ver [research.md](../research.md) Decision 1) — no reemplaza al swagger real del backend.

## Request

```
GET {HINS_API_BASE_URL}/parques/{parqueId}/energia?periodo=2026-07
Authorization: Bearer <token>
```

`periodo` = mes calendario actual, formato `"YYYY-MM"` (ver research.md Decision 2).

## Response 200 (asumida — muestra real provista por el usuario)

```json
[
  {
    "fecha": "2026-07-18",
    "energiaDiaKwh": 83.22,
    "ingresoDia": 6082.95
  }
]
```

- Array de 0..N elementos, uno por día con dato registrado dentro del mes pedido.
- `energiaDiaKwh` / `ingresoDia` pueden venir ausentes o `null` para un día sin carga completa.

## Response 404 / sin registros

Igual que `002-park-energy-chart`: `apiFetch` mapea 404 a `null`; `listEnergiaDiaria` debe devolver `[]` en ese caso.

## Relación con el endpoint sin `periodo` (mensual)

Mismo path base que `GET /parques/{parqueId}/energia` (sin query param, usado en `002-park-energy-chart` para el gráfico de barras mensual) pero forma de respuesta distinta cuando se agrega `?periodo=`: pasa de un array mensual (`periodo`/`energiaMesKwh`) a un array diario (`fecha`/`energiaDiaKwh`) acotado a ese mes. **Confirmar contra backend real** que el query param realmente cambia la granularidad de la respuesta (no solo filtra manteniendo la forma mensual) antes de dar la integración por cerrada — mismo tipo de riesgo que `002-park-energy-chart` research.md Decision 1.
