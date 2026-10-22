# Registro de Avance Frontend — Plataforma MPD

**Proyecto:** APT Capstone — Modelo de Prevención del Delito (Leyes 20.393 / 21.595)  
**Fecha:** 2026-10-22  
**Alcance:** Frontend Vertical Slice (Fase 4 del BMAD)  

---

## 1. Arquitectura y Almacenamiento Local Reactivo

### Archivo: `apps/web/src/lib/domain-store.ts`
- **Contrato del Scorer Estricto:** Implementa `{ score, breakdown[] }` garantizando que ninguna evaluación retorne un número aislado. Cada entrada de `breakdown` contiene `senalId`, `nombre`, `tipo` (*intrínseca* / *relacional*), `disparada`, `peso`, `contribucion` y `detalle` explicativo para auditoría.
- **Dataset Demo Oficial (`demo-dataset.md`):** Incluye los 4 casos plantados de la memoria académica:
  1. Proveedor constituido 5 días antes de la compra (`Insumos Globales del Sur SpA`).
  2. Apellido compartido entre solicitante y proveedor (`Valenzuela` en `Consultoría Valenzuela Ltda.`).
  3. Fraccionamiento de 3 compras consecutivas justo bajo el umbral de $5.000.000 (`Logística Araucanía SpA`).
  4. Adjudicación sin competencia con oferente único en compra de $45.000.000 (`Servicios Cordillera SpA` — CP art. 287 bis).
  - Incluye compras normales de relleno para permitir la medición empírica de precisión y recall.
- **Persistencia y Reactividad:** Guarda en `localStorage` y despacha eventos de ventana (`mpd_store_updated`) para que Dashboard, Ingesta, Alertas y Casos se sincronicen en tiempo real sin requerir recargar la página.

---

## 2. Pantallas y Rutas Implementadas

| Ruta | Archivo | Responsabilidad BMAD |
|---|---|---|
| `/ingesta` | `apps/web/src/routes/_auth/ingesta.tsx` | **CAP-1, CAP-2:** Subida CSV drag & drop, detección de columnas de enriquecimiento, descarga de CSV de ejemplo, carga en 1 clic del dataset demo, y ejecución del motor en 4 pasos con resumen. |
| `/alertas` | `apps/web/src/routes/_auth/alertas.tsx` | **CAP-4, CAP-5, CAP-7:** Triaje del sensor de datos. Explicabilidad visual de la alerta (*"¿Por qué 0.87?"*), desglose de señales, datos del evento, acciones: *Poner en Revisión*, *Descartar (con motivo obligatorio)*, *Escalar* y *Promover a Caso*. |
| `/casos` | `apps/web/src/routes/_auth/casos.tsx` | **CAP-8, CAP-9:** Expedientes de investigación formal. Visualización de evidencia de origen y acción central: **"Cerrar Caso con Justificación"**, registrando nombre del encargado (`session`), marca de tiempo y sellado inmutable. |
| `/controles` | `apps/web/src/routes/_auth/controles.tsx` | **CAP-6, CAP-10 (D2):** Gestor declarativo. Ficha del Control auditable y modal de autoría sin código (selección de delito, evento, ponderación de señales y umbrales). |
| `/dashboard` | `apps/web/src/routes/_auth/dashboard.tsx` | KPIs en vivo (Eventos Procesados, Alertas Activas, Casos en Investigación, Casos Cerrados) y acceso rápido a alertas recientes. |
| Layout / Menú | `apps/web/src/components/sidebar.tsx` | Sidebar colapsable y redimensionable con accesos a las 5 secciones: Dashboard, Ingesta, Alertas, Casos y Controles. |

---

## 3. Verificación de Calidad

- **TypeScript / Build:** `bunx turbo run check-types -F web` -> **Exitoso (0 errores)**.
- **TanStack Router:** `routeTree.gen.ts` regenerado automáticamente reconociendo todas las rutas protegidas bajo `_auth`.
- **Linter / Formatter:** `bunx biome check` -> **Exitoso (0 errores, 0 advertencias)** en todas las rutas y componentes modificados.
