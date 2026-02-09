import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Building2,
  Layers,
  Calculator,
  Users,
  FileText,
  Clock,
} from "lucide-react";

const MODULO_ICONS: Record<string, any> = {
  centros: Building2,
  lotes: Layers,
  calculadora: Calculator,
  crm: Users,
  ofertas: FileText,
};

const MODULO_COLORS: Record<string, string> = {
  centros: "bg-blue-100 text-blue-700",
  lotes: "bg-amber-100 text-amber-700",
  calculadora: "bg-purple-100 text-purple-700",
  crm: "bg-green-100 text-green-700",
  ofertas: "bg-cyan-100 text-cyan-700",
};

export default function ActividadPage() {
  const logQuery = trpc.actividad.log.useQuery({ limit: 100 });
  const statsQuery = trpc.actividad.stats.useQuery();

  if (logQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const logData = logQuery.data || [];
  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Registro de Actividad
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Historial de acciones para trazabilidad y justificación del Kit
          Digital
        </p>
      </div>

      {/* Stats by module */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          {stats.porModulo && Object.entries(stats.porModulo).map(([modulo, count]) => {
            const Icon = MODULO_ICONS[modulo] || Activity;
            return (
              <Card key={modulo}>
                <CardContent className="p-3 text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground capitalize">
                    {modulo}
                  </p>
                  <p className="text-xl font-bold">{count as number}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Activity Log */}
      {logData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-lg">No hay actividad registrada</p>
            <p className="text-sm mt-2">
              Las acciones realizadas en la aplicación se registrarán aquí
              automáticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Fecha</TableHead>
                  <TableHead className="w-[100px]">Módulo</TableHead>
                  <TableHead className="w-[160px]">Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logData.map((entry) => {
                  const Icon = MODULO_ICONS[entry.modulo] || Activity;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${MODULO_COLORS[entry.modulo] || "bg-gray-100 text-gray-700"}`}
                        >
                          <Icon className="h-3 w-3" />
                          {entry.modulo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {entry.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.descripcion}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
