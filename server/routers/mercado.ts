import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  obtenerPreciosActuales,
  obtenerHistoricoPrecios,
  estimarPrecioFuturo,
  obtenerNoticiasSector,
} from "../services/preciosMercado";

export const mercadoRouter = router({
  preciosActuales: protectedProcedure.query(async () => {
    const precios = await obtenerPreciosActuales();
    return precios;
  }),

  historico: protectedProcedure
    .input(z.object({
      producto: z.string().optional(),
      meses: z.number().min(1).max(24).optional(),
    }).optional())
    .query(({ input }) => {
      return obtenerHistoricoPrecios(input?.producto, input?.meses);
    }),

  estimacion: protectedProcedure
    .input(z.object({
      producto: z.string(),
      semanasAdelante: z.number().min(1).max(26),
    }))
    .query(({ input }) => {
      return estimarPrecioFuturo(input.producto, input.semanasAdelante);
    }),

  noticias: protectedProcedure.query(async () => {
    const noticias = await obtenerNoticiasSector();
    return noticias;
  }),
});
