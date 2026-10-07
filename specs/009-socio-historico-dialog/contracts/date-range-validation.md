# Contract: Validación de rango de fechas del diálogo de histórico

Ubicación: función pura exportada desde `components/gdcv/SocioHistoricoDialog.tsx` (p. ej. `isValidHistoricoRange`).

## Firma

```ts
function isValidHistoricoRange(desde: Date | undefined, hasta: Date | undefined): boolean
```

## Comportamiento

| desde | hasta | Resultado | Nota |
|---|---|---|---|
| undefined | undefined | `false` | Rango incompleto — no dispara consulta (FR-003) |
| Date | undefined | `false` | Rango incompleto |
| undefined | Date | `false` | Rango incompleto |
| Date A | Date B, B < A | `false` | Hasta anterior a desde — bloqueado (FR-008, SC-002) |
| Date A | Date B, B >= A | `true` | Rango válido — dispara las tres consultas (FR-004) |

## Contrato de los Route Handlers (boundary servidor/cliente)

`GET /api/parques/{parqueId}/socios/{socioId}/registros?desde={ISO}&hasta={ISO}` (y análogos `/facturacion`, `/mediciones`):

- Llama a `lib/api/socios-historico.ts` → `apiFetch` → backend `GET /parques/{parqueId}/socios/{socioId}/{registros|facturacion|mediciones}?desde=...&hasta=...`.
- 200 → `NextResponse.json(data)` con `data: RegistroHistorico[] | FacturacionHistorico[] | MedicionHistorico[]` (array vacío si no hay datos en el rango).
- `UnauthorizedError` (sesión expirada, ver `lib/api/client.ts`) → `NextResponse.json({ message }, { status: 401 })`.
- Cualquier otro error → `NextResponse.json({ message }, { status: 500 })`.
- Falta `desde` o `hasta` en query → `NextResponse.json({ message: "Falta desde/hasta" }, { status: 400 })` (mismo patrón que `energia-dia/route.ts` con `periodo`).

Mismo contrato de respuesta para los tres — solo cambia el tipo de `payload`/campos según data-model.md.
