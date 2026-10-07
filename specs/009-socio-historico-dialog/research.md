# Research: Histórico de Registros, Facturación y Mediciones por Socio

## Decision: Tipar `payload` como `unknown[]`

**Rationale**: Los tres esquemas confirmados en `/docs-json` (`RegistroHistoricoDto`, `FacturacionHistoricoDto`, `MedicionHistoricoDto`) declaran `payload` como `{ type: array, items: { type: object } }` — un arreglo de objetos sin esquema fijo, porque es "el resultado de la consulta a la API externa" tal cual la devuelve esa API externa. No hay forma honesta de tipar su contenido interno sin inventar una forma que el backend no garantiza. `unknown[]` (Principio I: `any` prohibido salvo boundary externo con guard) es la representación correcta; la UI trata cada item como datos opacos a mostrar de forma genérica (ver data-model.md).

**Alternatives considered**:
- Tipar `payload` como `Record<string, unknown>[]`: descartado — no aporta seguridad real sobre `unknown[]` y sugiere falsamente una forma de objeto, cuando el esquema no la garantiza.
- Pedir al backend un esquema fijo: fuera de alcance (contrato externo, la API ya está confirmada así).

## Decision: Route Handlers dedicados (uno por histórico) como boundary servidor/cliente

**Rationale**: `apiFetch` depende de la cookie de sesión httpOnly leída en Server Components/Route Handlers (`lib/api/client.ts`); un diálogo cliente no puede llamarlo directamente. El repo ya resuelve este mismo problema para `energia-dia` con `app/api/parques/[parqueId]/energia-dia/route.ts` (Route Handler que llama a `lib/api/energia.ts` y traduce `UnauthorizedError`/errores a `NextResponse`). Se replica el mismo patrón para los tres históricos de socio, con `parqueId`/`socioId` en la ruta y `desde`/`hasta` como query params.

**Alternatives considered**:
- Server Action en vez de Route Handler: descartado — el patrón ya establecido para "consulta filtrada disparada desde un componente cliente" en este repo es Route Handler (`energia-dia`), no Server Action; mantener consistencia (Principio V) es preferible a introducir una segunda forma de hacer lo mismo.
- Un único Route Handler genérico `/api/parques/[parqueId]/socios/[socioId]/historico?tipo=registros|facturacion|mediciones`: descartado — añade una capa de indirección (switch interno) para ahorrar 2 archivos casi idénticos; no se justifica bajo Principio V ("no abstracciones especulativas").

## Decision: Tres consultas en paralelo, estado independiente por histórico

**Rationale**: FR-004/FR-006/FR-007 exigen que un fallo o "sin datos" en uno de los tres históricos no bloquee ni oculte a los otros dos. `Promise.allSettled` (o tres `useState` + tres efectos disparados por el mismo cambio de rango) permite que cada histórico tenga su propio estado `idle | loading | success (con o sin datos) | error`, sin que una promesa rechazada cancele las otras.

**Alternatives considered**:
- `Promise.all`: descartado — un solo rechazo rompe las tres consultas, violando FR-007 (los otros dos deben poder mostrarse igual).

## Decision: Validación de rango (desde <= hasta) como función pura testeable

**Rationale**: Consistente con el patrón ya usado en `CreateSocioDialog` (`getSocioFormValidationError`, spec 008) y con Principio III. Se extrae una función que, dado un rango candidato, determina si es válido para disparar la consulta (FR-008/SC-002).

**Alternatives considered**: Ninguna — es la única lógica de negocio no trivial de este diálogo aparte del manejo de estado por histórico.

## No unresolved NEEDS CLARIFICATION remain.
