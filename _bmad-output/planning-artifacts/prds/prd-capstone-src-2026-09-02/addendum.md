# Addendum — material que no pertenece al PRD

Profundidad aportada durante la sesión que corresponde a documentos aguas abajo (arquitectura, diseño de solución, especificación de UX) o que se ganó un lugar pero no cabe en la narrativa principal del PRD. **No duplica** lo que ya está en `SPEC.md` ni en sus companions.

---

## 1. Mapa RF → CAP → fase de construcción

Puente de navegación entre este PRD (hacia la comisión), el SPEC (hacia la construcción) y el `build-order.md` (hacia el calendario). Se mantiene aquí y no en el PRD porque es un artefacto de coordinación, no un requerimiento.

| Grupo PRD | RF | CAP (SPEC) | Fase (build-order) |
|---|---|---|---|
| 5.1 Ingesta | RF-01..RF-04 | CAP-1 | Fase 3 |
| 5.2 Motor / D1 | RF-05..RF-08 | CAP-2 | Fase 2 |
| 5.3 Señales | RF-09..RF-12 | CAP-3 | Fase 2 |
| 5.4 Puntuación y explicabilidad | RF-13..RF-17 | CAP-4, CAP-5 | Fase 2, Fase 4 |
| 5.5 Ficha del control | RF-18 | CAP-6 | Fase 4 |
| 5.6 Flujo del encargado | RF-19..RF-25 | CAP-7, CAP-8, CAP-9 | Fase 5 |
| 5.7 Autoría sin código / D2 | RF-26..RF-29 | CAP-10 | Fase 6 (corte fin W10) |
| 5.8 Evaluación | RF-30, RF-31 | CAP-11 | Fase 7 |
| §4, §7 Método y trazabilidad | — | — | Fase 1 (W1, sin código) |

**Precedencia declarada.** Donde el PRD y el SPEC describen el mismo comportamiento: el SPEC manda para implementación y verificación; el PRD manda para argumentación y trazabilidad. El PRD no introduce comportamiento que el SPEC no contenga.

---

## 2. Decisión de forma: por qué el PRD lleva una matriz de trazabilidad

La convención de PRD evita las matrices de trazabilidad — envejecen mal y suelen ser trabajo ceremonial. Aquí se incluyó de forma deliberada porque **la cadena de derivación es la contribución intelectual declarada del proyecto**, y la matriz es su forma verificable. Sin ella, la afirmación "los requerimientos se derivaron de la ley por un método repetible" no es comprobable por la comisión; con ella, cada RF tiene un camino auditable hasta una norma.

La matriz recorre `ley → RF`. **No** hay matriz RF × RNF ni matriz RF × caso de prueba: esas sí serían ceremonia.

---

## 3. `enriquecedor de entidades` — cortado, pero con la forma ya definida

Fuera de alcance (§9.2), y se registra aquí porque es una decisión de mecanismo que pertenece a arquitectura, no al PRD.

Toda fuente externa chilena comparte una sola forma: **se entrega un RUT, se obtienen hechos sobre la entidad**. Eso es *una* interfaz `enriquecedor de entidades` con N adaptadores (SII, Poder Judicial, CMF, listas PEP, ChileCompra, sanciones), no N integraciones.

En esta iteración el enriquecimiento llega como columnas del CSV (`fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`). El motor ve entidades enriquecidas y **no distingue** si el enriquecimiento vino de un adaptador o de una columna. Por construcción, entonces:

- el corte no cuesta nada de lo ya construido;
- las señales relacionales corren igual, a su ancho completo;
- el adaptador, si alguna vez se construye, se enchufa detrás de la misma forma y no cambia nada aguas arriba.

Es el ejemplo canónico del patrón del §9.2: *cortar la integración, conservar la capacidad, y poner la costura donde revertir la decisión no cueste nada.*

---

## 4. Verdad point-in-time — el axioma sobrevive al recorte

El almacenamiento point-in-time del enriquecimiento es un **SHOULD**, fuera del compromiso. Pero el axioma —*guardar lo que una fuente dijo cuando fue consultada, con su marca temporal*— **debe moldear el modelo de datos igual**, porque agregarlo después implica migrar registros de evidencia ya emitidos, y eso es exactamente lo que RNF-03 prohíbe.

Nota para arquitectura: diseñar las tablas de enriquecimiento como observaciones fechadas desde el principio, aunque en esta iteración solo exista una observación por entidad. *El auditor pregunta qué se sabía el 14 de marzo, no qué es verdad hoy.*

---

## 5. La no-acción como flujo de datos

Registrado durante la sesión, correspondiente al cluster H (SHOULD).

El flujo de descartes y cierres es, estructuralmente, un flujo de datos propio: **un gerente que anula cuarenta veces es en sí mismo una señal**. Correr un meta-control sobre el flujo de override es el mecanismo concreto para hacer visible la no-acción — y es notable que el mismo motor de tres capas lo permita sin maquinaria nueva: el override es un evento, la frecuencia de override es una señal, y el meta-control las compone igual que cualquier otro.

No entra en esta iteración, pero es la prueba más económica de que el motor generaliza más allá del caso para el que se diseñó.

---

## 6. Canal de denuncias — diseño ya trabajado, fuera de alcance

Cortado por completo (§9.2). El diseño ya existe y se preserva aquí para que el incremento siguiente no empiece de cero:

- **anonimato técnico** garantizado, no solo prometido;
- **cadena de receptores nombrada**, con ruteo por **recusación** cuando el receptor designado es el acusado — el caso que rompe todo diseño ingenuo de canal de denuncias;
- **código de seguimiento** que permite comunicación bidireccional con un denunciante anónimo.

Es el *sensor de personas* que cubre el punto ciego estructural del sensor de datos (§11.3). Su ausencia es lo que obliga a declarar ese punto ciego en la tesis en lugar de insinuar cobertura completa.

---

## 7. Sustrato técnico

No se reproduce aquí. Está en `_bmad-output/specs/spec-plataforma-mpd/stack-and-conventions.md` y en el bloque `bmad:context` de `AGENTS.md`. Nada del diseño de dominio de este PRD depende de esas elecciones.
