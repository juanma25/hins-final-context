# Quickstart: Validar Integración con API Real

## Prerequisitos

1. Backend HINS corriendo y accesible (por defecto `http://localhost:3000`,
   ver `contracts/openapi.json`).
2. Variable de entorno configurada en `.env.local`:
   ```
   HINS_API_BASE_URL=http://localhost:3000
   ```
3. Al menos un usuario `HINS_ADMIN` creado en el backend (vía `POST /auth/register`
   seguido de asignación de rol, según proceso del backend) para poder crear
   proyectos/parques/socios de prueba.
4. Dependencias instaladas: `pnpm install` (incluye Vitest agregado en esta
   funcionalidad — ver `research.md` punto 1).

## Setup de datos de prueba

```bash
# 1. Registrar usuario admin (ajustar email/password)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","nombre":"Admin Test","password":"password123"}'

# 2. Login y capturar access_token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

## Validación por User Story

### US1 (P1) — Admin ve proyectos/parques reales

```bash
pnpm dev
```
1. Ir a `/login`, autenticar con el usuario admin.
2. Ir a `/main` → confirmar que la lista de proyectos coincide con `GET /proyectos`
   (comparar contra `curl -H "Authorization: Bearer <token>" http://localhost:3000/proyectos`).
3. Crear un parque desde la UI (si existe flujo) o vía `POST /parques`; abrir su
   detalle y confirmar que `potenciaTotalKwp`, `direccion`, etc. son los reales.
4. Con backend sin proyectos (`DELETE` manual o entorno limpio), confirmar
   estado vacío en `/main` (no datos de `data/*-mock.ts`).

**Expected**: cero diferencias entre UI y respuesta cruda del endpoint; ninguna
pantalla muestra valores que no existan en la respuesta HTTP.

### US2 (P2) — Socio/AGC/Owner ven datos scoped de su parque

1. Crear un Socio (`POST /parques/{parqueId}/socios`) asociado a un `usuarioId`
   de prueba con rol `SOCIO`.
2. Autenticar como ese usuario, ir a la vista Socio (`/gdcv/socio` o similar).
3. Confirmar dispositivos/alarmas/energía/roi/mantenimiento mostrados = respuesta
   de los endpoints scoped a `parqueId` del socio.
4. Intentar acceder (manualmente, cambiando la URL/parqueId) a un parque donde
   este usuario NO es socio → confirmar mensaje de acceso denegado (403 del
   backend propagado a la UI), no un crash ni datos de otro parque.
5. Filtrar alarmas por `estado=ACTIVA` en la UI → confirmar que coincide con
   `GET /parques/{parqueId}/alarmas?estado=ACTIVA`.

**Expected**: ninguna fuga de datos entre parques; filtros de la UI igualan
query params documentados en `contracts/openapi.json`.

### US3 (P3) — Admin gestiona usuarios y sincronización

1. Como HINS_ADMIN, listar usuarios (`/usuarios` en UI) y comparar con
   `GET /usuarios`.
2. Actualizar rol/activo de un usuario desde la UI → recargar y confirmar
   persistencia contra `GET /usuarios/{id}`.
3. Ir a la pantalla de configuración de sincronización, cambiar `intervaloMs`
   o `habilitado` para un modelo (p. ej. `ALARMAS`) → confirmar contra
   `GET /sincronizacion/configuraciones`.
4. Ver logs de sincronización, confirmar `limit` respetado (`GET /sincronizacion/logs?modelo=ALARMAS&limit=10`).

**Expected**: cambios administrativos persisten en backend real y se reflejan
sin recargar manualmente el mock.

## Verificación de eliminación de mocks

```bash
# No debe haber imports de datos de ejemplo de mocks en producción
# (se permite new-project-mock.ts por ser solo enum, ver data-model.md)
grep -rl "from \"@/data/" app components lib | grep -v new-project-mock
# Salida esperada: vacío
```

## Verificación de calidad

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test        # Vitest — agregado en esta funcionalidad (research.md #1)
pnpm build
```

Todos deben pasar sin errores antes de considerar la funcionalidad completa
(Principio V de la Constitución).
