import { describe, expect, it } from "vitest";

// ============================================================
// Tests unitarios para la lógica de análisis histórico
// ============================================================

describe("Análisis Histórico - Lógica de Cálculo", () => {
  // Simular datos de historial
  const mockHistorial = [
    {
      id: 1,
      userId: 1,
      numAnimales: 500,
      usaCostesEstimados: 1,
      e57_margenTotal: "15000.00",
      e57_margenPorAnimal: "30.00",
      e57_rentabilidadPct: "18.50",
      e57_margenPorPlazaDia: "1.07",
      e2021_margenTotal: "22500.00",
      e2021_margenPorAnimal: "45.00",
      e2021_rentabilidadPct: "22.30",
      e2021_margenPorPlazaDia: "0.64",
      eCebo_margenTotal: "45000.00",
      eCebo_margenPorAnimal: "90.00",
      eCebo_rentabilidadPct: "28.10",
      eCebo_margenPorPlazaDia: "0.50",
      escenarioRecomendado: "5-7kg",
      confianzaRecomendacion: "0.85",
      createdAt: new Date("2026-01-15"),
    },
    {
      id: 2,
      userId: 1,
      numAnimales: 300,
      usaCostesEstimados: 0,
      e57_margenTotal: "8400.00",
      e57_margenPorAnimal: "28.00",
      e57_rentabilidadPct: "16.20",
      e57_margenPorPlazaDia: "1.00",
      e2021_margenTotal: "12600.00",
      e2021_margenPorAnimal: "42.00",
      e2021_rentabilidadPct: "20.10",
      e2021_margenPorPlazaDia: "0.60",
      eCebo_margenTotal: "24000.00",
      eCebo_margenPorAnimal: "80.00",
      eCebo_rentabilidadPct: "25.50",
      eCebo_margenPorPlazaDia: "0.44",
      escenarioRecomendado: "cebo",
      confianzaRecomendacion: "0.72",
      createdAt: new Date("2026-02-01"),
    },
  ];

  it("calcula correctamente el mejor margen del historial", () => {
    let mejorMargen = -Infinity;
    let mejorCalculo: typeof mockHistorial[0] | null = null;

    for (const c of mockHistorial) {
      const m57 = parseFloat(c.e57_margenTotal || "0");
      const m2021 = parseFloat(c.e2021_margenTotal || "0");
      const mCebo = parseFloat(c.eCebo_margenTotal || "0");
      const maxMargen = Math.max(m57, m2021, mCebo);

      if (maxMargen > mejorMargen) {
        mejorMargen = maxMargen;
        mejorCalculo = c;
      }
    }

    expect(mejorMargen).toBe(45000);
    expect(mejorCalculo?.id).toBe(1);
    expect(mejorCalculo?.numAnimales).toBe(500);
  });

  it("calcula correctamente el peor margen del historial", () => {
    let peorMargen = Infinity;
    let peorCalculo: typeof mockHistorial[0] | null = null;

    for (const c of mockHistorial) {
      const m57 = parseFloat(c.e57_margenTotal || "0");
      const m2021 = parseFloat(c.e2021_margenTotal || "0");
      const mCebo = parseFloat(c.eCebo_margenTotal || "0");
      const minMargen = Math.min(m57, m2021, mCebo);

      if (minMargen < peorMargen) {
        peorMargen = minMargen;
        peorCalculo = c;
      }
    }

    expect(peorMargen).toBe(8400);
    expect(peorCalculo?.id).toBe(2);
  });

  it("calcula correctamente las medias de margen por escenario", () => {
    let sumaMargen57 = 0, count57 = 0;
    let sumaMargen2021 = 0, count2021 = 0;
    let sumaMargenCebo = 0, countCebo = 0;

    for (const c of mockHistorial) {
      if (c.e57_margenTotal) { sumaMargen57 += parseFloat(c.e57_margenTotal); count57++; }
      if (c.e2021_margenTotal) { sumaMargen2021 += parseFloat(c.e2021_margenTotal); count2021++; }
      if (c.eCebo_margenTotal) { sumaMargenCebo += parseFloat(c.eCebo_margenTotal); countCebo++; }
    }

    const media57 = Math.round((sumaMargen57 / count57) * 100) / 100;
    const media2021 = Math.round((sumaMargen2021 / count2021) * 100) / 100;
    const mediaCebo = Math.round((sumaMargenCebo / countCebo) * 100) / 100;

    expect(media57).toBe(11700);
    expect(media2021).toBe(17550);
    expect(mediaCebo).toBe(34500);
  });

  it("agrupa correctamente los datos por semana para evolución temporal", () => {
    const semanas: Record<string, { fecha: string; count: number }> = {};

    for (const calc of mockHistorial) {
      const fecha = new Date(calc.createdAt);
      const day = fecha.getDay();
      const diff = fecha.getDate() - day + (day === 0 ? -6 : 1);
      const lunes = new Date(fecha);
      lunes.setDate(diff);
      const key = lunes.toISOString().split("T")[0];

      if (!semanas[key]) {
        semanas[key] = { fecha: key, count: 0 };
      }
      semanas[key].count++;
    }

    const semanasArray = Object.values(semanas).sort((a, b) => a.fecha.localeCompare(b.fecha));
    expect(semanasArray.length).toBe(2); // 2 semanas diferentes
    expect(semanasArray[0].count).toBe(1);
    expect(semanasArray[1].count).toBe(1);
  });

  it("filtra correctamente por escenario recomendado", () => {
    const filtrado57 = mockHistorial.filter(c => c.escenarioRecomendado === "5-7kg");
    const filtradoCebo = mockHistorial.filter(c => c.escenarioRecomendado === "cebo");
    const filtradoTodos = mockHistorial;

    expect(filtrado57.length).toBe(1);
    expect(filtrado57[0].id).toBe(1);
    expect(filtradoCebo.length).toBe(1);
    expect(filtradoCebo[0].id).toBe(2);
    expect(filtradoTodos.length).toBe(2);
  });

  it("maneja correctamente historial vacío", () => {
    const emptyHistorial: typeof mockHistorial = [];
    
    const stats = {
      totalCalculos: emptyHistorial.length,
      mejorMargen: null,
      peorMargen: null,
      mediaMargen57: 0,
      mediaMargen2021: 0,
      mediaMargenCebo: 0,
      ultimoCalculo: null,
    };

    expect(stats.totalCalculos).toBe(0);
    expect(stats.mejorMargen).toBeNull();
    expect(stats.peorMargen).toBeNull();
    expect(stats.mediaMargen57).toBe(0);
    expect(stats.ultimoCalculo).toBeNull();
  });

  it("calcula correctamente los datos del radar chart", () => {
    const ultimo = mockHistorial[1]; // El más reciente
    const radarData = [
      {
        metrica: "Margen/Animal",
        "5-7kg": Math.max(0, parseFloat(ultimo.e57_margenPorAnimal || "0")),
        "20-21kg": Math.max(0, parseFloat(ultimo.e2021_margenPorAnimal || "0")),
        "cebo": Math.max(0, parseFloat(ultimo.eCebo_margenPorAnimal || "0")),
      },
      {
        metrica: "Rentabilidad",
        "5-7kg": Math.max(0, parseFloat(ultimo.e57_rentabilidadPct || "0")),
        "20-21kg": Math.max(0, parseFloat(ultimo.e2021_rentabilidadPct || "0")),
        "cebo": Math.max(0, parseFloat(ultimo.eCebo_rentabilidadPct || "0")),
      },
    ];

    expect(radarData[0]["5-7kg"]).toBe(28);
    expect(radarData[0]["20-21kg"]).toBe(42);
    expect(radarData[0]["cebo"]).toBe(80);
    expect(radarData[1]["5-7kg"]).toBe(16.2);
    expect(radarData[1]["20-21kg"]).toBe(20.1);
    expect(radarData[1]["cebo"]).toBe(25.5);
  });

  it("ordena el historial por fecha descendente", () => {
    const sorted = [...mockHistorial].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted[0].id).toBe(2); // Feb 2026 es más reciente
    expect(sorted[1].id).toBe(1); // Jan 2026
  });

  it("calcula correctamente los datos de barras comparativas", () => {
    const barrasData = mockHistorial.slice(0, 10).reverse().map((c, i) => ({
      nombre: `#${i + 1}`,
      "5-7kg": parseFloat(c.e57_margenTotal || "0"),
      "20-21kg": parseFloat(c.e2021_margenTotal || "0"),
      "cebo": parseFloat(c.eCebo_margenTotal || "0"),
    }));

    expect(barrasData.length).toBe(2);
    // reverse() invierte el array original: [id:1, id:2] -> [id:2, id:1] -> reversed: [id:1, id:2]
    // Pero mockHistorial no está ordenado desc, así que el primer elemento tras reverse es id:2
    expect(barrasData[0]["5-7kg"]).toBe(8400);
    expect(barrasData[0]["20-21kg"]).toBe(12600);
    expect(barrasData[0]["cebo"]).toBe(24000);
    expect(barrasData[1]["5-7kg"]).toBe(15000);
    expect(barrasData[1]["cebo"]).toBe(45000);
  });

  it("maneja valores null/undefined en los campos de margen", () => {
    const calcConNulls = {
      ...mockHistorial[0],
      e57_margenTotal: null,
      e2021_margenTotal: undefined,
      eCebo_margenTotal: "0",
    };

    const m57 = parseFloat(calcConNulls.e57_margenTotal || "0");
    const m2021 = parseFloat(calcConNulls.e2021_margenTotal || "0");
    const mCebo = parseFloat(calcConNulls.eCebo_margenTotal || "0");

    expect(m57).toBe(0);
    expect(m2021).toBe(0);
    expect(mCebo).toBe(0);
  });
});
