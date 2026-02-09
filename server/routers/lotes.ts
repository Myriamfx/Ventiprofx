import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getLotes, getLoteById, createLote, updateLote, deleteLote, logActividad } from "../db";

export const lotesRouter = router({
  list: protectedProcedure.query(async () => {
    return getLotes();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getLoteById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      codigo: z.string().min(1),
      centroId: z.number(),
      numAnimales: z.number().min(1),
      numBajas: z.number().min(0).default(0),
      pesoActual: z.string().default("0"),
      pesoObjetivo: z.string().optional(),
      calidad: z.enum(["alta", "media", "baja"]).default("media"),
      fase: z.enum(["lactancia", "transicion", "cebo", "vendido"]).default("lactancia"),
      fechaNacimiento: z.date().optional(),
      fechaDestete: z.date().optional(),
      fechaEntradaCebo: z.date().optional(),
      fechaVentaPrevista: z.date().optional(),
      escenarioSeleccionado: z.enum(["5-7kg", "20-21kg", "cebo"]).optional(),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await createLote(input);
      await logActividad({
        tipo: "lote_creado",
        descripcion: `Lote "${input.codigo}" creado con ${input.numAnimales} animales`,
        modulo: "lotes",
        userId: ctx.user.id,
      });
      return result;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      codigo: z.string().min(1).optional(),
      centroId: z.number().optional(),
      numAnimales: z.number().min(1).optional(),
      numBajas: z.number().min(0).optional(),
      pesoActual: z.string().optional(),
      pesoObjetivo: z.string().optional(),
      calidad: z.enum(["alta", "media", "baja"]).optional(),
      fase: z.enum(["lactancia", "transicion", "cebo", "vendido"]).optional(),
      fechaNacimiento: z.date().optional(),
      fechaDestete: z.date().optional(),
      fechaEntradaCebo: z.date().optional(),
      fechaVentaPrevista: z.date().optional(),
      escenarioSeleccionado: z.enum(["5-7kg", "20-21kg", "cebo"]).optional(),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateLote(id, data);
      await logActividad({
        tipo: "lote_actualizado",
        descripcion: `Lote ID ${id} actualizado`,
        modulo: "lotes",
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteLote(input.id);
      await logActividad({
        tipo: "lote_eliminado",
        descripcion: `Lote ID ${input.id} eliminado`,
        modulo: "lotes",
        userId: ctx.user.id,
      });
      return { success: true };
    }),
});
