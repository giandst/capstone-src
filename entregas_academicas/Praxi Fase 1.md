## Slide 1

PRAXI

Plataforma de apoyo al Modelo de Prevención del Delito

Proyecto APT · Ingeniería en Informática · Duoc UC, San Joaquín

Nicolás Reyes  ·  Gianluca De Sinis-Tudor  ·  Gerald Quinenao

## Slide 2

EL PROBLEMA

Un modelo de papel no protege a nadie

Bajo las Leyes 20.393 y 21.595, la defensa de una organización chilena depende de tener un Modelo de Prevención del Delito implementado y efectivo, no solo escrito.

¿Estaba operando el control?

Meses después, el encargado de cumplimiento no puede probar que un control funcionaba durante el período auditado.

¿Quién revisó qué?

No hay registro claro de responsables ni de revisiones sobre lo que el control produjo.

¿Qué se decidió pese a la alerta?

Las decisiones tomadas a pesar de una advertencia no quedan documentadas ni justificadas.

## Slide 3

LA SOLUCIÓN

Un motor de controles, no un dashboard

Eventos

→

Señales

→

Controles

→

Alerta

(score + explicación)

→

Decisión

humana

- Eventos: actividad organizacional (una compra, un pago).
- Señales: detectores reutilizables --- intrínsecas (fraccionamiento, autoaprobación) y relacionales (proveedor recién constituido, PEP).
- Controles: composición ponderada de señales, ligada a un delito; puntúan 0--1 en probabilidad baja / media / alta.
- El score nunca se entrega solo: siempre viene con el detalle de qué señal disparó y cuánto aportó.

## Slide 4

DIFERENCIADOR

Un control se define una vez, se lee tres veces

Motor de ejecución

El engine consume la definición del control como datos y la ejecuta sobre los eventos.

Ficha del control

La misma definición se renderiza como documento legible para el auditor externo.

Interfaz de autoría

El encargado de cumplimiento puede crear o ajustar un control sin escribir código.

Agregar un nuevo delito es configuración, no desarrollo: eso es lo que hace realista construir un prototipo funcional en un semestre.

## Slide 5

USUARIOS

A quién sirve Praxi

Encargado de cumplimiento

Usuario principal. Necesita ver qué se disparó y por qué, actuar, y dejar un rastro defendible detrás de cada decisión.

Auditor externo

No opera el flujo, pero es el lector para quien se escriben la ficha del control y la trazabilidad.

Panel evaluador APT

Evalúa si los requerimientos fueron bien derivados, si la arquitectura se sostiene y si la evaluación prueba algo.

## Slide 6

CÓMO SE CONSTRUYE

Metodología y stack tecnológico

5 etapas de trabajo

- Investigación y levantamiento de requerimientos
- Diseño de la solución tecnológica
- Desarrollo e implementación (backend / frontend / integración)
- Implementación del análisis predictivo y validación
- Documentación final y presentación

Stack técnico

- React + TanStack Router --- apps/web
- Hono + tRPC --- apps/server, packages/api
- Drizzle ORM sobre SQLite / Turso --- packages/db
- Better-Auth --- packages/auth
- shadcn/ui compartido --- packages/ui
- Monorepo Bun + Turborepo, Biome (lint/format)

## Slide 7

ALCANCE DEL SEMESTRE

Qué entra y qué queda como trabajo futuro

En esta versión

- Motor de controles (eventos → señales → controles → score explicado)
- Flujo del encargado: revisar, verificar, descartar, escalar, cierre con justificación
- Ficha del control legible para auditoría
- Ingesta de datos vía CSV
- Autoría de controles sin código
- Dataset sintético con casos plantados y verdad conocida

Trabajo futuro

- Canal de denuncias completo
- Integración real con ERP
- Enriquecimiento multi-fuente y monitoreo continuo
- Priorización con machine learning
- Multi-tenant y enforcement de bloqueo

## Slide 8

Lo que demuestra el prototipo

- Se sube un CSV de compras con una narrativa plantada.
- Aparece un caso; se abre la alerta y se ve qué señales dispararon y por qué.
- Se recorre el flujo del encargado hasta el cierre con justificación.
- Se autoría un nuevo control en vivo, sin tocar código, y al re-ejecutar el mismo CSV aparece un caso distinto.

El detalle que convence al panel es la explicación, no la detección.
