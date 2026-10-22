import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// 1. EVENTO: El dato crudo (compra, transferencia) que incluye el enriquecimiento
export const evento = sqliteTable("evento", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull(), // 'compra', 'pago', 'transferencia'
  monto: real("monto").notNull(),
  fecha: integer("fecha", { mode: "timestamp" }).notNull(),
  
  // Entidades (RUT es la llave según el build-order)
  rutProveedor: text("rut_proveedor").notNull(),
  nombreProveedor: text("nombre_proveedor").notNull(),
  rutSolicitante: text("rut_solicitante").notNull(),
  nombreSolicitante: text("nombre_solicitante").notNull(),
  
  // Columnas de Enriquecimiento (como pide el alcance para no depender de APIs externas)
  fechaConstitucionProveedor: integer("fecha_constitucion_proveedor", { mode: "timestamp" }),
  flagPep: integer("flag_pep", { mode: "boolean" }).default(false),
  causasJudiciales: integer("causas_judiciales").default(0),
  
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// 2. CONTROL: Definición declarativa de las reglas
export const control = sqliteTable("control", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  delito: text("delito").notNull(), // ej: 'corrupción entre particulares'
  eventoTipo: text("evento_tipo").notNull(), // ej: 'compra'
  configuracion: text("configuracion", { mode: "json" }).notNull(), // JSON con pesos y umbrales
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// 3. ALERTA: Resultado del motor de controles (incluye la explicabilidad obligatoria)
export const alerta = sqliteTable("alerta", {
  id: text("id").primaryKey(),
  eventoId: text("evento_id").notNull().references(() => evento.id),
  controlId: text("control_id").notNull().references(() => control.id),
  score: real("score").notNull(),
  breakdown: text("breakdown", { mode: "json" }).notNull(), // Array JSON con el detalle de las señales que se dispararon
  estado: text("estado").notNull().default('abierta'), // 'abierta', 'descartada', 'promovida_a_caso'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// 4. CASO: Flujo del encargado de cumplimiento (El cierre con justificación es la evidencia clave)
export const caso = sqliteTable("caso", {
  id: text("id").primaryKey(),
  alertaId: text("alerta_id").notNull().references(() => alerta.id),
  estado: text("estado").notNull().default('investigacion'), // 'investigacion', 'cerrado'
  justificacion: text("justificacion"), // Obligatorio al cerrar
  encargadoId: text("encargado_id"), // Quién tomó la decisión
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});
