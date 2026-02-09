import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Layers, Pencil, Trash2 } from "lucide-react";

const FASE_LABELS: Record<string, string> = {
  lactancia: "Lactancia",
  transicion: "Transición",
  cebo: "Cebo",
  vendido: "Vendido",
};

const FASE_COLORS: Record<string, string> = {
  lactancia: "bg-blue-100 text-blue-800",
  transicion: "bg-amber-100 text-amber-800",
  cebo: "bg-green-100 text-green-800",
  vendido: "bg-gray-100 text-gray-600",
};

const CALIDAD_LABELS: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

function LoteForm({
  onSubmit,
  initial,
  loading,
  centros,
}: {
  onSubmit: (data: any) => void;
  initial?: any;
  loading: boolean;
  centros: any[];
}) {
  const [form, setForm] = useState({
    codigo: initial?.codigo || "",
    centroId: initial?.centroId?.toString() || "",
    numAnimales: initial?.numAnimales?.toString() || "",
    pesoActual: initial?.pesoActual?.toString() || "0",
    calidad: initial?.calidad || "media",
    fase: initial?.fase || "lactancia",
    notas: initial?.notas || "",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Código del lote</Label>
          <Input
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            placeholder="Ej: L-2026-001"
          />
        </div>
        <div className="space-y-2">
          <Label>Centro</Label>
          <Select
            value={form.centroId}
            onValueChange={(v) => setForm({ ...form, centroId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar centro" />
            </SelectTrigger>
            <SelectContent>
              {centros.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nombre} ({c.tipo === "cria" ? "Cría" : "Engorde"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Nº Animales</Label>
          <Input
            type="number"
            value={form.numAnimales}
            onChange={(e) => setForm({ ...form, numAnimales: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label>Peso actual (kg)</Label>
          <Input
            type="number"
            step="0.1"
            value={form.pesoActual}
            onChange={(e) => setForm({ ...form, pesoActual: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Calidad</Label>
          <Select
            value={form.calidad}
            onValueChange={(v) => setForm({ ...form, calidad: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Fase</Label>
        <Select
          value={form.fase}
          onValueChange={(v) => setForm({ ...form, fase: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lactancia">Lactancia</SelectItem>
            <SelectItem value="transicion">Transición</SelectItem>
            <SelectItem value="cebo">Cebo</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notas (opcional)</Label>
        <Input
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
          placeholder="Observaciones del lote..."
        />
      </div>
      <Button
        onClick={() =>
          onSubmit({
            ...form,
            centroId: parseInt(form.centroId),
            numAnimales: parseInt(form.numAnimales) || 0,
            pesoActual: form.pesoActual,
          })
        }
        disabled={loading || !form.codigo || !form.centroId || !form.numAnimales}
        className="w-full"
      >
        {initial ? "Guardar cambios" : "Crear lote"}
      </Button>
    </div>
  );
}

export default function LotesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<any>(null);
  const utils = trpc.useUtils();
  const lotesQuery = trpc.lotes.list.useQuery();
  const centrosQuery = trpc.centros.list.useQuery();

  const centros = centrosQuery.data || [];
  const centrosMap = useMemo(() => {
    const map: Record<number, string> = {};
    centros.forEach((c) => (map[c.id] = c.nombre));
    return map;
  }, [centros]);

  const createMutation = trpc.lotes.create.useMutation({
    onSuccess: () => {
      utils.lotes.list.invalidate();
      setDialogOpen(false);
      toast.success("Lote creado correctamente");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.lotes.update.useMutation({
    onSuccess: () => {
      utils.lotes.list.invalidate();
      setEditingLote(null);
      toast.success("Lote actualizado");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.lotes.delete.useMutation({
    onSuccess: () => {
      utils.lotes.list.invalidate();
      toast.success("Lote eliminado");
    },
    onError: (e) => toast.error(e.message),
  });

  if (lotesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const lotesData = lotesQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lotes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión de lotes de animales por fase productiva
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo lote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo Lote</DialogTitle>
            </DialogHeader>
            <LoteForm
              onSubmit={(data) => createMutation.mutate(data)}
              loading={createMutation.isPending}
              centros={centros}
            />
          </DialogContent>
        </Dialog>
      </div>

      {lotesData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-lg">No hay lotes registrados</p>
            <p className="text-sm mt-2">
              Cree su primer lote para empezar a gestionar la producción.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead className="text-center">Animales</TableHead>
                  <TableHead className="text-center">Peso (kg)</TableHead>
                  <TableHead className="text-center">Calidad</TableHead>
                  <TableHead className="text-center">Fase</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotesData.map((lote) => (
                  <TableRow key={lote.id}>
                    <TableCell className="font-medium">{lote.codigo}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {centrosMap[lote.centroId] || `ID ${lote.centroId}`}
                    </TableCell>
                    <TableCell className="text-center">
                      {lote.numAnimales}
                      {lote.numBajas > 0 && (
                        <span className="text-xs text-destructive ml-1">
                          (-{lote.numBajas})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {lote.pesoActual}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {CALIDAD_LABELS[lote.calidad] || lote.calidad}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${FASE_COLORS[lote.fase] || ""}`}
                      >
                        {FASE_LABELS[lote.fase] || lote.fase}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingLote(lote)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            if (confirm("¿Eliminar este lote?"))
                              deleteMutation.mutate({ id: lote.id });
                          }}
                        >
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

      <Dialog
        open={!!editingLote}
        onOpenChange={(open) => !open && setEditingLote(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Lote</DialogTitle>
          </DialogHeader>
          {editingLote && (
            <LoteForm
              initial={editingLote}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingLote.id, ...data })
              }
              loading={updateMutation.isPending}
              centros={centros}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
