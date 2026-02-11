import React, { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import {
  Users, Plus, Edit, Trash2, Mail, Phone, Calendar,
  Search, UserCheck, UserX, Eye, User, ChevronLeft,
  ChevronRight, IdCard, Lock, EyeOff, Settings,
  Scissors, Star, TrendingUp, TrendingDown, Target,
  Award, Crown, Medal, Activity, Filter, MapPin,
  CreditCard, Home, Camera, Upload, ToggleRight, ToggleLeft,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useCustomAlert } from "../ui/custom-alert";

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
    rol: "Admin"
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
    rol: "Barbero"
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
    rol: "Cliente"
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
    rol: "Cliente"
  }
];

const roles = ["Admin", "Barbero", "Cliente"];
const tiposDocumento = ["Cédula", "Cédula de Extranjería", "Pasaporte"];

export function UsersPage() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [users, setUsers] = useState(usersData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    documento: '',
    correo: '',
    celular: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: '',
    password: '',
    rol: '',
    status: 'active',
    imagenUrl: ''
  });
  const userFileInputRef = useRef<HTMLInputElement>(null);
  const [userPreviewUrl, setUserPreviewUrl] = useState<string>('');

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

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const resetForm = () => {
    setNewUser({
      nombres: '', apellidos: '', tipoDocumento: '', documento: '', correo: '', celular: '',
      direccion: '', barrio: '', fechaNacimiento: '', password: '', rol: '', status: 'active', imagenUrl: ''
    });
    setUserPreviewUrl('');
    if (userFileInputRef.current) {
      userFileInputRef.current.value = '';
    }
  };

  const triggerUserFileSelect = () => {
    userFileInputRef.current?.click();
  };

  const handleUserImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewUser((prev) => ({ ...prev, imagenUrl: result }));
      setUserPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const removeUserProfileImage = () => {
    setNewUser((prev) => ({ ...prev, imagenUrl: '' }));
    setUserPreviewUrl('');
    if (userFileInputRef.current) {
      userFileInputRef.current.value = '';
    }
  };

  const handleCreateUser = () => {
    if (!newUser.nombres || !newUser.apellidos || !newUser.documento || !newUser.correo || !newUser.celular || !newUser.rol) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombres, apellidos, documento, correo, celular y rol.");
      return;
    }
    setIsCreateDialogOpen(true);

    const user = {
      id: Date.now(),
      ...newUser,
      avatar: newUser.nombres.split(' ').map(n => n[0]).join('').toUpperCase() +
        newUser.apellidos.split(' ').map(n => n[0]).join('').toUpperCase(),
      fechaCreacion: new Date().toLocaleDateString('es-ES')
    };
    setUsers([user, ...users]);
    resetForm();
    setIsDialogOpen(false);
    success("¡Usuario creado exitosamente!", `El usuario "${user.nombres} ${user.apellidos}" ha sido registrado en el sistema y está disponible en la lista de usuarios.`);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setNewUser({
      nombres: user.nombres,
      apellidos: user.apellidos,
      tipoDocumento: user.tipoDocumento || '',
      documento: user.documento,
      correo: user.correo,
      celular: user.celular,
      direccion: user.direccion || '',
      barrio: user.barrio || '',
      fechaNacimiento: user.fechaNacimiento || '',
      password: user.password,
      rol: user.rol,
      status: user.status,
      imagenUrl: user.imagenUrl || ''
    });
    setUserPreviewUrl(user.imagenUrl || '');
    if (userFileInputRef.current) {
      userFileInputRef.current.value = '';
    }
    setIsDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!newUser.nombres || !newUser.apellidos || !newUser.documento || !newUser.correo || !newUser.celular || !newUser.rol) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombres, apellidos, documento, correo, celular y rol.");
      return;
    }
    setIsEditDialogOpen(true);
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
    toast.success(`Usuario ${user?.status === 'active' ? 'desactivado' : 'activado'} exitosamente`, {
      style: {
        background: 'var(--color-gray-darkest)',
        border: '1px solid var(--color-orange-primary)',
        color: 'var(--color-white-primary)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: 'rgba(0, 0, 0, 0.5) 0px 4px 12px'
      },
      icon: user?.status === 'active' ? '🔴' : '🟢',
      duration: 4000,
    });
  };


  return (
    <>
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-lightest mt-1">Administra usuarios del sistema</p>
          </div>

        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="elegante-card text-center">
            <Users className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{filteredUsers.length}</h4>
            <p className="text-gray-lightest text-sm">Usuarios Totales</p>
          </div>
          <div className="elegante-card text-center">
            <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {filteredUsers.filter(u => u.status === 'active').length}
            </h4>
            <p className="text-gray-lightest text-sm">Usuarios Activos</p>
          </div>
          <div className="elegante-card text-center">
            <UserX className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {filteredUsers.filter(u => u.status === 'inactive').length}
            </h4>
            <p className="text-gray-lightest text-sm">Usuarios Inactivos</p>
          </div>
          <div className="elegante-card text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {users.length}
            </h4>
            <p className="text-gray-lightest text-sm">Total Sistema</p>
          </div>
        </div>

        {/* Sección Principal */}
        <div className="elegante-card">
          {/* Barra de Controles */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            <div className="flex flex-wrap items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center"
                    onClick={() => {
                      setEditingUser(null);
                      resetForm();
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary">
                      {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      {editingUser ? 'Modifica los datos del usuario seleccionado' : 'Completa la información del nuevo usuario para agregarlo al sistema'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Información Personal */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Nombres *
                        </Label>
                        <Input
                          value={newUser.nombres}
                          onChange={(e) => setNewUser({ ...newUser, nombres: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Ingresa los nombres"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Apellidos *
                        </Label>
                        <Input
                          value={newUser.apellidos}
                          onChange={(e) => setNewUser({ ...newUser, apellidos: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Ingresa los apellidos"
                        />
                      </div>
                    </div>

                    {/* Tipo y Número de Documento */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          Tipo de Documento *
                        </Label>
                        <select
                          value={newUser.tipoDocumento}
                          onChange={(e) => setNewUser({ ...newUser, tipoDocumento: e.target.value })}
                          className="elegante-input w-full"
                          disabled={editingUser !== null}
                        >
                          <option value="">Selecciona tipo de documento</option>
                          {tiposDocumento.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          Número de Documento *
                        </Label>
                        <Input
                          value={newUser.documento}
                          onChange={(e) => setNewUser({ ...newUser, documento: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Número de documento"
                        />
                      </div>
                    </div>

                    {/* Fecha de Nacimiento y Rol */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-primary" />
                          Fecha de Nacimiento
                        </Label>
                        <Input
                          type="date"
                          value={newUser.fechaNacimiento}
                          onChange={(e) => setNewUser({ ...newUser, fechaNacimiento: e.target.value })}
                          className="elegante-input w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-orange-primary" />
                          Rol *
                        </Label>
                        <select
                          value={newUser.rol}
                          onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                          className="elegante-input w-full"
                        >
                          <option value="">Selecciona un rol</option>
                          {roles.map(rol => (
                            <option key={rol} value={rol}>{rol}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-primary" />
                          Correo Electrónico *
                        </Label>
                        <Input
                          type="email"
                          value={newUser.correo}
                          onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Phone className="w-4 h-4 text-orange-primary" />
                          Número de Celular *
                        </Label>
                        <Input
                          value={newUser.celular}
                          onChange={(e) => setNewUser({ ...newUser, celular: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    {/* Dirección y Barrio */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Home className="w-4 h-4 text-orange-primary" />
                          Dirección
                        </Label>
                        <Input
                          value={newUser.direccion}
                          onChange={(e) => setNewUser({ ...newUser, direccion: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Dirección completa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-primary" />
                          Barrio
                        </Label>
                        <Input
                          value={newUser.barrio}
                          onChange={(e) => setNewUser({ ...newUser, barrio: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Nombre del barrio"
                        />
                      </div>
                    </div>

                    {/* Foto de Perfil y Contraseña */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Camera className="w-4 h-4 text-orange-primary" />
                          Foto de Perfil
                        </Label>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {userPreviewUrl ? (
                              <div className="relative">
                                <img
                                  src={userPreviewUrl}
                                  alt="Vista previa"
                                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-primary"
                                />
                                <button
                                  onClick={removeUserProfileImage}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                                  type="button"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-dark border-2 border-gray-medium flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-lightest" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={triggerUserFileSelect}
                            className="elegante-button-secondary text-xs px-3 py-1.5 gap-1.5 flex items-center"
                            type="button"
                          >
                            <Camera className="w-3 h-3" />
                            {userPreviewUrl ? 'Cambiar' : 'Subir'}
                          </button>
                        </div>
                        <input
                          ref={userFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUserImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Lock className="w-4 h-4 text-orange-primary" />
                          Contraseña
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="elegante-input w-full pr-10"
                            placeholder="Contraseña del usuario"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Botón Generar Contraseña */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="elegante-button-secondary"
                      >
                        Generar Contraseña
                      </button>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                      <button
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                          setEditingUser(null);
                        }}
                        className="elegante-button-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={editingUser ? handleUpdateUser : handleCreateUser}
                        className="elegante-button-primary"
                      >
                        {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-lighter w-4 h-4 pointer-events-none z-10" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="elegante-input w-48"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Usuario</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Contacto</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Rol</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Dirección</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm"
                    style={{ paddingLeft: '65px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-dark border border-gray-medium flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-lighter" />
                        </div>
                        <span className="text-gray-lighter">{user.correo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{user.documento || "—"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{user.celular || "—"}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">
                        {user.rol}
                      </span>
                    </td>
                    <td className="py-4 px-4 pl-20 text-gray-lighter"
                      style={{ paddingLeft: '80px' }}>{user.direccion}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar usuario"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title={user.status === 'active' ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.status === 'active' ? (
                            <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-dark">
            <div className="text-sm text-gray-lightest">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-dark hover:bg-gray-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-lightest" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-dark hover:bg-gray-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-lightest" />
              </button>
            </div>
          </div>
        </div>

        {/* Dialog de confirmación para actualizar usuario */}
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Actualización</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas actualizar la información de este usuario? Los cambios se aplicarán inmediatamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (editingUser) {
                    setUsers(users.map(u =>
                      u.id === editingUser.id
                        ? {
                          ...u,
                          ...newUser,
                          avatar: newUser.nombres.split(' ').map(n => n[0]).join('').toUpperCase() +
                            newUser.apellidos.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                        : u
                    ));
                    success("Usuario actualizado", `Los datos de ${newUser.nombres} ${newUser.apellidos} han sido actualizados exitosamente.`);
                    setIsDialogOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }
                  setIsEditDialogOpen(false);
                }}
                className="elegante-button-primary"
              >
                Actualizar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de confirmación para eliminar usuario */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas eliminar al usuario "{userToDelete?.nombres} {userToDelete?.apellidos}"?
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (userToDelete) {
                    setUsers(users.filter(u => u.id !== userToDelete.id));
                    success("Usuario eliminado", `El usuario ${userToDelete.nombres} ${userToDelete.apellidos} ha sido eliminado del sistema.`);
                    setUserToDelete(null);
                  }
                  setIsDeleteDialogOpen(false);
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar Usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de detalles del usuario */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-7xl overflow-visible">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalles del Usuario</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa del usuario seleccionado
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="grid grid-cols-4 gap-6 py-6">
                <div className="col-span-4 flex items-center gap-4 p-4 bg-gray-darker rounded-lg border border-gray-dark">
                  <Avatar className="w-16 h-16">
                    {selectedUser.imagenUrl ? (
                      <AvatarImage src={selectedUser.imagenUrl} alt={`${selectedUser.nombres} ${selectedUser.apellidos}`} />
                    ) : (
                      <AvatarFallback className="bg-orange-primary text-black-primary text-xl font-bold">
                        {selectedUser.avatar}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white-primary">{selectedUser.nombres} {selectedUser.apellidos}</h3>
                    <p className="text-gray-lighter">{selectedUser.correo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-white-primary">
                        {selectedUser.rol}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedUser.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        {selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 grid grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-lighter text-sm">Documento</Label>
                      <p className="text-white-primary">{selectedUser.tipoDocumento}: {selectedUser.documento}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm">Teléfono</Label>
                      <p className="text-white-primary">{selectedUser.celular}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm">Fecha de Nacimiento</Label>
                      <p className="text-white-primary">{selectedUser.fechaNacimiento || 'No especificada'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-lighter text-sm">Dirección</Label>
                      <p className="text-white-primary">{selectedUser.direccion || 'No especificada'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm">Barrio</Label>
                      <p className="text-white-primary">{selectedUser.barrio || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm">Fecha de Creación</Label>
                      <p className="text-white-primary">{selectedUser.fechaCreacion}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-dark">
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="elegante-button-secondary"
              >
                Cerrar
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertContainer />
      </main>
    </>
  );
}