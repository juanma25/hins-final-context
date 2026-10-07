# Contrato consumido: GET /parques/{parqueId}/energia

Este feature no expone una interfaz nueva; consume un endpoint del backend HINS. Este archivo documenta el contrato tal como se **asume** para el desarrollo, según la evidencia disponible (ver [research.md](../research.md) Decision 1) — no reemplaza al swagger real del backend.

## Request

```
GET {HINS_API_BASE_URL}/parques/{parqueId}/energia
Authorization: Bearer <token>
```

## Response 200 (asumida — muestra real provista por el usuario)

```json
[
  {
    "periodo": "2026-07",
    "energiaMesKwh": 18190.5,
    "ingresoMes": 53518.69
  }
]
```

- Array de 0..N elementos, uno por mes con dato registrado.
- `energiaMesKwh` / `ingresoMes` pueden venir ausentes o `null` para un mes sin carga completa.

## Response 404

Parque sin registros o inexistente → `apiFetch` ya mapea 404 a `null`; `listEnergia` debe devolver `[]` en ese caso (mismo patrón que `listRoi`/`listMantenimiento`).

## Divergencia conocida con `docs/openapi.json`

El swagger versionado en el repo describe una forma distinta (`energiaInyectadaKwh`, `energiaGeneradaKwh`, `creditoGenerado`, `ahorroEpec`) para `RegistroEnergia`. Antes de dar por cerrada la integración, confirmar contra el backend real cuál forma es la vigente; si el swagger está actualizado y la muestra manual estaba desactualizada, ajustar este contrato y `data-model.md` en consecuencia.
