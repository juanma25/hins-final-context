# Backend Integration Guide

> Este documento detalla qué mocks reemplazar con APIs reales al integrar el backend. Útil para asegurar cobertura completa y evitar que data stale quede en producción.

---

## 1. Parsing Functions — Consolidados en `lib/format-energy.ts`

**Ubicación:** `lib/format-energy.ts`

Estas funciones parsean strings de display a números. Cuando backend cambie formato de datos (ej: `"830.5 kWh"` → `830.5 kWh` como número), actualizar regex en estas funciones centralizadas:

```ts
export function parseKwhDisplay(value: string): number
export function parseKwpDisplay(value: string): number
export function parsePercentDisplay(value: string): number
export function parseMoneyDisplay(value: string): number
```

**Dónde se usan:**
- `components/gdcv/SociosTable.tsx`
- `components/gdd/ConsumptionHistoryTable.tsx`
- `components/mantenimiento/...` (si hay)

---

## 2. Park Configuration Constants — Extraídos en `lib/park-config.ts`

**Ubicación:** `lib/park-config.ts`

Constants mágicos que ahora están centralizados. **Instrucciones:** Reemplazar cada const con llamada a API y pasar como prop a componentes.

### Park Capacity (used in percentage calculations)

| Const | Ubicación Actual | Usado en | Reemplazar con |
|---|---|---|---|
| `GDCV_TOTAL_POTENCIA = 980` | `lib/park-config.ts` | `SocioDetailSheet.tsx:70`, `SociosTable.tsx:186` | `GET /api/parks/gdcv` → `potenciaTotal` |
| `GDD_TOTAL_POTENCIA = 1_250` | `lib/park-config.ts` | (aún no usado, preparado) | `GET /api/parks/gdd` → `potenciaTotal` |
| `GDC_TOTAL_POTENCIA = 1_500` | `lib/park-config.ts` | (aún no usado, preparado) | `GET /api/parks/gdc` → `potenciaTotal` |

**Cómo integrar:**
```tsx
// ANTES
const porcentajePotencia = (potenciaKwp / GDCV_TOTAL_POTENCIA * 100).toFixed(1)

// DESPUÉS
interface SociosTableProps {
  data: SocioRow[]
  totalPotencia: number  // ← pasar como prop
}
const porcentajePotencia = (potenciaKwp / totalPotencia * 100).toFixed(1)
```

### Autoconsumo Ratio (virtual self-consumption)

| Const | Ubicación | Usado en | Reemplazar con |
|---|---|---|---|
| `GDCV_AUTOCONSUMO_PORCENTAJE = 0.68` | `lib/park-config.ts` | `SocioDetailSheet.tsx:67` | `GET /api/parks/gdcv/config` → `autoconsumoRatio` |

**Cómo integrar:**
```tsx
// ANTES
const auto = Math.round(kwh * 0.68 * 10) / 10

// DESPUÉS (pasar desde parent)
function fallbackDetail(socio: Socio, config: { autoconsumoRatio: number }) {
  const auto = Math.round(kwh * config.autoconsumoRatio * 10) / 10
  // ...
}
```

### Investment Recovery Targets (ROI meta)

| Const | Ubicación | Usado en | Reemplazar con |
|---|---|---|---|
| `GDCV_INVERSION_META = 38_000_000` | `lib/park-config.ts` | `ROIProjectionChart.tsx` prop `inversionMeta` | `GET /api/parks/gdcv/roi` → `inversionMeta` |
| `GDD_INVERSION_META = 21_000_000` | `lib/park-config.ts` | `ROIProjectionChart.tsx` prop `inversionMeta` | `GET /api/parks/gdd/roi` → `inversionMeta` |
| `GDC_INVERSION_META = 45_000_000` | `lib/park-config.ts` | `ROIProjectionChart.tsx` prop `inversionMeta` | `GET /api/parks/gdc/roi` → `inversionMeta` |

**Ya está como prop, solo reemplazar data source.**

---

## 3. Mock Data Exports — Reemplazar con API Calls

### Energy Monthly Series

**Ubicación:** `data/gdd-performance-mock.ts`

**Const:** `PARK_ENERGY_MONTHLY: ParkEnergyRow[]`

**Usado en:**
- `components/gdd/GddPerformanceView.tsx`
- Energy generation charts

**Reemplazar con:**
```ts
GET /api/parks/{id}/energy/monthly
Response: { data: ParkEnergyRow[] }
```

### ROI Historical Data

**Ubicación:** `data/gdd-roi-mock.ts`, `data/gdcv-agc-mock.ts`, `data/gdcv-socio-mock.ts`

**Consts:**
- `gddRoiHistorico: GddRoiHistoricoRow[]`
- `gdcvRoiHistorico: ...`
- `socioRoiHistorico: ...`

**Usado en:**
- `<GddRoiRecuperoTable>` components
- ROI recovery tables

**Reemplazar con:**
```ts
GET /api/parks/{id}/roi/historico
Response: { data: GddRoiHistoricoRow[] }
```

### ROI Projection Data

**Ubicación:** `data/gdd-roi-mock.ts`, `data/gdcv-agc-mock.ts`, `data/gdcv-socio-mock.ts`

**Consts:**
- `gddRoiProjectionData: ROIDataPoint[]`
- `gdcvRoiProjectionData: ...`
- `socioRoiProjectionData: ...`

**Usado en:**
- `<ROIProjectionChart>` data prop

**Reemplazar con:**
```ts
GET /api/parks/{id}/roi/projection
Response: { data: ROIDataPoint[] }
```

### "Today" Reference for ROI Charts

**Ubicación:** `data/gdd-roi-mock.ts` line X, others

**Consts:**
- `GDD_ROI_FECHA_HOY = "2026-05"`
- `GDCV_ROI_FECHA_HOY = "2026-05"`
- `SOCIO_ROI_FECHA_HOY = "2026-05"`

**Usado en:**
- `<ROIProjectionChart fechaHoy={...}>` prop

**Reemplazar con:**
```ts
// Use current date from:
// Option A: GET /api/parks/{id}/current-date
// Option B: useCallback in component that gets Date.now()
// Option C: Context/hook for server-side date

const fechaHoy = new Date().toISOString().slice(0, 7)  // "2026-06"
```

### Socio Details (Demo Data)

**Ubicación:** `components/gdcv/SocioDetailSheet.tsx`

**Maps:**
- `DETAIL_MAP: Record<string, SocioDetalle>`
- `fallbackDetail(socio)` function

**Usado en:**
- Socio detail sheet rendering

**Reemplazar with:**
```ts
GET /api/parks/{parkId}/socios/{socioId}
Response: { data: SocioDetalle }
```

### Maintenance History

**Ubicación:** `data/mantenimiento-mock.ts`

**Consts:**
- `mantenimientoHistorial: MaintenanceHistoryRow[]`

**Reemplazar with:**
```ts
GET /api/parks/{id}/maintenance/history
Response: { data: MaintenanceHistoryRow[] }
```

---

## 4. Incomplete Features — Implement Backend Hooks

### Project Creation Dialog

**Ubicación:** `components/main/NewProjectDialog.tsx` line 58

**Current state:** `console.log("Crear proyecto:", formData)`

**Expected API:**
```ts
POST /api/projects
Body: { nombre: string, tipo: "GDD" | "GDCV" | "GDC", medidor?: string }
Response: { id, nombre, tipo, medidor?, estado }
Error: { message, code }
```

**Success handler:**
```ts
- Invalidate projects query cache
- Close dialog (setOpen(false))
- Redirect to /main
- Show success toast
```

**Error handler:**
```ts
- Show error toast with message
- Keep dialog open
- Highlight invalid field
```

---

## 5. Authentication & RBAC Guards

**Ubicación:** Routes in `app/`

**Current state:** Demo routes without auth checks

**Missing:**
- [ ] Auth middleware on `/gdd/*` routes (verify owner role)
- [ ] Auth middleware on `/gdcv/*` routes (verify AGC role)
- [ ] Auth middleware on `/gdc/*` routes (verify AGC role)
- [ ] OTP verification for `/gdcv/socio/*` routes
- [ ] Role checks on `/main` (admin only)

**Reference:** `lib/gdcv-socio-auth.ts` has OTP demo pattern

---

## 6. Checklist for Backend Integration

- [ ] Replace park capacity constants with API calls (3 parks)
- [ ] Replace autoconsumo percentage with API config
- [ ] Replace investment targets with API ROI config
- [ ] Replace energy monthly series with API
- [ ] Replace ROI historical data with API
- [ ] Replace ROI projection data with API
- [ ] Replace "today" date with dynamic source
- [ ] Replace socio details with API
- [ ] Replace maintenance history with API
- [ ] Implement project creation API
- [ ] Add auth guards on all routes
- [ ] Test data format compatibility with parseKwh/parseKwp regex patterns
- [ ] Update environment variables for API base URL
- [ ] Add error handling for network failures

---

## 7. Quick Reference: Where Mocks Live

```
data/
  ├── gdd-performance-mock.ts       ← Energy monthly
  ├── gdd-roi-mock.ts               ← ROI historical + projection
  ├── gdcv-mock.ts                  ← Park details, Socios list
  ├── gdcv-agc-mock.ts              ← ROI data for AGC view
  ├── gdcv-socio-mock.ts            ← ROI data for Socio view
  ├── mantenimiento-mock.ts         ← Maintenance history
  ├── new-project-mock.ts           ← Project types (keep, not data)
  └── gdc-*-mock.ts                 ← GDC variants

lib/
  ├── format-energy.ts              ← Parsing functions (update if format changes)
  ├── park-config.ts                ← Constants (inject via API)
  └── format-currency.ts            ← Currency formatting (no changes needed)
```

---

## Notes

- **Backward compatibility:** Once real data is live, can remove all `*-mock.ts` files. Keep `new-project-mock.ts` as it defines ProjectType enum.
- **Testing:** Create fixtures that match API response shapes before integration.
- **Error states:** Charts/tables should gracefully handle missing data (empty states, spinners).

## Configuración de administrador (specs/013-admin-config-tarifas-costos)

Solo `HINS_ADMIN` (guard `requireAdmin()` en `lib/api/guards.ts`; el backend responde 403 como defensa final):

| Pantalla | Ruta | Endpoints |
|---|---|---|
| Tarifas | `/main/tarifas` | `/tarifas` (GET/POST), `/tarifas/{id}` (PATCH/DELETE) |
| Tipos de cambio | `/main/tipos-cambio` | `/tipos-cambio` (GET/POST), `/tipos-cambio/{id}` (PATCH/DELETE) |
| Costos | `/gdd\|gdc\|gdcv/costos?proyectoId=` | `/costos` (GET/POST), `/costos/{id}` (PATCH/DELETE) |

Piezas compartidas: `components/admin/*` (lista paginada, formulario, confirmación), `lib/crud-action.ts`, `lib/api/paginated.ts`, `lib/admin-nav.ts`.
