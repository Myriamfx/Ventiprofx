import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { verifyPassword } from "./_core/password";
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

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // verify credentials against database
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }
        if (!verifyPassword(input.password, user.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        // issue session and set cookie (same logic as OAuth callback)
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        // update lastSignedIn timestamp
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

        return { success: true } as const;
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (user) {
          // In a real app we'd generate a time-limited token and email it.
          console.log("[Auth] password reset requested for", input.email);
        }
        return { success: true } as const;
      }),

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
