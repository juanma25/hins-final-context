# Quickstart: Validar Gráfico de Energía del Parque (datos reales)

## Prerrequisitos

- `HINS_API_BASE_URL` configurado (`.env.local` o similar) apuntando a un backend con al menos un parque con registros en `/parques/{parqueId}/energia`.
- Sesión autenticada (login) para tener token válido en cookie httpOnly.
- `pnpm install` hecho; `pnpm vitest run` funcionando (verificar antes de tocar código).

## 1. Verificar el contrato real antes de codear

```bash
curl -s -H "Authorization: Bearer <token>" "$HINS_API_BASE_URL/parques/<parqueId>/energia" | jq .
```

Comparar la forma contra [contracts/get-parque-energia.md](contracts/get-parque-energia.md). Si difiere, actualizar `data-model.md`/`research.md` Decision 1 antes de continuar.

## 2. Tests unitarios (test-first, Principio III)

```bash
pnpm vitest run tests/lib/park-energy-series.test.ts   # nuevo — función pura de mapeo/rango
pnpm vitest run tests/lib/api/energia-roi-mantenimiento.test.ts  # existente, no debe romperse
```

Deben fallar primero (Red) contra la implementación aún no escrita, luego pasar (Green).

## 3. Validación end-to-end manual

```bash
pnpm dev
```

1. Ir a `/gdd/performance?proyectoId=<id de un proyecto con parque con energía cargada>`.
2. Confirmar que el gráfico de energía muestra valores reales (comparar con la respuesta cruda del paso 1), no los valores mock de `data/gdd-performance-mock.ts`.
3. Cambiar el chip de rango (`6m`, `1a`, `todo`) y confirmar que la serie se acota a esa cantidad de meses reales.
4. Probar un parque sin registros de energía → esperar estado vacío claro (no gráfico roto, no dato mock).
5. (Si es simulable) cortar la red/backend momentáneamente → esperar estado de error distinguible, no un gráfico vacío silencioso.

## 4. Regresión

```bash
pnpm lint
pnpm build
```

Confirmar que el resto de `ParkPerformanceView` (KPIs, sparklines, vista diaria `1d`) sigue funcionando sin cambios — siguen en mock por excepción documentada (spec Assumptions).
