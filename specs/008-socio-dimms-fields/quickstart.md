# Quickstart: Validar campos No. Suministro y No. Contrato al crear socio

## Prerrequisitos

- Backend corriendo en `http://localhost:3000` con `CreateSocioDto` incluyendo `suministroNumero`/`contratoNumero` (confirmado en `/docs-json`).
- `pnpm install` ya hecho.

## Validación automatizada

```sh
npm run test -- tests/components/gdcv/CreateSocioDialog.test.ts tests/app/gdcv/socios-actions.test.ts
```

Debe cubrir la tabla de casos en `contracts/create-socio-form.md`.

## Validación manual end-to-end

1. `npm run dev`, ir a la vista de socios de un parque (`app/gdcv/socio/...`).
2. Abrir "Nuevo Socio". Completar nombre, participación, tipo de cargo, dejar medidor/suministro/contrato vacíos, confirmar.
   - **Esperado (SC-003)**: se crea el socio sin pedir esos tres campos.
3. Repetir, esta vez completando "No. de Medidor" pero dejando "No. de Suministro" vacío, confirmar.
   - **Esperado (SC-002)**: el formulario bloquea el envío e indica qué falta.
4. Completar los tres (medidor, suministro, contrato), confirmar.
   - **Esperado (SC-001)**: el socio se crea; verificar en `GET /parques/{parqueId}/socios` (vía `/docs` o `listSocios`) que los tres valores quedaron guardados.
