# Data Model: Histórico de Registros, Facturación y Mediciones por Socio

## Tipos nuevos en `lib/api/types.ts`

```ts
export interface RegistroHistorico {
  id: string
  obtenidoEn: string   // ISO 8601
  desde: string        // ISO 8601 — ventana consultada
  hasta: string         // ISO 8601 — ventana consultada
  payload: unknown[]    // resultado crudo de la API externa — ver research.md
}

export interface FacturacionHistorico {
  id: string
  obtenidoEn: string
  desde: string
  hasta: string
  payload: unknown[]
}

export interface MedicionHistorico {
  id: string
  obtenidoEn: string
  payload: unknown[]
  // Nota: el esquema confirmado de MedicionHistoricoDto no incluye desde/hasta
  // en la respuesta (a diferencia de registros/facturación), aunque el
  // endpoint sí acepta esos query params para filtrar.
}
```

## Relación

- Cada uno de los tres tipos representa una "fila histórica": un snapshot ya recolectado por el backend desde una API externa, para un socio y (en registros/facturación) una ventana de fechas.
- Un socio puede tener cero o más filas históricas de cada tipo dentro del rango consultado — el array vacío es el caso "sin datos" (FR-006), distinto de un error de red/servidor (FR-007).

## Estado del diálogo (in-memory, no persistido)

```ts
type HistoricoQueryState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T[] }
  | { status: "error"; message: string }
```

- El diálogo mantiene tres `HistoricoQueryState` independientes: uno para `RegistroHistorico[]`, uno para `FacturacionHistorico[]`, uno para `MedicionHistorico[]`.
- `status: "success"` con `data: []` es el caso "sin datos" (FR-006); se distingue de `status: "error"` (FR-007) en la UI.
- El rango de fechas (`{ desde: Date; hasta: Date } | null`) es un cuarto pedazo de estado, compartido por los tres — dispara las tres consultas a la vez cuando cambia y es válido (ver contracts/date-range-validation.md).
