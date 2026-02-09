import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Building2, MapPin, Pencil, Trash2 } from "lucide-react";

// Auto-rellenado inteligente según tipo de centro
const DEFAULTS_POR_TIPO: Record<string, { provincia: string; ccaa: string }> = {
  cria: { provincia: "Zaragoza", ccaa: "Aragón" },
  engorde: { provincia: "Soria", ccaa: "Castilla y León" },
};

function CentroForm({
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
    tipo: initial?.tipo || "cria",
    ubicacion: initial?.ubicacion || "",
    provincia: initial?.provincia || DEFAULTS_POR_TIPO["cria"].provincia,
    ccaa: initial?.ccaa || DEFAULTS_POR_TIPO["cria"].ccaa,
    plazasTotales: initial?.plazasTotales?.toString() || "",
    plazasOcupadas: initial?.plazasOcupadas?.toString() || "0",
    descripcion: initial?.descripcion || "",
  });

  const handleTipoChange = (tipo: string) => {
    const defaults = DEFAULTS_POR_TIPO[tipo] || { provincia: "", ccaa: "" };
    // Solo auto-rellenar si los campos están vacíos o tienen los valores por defecto del tipo anterior
    const prevDefaults = DEFAULTS_POR_TIPO[form.tipo] || { provincia: "", ccaa: "" };
    const newProvincia = (!form.provincia || form.provincia === prevDefaults.provincia) ? defaults.provincia : form.provincia;
    const newCcaa = (!form.ccaa || form.ccaa === prevDefaults.ccaa) ? defaults.ccaa : form.ccaa;
    setForm({ ...form, tipo, provincia: newProvincia, ccaa: newCcaa });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre del centro <span className="text-destructive">*</span></Label>
          <Input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Granja Aragón"
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo <span className="text-destructive">*</span></Label>
          <Select
            value={form.tipo}
            onValueChange={handleTipoChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cria">Cría</SelectItem>
              <SelectItem value="engorde">Engorde</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Ubicación <span className="text-destructive">*</span></Label>
          <Input
            value={form.ubicacion}
            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            placeholder="Dirección o localidad"
          />
        </div>
        <div className="space-y-2">
          <Label>Provincia</Label>
          <Input
            value={form.provincia}
            onChange={(e) => setForm({ ...form, provincia: e.target.value })}
            placeholder="Ej: Zaragoza"
          />
        </div>
        <div className="space-y-2">
          <Label>CCAA</Label>
          <Input
            value={form.ccaa}
            onChange={(e) => setForm({ ...form, ccaa: e.target.value })}
            placeholder="Ej: Aragón"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plazas totales <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            value={form.plazasTotales}
            onChange={(e) =>
              setForm({ ...form, plazasTotales: e.target.value })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Plazas ocupadas</Label>
          <Input
            type="number"
            value={form.plazasOcupadas}
            onChange={(e) =>
              setForm({ ...form, plazasOcupadas: e.target.value })
            }
            placeholder="0"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descripción (opcional)</Label>
        <Input
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Notas sobre el centro..."
        />
      </div>
      <Button
        onClick={() => {
          if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
          if (!form.ubicacion.trim()) { toast.error("La ubicación es obligatoria"); return; }
          if (!form.plazasTotales || parseInt(form.plazasTotales) <= 0) { toast.error("Las plazas totales deben ser mayor que 0"); return; }
          onSubmit({
            ...form,
            plazasTotales: parseInt(form.plazasTotales) || 0,
            plazasOcupadas: parseInt(form.plazasOcupadas) || 0,
          });
        }}
        disabled={loading}
        className="w-full"
      >
        {initial ? "Guardar cambios" : "Crear centro"}
      </Button>
    </div>
  );
}

export default function CentrosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCentro, setEditingCentro] = useState<any>(null);
  const utils = trpc.useUtils();
  const centrosQuery = trpc.centros.list.useQuery();
  const createMutation = trpc.centros.create.useMutation({
    onSuccess: () => {
      utils.centros.list.invalidate();
      setDialogOpen(false);
      toast.success("Centro creado correctamente");
    },
    onError: (e) => toast.error("Error al crear centro: " + e.message),
  });
  const updateMutation = trpc.centros.update.useMutation({
    onSuccess: () => {
      utils.centros.list.invalidate();
      setEditingCentro(null);
      toast.success("Centro actualizado");
    },
    onError: (e) => toast.error("Error al actualizar: " + e.message),
  });
  const deleteMutation = trpc.centros.delete.useMutation({
    onSuccess: () => {
      utils.centros.list.invalidate();
      toast.success("Centro eliminado");
    },
    onError: (e) => toast.error("Error al eliminar: " + e.message),
  });

  if (centrosQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const centros = centrosQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centros</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión de centros de cría y engorde
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo centro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Centro</DialogTitle>
            </DialogHeader>
            <CentroForm
              onSubmit={(data) => createMutation.mutate(data)}
              loading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {centros.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-lg">No hay centros registrados</p>
            <p className="text-sm mt-2">
              Añada su primer centro de cría o engorde para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centros.map((centro) => {
            const pct =
              centro.plazasTotales > 0
                ? Math.round(
                    (centro.plazasOcupadas / centro.plazasTotales) * 100
                  )
                : 0;
            return (
              <Card key={centro.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">
                        {centro.nombre}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          centro.tipo === "cria" ? "default" : "secondary"
                        }
                      >
                        {centro.tipo === "cria" ? "Cría" : "Engorde"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingCentro(centro)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          if (confirm("¿Eliminar este centro?"))
                            deleteMutation.mutate({ id: centro.id });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {centro.ubicacion}
                      {centro.provincia && ` · ${centro.provincia}`}
                      {centro.ccaa && ` (${centro.ccaa})`}
                    </span>
                  </div>
                  {centro.descripcion && (
                    <p className="text-xs text-muted-foreground">
                      {centro.descripcion}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ocupación</span>
                      <span className="font-semibold">
                        {centro.plazasOcupadas} / {centro.plazasTotales}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2.5" />
                    <div className="flex justify-between text-xs">
                      <span
                        className={`font-medium ${pct > 85 ? "text-destructive" : "text-primary"}`}
                      >
                        {pct}% ocupado
                      </span>
                      <span className="text-muted-foreground">
                        {centro.plazasTotales - centro.plazasOcupadas} plazas
                        libres
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCentro}
        onOpenChange={(open) => !open && setEditingCentro(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Centro</DialogTitle>
          </DialogHeader>
          {editingCentro && (
            <CentroForm
              initial={editingCentro}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingCentro.id, ...data })
              }
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
