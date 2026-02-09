import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getParametrosActivos, getAllParametros, createParametros, updateParametros, getCentros, logActividad } from "../db";

type EscenarioResult = {
  nombre: string;
  escenario: string;
  pesoVenta: number;
  precioKg: number;
  ingresosPorAnimal: number;
  ingresosTotales: number;
  costePienso: number;
  costeSanidad: number;
  costeFijosPorAnimal: number;
  costeTotalPorAnimal: number;
  costesTotales: number;
  mortalidadPct: number;
  animalesFinales: number;
  margenPorAnimal: number;
  margenTotal: number;
  diasOcupacion: number;
  margenPorPlazaDia: number;
  viable: boolean;
  razonNoViable?: string;
};

function calcularEscenario(
  escenario: string,
  numAnimales: number,
  params: any,
  plazasDisponibles: number,
): EscenarioResult {
  let pesoVenta: number, precioKg: number, costePienso: number, costeSanidad: number;
  let mortalidadPct: number, diasOcupacion: number, nombre: string;

  switch (escenario) {
    case "5-7kg":
      nombre = "Venta Lechón 5-7 kg";
      pesoVenta = 6;
      precioKg = parseFloat(params.precioVenta5_7);
      costePienso = parseFloat(params.costePienso5_7);
      costeSanidad = parseFloat(params.costeSanidad5_7);
      mortalidadPct = parseFloat(params.mortalidad5_7);
      diasOcupacion = params.diasEstancia5_7;
      break;
    case "20-21kg":
      nombre = "Venta Transición 20-21 kg";
      pesoVenta = 20.5;
      precioKg = parseFloat(params.precioVenta20_21);
      costePienso = parseFloat(params.costePienso20_21);
      costeSanidad = parseFloat(params.costeSanidad20_21);
      mortalidadPct = parseFloat(params.mortalidad20_21);
      diasOcupacion = params.diasEstancia20_21;
      break;
    case "cebo":
      nombre = "Cebo Final 100-110 kg";
      pesoVenta = 105;
      precioKg = parseFloat(params.precioVentaCebo);
      costePienso = parseFloat(params.costePiensoCebo);
      costeSanidad = parseFloat(params.costeSanidadCebo);
      mortalidadPct = parseFloat(params.mortalidadCebo);
      diasOcupacion = params.diasEstanciaCebo;
      break;
    default:
      throw new Error("Escenario no válido");
  }

  const costesFijosMensuales =
    parseFloat(params.costeManoObra) +
    parseFloat(params.costeEnergia) +
    parseFloat(params.costeAmortizacion) +
    parseFloat(params.costePurines);

  const costeFijosPorAnimalDia = numAnimales > 0 ? costesFijosMensuales / 30 / numAnimales : 0;
  const costeFijosPorAnimal = costeFijosPorAnimalDia * diasOcupacion;

  const animalesFinales = Math.round(numAnimales * (1 - mortalidadPct / 100));
  const ingresosPorAnimal = pesoVenta * precioKg;
  const ingresosTotales = ingresosPorAnimal * animalesFinales;
  const costeTotalPorAnimal = costePienso + costeSanidad + costeFijosPorAnimal;
  const costesTotales = costeTotalPorAnimal * numAnimales;
  const margenPorAnimal = ingresosPorAnimal - costeTotalPorAnimal;
  const margenTotal = ingresosTotales - costesTotales;
  const margenPorPlazaDia = diasOcupacion > 0 ? margenPorAnimal / diasOcupacion : 0;

  // Viabilidad: si necesita plazas de cebo y no hay suficientes
  let viable = true;
  let razonNoViable: string | undefined;
  if (escenario === "cebo" && numAnimales > plazasDisponibles) {
    viable = false;
    razonNoViable = `Se necesitan ${numAnimales} plazas de cebo pero solo hay ${plazasDisponibles} disponibles`;
  }

  return {
    nombre,
    escenario,
    pesoVenta,
    precioKg,
    ingresosPorAnimal: Math.round(ingresosPorAnimal * 100) / 100,
    ingresosTotales: Math.round(ingresosTotales * 100) / 100,
    costePienso,
    costeSanidad,
    costeFijosPorAnimal: Math.round(costeFijosPorAnimal * 100) / 100,
    costeTotalPorAnimal: Math.round(costeTotalPorAnimal * 100) / 100,
    costesTotales: Math.round(costesTotales * 100) / 100,
    mortalidadPct,
    animalesFinales,
    margenPorAnimal: Math.round(margenPorAnimal * 100) / 100,
    margenTotal: Math.round(margenTotal * 100) / 100,
    diasOcupacion,
    margenPorPlazaDia: Math.round(margenPorPlazaDia * 100) / 100,
    viable,
    razonNoViable,
  };
}

export const calculadoraRouter = router({
  parametros: router({
    getActivos: protectedProcedure.query(async () => {
      return getParametrosActivos();
    }),

    getAll: protectedProcedure.query(async () => {
      return getAllParametros();
    }),

    create: protectedProcedure
      .input(z.object({
        nombre: z.string().min(1),
        precioVenta5_7: z.string().default("3.50"),
        precioVenta20_21: z.string().default("2.80"),
        precioVentaCebo: z.string().default("1.45"),
        costePienso5_7: z.string().default("8.50"),
        costePienso20_21: z.string().default("22.00"),
        costePiensoCebo: z.string().default("95.00"),
        costeSanidad5_7: z.string().default("1.50"),
        costeSanidad20_21: z.string().default("3.00"),
        costeSanidadCebo: z.string().default("5.50"),
        mortalidad5_7: z.string().default("8.00"),
        mortalidad20_21: z.string().default("3.00"),
        mortalidadCebo: z.string().default("2.00"),
        costeManoObra: z.string().default("3500.00"),
        costeEnergia: z.string().default("1200.00"),
        costeAmortizacion: z.string().default("800.00"),
        costePurines: z.string().default("400.00"),
        indicConversion5_7: z.string().default("1.80"),
        indicConversion20_21: z.string().default("2.20"),
        indicConversionCebo: z.string().default("2.80"),
        diasEstancia5_7: z.number().default(28),
        diasEstancia20_21: z.number().default(65),
        diasEstanciaCebo: z.number().default(160),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createParametros(input);
        await logActividad({
          tipo: "parametros_creados",
          descripcion: `Nuevos parámetros económicos "${input.nombre}" configurados`,
          modulo: "calculadora",
          userId: ctx.user.id,
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nombre: z.string().min(1).optional(),
        precioVenta5_7: z.string().optional(),
        precioVenta20_21: z.string().optional(),
        precioVentaCebo: z.string().optional(),
        costePienso5_7: z.string().optional(),
        costePienso20_21: z.string().optional(),
        costePiensoCebo: z.string().optional(),
        costeSanidad5_7: z.string().optional(),
        costeSanidad20_21: z.string().optional(),
        costeSanidadCebo: z.string().optional(),
        mortalidad5_7: z.string().optional(),
        mortalidad20_21: z.string().optional(),
        mortalidadCebo: z.string().optional(),
        costeManoObra: z.string().optional(),
        costeEnergia: z.string().optional(),
        costeAmortizacion: z.string().optional(),
        costePurines: z.string().optional(),
        indicConversion5_7: z.string().optional(),
        indicConversion20_21: z.string().optional(),
        indicConversionCebo: z.string().optional(),
        diasEstancia5_7: z.number().optional(),
        diasEstancia20_21: z.number().optional(),
        diasEstanciaCebo: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updateParametros(id, data);
        await logActividad({
          tipo: "parametros_actualizados",
          descripcion: `Parámetros económicos ID ${id} actualizados`,
          modulo: "calculadora",
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  calcular: protectedProcedure
    .input(z.object({
      numAnimales: z.number().min(1),
      // Optional overrides for quick calculations
      precioVenta5_7: z.string().optional(),
      precioVenta20_21: z.string().optional(),
      precioVentaCebo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      let params = await getParametrosActivos();
      if (!params) {
        // Use defaults
        params = {
          precioVenta5_7: "3.50", precioVenta20_21: "2.80", precioVentaCebo: "1.45",
          costePienso5_7: "8.50", costePienso20_21: "22.00", costePiensoCebo: "95.00",
          costeSanidad5_7: "1.50", costeSanidad20_21: "3.00", costeSanidadCebo: "5.50",
          mortalidad5_7: "8.00", mortalidad20_21: "3.00", mortalidadCebo: "2.00",
          costeManoObra: "3500.00", costeEnergia: "1200.00", costeAmortizacion: "800.00", costePurines: "400.00",
          indicConversion5_7: "1.80", indicConversion20_21: "2.20", indicConversionCebo: "2.80",
          diasEstancia5_7: 28, diasEstancia20_21: 65, diasEstanciaCebo: 160,
        } as any;
      }

      // Apply overrides
      if (input.precioVenta5_7) params = { ...params, precioVenta5_7: input.precioVenta5_7 } as any;
      if (input.precioVenta20_21) params = { ...params, precioVenta20_21: input.precioVenta20_21 } as any;
      if (input.precioVentaCebo) params = { ...params, precioVentaCebo: input.precioVentaCebo } as any;

      // Get available cebo capacity
      const allCentros = await getCentros();
      const cebaderos = allCentros.filter(c => c.tipo === "engorde");
      const plazasCeboDisponibles = cebaderos.reduce((sum, c) => sum + (c.plazasTotales - c.plazasOcupadas), 0);

      const escenarios = [
        calcularEscenario("5-7kg", input.numAnimales, params, plazasCeboDisponibles),
        calcularEscenario("20-21kg", input.numAnimales, params, plazasCeboDisponibles),
        calcularEscenario("cebo", input.numAnimales, params, plazasCeboDisponibles),
      ];

      // Determine recommendation
      const viables = escenarios.filter(e => e.viable);
      let recomendado: string | null = null;
      let razonRecomendacion = "";

      if (viables.length > 0) {
        // Best by margin per plaza-day (efficiency)
        const best = viables.reduce((a, b) => a.margenPorPlazaDia > b.margenPorPlazaDia ? a : b);
        recomendado = best.escenario;
        razonRecomendacion = `"${best.nombre}" ofrece el mejor margen por plaza-día (${best.margenPorPlazaDia.toFixed(2)} €/plaza/día) con un margen total de ${best.margenTotal.toFixed(2)} €`;
      }

      await logActividad({
        tipo: "calculo_realizado",
        descripcion: `Cálculo de escenarios para ${input.numAnimales} animales. Recomendado: ${recomendado || "ninguno"}`,
        modulo: "calculadora",
        userId: ctx.user.id,
      });

      return {
        escenarios,
        recomendado,
        razonRecomendacion,
        plazasCeboDisponibles,
      };
    }),
});
