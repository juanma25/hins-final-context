# Phase 0 Research: Integración con API Real y Eliminación de Mocks

## 1. Test runner para Principio III (Test-First for Data & Business Logic)

**Decision**: Instalar **Vitest** como devDependency, con config mínima (`vitest.config.ts`
reutilizando alias `@/*` de `tsconfig.json`) y script `"test": "vitest run"` en
`package.json`. Tests unitarios viven en `tests/lib/api/**/*.test.ts`, uno por
módulo de `lib/api/` que contenga lógica de transformación (parseo de fechas,
normalización de nulls, filtros, mapeo de roles a permisos de UI).

**Rationale**: Vitest se integra sin fricción con TypeScript 5 + ESM +
`moduleResolution: bundler` ya configurado en `tsconfig.json`, no requiere
Babel/webpack config adicional (a diferencia de Jest con Next.js 16/React 19,
que pide transform config extra para JSX/ESM), y es el estándar de facto para
proyectos Next.js App Router nuevos. Cumple Principio V (Simplicity): una sola
dependencia nueva, cero configuración de infraestructura de test previa que
migrar.

**Alternatives considered**:
- **Jest**: descartado — requiere `next/jest` + configuración adicional para
  ESM/React 19 que añade fricción sin beneficio sobre Vitest para este alcance.
- **No tests / solo tipos**: descartado — viola explícitamente Principio III
  (NON-NEGOTIABLE) de la Constitución; los tests son la única red de seguridad
  disponible antes de tener runtime E2E contra el backend real.

## 2. Dónde vive el token JWT y cómo se adjunta a cada llamada

**Decision**: El `access_token` devuelto por `POST /auth/login` se guarda en
una **cookie httpOnly** seteada por un Route Handler propio
(`app/api/auth/login/route.ts` y `.../register/route.ts`) que hace de proxy
hacia el backend HINS. Los Server Components y Server Actions leen la cookie
vía `cookies()` de `next/headers` y la reenvían como header
`Authorization: Bearer <token>` en cada llamada hecha desde `lib/api/client.ts`.
Ninguna llamada a los 20 endpoints del contrato se hace directamente desde el
navegador.

**Rationale**: El contrato no define refresh tokens ni mecanismo de sesión
propio — es responsabilidad del frontend decidir cómo persistir el JWT. Una
cookie httpOnly evita exponer el token a JavaScript de cliente (superficie de
XSS), y mantiene el patrón ya exigido por Principio II (fetch a backend
externo solo desde el server). El Route Handler de login es la única
excepción de "proxy" necesaria porque `Set-Cookie` solo puede emitirse desde
el servidor.

**Alternatives considered**:
- **localStorage/sessionStorage en cliente** (patrón ya usado hoy en
  `lib/gdcv-socio-auth.ts` para el flujo demo OTP): descartado para el JWT del
  backend real — expone el token a cualquier script de cliente y a XSS; el
  patrón OTP de socio puede mantenerse como verificación adicional de UX pero
  no reemplaza la autenticación JWT.
- **Fetch directo desde cliente con Authorization header manejado en JS**:
  descartado — viola Principio II (Server/Client Boundary Discipline).

## 3. Manejo de expiración de sesión (401) sin refresh token

**Decision**: `lib/api/client.ts` centraliza el manejo de status: en 401,
lanza un error tipado (`UnauthorizedError`) que las páginas capturan para
redirigir a `/login` (o la ruta de login existente) y limpiar la cookie de
sesión vía un Server Action; en 403, lanza `ForbiddenError` con el mensaje del
`ErrorResponse` del backend para mostrar un estado de acceso denegado en la
UI; en 404, retorna `null`/estado "no encontrado" en vez de lanzar.

**Rationale**: Cumple FR-005 y el edge case de 401/403/404 del spec sin
introducir lógica ad-hoc en cada página; un solo punto de manejo de errores de
red es consistente con Principio V (Simplicity).

**Alternatives considered**:
- **Interceptor de librería HTTP (axios)**: descartado — no se añade
  dependencia nueva cuando `fetch` nativo + un wrapper delgado alcanza.

## 4. Alcance de renombrado de campos (FR-003)

**Decision**: Auditoría módulo por módulo contra `docs/openapi.json` al
implementar cada recurso (Fase 2/tasks), documentando cada rename en el PR
correspondiente. No se crea una capa de mapeo/alias intermedia — se renombra
directamente en tipos, componentes y hooks del frontend.

**Rationale**: Consistente con Principio V (Simplicity) y con la Assumption
del spec de que el contrato es fuente de verdad; una capa de alias sería
complejidad no solicitada y quedaría desactualizada con el tiempo.

**Alternatives considered**:
- **Capa de adaptadores backend↔frontend permanente**: descartado por spec
  (edge case explícito: "no se agregan capas de mapeo/alias permanentes").

## 5. Base URL del backend configurable

**Decision**: Variable de entorno `HINS_API_BASE_URL` (server-only, sin
prefijo `NEXT_PUBLIC_`, ya que todo fetch ocurre en servidor), con default
`http://localhost:3000` documentado en un nuevo `.env.example`.

**Rationale**: Ninguna llamada ocurre en cliente (ver punto 2), así que no
hace falta exponerla al bundle de navegador — mantiene el token y la URL del
backend fuera del cliente, reduciendo superficie de ataque.

**Alternatives considered**:
- **`NEXT_PUBLIC_API_URL`**: descartado — innecesario dado que no hay fetch de
  cliente directo al backend HINS, y evitarlo es más seguro por defecto.
