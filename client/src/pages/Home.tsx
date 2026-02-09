import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Layers,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Newspaper,
  BarChart3,
  ExternalLink,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#16a34a", "#22c55e", "#86efac", "#f59e0b", "#ef4444"];

function StatCard({ title, value, subtitle, icon: Icon, color = "text-primary" }: {
  title: string; value: string | number; subtitle?: string; icon: any; color?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl bg-primary/10 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CentroCapacidadCard({ centro }: { centro: any }) {
  const porcentaje = centro.plazasTotales > 0 ? Math.round((centro.plazasOcupadas / centro.plazasTotales) * 100) : 0;
  const disponibles = centro.plazasTotales - centro.plazasOcupadas;
  const isAlerta = porcentaje > 85;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{centro.nombre}</CardTitle>
          </div>
          <Badge variant={centro.tipo === "cria" ? "default" : "secondary"} className="text-xs">
            {centro.tipo === "cria" ? "Cría" : "Engorde"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{centro.ubicacion} · {centro.provincia}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ocupación</span>
            <span className="font-semibold">{centro.plazasOcupadas} / {centro.plazasTotales}</span>
          </div>
          <Progress value={porcentaje} className="h-2.5" />
          <div className="flex justify-between text-xs">
            <span className={`font-medium ${isAlerta ? "text-destructive" : "text-primary"}`}>{porcentaje}% ocupado</span>
            <span className="text-muted-foreground">{disponibles} plazas libres</span>
          </div>
        </div>
        {isAlerta && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="h-3 w-3" />
            <span>Capacidad cercana al límite</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const centrosQuery = trpc.centros.list.useQuery();
  const lotesQuery = trpc.lotes.list.useQuery();
  const crmStats = trpc.crm.stats.useQuery();
  const ofertasQuery = trpc.ofertas.list.useQuery();
  const preciosQuery = trpc.mercado.preciosActuales.useQuery(undefined, { staleTime: 300000 });
  const noticiasQuery = trpc.mercado.noticias.useQuery(undefined, { staleTime: 600000 });
  const historicoQuery = trpc.mercado.historico.useQuery({ producto: "cerdo_cebado", meses: 6 }, { staleTime: 600000 });

  const centros = centrosQuery.data || [];
  const lotesData = lotesQuery.data || [];
  const stats = crmStats.data;
  const ofertasData = ofertasQuery.data || [];
  const precios = preciosQuery.data || [];
  const noticias = noticiasQuery.data || [];
  const historico = historicoQuery.data || [];

  const isLoading = centrosQuery.isLoading || lotesQuery.isLoading || crmStats.isLoading || ofertasQuery.isLoading;

  const totalPlazas = centros.reduce((s, c) => s + c.plazasTotales, 0);
  const totalOcupadas = centros.reduce((s, c) => s + c.plazasOcupadas, 0);
  const lotesActivos = lotesData.filter((l) => l.fase !== "vendido").length;
  const ofertasActivas = ofertasData.filter((o) => o.estado === "enviada" || o.estado === "borrador").length;

  const faseData = [
    { name: "Lactancia", value: lotesData.filter((l) => l.fase === "lactancia").length },
    { name: "Transición", value: lotesData.filter((l) => l.fase === "transicion").length },
    { name: "Cebo", value: lotesData.filter((l) => l.fase === "cebo").length },
    { name: "Vendido", value: lotesData.filter((l) => l.fase === "vendido").length },
  ].filter((d) => d.value > 0);

  const centrosChartData = centros.map((c) => ({
    name: c.nombre.length > 15 ? c.nombre.slice(0, 15) + "…" : c.nombre,
    ocupadas: c.plazasOcupadas,
    libres: c.plazasTotales - c.plazasOcupadas,
  }));

  const historicoChartData = historico.map((d) => ({
    fecha: d.fecha.slice(5),
    precio: d.precio,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen general de la explotación porcina</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Plazas Totales" value={totalPlazas} subtitle={`${totalOcupadas} ocupadas · ${totalPlazas - totalOcupadas} libres`} icon={Building2} />
        <StatCard title="Lotes Activos" value={lotesActivos} subtitle={`${lotesData.length} lotes registrados`} icon={Layers} />
        <StatCard title="Clientes / Leads" value={stats?.total || 0} subtitle={`${stats?.nuevos || 0} nuevos · ${stats?.cerrados || 0} cerrados`} icon={Users} />
        <StatCard title="Ofertas Activas" value={ofertasActivas} subtitle={`${ofertasData.length} ofertas totales`} icon={FileText} />
      </div>

      {/* Precios de Mercado */}
      {precios.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Precios de Mercado
              <Badge variant="outline" className="text-xs ml-auto">Actualización semanal</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {precios.map((p, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground truncate">{p.producto}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-bold">
                      {typeof p.precio === 'number' ? (p.unidad?.includes('unidad') ? p.precio.toFixed(2) : (p.precio > 10 ? p.precio.toFixed(0) : p.precio.toFixed(3))) : p.precio}
                    </p>
                    <span className="text-xs text-muted-foreground">{p.unidad}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {p.tendencia === "alza" && <TrendingUp className="h-3 w-3 text-green-600" />}
                    {p.tendencia === "baja" && <TrendingDown className="h-3 w-3 text-red-600" />}
                    {p.tendencia === "estable" && <Minus className="h-3 w-3 text-gray-500" />}
                    <Badge variant={p.tendencia === "alza" ? "default" : p.tendencia === "baja" ? "destructive" : "secondary"} className="text-xs">
                      {p.tendencia === "alza" ? "Alza" : p.tendencia === "baja" ? "Baja" : "Estable"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.fuente} · {p.fecha}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico histórico + Noticias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico histórico de precios */}
        {historicoChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Evolución Precio Cerdo Cebado (6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicoChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" fontSize={10} interval="preserveStartEnd" />
                  <YAxis fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `${v} €`} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(3)} €/kg`, "Precio"]} />
                  <Line type="monotone" dataKey="precio" stroke="#16a34a" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Noticias del sector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              Noticias del Sector Porcino
            </CardTitle>
          </CardHeader>
          <CardContent>
            {noticias.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No se pudieron cargar las noticias</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {noticias.slice(0, 6).map((n, i) => (
                  <a key={i} href={n.enlace} target="_blank" rel="noopener noreferrer"
                    className="block p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{n.titulo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{n.fuente}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Centros de Capacidad */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Capacidad de Centros
        </h2>
        {centros.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No hay centros registrados</p>
              <p className="text-sm mt-1">Vaya a la sección "Centros" para añadir su centro de cría o engorde.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centros.map((centro) => <CentroCapacidadCard key={centro.id} centro={centro} />)}
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {centrosChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Ocupación por Centro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={centrosChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="ocupadas" fill="#16a34a" name="Ocupadas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="libres" fill="#bbf7d0" name="Libres" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {faseData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Lotes por Fase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={faseData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {faseData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
