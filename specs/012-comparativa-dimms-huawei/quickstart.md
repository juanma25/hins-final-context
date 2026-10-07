# Quickstart: Comparativa DIMMs vs Huawei en Detalle de Parque

## Prerequisites

- Backend local corriendo en `http://localhost:3000` (swagger en `/docs`), con un parque que tenga:
  - medidor principal configurado y registros DIMMs para el mes actual (para el caso "ambas fuentes disponibles")
  - al menos un parque **sin** medidor principal (para el caso "solo Huawei", 404 degradado)
- `.env.local` apuntando `NEXT_PUBLIC_API_URL` (o el nombre usado en `lib/api/client.ts`) al backend local
- Usuario de prueba con rol `HINS_ADMIN` o `AGC` (requerido por el endpoint DIMMs)

## Setup

```bash
npm install
npm run dev
```

## Manual validation scenarios

1. **Comparativa en cards (User Story 1)**
   - Ir a `/gdcv/performance?proyectoId=<id con parque+medidor principal+datos huawei>`
   - Verificar: la card "Generada en [mes]" muestra el valor DIMMs como principal y el valor Huawei como referencia secundaria (visualmente diferenciado).

2. **Fuente principal sin datos (Edge Case)**
   - Usar un `proyectoId` cuyo parque no tenga medidor principal configurado (404 "sin medidor principal").
   - Verificar: la card indica que el dato principal no está disponible / no aplica, y sigue mostrando el valor Huawei sin presentarlo como principal.

3. **Comparativa en gráfico (User Story 2)**
   - En la misma página, cambiar el rango del gráfico de energía (6M / 1A).
   - Verificar: dos series visibles y etiquetadas (medidor principal / FusionSolar), con distinción visual; cambiar de rango actualiza ambas series.
   - Verificar: si algún mes del rango no tiene datos en una de las fuentes, ese tramo queda vacío/discontinuo, sin valores inventados y sin errores en consola.

4. **Fallo de la fuente principal (User Story 3)**
   - Simular un error del endpoint DIMMs (p. ej. apagar el backend momentáneamente o forzar un 500 vía proxy/mock).
   - Verificar: la página de detalle de parque sigue siendo utilizable, muestra los datos Huawei disponibles, y un aviso visible de que la fuente principal no pudo cargarse.

## Automated checks

```bash
npm run lint
npm run build
npx vitest run tests/lib/energia-comparativa.test.ts
npx vitest run tests/app/gdcv/performance-page.test.ts
```

Expected: todos los checks pasan; `tests/lib/energia-comparativa.test.ts` cubre la lógica pura de merge DIMMs+Huawei (test-first, Principio III).
