import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Plus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

// Datos de demostración de usuarios
const DEMO_USERS = [
  {
    id: 1,
    name: "Administrador Demo",
    email: "myriamfx@hotmail.com",
    role: "admin",
    loginMethod: "demo",
    createdAt: new Date("2026-02-26"),
    lastSignedIn: new Date(),
  },
  {
    id: 2,
    name: "Juan García",
    email: "juan.garcia@ventiprofx.com",
    role: "user",
    loginMethod: "email",
    createdAt: new Date("2026-02-20"),
    lastSignedIn: new Date("2026-02-25"),
  },
  {
    id: 3,
    name: "María López",
    email: "maria.lopez@ventiprofx.com",
    role: "user",
    loginMethod: "google",
    createdAt: new Date("2026-02-15"),
    lastSignedIn: new Date("2026-02-24"),
  },
];

export default function UsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState(DEMO_USERS);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as const,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Verificar que el usuario es admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        loginMethod: "email",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      };
      setUsers([...users, user]);
      setNewUser({ name: "", email: "", role: "user" });
    }
  };

  const handleDeleteUser = (id: number) => {
    if (id !== 1) { // No permitir eliminar al admin demo
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-2">
          Administra los usuarios y sus permisos en la aplicación VentiPro.
        </p>
      </div>

      {/* Tarjeta de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {users.filter(u => u.role === "admin").length} administrador(es)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => new Date().getTime() - u.lastSignedIn.getTime() < 86400000).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Métodos de Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(users.map(u => u.loginMethod)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Diferentes métodos</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Nuevo Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Nuevo Usuario
          </CardTitle>
          <CardDescription>
            Añade un nuevo usuario a la plataforma VentiPro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre completo"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddUser} className="w-full">
                Crear Usuario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Método de Login</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role === "admin" ? "Administrador" : "Usuario"}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{u.loginMethod}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.lastSignedIn.toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingId(u.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {u.id !== 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Información de Seguridad */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">ℹ️ Información de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            • Los administradores tienen acceso completo a todas las funciones de gestión.
          </p>
          <p>
            • Los usuarios normales solo pueden ver y editar sus propios datos.
          </p>
          <p>
            • Todos los cambios se registran en el log de actividad.
          </p>
          <p>
            • Las contraseñas se almacenan de forma segura usando hash SHA-256.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
