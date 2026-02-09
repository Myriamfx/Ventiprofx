import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Search,
  Upload,
  Pencil,
  Trash2,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Filter,
} from "lucide-react";

const TIPO_LABELS: Record<string, string> = {
  comprador_5_7: "Comprador Cochinillo 5-7 kg",
  comprador_20_21: "Comprador 20-21 kg",
  comprador_cebo: "Comprador Cebo",
  matadero: "Matadero",
  intermediario: "Intermediario",
  otro: "Otro",
};

const ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  propuesta_enviada: "Propuesta Enviada",
  negociacion: "Negociación",
  cerrado_ganado: "Cerrado (Ganado)",
  cerrado_perdido: "Cerrado (Perdido)",
};

const ESTADO_COLORS: Record<string, string> = {
  nuevo: "bg-blue-100 text-blue-800",
  contactado: "bg-cyan-100 text-cyan-800",
  propuesta_enviada: "bg-amber-100 text-amber-800",
  negociacion: "bg-purple-100 text-purple-800",
  cerrado_ganado: "bg-green-100 text-green-800",
  cerrado_perdido: "bg-red-100 text-red-800",
};

const PRIORIDAD_COLORS: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-gray-100 text-gray-600",
};

function ClienteForm({
  onSubmit,
  initial,
  loading,
}: {
  onSubmit: (data: any) => void;
  initial?: any;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    nombre: initial?.nombre || "",
    empresa: initial?.empresa || "",
    email: initial?.email || "",
    telefono: initial?.telefono || "",
    web: initial?.web || "",
    tipoCliente: initial?.tipoCliente || "otro",
    estado: initial?.estado || "nuevo",
    prioridad: initial?.prioridad || "media",
    preferente: initial?.preferente || 0,
    ccaa: initial?.ccaa || "",
    provincia: initial?.provincia || "",
    municipio: initial?.municipio || "",
    especialidad: initial?.especialidad || "",
    volumenHabitual: initial?.volumenHabitual || "",
    origenCliente: initial?.origenCliente || "",
    notas: initial?.notas || "",
  });

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre *</Label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" />
        </div>
        <div className="space-y-2">
          <Label>Empresa</Label>
          <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Nombre de empresa" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+34 600 000 000" />
        </div>
        <div className="space-y-2">
          <Label>Web</Label>
          <Input value={form.web} onChange={(e) => setForm({ ...form, web: e.target.value })} placeholder="https://..." />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tipo de cliente</Label>
          <Select value={form.tipoCliente} onValueChange={(v) => setForm({ ...form, tipoCliente: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ESTADO_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Select value={form.prioridad} onValueChange={(v) => setForm({ ...form, prioridad: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>CCAA</Label>
          <Input value={form.ccaa} onChange={(e) => setForm({ ...form, ccaa: e.target.value })} placeholder="Ej: Castilla y León" />
        </div>
        <div className="space-y-2">
          <Label>Provincia</Label>
          <Input value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} placeholder="Ej: Soria" />
        </div>
        <div className="space-y-2">
          <Label>Municipio</Label>
          <Input value={form.municipio} onChange={(e) => setForm({ ...form, municipio: e.target.value })} placeholder="Ej: Ágreda" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Especialidad</Label>
          <Input value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} placeholder="Ej: Lechones" />
        </div>
        <div className="space-y-2">
          <Label>Volumen habitual</Label>
          <Input value={form.volumenHabitual} onChange={(e) => setForm({ ...form, volumenHabitual: e.target.value })} placeholder="Ej: 200 cab/mes" />
        </div>
        <div className="space-y-2">
          <Label>Origen del cliente</Label>
          <Input value={form.origenCliente} onChange={(e) => setForm({ ...form, origenCliente: e.target.value })} placeholder="Ej: Feria, Web, Referido" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.preferente === 1}
          onChange={(e) => setForm({ ...form, preferente: e.target.checked ? 1 : 0 })}
          className="h-4 w-4 rounded border-gray-300 text-primary"
        />
        <Label className="cursor-pointer">Cliente preferente (mejores ejemplares)</Label>
      </div>
      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones..." rows={3} />
      </div>
      <Button onClick={() => onSubmit(form)} disabled={loading || !form.nombre} className="w-full">
        {initial ? "Guardar cambios" : "Crear cliente/lead"}
      </Button>
    </div>
  );
}

export default function CrmPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const clientesQuery = trpc.crm.list.useQuery({
    ...filters,
    busqueda: searchTerm || undefined,
  });
  const statsQuery = trpc.crm.stats.useQuery();

  const createMutation = trpc.crm.create.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      utils.crm.stats.invalidate();
      setDialogOpen(false);
      toast.success("Cliente/lead creado correctamente");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.crm.update.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      utils.crm.stats.invalidate();
      setEditingCliente(null);
      toast.success("Cliente actualizado");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.crm.delete.useMutation({
    onSuccess: () => {
      utils.crm.list.invalidate();
      utils.crm.stats.invalidate();
      toast.success("Cliente eliminado");
    },
    onError: (e) => toast.error(e.message),
  });
  const importMutation = trpc.crm.importCsv.useMutation({
    onSuccess: (data) => {
      utils.crm.list.invalidate();
      utils.crm.stats.invalidate();
      setImportDialogOpen(false);
      toast.success(`${data.imported} clientes importados correctamente`);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) { toast.error("CSV vacío o sin datos"); return; }
        const headers = lines[0].split(";").map((h) => h.trim().toLowerCase());
        const clientes = lines.slice(1).map((line) => {
          const vals = line.split(";").map((v) => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => {
            if (h === "nombre") obj.nombre = vals[i] || "";
            else if (h === "empresa") obj.empresa = vals[i];
            else if (h === "email") obj.email = vals[i];
            else if (h === "telefono") obj.telefono = vals[i];
            else if (h === "web") obj.web = vals[i];
            else if (h === "tipo" || h === "tipocliente") obj.tipoCliente = vals[i] || "otro";
            else if (h === "prioridad") obj.prioridad = vals[i] || "media";
            else if (h === "ccaa") obj.ccaa = vals[i];
            else if (h === "provincia") obj.provincia = vals[i];
            else if (h === "municipio") obj.municipio = vals[i];
            else if (h === "especialidad") obj.especialidad = vals[i];
            else if (h === "origen" || h === "origencliente") obj.origenCliente = vals[i];
          });
          return obj;
        }).filter((c) => c.nombre);
        if (clientes.length === 0) { toast.error("No se encontraron clientes válidos"); return; }
        importMutation.mutate({ clientes });
      } catch (err) {
        toast.error("Error al procesar el CSV");
      }
    };
    reader.readAsText(file);
  };

  const stats = statsQuery.data;
  const clientesData = clientesQuery.data || [];

  if (clientesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-20 rounded-xl" />))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de clientes, leads y segmentación geográfica</p>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCsvImport} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />Importar CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nuevo cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Nuevo Cliente / Lead</DialogTitle></DialogHeader>
              <ClienteForm onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Nuevos", value: stats.nuevos, color: "text-blue-600" },
            { label: "Contactados", value: stats.contactados, color: "text-cyan-600" },
            { label: "Propuestas", value: stats.propuestas, color: "text-amber-600" },
            { label: "Cerrados", value: stats.cerrados, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filters.tipo || "todos"} onValueChange={(v) => setFilters({ ...filters, tipo: v === "todos" ? undefined : v })}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {Object.entries(TIPO_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filters.estado || "todos"} onValueChange={(v) => setFilters({ ...filters, estado: v === "todos" ? undefined : v })}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(ESTADO_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filters.prioridad || "todos"} onValueChange={(v) => setFilters({ ...filters, prioridad: v === "todos" ? undefined : v })}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Prioridad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {clientesData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-lg">No hay clientes registrados</p>
            <p className="text-sm mt-2">Añada clientes manualmente o importe un CSV.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesData.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {c.preferente === 1 && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                        <div>
                          <p className="font-medium">{c.nombre}</p>
                          {c.empresa && <p className="text-xs text-muted-foreground">{c.empresa}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{TIPO_LABELS[c.tipoCliente] || c.tipoCliente}</Badge></TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[c.estado] || ""}`}>
                        {ESTADO_LABELS[c.estado] || c.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORIDAD_COLORS[c.prioridad] || ""}`}>
                        {c.prioridad}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(c.provincia || c.ccaa) && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{[c.municipio, c.provincia, c.ccaa].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {c.email && <Mail className="h-3.5 w-3.5" />}
                        {c.telefono && <Phone className="h-3.5 w-3.5" />}
                        {c.web && <Globe className="h-3.5 w-3.5" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCliente(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("¿Eliminar este cliente?")) deleteMutation.mutate({ id: c.id }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCliente} onOpenChange={(open) => !open && setEditingCliente(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          {editingCliente && (
            <ClienteForm
              initial={editingCliente}
              onSubmit={(data) => updateMutation.mutate({ id: editingCliente.id, ...data })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
