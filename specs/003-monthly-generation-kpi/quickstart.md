# Quickstart: Validar KPI "Energía Generada" del mes actual (datos reales)

## Prerrequisitos

- `HINS_API_BASE_URL` configurado, sesión autenticada.
- Un parque con registros diarios de energía cargados para el mes calendario actual.
- `pnpm vitest run` funcionando antes de tocar código.

## 1. Verificar el contrato real antes de codear

```bash
MES_ACTUAL=$(date +%Y-%m)
curl -s -H "Authorization: Bearer <token>" "$HINS_API_BASE_URL/parques/<parqueId>/energia?periodo=$MES_ACTUAL" | jq .
```

Comparar contra [contracts/get-parque-energia-diaria.md](contracts/get-parque-energia-diaria.md). Si difiere (especialmente si NO devuelve granularidad diaria), actualizar `data-model.md`/`research.md` Decision 1 antes de continuar.

## 2. Tests unitarios (test-first)

```bash
pnpm vitest run tests/lib/park-energy-series.test.ts
```

Casos nuevos (suma mensual, sparkline, dedupe por fecha, nulls) deben fallar primero (Red), luego pasar (Green).

## 3. Validación end-to-end manual

```bash
pnpm dev
```

1. Ir a `/gdd/performance?proyectoId=<id de un proyecto con parque con energía diaria cargada este mes>`.
2. Confirmar que la card "Generada en [mes actual]" muestra el total real (comparar con la suma manual del paso 1), no `830,17`.
3. Confirmar que la sparkline tiene un punto por día real devuelto.
4. Probar un parque sin registros este mes → esperar total 0, sin mock.
5. (Si es simulable) cortar la red/backend → esperar estado de error en la card, no un total silencioso.

## 4. Regresión

```bash
pnpm lint
pnpm build
```

Confirmar que el gráfico de barras mensual y la tabla de historial de generación (`002-park-energy-chart`) siguen funcionando sin cambios.
