import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getCentros, getCentroById, createCentro, updateCentro, deleteCentro, logActividad } from "../db";

export const centrosRouter = router({
  list: protectedProcedure.query(async () => {
    return getCentros();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getCentroById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      nombre: z.string().min(1),
      tipo: z.enum(["cria", "engorde"]),
      ubicacion: z.string().min(1),
      provincia: z.string().min(1),
      ccaa: z.string().min(1),
      plazasTotales: z.number().min(0),
      plazasOcupadas: z.number().min(0).default(0),
      descripcion: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await createCentro(input);
      await logActividad({
        tipo: "centro_creado",
        descripcion: `Centro "${input.nombre}" creado (${input.tipo})`,
        modulo: "centros",
        userId: ctx.user.id,
      });
      return result;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nombre: z.string().min(1).optional(),
      tipo: z.enum(["cria", "engorde"]).optional(),
      ubicacion: z.string().min(1).optional(),
      provincia: z.string().min(1).optional(),
      ccaa: z.string().min(1).optional(),
      plazasTotales: z.number().min(0).optional(),
      plazasOcupadas: z.number().min(0).optional(),
      descripcion: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateCentro(id, data);
      await logActividad({
        tipo: "centro_actualizado",
        descripcion: `Centro ID ${id} actualizado`,
        modulo: "centros",
        userId: ctx.user.id,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteCentro(input.id);
      await logActividad({
        tipo: "centro_eliminado",
        descripcion: `Centro ID ${input.id} eliminado`,
        modulo: "centros",
        userId: ctx.user.id,
      });
      return { success: true };
    }),
});
