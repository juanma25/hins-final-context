# Contrato consumido: GET /parques/{parqueId}/energia?periodo=AAAA-MM-DD

Este feature no expone una interfaz nueva hacia afuera del producto; consume el backend HINS. Documenta el contrato **asumido**, según la muestra provista por el usuario (ver [research.md](../research.md) Decision 1) — no reemplaza al swagger real del backend.

## Request

```
GET {HINS_API_BASE_URL}/parques/{parqueId}/energia?periodo=2026-07-20
Authorization: Bearer <token>
```

`periodo` = día calendario puntual, formato `"AAAA-MM-DD"`.

## Response 200 (asumida — muestra real provista por el usuario)

```json
[
  {
    "capturadoEn": "2026-07-20T14:41:56.703Z",
    "energiaDiaKwh": 93.61,
    "ingresoDia": 6843.04,
    "energiaTotalKwh": 901509.7,
    "energiaInyectadaDiaKwh": 0,
    "energiaConsumidaDiaKwh": 0
  }
]
```

- Array de 0..N elementos para el día pedido. Si trae más de uno, se usa el de `capturadoEn` más reciente (research.md Decision 2).
- Todos los campos numéricos pueden venir ausentes o `null` para un día sin carga completa.

## Response 404 / sin registros

Igual que `002-park-energy-chart`/`003-monthly-generation-kpi`: `apiFetch` mapea 404 a `null`; el wrapper (`getEnergiaDelDia`) debe devolver `[]` en ese caso — se trata igual que un array vacío (estado "sin datos para este día", FR-003).

## Relación con los otros dos formatos del mismo path

Mismo path base `GET /parques/{parqueId}/energia`, tres formas de respuesta según el query param:

| Query | Granularidad | Forma | Feature que lo consume |
|---|---|---|---|
| (sin `periodo`) | mensual, histórico completo | `RegistroEnergiaMensual[]` (`periodo`, `energiaMesKwh`, `ingresoMes`) | `002-park-energy-chart` (6M/1A/TODO) |
| `periodo=AAAA-MM` | diaria, dentro de un mes | `RegistroEnergiaDiario[]` (`fecha`, `energiaDiaKwh`, `ingresoDia`) | `003-monthly-generation-kpi` (KPI "Generada en [mes]") |
| `periodo=AAAA-MM-DD` | puntual, un día | `RegistroEnergiaDia[]` (`capturadoEn`, `energiaDiaKwh`, `ingresoDia`, `energiaTotalKwh`, `energiaInyectadaDiaKwh`, `energiaConsumidaDiaKwh`) | `004-daily-monthly-energy-view` (pestaña DIA) — **este contrato** |

**Confirmar contra backend real** que el formato de `periodo` (`AAAA-MM` vs `AAAA-MM-DD`) es lo único que determina la granularidad de la respuesta, antes de dar la integración por cerrada — mismo tipo de riesgo señalado en 002/003 research.md.

## Endpoint interno nuevo expuesto al cliente (Route Handler)

Para respetar Principio II (Server/Client Boundary Discipline) sin recargar la página en cada cambio de día (research.md Decision 3):

```
GET /api/parques/{parqueId}/energia-dia?periodo=AAAA-MM-DD
```

- Llamado desde el cliente (`ParkPerformanceView`) al montar la pestaña DIA y en cada cambio de `activeDay`.
- Internamente delega en `getEnergiaDelDia(parqueId, periodo)` (wrapper de `apiFetch`, mismo patrón que `listEnergia`/`listEnergiaDiaria`).
- Respuesta: el registro más reciente por `capturadoEn` ya resuelto server-side (`RegistroEnergiaDia | null`), o `404`/estado vacío si no hay datos para el día.
- Errores de sesión (`UnauthorizedError`) responden `401`, igual que `app/api/dashboard/context/route.ts`.
