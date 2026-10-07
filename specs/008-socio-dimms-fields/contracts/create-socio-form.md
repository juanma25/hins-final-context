# Contract: Validación de formulario de alta de socio

Ubicación: `components/gdcv/CreateSocioDialog.tsx` (función de validación extraída, ver data-model.md). Contrato interno de la aplicación (no HTTP), documentado porque encapsula la regla de negocio central de esta feature.

## Comportamiento

| Caso | medidorNumero | suministroNumero | contratoNumero | Resultado |
|---|---|---|---|---|
| Sin medidor | "" | "" | "" | Válido — no se exige nada de los tres |
| Con medidor completo | "123" | "S1" | "C1" | Válido |
| Con medidor, falta suministro | "123" | "" | "C1" | Inválido — error identifica "No. de Suministro" |
| Con medidor, falta contrato | "123" | "S1" | "" | Inválido — error identifica "No. de Contrato" |
| Con medidor, faltan ambos | "123" | "" | "" | Inválido — error identifica el primero de los dos (No. de Suministro) |

## Envío a la API (`createSocioAction` → `createSocio` → `POST /parques/{parqueId}/socios`)

- Si el usuario no completó medidor/suministro/contrato: se envían los tres como `""` (ver research.md — la API los declara `string` requerido, sin variante nula).
- Si el usuario completó los tres: se envían tal cual, con `.trim()` aplicado igual que el resto de los campos de texto del formulario.
- `createSocioAction` no cambia: sigue reenviando el DTO recibido tal cual, con `parqueId` inyectado.
