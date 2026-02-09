import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createHistorialCalculo, getHistorialCalculos, getHistorialStats, logActividad } from "../db";

export const analisisRouter = router({
  // Guardar un cálculo en el historial
  guardarCalculo: protectedProcedure
    .input(z.object({
      loteId: z.number().optional(),
      codigoLote: z.string().optional(),
      numAnimales: z.number(),
      usaCostesEstimados: z.boolean(),
      escenarios: z.array(z.object({
        escenario: z.string(),
        precioKg: z.number(),
        ingresosPorAnimal: z.number(),
        costeTotalPorAnimal: z.number(),
        margenPorAnimal: z.number(),
        margenTotal: z.number(),
        margenPorPlazaDia: z.number(),
        rentabilidadPct: z.number(),
        mortalidadPct: z.number(),
        viable: z.boolean(),
      })),
      escenarioRecomendado: z.string().optional(),
      confianzaRecomendacion: z.number().optional(),
      preciosMercado: z.object({
        cebado: z.number().optional(),
        lechon20: z.number().optional(),
        lechon7: z.number().optional(),
        pienso: z.number().optional(),
      }).optional(),
      notas: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const e57 = input.escenarios.find(e => e.escenario === "5-7kg");
      const e2021 = input.escenarios.find(e => e.escenario === "20-21kg");
      const eCebo = input.escenarios.find(e => e.escenario === "cebo");

      const data = {
        userId: ctx.user.id,
        loteId: input.loteId || null,
        codigoLote: input.codigoLote || null,
        numAnimales: input.numAnimales,
        usaCostesEstimados: input.usaCostesEstimados ? 1 : 0,
        // 5-7kg
        e57_precioKg: e57?.precioKg?.toString() || null,
        e57_ingresosPorAnimal: e57?.ingresosPorAnimal?.toString() || null,
        e57_costeTotalPorAnimal: e57?.costeTotalPorAnimal?.toString() || null,
        e57_margenPorAnimal: e57?.margenPorAnimal?.toString() || null,
        e57_margenTotal: e57?.margenTotal?.toString() || null,
        e57_margenPorPlazaDia: e57?.margenPorPlazaDia?.toString() || null,
        e57_rentabilidadPct: e57?.rentabilidadPct?.toString() || null,
        e57_mortalidadPct: e57?.mortalidadPct?.toString() || null,
        e57_viable: e57?.viable ? 1 : 0,
        // 20-21kg
        e2021_precioKg: e2021?.precioKg?.toString() || null,
        e2021_ingresosPorAnimal: e2021?.ingresosPorAnimal?.toString() || null,
        e2021_costeTotalPorAnimal: e2021?.costeTotalPorAnimal?.toString() || null,
        e2021_margenPorAnimal: e2021?.margenPorAnimal?.toString() || null,
        e2021_margenTotal: e2021?.margenTotal?.toString() || null,
        e2021_margenPorPlazaDia: e2021?.margenPorPlazaDia?.toString() || null,
        e2021_rentabilidadPct: e2021?.rentabilidadPct?.toString() || null,
        e2021_mortalidadPct: e2021?.mortalidadPct?.toString() || null,
        e2021_viable: e2021?.viable ? 1 : 0,
        // Cebo
        eCebo_precioKg: eCebo?.precioKg?.toString() || null,
        eCebo_ingresosPorAnimal: eCebo?.ingresosPorAnimal?.toString() || null,
        eCebo_costeTotalPorAnimal: eCebo?.costeTotalPorAnimal?.toString() || null,
        eCebo_margenPorAnimal: eCebo?.margenPorAnimal?.toString() || null,
        eCebo_margenTotal: eCebo?.margenTotal?.toString() || null,
        eCebo_margenPorPlazaDia: eCebo?.margenPorPlazaDia?.toString() || null,
        eCebo_rentabilidadPct: eCebo?.rentabilidadPct?.toString() || null,
        eCebo_mortalidadPct: eCebo?.mortalidadPct?.toString() || null,
        eCebo_viable: eCebo?.viable ? 1 : 0,
        // Recomendación
        escenarioRecomendado: input.escenarioRecomendado || null,
        confianzaRecomendacion: input.confianzaRecomendacion?.toString() || null,
        // Precios de mercado
        precioMercadoCebado: input.preciosMercado?.cebado?.toString() || null,
        precioMercadoLechon20: input.preciosMercado?.lechon20?.toString() || null,
        precioMercadoLechon7: input.preciosMercado?.lechon7?.toString() || null,
        precioMercadoPienso: input.preciosMercado?.pienso?.toString() || null,
        notas: input.notas || null,
      };

      const result = await createHistorialCalculo(data as any);

      await logActividad({
        tipo: "calculo_guardado_historial",
        descripcion: `Cálculo guardado en historial: ${input.numAnimales} animales, recomendado: ${input.escenarioRecomendado || "N/A"}`,
        modulo: "analisis",
        userId: ctx.user.id,
      });

      return result;
    }),

  // Obtener historial de cálculos con filtros
  historial: protectedProcedure
    .input(z.object({
      escenarioRecomendado: z.string().optional(),
      fechaDesde: z.string().optional(),
      fechaHasta: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const filters: any = { userId: ctx.user.id };
      if (input?.escenarioRecomendado && input.escenarioRecomendado !== "todos") {
        filters.escenarioRecomendado = input.escenarioRecomendado;
      }
      if (input?.fechaDesde) filters.fechaDesde = new Date(input.fechaDesde);
      if (input?.fechaHasta) filters.fechaHasta = new Date(input.fechaHasta);
      if (input?.limit) filters.limit = input.limit;
      return getHistorialCalculos(filters);
    }),

  // Obtener estadísticas del historial
  stats: protectedProcedure.query(async ({ ctx }) => {
    return getHistorialStats(ctx.user.id);
  }),

  // Obtener datos para gráficos de evolución temporal
  evolucionTemporal: protectedProcedure
    .input(z.object({
      meses: z.number().default(6),
      metrica: z.enum(["margenTotal", "margenPorAnimal", "margenPorPlazaDia", "rentabilidadPct", "precioKg"]).default("margenTotal"),
    }).optional())
    .query(async ({ input, ctx }) => {
      const meses = input?.meses || 6;
      const metrica = input?.metrica || "margenTotal";
      const fechaDesde = new Date();
      fechaDesde.setMonth(fechaDesde.getMonth() - meses);

      const historial = await getHistorialCalculos({
        userId: ctx.user.id,
        fechaDesde,
        limit: 500,
      });

      // Agrupar por semana
      const semanas: Record<string, { fecha: string; e57: number[]; e2021: number[]; eCebo: number[]; count: number }> = {};

      for (const calc of historial) {
        const fecha = new Date(calc.createdAt);
        // Obtener lunes de la semana
        const day = fecha.getDay();
        const diff = fecha.getDate() - day + (day === 0 ? -6 : 1);
        const lunes = new Date(fecha.setDate(diff));
        const key = lunes.toISOString().split("T")[0];

        if (!semanas[key]) {
          semanas[key] = { fecha: key, e57: [], e2021: [], eCebo: [], count: 0 };
        }

        const getVal = (escenario: string, calc: any): number => {
          const prefix = escenario === "5-7kg" ? "e57" : escenario === "20-21kg" ? "e2021" : "eCebo";
          switch (metrica) {
            case "margenTotal": return parseFloat(calc[`${prefix}_margenTotal`] || "0");
            case "margenPorAnimal": return parseFloat(calc[`${prefix}_margenPorAnimal`] || "0");
            case "margenPorPlazaDia": return parseFloat(calc[`${prefix}_margenPorPlazaDia`] || "0");
            case "rentabilidadPct": return parseFloat(calc[`${prefix}_rentabilidadPct`] || "0");
            case "precioKg": return parseFloat(calc[`${prefix}_precioKg`] || "0");
            default: return 0;
          }
        };

        semanas[key].e57.push(getVal("5-7kg", calc));
        semanas[key].e2021.push(getVal("20-21kg", calc));
        semanas[key].eCebo.push(getVal("cebo", calc));
        semanas[key].count++;
      }

      // Calcular medias por semana
      const resultado = Object.values(semanas)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map(s => ({
          fecha: s.fecha,
          "5-7kg": s.e57.length > 0 ? Math.round((s.e57.reduce((a, b) => a + b, 0) / s.e57.length) * 100) / 100 : null,
          "20-21kg": s.e2021.length > 0 ? Math.round((s.e2021.reduce((a, b) => a + b, 0) / s.e2021.length) * 100) / 100 : null,
          "cebo": s.eCebo.length > 0 ? Math.round((s.eCebo.reduce((a, b) => a + b, 0) / s.eCebo.length) * 100) / 100 : null,
          calculos: s.count,
        }));

      return resultado;
    }),
});
