import { useState } from "react";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { 
  Users, Plus, Edit, Trash2, Search, UserCheck, UserX, Eye, 
  ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useCustomAlert } from "../ui/custom-alert";
import { UserFormDialog } from "./users/UserFormDialog";
import { UserDetailsDialog } from "./users/UserDetailsDialog";

const usersData = [
  {
    id: 1,
    nombres: "Carlos Eduardo",
    apellidos: "Rodriguez Martinez",
    tipoDocumento: "Cédula",
    documento: "1234567890",
    correo: "carlos@barberia.com",
    celular: "+57 300 123 4567",
    direccion: "Carrera 15 # 85-23",
    barrio: "Chapinero",
    fechaNacimiento: "1985-05-15",
    password: "admin123",
    status: "active",
    fechaCreacion: "01-01-2025",
    avatar: "CR",
    imagenUrl: "",
    rol: "Admin",
    citasRealizadas: 0,
    ultimaVisita: "N/A",
    servicioFavorito: "Administración",
    notas: "Usuario administrador principal del sistema. Acceso completo a todas las funcionalidades.",
    barberoPreferido: "N/A",
    horarioPreferido: "Flexible",
    recibirNotificaciones: true
  },
  {
    id: 2,
    nombres: "Maria Fernanda",
    apellidos: "Gonzalez Lopez",
    tipoDocumento: "Cédula",
    documento: "9876543210",
    correo: "maria@barberia.com", 
    celular: "+57 301 234 5678",
    direccion: "Calle 72 # 10-45",
    barrio: "Zona Rosa",
    fechaNacimiento: "1992-08-22",
    password: "barbero123",
    status: "active",
    fechaCreacion: "05-01-2025",
    avatar: "MG",
    imagenUrl: "",
    rol: "Barbero",
    citasRealizadas: 245,
    ultimaVisita: "20-01-2025",
    servicioFavorito: "Corte + Barba",
    notas: "Barbera especializada en cortes modernos y estilos clásicos. Muy popular entre los clientes.",
    barberoPreferido: "Auto-asignado",
    horarioPreferido: "9:00 AM - 6:00 PM",
    recibirNotificaciones: true
  },
  {
    id: 3,
    nombres: "Juan Carlos",
    apellidos: "Martinez Perez",
    tipoDocumento: "Cédula",
    documento: "1122334455",
    correo: "juan@barberia.com",
    celular: "+57 302 345 6789",
    direccion: "Avenida 68 # 45-12",
    barrio: "Engativá",
    fechaNacimiento: "1990-12-03",
    password: "cliente123",
    status: "active",
    fechaCreacion: "10-01-2025",
    avatar: "JM",
    imagenUrl: "",
    rol: "Cliente",
    citasRealizadas: 12,
    ultimaVisita: "18-01-2025",
    servicioFavorito: "Corte Clásico",
    notas: "Cliente frecuente, prefiere cortes conservadores. Puntual y muy cordial.",
    barberoPreferido: "Maria Fernanda",
    horarioPreferido: "Sábados por la mañana",
    recibirNotificaciones: true
  },
  {
    id: 4,
    nombres: "Ana Sofia",
    apellidos: "Lopez Rodriguez",
    tipoDocumento: "Cédula de Extranjería",
    documento: "5566778899",
    correo: "ana@barberia.com",
    celular: "+57 303 456 7890",
    direccion: "Carrera 7 # 127-89",
    barrio: "Usaquén",
    fechaNacimiento: "1988-03-18",
    password: "recep123",
    status: "inactive",
    fechaCreacion: "12-01-2025",
    avatar: "AL",
    imagenUrl: "",
    rol: "Cliente",
    citasRealizadas: 3,
    ultimaVisita: "05-01-2025",
    servicioFavorito: "Manicure",
    notas: "Cliente esporádica, cuenta inactiva por falta de actividad reciente.",
    barberoPreferido: "Sin preferencia",
    horarioPreferido: "Tardes entre semana",
    recibirNotificaciones: false
  }
];

export function UsersPage() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [users, setUsers] = useState(usersData);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filtros de usuario
  const filteredUsers = users.filter(user => {
    const searchMatch = user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.documento.includes(searchTerm) ||
                       user.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "all" || user.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateUser = (userData: any) => {
    const user = {
      id: Date.now(),
      ...userData,
      avatar: userData.nombres.split(' ').map((n: string) => n[0]).join('').toUpperCase() + 
              userData.apellidos.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      fechaCreacion: new Date().toLocaleDateString('es-ES')
    };
    setUsers([user, ...users]);
    setIsFormDialogOpen(false);
    success("¡Usuario creado exitosamente!", `El usuario "${user.nombres} ${user.apellidos}" ha sido registrado en el sistema.`);
  };

  const handleUpdateUser = (userData: any) => {
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    setEditingUser(null);
    setIsFormDialogOpen(false);
    success("¡Usuario actualizado exitosamente!", "Los cambios han sido guardados correctamente.");
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsFormDialogOpen(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    const user = users.find(u => u.id === userId);
    toast.success(`Usuario ${user?.status === 'active' ? 'desactivado' : 'activado'} exitosamente`);
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "Admin": return "bg-red-600 text-white";
      case "Barbero": return "bg-blue-600 text-white";
      case "Cliente": return "bg-green-600 text-white";
      default: return "bg-gray-medium text-white";
    }
  };

  return (
    <>
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-lightest mt-1">Administra usuarios del sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="elegante-tag-orange">
              {users.length} usuarios
            </div>
            <div className="elegante-tag bg-green-600 text-white">
              Activos: {users.filter(u => u.status === 'active').length}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Main Content */}
        <div className="elegante-card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            <div className="flex flex-wrap items-center gap-4">
              <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center"
                    onClick={() => setEditingUser(null)}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                  </button>
                </DialogTrigger>
                <UserFormDialog
                  editingUser={editingUser}
                  onCreateUser={handleCreateUser}
                  onUpdateUser={handleUpdateUser}
                  onClose={() => {
                    setIsFormDialogOpen(false);
                    setEditingUser(null);
                  }}
                />
              </Dialog>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-lighter w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-80"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="elegante-input"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left p-4 text-gray-lightest font-medium">Usuario</th>
                  <th className="text-left p-4 text-gray-lightest font-medium">Documento</th>
                  <th className="text-left p-4 text-gray-lightest font-medium">Contacto</th>
                  <th className="text-left p-4 text-gray-lightest font-medium">Rol</th>
                  <th className="text-left p-4 text-gray-lightest font-medium">Estado</th>
                  <th className="text-left p-4 text-gray-lightest font-medium">Fecha Creación</th>
                  <th className="text-left p-4 text-gray-lightest font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {user.imagenUrl ? (
                            <AvatarImage src={user.imagenUrl} alt={`${user.nombres} ${user.apellidos}`} />
                          ) : (
                            <AvatarFallback className="bg-orange-primary text-black-primary font-semibold">
                              {user.avatar}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-white-primary">{user.nombres} {user.apellidos}</p>
                          <p className="text-sm text-gray-lighter">{user.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white-primary">{user.documento}</p>
                        <p className="text-sm text-gray-lighter">{user.tipoDocumento}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white-primary">{user.celular}</p>
                        <p className="text-sm text-gray-lighter">{user.direccion}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`elegante-tag ${getRolColor(user.rol)}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`elegante-tag ${user.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-lightest">{user.fechaCreacion}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-400 hover:bg-gray-dark rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-orange-primary hover:bg-gray-dark rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-400 hover:bg-gray-dark rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-dark">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-lighter hover:text-white-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-gray-lightest">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-lighter hover:text-white-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-lightest text-sm">Mostrar</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="elegante-input text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-gray-lightest text-sm">elementos</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <UserDetailsDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        user={selectedUser}
        onEdit={handleEditUser}
      />
      
      <AlertContainer />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="elegante-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary">¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              Esta acción eliminará permanentemente al usuario "{userToDelete?.nombres} {userToDelete?.apellidos}" 
              del sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-gray-dark text-gray-lightest hover:bg-gray-darker"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (userToDelete) {
                  setUsers(users.filter(u => u.id !== userToDelete.id));
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                  toast.success("Usuario eliminado exitosamente");
                }
              }}
            >
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}