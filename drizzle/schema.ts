import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

// ============================================================
// USERS TABLE (core auth)
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  // password hash stored for local authentication (SHA256 hex or similar). nullable for OAuth-only users.
  passwordHash: varchar("passwordHash", { length: 256 }).default(null),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// CENTROS (Cría en Aragón / Engorde en Soria)
// ============================================================
export const centros = mysqlTable("centros", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  tipo: mysqlEnum("tipo", ["cria", "engorde"]).notNull(),
  ubicacion: varchar("ubicacion", { length: 200 }).notNull(),
  provincia: varchar("provincia", { length: 100 }).notNull(),
  ccaa: varchar("ccaa", { length: 100 }).notNull(),
  plazasTotales: int("plazasTotales").notNull().default(0),
  plazasOcupadas: int("plazasOcupadas").notNull().default(0),
  descripcion: text("descripcion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Centro = typeof centros.$inferSelect;
export type InsertCentro = typeof centros.$inferInsert;

// ============================================================
// LOTES
// ============================================================
export const lotes = mysqlTable("lotes", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 50 }).notNull(),
  centroId: int("centroId").notNull(),
  numAnimales: int("numAnimales").notNull(),
  numBajas: int("numBajas").notNull().default(0),
  pesoActual: decimal("pesoActual", { precision: 8, scale: 2 }).notNull().default("0"),
  pesoObjetivo: decimal("pesoObjetivo", { precision: 8, scale: 2 }),
  calidad: mysqlEnum("calidad", ["alta", "media", "baja"]).default("media").notNull(),
  fase: mysqlEnum("fase", ["lactancia", "transicion", "cebo", "vendido"]).default("lactancia").notNull(),
  fechaNacimiento: timestamp("fechaNacimiento"),
  fechaDestete: timestamp("fechaDestete"),
  fechaEntradaCebo: timestamp("fechaEntradaCebo"),
  fechaVentaPrevista: timestamp("fechaVentaPrevista"),
  escenarioSeleccionado: mysqlEnum("escenarioSeleccionado", ["5-7kg", "20-21kg", "cebo"]),
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lote = typeof lotes.$inferSelect;
export type InsertLote = typeof lotes.$inferInsert;

// ============================================================
// PARÁMETROS ECONÓMICOS (configurables por el usuario)
// ============================================================
export const parametrosEconomicos = mysqlTable("parametros_economicos", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  // Precios de venta por kg
  precioVenta5_7: decimal("precioVenta5_7", { precision: 8, scale: 2 }).notNull().default("3.50"),
  precioVenta20_21: decimal("precioVenta20_21", { precision: 8, scale: 2 }).notNull().default("2.80"),
  precioVentaCebo: decimal("precioVentaCebo", { precision: 8, scale: 2 }).notNull().default("1.45"),
  // Costes variables por animal
  costePienso5_7: decimal("costePienso5_7", { precision: 8, scale: 2 }).notNull().default("8.50"),
  costePienso20_21: decimal("costePienso20_21", { precision: 8, scale: 2 }).notNull().default("22.00"),
  costePiensoCebo: decimal("costePiensoCebo", { precision: 8, scale: 2 }).notNull().default("95.00"),
  costeSanidad5_7: decimal("costeSanidad5_7", { precision: 8, scale: 2 }).notNull().default("1.50"),
  costeSanidad20_21: decimal("costeSanidad20_21", { precision: 8, scale: 2 }).notNull().default("3.00"),
  costeSanidadCebo: decimal("costeSanidadCebo", { precision: 8, scale: 2 }).notNull().default("5.50"),
  // Mortalidad %
  mortalidad5_7: decimal("mortalidad5_7", { precision: 5, scale: 2 }).notNull().default("8.00"),
  mortalidad20_21: decimal("mortalidad20_21", { precision: 5, scale: 2 }).notNull().default("3.00"),
  mortalidadCebo: decimal("mortalidadCebo", { precision: 5, scale: 2 }).notNull().default("2.00"),
  // Costes fijos mensuales
  costeManoObra: decimal("costeManoObra", { precision: 10, scale: 2 }).notNull().default("3500.00"),
  costeEnergia: decimal("costeEnergia", { precision: 10, scale: 2 }).notNull().default("1200.00"),
  costeAmortizacion: decimal("costeAmortizacion", { precision: 10, scale: 2 }).notNull().default("800.00"),
  costePurines: decimal("costePurines", { precision: 10, scale: 2 }).notNull().default("400.00"),
  // Índice de conversión
  indicConversion5_7: decimal("indicConversion5_7", { precision: 5, scale: 2 }).notNull().default("1.80"),
  indicConversion20_21: decimal("indicConversion20_21", { precision: 5, scale: 2 }).notNull().default("2.20"),
  indicConversionCebo: decimal("indicConversionCebo", { precision: 5, scale: 2 }).notNull().default("2.80"),
  // Días de estancia por fase
  diasEstancia5_7: int("diasEstancia5_7").notNull().default(28),
  diasEstancia20_21: int("diasEstancia20_21").notNull().default(65),
  diasEstanciaCebo: int("diasEstanciaCebo").notNull().default(160),
  activo: int("activo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParametrosEconomicos = typeof parametrosEconomicos.$inferSelect;
export type InsertParametrosEconomicos = typeof parametrosEconomicos.$inferInsert;

// ============================================================
// CLIENTES / LEADS (CRM)
// ============================================================
export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  empresa: varchar("empresa", { length: 200 }),
  email: varchar("email", { length: 320 }),
  telefono: varchar("telefono", { length: 30 }),
  web: varchar("web", { length: 500 }),
  tipoCliente: mysqlEnum("tipoCliente", ["comprador_5_7", "comprador_20_21", "comprador_cebo", "matadero", "intermediario", "otro"]).default("otro").notNull(),
  estado: mysqlEnum("estado", ["nuevo", "contactado", "propuesta_enviada", "negociacion", "cerrado_ganado", "cerrado_perdido"]).default("nuevo").notNull(),
  prioridad: mysqlEnum("prioridad", ["alta", "media", "baja"]).default("media").notNull(),
  preferente: int("preferente").notNull().default(0),
  // Segmentación geográfica
  ccaa: varchar("ccaa", { length: 100 }),
  provincia: varchar("provincia", { length: 100 }),
  municipio: varchar("municipio", { length: 200 }),
  especialidad: varchar("especialidad", { length: 200 }),
  volumenHabitual: varchar("volumenHabitual", { length: 100 }),
  origenCliente: varchar("origenCliente", { length: 200 }),
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

// ============================================================
// OFERTAS COMERCIALES
// ============================================================
export const ofertas = mysqlTable("ofertas", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 50 }).notNull(),
  loteId: int("loteId"),
  clienteId: int("clienteId").notNull(),
  escenario: mysqlEnum("escenario", ["5-7kg", "20-21kg", "cebo"]).notNull(),
  numAnimales: int("numAnimales").notNull(),
  pesoEstimado: decimal("pesoEstimado", { precision: 8, scale: 2 }).notNull(),
  precioKg: decimal("precioKg", { precision: 8, scale: 2 }).notNull(),
  precioTotal: decimal("precioTotal", { precision: 12, scale: 2 }).notNull(),
  fechaDisponibilidad: timestamp("fechaDisponibilidad"),
  condiciones: text("condiciones"),
  textoOferta: text("textoOferta"),
  estado: mysqlEnum("estado", ["borrador", "enviada", "aceptada", "rechazada", "expirada"]).default("borrador").notNull(),
  pdfUrl: varchar("pdfUrl", { length: 1000 }),
  pdfKey: varchar("pdfKey", { length: 500 }),
  emailEnviado: int("emailEnviado").notNull().default(0),
  fechaEnvio: timestamp("fechaEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Oferta = typeof ofertas.$inferSelect;
export type InsertOferta = typeof ofertas.$inferInsert;

// ============================================================
// REGISTRO DE ACTIVIDAD (para Kit Digital)
// ============================================================
export const actividadLog = mysqlTable("actividad_log", {
  id: int("id").autoincrement().primaryKey(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  descripcion: text("descripcion").notNull(),
  modulo: varchar("modulo", { length: 100 }).notNull(),
  metadata: json("metadata"),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActividadLog = typeof actividadLog.$inferSelect;
export type InsertActividadLog = typeof actividadLog.$inferInsert;

// ============================================================
// HISTORIAL DE CÁLCULOS DE RENTABILIDAD
// ============================================================
export const historialCalculos = mysqlTable("historial_calculos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loteId: int("loteId"),
  codigoLote: varchar("codigoLote", { length: 50 }),
  numAnimales: int("numAnimales").notNull(),
  usaCostesEstimados: int("usaCostesEstimados").notNull().default(1),
  // Escenario 5-7kg
  e57_precioKg: decimal("e57_precioKg", { precision: 8, scale: 4 }),
  e57_ingresosPorAnimal: decimal("e57_ingresosPorAnimal", { precision: 10, scale: 2 }),
  e57_costeTotalPorAnimal: decimal("e57_costeTotalPorAnimal", { precision: 10, scale: 2 }),
  e57_margenPorAnimal: decimal("e57_margenPorAnimal", { precision: 10, scale: 2 }),
  e57_margenTotal: decimal("e57_margenTotal", { precision: 12, scale: 2 }),
  e57_margenPorPlazaDia: decimal("e57_margenPorPlazaDia", { precision: 8, scale: 4 }),
  e57_rentabilidadPct: decimal("e57_rentabilidadPct", { precision: 8, scale: 2 }),
  e57_mortalidadPct: decimal("e57_mortalidadPct", { precision: 5, scale: 2 }),
  e57_viable: int("e57_viable").notNull().default(1),
  // Escenario 20-21kg
  e2021_precioKg: decimal("e2021_precioKg", { precision: 8, scale: 4 }),
  e2021_ingresosPorAnimal: decimal("e2021_ingresosPorAnimal", { precision: 10, scale: 2 }),
  e2021_costeTotalPorAnimal: decimal("e2021_costeTotalPorAnimal", { precision: 10, scale: 2 }),
  e2021_margenPorAnimal: decimal("e2021_margenPorAnimal", { precision: 10, scale: 2 }),
  e2021_margenTotal: decimal("e2021_margenTotal", { precision: 12, scale: 2 }),
  e2021_margenPorPlazaDia: decimal("e2021_margenPorPlazaDia", { precision: 8, scale: 4 }),
  e2021_rentabilidadPct: decimal("e2021_rentabilidadPct", { precision: 8, scale: 2 }),
  e2021_mortalidadPct: decimal("e2021_mortalidadPct", { precision: 5, scale: 2 }),
  e2021_viable: int("e2021_viable").notNull().default(1),
  // Escenario cebo
  eCebo_precioKg: decimal("eCebo_precioKg", { precision: 8, scale: 4 }),
  eCebo_ingresosPorAnimal: decimal("eCebo_ingresosPorAnimal", { precision: 10, scale: 2 }),
  eCebo_costeTotalPorAnimal: decimal("eCebo_costeTotalPorAnimal", { precision: 10, scale: 2 }),
  eCebo_margenPorAnimal: decimal("eCebo_margenPorAnimal", { precision: 10, scale: 2 }),
  eCebo_margenTotal: decimal("eCebo_margenTotal", { precision: 12, scale: 2 }),
  eCebo_margenPorPlazaDia: decimal("eCebo_margenPorPlazaDia", { precision: 8, scale: 4 }),
  eCebo_rentabilidadPct: decimal("eCebo_rentabilidadPct", { precision: 8, scale: 2 }),
  eCebo_mortalidadPct: decimal("eCebo_mortalidadPct", { precision: 5, scale: 2 }),
  eCebo_viable: int("eCebo_viable").notNull().default(1),
  // Recomendación
  escenarioRecomendado: varchar("escenarioRecomendado", { length: 20 }),
  confianzaRecomendacion: decimal("confianzaRecomendacion", { precision: 3, scale: 2 }),
  // Precios de mercado en el momento del cálculo
  precioMercadoCebado: decimal("precioMercadoCebado", { precision: 8, scale: 4 }),
  precioMercadoLechon20: decimal("precioMercadoLechon20", { precision: 8, scale: 2 }),
  precioMercadoLechon7: decimal("precioMercadoLechon7", { precision: 8, scale: 4 }),
  precioMercadoPienso: decimal("precioMercadoPienso", { precision: 8, scale: 2 }),
  // Metadata
  notas: text("notas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistorialCalculo = typeof historialCalculos.$inferSelect;
export type InsertHistorialCalculo = typeof historialCalculos.$inferInsert;
