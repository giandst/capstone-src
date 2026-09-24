---
title: "PRD — Plataforma de apoyo al Modelo de Prevención del Delito"
status: final
created: 2026-09-02
updated: 2026-09-19
---

# PRD — Plataforma de apoyo al Modelo de Prevención del Delito

*Título de trabajo — confirmar.*

## 0. Propósito del documento

Este documento es el **levantamiento y análisis de requerimientos** de la APT (actividad de titulación) de Ingeniería en Informática, Duoc UC. Su lector es la comisión evaluadora, y su función es mostrar que los requerimientos del sistema fueron *derivados* de una obligación legal por un método explícito y repetible, no elegidos por intuición. Es también la fuente de la sección **delimitación del alcance** del documento de tesis.

Está estructurado así: el vocabulario se fija una vez en el **§3 Glosario** y no admite sinónimos en el resto del documento; el **§4 Método** describe la cadena de derivación que produce los requerimientos; los **requerimientos funcionales (§5)** se agrupan por capacidad y se numeran globalmente `RF-01..RF-31`; los **no funcionales (§6)** se agrupan por atributo de calidad y se numeran `RNF-01..RNF-15`; la **matriz de trazabilidad (§7)** conecta la ley con cada RF. Los supuestos se marcan en línea como `[SUPUESTO: ...]` y se indexan en el §14.

**Insumos previos.** Este PRD no duplica lo que ya está escrito; lo referencia:

| Insumo | Ubicación | Qué aporta |
|---|---|---|
| Contrato de alcance ratificado | `_bmad-output/brainstorming/brainstorm-plataforma-mpd-2026-08-29/scope-contract.md` | la línea de corte pre-comprometida (MoSCoW) |
| Orden de construcción | `.../build-order.md` | plan por fases W1–W16 |
| Product brief | `_bmad-output/planning-artifacts/briefs/brief-capstone-src-2026-09-02/brief.md` | visión, problema, defensibilidad |
| Contrato técnico (SPEC) | `_bmad-output/specs/spec-plataforma-mpd/SPEC.md` + 8 companions | capacidades CAP-1..CAP-11, restricciones, no-objetivos |

**Relación con el SPEC.** El SPEC es el contrato **hacia la construcción**: qué construir y cómo verificarlo. Este PRD es el artefacto **hacia la comisión**: por qué cada requerimiento existe y de qué norma proviene. Donde ambos hablan del mismo comportamiento, el SPEC manda para efectos de implementación y este documento manda para efectos de argumentación y trazabilidad. Cada RF nombra la capacidad CAP-N que lo implementa.

---

## 1. Visión

Bajo la **Ley 20.393** y la **Ley 21.595**, la defensa de una organización chilena no descansa en tener un Modelo de Prevención del Delito escrito, sino en que ese modelo esté **implementado y sea efectivo**. La distancia entre un *modelo de papel* y uno operativo no se ve en ningún documento: se ve en el rastro de lo que la organización vigiló, de lo que fue advertida y de lo que decidió de todos modos.

Esta plataforma produce exactamente ese rastro. En su centro hay un **motor de controles** de tres capas: la actividad del negocio ingresa como **eventos** (una `compra`, un `pago`), detectores reutilizables llamados **señales** examinan cada evento, y los **controles** —composiciones ponderadas de señales ligadas a un **delito**— producen un `score` entre 0 y 1 que los umbrales configurados traducen a **probabilidad baja / media / alta**. El scorer nunca devuelve un número solo: devuelve el número **y** el desglose de qué señales se activaron y cuánto aportó cada una. Una alerta que la encargada de cumplimiento no puede explicar no es evidencia, así que la explicabilidad está en el contrato de scoring desde la primera línea de código y no añadida después.

Los controles son **definiciones declarativas consumidas como datos, no como código**. Esa única decisión hace casi todo el trabajo del proyecto: agregar un delito pasa a ser configuración y no desarrollo —lo que vuelve realista un alcance de un semestre y vuelve verdadera, y no meramente afirmada, la palabra *plataforma*—; la misma definición se renderiza como **ficha del control** legible por un auditor sin costo adicional; y la encargada puede escribir un control sin un desarrollador. El prototipo lo demuestra en vivo: se carga un CSV de compras, aparece un caso, se abre la alerta y se ve exactamente por qué, y luego se escribe un control nuevo sin tocar código, se vuelve a correr el mismo CSV y aparece un caso distinto.

---

## 2. Actores y usuarios objetivo

### 2.1 Actores

| Actor | Tipo | Interacción con el sistema |
|---|---|---|
| **Encargada de cumplimiento** | usuario primario, autenticado | único rol operativo: carga eventos, revisa alertas, decide, cierra casos, escribe controles |
| **Auditor externo** | lector, sin cuenta en esta iteración | no opera el sistema; es el destinatario de la ficha del control y del rastro de evidencia, mediados por la encargada. **Su existencia es exigida por la ley**: el art. 4 de la Ley 20.393, reformado por Ley 21.595, requiere evaluaciones periódicas del modelo por terceros independientes (§7, T-8) `[SUPUESTO: el auditor no recibe acceso propio en esta iteración; la evidencia se le exhibe a través de la encargada. Un rol auditor de solo lectura es trabajo futuro.]` |
| **Motor de controles** | actor de sistema | única acción automática permitida: puntuar un evento y levantar una alerta. No decide, no bloquea, no cambia estados posteriores |
| **Comisión evaluadora APT** | audiencia de evaluación | no es usuaria; juzga la derivación de requerimientos, la arquitectura y la validez de la evaluación |

### 2.2 Jobs To Be Done — encargada de cumplimiento

- **Funcional:** saber qué ocurrió en la operación que merece su atención, sin leer cada transacción.
- **Funcional:** entender *por qué* algo merece atención, con detalle suficiente para defender la decisión meses después.
- **Funcional:** dejar constancia de lo que decidió y por qué, en el momento en que lo decidió.
- **Funcional:** adaptar la vigilancia a un delito nuevo sin depender de un desarrollador.
- **Social:** llegar a una auditoría externa pudiendo **responder** preguntas, en lugar de tener que **construir** las respuestas.
- **Emocional:** no cargar personalmente con una exposición legal que no puede demostrar que administró.

### 2.3 No-usuarios (v1)

- **El denunciante.** El canal de denuncias está fuera de alcance por completo (§9.2).
- **El solicitante o el proveedor bajo sospecha.** No tienen acceso ni vista propia. `[SUPUESTO: la persona sobre la que existe una alerta no puede verla. Con un solo rol y una sola instancia, cualquier acceso del sujeto comprometería la investigación; el debido proceso y el derecho de acceso del titular bajo Ley 21.719 se tratan en §6.4 y §11.]`
- **Gerencia y directorio.** No hay tablero ejecutivo ni reportería agregada. El producto no es un dashboard.
- **Otras organizaciones.** Una organización, una instancia; no hay multi-tenant.

### 2.4 Recorridos de usuario clave

- **UJ-1. Carolina descubre un fraccionamiento el lunes por la mañana.**
  Carolina Reyes es encargada de cumplimiento en una empresa mediana de servicios en Santiago; el área de abastecimiento le entrega mensualmente un export de compras. Autenticada en la plataforma, entra a *Ingesta*, sube `compras-agosto.csv` y ve confirmada la carga: 412 eventos creados. El motor puntúa cada evento contra los controles activos. Vuelve a la bandeja y hay tres alertas nuevas, una en **probabilidad alta**. La abre. **Clímax:** la pantalla no dice "riesgo alto": dice que se activaron `fraccionamiento` (peso 0,5 — tres compras al mismo proveedor de $2.900.000, $2.850.000 y $2.950.000 contra un umbral de aprobación de $3.000.000) y `proveedor recientemente constituido` (peso 0,3 — constituido 5 días antes de la primera compra), y que la señal `apellido compartido` no se activó; score 0,80. Al costado, la ficha del control que produjo el número. **Resolución:** Carolina sabe qué preguntar y a quién, antes de hablar con nadie.
  *Caso borde:* si el CSV trae columnas faltantes o filas malformadas, la carga se rechaza completa con el detalle de las filas problemáticas; no se ingesta parcialmente (RF-03).

- **UJ-2. Carolina cierra el caso y deja la evidencia que la auditoría le va a pedir.**
  Continúa desde UJ-1. Promueve la alerta a **caso** y hace las averiguaciones fuera del sistema. Resulta que las tres compras corresponden a un servicio efectivamente fraccionado por el área usuaria para evitar el flujo de aprobación, sin contraparte relacionada. **Clímax:** al cerrar el caso, el sistema **exige** una justificación escrita; Carolina escribe qué encontró, qué decidió y qué medida correctiva se instruyó. **Resolución:** el registro queda con su nombre, la fecha y hora, el texto íntegro, la definición del control tal como corrió y el desglose tal como se calculó; no es editable después. Ocho meses más tarde ese registro responde la pregunta del auditor sin que nadie tenga que recordar nada.

- **UJ-3. Carolina escribe un control nuevo sin un desarrollador.**
  La empresa entra a un giro con exposición a **lavado de activos** y Carolina necesita vigilar `pagos`, no `compras`. Entra a *Controles*, crea uno nuevo: elige el delito, elige el tipo de evento `pago`, selecciona `fraccionamiento` con peso 0,6 y `PEP involucrado` con peso 0,4, y fija los umbrales de banda. **Clímax:** guarda, el sistema valida la definición, y al re-ejecutar sobre los mismos datos aparece un caso que la configuración anterior no producía — sin que nadie haya escrito una línea de código y sin cambios en el motor. **Resolución:** la ficha del control nuevo existe desde el instante en que se guardó, porque es la misma definición. *Este es el recorrido que convierte la afirmación "es una plataforma" en una demostración.*
  *Caso borde:* una definición malformada —pesos que no suman, umbrales fuera de orden, ninguna señal seleccionada— se rechaza en el guardado con el motivo (RF-27).

- **UJ-4. Ricardo pide evidencia de que el control estaba operando en marzo.**
  Ricardo Fuentes audita el Modelo de Prevención del Delito y pregunta por el período marzo–junio. No entra al sistema: Carolina le exhibe, para cada alerta del período, la **ficha del control** que la produjo —qué vigilaba, qué señales componía, con qué pesos, con qué umbrales— y el **desglose almacenado** de cada alerta. **Clímax:** para los casos cerrados, Ricardo lee la justificación escrita, con nombre y fecha. **Resolución:** la pregunta "¿este control estaba operando y quién lo revisó?" se responde leyendo, no reconstruyendo. `[SUPUESTO: en esta iteración la exhibición es mediada; no hay exportación de expediente ni vista de auditor. Ver §6.4 RNF-08 y trabajo futuro.]`

---

## 3. Glosario — lenguaje ubicuo

El modelo de dominio usa el vocabulario legal directamente. **Estos términos se mantienen en español** en el esquema Drizzle, en los procedimientos tRPC y en la interfaz; el código, los comentarios y los commits que los rodean están en inglés. Introducir un sinónimo de cualquiera de estos términos en cualquier parte del documento o del sistema es una infracción de disciplina, no una variación de estilo.

| Término | Significado en este sistema |
|---|---|
| **MPD** (Modelo de Prevención del Delito) | El modelo que una organización debe operar bajo Ley 20.393 y Ley 21.595. La plataforma lo *apoya*; no lo constituye. |
| **delito** | Una figura penal específica a la que se liga un control. En alcance: *corrupción entre particulares* (CP art. 287 bis / 287 ter) y *lavado de activos* (Ley 19.913 art. 27). |
| **evento** | Una unidad de actividad de negocio ingestada: una `compra`, un `pago`/`transferencia`. Un delito distinto implica un *tipo de evento* distinto, no maquinaria distinta. |
| **señal** | Detector reutilizable sobre un evento y sus entidades relacionadas, que se activa o no. Compartido entre controles; nunca propiedad de uno. |
| **señal intrínseca** | Lee la forma de la transacción, solo con datos internos: `fraccionamiento`, autoaprobación, precio fuera de mercado, timing anómalo. |
| **señal relacional** | Lee quién es la contraparte: proveedor recientemente constituido, parentesco con el solicitante, PEP, causas judiciales. En esta iteración se alimenta de columnas del CSV, no de fuentes externas. |
| **control** | Composición ponderada de señales ligada a un delito y a un tipo de evento, con sus propios umbrales. Definición declarativa consumida como dato, no como código. |
| **ficha del control** | Renderizado de la definición de un control, legible por un auditor: qué vigila, qué señales, qué pesos, qué umbrales. El mismo artefacto que la lógica ejecutable. |
| **score** | Número `0..1` que un control produce sobre un evento, siempre acompañado de su `breakdown[]`. |
| **breakdown** | Registro por señal de cómo se alcanzó un score: la señal, si se activó, su peso y su contribución. Se persiste junto a la alerta. |
| **probabilidad baja / media / alta** | Banda en la que cae un score, según umbrales configurados en la definición del control. |
| **alerta** | Registro producido cuando un control puntúa un evento por sobre su umbral de alertamiento. Prueba que el modelo estaba vigilando. |
| **caso** | Alerta que una persona promovió para investigación. |
| **cierre con justificación** | Cierre de un caso con una razón escrita, atribuida y fechada. La evidencia de mayor valor del sistema. |
| **encargado de cumplimiento** | Usuaria primaria del sistema; la persona que siempre toma la decisión. |
| **solicitante** | Persona dentro de la organización que solicitó o aprobó una compra. |
| **proveedor** | Entidad contraparte, identificada por RUT. |
| **RUT** | Rol Único Tributario. Clave universal de resolución de entidades entre proveedor y persona. |
| **fraccionamiento** | Partir una compra en trozos cada uno justo bajo el umbral de aprobación. Se activa para ambos delitos en alcance. |
| **PEP** | Persona Expuesta Políticamente. Llega como columna `flag_PEP`. |
| **debida diligencia de terceros** | Componente estándar del MPD: escrutinio de contrapartes antes de aprobar. Se alcanza desde primeros principios por la cadena de derivación. |
| **modelo de papel** | Modelo de cumplimiento que existe en papel y no hace nada. El fracaso que el producto existe para prevenir. |
| **canal de denuncias** | El *sensor de personas*. Fuera de alcance; punto ciego declarado del sensor de datos. |
| **cadena de derivación** | El método `delito → conducta típica → rastro → dato observable → señal → control`. Ver §4. |

---

## 4. Método — la cadena de derivación

Esta sección no describe una funcionalidad. Describe **cómo se produjeron los requerimientos del §5**, y es la contribución intelectual del proyecto: un camino repetible e inspeccionable desde un tipo penal hasta una regla que corre sobre datos transaccionales. Hoy los controles los escriben consultores desde la experiencia; si la derivación no se puede mostrar, ni el control ni la alerta que produce se pueden defender.

```
delito (ley)  →  conducta típica  →  rastro que deja  →  dato observable  →  señal  →  control
```

La ley nombra un delito; el delito se comete a través de conductas determinadas; cada conducta deja —o no deja— un rastro; el rastro se vuelve un campo en los datos; el campo lo lee una señal; las señales se componen en un control.

**Cada flecha de la cadena es una costura que el software preserva.** Esa es la razón de que el motor tenga tres capas y no un archivo de reglas: la arquitectura del §5 es la forma ejecutable de este método.

**Dos hallazgos que la cadena debe exhibir explícitamente:**

1. **`fraccionamiento` se activa para ambos delitos en alcance.** No es un solapamiento incidental: es la evidencia de que las señales son una capa reutilizable y no código por control.
2. **La cadena llega a *debida diligencia de terceros* desde primeros principios.** La composición *proveedor recientemente constituido + causas judiciales + PEP*, aplicada antes de aprobar, **es** un componente estándar del MPD, alcanzado sin copiar una checklist. Esa llegada valida a la vez el método y el modelo del motor.

**Timebox.** Una semana, dos o tres delitos, y después se construye. El modo de fracaso nombrado es ocho semanas de investigación legal con la programación empezando en W10. *El método es la contribución; la cobertura exhaustiva del catálogo no lo es.*

**Criterio de salida:** una derivación escrita para al menos dos delitos que termine en una lista concreta de señales **con los campos de entrada exactos que cada una lee** — porque esos campos son los que el CSV de demostración debe traer.

`[SUPUESTO: al 2026-09-12 la derivación aún no se ha ejecutado; corresponde a la Fase 1 (W1) del build-order. La columna "norma" de la matriz del §7 fue verificada contra fuentes secundarias y corregida; las columnas "conducta típica" y siguientes son preliminares. Contrastar todo contra el texto oficial en BCN antes de incorporarlo a la tesis. Ver S-4 y S-11.]`

---

## 5. Requerimientos funcionales

Agrupados por capacidad. Numeración global y estable `RF-01..RF-31`: reorganizar los grupos no renumera los requerimientos. Cada RF nombra la capacidad `CAP-N` del SPEC que lo implementa y el recorrido `UJ-N` que realiza, cuando corresponde.

### 5.1 Ingesta de eventos

**Descripción.** La actividad del negocio entra al sistema como un archivo CSV cargado por la encargada desde la aplicación web. No hay integración con ERP ni paso por consola en ningún punto del camino. El enriquecimiento de las contrapartes viaja como **columnas del mismo CSV** (`fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`), lo que permite que las señales relacionales corran con cero integraciones. La columna `n_oferentes` no es enriquecimiento: es dato de proceso de compra que la organización ya tiene, y no depende de ninguna integración futura. El motor ve entidades enriquecidas y no distingue si el enriquecimiento vino de un adaptador o de una columna.

#### RF-01: Carga de un archivo de eventos
La encargada autenticada puede cargar un archivo CSV de compras desde la aplicación web. Realiza UJ-1. Implementa CAP-1.
**Consecuencias verificables:**
- El camino completo ocurre en la interfaz web; ningún paso requiere consola, script ni acceso a la base de datos.
- Terminada la carga, la interfaz informa cuántos eventos se crearon.

#### RF-02: Persistencia de un evento por fila, con su enriquecimiento
El sistema persiste un registro `evento` por cada fila del CSV, conservando las columnas de enriquecimiento asociadas a la contraparte. Implementa CAP-1.
**Consecuencias verificables:**
- Un CSV de N filas válidas produce exactamente N eventos.
- Los valores de `fecha_constitucion_proveedor`, `flag_PEP` y `causas_judiciales` quedan disponibles para las señales relacionales sin ninguna consulta externa, y `n_oferentes` para la señal intrínseca `adjudicación sin competencia`.

#### RF-03: Validación y rechazo de archivos malformados
El sistema valida la estructura del archivo antes de persistir y rechaza la carga completa si el archivo no cumple, informando las filas o columnas problemáticas. Realiza UJ-1 (caso borde). Implementa CAP-1.
**Consecuencias verificables:**
- Un CSV con columnas obligatorias faltantes se rechaza sin crear ningún evento.
- El mensaje de rechazo identifica la causa a nivel de fila o de columna, no solo "archivo inválido".
- No existe ingesta parcial: o entra el archivo completo, o no entra nada.

#### RF-04: Registro de la carga
Cada carga queda registrada con el actor, la marca temporal y el nombre del archivo. Implementa CAP-1, CAP-9.
**Consecuencias verificables:**
- Un evento puede rastrearse hasta la carga que lo originó y hasta la persona que la ejecutó.

**Fuera de alcance de este grupo:** conectores a ERP, ingesta programada, ingesta por API, enriquecimiento desde fuentes externas (§9.2).

### 5.2 Motor de controles — definición declarativa

**Descripción.** El motor es el producto; todo lo demás es una superficie sobre él. Un control es una **definición declarativa consumida como dato**: qué tipo de evento vigila, qué señales compone, con qué pesos, con qué umbrales, a qué delito está ligado. El motor ejecuta esa estructura y no contiene ninguna ruta de código específica de un control. Esta es la mitad **D1** del pliegue D1/D2 del contrato de alcance: la arquitectura, no negociable, independiente de que exista una interfaz para escribir definiciones.

#### RF-05: Definición declarativa de un control
Un control existe como una definición de datos que carga: identidad y nombre legible, el `delito` al que se liga, el tipo de evento que vigila, las señales que compone con su peso cada una, los umbrales de banda y de alertamiento, y su versión y autoría. Implementa CAP-2.
**Consecuencias verificables:**
- Todo el comportamiento de un control está descrito por su definición. Comportamiento que viva en otro lugar es un defecto de D1.
- No existe en el sistema una segunda representación paralela del mismo control.

#### RF-06: Ejecución sin código por control
El motor ejecuta cualquier definición de control válida sin ruta de código específica para ese control. Implementa CAP-2.
**Consecuencias verificables:**
- Una segunda definición, ligada a un delito distinto y a un tipo de evento distinto, corre sobre el mismo motor sin modificarlo.
- Agregar un delito no requiere cambios en el motor; requiere una definición nueva y, a lo más, señales nuevas.

#### RF-07: Siembra de definiciones sin interfaz
Las definiciones de control pueden sembrarse directamente, sin pasar por ninguna interfaz de autoría. Implementa CAP-2.
**Consecuencias verificables:**
- El recorrido vertical `ingesta → puntuación → explicación → revisión → cierre` corre completo con controles sembrados, antes de que exista la interfaz de autoría.
- Si D2 (§5.7) se detiene en su fecha de corte, este camino sostiene la demostración sin cambios.

#### RF-08: Versionado de la definición
El sistema conserva la versión de la definición del control con la que se produjo cada alerta. Implementa CAP-2, CAP-5.
**Consecuencias verificables:**
- Modificar un control no altera la ficha ni el desglose de una alerta ya emitida.
- Una alerta puede nombrar la definición **tal como corrió**, no tal como está hoy.

### 5.3 Catálogo de señales

**Descripción.** Una señal es un detector reutilizable que cualquier control puede componer; nunca es lógica propiedad de un control. Dos familias: **intrínsecas**, que leen la forma de la transacción con datos internos únicamente, y **relacionales**, que leen quién es la contraparte. El recorrido vertical implementa **dos o tres señales**; el resto del catálogo es ensanchamiento posterior (§9).

#### RF-09: Señales como detectores reutilizables
Una señal se implementa una vez y puede ser compuesta por cualquier control. Implementa CAP-3.
**Consecuencias verificables:**
- `fraccionamiento` es referenciada por un control ligado a *corrupción entre particulares* y por un control ligado a *lavado de activos*, con **una** implementación y sin duplicación. *Esta es la comprobación de que la capa intermedia existe.*

#### RF-10: Señales intrínsecas del recorrido vertical
El sistema implementa dos señales intrínsecas: `fraccionamiento` —varias compras al mismo proveedor, cada una justo bajo el umbral de aprobación, dentro de una ventana— y `adjudicación sin competencia` —la compra se adjudicó con un solo oferente, `n_oferentes == 1`—. Implementa CAP-3.
**Consecuencias verificables:**
- `fraccionamiento` se activa sobre el caso plantado de tres compras bajo umbral y no sobre compras aisladas equivalentes.
- `adjudicación sin competencia` se activa sobre el caso plantado de adjudicación a oferente único y no sobre compras con competencia registrada.
- *Es la única señal del catálogo que lee el elemento típico del art. 287 bis (§7, T-1); las demás leen motivo o circunstancia habilitante.*

#### RF-11: Señales relacionales del recorrido vertical
El sistema implementa `proveedor recientemente constituido` (lee `fecha_constitucion_proveedor` contra la fecha de la compra) y `apellido compartido con el solicitante` (compara el nombre del proveedor con el del solicitante). Implementa CAP-3.
**Consecuencias verificables:**
- Ambas corren sin ninguna consulta a una fuente externa.
- Cada una se activa sobre su caso plantado correspondiente en el dataset de demostración.

#### RF-12: Resolución de entidades por RUT
El sistema resuelve proveedores y personas por RUT como clave de unión. Implementa CAP-3.
**Consecuencias verificables:**
- Dos filas del CSV con el mismo RUT de proveedor se resuelven a la misma entidad, y `fraccionamiento` puede agregarlas.

**Punto ciego estructural, declarado.** Las señales leen datos. Lo que no deja rastro en datos —efectivo, favores, licitaciones dirigidas— es invisible para todo el catálogo, por muchas señales que se agreguen. Ese punto ciego pertenece al canal de denuncias, fuera de alcance (§9.2, §11).

### 5.4 Puntuación y explicabilidad

**Descripción.** El núcleo argumental del sistema. El auditor pregunta "¿por qué 0,87?", y la respuesta no puede ser una recomputación ni una aproximación: tiene que ser el desglose almacenado en el momento en que la decisión se tomó. La explicabilidad no es una funcionalidad sobre el scoring; es su contrato.

#### RF-13: Contrato del scorer
El scorer devuelve `{ score, breakdown[] }` sobre un evento y un control, nunca un número solo. Cada entrada de `breakdown` nombra la señal, si se activó, su peso y su contribución al total. Implementa CAP-4.
**Consecuencias verificables:**
- La obligación está impuesta en la **firma de tipos**: ninguna ruta de código puede devolver un score sin su desglose.
- Una prueba unitaria alimenta un evento al motor y afirma sobre `breakdown[]`, no solo sobre el score.

#### RF-14: Bandeo por umbrales configurados
El score se traduce a *probabilidad baja / media / alta* según los umbrales leídos de la definición del control. Implementa CAP-4.
**Consecuencias verificables:**
- Los umbrales no son constantes del motor.
- Cambiar los umbrales en la definición cambia la banda del mismo score sin tocar código.

#### RF-15: Emisión de alerta
El sistema emite una `alerta` cuando un control puntúa un evento por sobre su umbral de alertamiento. Realiza UJ-1. Implementa CAP-4.
**Consecuencias verificables:**
- La emisión es la **única** acción automática del sistema, y produce un registro, no una decisión.
- Un evento bajo el umbral no genera alerta y no genera ruido en la bandeja.

#### RF-16: Persistencia del desglose junto a la alerta
El `breakdown[]` se persiste junto a la alerta y no se recomputa al leerla. Implementa CAP-4, CAP-5.
**Consecuencias verificables:**
- Modificar la definición del control después de emitida la alerta no cambia el desglose almacenado.
- La alerta responde por la decisión **tal como se tomó**.

#### RF-17: Explicación visible en la alerta
Al abrir una alerta, la encargada ve todas las señales del desglose almacenado con su contribución, y la ficha del control que la produjo. Realiza UJ-1, UJ-4. Implementa CAP-5.
**Consecuencias verificables:**
- La pregunta "¿por qué 0,87?" se responde en pantalla, sin recomputación y sin salir de la alerta.
- Se muestran también las señales que **no** se activaron: la ausencia es parte de la explicación.

### 5.5 Ficha del control

#### RF-18: Renderizado de la ficha desde la definición
El sistema renderiza la **ficha del control** —qué vigila, qué señales compone, con qué pesos, dónde están sus umbrales— desde la misma definición declarativa que el motor ejecutó. Realiza UJ-4. Implementa CAP-6.
**Consecuencias verificables:**
- Cambiar la definición cambia la ficha sin ningún segundo paso de autoría.
- La ficha es legible por alguien que no lee código.
- No existe una segunda fuente de verdad sobre lo que un control hace.

### 5.6 Flujo del encargado

**Descripción.** La mitad humana del sistema, y la que existe por el axioma de que **una persona siempre decide**: los computadores no pueden ser responsabilizados, y la plataforma no es un mecanismo de determinación legal. Salvo la emisión de la alerta (RF-15), toda transición de estado la causa una persona. La secuencia es `alerta abierta → en revisión → {descartada | escalada | caso abierto} → caso cerrado`.

#### RF-19: Bandeja de alertas
La encargada ve las alertas pendientes con su control, su banda de probabilidad y su fecha. Realiza UJ-1. Implementa CAP-7.
**Consecuencias verificables:**
- Cada alerta de la bandeja es alcanzable en un clic desde su explicación (RF-17).

#### RF-20: Revisión de una alerta
Abrir una alerta la registra como revisada, con actor y marca temporal. Implementa CAP-7, CAP-9.
**Consecuencias verificables:**
- Una alerta abierta queda distinguible de una nunca abierta, sin acción adicional de la encargada.
- El registro de revisión nombra a la persona y el instante, y no se sobrescribe si la alerta se abre de nuevo: cada apertura es un registro.

#### RF-21: Descarte con motivo
La encargada puede descartar una alerta indicando un motivo escrito. Implementa CAP-7.
**Consecuencias verificables:**
- El descarte registra actor, marca temporal y motivo.
- **El descarte no es una eliminación:** la alerta descartada permanece en el rastro de evidencia y sigue siendo consultable.

#### RF-22: Escalamiento
La encargada puede escalar una alerta. Implementa CAP-7.
**Consecuencias verificables:**
- El escalamiento registra actor y marca temporal.
- `[SUPUESTO: en esta iteración el escalamiento es un cambio de estado sin destinatario: no hay notificación, no hay segundo rol y no hay ruta al directorio o comité de ética. El problema de independencia —si la encargada puede cerrar una alerta sobre quien firma su sueldo— se declara en §11 y se lleva a trabajo futuro, no se resuelve aquí.]`

#### RF-23: Promoción a caso
La encargada puede promover una alerta a `caso` para investigación. Realiza UJ-2. Implementa CAP-7.
**Consecuencias verificables:**
- La promoción registra actor y marca temporal, y conserva el vínculo con la alerta y su desglose de origen.

#### RF-24: Cierre con justificación
Cerrar un caso **exige** una justificación escrita. Realiza UJ-2. Implementa CAP-8.
**Consecuencias verificables:**
- El cierre sin texto de justificación se rechaza.
- El registro almacenado lleva la razón íntegra, la persona que actuó y la marca temporal.
- El registro no es editable ni eliminable a través de la interfaz (RNF-02).
- *Este es el registro de mayor valor del sistema: las alertas prueban que el modelo estaba vigilando; el cierre prueba qué decidió la organización a pesar de la advertencia.*

#### RF-25: Atribución del actor
Toda acción de revisión y todo cierre son atribuibles a una persona autenticada. Implementa CAP-9.
**Consecuencias verificables:**
- Un visitante no autenticado no puede actuar sobre una alerta ni verla.
- Cada registro de acción nombra al actor autenticado que la ejecutó.

### 5.7 Autoría sin código

**Descripción.** La mitad **D2** del pliegue. Es lo que convierte "plataforma" de afirmación en demostración, y es también lo que se sacrifica si el tiempo aprieta: si un control escrito desde la interfaz no corre de extremo a extremo en la fecha de corte, D2 se detiene, las definiciones se siembran por RF-07 y se pierde **una pantalla, no la arquitectura**.

#### RF-26: Autoría de un control desde la interfaz
La encargada puede crear un control desde la interfaz —eligiendo delito y tipo de evento, seleccionando señales, fijando pesos y umbrales— sin editar JSON y sin un desarrollador. Realiza UJ-3. Implementa CAP-10.
**Consecuencias verificables:**
- El camino completo ocurre en la interfaz; no se edita ningún archivo ni se toca la base de datos.

#### RF-27: Validación de la definición antes de guardar
El sistema valida la definición antes de persistirla y rechaza las malformadas indicando el motivo. Realiza UJ-3 (caso borde). Implementa CAP-10.
**Consecuencias verificables:**
- Una definición sin señales, con pesos inconsistentes o con umbrales fuera de orden se rechaza en el guardado.

#### RF-28: Ejecución del control escrito desde la interfaz
Un control creado íntegramente desde la interfaz es ejecutado por el motor sin cambio alguno en el motor. Realiza UJ-3. Implementa CAP-10.
**Consecuencias verificables:**
- Re-ejecutado sobre el mismo CSV, produce un caso que la configuración anterior no producía. *Este es el beat que cierra la demostración.*

#### RF-29: Fecha de corte de D2
El proyecto fija por anticipado una fecha de corte para D2, registrada por escrito antes de comenzar la construcción.
**Consecuencias verificables:**
- Si en esa fecha un control escrito desde la interfaz no corre de extremo a extremo, D2 se detiene y pasa a trabajo futuro.
- `[SUPUESTO: la fecha está fijada en el build-order como "fin de W10" en semanas relativas. La fecha calendario absoluta no está determinada al 2026-09-02 y debe escribirse en la Fase 0. Un pliegue de contingencia sin fecha comprometida de antemano no protege nada: es la decisión optimista de la semana previa a la demostración.]`

### 5.8 Evaluación

**Descripción.** El proyecto debe poder **declarar** qué tan bien sus controles detectan las conductas de las que fueron derivados, en lugar de afirmarlo. El dato sintético con verdad fundamental (*ground truth*) plantada es el instrumento experimental, no un sustituto de algo mejor: el dato real no tiene etiquetas y no soportaría la misma afirmación.

#### RF-30: Harness de evaluación
El sistema provee un harness que ejecuta el motor sobre el dataset sintético y compara las alertas producidas contra la verdad fundamental mantenida **fuera** del CSV ingestado. Implementa CAP-11.
**Consecuencias verificables:**
- Las etiquetas de verdad fundamental viven en un archivo separado y versionado; **nunca** dentro del CSV que el sistema ingesta. Si las etiquetas son ingestables, la evaluación está contaminada.

#### RF-31: Reporte de precisión y recall por control, por lote
El harness reporta **precisión y recall por control**, y reporta por separado el lote de autoría propia y el lote plantado independientemente. Implementa CAP-11.
**Consecuencias verificables:**
- La unidad de la afirmación es el control, no el sistema agregado — porque un control es lo que produce la cadena de derivación.
- Los lotes nunca se fusionan: el lote propio demuestra el mecanismo, el lote independiente es el que tiene peso probatorio, y fusionarlos destruye la distinción que hace creíble la evaluación.

---

## 6. Requerimientos no funcionales

Transversales al sistema. Numeración global `RNF-01..RNF-15`.

### 6.1 Explicabilidad y reproducibilidad

#### RNF-01: La explicabilidad es una obligación de tipo, no una funcionalidad
El contrato `{ score, breakdown[] }` está impuesto en la firma de tipos del scorer, de modo que ninguna ruta de código pueda eludirlo.
**Verificación:** el compilador rechaza una implementación que devuelva un score sin desglose.
*Racional:* posponer la explicabilidad obliga a reescribir cada señal. Es la única decisión arquitectónica irreversible del proyecto y se toma en W2.

#### RNF-02: Determinismo del scoring
Un mismo evento, evaluado por una misma versión de una definición de control, produce siempre el mismo score y el mismo desglose.
**Verificación:** re-ejecutar el harness sobre el dataset produce resultados idénticos.
*Racional:* sin determinismo no hay evaluación reproducible ni evidencia defendible.

### 6.2 Integridad de la evidencia

#### RNF-03: Los registros de evidencia no son editables ni eliminables
Ninguna alerta, acción de revisión, descarte ni cierre con justificación puede editarse ni eliminarse a través de la interfaz, por ningún usuario.
**Verificación:** no existe ruta en la interfaz ni procedimiento tRPC que modifique o borre un registro de evidencia ya emitido.
*Racional:* resuelve explícitamente la pregunta abierta del SPEC sobre si la evidencia puede alterarse. La respuesta es no: un rastro de evidencia editable no es evidencia. Corregir un error se hace agregando un registro, nunca modificando uno.

#### RNF-04: Atribución y sello temporal universales
Todo registro producido por una acción humana lleva actor autenticado y marca temporal.
**Verificación:** no existe registro de acción sin actor y sin fecha y hora.

*Un log append-only completo y el almacenamiento point-in-time del enriquecimiento son un **SHOULD** del contrato de alcance, no parte de este compromiso (§9).*

### 6.3 Seguridad y control de acceso

#### RNF-05: Autenticación obligatoria
Toda superficie que muestre eventos, alertas, casos o definiciones de control exige sesión autenticada.
**Verificación:** un visitante anónimo no puede leer ni actuar sobre ningún dato de dominio.

#### RNF-06: Un solo rol, una sola instancia
El sistema opera con un rol —encargado de cumplimiento— y una organización por instancia. No hay multi-tenant ni segregación de permisos internos.
**Verificación:** no existe modelo de roles ni de permisos más allá de autenticado / no autenticado.
`[SUPUESTO: con un solo rol, la encargada ve la configuración de umbrales. Esto crea una sombra de detección —quien conoce el umbral se esconde bajo él— que se declara como limitación en §11. Restringir la visibilidad de los umbrales requiere el segundo rol, que es un COULD y queda en trabajo futuro.]`

### 6.4 Protección de datos personales — Ley 21.719

La **Ley 21.719**, publicada el 13 de diciembre de 2024, rige plenamente desde el **1 de diciembre de 2026** — es decir, **dentro del semestre de este proyecto**. Alinea a Chile con el estándar GDPR, crea la Agencia de Protección de Datos Personales con potestad sancionatoria, e impone registro de actividades de tratamiento, evaluaciones de impacto para tratamientos de alto riesgo, notificación de brechas, derechos ARCO más portabilidad y la eventual designación de un delegado de protección de datos.

El sistema trata datos que la ley califica como personales y, en parte, sensibles: RUT y nombres de personas, `flag_PEP` y `causas_judiciales`. Un prototipo académico no queda por eso fuera del marco; queda fuera del **riesgo**, y solo si lo hace deliberadamente.

#### RNF-07: Solo datos sintéticos
El sistema opera exclusivamente sobre datos sintéticos generados para el proyecto. No se carga, procesa ni almacena ningún dato personal de una persona real en ningún momento.
**Verificación:** todo dataset del repositorio y de la instancia desplegada es de generación propia y está declarado como tal.
*Racional:* es la única medida que hace innecesarias, y no meramente diferidas, las obligaciones de licitud, consentimiento, EIPD, notificación de brechas y derechos del titular. `[SUPUESTO: la restricción a datos sintéticos es una decisión de diseño del prototipo y una condición de su despliegue, no un accidente de la etapa de desarrollo. Si en algún momento se pretendiera cargar datos reales, este RNF debe reevaluarse antes y no después.]`

#### RNF-08: Minimización y ausencia de exportación
El sistema almacena únicamente los campos que alguna señal lee o que algún registro de evidencia requiere, y no ofrece exportación masiva de datos de dominio.
**Verificación:** no existe funcionalidad de descarga de eventos, alertas ni casos.
*Racional:* minimización de datos, y reducción de la superficie de una eventual brecha.

#### RNF-09: Retención acotada al ciclo académico
Los datos de la instancia se conservan solo mientras dure la evaluación de la APT y se eliminan al cierre del proyecto.
**Verificación:** la política está declarada en el documento de tesis y ejecutada al término.

**Fuera de alcance, con su razón:** evaluación de impacto en privacidad (EIPD), delegado de protección de datos, registro formal de actividades de tratamiento, ejercicio de derechos ARCO y portabilidad, y procedimiento de notificación de incidentes a la Agencia. Todas presuponen un tratamiento de datos personales reales que RNF-07 excluye. Se nombran aquí, y en §11, como lo que una implantación productiva de esta plataforma tendría que resolver antes de tratar datos reales — no como omisiones.

### 6.5 Idioma y vocabulario

#### RNF-10: Interfaz en español
La interfaz de la aplicación está íntegramente en español.
**Verificación:** no hay texto de interfaz en inglés en ninguna pantalla.
`[SUPUESTO: resuelve la pregunta abierta del SPEC sobre el idioma de la interfaz. La usuaria es una profesional de cumplimiento chilena y la audiencia evaluadora es chilena; una interfaz con chrome en inglés y términos de dominio en español sería una inconsistencia visible en la demostración.]`

#### RNF-11: Vocabulario ubicuo en español en todas las capas
Los términos del §3 Glosario se mantienen en español, con sus tildes, en el esquema Drizzle, en los nombres de procedimientos tRPC y en la interfaz. El resto —código, comentarios, commits, documentación técnica— está en inglés.
**Verificación:** las columnas del esquema y los procedimientos de la API usan `control`, `señal`, `evento`, `alerta`, `caso`, `delito`, `proveedor`, sin traducción ni anglización.
*Racional:* el modelo de dominio es vocabulario legal. Traducirlo introduce una capa de mapeo entre lo que dice la ley y lo que dice el código, y esa capa es justamente donde se pierde la trazabilidad que este documento existe para demostrar.

### 6.6 Rendimiento y operación

#### RNF-12: Rendimiento suficiente para la demostración
La carga y puntuación completa del CSV de demostración termina dentro de una interacción de interfaz, sin proceso en segundo plano visible para la usuaria.
**Verificación:** el dataset de demostración se ingesta y puntúa en la sesión de demostración sin espera que interrumpa el relato. *No se compromete un objetivo de volumen: el prototipo no es un sistema de producción y afirmar una cifra de escala sería una afirmación no medida.*

#### RNF-13: Sustrato tecnológico fijo
El prototipo se construye sobre el monorepo Better-T-Stack existente. No hay fase de andamiaje ni evaluación de alternativas de stack. Ver `_bmad-output/specs/spec-plataforma-mpd/stack-and-conventions.md`.
**Verificación:** ninguna fase del `build-order.md` invierte tiempo en andamiaje, y no se incorpora ninguna dependencia de infraestructura ajena al monorepo existente.
*Racional:* nada del diseño de dominio depende de estas elecciones; están fijadas para que no se gaste tiempo en fijarlas.

#### RNF-14: Despliegue temprano con respaldo local y video
La instancia se despliega con sus datos sembrados y se verifica con anticipación a la fecha de la demostración, con un respaldo de ejecución local y un video grabado.
**Verificación:** existen las tres cosas —instancia desplegada, ejecución local funcionando, video— antes del día de la demostración.
*Racional:* las demostraciones de titulación mueren en infraestructura con más frecuencia que en código.

#### RNF-15: Ausencia de aprendizaje automático
El sistema no incorpora aprendizaje automático en ningún rol, incluida la priorización de alertas.
**Verificación:** no hay modelo entrenado ni dependencia de inferencia en el sistema.
*Racional:* la puntuación basada en reglas es **más** defendible aquí, no menos. Un auditor que pregunta "¿por qué 0,87?" puede ser respondido por un desglose y no puede serlo por un modelo opaco. Además, priorizar carece de sentido antes de que exista un volumen de alertas que priorizar.

---

## 7. Matriz de trazabilidad — de la ley al requerimiento

Esta matriz es la forma tabular del método del §4 y el instrumento con el que la comisión puede verificar que ningún requerimiento fue elegido por intuición. Se lee de izquierda a derecha: la norma nombra un delito, el delito se comete por conductas, la conducta deja un rastro, el rastro es un campo, el campo lo lee una señal, la señal se compone en un control, y el control exige requerimientos concretos del §5.

`[SUPUESTO: la derivación legal completa aún no se ejecuta —es la Fase 1, W1, del build-order. Las columnas "norma" fueron verificadas contra fuentes secundarias el 2026-09-12 y corregidas; **deben contrastarse contra el texto oficial en BCN** antes de incorporarse a la tesis, en particular la lista de delitos base del art. 27 letra a) de la Ley 19.913 (T-4). Las columnas "conducta típica" siguen siendo preliminares. La estructura de la matriz es definitiva: es el criterio de salida de esa semana.]`

| # | Norma | Delito | Conducta típica | Rastro que deja | Dato observable | Señal | Control | RF |
|---|---|---|---|---|---|---|---|---|
| T-1 | Ley 20.393 art. 1 · **CP art. 287 bis** — el tipo exige favorecer *"la contratación con un oferente sobre otro"* | corrupción entre particulares | **favorecer la contratación con un oferente sobre otro** *(el elemento típico)* | la adjudicación no fue competitiva | `n_oferentes` de la compra | `adjudicación sin competencia` (intrínseca) | control ligado a *corrupción entre particulares* sobre `compra` | RF-10, RF-13 |
| T-2 | Ley 20.393 art. 1, catálogo ampliado por **Ley 21.595** (vigente para personas jurídicas desde 01-09-2024) · tipo penal: **CP art. 287 bis / 287 ter** — corrupción entre particulares | corrupción entre particulares | pagar a un tercero eludiendo el flujo de aprobación, partiendo el monto | varias compras al mismo proveedor bajo el umbral, en ventana corta | monto, RUT del proveedor, fecha, umbral de aprobación | `fraccionamiento` (intrínseca) | control ligado a *corrupción entre particulares* sobre `compra` | RF-10, RF-12, RF-13 |
| T-3 | íd. | corrupción entre particulares | contratar a una sociedad creada para canalizar el pago | proveedor sin historia previa a la relación | `fecha_constitucion_proveedor` vs. fecha de la compra | `proveedor recientemente constituido` (relacional) | íd. | RF-11, RF-13 |
| T-4 | íd. | corrupción entre particulares | dirigir la compra a una entidad vinculada a quien la solicita | coincidencia de identidad entre contraparte y solicitante | nombre del proveedor vs. nombre del solicitante | `apellido compartido con el solicitante` (relacional) | íd. | RF-11, RF-12 |
| T-5 | **Ley 19.913 art. 27 letra a)** · el delito precedente debe estar en la lista de esa letra — *no se pudo confirmar que el cohecho figure entre los delitos base; verificar en W1* | lavado de activos | fragmentar transferencias para eludir controles de monto | varios pagos bajo umbral a una misma contraparte | monto, RUT, fecha del `pago`/`transferencia` | `fraccionamiento` (**la misma implementación**) | control ligado a *lavado de activos* sobre `pago` | RF-09, RF-06 |
| T-6 | íd. | lavado de activos | operar a través de una contraparte políticamente expuesta | condición de la contraparte declarada en fuente externa | `flag_PEP` | `PEP involucrado` (relacional) | íd. | RF-11 *(ensanchamiento)* |
| T-7 | **Ley 20.393 art. 3 inc. 3** — los deberes de dirección y supervisión se entienden cumplidos si el modelo fue *adoptado **e implementado*** antes de la comisión del delito | — *(obligación del modelo, no delito)* | operar un modelo sin poder acreditar que operó | ausencia de registro de vigilancia y decisión | — | — | — | RF-16, RF-24, RNF-03, RNF-04 |
| T-8 | **Ley 20.393 art. 4**, en su redacción dada por Ley 21.595 — el modelo exige **evaluaciones periódicas por terceros independientes** | — *(obligación del modelo, no delito)* | someter el modelo a evaluación externa sin material que evaluar | ausencia de documentación legible del control y de su operación | — | — | — | RF-18, RF-16, RNF-03 |
| T-9 | Ley 21.719 — tratamiento de datos personales | — *(obligación regulatoria transversal)* | tratar datos personales y sensibles sin base ni resguardo | — | RUT, nombres, `flag_PEP`, `causas_judiciales` | — | — | RNF-07, RNF-08, RNF-09 |

**La fila T-1 la produjo la cadena, no el diseño previo.** Hasta la semana de derivación ninguna señal del catálogo leía el elemento que el art. 287 bis efectivamente exige: el tipo no castiga cualquier soborno entre privados, sino el que favorece *"la contratación con un oferente sobre otro"*. La conducta típica ocurre entonces en la **elección** del proveedor, no en el monto de la compra — y las tres señales originales quedaron reclasificadas: `fraccionamiento` es rastro **habilitante**, porque sustrae la elección al escrutinio, y las dos relacionales son rastro **de motivo**, porque explican por qué ese proveedor. Ninguna leía el rastro **directo**.

La cadena produjo entonces `adjudicación sin competencia`, y con ella una columna nueva en el dataset (`n_oferentes`). Que el método haya corregido el diseño en vez de confirmarlo es el segundo caso en que lo hace, después de haber llegado a *debida diligencia de terceros* desde primeros principios. Se reporta como evidencia a favor del método, no como un error que se arregló. Derivación completa en `derivacion-delitos.md`.

**Por qué el tipo penal es corrupción entre particulares y no cohecho.** La organización modelada es una empresa privada que compra a proveedores privados y **no contrata con el Estado**, de modo que no hay funcionario público en ninguno de los extremos de la transacción. El cohecho de los arts. 248 a 250 del Código Penal exige precisamente esa figura; la conducta que aquí se vigila —un solicitante que dirige compras a un proveedor a cambio de un beneficio— es la del **art. 287 bis** (quien recibe) y **287 ter** (quien ofrece o da).

Esto tiene una consecuencia que conviene declarar en la tesis y no esconder: **las señales derivadas en T-1 a T-4 servirían igual a un control ligado a cohecho** si la empresa modelada vendiera al Estado. Cambia la norma a la que se liga el control, no la señal que lo compone — que es el mismo argumento de la fila T-5, ahora por una vía distinta. La generalidad del motor queda demostrada dos veces: un delito nuevo puede significar un tipo de evento distinto (T-5) o el mismo evento bajo otra norma (T-1 a T-4), y en ninguno de los dos casos cambia el motor.

**La fila T-7 es el anclaje textual de toda la tesis.** El art. 3 inc. 3 de la Ley 20.393 no dice que baste con *tener* un modelo: dice que los deberes de dirección y supervisión se entienden cumplidos cuando la persona jurídica lo hubiere **adoptado e implementado** con anterioridad a la comisión del delito. Esa conjunción —*adoptado e implementado*— es la distancia exacta entre un modelo de papel y uno operativo, y es lo que esta plataforma produce evidencia para acreditar. El art. 4, en cambio, enumera los elementos mínimos del modelo; es el que explica por qué existe un encargado de cumplimiento, no el que explica por qué la evidencia importa.

**La fila T-8 convierte al auditor externo de personaje en requisito legal.** La Ley 21.595 reformó el art. 4 para exigir **evaluaciones periódicas del modelo por terceros independientes**. El lector para el que está escrita la ficha del control (§5.5) no es entonces una figura narrativa de este documento: es una exigencia de la norma, y una empresa con evaluación externa accede además a una atenuante en el proceso penal. Esto refuerza RF-18 y RNF-03 más de lo que el brief anticipaba.

**La fila T-5 es la que sostiene el argumento arquitectónico.** `fraccionamiento` aparece en T-2 y en T-5, para delitos distintos y tipos de evento distintos, con **una** implementación. Si esa celda requiriera dos implementaciones, el modelo de tres capas sería falso y el proyecto sería un archivo de reglas con mejor vocabulario.

**Las filas T-7, T-8 y T-9 no producen señales, y eso es informativo:** son obligaciones que no se detectan sino que se *cumplen*, y por eso derivan en requerimientos no funcionales de integridad de la evidencia y de protección de datos, no en controles. La cadena de derivación distingue las dos cosas.

**Composición emergente.** T-2 + T-5 + `causas judiciales`, aplicadas **antes** de aprobar, constituyen **debida diligencia de terceros** — un componente estándar y nombrado del MPD, alcanzado desde primeros principios sin partir de una checklist. Esa llegada es la validación más fuerte que tiene el método.

---

## 8. Restricciones y guardarraíles

Restricciones de construcción, no aspiraciones. Cada una fue una decisión y cada una sostiene algo.

1. **Una persona siempre decide.** El sistema informa; nunca es mecanismo de determinación legal. Sin determinación automática, sin bloqueo, sin acción que no haya tomado una persona. *Los computadores no pueden ser responsabilizados.*
2. **El scorer devuelve `{score, breakdown[]}`, nunca un número solo**, impuesto en la firma de tipos, y el desglose se persiste — no se recomputa (RNF-01, RF-16).
3. **Los controles son datos declarativos consumidos como configuración.** Cero código por control en el motor. Ningún control cuyo comportamiento no esté descrito completamente por su definición.
4. **Una definición, tres renderizados:** lógica ejecutable, ficha del control, objeto de la interfaz de autoría. Una segunda representación paralela del mismo control es un defecto.
5. **Los umbrales son configuración de la definición**, no constantes del motor ni valores que la encargada ajusta sobre la marcha mientras revisa una alerta.
6. **La ingesta es solo CSV.** Sin ERP, sin adaptadores externos. El enriquecimiento llega como columnas, para que las señales relacionales corran con cero integraciones.
7. **Compuerta de recorrido vertical:** nada se ensancha hasta que `ingesta → puntuación → explicación → revisión → cierre` corra de extremo a extremo. *Una biblioteca magnífica de señales sin pantalla de revisión se demuestra como nada.*
8. **El pliegue D1/D2 con fecha de corte comprometida por anticipado** (RF-29). El camino de siembra de RF-07 debe existir y funcionar con independencia de cualquier interfaz.
9. **Precisión por sobre recall.** Un control que se activa de más es un defecto de ese control, no un margen de seguridad: la fatiga de alertas entrena a la encargada a descartar todo, y un sistema entrenado para ser descartado es un modelo de papel con mejores gráficos.
10. **La derivación legal está acotada a una semana y a dos o tres delitos.** `[SUPUESTO: un tercer delito queda fuera del compromiso y se aborda solo si la semana de derivación no se consume con los dos primeros. Resuelve la pregunta abierta del SPEC: el tercer delito es opcional, no planificado.]`
11. **Verdad point-in-time.** Se guarda lo que una fuente dijo *cuando fue consultada*, con su marca temporal. El almacenamiento point-in-time completo es un SHOULD (§9.2), pero el axioma moldea el modelo de datos desde el inicio: agregarlo después obligaría a migrar registros de evidencia ya emitidos, que es justamente lo que RNF-03 prohíbe. *El auditor pregunta qué se sabía el 14 de marzo, no qué es verdad hoy.*
12. **El vocabulario de dominio permanece en español** en todas las capas (RNF-11).
13. **RUT es la clave de resolución de entidades** para proveedor y persona.

---

## 9. Alcance del MVP — delimitación del alcance

La línea de corte está ratificada y pre-comprometida en `scope-contract.md`. **Agregar algo es una enmienda consciente a ese contrato, no una deriva.** El orden de construcción es *primero la rebanada, después el ancho*: un camino vertical angosto a través de todas las capas antes de ensanchar cualquiera.

Esta sección es, literalmente, la sección *delimitación del alcance* del documento de tesis.

### 9.1 Dentro de alcance — MUST

| Cluster | Contenido | RF |
|---|---|---|
| **A — motor de controles** | eventos → señales → controles; scorer con desglose | RF-05..RF-16 |
| **C — flujo del encargado** | revisar, descartar, escalar, promover, **cierre con justificación**, todo registrado | RF-19..RF-25 |
| **B-core — explicabilidad y ficha del control** | por qué 0,87, y la ficha detrás | RF-17, RF-18 |
| **E-core — ingesta por CSV únicamente** | sin integración con ERP | RF-01..RF-04 |
| **D — autoría sin código** | **D1** el motor consume definiciones declarativas (arquitectura, no negociable); **D2** la interfaz de autoría, con fecha de corte | RF-05..RF-08 (D1), RF-26..RF-29 (D2) |
| **K — metodología** | cadena de derivación + dataset sintético con verdad fundamental | §4, §7, RF-30, RF-31 |

### 9.2 Fuera de alcance — trabajo futuro

**SHOULD** — se inician **solo** una vez que el recorrido vertical corre de extremo a extremo:
- Log append-only completo y almacenamiento point-in-time del enriquecimiento. *(El axioma de verdad point-in-time igual moldea el modelo de datos.)*
- Efectividad y visibilidad de la no-acción: un meta-control sobre el flujo de descartes y cierres. *Un gerente que anula cuarenta veces es, en sí mismo, una señal.*
- **Señales de timing preventivo.** Se registra su razón, porque es un argumento de tesis y no una funcionalidad más: *la ley apunta a la prevención, no a la detección*. Advertir a un aprobador **antes** de que una compra se autorice es la forma de mayor valor, y este prototipo se queda deliberadamente en la mitad detectiva del eje. La mitad de enforcement bloqueante está cortada por razones distintas (§9.2).

**COULD:**
- Interfaz `enriquecedor de entidades` con un adaptador real.
- Un segundo rol — necesario para restringir quién ve la configuración de umbrales (§6.3, §11).

**WON'T esta vez**, cada uno con su razón registrada:

| Cortado | Razón |
|---|---|
| **Canal de denuncias** completo | Es el *sensor de personas* que cubre el punto ciego estructural del sensor de datos. Su diseño ya está trabajado —anonimato técnico, cadena de receptores con recusación cuando el receptor es el acusado, código de seguimiento para comunicación bidireccional— y es el incremento natural siguiente al primero. |
| **Integración real con ERP** | Cualquier ERP es un sensor parcial de todos modos: una compra pagada en efectivo no deja rastro en él. Apostar el semestre a la API de un tercero compra menos de lo que parece. |
| **Enriquecimiento multi-fuente** (SII, Poder Judicial, CMF, listas PEP, ChileCompra, sanciones) | El enriquecimiento viaja como columnas del CSV, así que **el corte no cuesta nada**: ambas familias de señales corren, el motor se ejercita a su ancho completo, y el adaptador —si alguna vez se construye— se enchufa detrás de la misma forma. |
| **Monitoreo continuo** | Presupone fuentes externas. Un proveedor limpio al onboarding puede ser sancionado después; re-evaluar la base existente es el incremento que sigue a los adaptadores. |
| **Enforcement bloqueante** | Movería el sistema de informar una decisión humana a restringirla. Contradice el guardarraíl 1. |
| **Aprendizaje automático**, priorización incluida | RNF-15. |
| **Multi-tenant** | Una organización, una instancia. |
| **Gestión documental** | La política que justifica un control, almacenada junto al control. Es el **ítem #1** de trabajo futuro: es lo que haría visible la cadena de derivación *dentro del producto* y no solo en la tesis. |

**El patrón general del que depende todo el contrato de alcance:** cortar la integración, conservar la capacidad, y poner la costura donde revertir la decisión no cueste nada de lo ya construido.

---

## 10. Criterios de éxito y métricas

### 10.1 El recorrido de la demostración

La demostración debe aterrizar estos beats, **en orden**:

1. Cargar un CSV de compras que trae una narrativa plantada.
2. Aparece un caso.
3. Abrir la alerta y ver **qué señales se activaron y cuánto aportó cada una**, con la ficha del control detrás.
4. Recorrer el flujo completo de la encargada hasta el **cierre con justificación**.
5. **Escribir un control nuevo en vivo, sin tocar código, re-ejecutar el mismo CSV, y ver aparecer un caso distinto.**

*El beat que convence a una comisión es la explicación, no la detección. El beat 5 es el que convierte la afirmación de plataforma en una demostración.*

### 10.2 Métricas

**Primarias**
- **SM-1 — Precisión por control** contra la verdad fundamental plantada, reportada honestamente y con la limitación de evaluación circular declarada al lado. Valida RF-30, RF-31.
- **SM-2 — Agregar un delito requiere solo una definición de control nueva y, a lo más, señales nuevas; ningún cambio en el motor.** Es la forma falsable de la afirmación "un motor, muchas configuraciones". Valida RF-06, RF-09.

**Secundarias**
- **SM-3 — Recall por control**, reportado por lote separado (autoría propia / independiente). Valida RF-31.
- **SM-4 — Toda alerta del sistema es rastreable hasta una norma por la matriz del §7, y todo caso cerrado lleva su justificación almacenada.** Valida RF-24, RNF-03, §7.
- **SM-5 — La instancia está desplegada, sembrada y verificada antes del día de la demostración, con respaldo local y video.** Valida RNF-14.

**Contra-métricas — no optimizar**
- **SM-C1 — Número de alertas emitidas.** Más alertas no es mejor vigilancia; es fatiga. Un control con alto recall y baja precisión no es un sistema más seguro, es un sistema cuyas alertas se descartan por reflejo. Contrapesa a SM-3.
- **SM-C2 — Cantidad de señales implementadas y de delitos cubiertos.** El ancho del catálogo no es la contribución; el método lo es. Un catálogo grande sin recorrido vertical completo demuestra menos que dos señales que atraviesan todas las capas. Contrapesa a SM-2.

---

## 11. Limitaciones declaradas

Se declaran aquí, y en la tesis, con independencia de los números que arroje la evaluación. Una tesis que nombra lo que su sistema estructuralmente no puede ver es más defendible que una que insinúa cobertura completa.

1. **Evaluación circular.** La misma persona deriva las señales y construye el dataset que las prueba, de modo que la evaluación prueba menos de lo que aparenta. **Mitigación, procedimental y explícita:** derivar las señales de la ley *primero y por separado*, construir el dataset después, incluir un lote plantado por un tercero a ciegas y controles negativos, y **reportar los lotes por separado** (RF-31). El lote propio demuestra el mecanismo; el lote independiente es el que tiene peso probatorio.
2. **El dato sintético mide detección de las conductas *tal como fueron derivadas*, no detección de fraude real.** La limitación se declara cualquiera sea la precisión y el recall obtenidos.
3. **Las señales no observan el delito; observan circunstancias correlacionadas con él.** Los dos delitos derivados tienen elementos típicos que no dejan rastro alguno en los datos de la organización: el art. 287 bis exige un **beneficio** entregado al empleado, que se paga fuera de los sistemas de la empresa y nunca aparece en el registro de compras; el art. 27 de la Ley 19.913 exige **conocimiento** del origen ilícito, y el dolo es un estado mental que ningún dato contiene. Un sistema que afirmara detectar corrupción entre particulares estaría afirmando ver un beneficio que no puede ver y leer un conocimiento que no puede leer. Este afirma algo más débil y verdadero: que una compra reúne circunstancias que ameritan que una persona la mire. *Es la razón por la que el axioma "una persona siempre decide" es correcto, y no una concesión defensiva.*
4. **Punto ciego estructural del sensor de datos.** Las señales leen datos; lo que no deja rastro en datos —efectivo, favores, licitaciones dirigidas— es invisible para cualquier catálogo de señales. Ese punto ciego pertenece al canal de denuncias, que está fuera de alcance.
5. **Sombra de detección.** Los umbrales configurados crean un incentivo a esconderse bajo ellos, y con un solo rol la configuración es visible para quien la usa. La contra-señal es `agregación temporal` (ensanchamiento), y la restricción de visibilidad requiere el segundo rol.
6. **Problema de independencia, sin resolver.** No está establecido si una encargada de cumplimiento puede cerrar una alerta sobre la persona que firma su sueldo. Eso implica una ruta de escalamiento al directorio o al comité de ética que esta iteración no implementa (RF-22). Se lleva a la tesis como cuestión abierta, no como funcionalidad omitida.
7. **Base de investigación de usuario delgada.** No se entrevistó a ninguna encargada de cumplimiento. La persona del §2 está derivada del marco legal y de la propuesta, no de trabajo de campo.
8. **Sin evidencia de mercado ni de adopción.** No se afirma que empresas medianas chilenas comprarían o adoptarían esto; no se recogió evidencia al respecto.
9. **Cumplimiento de Ley 21.719 no implementado.** El prototipo lo elude operando solo con datos sintéticos (RNF-07). Una implantación productiva tendría que resolver EIPD, registro de tratamiento, derechos del titular y notificación de incidentes antes de tratar datos reales.

---

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| **Muerte por amplitud** — el riesgo autoidentificado como mayor: empezar denuncias, dashboard e integración con ERP, y no terminar ninguno | La línea de corte pre-comprometida del §9. Las enmiendas deben ser conscientes y escritas. Doblemente útil: es también la *delimitación del alcance* de la tesis. |
| **Evaluación circular** — el riesgo más agudo para la validez de la evaluación | §11.1: derivar antes y por separado de construir el dataset, lote independiente a ciegas, reporte por lotes separados. |
| **Sobrecosto de la investigación legal** — ocho semanas de estatutos y el código empezando en W10 | Timebox de una semana, dos o tres delitos (§8.10). El método es la contribución; la cobertura del catálogo no. |
| **D2 a medio construir** — una interfaz de autoría que ni funciona ni alcanzó a ser reemplazada | El pliegue D1/D2 más una **fecha de corte fijada por anticipado** (RF-29), no decidida en la semana optimista previa a la demostración. |
| **Infraestructura el día de la demostración** — las demostraciones de titulación mueren en infraestructura más que en código | RNF-14: desplegar temprano, respaldo local, video grabado. |
| **Tesis escrita al final** — código "casi listo" y el documento como tres semanas de pánico | Cada fase del build-order nombra su salida de tesis. Este documento, el contrato de alcance y el §11 ya son secciones escritas. |

---

## 13. Preguntas abiertas

Las ocho preguntas abiertas heredadas del SPEC fueron resueltas en este documento como supuestos (§14). Lo que permanece genuinamente abierto —y se lleva a la tesis como pregunta, no como omisión— es:

1. **Independencia del encargado de cumplimiento.** ¿Puede cerrar una alerta sobre quien firma su sueldo? Implica una ruta de escalamiento al directorio o comité de ética. Se reconoce, no se resuelve (§11.6).
2. **Agregación temporal como contra-señal.** Ante evasión deliberada bajo umbral, ¿basta con una ventana móvil, o el problema es estructural de cualquier umbral publicado? Es la primera señal del ensanchamiento y la pregunta que la acompaña.
3. **La fecha calendario absoluta de corte de D2** (RF-29) debe escribirse en la Fase 0, antes de comenzar a construir. Es la única pregunta abierta que **bloquea** el inicio del trabajo.

---

## 14. Índice de supuestos

Cada supuesto marcado en línea, para confirmación explícita. Los marcados **[SPEC]** resuelven una pregunta que el contrato técnico dejó abierta.

| # | Origen | Supuesto |
|---|---|---|
| S-1 | §2.1 | **[SPEC]** El auditor externo no recibe acceso propio al sistema; la evidencia se le exhibe a través de la encargada. Un rol auditor de solo lectura es trabajo futuro. |
| S-2 | §2.3 | **[SPEC]** La persona sobre la que existe una alerta no puede verla. Con un solo rol y una instancia, el acceso del sujeto comprometería la investigación. |
| S-3 | §2.4 (UJ-4) | La exhibición de evidencia al auditor es mediada; no hay exportación de expediente ni vista de auditor (consistente con RNF-08). |
| S-4 | §4, §7 | La derivación legal aún no se ejecuta (Fase 1, W1). La matriz del §7 es definitiva en estructura y **preliminar en su contenido legal**; los artículos citados deben verificarse antes de incorporarse a la tesis. |
| S-5 | §5.6 (RF-22) | **[SPEC]** El escalamiento es un cambio de estado sin destinatario: sin notificación, sin segundo rol, sin ruta al directorio. El problema de independencia se declara, no se resuelve. |
| S-6 | §5.7 (RF-29) | **[SPEC]** La fecha de corte de D2 está fijada como "fin de W10" en semanas relativas; **la fecha calendario absoluta no está determinada** y debe escribirse en la Fase 0. |
| S-7 | §6.3 (RNF-06) | **[SPEC]** Con un solo rol, la encargada ve la configuración de umbrales. La sombra de detección resultante se declara como limitación (§11.5); restringirla requiere el segundo rol (COULD). |
| S-8 | §6.4 (RNF-07) | **[SPEC]** La restricción a datos sintéticos es una decisión de diseño y una condición de despliegue, no un accidente de la etapa de desarrollo. Cargar datos reales exigiría reevaluar este RNF **antes**, no después. |
| S-9 | §6.5 (RNF-10) | **[SPEC]** La interfaz está íntegramente en español, no en inglés con términos de dominio en español. |
| S-10 | §8.10 | **[SPEC]** Un tercer delito queda **fuera** del compromiso y se aborda solo si la semana de derivación no se consume con los dos primeros. |

| S-11 | §7 (T-1 a T-4) | **RESUELTO 2026-09-12.** La empresa modelada es privada y no contrata con el Estado, por lo que el tipo penal de T-1 a T-3 es **corrupción entre particulares** (CP art. 287 bis / 287 ter), no cohecho de funcionario público. Ya no es un supuesto; se conserva la fila por trazabilidad de la decisión. |

**Resuelto sin supuesto, por decisión firme:** ¿puede editarse o eliminarse un registro de evidencia? **No** — RNF-03, para ningún usuario y por ninguna ruta. Un rastro de evidencia editable no es evidencia.
