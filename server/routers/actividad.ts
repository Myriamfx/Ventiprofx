import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getActividadLog, getActividadStats } from "../db";

export const actividadRouter = router({
  log: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(async ({ input }) => {
      return getActividadLog(input?.limit ?? 50);
    }),

  stats: protectedProcedure.query(async () => {
    return getActividadStats();
  }),
});
