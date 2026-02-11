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

const barberosData = [
  {
    id: 1,
    nombres: "Carlos Eduardo",
    apellidos: "Rodriguez Martinez",
    tipoDocumento: "Cédula",
    documento: "1234567890",
    correo: "carlos.rodriguez@barberia.com",
    celular: "+57 300 123 4567",
    direccion: "Carrera 15 # 85-23",
    barrio: "Chapinero",
    fechaNacimiento: "1985-05-15",
    password: "barbero123",
    status: "active",
    fechaCreacion: "01-01-2025",
    avatar: "CR",
    imagenUrl: "",
    rol: "Barbero"
  },
  {
    id: 2,
    nombres: "Miguel Ángel",
    apellidos: "Gonzalez Lopez",
    tipoDocumento: "Cédula",
    documento: "9876543210",
    correo: "miguel.gonzalez@barberia.com",
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
    correo: "juan.martinez@barberia.com",
    celular: "+57 302 345 6789",
    direccion: "Avenida 68 # 45-12",
    barrio: "Engativá",
    fechaNacimiento: "1990-12-03",
    password: "barbero123",
    status: "active",
    fechaCreacion: "10-01-2025",
    avatar: "JM",
    imagenUrl: "",
    rol: "Barbero"
  },
  {
    id: 4,
    nombres: "Andrés Felipe",
    apellidos: "Lopez Rodriguez",
    tipoDocumento: "Cédula de Extranjería",
    documento: "5566778899",
    correo: "andres.lopez@barberia.com",
    celular: "+57 303 456 7890",
    direccion: "Carrera 7 # 127-89",
    barrio: "Usaquén",
    fechaNacimiento: "1988-03-18",
    password: "barbero123",
    status: "inactive",
    fechaCreacion: "12-01-2025",
    avatar: "AL",
    imagenUrl: "",
    rol: "Barbero"
  }
];

const tiposDocumento = ["Cédula", "Cédula de Extranjería", "Pasaporte"];

export function BarberosPage() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [barberos, setBarberos] = useState(barberosData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState<any>(null);
  const [selectedBarbero, setSelectedBarbero] = useState<any>(null);
  const [barberoToDelete, setBarberoToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [newBarbero, setNewBarbero] = useState({
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
    rol: 'Barbero',
    status: 'active',
    imagenUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Filtros de barbero
  const filteredBarberos = barberos.filter(barbero => {
    const searchMatch = barbero.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbero.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barbero.documento.includes(searchTerm) ||
      barbero.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "all" || barbero.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBarberos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBarberos = filteredBarberos.slice(startIndex, startIndex + itemsPerPage);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewBarbero({ ...newBarbero, password });
  };

  const resetForm = () => {
    setNewBarbero({
      nombres: '', apellidos: '', tipoDocumento: '', documento: '', correo: '', celular: '',
      direccion: '', barrio: '', fechaNacimiento: '', password: '', rol: 'Barbero', status: 'active', imagenUrl: ''
    });
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setNewBarbero((prev) => ({ ...prev, imagenUrl: result }));
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setNewBarbero((prev) => ({ ...prev, imagenUrl: '' }));
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateBarbero = () => {
    if (!newBarbero.nombres || !newBarbero.apellidos || !newBarbero.documento || !newBarbero.correo || !newBarbero.celular) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombres, apellidos, documento, correo y celular.");
      return;
    }
    setIsCreateDialogOpen(true);

    const barbero = {
      id: Date.now(),
      ...newBarbero,
      avatar: newBarbero.nombres.split(' ').map(n => n[0]).join('').toUpperCase() +
        newBarbero.apellidos.split(' ').map(n => n[0]).join('').toUpperCase(),
      fechaCreacion: new Date().toLocaleDateString('es-ES')
    };
    setBarberos([barbero, ...barberos]);
    resetForm();
    setIsDialogOpen(false);
    success("¡Barbero creado exitosamente!", `El barbero "${barbero.nombres} ${barbero.apellidos}" ha sido registrado en el sistema y está disponible en la lista de barberos.`);
  };

  const handleEditBarbero = (barbero: any) => {
    setEditingBarbero(barbero);
    setNewBarbero({
      nombres: barbero.nombres,
      apellidos: barbero.apellidos,
      tipoDocumento: barbero.tipoDocumento || '',
      documento: barbero.documento,
      correo: barbero.correo,
      celular: barbero.celular,
      direccion: barbero.direccion || '',
      barrio: barbero.barrio || '',
      fechaNacimiento: barbero.fechaNacimiento || '',
      password: barbero.password,
      rol: barbero.rol,
      status: barbero.status,
      imagenUrl: barbero.imagenUrl || ''
    });
    setPreviewUrl(barbero.imagenUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDialogOpen(true);
  };

  const handleUpdateBarbero = () => {
    if (!newBarbero.nombres || !newBarbero.apellidos || !newBarbero.documento || !newBarbero.correo || !newBarbero.celular) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombres, apellidos, documento, correo y celular.");
      return;
    }
    setIsEditDialogOpen(true);
  };

  const handleDeleteBarbero = (barberoId: number) => {
    const barbero = barberos.find(b => b.id === barberoId);
    if (!barbero) return;

    setBarberoToDelete(barbero);
    setIsDeleteDialogOpen(true);
  };

  const toggleBarberoStatus = (barberoId: number) => {
    setBarberos(barberos.map(barbero =>
      barbero.id === barberoId
        ? { ...barbero, status: barbero.status === 'active' ? 'inactive' : 'active' }
        : barbero
    ));
    const barbero = barberos.find(b => b.id === barberoId);
    toast.success(`Barbero ${barbero?.status === 'active' ? 'desactivado' : 'activado'} exitosamente`, {
      style: {
        background: 'var(--color-gray-darkest)',
        border: '1px solid var(--color-orange-primary)',
        color: 'var(--color-white-primary)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: 'rgba(0, 0, 0, 0.5) 0px 4px 12px'
      },
      icon: barbero?.status === 'active' ? '🔴' : '🟢',
      duration: 4000,
    });
  };


  return (
    <>
      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="elegante-card text-center">
            <Users className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{filteredBarberos.length}</h4>
            <p className="text-gray-lightest text-sm">Barberos Totales</p>
          </div>
          <div className="elegante-card text-center">
            <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {filteredBarberos.filter(b => b.status === 'active').length}
            </h4>
            <p className="text-gray-lightest text-sm">Barberos Activos</p>
          </div>
          <div className="elegante-card text-center">
            <UserX className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {filteredBarberos.filter(b => b.status === 'inactive').length}
            </h4>
            <p className="text-gray-lightest text-sm">Barberos Inactivos</p>
          </div>
          <div className="elegante-card text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {barberos.length}
            </h4>
            <p className="text-gray-lightest text-sm">Total Sistema</p>
          </div>
        </div>

        <div className="elegante-card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            <div className="flex flex-wrap items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center"
                    onClick={() => {
                      setEditingBarbero(null);
                      resetForm();
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Barbero
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-orange-primary" />
                      {editingBarbero ? 'Editar Barbero' : 'Crear Nuevo Barbero'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      {editingBarbero ? 'Modifica los datos del barbero seleccionado' : 'Completa la información del nuevo barbero para agregarlo al sistema'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Identificación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          Tipo de Documento *
                        </Label>
                        <select
                          id="tipoDocumento"
                          value={newBarbero.tipoDocumento}
                          onChange={(e) => setNewBarbero({ ...newBarbero, tipoDocumento: e.target.value })}
                          className="elegante-input w-full"
                          disabled={editingBarbero !== null}
                        >
                          <option value="">Selecciona tipo de documento</option>
                          {tiposDocumento.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          Número de Documento *
                        </Label>
                        <Input
                          id="documento"
                          value={newBarbero.documento}
                          onChange={(e) => setNewBarbero({ ...newBarbero, documento: e.target.value })}
                          className="elegante-input"
                          placeholder="Número de documento"
                        />
                      </div>
                    </div>

                    {/* Información Personal */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Nombres *
                        </Label>
                        <Input
                          id="nombres"
                          value={newBarbero.nombres}
                          onChange={(e) => setNewBarbero({ ...newBarbero, nombres: e.target.value })}
                          className="elegante-input"
                          placeholder="Ingresa los nombres"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Apellidos *
                        </Label>
                        <Input
                          id="apellidos"
                          value={newBarbero.apellidos}
                          onChange={(e) => setNewBarbero({ ...newBarbero, apellidos: e.target.value })}
                          className="elegante-input"
                          placeholder="Ingresa los apellidos"
                        />
                      </div>
                    </div>

                    {/* Fecha de Nacimiento y Foto */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-primary" />
                          Fecha de Nacimiento
                        </Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={newBarbero.fechaNacimiento}
                          onChange={(e) => setNewBarbero({ ...newBarbero, fechaNacimiento: e.target.value })}
                          className="elegante-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Camera className="w-4 h-4 text-orange-primary" />
                          Foto de Perfil
                        </Label>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {previewUrl ? (
                              <div className="relative">
                                <img
                                  src={previewUrl}
                                  alt="Vista previa"
                                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-primary"
                                />
                                <button
                                  onClick={removeProfileImage}
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
                            onClick={triggerFileSelect}
                            className="elegante-button-secondary text-xs px-3 py-1.5 gap-1.5 flex items-center"
                            type="button"
                          >
                            <Camera className="w-3 h-3" />
                            {previewUrl ? 'Cambiar' : 'Subir'}
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
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
                          id="correo"
                          type="email"
                          value={newBarbero.correo}
                          onChange={(e) => setNewBarbero({ ...newBarbero, correo: e.target.value })}
                          className="elegante-input"
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Phone className="w-4 h-4 text-orange-primary" />
                          Número de Celular *
                        </Label>
                        <Input
                          id="celular"
                          value={newBarbero.celular}
                          onChange={(e) => setNewBarbero({ ...newBarbero, celular: e.target.value })}
                          className="elegante-input"
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-primary" />
                          Dirección
                        </Label>
                        <Input
                          id="direccion"
                          value={newBarbero.direccion}
                          onChange={(e) => setNewBarbero({ ...newBarbero, direccion: e.target.value })}
                          className="elegante-input"
                          placeholder="Dirección completa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Home className="w-4 h-4 text-orange-primary" />
                          Barrio
                        </Label>
                        <Input
                          id="barrio"
                          value={newBarbero.barrio}
                          onChange={(e) => setNewBarbero({ ...newBarbero, barrio: e.target.value })}
                          className="elegante-input"
                          placeholder="Nombre del barrio"
                        />
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Lock className="w-4 h-4 text-orange-primary" />
                          Contraseña
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={newBarbero.password}
                            onChange={(e) => setNewBarbero({ ...newBarbero, password: e.target.value })}
                            className="elegante-input pr-10"
                            placeholder="Contraseña del barbero"
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
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Lock className="w-4 h-4 text-orange-primary" />
                          Generar Contraseña
                        </Label>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="elegante-button-secondary w-full"
                        >
                          Generar Contraseña Aleatoria
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                    <button
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                        setEditingBarbero(null);
                      }}
                      className="elegante-button-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingBarbero ? handleUpdateBarbero : handleCreateBarbero}
                      className="elegante-button-primary"
                    >
                      {editingBarbero ? 'Actualizar Barbero' : 'Crear Barbero'}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar por nombre, documento o contacto..."
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

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedBarberos.length} de {filteredBarberos.length} barberos
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Barbero</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Contacto</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Dirección</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm"
                    style={{ paddingLeft: '65px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedBarberos.map(barbero => (
                  <tr key={barbero.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-dark border border-gray-medium flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-lighter" />
                        </div>
                        <span className="text-gray-lighter">{barbero.nombres} {barbero.apellidos}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{barbero.documento}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{barbero.celular}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-lighter">{barbero.direccion}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBarbero(barbero);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleEditBarbero(barbero)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => toggleBarberoStatus(barbero.id)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title={barbero.status === 'active' ? "Desactivar barbero" : "Activar barbero"}
                        >
                          {barbero.status === 'active' ? (
                            <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBarbero(barbero.id)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Eliminar"
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

        {/* Dialog de confirmación para actualizar barbero */}
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Actualización</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas actualizar la información de este barbero? Los cambios se aplicarán inmediatamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (editingBarbero) {
                    setBarberos(barberos.map(b =>
                      b.id === editingBarbero.id
                        ? {
                          ...b,
                          ...newBarbero,
                          avatar: newBarbero.nombres.split(' ').map(n => n[0]).join('').toUpperCase() +
                            newBarbero.apellidos.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                        : b
                    ));
                    success("Barbero actualizado", `Los datos de ${newBarbero.nombres} ${newBarbero.apellidos} han sido actualizados exitosamente.`);
                    setIsDialogOpen(false);
                    setEditingBarbero(null);
                    resetForm();
                  }
                  setIsEditDialogOpen(false);
                }}
                className="elegante-button-primary"
              >
                Actualizar Barbero
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de confirmación para eliminar barbero */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas eliminar al barbero "{barberoToDelete?.nombres} {barberoToDelete?.apellidos}"?
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (barberoToDelete) {
                    setBarberos(barberos.filter(b => b.id !== barberoToDelete.id));
                    success("Barbero eliminado", `El barbero ${barberoToDelete.nombres} ${barberoToDelete.apellidos} ha sido eliminado del sistema.`);
                    setBarberoToDelete(null);
                  }
                  setIsDeleteDialogOpen(false);
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar Barbero
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de detalles del barbero */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-7xl overflow-visible">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalles del Barbero</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa del barbero seleccionado
              </DialogDescription>
            </DialogHeader>

            {selectedBarbero && (
              <div className="grid grid-cols-4 gap-6 pt-4">
                <div className="col-span-4 flex items-center gap-4 p-4 bg-gray-darker rounded-lg border border-gray-dark">
                  <Avatar className="w-16 h-16">
                    {selectedBarbero.imagenUrl ? (
                      <AvatarImage src={selectedBarbero.imagenUrl} alt={`${selectedBarbero.nombres} ${selectedBarbero.apellidos}`} />
                    ) : (
                      <AvatarFallback className="bg-orange-primary text-black-primary text-xl font-bold">
                        {selectedBarbero.avatar}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white-primary">{selectedBarbero.nombres} {selectedBarbero.apellidos}</h3>
                    <p className="text-gray-lighter">{selectedBarbero.correo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-medium text-gray-lighter">
                        {selectedBarbero.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-lighter text-sm mb-2 block">Documento</Label>
                  <p className="text-white-primary text-lg">{selectedBarbero.tipoDocumento}: {selectedBarbero.documento}</p>
                </div>
                <div>
                  <Label className="text-gray-lighter text-sm mb-2 block">Teléfono</Label>
                  <p className="text-white-primary text-lg">{selectedBarbero.celular}</p>
                </div>
                <div>
                  <Label className="text-gray-lighter text-sm mb-2 block">Fecha de Nacimiento</Label>
                  <p className="text-white-primary text-lg">{selectedBarbero.fechaNacimiento || 'No especificada'}</p>
                </div>
                <div>
                  <Label className="text-gray-lighter text-sm mb-2 block">Dirección</Label>
                  <p className="text-white-primary text-lg">{selectedBarbero.direccion || 'No especificada'}</p>
                </div>
                <div>
                  <Label className="text-gray-lighter text-sm mb-2 block">Barrio</Label>
                  <p className="text-white-primary text-lg">{selectedBarbero.barrio || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-gray-lighter text-sm mb-2 block">Fecha de Creación</Label>
                  <p className="text-white-primary text-lg">{selectedBarbero.fechaCreacion}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-dark mt-6">
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
