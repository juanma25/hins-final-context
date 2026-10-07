# Data Model: Tablas de Histórico por Socio con Campos Específicos

## Filas tipadas (derivadas de `payload: unknown[]`, no persistidas)

Cada fila se obtiene leyendo campos puntuales de un item de `payload` (`Record<string, unknown>` en runtime); cualquier campo ausente o de tipo inesperado se resuelve a `undefined` → se muestra `"—"` en la tabla (FR-006).

```ts
interface FacturacionRow {
  ultimaLecturaFechaHora?: string
  ultimaLecturaActivaExportadaT1?: string
  ultimaLecturaActivaExportadaT2?: string
  ultimaLecturaActivaExportadaT3?: string
  ultimaLecturaActivaExportadaT0?: string
  ultimaLecturaActivaImportadaT0?: string
}

interface RegistroRow {
  energiaActivaImportada?: string
  tarifa?: string
  demandaActivaExportada?: string
  fechaHora?: string
}

interface MedicionRow {
  ultimoRegistroFechaHora?: string
  ultimaLecturaFechaHora?: string
}
```

## Columnas por tabla (FR-002 a FR-004)

**Corrección post-implementación** (ver quickstart.md / validación manual): la API no envuelve cada resultado en `{ id, obtenidoEn, payload: [...] }` — cada elemento del array es directamente un registro plano en **camelCase** (confirmado con una respuesta real de `/registros`: `fechaHora`, `energiaActivaImportada`, `tarifa`, `demandaActivaExportada`, junto a `id`/`socioId`/`obtenidoEn`/`desde`/`hasta` y muchos otros campos no usados por esta funcionalidad). La tabla de columnas se actualiza para reflejar los nombres reales:

| Tabla | Campo API (directo en cada item del array) | Etiqueta de columna |
|---|---|---|
| Facturación | `ultimaLecturaFechaHora` | Última lectura (fecha y hora) |
| Facturación | `ultimaLecturaActivaExportadaT1` | Activa exportada T1 |
| Facturación | `ultimaLecturaActivaExportadaT2` | Activa exportada T2 |
| Facturación | `ultimaLecturaActivaExportadaT3` | Activa exportada T3 |
| Facturación | `ultimaLecturaActivaExportadaT0` | Activa exportada T0 |
| Facturación | `ultimaLecturaActivaImportadaT0` | Activa importada T0 |
| Registros | `energiaActivaImportada` | Energía activa importada |
| Registros | `tarifa` | Tarifa |
| Registros | `demandaActivaExportada` | Demanda activa exportada |
| Registros | `fechaHora` | Fecha y hora |
| Mediciones | `ultimoRegistroFechaHora` | Último registro (fecha y hora) |
| Mediciones | `ultimaLecturaFechaHora` | Última lectura (fecha y hora) |

Los nombres de Facturación/Mediciones arriba no se confirmaron con una respuesta real (solo Registros); si al validar difieren, ajustar `mapFacturacionRow`/`mapMedicionRow` en `SocioHistoricoDialog.tsx` de la misma forma en que se corrigió `mapRegistroRow`.

## Relación

- Cada fila tipada corresponde 1:1 a un item de `payload` de un `RegistroHistorico`/`FacturacionHistorico`/`MedicionHistorico` (ver `specs/009-socio-historico-dialog/data-model.md`) — un histórico puede tener varios items de `payload` por resultado, y varios resultados por rango consultado; la tabla aplana todos los items de `payload` de todos los resultados del histórico en filas, una por item.
- `DatePicker.value` pasa de `Date` a `Date | undefined`; `undefined` representa "sin fecha seleccionada aún" (nuevo estado honesto, antes inexistente en este componente).
