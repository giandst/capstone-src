---
title: "Derivación de delitos — salida de la Fase 1"
status: en curso
created: 2026-09-19
updated: 2026-09-19
---

# Derivación de delitos

Salida de la Fase 1 del `build-order.md`. Aplica la cadena de `derivation-chain.md`:

```
delito (ley) → conducta típica → rastro que deja → dato observable → señal → control
```

**En español**, como el PRD, porque es material de tesis. Los companions técnicos del SPEC siguen en inglés.

> **Estado de verificación.** Los textos legales citados provienen de fuentes secundarias (doctrina, repositorios universitarios, estudios jurídicos) consultadas el 2026-09-19. **Cada artículo debe contrastarse contra el texto oficial en BCN antes de incorporarse a la tesis.** Las celdas marcadas *(decisión pendiente)* son llamadas del autor, no derivables del texto legal.

---

## 1. Corrupción entre particulares — CP art. 287 bis / 287 ter

**Norma.** Incorporados al Código Penal por la **Ley 21.121**. Integran el catálogo de delitos por los que responde una persona jurídica vía Ley 20.393 art. 1, ampliado por Ley 21.595.

- **287 bis** — el **empleado o mandatario** que *solicitare o aceptare recibir* un beneficio económico o de otra naturaleza, para sí o un tercero, **para favorecer o por haber favorecido en el ejercicio de sus labores la contratación con un oferente sobre otro**. Pena: reclusión menor en su grado medio y multa.
- **287 ter** — quien *diere, ofreciere o consintiere en dar* ese beneficio, con la misma finalidad. Pena menor si solo consiente.

En el modelo de la plataforma: **287 bis es el `solicitante`** (empleado de la organización que decide la compra); **287 ter es el `proveedor`** (el oferente que paga por ser preferido).

### 1.1 El elemento típico que manda: la situación de competencia

El tipo **no castiga cualquier soborno entre privados**. Castiga el que favorece *"la contratación con un oferente sobre otro"*. La doctrina chilena discute exactamente qué cuenta como **situación de competencia**, y esa discusión es el problema interpretativo central del delito.

Consecuencia para esta plataforma, y es la de mayor alcance de toda la derivación:

> **La conducta típica ocurre en la *elección* de proveedor, no en el monto de la compra.**

De ahí se sigue la clasificación de los rastros:

| Tipo de rastro | Qué evidencia | Señales |
|---|---|---|
| **Directo** | que la elección se apartó de la competencia | *(ver §1.2 — no existe ninguna en el catálogo actual)* |
| **De motivo** | por qué ese proveedor y no otro | `proveedor recientemente constituido`, `apellido compartido con el solicitante` |
| **Habilitante** | que la elección se sustrajo al escrutinio | `fraccionamiento` |

### 1.2 Hallazgo: falta la señal del rastro directo

Ninguna señal del catálogo actual lee la **situación de competencia**. Las tres señales del slice cubren motivo y habilitación; el rastro directo del tipo penal no lo lee nadie.

Las señales candidatas que la cadena produce, y que **no estaban en el diseño previo**:

| Señal candidata | Lee | Rastro |
|---|---|---|
| `adjudicación sin competencia` | compra sin cotizaciones competidoras / un solo oferente | directo |
| `oferta más barata descartada` | se eligió un oferente que no era el de menor precio, sin justificación | directo |
| `concentración en un proveedor` | proporción de compras de una categoría que van al mismo RUT | directo, agregado |

**Esto es lo que la cadena de derivación está para producir.** No confirma el diseño previo: lo corrige. Que el método haya obligado a agregar una señal no prevista —igual que antes llevó a *debida diligencia de terceros* desde primeros principios— es evidencia a favor del método, y se reporta como tal en la tesis.

### 1.3 El costo: el dato observable no existe en el CSV

Las tres señales candidatas necesitan datos de **proceso de compra** que el dataset de demostración no contempla: cotizaciones recibidas, número de oferentes, precio de cada oferta.

**Decisión tomada 2026-09-19: opción A** — se agrega la columna `n_oferentes` y la señal `adjudicación sin competencia`. Ver §4.

### 1.4 Cadena, estado actual

| Conducta típica | Rastro | Dato observable | Señal | Estado |
|---|---|---|---|---|
| favorecer la contratación con un oferente sobre otro | la elección no fue competitiva | `n_oferentes` | `adjudicación sin competencia` | **en el slice** |
| íd. | se descartó la oferta más barata | precio por oferta | `oferta más barata descartada` | ensanchamiento |
| contratar a una sociedad creada para canalizar el beneficio | proveedor sin historia previa a la relación | `fecha_constitucion_proveedor` | `proveedor recientemente constituido` | **implementable** |
| dirigir la compra a una entidad vinculada al solicitante | coincidencia de identidad | nombre proveedor vs. solicitante | `apellido compartido con el solicitante` | **implementable** |
| sustraer la elección al escrutinio de aprobación | compras bajo el umbral, en ventana corta | monto, RUT, fecha, umbral | `fraccionamiento` | **implementable** |

---

## 2. Lavado de activos — Ley 19.913 art. 27

### 2.1 Conducta típica

- **Art. 27 letra a)** — quien de cualquier forma **oculte o disimule el origen ilícito** de bienes, *a sabiendas* de que provienen, directa o indirectamente, de un delito base de la lista del propio artículo.
- **Art. 27 letra b)** — quien **adquiera, posea, tenga o use** esos bienes con ánimo de lucro, conociendo su origen.

La exposición de la organización bajo Ley 20.393 no es lavar activos propios: es que **un empleado use a la organización como vehículo** para ocultar el origen de bienes ajenos. El rastro está entonces en los `pagos` y `transferencias` que salen de la empresa, no en sus compras.

### 2.2 Cadena

| Conducta típica | Rastro | Dato observable | Señal | Estado |
|---|---|---|---|---|
| fragmentar transferencias para mantenerlas bajo el umbral de reporte | varios pagos bajo umbral a la misma contraparte, en ventana corta | monto, RUT, fecha del `pago` | `fraccionamiento` *(la misma implementación que en §1)* | **en el slice** |
| operar a través de una contraparte políticamente expuesta | condición de la contraparte | `flag_PEP` | `PEP involucrado` | ensanchamiento |
| pagar a un tercero ajeno a la operación que lo origina | el receptor del pago no es la contraparte del contrato | RUT del pago vs. RUT del contrato | `triangulación de pago` | trabajo futuro *(dato no modelado)* |

**`fraccionamiento` cruzando de `compra` a `pago` con una sola implementación es la prueba del argumento arquitectónico**, y es independiente de que un delito sea precedente del otro (§2.3).

### 2.3 Resuelto: el puente jurídico con §1 no existe, y no hace falta

El art. 27 letra a) exige que los bienes provengan de un **delito base** de su propia lista: Ley 20.000 (drogas), Ley 21.732 (terrorismo), normativa bancaria, delitos aduaneros, propiedad intelectual, Banco Central, delitos informáticos, y —agregados por Ley 21.595— delitos medioambientales.

**La corrupción entre particulares no aparece en ese catálogo** *(verificar contra BCN; ninguna fuente consultada la incluye).*

Esto cierra la pregunta abierta T-4 del PRD, y la respuesta es que **no era un problema**. El argumento arquitectónico del proyecto nunca fue jurídico: es que el **mismo motor** ejecuta un control ligado a otro delito sobre otro tipo de evento, con la misma implementación de `fraccionamiento`. Esa afirmación se sostiene sin que un delito sea precedente del otro. Los dos controles son independientes por diseño, que es precisamente lo que se quiere demostrar.

---

## 3. Hallazgo transversal — lo que ninguna señal puede observar

Los dos delitos derivados tienen elementos típicos que **no dejan rastro alguno** en los datos de la organización:

- **287 bis exige un beneficio** entregado al empleado. Ese pago ocurre *fuera* de los sistemas de la empresa — es la contraprestación del proveedor al solicitante, y nunca aparece en el registro de compras.
- **Art. 27 exige conocimiento** del origen ilícito. El dolo es un estado mental; ningún dato lo contiene.

De ahí la formulación honesta, y es la que debe ir en la tesis:

> **Las señales no observan el delito. Observan circunstancias objetivas correlacionadas con él.**

Esto no es una debilidad del diseño: es la razón por la que el axioma *una persona siempre decide* es correcto y no una concesión defensiva. Un sistema que afirmara detectar corrupción entre particulares estaría afirmando observar un beneficio que no puede ver y un conocimiento que no puede leer. Este sistema afirma algo más débil y verdadero: que una compra reúne circunstancias que ameritan que una persona la mire.

Es también la generalización del punto ciego ya declarado (efectivo, favores, licitaciones dirigidas): el sensor de datos no es ciego solo a ciertas conductas, sino a los **elementos subjetivos y extra-organizacionales de todas ellas**.

---

## 4. Decisión tomada — ampliación del dataset

**Resuelto el 2026-09-19: opción A, acotada.**

Se agrega **una** columna al CSV de compras —`n_oferentes`— y **una** señal al slice —`adjudicación sin competencia` (`n_oferentes == 1`)—. Con eso el control primario pasa a leer el elemento típico del delito al que está ligado, en vez de leer solo sus alrededores.

**Por qué no es un ensanchamiento del alcance.** Las señales son parte del cluster A, ya dentro de la línea de corte, y el slice estaba definido como *"dos o tres señales"*. Esto lo lleva a cuatro. El costo marginal es el menor de las cuatro: `n_oferentes == 1` es una comparación, mientras `fraccionamiento` necesita ventana y agregación. No se corta nada a cambio.

**`n_oferentes` no es enriquecimiento.** Las otras tres columnas añadidas (`fecha_constitucion_proveedor`, `flag_PEP`, `causas_judiciales`) sustituyen fuentes externas. Esta es dato de proceso de compra que la organización ya tiene. La distinción importa: no depende de ninguna integración futura.

**Diferido:** `oferta más barata descartada` y `concentración en un proveedor` a ensanchamiento (Fase 7) o trabajo futuro.
