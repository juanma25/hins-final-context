// Tipos 1:1 con contracts/openapi.json — ver specs/001-api-integration-remove-mocks/data-model.md

export type UsuarioRole = "HINS_ADMIN" | "GDD_OWNER" | "AGC" | "SOCIO"
export type ModeloNegocio = "GDD" | "GDC" | "GDCV"
export type TipoCargo = "CON_POTENCIA" | "SIN_POTENCIA"
export type ModeloSincronizado = "ESTACIONES" | "DISPOSITIVOS" | "ENERGIA" | "ALARMAS"
export type EstadoAlarma = "ACTIVA" | "LIMPIA"
export type EstadoEjecucionSincronizacion = "EN_CURSO" | "EXITOSO" | "FALLIDO"

export interface ErrorResponse {
  statusCode: number
  message: string
}

export interface RegisterDto {
  email: string
  nombre: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface Usuario {
  id: string
  email: string
  nombre: string
  role: UsuarioRole
  activo: boolean
}

export interface UsuarioMe {
  id: string
  email: string
  nombre: string
  role: UsuarioRole
}

export interface UpdateUsuarioDto {
  nombre?: string
  role?: UsuarioRole
  activo?: boolean
}

export interface CreateProyectoDto {
  nombre: string
  modelo: ModeloNegocio
  ubicacion: string
}

export interface Proyecto {
  id: string
  nombre: string
  modelo: ModeloNegocio
  ubicacion: string
  fechaAlta: string
  activo: boolean
  imageUrl?: string
}

export interface CreateParqueDto {
  proyectoId: string
  potenciaTotalKwp: number
  fechaPuestaEnMarcha: string
}

export interface Parque {
  id: string
  proyectoId: string
  potenciaTotalKwp: number
  fechaPuestaEnMarcha: string
  stationExternalId: string | null
  nombreExterno: string | null
  direccion: string | null
  longitud: number | null
  latitud: number | null
  contactoNombre: string | null
  contactoInfo: string | null
}

export interface CreateSocioDto {
  parqueId: string
  nombre: string
  participacionPorcentaje: number
  tipoCargo: TipoCargo
  medidorNumero: string
  suministroNumero: string
  contratoNumero: string
}

export interface Socio {
  id: string
  parqueId: string
  nombre: string
  participacionPorcentaje: number
  tipoCargo: TipoCargo
  medidorNumero: string
  suministroNumero: string
  contratoNumero: string
  usuarioId: string | null
}

export interface Dispositivo {
  id: string
  parqueId: string
  externalDeviceId: string
  serialNumber: string | null
  nombre: string | null
  tipoId: number
  modelo: string | null
  softwareVersion: string | null
  datosMonitoreo: Record<string, unknown> | null
  ultimaSincronizacion: string | null
}

export interface Alarma {
  id: string
  parqueId: string
  dispositivoId: string | null
  externalAlarmId: number
  esnCodeExterno: string | null
  nombre: string
  causa: string | null
  causaId: number | null
  tipo: number
  severidad: number
  fechaGenerada: string
  estado: EstadoAlarma
  fechaLimpiada: string | null
  ultimaSincronizacion: string
}

export interface RegistrarEnergiaDto {
  periodo: string
  energiaInyectadaKwh?: number
  energiaGeneradaKwh?: number
  creditoGenerado?: number
  ahorroEpec?: number
}

export interface RegistroEnergia {
  id: string
  parqueId: string
  periodo: string
  energiaInyectadaKwh: number | null
  energiaGeneradaKwh: number | null
  creditoGenerado: number | null
  ahorroEpec: number | null
}

/**
 * Forma real de lectura de GET /parques/{parqueId}/energia — distinta de
 * RegistroEnergia (que refleja el DTO de escritura/swagger). Ver
 * specs/002-park-energy-chart/research.md Decision 1/2.
 */
export interface RegistroEnergiaMensual {
  periodo: string
  energiaMesKwh: number | null
  ingresoMes: number | null
}

/**
 * Forma real de lectura de GET /parques/{parqueId}/energia?periodo=YYYY-MM —
 * granularidad diaria dentro de un mes. Ver
 * specs/003-monthly-generation-kpi/research.md Decision 1.
 */
export interface RegistroEnergiaDiario {
  fecha: string
  energiaDiaKwh: number | null
  ingresoDia: number | null
}

/**
 * Forma real de lectura de GET /parques/{parqueId}/energia?periodo=YYYY-MM-DD —
 * snapshot de energía de un día puntual. Distinta de RegistroEnergiaDiario
 * (forma de ?periodo=YYYY-MM, un array de días dentro de un mes). Ver
 * specs/004-daily-monthly-energy-view/research.md Decision 1.
 */
export interface RegistroEnergiaDia {
  capturadoEn: string
  energiaDiaKwh: number | null
  ingresoDia: number | null
  energiaTotalKwh: number | null
  energiaInyectadaDiaKwh: number | null
  energiaConsumidaDiaKwh: number | null
}

/**
 * Forma real (slim) de un registro crudo de
 * GET /parques/{parqueId}/medidor-principal/registros?desde=...&hasta=... —
 * solo los campos usados por la comparativa diaria (DIMMs vs Huawei). Cada
 * registro ya es el delta de energía de su intervalo (confirmado por el
 * usuario), no una lectura acumulada del medidor.
 */
export interface RegistroMedidorPrincipal {
  /** Momento de la medición, hora local del parque (America/Argentina/Buenos_Aires). */
  fechaHora: string
  /** Delta de energía activa exportada del intervalo, en Wh. */
  energiaActivaExportadaWh: number | null
}

/**
 * Forma real de lectura de
 * GET /parques/{parqueId}/medidor-principal/registros/consolidado?periodo=YYYY-MM —
 * solo los campos usados por la comparativa DIMMs vs Huawei (no se persiste
 * `porTarifa`). Ver specs/012-comparativa-dimms-huawei/contracts/medidor-principal-consolidado.md.
 */
export interface ConsolidadoMedidorPrincipal {
  desde: string
  hasta: string
  totalRegistros: number
  energiaActivaExportadaKwh: number | null
}

export interface RegistrarRoiDto {
  socioId?: string
  periodo: string
  inversionMeta: number
  creditoAcumulado: number
  paybackEstimadoMeses?: number
  tir?: number
}

export interface RegistroRoi {
  id: string
  parqueId: string
  socioId: string | null
  periodo: string
  inversionMeta: number
  creditoAcumulado: number
  paybackEstimadoMeses: number | null
  tir: number | null
}

export interface RegistrarMantenimientoDto {
  periodo: string
  cantidadMantenciones: number
  costosAsociados: number
  detalle?: string
}

export interface RegistroMantenimiento {
  id: string
  parqueId: string
  periodo: string
  cantidadMantenciones: number
  costosAsociados: number
  detalle: string | null
}

export interface UltimaEjecucionDto {
  inicio: string
  fin: string | null
  estado: EstadoEjecucionSincronizacion
  registrosProcesados: number
  registrosOmitidos: number
}

export interface ConfiguracionSincronizacionDto {
  modelo: ModeloSincronizado
  intervaloMs: number
  habilitado: boolean
  ultimaEjecucion: UltimaEjecucionDto
}

export interface ActualizarConfiguracionSincronizacionDto {
  intervaloMs?: number
  habilitado?: boolean
}

export interface RegistroEjecucionSincronizacionDto {
  inicio: string
  fin: string | null
  estado: EstadoEjecucionSincronizacion
  registrosProcesados: number
  registrosOmitidos: number
  mensajeError: string | null
}

/**
 * Cada item es un registro plano devuelto tal cual por la API externa
 * consultada por el backend — sin esquema fijo más allá de `id`/`socioId`/
 * `obtenidoEn` (ver specs/010-socio-historico-tablas/research.md, corregido
 * respecto a la asunción inicial de un wrapper `payload`).
 */
export type RegistroHistorico = Record<string, unknown>
export type FacturacionHistorico = Record<string, unknown>
export type MedicionHistorico = Record<string, unknown>

// ─── Configuración de administrador (specs/013-admin-config-tarifas-costos) ─────

export type TarifaEstado = "HISTORICA" | "VIGENTE" | "FUTURA"
export type TipoCosto = "FIJO" | "VARIABLE"
export type Periodicidad = "DIARIA" | "MENSUAL" | "ANUAL"
export type TipoCambioTipo = "PROYECTO" | "REAL"

export interface Tarifa {
  id: string
  nombre: string
  valorEnergia: number
  valorInyeccion: number
  unidad: string
  vigenteDesde: string
  vigenteHasta: string | null
  estado: TarifaEstado
}

export interface CreateTarifaDto {
  nombre: string
  valorEnergia: number
  valorInyeccion: number
  unidad: string
  vigenteDesde: string
}

export type UpdateTarifaDto = Partial<Omit<CreateTarifaDto, "nombre">>

export interface Costo {
  id: string
  proyectoId: string
  parqueId: string
  concepto: string
  tipoCosto: TipoCosto
  valor: number
  moneda: string
  unidad: string
}

export interface CreateCostoDto {
  proyectoId: string
  parqueId: string
  concepto: string
  tipoCosto: TipoCosto
  valor: number
  moneda: string
  unidad: string
}

export type UpdateCostoDto = Partial<CreateCostoDto>

export interface TipoCambio {
  id: string
  tipo: TipoCambioTipo
  periodicidad: Periodicidad
  periodo: string
  valor: number
  unidad: "ARS/USD"
}

export interface CreateTipoCambioDto {
  periodo: string
  periodicidad: Periodicidad
  tipo: TipoCambioTipo
  valor: number
  unidad: "ARS/USD"
}

export type UpdateTipoCambioDto = Partial<CreateTipoCambioDto>
