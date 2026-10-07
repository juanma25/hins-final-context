---

description: "Task list for Integración con API Real y Eliminación de Mocks"
---

# Tasks: Integración con API Real y Eliminación de Mocks

**Input**: Design documents from `/specs/001-api-integration-remove-mocks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included — Constitución Principio III (Test-First for Data & Business Logic) es NON-NEGOTIABLE para cualquier función de transformación/validación de datos de dominio; se agregan tests Vitest para toda lógica en `lib/api/` antes de su implementación.

**Organization**: Tasks agrupadas por user story (US1/US2/US3, ver spec.md) para permitir implementación y validación independiente de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Rutas de archivo exactas en cada descripción

## Path Conventions

Proyecto único Next.js App Router (ver plan.md → Project Structure). `lib/api/` es la nueva capa de acceso HTTP; `app/` y `components/` son las páginas/UI existentes a reconectar; `tests/lib/api/` son los tests unitarios nuevos.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar tooling de test y configuración base antes de tocar cualquier capa de datos

- [X] T001 Instalar Vitest como devDependency (`pnpm add -D vitest`) y agregar script `"test": "vitest run"` en `package.json`, per research.md §1
- [X] T002 [P] Crear `vitest.config.ts` en la raíz reutilizando el alias `@/*` de `tsconfig.json`
- [X] T003 [P] Crear `.env.example` en la raíz con `HINS_API_BASE_URL=http://localhost:3000` (research.md §5) y agregar `.env.local` a `.gitignore` si no está
- [X] T004 [P] Copiar `docs/openapi.json` actualizado a `specs/001-api-integration-remove-mocks/contracts/openapi.json` si difiere del ya versionado (verificar diff antes de sobreescribir)

**Checkpoint**: `pnpm test` corre (aunque sin tests todavía) y `HINS_API_BASE_URL` está disponible en `process.env` en desarrollo

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura de acceso a datos que TODAS las user stories consumen — tipos, cliente HTTP, manejo de errores, auth. Ninguna historia puede empezar sin esto.

**⚠️ CRITICAL**: No iniciar Phase 3+ hasta completar esta fase.

- [X] T005 [P] Crear tipos TS 1:1 con `contracts/openapi.json` (todos los schemas y enums de data-model.md) en `lib/api/types.ts`
- [X] T005a [P] Crear componente/helper compartido de placeholder para campos nullable del contrato (p. ej. `<NullableValue>` o `formatNullable()` en `lib/utils.ts`, mostrando "—") a reutilizar en toda reconexión de UI que renderice campos opcionales (FR-012, hallazgo E1 de `/speckit-analyze`)
- [X] T006 [P] Test unitario para manejo de errores HTTP (401→UnauthorizedError, 403→ForbiddenError con mensaje de `ErrorResponse`, 404→null) en `tests/lib/api/client.test.ts` — debe FALLAR antes de implementar
- [X] T007 Implementar cliente HTTP base (`lib/api/client.ts`): base URL desde `process.env.HINS_API_BASE_URL`, adjunta `Authorization: Bearer <token>`, implementa el manejo de errores de T006 hasta que el test pase (depende de T005, T006)
- [X] T008 Implementar `lib/api/auth.ts`: funciones `login(email, password)` y `register(email, nombre, password)` que llaman `POST /auth/login` / `POST /auth/register` vía `lib/api/client.ts` (depende de T007)
- [X] T009 Crear Route Handler `app/api/auth/login/route.ts`: recibe credenciales, llama `lib/api/auth.ts login()`, setea `access_token` en cookie httpOnly (research.md §2) (depende de T008)
- [X] T010 [P] Crear Route Handler `app/api/auth/register/route.ts`: análogo a T009 para registro (depende de T008)
- [X] T011 Crear helper `lib/api/session.ts`: lee la cookie httpOnly vía `cookies()` de `next/headers`, expone `getToken()` y `clearSession()` (Server Action) (depende de T009, T010)
- [X] T012 Actualizar `lib/api/client.ts` para tomar el token de `lib/api/session.ts getToken()` automáticamente en cada llamada, en vez de recibirlo como parámetro manual (depende de T007, T011)

**Checkpoint**: Login real funciona end-to-end (cookie seteada, token disponible a `lib/api/client.ts`); toda historia de usuario puede ahora construirse sobre esta base

---

## Phase 3: User Story 1 - Administrador ve datos reales de proyectos y parques (Priority: P1) 🎯 MVP

**Goal**: Dashboard `/main` y vistas de detalle de parque muestran datos reales de `GET /proyectos` y `GET /parques/{id}`, con creación real de proyecto/parque, sin mocks ni `lib/park-config.ts`

**Independent Test**: Con JWT válido de HINS_ADMIN y al menos un proyecto/parque en backend, cargar `/main` y detalle de parque; confirmar que valores coinciden con la respuesta cruda de los endpoints (quickstart.md → US1)

### Tests for User Story 1

- [X] T013 [P] [US1] Test unitario para `lib/api/proyectos.ts` (parseo de `fechaAlta`, manejo de lista vacía) en `tests/lib/api/proyectos.test.ts` — debe FALLAR antes de implementar
- [X] T014 [P] [US1] Test unitario para `lib/api/parques.ts` (manejo de campos nullable: `stationExternalId`, `direccion`, `longitud`, `latitud`, `contactoNombre`, `contactoInfo`) en `tests/lib/api/parques.test.ts` — debe FALLAR antes de implementar

### Implementation for User Story 1

- [X] T015 [US1] Implementar `lib/api/proyectos.ts`: `listProyectos()` (`GET /proyectos`), `createProyecto(dto)` (`POST /proyectos`) hasta que T013 pase (depende de T007, T012, T013)
- [X] T016 [US1] Implementar `lib/api/parques.ts`: `getParque(id)` (`GET /parques/{id}`), `createParque(dto)` (`POST /parques`) hasta que T014 pase (depende de T007, T012, T014)
- [X] T017 [US1] Reconectar `components/main/ProjectsView.tsx` para leer de `lib/api/proyectos.ts listProyectos()` en vez de `data/main-mock.ts`, incluyendo estado vacío cuando la lista es `[]`
- [X] T018 [US1] Corregir `data/new-project-mock.ts` y `components/main/NewProjectDialog.tsx` para igualar el contrato (FR-003, hallazgo I1 de `/speckit-analyze`): renombrar `ProjectType` a los valores de `ModeloNegocio` (`"GDD" | "GDC" | "GDCV"`, agregando el `"GDC"` faltante) y el campo `tipo` a `modelo` en `NewProjectFormData`; agregar el campo `ubicacion` (requerido por `CreateProyectoDto`, ausente hoy en el formulario); luego reconectar el diálogo para llamar `lib/api/proyectos.ts createProyecto()` en vez del `console.log` actual (línea ~64), con manejo de éxito (cerrar diálogo, invalidar cache/redirigir a `/main`, toast) y error (toast, mantener diálogo abierto) según BACKEND_INTEGRATION.md §4
- [X] T019 [US1] `lib/park-config.ts` resultó ser código muerto (sin imports en ningún componente) — eliminado directamente sin necesidad de reconexión. Vistas de detalle "Performance" (`ParkDetailsCard`/`gdcvParkDetails` en `GdcvPerformanceView.tsx` y análogos) quedan documentadas como excepción (ver data-model.md → "Excepción documentada") por mezclar campos reales de Parque con datos sin equivalente en el contrato (equipamiento, imagen)
- [X] T020 [US1] Completado como parte de T019 — `lib/park-config.ts` eliminado, no tenía imports que reemplazar (los `*_TOTAL_POTENCIA`/`*_INVERSION_META` reales en uso viven en `data/gdcv-mock.ts`/`gdcv-roi-mock.ts`, cubiertos por la excepción de Performance y por T032 respectivamente)
- [ ] T021 [US1] Eliminar `data/main-mock.ts` y cualquier mock de proyectos/parques ya sin referencias (depende de T017, T018, T019, T020)
- [ ] T022 [US1] Agregar manejo de error 401/403/404 visible en `/main` y vista de detalle de parque usando los tipos de error de `lib/api/client.ts` (T007), reemplazando cualquier fallback silencioso a datos vacíos

**Checkpoint**: US1 funcional y testeable de forma independiente — `/main` y detalle de parque 100% en datos reales, cero referencias a `park-config.ts` o `main-mock.ts`

---

## Phase 4: User Story 2 - Socio/AGC/Owner ve dispositivos, alarmas, energía, ROI y mantenimiento de su parque (Priority: P2)

**Goal**: Vistas de dispositivos, alarmas (con filtro `estado`), energía, ROI y mantenimiento de un parque muestran datos reales scoped al rol/participación del usuario autenticado

**Independent Test**: Autenticado como SOCIO de un parque, confirmar que dispositivos/alarmas/energía/roi/mantenimiento coinciden con el backend y que acceder a un parque ajeno resulta en 403 manejado (quickstart.md → US2)

### Tests for User Story 2

- [X] T023 [P] [US2] Test unitario para `lib/api/dispositivos.ts` (orden descendente por `ultimaSincronizacion`, manejo de `datosMonitoreo` null) en `tests/lib/api/dispositivos.test.ts` — debe FALLAR antes de implementar
- [X] T024 [P] [US2] Test unitario para `lib/api/alarmas.ts` (filtro por `estado`, orden descendente por `fechaGenerada`, campos nullable `causa`/`causaId`/`fechaLimpiada`) en `tests/lib/api/alarmas.test.ts` — debe FALLAR antes de implementar
- [X] T025 [P] [US2] Test unitario para `lib/api/energia.ts`, `lib/api/roi.ts`, `lib/api/mantenimiento.ts` (manejo de campos nullable en RegistroEnergia/RegistroRoi/RegistroMantenimiento) en `tests/lib/api/energia-roi-mantenimiento.test.ts` — debe FALLAR antes de implementar

### Implementation for User Story 2

- [X] T026 [P] [US2] Implementar `lib/api/dispositivos.ts`: `listDispositivos(parqueId)` (`GET /parques/{parqueId}/dispositivos`) hasta que T023 pase (depende de T007, T012, T023)
- [X] T027 [P] [US2] Implementar `lib/api/alarmas.ts`: `listAlarmas(parqueId, estado?)` (`GET /parques/{parqueId}/alarmas?estado=`) hasta que T024 pase (depende de T007, T012, T024)
- [X] T028 [P] [US2] Implementar `lib/api/energia.ts`: `listEnergia(parqueId)`, `registrarEnergia(parqueId, dto)`; `lib/api/roi.ts`: `listRoi(parqueId)`, `registrarRoi(parqueId, dto)`; `lib/api/mantenimiento.ts`: `listMantenimiento(parqueId)`, `registrarMantenimiento(parqueId, dto)` — hasta que T025 pase (depende de T007, T012, T025)
- [ ] T029 [US2] Reconectar componentes de dispositivos bajo `components/gdd/`, `components/gdc/`, `components/gdcv/` (buscar consumidores de mocks de dispositivos) para usar `lib/api/dispositivos.ts` (depende de T026)
- [ ] T030 [US2] Reconectar componentes de alarmas incluyendo el control de filtro por `estado` en la UI existente, para usar `lib/api/alarmas.ts` (depende de T027)
- [ ] T031 [US2] EXCEPCIÓN (ver data-model.md): `app/gdd/performance/page.tsx`, `app/gdc/performance/page.tsx`, `GdcvPerformanceView.tsx` quedan sobre mock por ahora — usan granularidad horaria/diaria y KPIs derivados (sparklines, promedio por usuario) sin equivalente en `RegistroEnergia` (solo mensual). No reconectar hasta que el backend exponga esos datos; revisar en una funcionalidad futura
- [X] T032 [US2] PARCIAL — `app/gdd/roi/page.tsx`, `app/gdcv/roi/page.tsx` (+ `GddRoiView`/`GdcvRoiView`) ahora calculan KPIs reales (Total Invertido, Recuperado, % Recuperado, Pendiente, TIR) desde `lib/api/roi.ts listRoi()` vía `lib/roi-kpis.ts computeRealRoiKpis` (registro más reciente por periodo). "Recupero Estimado", "Plazo", timeline y la curva de proyección (`ROIProjectionChart`) siguen en mock — sin equivalente en el contrato (mismo criterio que la excepción de Performance, ver data-model.md). `app/gdc/roi/page.tsx` (placeholder "próximamente") ahora muestra nombre real de parque/proyecto en vez de `gdcParkName` hardcodeado. `GDD_ROI_FECHA_HOY`/`GDCV_ROI_FECHA_HOY` NO se reemplazaron por fecha dinámica — siguen dentro del mock de la curva de proyección, parte de la excepción
- [X] T033 [US2] Reconectado `app/gdd/mantenimiento/page.tsx`, `app/gdc/mantenimiento/page.tsx`, `app/gdcv/mantenimiento/page.tsx` (+ sus `*MantenimientoView.tsx` y `components/mantenimiento/{ParkMantenimientoView,MantenimientoHistorialTable,MantenimientoDetailSheet}.tsx`) a `lib/api/mantenimiento.ts` vía el nuevo `lib/api/dashboard-context.ts` (resuelve Proyecto+Parque desde `?proyectoId=` en la URL — ver `lib/api/parques.ts getPrimaryParque`, asunción de endpoint futuro documentada en data-model.md). `data/mantenimiento-mock.ts` ya no lo usan estas vistas; campo `enCurso` (sin equivalente en el contrato) se eliminó de la UI
- [ ] T034 [US2] Reconectar `app/gdcv/socio/page.tsx`, `app/gdcv/socio/parque/page.tsx` y `components/gdcv/SocioDetailSheet.tsx` para usar `lib/api/parques.ts`, `lib/api/dispositivos.ts`, `lib/api/alarmas.ts`, `lib/api/energia.ts`, `lib/api/roi.ts`, `lib/api/mantenimiento.ts` scoped al `parqueId` del socio autenticado, eliminando `DETAIL_MAP`/`fallbackDetail` de datos de ejemplo (depende de T029, T030, T031, T032, T033)
- [ ] T035 [US2] Agregar manejo visible de 403 ("sin acceso al parque") en las vistas de dispositivos/alarmas/energía/roi/mantenimiento cuando el backend deniega acceso a un SOCIO sin participación (depende de T034)
- [ ] T036 [US2] Eliminar `data/gdcv-socio-mock.ts`, `data/mantenimiento-mock.ts` una vez sin referencias. `data/gdcv-mock.ts`, `data/gdcv-agc-mock.ts`, `data/gdcv-daily-mock.ts`, `data/gdcv-roi-mock.ts`, `data/gdd-performance-mock.ts`, `data/gdd-roi-mock.ts`, `data/park-equipment-mock.ts` se MANTIENEN por la excepción de Performance (T031) y de ROI histórico si aplica — no eliminar completos, solo las partes ya sin referencias tras T029/T030/T033/T034 (depende de T029, T030, T033, T034)

**Checkpoint**: US1 y US2 funcionan de forma independiente; vistas operativas de parque 100% en datos reales con scope por rol

---

## Phase 5: User Story 3 - Administrador gestiona usuarios, sincronización y registra datos operativos (Priority: P3)

**Goal**: HINS_ADMIN puede listar/actualizar/dar de baja usuarios, crear socios, y administrar configuración/logs de sincronización, todo contra el backend real

**Independent Test**: Como HINS_ADMIN, crear proyecto→parque→socio y verificar aparición en listados reales; gestionar sincronización y confirmar persistencia (quickstart.md → US3)

### Tests for User Story 3

- [X] T037 [P] [US3] Test unitario para `lib/api/usuarios.ts` (mapeo de `UsuarioRole` a permisos de UI) en `tests/lib/api/usuarios.test.ts` — debe FALLAR antes de implementar
- [X] T038 [P] [US3] Test unitario para `lib/api/sincronizacion.ts` (validación `intervaloMs >= 1` antes de enviar PATCH, parseo de `UltimaEjecucionDto`/`RegistroEjecucionSincronizacionDto`) en `tests/lib/api/sincronizacion.test.ts` — debe FALLAR antes de implementar

### Implementation for User Story 3

- [X] T039 [P] [US3] Implementar `lib/api/usuarios.ts`: `listUsuarios()`, `getUsuario(id)`, `getMe()`, `updateUsuario(id, dto)`, `deactivateUsuario(id)` hasta que T037 pase (depende de T007, T012, T037)
- [X] T040 [P] [US3] Implementar `lib/api/socios.ts`: `listSocios(parqueId)`, `createSocio(parqueId, dto)` (depende de T007, T012)
- [X] T041 [P] [US3] Implementar `lib/api/sincronizacion.ts`: `listConfiguraciones()`, `updateConfiguracion(modelo, dto)`, `listLogs(modelo, limit?)` hasta que T038 pase (depende de T007, T012, T038)
- [ ] T042 [US3] Crear/reconectar vista de administración de usuarios (buscar bajo `app/main/` o crear `app/main/usuarios/page.tsx` si no existe) para listar/ver/actualizar/dar de baja usuarios vía `lib/api/usuarios.ts` (depende de T039)
- [ ] T043 [US3] Reconectar flujo de creación de socio (dentro de `components/main/` o vista de detalle de parque) para usar `lib/api/socios.ts createSocio()` (depende de T040)
- [ ] T044 [US3] Crear/reconectar vista de configuración de sincronización (buscar bajo `app/main/` o crear `app/main/sincronizacion/page.tsx`) para listar y actualizar `intervaloMs`/`habilitado` por modelo vía `lib/api/sincronizacion.ts` (depende de T041)
- [ ] T045 [US3] Crear/reconectar vista de logs de sincronización con selector de `modelo` y `limit` vía `lib/api/sincronizacion.ts listLogs()` (depende de T041)
- [ ] T046 [US3] Eliminar cualquier mock residual de usuarios/sincronización si existiera, y actualizar `lib/gdcv-socio-auth.ts` para que el flujo OTP de socio se acople al `Socio` real obtenido de `lib/api/socios.ts` en vez de `sociosMock` de `data/gdcv-mock.ts` (depende de T040, T036)

**Checkpoint**: Las tres user stories funcionan de forma independiente y en conjunto; ninguna pantalla administrativa depende de datos simulados

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de eliminación de mocks y calidad, cruzando todas las historias

- [ ] T047 [P] Auditar y renombrar cualquier campo/tipo/enum de frontend restante que no coincida exactamente con `contracts/openapi.json` (FR-003), documentando cada rename en el PR
- [ ] T048 [P] Confirmar que `data/new-project-mock.ts` quedó renombrado para igualar el contrato tras T018 (enum `ModeloNegocio` completo incluyendo `"GDC"`, campo `modelo` en vez de `tipo`) y que `data/dashboard-downloads-mock.ts`, `data/chart-config.ts`, `data/legal-information-placeholder.ts`, `data/roi-currency-disclaimer.ts` quedan fuera de alcance por no corresponder a ningún schema del contrato
- [ ] T049 Correr `grep -rl "from \"@/data/" app components lib | grep -v new-project-mock` y confirmar salida vacía (quickstart.md → Verificación de eliminación de mocks)
- [ ] T050 Ejecutar `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm build` y corregir cualquier fallo (Constitución Principio V)
- [ ] T051 Ejecutar manualmente los pasos de `quickstart.md` para las tres user stories contra un backend real y documentar resultados

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las user stories (cliente HTTP, auth y sesión son compartidos)
- **User Stories (Phase 3-5)**: todas dependen de Foundational
  - US1 (P1): sin dependencia de otras historias
  - US2 (P2): independiente de US1 en términos de datos, pero comparte el patrón de acceso a `parqueId` establecido en US1 (T016) — se recomienda secuencial tras US1
  - US3 (P3): independiente de US1/US2 salvo T046 que depende de `lib/api/socios.ts` (T040) y de que `gdcv-mock.ts` haya sido removido en US2 (T036)
- **Polish (Phase 6)**: depende de que las historias que se quieran entregar estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar tras Phase 2 — sin dependencia de otras historias
- **US2 (P2)**: puede iniciar tras Phase 2; reutiliza `lib/api/parques.ts` de US1 pero es independientemente testeable con su propio parque de prueba
- **US3 (P3)**: puede iniciar tras Phase 2; T046 tiene dependencia cruzada puntual con US2 (ver arriba)

### Parallel Opportunities

- T002, T003, T004 en paralelo tras T001
- T005 y T006 en paralelo (tipos y test no se bloquean entre sí)
- T009 y T010 en paralelo (Route Handlers distintos)
- T013/T014 en paralelo; T023/T024/T025 en paralelo; T037/T038 en paralelo
- T026/T027/T028 en paralelo entre sí; T039/T040/T041 en paralelo entre sí
- Distintas user stories pueden asignarse a distintos desarrolladores tras Phase 2, con la salvedad de la dependencia T046→T036/T040

---

## Parallel Example: User Story 2

```bash
# Lanzar todos los tests de US2 juntos:
Task: "Test unitario para lib/api/dispositivos.ts en tests/lib/api/dispositivos.test.ts"
Task: "Test unitario para lib/api/alarmas.ts en tests/lib/api/alarmas.test.ts"
Task: "Test unitario para energia/roi/mantenimiento en tests/lib/api/energia-roi-mantenimiento.test.ts"

# Lanzar las implementaciones de módulos de US2 juntas (tras que sus tests fallen):
Task: "Implementar lib/api/dispositivos.ts"
Task: "Implementar lib/api/alarmas.ts"
Task: "Implementar lib/api/energia.ts, lib/api/roi.ts, lib/api/mantenimiento.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todas las historias)
3. Completar Phase 3: User Story 1
4. **DETENER y VALIDAR**: probar US1 de forma independiente con `quickstart.md` → US1
5. Deploy/demo si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar independientemente → deploy/demo (MVP)
3. US2 → validar independientemente → deploy/demo
4. US3 → validar independientemente → deploy/demo
5. Phase 6 (Polish) → verificación final de cero mocks y calidad

### Parallel Team Strategy

Con más de un desarrollador: completar Setup + Foundational en conjunto; luego un desarrollador toma US1, otro US2, otro US3, respetando la dependencia puntual T046→T036/T040.

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Tests deben escribirse y FALLAR antes de implementar (Constitución Principio III, NON-NEGOTIABLE)
- Commit tras cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma independiente
- No introducir capas de mapeo/alias permanentes entre nombres de campo backend/frontend (research.md §4) — renombrar directamente
