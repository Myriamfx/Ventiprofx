import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Settings,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

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

const ESCENARIO_COLORS: Record<string, string> = {
  "5-7kg": "#3b82f6",
  "20-21kg": "#f59e0b",
  cebo: "#16a34a",
};

function EscenarioCard({
  esc,
  isRecomendado,
}: {
  esc: EscenarioResult;
  isRecomendado: boolean;
}) {
  return (
    <Card
      className={`relative transition-shadow hover:shadow-lg ${isRecomendado ? "ring-2 ring-primary shadow-md" : ""} ${!esc.viable ? "opacity-60" : ""}`}
    >
      {isRecomendado && (
        <div className="absolute -top-3 left-4">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            <Star className="h-3 w-3 mr-1" />
            Recomendado
          </Badge>
        </div>
      )}
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{esc.nombre}</CardTitle>
          {esc.viable ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!esc.viable && (
          <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {esc.razonNoViable}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Ingresos/animal</p>
            <p className="text-lg font-bold text-green-700">
              {esc.ingresosPorAnimal.toFixed(2)} €
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Coste/animal</p>
            <p className="text-lg font-bold text-red-700">
              {esc.costeTotalPorAnimal.toFixed(2)} €
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Margen/animal</span>
            <span
              className={`font-semibold ${esc.margenPorAnimal >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {esc.margenPorAnimal.toFixed(2)} €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Margen total</span>
            <span
              className={`font-bold text-base ${esc.margenTotal >= 0 ? "text-green-700" : "text-red-700"}`}
            >
              {esc.margenTotal.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Margen/plaza/día</span>
            <span className="font-semibold">
              {esc.margenPorPlazaDia.toFixed(2)} €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Días de ocupación</span>
            <span>{esc.diasOcupacion} días</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mortalidad</span>
            <span>{esc.mortalidadPct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Animales finales</span>
            <span>{esc.animalesFinales}</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Peso venta: {esc.pesoVenta} kg</span>
            <span>Precio: {esc.precioKg} €/kg</span>
          </div>
          <div className="flex justify-between">
            <span>Pienso: {esc.costePienso} €</span>
            <span>Sanidad: {esc.costeSanidad} €</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CalculadoraPage() {
  const [numAnimales, setNumAnimales] = useState("500");
  const [precioVenta5_7, setPrecioVenta5_7] = useState("");
  const [precioVenta20_21, setPrecioVenta20_21] = useState("");
  const [precioVentaCebo, setPrecioVentaCebo] = useState("");
  const [resultados, setResultados] = useState<{
    escenarios: EscenarioResult[];
    recomendado: string | null;
    razonRecomendacion: string;
    plazasCeboDisponibles: number;
  } | null>(null);

  const calcularMutation = trpc.calculadora.calcular.useMutation({
    onSuccess: (data) => {
      setResultados(data);
      toast.success("Cálculo completado");
    },
    onError: (e) => toast.error(e.message),
  });

  const parametrosQuery = trpc.calculadora.parametros.getActivos.useQuery();

  const handleCalcular = () => {
    const input: any = { numAnimales: parseInt(numAnimales) || 500 };
    if (precioVenta5_7) input.precioVenta5_7 = precioVenta5_7;
    if (precioVenta20_21) input.precioVenta20_21 = precioVenta20_21;
    if (precioVentaCebo) input.precioVentaCebo = precioVentaCebo;
    calcularMutation.mutate(input);
  };

  // Chart data
  const barData = resultados
    ? resultados.escenarios.map((e) => ({
        name:
          e.escenario === "5-7kg"
            ? "5-7 kg"
            : e.escenario === "20-21kg"
              ? "20-21 kg"
              : "Cebo",
        margenTotal: e.margenTotal,
        ingresos: e.ingresosTotales,
        costes: e.costesTotales,
      }))
    : [];

  const radarData = resultados
    ? [
        {
          metric: "Margen/animal",
          ...Object.fromEntries(
            resultados.escenarios.map((e) => [
              e.escenario,
              Math.max(0, e.margenPorAnimal),
            ])
          ),
        },
        {
          metric: "Margen/plaza/día",
          ...Object.fromEntries(
            resultados.escenarios.map((e) => [
              e.escenario,
              Math.max(0, e.margenPorPlazaDia * 100),
            ])
          ),
        },
        {
          metric: "Ingresos/animal",
          ...Object.fromEntries(
            resultados.escenarios.map((e) => [e.escenario, e.ingresosPorAnimal])
          ),
        },
        {
          metric: "Rapidez (inv. días)",
          ...Object.fromEntries(
            resultados.escenarios.map((e) => [
              e.escenario,
              Math.round(10000 / e.diasOcupacion),
            ])
          ),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Calculadora de Rentabilidad
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare los 3 escenarios de venta y encuentre la opción más rentable
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Parámetros de Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Nº Animales del lote</Label>
              <Input
                type="number"
                value={numAnimales}
                onChange={(e) => setNumAnimales(e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio 5-7kg (€/kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={precioVenta5_7}
                onChange={(e) => setPrecioVenta5_7(e.target.value)}
                placeholder={
                  parametrosQuery.data?.precioVenta5_7?.toString() || "3.50"
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Precio 20-21kg (€/kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={precioVenta20_21}
                onChange={(e) => setPrecioVenta20_21(e.target.value)}
                placeholder={
                  parametrosQuery.data?.precioVenta20_21?.toString() || "2.80"
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Precio Cebo (€/kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={precioVentaCebo}
                onChange={(e) => setPrecioVentaCebo(e.target.value)}
                placeholder={
                  parametrosQuery.data?.precioVentaCebo?.toString() || "1.45"
                }
              />
            </div>
          </div>
          <Button
            onClick={handleCalcular}
            disabled={calcularMutation.isPending}
            className="mt-4 w-full sm:w-auto"
            size="lg"
          >
            {calcularMutation.isPending ? (
              "Calculando..."
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Escenarios
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {resultados && (
        <>
          {/* Recommendation Banner */}
          {resultados.recomendado && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">
                      Recomendación del Sistema
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resultados.razonRecomendacion}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Plazas de cebo disponibles:{" "}
                      {resultados.plazasCeboDisponibles}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {resultados.escenarios.map((esc) => (
              <EscenarioCard
                key={esc.escenario}
                esc={esc}
                isRecomendado={esc.escenario === resultados.recomendado}
              />
            ))}
          </div>

          {/* Charts */}
          <Tabs defaultValue="barras" className="w-full">
            <TabsList>
              <TabsTrigger value="barras">Comparativa</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
            </TabsList>
            <TabsContent value="barras">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Comparativa de Márgenes por Escenario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" fontSize={13} />
                      <YAxis fontSize={12} tickFormatter={(v) => `${v} €`} />
                      <Tooltip
                        formatter={(value: number) =>
                          `${value.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="ingresos"
                        fill="#16a34a"
                        name="Ingresos"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="costes"
                        fill="#ef4444"
                        name="Costes"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="margenTotal"
                        fill="#3b82f6"
                        name="Margen"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="radar">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Análisis Multidimensional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" fontSize={11} />
                      <PolarRadiusAxis fontSize={10} />
                      <Radar
                        name="5-7 kg"
                        dataKey="5-7kg"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.15}
                      />
                      <Radar
                        name="20-21 kg"
                        dataKey="20-21kg"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.15}
                      />
                      <Radar
                        name="Cebo"
                        dataKey="cebo"
                        stroke="#16a34a"
                        fill="#16a34a"
                        fillOpacity={0.15}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
