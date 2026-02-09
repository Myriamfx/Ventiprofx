import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { centrosRouter } from "./routers/centros";
import { lotesRouter } from "./routers/lotes";
import { calculadoraRouter } from "./routers/calculadora";
import { crmRouter } from "./routers/crm";
import { ofertasRouter } from "./routers/ofertas";
import { actividadRouter } from "./routers/actividad";
import { mercadoRouter } from "./routers/mercado";
import { analisisRouter } from "./routers/analisis";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Feature routers
  centros: centrosRouter,
  lotes: lotesRouter,
  calculadora: calculadoraRouter,
  crm: crmRouter,
  ofertas: ofertasRouter,
  actividad: actividadRouter,
  mercado: mercadoRouter,
  analisis: analisisRouter,
});

export type AppRouter = typeof appRouter;
