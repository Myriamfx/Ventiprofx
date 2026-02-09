import { eq, desc, sql, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  centros, InsertCentro,
  lotes, InsertLote,
  parametrosEconomicos, InsertParametrosEconomicos,
  clientes, InsertCliente,
  ofertas, InsertOferta,
  actividadLog, InsertActividadLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USERS
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// CENTROS
// ============================================================
export async function getCentros() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(centros).orderBy(centros.nombre);
}

export async function getCentroById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(centros).where(eq(centros.id, id)).limit(1);
  return result[0];
}

export async function createCentro(data: InsertCentro) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(centros).values(data);
  return { id: result[0].insertId };
}

export async function updateCentro(id: number, data: Partial<InsertCentro>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(centros).set(data).where(eq(centros.id, id));
}

export async function deleteCentro(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(centros).where(eq(centros.id, id));
}

// ============================================================
// LOTES
// ============================================================
export async function getLotes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lotes).orderBy(desc(lotes.createdAt));
}

export async function getLoteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lotes).where(eq(lotes.id, id)).limit(1);
  return result[0];
}

export async function createLote(data: InsertLote) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(lotes).values(data);
  return { id: result[0].insertId };
}

export async function updateLote(id: number, data: Partial<InsertLote>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(lotes).set(data).where(eq(lotes.id, id));
}

export async function deleteLote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(lotes).where(eq(lotes.id, id));
}

// ============================================================
// PARÁMETROS ECONÓMICOS
// ============================================================
export async function getParametrosActivos() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(parametrosEconomicos).where(eq(parametrosEconomicos.activo, 1)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllParametros() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parametrosEconomicos).orderBy(desc(parametrosEconomicos.createdAt));
}

export async function createParametros(data: InsertParametrosEconomicos) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Desactivar los anteriores
  await db.update(parametrosEconomicos).set({ activo: 0 }).where(eq(parametrosEconomicos.activo, 1));
  const result = await db.insert(parametrosEconomicos).values({ ...data, activo: 1 });
  return { id: result[0].insertId };
}

export async function updateParametros(id: number, data: Partial<InsertParametrosEconomicos>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(parametrosEconomicos).set(data).where(eq(parametrosEconomicos.id, id));
}

// ============================================================
// CLIENTES / CRM
// ============================================================
export async function getClientes(filters?: { tipo?: string; provincia?: string; ccaa?: string; estado?: string; prioridad?: string; busqueda?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.tipo && filters.tipo !== "todos") conditions.push(eq(clientes.tipoCliente, filters.tipo as any));
  if (filters?.provincia) conditions.push(eq(clientes.provincia, filters.provincia));
  if (filters?.ccaa) conditions.push(eq(clientes.ccaa, filters.ccaa));
  if (filters?.estado && filters.estado !== "todos") conditions.push(eq(clientes.estado, filters.estado as any));
  if (filters?.prioridad && filters.prioridad !== "todos") conditions.push(eq(clientes.prioridad, filters.prioridad as any));
  if (filters?.busqueda) conditions.push(like(clientes.nombre, `%${filters.busqueda}%`));

  if (conditions.length > 0) {
    return db.select().from(clientes).where(and(...conditions)).orderBy(desc(clientes.createdAt));
  }
  return db.select().from(clientes).orderBy(desc(clientes.createdAt));
}

export async function getClienteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result[0];
}

export async function createCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clientes).values(data);
  return { id: result[0].insertId };
}

export async function updateCliente(id: number, data: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clientes).set(data).where(eq(clientes.id, id));
}

export async function deleteCliente(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(clientes).where(eq(clientes.id, id));
}

export async function getClientesStats() {
  const db = await getDb();
  if (!db) return { total: 0, nuevos: 0, contactados: 0, propuestas: 0, cerrados: 0 };
  const all = await db.select().from(clientes);
  return {
    total: all.length,
    nuevos: all.filter(c => c.estado === "nuevo").length,
    contactados: all.filter(c => c.estado === "contactado").length,
    propuestas: all.filter(c => c.estado === "propuesta_enviada").length,
    cerrados: all.filter(c => c.estado === "cerrado_ganado").length,
  };
}

// ============================================================
// OFERTAS
// ============================================================
export async function getOfertas() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ofertas).orderBy(desc(ofertas.createdAt));
}

export async function getOfertaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ofertas).where(eq(ofertas.id, id)).limit(1);
  return result[0];
}

export async function createOferta(data: InsertOferta) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(ofertas).values(data);
  return { id: result[0].insertId };
}

export async function updateOferta(id: number, data: Partial<InsertOferta>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(ofertas).set(data).where(eq(ofertas.id, id));
}

export async function deleteOferta(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(ofertas).where(eq(ofertas.id, id));
}

export async function getOfertasByCliente(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ofertas).where(eq(ofertas.clienteId, clienteId)).orderBy(desc(ofertas.createdAt));
}

export async function getOfertasByLote(loteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ofertas).where(eq(ofertas.loteId, loteId)).orderBy(desc(ofertas.createdAt));
}

// ============================================================
// ACTIVIDAD LOG (Kit Digital)
// ============================================================
export async function logActividad(data: InsertActividadLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(actividadLog).values(data);
}

export async function getActividadLog(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(actividadLog).orderBy(desc(actividadLog.createdAt)).limit(limit);
}

export async function getActividadStats() {
  const db = await getDb();
  if (!db) return { total: 0, porModulo: {} };
  const all = await db.select().from(actividadLog);
  const porModulo: Record<string, number> = {};
  all.forEach(a => {
    porModulo[a.modulo] = (porModulo[a.modulo] || 0) + 1;
  });
  return { total: all.length, porModulo };
}
