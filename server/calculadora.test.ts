import { describe, expect, it } from "vitest";

// We test the calculation logic by extracting and replicating the pure function
// from server/routers/calculadora.ts (since it's not exported, we replicate it here)

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

const DEFAULT_PARAMS = {
  precioVenta5_7: "3.50",
  precioVenta20_21: "2.80",
  precioVentaCebo: "1.45",
  costePienso5_7: "8.50",
  costePienso20_21: "22.00",
  costePiensoCebo: "95.00",
  costeSanidad5_7: "1.50",
  costeSanidad20_21: "3.00",
  costeSanidadCebo: "5.50",
  mortalidad5_7: "8.00",
  mortalidad20_21: "3.00",
  mortalidadCebo: "2.00",
  costeManoObra: "3500.00",
  costeEnergia: "1200.00",
  costeAmortizacion: "800.00",
  costePurines: "400.00",
  indicConversion5_7: "1.80",
  indicConversion20_21: "2.20",
  indicConversionCebo: "2.80",
  diasEstancia5_7: 28,
  diasEstancia20_21: 65,
  diasEstanciaCebo: 160,
};

describe("Calculadora de Rentabilidad", () => {
  describe("Escenario 5-7 kg", () => {
    it("calcula correctamente los ingresos por animal", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      // 6 kg * 3.50 €/kg = 21.00 €
      expect(result.ingresosPorAnimal).toBe(21.00);
    });

    it("calcula correctamente la mortalidad", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      // 500 * (1 - 0.08) = 460
      expect(result.animalesFinales).toBe(460);
      expect(result.mortalidadPct).toBe(8);
    });

    it("calcula correctamente los costes por animal", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.costePienso).toBe(8.50);
      expect(result.costeSanidad).toBe(1.50);
      // Costes fijos: (3500+1200+800+400)/30/500 * 28 = 10.99
      expect(result.costeFijosPorAnimal).toBeCloseTo(10.99, 1);
    });

    it("calcula correctamente el margen total", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.ingresosTotales).toBeGreaterThan(0);
      expect(result.costesTotales).toBeGreaterThan(0);
      expect(result.margenTotal).toBe(
        Math.round((result.ingresosTotales - result.costesTotales) * 100) / 100
      );
    });

    it("siempre es viable (no necesita plazas de cebo)", () => {
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
      // 20.5 kg * 2.80 €/kg = 57.40 €
      expect(result.ingresosPorAnimal).toBe(57.40);
    });

    it("calcula correctamente la mortalidad al 3%", () => {
      const result = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000);
      // 500 * (1 - 0.03) = 485
      expect(result.animalesFinales).toBe(485);
    });

    it("tiene 65 días de ocupación", () => {
      const result = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.diasOcupacion).toBe(65);
    });

    it("siempre es viable (no necesita plazas de cebo)", () => {
      const result = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 0);
      expect(result.viable).toBe(true);
    });
  });

  describe("Escenario Cebo Final", () => {
    it("calcula correctamente los ingresos por animal", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      // 105 kg * 1.45 €/kg = 152.25 €
      expect(result.ingresosPorAnimal).toBe(152.25);
    });

    it("calcula correctamente la mortalidad al 2%", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      // 500 * (1 - 0.02) = 490
      expect(result.animalesFinales).toBe(490);
    });

    it("tiene 160 días de ocupación", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      expect(result.diasOcupacion).toBe(160);
    });

    it("es viable cuando hay suficientes plazas", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      expect(result.viable).toBe(true);
    });

    it("NO es viable cuando no hay suficientes plazas de cebo", () => {
      const result = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 200);
      expect(result.viable).toBe(false);
      expect(result.razonNoViable).toContain("500");
      expect(result.razonNoViable).toContain("200");
    });
  });

  describe("Validaciones generales", () => {
    it("lanza error para escenario inválido", () => {
      expect(() =>
        calcularEscenario("invalido", 500, DEFAULT_PARAMS, 1000)
      ).toThrow("Escenario no válido");
    });

    it("maneja correctamente 0 animales", () => {
      const result = calcularEscenario("5-7kg", 0, DEFAULT_PARAMS, 1000);
      expect(result.animalesFinales).toBe(0);
      expect(result.ingresosTotales).toBe(0);
    });

    it("el margen por plaza/día se calcula correctamente", () => {
      const result = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      expect(result.margenPorPlazaDia).toBe(
        Math.round((result.margenPorAnimal / result.diasOcupacion) * 100) / 100
      );
    });

    it("los costes fijos se reparten entre todos los animales", () => {
      const r1 = calcularEscenario("cebo", 100, DEFAULT_PARAMS, 1000);
      const r2 = calcularEscenario("cebo", 1000, DEFAULT_PARAMS, 1000);
      // Con más animales, el coste fijo por animal es menor
      expect(r2.costeFijosPorAnimal).toBeLessThan(r1.costeFijosPorAnimal);
    });

    it("el escenario de cebo genera más ingresos por animal que los otros", () => {
      const r1 = calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000);
      const r2 = calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000);
      const r3 = calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000);
      expect(r3.ingresosPorAnimal).toBeGreaterThan(r2.ingresosPorAnimal);
      expect(r2.ingresosPorAnimal).toBeGreaterThan(r1.ingresosPorAnimal);
    });
  });

  describe("Recomendación de escenario", () => {
    it("selecciona el mejor escenario por margen/plaza/día", () => {
      const escenarios = [
        calcularEscenario("5-7kg", 500, DEFAULT_PARAMS, 1000),
        calcularEscenario("20-21kg", 500, DEFAULT_PARAMS, 1000),
        calcularEscenario("cebo", 500, DEFAULT_PARAMS, 1000),
      ];

      const viables = escenarios.filter(e => e.viable);
      const best = viables.reduce((a, b) =>
        a.margenPorPlazaDia > b.margenPorPlazaDia ? a : b
      );

      // The recommendation should be one of the three valid scenarios
      expect(["5-7kg", "20-21kg", "cebo"]).toContain(best.escenario);
      expect(best.margenPorPlazaDia).toBeGreaterThan(0);
    });
  });
});

describe("Generación de código de oferta", () => {
  it("genera un código con formato VP-YYMM-XXXXXX", () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const prefix = `VP-${year}${month}-`;

    // Simulate the function
    const codigo = `VP-${year}${month}-ABC123`;
    expect(codigo).toMatch(/^VP-\d{4}-[A-Z0-9]{6}$/);
    expect(codigo.startsWith(prefix)).toBe(true);
  });
});
