# Quickstart — validación

Prerrequisitos: backend en `http://localhost:3000`, `.env` con `HINS_API_BASE_URL`, usuario admin (`admin@test.com`, ver [001 quickstart](../001-api-integration-remove-mocks/quickstart.md)) y uno no admin.

```bash
pnpm install && pnpm test && pnpm lint && pnpm exec tsc --noEmit
pnpm dev
```

Escenarios:
1. Admin en `/main`: sidebar muestra Proyectos, Tarifas, Tipos de cambio.
2. `/main/tarifas`: crear, agregar versión con mismo nombre, editar versión futura, borrar con advertencia, fila histórica sin acciones, paginar (>20 registros).
3. `/main/tipos-cambio`: crear MENSUAL `2026-10`, error con `2026`, filtrar por tipo, editar, borrar.
4. Entrar a un proyecto GDD, GDC y GDCV: menú sin Tarifas/Tipos de cambio y con Costos; `?proyectoId` se conserva al navegar; crear costo con parque del proyecto.
5. Usuario no admin: menús sin las opciones; URL directa a las 3 rutas redirige/deniega.
6. Cortar el backend: estado de error con reintento.

Resultado esperado: SC-001…SC-006 de [spec.md](spec.md).
