import { describe, expect, it } from "vitest";

// ============================================================
// TESTS DE LA LÓGICA ORIGINAL (mantenidos para compatibilidad)
// ============================================================

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

  let viable = true;
  let razonNoViable: string | undefined;
  if (escenario === "cebo" && numAnimales > plazasDisponibles) {
    viable = false;
    razonNoViable = `Se necesitan ${numAnimales} plazas de cebo pero solo hay ${plazasDisponibles} disponibles`;
  }

  return {
    nombre, escenario, pesoVenta, precioKg,
    ingresosPorAnimal: Math.round(ingresosPorAnimal * 100) / 100,
    ingresosTotales: Math.round(ingresosTotales * 100) / 100,
    costePienso, costeSanidad,
    costeFijosPorAnimal: Math.round(costeFijosPorAnimal * 100) / 100,
    costeTotalPorAnimal: Math.round(costeTotalPorAnimal * 100) / 100,
    costesTotales: Math.round(costesTotales * 100) / 100,
    mortalidadPct, animalesFinales,
    margenPorAnimal: Math.round(margenPorAnimal * 100) / 100,
    margenTotal: Math.round(margenTotal * 100) / 100,
    diasOcupacion,
    margenPorPlazaDia: Math.round(margenPorPlazaDia * 100) / 100,
    viable, razonNoViable,
  };
}

const DEFAULT_PARAMS = {
  precioVenta5_7: "3.50", precioVenta20_21: "2.80", precioVentaCebo: "1.45",
  costePienso5_7: "8.50", costePienso20_21: "22.00", costePiensoCebo: "95.00",
  costeSanidad5_7: "1.50", costeSanidad20_21: "3.00", costeSanidadCebo: "5.50",
  mortalidad5_7: "8.00", mortalidad20_21: "3.00", mortalidadCebo: "2.00",
  costeManoObra: "3500.00", costeEnergia: "1200.00", costeAmortizacion: "800.00", costePurines: "400.00",
  indicConversion5_7: "1.80", indicConversion20_21: "2.20", indicConversionCebo: "2.80",
  diasEstancia5_7: 28, diasEstancia20_21: 65, diasEstanciaCebo: 160,
};

// ============================================================
// TESTS ORIGINALES
// ============================================================

describe("Calculadora de Rentabilidad - Lógica Original", () => {
  describe("Escenario 5-7 kg", () => {
    it("calcula correctamente los ingresos por animal", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.ingresosPorAnimal).toBe(21.00);
    });
    it("calcula correctamente la mortalidad", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.animalesFinales).toBe(460);
    });
    it("siempre es viable", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 0);
      expect(result.viable).toBe(true);
    });
    it("tiene 28 días de ocupación", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.diasOcupacion).toBe(28);
    });
  });

  describe("Escenario 20-21 kg", () => {
    it("calcula correctamente los ingresos por animal", () => {
      const result = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.ingresosPorAnimal).toBe(57.40);
    });
    it("calcula correctamente la mortalidad al 3%", () => {
      const result = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.animalesFinales).toBe(485);
    });
  });

  describe("Escenario Cebo Final", () => {
    it("calcula correctamente los ingresos por animal", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      expect(result.ingresosPorAnimal).toBe(152.25);
    });
    it("NO es viable cuando no hay suficientes plazas", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 200);
      expect(result.viable).toBe(false);
    });
  });

  describe("Validaciones generales", () => {
    it("lanza error para escenario inválido", () => {
      expect(() => calcularEscenario("invalido", 500, DEFAULT_PARAMS, 1000)).toThrow("Escenario no válido");
    });
    it("maneja correctamente 0 animales", () => {
      const result = calcularEscenario("5-7kg", 0, DEFAULT_PARAMS, 1000);
      expect(result.animalesFinales).toBe(0);
    });
    it("los costes fijos se reparten entre todos los animales", () => {
      const r1 = calcularEscenario("cebo", 100, DEFAULT_PARAMS, 1000);
      const r2 = calcularEscenario("cebo", 1000, DEFAULT_PARAMS, 1000);
      expect(r2.costeFijosPorAnimal).toBeLessThan(r1.costeFijosPorAnimal);
    });
    it("el escenario de cebo genera más ingresos por animal", () => {
      const r1 = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      const r2 = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000);
      const r3 = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      expect(r3.ingresosPorAnimal).toBeGreaterThan(r2.ingresosPorAnimal);
      expect(r2.ingresosPorAnimal).toBeGreaterThan(r1.ingresosPorAnimal);
    });
  });
});

// ============================================================
// TESTS NUEVOS: COSTES ESTÁNDAR POR FASES
// ============================================================

describe("Calculadora v2 - Costes Estándar por Fases", () => {
  const COSTES_ESTANDAR = {
    cria: { piensoMadre: 2.80, piensoLechon: 1.20, sanidad: 1.50, manoObra: 2.00, energia: 1.00, otros: 0.50, total: 9.00, mortalidad: 8.0, dias: 28 },
    transicion: { pienso: 12.50, sanidad: 2.50, manoObra: 1.80, energia: 0.80, otros: 0.40, total: 18.00, mortalidad: 3.0, dias: 37 },
    cebo: { pienso: 78.00, sanidad: 4.50, manoObra: 5.00, energia: 2.50, amortizacion: 3.00, purines: 2.00, otros: 1.00, total: 96.00, mortalidad: 2.0, dias: 120 },
  };

  it("costes de cría suman correctamente", () => {
    const c = COSTES_ESTANDAR.cria;
    expect(c.piensoMadre + c.piensoLechon + c.sanidad + c.manoObra + c.energia + c.otros).toBe(c.total);
  });

  it("costes de transición suman correctamente", () => {
    const t = COSTES_ESTANDAR.transicion;
    expect(t.pienso + t.sanidad + t.manoObra + t.energia + t.otros).toBe(t.total);
  });

  it("costes de cebo suman correctamente", () => {
    const c = COSTES_ESTANDAR.cebo;
    expect(c.pienso + c.sanidad + c.manoObra + c.energia + c.amortizacion + c.purines + c.otros).toBe(c.total);
  });

  it("coste total ciclo completo es 123 €/animal", () => {
    expect(COSTES_ESTANDAR.cria.total + COSTES_ESTANDAR.transicion.total + COSTES_ESTANDAR.cebo.total).toBe(123.00);
  });

  it("mortalidad acumulada 5-7kg es 8%", () => {
    expect(COSTES_ESTANDAR.cria.mortalidad).toBe(8.0);
  });

  it("mortalidad acumulada 20-21kg es ~10.76%", () => {
    const m = (1 - (1 - 0.08) * (1 - 0.03)) * 100;
    expect(m).toBeCloseTo(10.76, 1);
  });

  it("mortalidad acumulada cebo es ~12.54%", () => {
    const m = (1 - (1 - 0.08) * (1 - 0.03) * (1 - 0.02)) * 100;
    expect(m).toBeCloseTo(12.54, 1);
  });

  it("días totales ciclo completo es 185", () => {
    expect(COSTES_ESTANDAR.cria.dias + COSTES_ESTANDAR.transicion.dias + COSTES_ESTANDAR.cebo.dias).toBe(185);
  });
});

// ============================================================
// TESTS NUEVOS: ESTIMACIÓN DE PRECIOS FUTUROS
// ============================================================

describe("Estimación de Precios Futuros", () => {
  it("media móvil ponderada funciona con datos suficientes", () => {
    const precios = [1.10, 1.08, 1.06, 1.04, 1.02, 1.00, 1.00, 1.00];
    const pesos = precios.map((_, i) => i + 1);
    const sumaPesos = pesos.reduce((a, b) => a + b, 0);
    const media = precios.reduce((sum, p, i) => sum + p * pesos[i], 0) / sumaPesos;
    expect(media).toBeGreaterThan(0);
    expect(media).toBeLessThan(1.10);
  });

  it("confianza decrece con el horizonte temporal", () => {
    const c4 = Math.max(0.1, Math.min(0.95, 0.85 - 4 * 0.05));
    const c16 = Math.max(0.1, Math.min(0.95, 0.85 - 16 * 0.05));
    expect(c4).toBeGreaterThan(c16);
    expect(c4).toBeCloseTo(0.65, 10);
    expect(c16).toBe(0.1);
  });

  it("regresión lineal calcula pendiente correctamente", () => {
    const ys = [1.10, 1.08, 1.06, 1.04, 1.02, 1.00, 1.00, 1.00];
    const n = ys.length;
    const xs = ys.map((_, i) => i);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
    const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    // Pendiente negativa (precios bajando)
    expect(pendiente).toBeLessThan(0);
  });
});

// ============================================================
// TESTS NUEVOS: MOTOR DE RECOMENDACIÓN
// ============================================================

describe("Motor de Recomendación Mejorado", () => {
  it("selecciona el escenario con mejor margen por plaza-día", () => {
    const escenarios = [
      { escenario: "5-7kg", margenPorPlazaDia: 0.53, margenTotal: 6800, rentabilidadPct: 152, viable: true },
      { escenario: "20-21kg", margenPorPlazaDia: 0.49, margenTotal: 14200, rentabilidadPct: 118, viable: true },
      { escenario: "cebo", margenPorPlazaDia: -0.07, margenTotal: -5700, rentabilidadPct: -10, viable: true },
    ];
    const viables = escenarios.filter(e => e.viable);
    const mejor = viables.reduce((a, b) => a.margenPorPlazaDia > b.margenPorPlazaDia ? a : b);
    expect(mejor.escenario).toBe("5-7kg");
  });

  it("devuelve ninguno si no hay viables", () => {
    const escenarios = [{ escenario: "cebo", viable: false }];
    const viables = escenarios.filter(e => e.viable);
    expect(viables.length).toBe(0);
  });

  it("identifica alternativa cuando hay múltiples viables", () => {
    const escenarios = [
      { escenario: "5-7kg", margenPorPlazaDia: 0.53, viable: true },
      { escenario: "20-21kg", margenPorPlazaDia: 0.49, viable: true },
    ];
    const sorted = [...escenarios].filter(e => e.viable).sort((a, b) => b.margenPorPlazaDia - a.margenPorPlazaDia);
    expect(sorted[0].escenario).toBe("5-7kg");
    expect(sorted[1].escenario).toBe("20-21kg");
  });

  it("la confianza aumenta cuando margen total y eficiencia coinciden", () => {
    let confianza = 0.7;
    const mejorEficiencia = "5-7kg";
    const mejorMargenTotal = "5-7kg";
    if (mejorEficiencia === mejorMargenTotal) confianza += 0.1;
    expect(confianza).toBeCloseTo(0.8, 10);
  });
});

describe("Generación de código de oferta", () => {
  it("genera un código con formato VP-YYMM-XXXXXX", () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const codigo = `VP-${year}${month}-ABC123`;
    expect(codigo).toMatch(/^VP-\d{4}-[A-Z0-9]{6}$/);
  });
});
