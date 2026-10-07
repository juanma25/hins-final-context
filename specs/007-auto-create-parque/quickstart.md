# Quickstart: Validar creación automática de parque al crear proyecto

## Prerrequisitos

- Backend corriendo en `http://localhost:3000` (ver `http://localhost:3000/docs`).
- Repo instalado: `pnpm install` (o `npm install`, según lockfile presente — este repo usa `pnpm-lock.yaml`).
- Variables de entorno de API configuradas (ver `lib/api/client.ts` / `.env.local` existente en el repo).

## Validación automatizada (unit/contract)

```sh
npm run test -- tests/app/main/actions.test.ts
```

Debe cubrir los 3 casos de la tabla en `contracts/create-proyecto-action.md`:
- happy path (proyecto + parque creados),
- falla creación de proyecto,
- proyecto creado pero parque falla (`parqueError` presente, `proyecto` presente).

## Validación manual end-to-end

1. Levantar la app: `npm run dev`.
2. Ir al formulario de alta de proyecto en `/main`.
3. Completar `nombre`, `modelo`, `ubicacion` y confirmar.
4. **Esperado (SC-001, SC-002)**: en menos de 5 segundos, sin acciones adicionales, el proyecto aparece creado y su parque asociado es visible (p. ej. en el listado/detalle de parques del proyecto), identificado con el mismo nombre que el proyecto.
5. Verificar en el backend (`GET /proyectos/{proyectoId}/parques` vía `/docs` o `getPrimaryParque`) que el parque tiene `potenciaTotalKwp: 0` y `fechaPuestaEnMarcha` igual a la `fechaAlta` del proyecto.

## Validación de fallo parcial (SC-003)

1. Detener temporalmente el backend, o forzar un error en `createParque` (p. ej. apuntando `proyectoId` a un valor inválido en un entorno de prueba).
2. Confirmar el alta del proyecto.
3. **Esperado**: el proyecto queda creado (visible en el listado de proyectos) y la UI muestra una notificación indicando que el parque no pudo crearse — sin que el proyecto desaparezca ni se revierta.
