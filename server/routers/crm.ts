import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente, getClientesStats, logActividad } from "../db";
import { notifyOwner } from "../_core/notification";

export const crmRouter = router({
  list: protectedProcedure
    .input(z.object({
      tipo: z.string().optional(),
      provincia: z.string().optional(),
      ccaa: z.string().optional(),
      estado: z.string().optional(),
      prioridad: z.string().optional(),
      busqueda: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return getClientes(input);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getClienteById(input.id);
    }),

  stats: protectedProcedure.query(async () => {
    return getClientesStats();
  }),

  create: protectedProcedure
    .input(z.object({
      nombre: z.string().min(1),
      empresa: z.string().optional(),
      email: z.string().optional(),
      telefono: z.string().optional(),
      web: z.string().optional(),
      tipoCliente: z.enum(["comprador_5_7", "comprador_20_21", "comprador_cebo", "matadero", "intermediario", "otro"]).default("otro"),
      estado: z.enum(["nuevo", "contactado", "propuesta_enviada", "negociacion", "cerrado_ganado", "cerrado_perdido"]).default("nuevo"),
      prioridad: z.enum(["alta", "media", "baja"]).default("media"),
      preferente: z.number().default(0),
      ccaa: z.string().optional(),
      provincia: z.string().optional(),
      municipio: z.string().optional(),
      especialidad: z.string().optional(),
      volumenHabitual: z.string().optional(),
      origenCliente: z.string().optional(),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await createCliente(input);
      await logActividad({
        tipo: "cliente_creado",
        descripcion: `Nuevo cliente/lead: "${input.nombre}" (${input.tipoCliente})`,
        modulo: "crm",
        userId: ctx.user.id,
      });
      // Notify owner of new lead
      try {
        await notifyOwner({
          title: "🐷 Nuevo Lead en VentiPro",
          content: `Se ha registrado un nuevo lead: ${input.nombre} (${input.empresa || "Sin empresa"}) - Tipo: ${input.tipoCliente} - Provincia: ${input.provincia || "No especificada"}`,
        });
      } catch (e) {
        console.warn("Failed to notify owner of new lead:", e);
      }
      return result;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nombre: z.string().min(1).optional(),
      empresa: z.string().optional(),
      email: z.string().optional(),
      telefono: z.string().optional(),
      web: z.string().optional(),
      tipoCliente: z.enum(["comprador_5_7", "comprador_20_21", "comprador_cebo", "matadero", "intermediario", "otro"]).optional(),
      estado: z.enum(["nuevo", "contactado", "propuesta_enviada", "negociacion", "cerrado_ganado", "cerrado_perdido"]).optional(),
      prioridad: z.enum(["alta", "media", "baja"]).optional(),
      preferente: z.number().optional(),
      ccaa: z.string().optional(),
      provincia: z.string().optional(),
      municipio: z.string().optional(),
      especialidad: z.string().optional(),
      volumenHabitual: z.string().optional(),
      origenCliente: z.string().optional(),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateCliente(id, data);
      await logActividad({
        tipo: "cliente_actualizado",
        descripcion: `Cliente ID ${id} actualizado`,
        modulo: "crm",
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteCliente(input.id);
      await logActividad({
        tipo: "cliente_eliminado",
        descripcion: `Cliente ID ${input.id} eliminado`,
        modulo: "crm",
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  importCsv: protectedProcedure
    .input(z.object({
      clientes: z.array(z.object({
        nombre: z.string().min(1),
        empresa: z.string().optional(),
        email: z.string().optional(),
        telefono: z.string().optional(),
        web: z.string().optional(),
        tipoCliente: z.enum(["comprador_5_7", "comprador_20_21", "comprador_cebo", "matadero", "intermediario", "otro"]).default("otro"),
        prioridad: z.enum(["alta", "media", "baja"]).default("media"),
        ccaa: z.string().optional(),
        provincia: z.string().optional(),
        municipio: z.string().optional(),
        especialidad: z.string().optional(),
        origenCliente: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      let imported = 0;
      for (const cliente of input.clientes) {
        await createCliente({ ...cliente, estado: "nuevo" });
        imported++;
      }
      await logActividad({
        tipo: "csv_importado",
        descripcion: `Importados ${imported} clientes/leads desde CSV`,
        modulo: "crm",
        userId: ctx.user.id,
      });
      return { imported };
    }),
});
