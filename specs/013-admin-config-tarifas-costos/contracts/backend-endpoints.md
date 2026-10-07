# Backend contract (fuente: `http://localhost:3000/docs-json`)

Auth: `Authorization: Bearer <hins_session>`. Escritura: HINS_ADMIN. Lectura: HINS_ADMIN o AGC (la UI restringe a admin). Listas: `?page` (≥1, def 1) `?limit` (1–100, def 20) → `{items,total,page,limit}`.

| Entidad | Endpoints | Filtros | Errores relevantes |
|---|---|---|---|
| Tarifas | `GET/POST /tarifas`, `GET/PATCH/DELETE /tarifas/{id}` | `nombre` | 409 fecha/duplicado/histórica |
| Tipos de cambio | `GET/POST /tipos-cambio`, `GET/PATCH/DELETE /tipos-cambio/{id}` | `tipo`, `periodicidad`, `desde`, `hasta` | 400 formato, 409 duplicado |
| Costos | `GET/POST /costos`, `GET/PATCH/DELETE /costos/{id}` | `proyectoId`, `parqueId` | 400 parque ajeno, 404 |
| Soporte | `GET /usuarios/me`, `GET /proyectos/{id}/parques` | — | 401/403 |

DELETE → 204 (llega como `null` por `apiFetch`; se trata como éxito).
Cuerpos: ver `CreateTarifaDto`, `UpdateTarifaDto`, `CreateCostoDto`, `UpdateCostoDto`, `CreateTipoCambioDto`, `UpdateTipoCambioDto` en el swagger.
