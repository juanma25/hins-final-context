# Contract: Medidor Principal — Registros Consolidados (consumido)

Este es un contrato **consumido** (backend externo ya existente, confirmado vía swagger local). No se modifica el backend en esta feature; se documenta para que la capa `lib/api/medidor-principal.ts` y sus tests queden alineados con la forma real.

## Endpoint

```
GET /parques/{parqueId}/medidor-principal/registros/consolidado?periodo={YYYY-MM}
```

Auth: Bearer token (mismo mecanismo que el resto de `lib/api/*.ts`, vía `apiFetch`).

## Response 200 — `ConsolidadoDto`

```json
{
  "desde": "2026-09-01T00:00:00.000Z",
  "hasta": "2026-10-01T00:00:00.000Z",
  "porTarifa": [
    {
      "tarifa": 1,
      "registros": 2880,
      "energiaActivaExportada": {
        "suma": 12345000,
        "sumaKwh": 12345,
        "maximo": 500,
        "promedio": 4287.8
      },
      "demandaActivaExportada": { "suma": 49380000, "maximo": 2000, "promedio": 17151.2 }
    }
  ],
  "total": {
    "registros": 2880,
    "energiaActivaExportada": {
      "suma": 12345000,
      "sumaKwh": 12345,
      "maximo": 500,
      "promedio": 4287.8
    },
    "demandaActivaExportada": { "suma": 49380000, "maximo": 2000, "promedio": 17151.2 }
  }
}
```

Campo usado por esta feature: **`total.energiaActivaExportada.sumaKwh`** (puede ser `null`).

## Error responses

| Status | Meaning | UI handling |
|---|---|---|
| 400 | Filtro de período inválido | No debería ocurrir con `periodo` generado internamente (YYYY-MM); si ocurre, tratar como fuente "no disponible" |
| 401 | No autenticado | `UnauthorizedError` → `redirect("/login")`, igual que las demás fuentes |
| 403 | Sin permisos (requiere HINS_ADMIN o AGC) | Tratar como fuente "no disponible" (no bloquea el resto de la página) |
| 404 | Parque inexistente o **sin medidor principal configurado** | Tratar como "sin medidor principal" — distinto de error transitorio; UI degrada a solo-Huawei sin mostrar aviso de error (ver spec Edge Cases) |

## Consuming function (this feature)

```ts
// lib/api/medidor-principal.ts
export async function getConsolidadoMedidorPrincipal(
  parqueId: string,
  periodo: string // "YYYY-MM"
): Promise<ConsolidadoMedidorPrincipal | null>
```

- Devuelve `null` en 404 "sin medidor principal" (tratado como condición de negocio, no excepción) y también deja propagar errores de red/HTTP no-404 para que el caller (`page.tsx`) los capture igual que las demás fuentes (`try/catch` → estado "no disponible").
