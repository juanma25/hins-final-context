# Data Model: Integración con API Real y Eliminación de Mocks

Todas las entidades se derivan 1:1 de `contracts/openapi.json` (`components.schemas`).
Los tipos TS viven en `lib/api/types.ts`; nombres de campo y de enum se mantienen
exactamente como en el contrato (español, mismo casing) — ver FR-003.

## Enums

- **UsuarioRole**: `HINS_ADMIN | GDD_OWNER | AGC | SOCIO`
- **ModeloNegocio**: `GDD | GDC | GDCV`
- **TipoCargo**: `CON_POTENCIA | SIN_POTENCIA`
- **ModeloSincronizado**: `ESTACIONES | DISPOSITIVOS | ENERGIA | ALARMAS`
- **EstadoAlarma**: `ACTIVA | LIMPIA`
- **EstadoEjecucionSincronizacion**: `EN_CURSO | EXITOSO | FALLIDO`

## Entities

### Usuario
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| email | string | |
| nombre | string | |
| role | UsuarioRole | |
| activo | boolean | |

`UsuarioMe` (respuesta de `/usuarios/me`): igual sin `activo`.

Relación: 0..1 con Socio (`Socio.usuarioId`).

### Proyecto
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| nombre | string | |
| modelo | ModeloNegocio | |
| ubicacion | string | |
| fechaAlta | string (date-time) | |
| activo | boolean | |

Relación: 1 Proyecto → N Parque (vía `Parque.proyectoId`, no expuesto como listado directo en el contrato — se obtiene filtrando `/parques` client-side o navegando desde Proyecto si el backend lo soporta a futuro).

### Parque
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| proyectoId | string | FK a Proyecto |
| potenciaTotalKwp | number | |
| fechaPuestaEnMarcha | string (date-time) | |
| stationExternalId | string \| null | |
| nombreExterno | string \| null | |
| direccion | string \| null | |
| longitud | number \| null | |
| latitud | number \| null | |
| contactoNombre | string \| null | |
| contactoInfo | string \| null | |

Relaciones: N Socio, N Dispositivo, N Alarma, N RegistroEnergia, N RegistroRoi, N RegistroMantenimiento — todas vía `parqueId`.

Reemplaza: `lib/park-config.ts` (constantes `GDCV_TOTAL_POTENCIA`, `GDD_TOTAL_POTENCIA`, `GDC_TOTAL_POTENCIA`, `*_AUTOCONSUMO_PORCENTAJE`, `*_INVERSION_META`) — estos valores ya no existen como tal en el contrato; `potenciaTotalKwp` viene de Parque, inversión meta viene de `RegistrarRoiDto.inversionMeta` (por registro, no constante fija). Ver Assumption del spec: reemplazo total, no fallback.

### Socio
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| parqueId | string | FK a Parque |
| nombre | string | |
| participacionPorcentaje | number | |
| tipoCargo | TipoCargo | |
| medidorNumero | string | |
| usuarioId | string \| null | FK opcional a Usuario |

### Dispositivo
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| parqueId | string | FK a Parque |
| externalDeviceId | string | |
| serialNumber | string \| null | |
| nombre | string \| null | |
| tipoId | integer | |
| modelo | string \| null | |
| softwareVersion | string \| null | |
| datosMonitoreo | object \| null | shape libre (`additionalProperties: true`) |
| ultimaSincronizacion | string (date-time) \| null | Orden de listado: descendente |

### Alarma
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| parqueId | string | FK a Parque |
| dispositivoId | string \| null | FK opcional a Dispositivo |
| externalAlarmId | integer | |
| esnCodeExterno | string \| null | |
| nombre | string | |
| causa | string \| null | |
| causaId | integer \| null | |
| tipo | integer | |
| severidad | integer | |
| fechaGenerada | string (date-time) | Orden de listado: descendente |
| estado | EstadoAlarma | Filtro opcional en `GET /parques/{parqueId}/alarmas?estado=` |
| fechaLimpiada | string (date-time) \| null | |
| ultimaSincronizacion | string (date-time) | |

### RegistroEnergia
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| parqueId | string | FK a Parque |
| periodo | string | |
| energiaInyectadaKwh | number \| null | |
| energiaGeneradaKwh | number \| null | |
| creditoGenerado | number \| null | |
| ahorroEpec | number \| null | |

### RegistroRoi
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| parqueId | string | FK a Parque |
| socioId | string \| null | FK opcional a Socio |
| periodo | string | |
| inversionMeta | number | |
| creditoAcumulado | number | |
| paybackEstimadoMeses | number \| null | |
| tir | number \| null | |

### RegistroMantenimiento
| Campo | Tipo | Notas |
|---|---|---|
| id | string | |
| parqueId | string | FK a Parque |
| periodo | string | |
| cantidadMantenciones | integer | |
| costosAsociados | number | |
| detalle | string \| null | |

### ConfiguracionSincronizacion
| Campo | Tipo | Notas |
|---|---|---|
| modelo | ModeloSincronizado | clave, no autogenerada |
| intervaloMs | integer | |
| habilitado | boolean | |
| ultimaEjecucion | UltimaEjecucionDto | ver abajo |

`UltimaEjecucionDto`: `{ inicio, fin?, estado: EstadoEjecucionSincronizacion, registrosProcesados, registrosOmitidos }`

`RegistroEjecucionSincronizacionDto` (para `/sincronizacion/logs`): igual que `UltimaEjecucionDto` + `mensajeError?: string | null`.

## Validation rules (desde requestBody schemas)

- `RegisterDto`: `email` formato email, `nombre` requerido, `password` mínimo 8 caracteres.
- `LoginDto`: `email`, `password` requeridos.
- `CreateProyectoDto`: `nombre`, `modelo`, `ubicacion` requeridos.
- `CreateParqueDto`: `proyectoId`, `potenciaTotalKwp`, `fechaPuestaEnMarcha` requeridos.
- `CreateSocioDto`: `parqueId`, `nombre`, `participacionPorcentaje`, `tipoCargo`, `medidorNumero` requeridos.
- `RegistrarEnergiaDto`: solo `periodo` requerido; resto opcional.
- `RegistrarRoiDto`: `periodo`, `inversionMeta`, `creditoAcumulado` requeridos.
- `RegistrarMantenimientoDto`: `periodo`, `cantidadMantenciones`, `costosAsociados` requeridos.
- `ActualizarConfiguracionSincronizacionDto`: `intervaloMs` (mínimo 1) y `habilitado` opcionales.

## State transitions

- **Alarma.estado**: `ACTIVA → LIMPIA` (unidireccional, se asume gestionado por el backend/sincronización externa, no por el frontend).
- **ConfiguracionSincronizacion.ultimaEjecucion.estado**: `EN_CURSO → EXITOSO | FALLIDO` (gestionado por el proceso de sincronización del backend; el frontend solo lee/lista, no transiciona este estado).

## Mocks a eliminar (mapeo a entidades reales)

| Mock actual | Reemplazado por |
|---|---|
| `data/gdcv-mock.ts`, `gdcv-agc-mock.ts`, `gdcv-socio-mock.ts` | Parque, Socio, RegistroRoi, RegistroEnergia vía `lib/api/*` |
| `data/gdd-performance-mock.ts` | RegistroEnergia (`lib/api/energia.ts`) |
| `data/gdd-roi-mock.ts` | RegistroRoi (`lib/api/roi.ts`) |
| `data/mantenimiento-mock.ts` | RegistroMantenimiento (`lib/api/mantenimiento.ts`) |
| `data/dashboard-downloads-mock.ts`, `chart-config.ts`, `legal-information-placeholder.ts` | Fuera de alcance — no corresponden a ningún schema del contrato; se mantienen sin cambios |
| `data/new-project-mock.ts` | Se mantiene como archivo (sin datos de ejemplo), pero MUST renombrarse para igualar el contrato (FR-003): `ProjectType = "GDCV" \| "GDD"` le falta `"GDC"` y debe alinearse a `ModeloNegocio`; el campo `tipo` en `NewProjectFormData` debe renombrarse a `modelo`. Ver corrección aplicada tras `/speckit-analyze` (finding I1). |
| `lib/park-config.ts` | Eliminado — código muerto, no tenía imports en ningún componente (verificado durante implementación) |

### Excepción documentada: vistas de "Performance" (energía horaria/diaria, sparklines, promedio por usuario)

`GdcvPerformanceView.tsx`, y sus análogos GDD/GDC (`ParkPerformanceView.tsx` y equivalentes), renderizan:
- Generación horaria/diaria (`data/gdcv-daily-mock.ts` → `getDailyGenerationData24`, "pico del día")
- Sparklines de generación
- KPIs derivados sin respaldo de contrato: "promedio por usuario", deltas comparativos período a período

`RegistroEnergia` (el único schema de energía del contrato) solo expone agregados **mensuales** por `periodo`
(`energiaInyectadaKwh`, `energiaGeneradaKwh`, `creditoGenerado`, `ahorroEpec`) — no hay endpoint ni campo para
granularidad horaria/diaria, ni para desagregar por socio, ni para deltas comparativos.

**Decisión** (tras pregunta directa al usuario durante implementación): estas vistas se mantienen sobre datos
mock por ahora, documentadas como excepción explícita a FR-001/FR-004, hasta que el backend exponga los
endpoints necesarios. El resto de las vistas de cada dashboard (Socios, Mantenimiento, Alarmas, Dispositivos,
ROI mensual, administración) sí se reconectan a datos reales en esta funcionalidad.

### Excepción parcial: KPIs de ROI derivados (timeline, plazo, curva de proyección)

`GddRoiView.tsx`/`GdcvRoiView.tsx` mezclan dos categorías de datos: (a) valores directamente derivables de
`RegistroRoi` (`inversionMeta`, `creditoAcumulado`, `tir` → Total Invertido, Recuperado, % Recuperado,
Pendiente, TIR), ya reconectados vía `lib/roi-kpis.ts computeRealRoiKpis`; y (b) "Recupero Estimado", "Plazo",
el timeline (Inicio/Hoy/Payback) y la curva de proyección con bandas de escenario optimista/conservador — sin
ningún campo equivalente en el contrato (no hay fecha de inicio del proyecto, plazo total, ni escenarios). El
grupo (b) permanece en `data/gdd-roi-mock.ts`/`gdcv-agc-mock.ts`, misma categoría que la excepción de
Performance de arriba.

### CONFIRMADO: `GET /proyectos/{proyectoId}/parques`

Contrato actualizado (2026-07-17) — `docs/openapi.json` ya incluye este endpoint:
`GET /proyectos/{proyectoId}/parques` → `Parque[]` (0, 1 o N), 403 rol no autorizado, 404 proyecto no encontrado.
Coincide exactamente con lo asumido e implementado en `lib/api/parques.ts` (`listParquesByProyecto`,
`getPrimaryParque` — toma el primero, 1 parque por proyecto en el uso actual del producto). Sin cambios de
código necesarios; se retira la marca de "asunción pendiente".

La navegación desde `ProjectCard` pasa `?proyectoId=` en la URL (`lib/project-presentation.ts hrefForModelo`),
y cada página de dashboard resuelve Proyecto+Parque vía `lib/api/dashboard-context.ts resolveDashboardContext(proyectoId)`.
Los datos reales del Parque (potencia, fecha de inicio, dirección, contacto) ya se muestran en `ParkDetailsCard`
de las vistas Performance GDD/GDCV (`lib/park-details-metrics.ts parqueToDetailsMetrics`), aun cuando el resto
de esas vistas (energía horaria/diaria, tabla de socios) sigue en la excepción documentada arriba.

