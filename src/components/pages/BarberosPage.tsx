import React, { useRef, useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import {
  Users, Plus, Edit, Trash2, Mail, Phone, Calendar,
  Search, UserCheck, UserX, Eye, User, ChevronLeft,
  ChevronRight, IdCard, Lock, EyeOff, Scissors, Star,
  TrendingUp, TrendingDown, Target, Award, Crown, Medal,
  Activity, Filter, MapPin, CreditCard, Home, Camera,
  Upload, ToggleRight, ToggleLeft, X, Loader2
} from "lucide-react";
import { useCustomAlert } from "../ui/custom-alert";
import { barberosService, Barbero, CreateBarberoData } from "../../services/barberosService";

const tiposDocumento = ["Cédula", "Cédula de Extranjería", "Pasaporte"];

export function BarberosPage() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBarbero, setEditingBarbero] = useState<Barbero | null>(null);
  const [selectedBarbero, setSelectedBarbero] = useState<Barbero | null>(null);
  const [barberoToDelete, setBarberoToDelete] = useState<Barbero | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [newBarbero, setNewBarbero] = useState<CreateBarberoData>({
    nombre: '',
    apellido: '',
    tipoDocumento: '',
    documento: '',
    correo: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: '',
    rol: 'Barbero',
    status: 'active',
    fotoPerfil: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Cargar barberos desde la API al montar el componente
  useEffect(() => {
    loadBarberos();
  }, []);

  const loadBarberos = async () => {
    try {
      setLoading(true);
      const data = await barberosService.getBarberos();
      const mappedData = data.map(barbero => barberosService.mapApiToComponent(barbero));
      setBarberos(mappedData);
    } catch (err: unknown) {
      console.error('Error cargando barberos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error("Error", `No se pudieron cargar los barberos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtros de barbero
  const filteredBarberos = barberos.filter(barbero => {
    const searchMatch = (barbero.nombres || barbero.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (barbero.apellidos || barbero.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (barbero.correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (barbero.documento || '').includes(searchTerm);

    const statusMatch = filterStatus === "all" ||
      (filterStatus === "active" && barbero.status === 'active') ||
      (filterStatus === "inactive" && barbero.status === 'inactive');

    return searchMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBarberos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBarberos = filteredBarberos.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = () => {
    setNewBarbero({
      nombre: '', apellido: '', tipoDocumento: '', documento: '', correo: '', telefono: '',
      direccion: '', barrio: '', fechaNacimiento: '', rol: 'Barbero', status: 'active', fotoPerfil: ''
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
      setNewBarbero((prev) => ({ ...prev, fotoPerfil: result }));
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setNewBarbero((prev) => ({ ...prev, fotoPerfil: '' }));
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateBarbero = async () => {
    if (!newBarbero.nombre || !newBarbero.apellido || !newBarbero.documento || !newBarbero.correo || !newBarbero.telefono) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombre, apellido, documento, correo y teléfono.");
      return;
    }

    try {
      const createdBarbero = await barberosService.createBarbero(newBarbero);
      const mappedBarbero = barberosService.mapApiToComponent(createdBarbero);
      setBarberos([mappedBarbero, ...barberos]);
      resetForm();
      setIsDialogOpen(false);
      success("¡Barbero creado exitosamente!", `El barbero "${mappedBarbero.nombre} ${mappedBarbero.apellido}" ha sido registrado en el sistema.`);
    } catch (err: unknown) {
      console.error('Error creando barbero:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error("Error", `No se pudo crear el barbero: ${errorMessage}`);
    }
  };

  const handleEditBarbero = (barbero: Barbero) => {
    setEditingBarbero(barbero);
    setNewBarbero({
      nombre: barbero.nombre || barbero.nombres || '',
      apellido: barbero.apellido || barbero.apellidos || '',
      tipoDocumento: barbero.tipoDocumento || '',
      documento: barbero.documento || '',
      correo: barbero.correo || '',
      telefono: barbero.telefono || barbero.celular || '',
      direccion: barbero.direccion || '',
      barrio: barbero.barrio || '',
      fechaNacimiento: barbero.fechaNacimiento || '',
      rol: barbero.rol || 'Barbero',
      status: barbero.status || 'active',
      fotoPerfil: barbero.fotoPerfil || barbero.imagenUrl || ''
    });
    setPreviewUrl(barbero.fotoPerfil || barbero.imagenUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDialogOpen(true);
  };

  const handleUpdateBarbero = async () => {
    if (!editingBarbero || !newBarbero.nombre || !newBarbero.apellido || !newBarbero.documento || !newBarbero.correo || !newBarbero.telefono) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombre, apellido, documento, correo y teléfono.");
      return;
    }

    try {
      // Mapear datos del componente a la API
      const apiData = barberosService.mapComponentToApi({
        ...newBarbero,
        id: editingBarbero.id
      });

      const updatedBarbero = await barberosService.updateBarbero(editingBarbero.id, apiData);
      const mappedBarbero = barberosService.mapApiToComponent(updatedBarbero);

      setBarberos(barberos.map(b => b.id === editingBarbero.id ? mappedBarbero : b));
      resetForm();
      setIsDialogOpen(false);
      setEditingBarbero(null);
      success("¡Barbero actualizado!", `Los datos del barbero "${mappedBarbero.nombre} ${mappedBarbero.apellido}" han sido actualizados exitosamente.`);
    } catch (err: unknown) {
      console.error('Error actualizando barbero:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error("Error", `No se pudo actualizar el barbero: ${errorMessage}`);
    }
  };

  const handleDeleteBarbero = (barbero: Barbero) => {
    setBarberoToDelete(barbero);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBarbero = async () => {
    if (!barberoToDelete) return;

    try {
      await barberosService.deleteBarbero(barberoToDelete.id);
      setBarberos(barberos.filter(b => b.id !== barberoToDelete.id));
      setIsDeleteDialogOpen(false);
      setBarberoToDelete(null);
      success("¡Barbero eliminado!", `El barbero "${barberoToDelete.nombre || barberoToDelete.nombres} ${barberoToDelete.apellido || barberoToDelete.apellidos}" ha sido eliminado del sistema.`);
    } catch (err: unknown) {
      console.error('Error eliminando barbero:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error("Error", `No se pudo eliminar el barbero: ${errorMessage}`);
    }
  };

  // Función para cambiar el estado del barbero (activo/inactivo)
  const toggleBarberoStatus = async (barberoId: number) => {
    try {
      const barbero = barberos.find(b => b.id === barberoId);
      if (!barbero) {
        console.error('Barbero no encontrado con ID:', barberoId);
        return;
      }

      const nuevoEstado = barbero.status === 'active' ? 'inactive' : 'active';
      const estadoBoolean = nuevoEstado === 'active';

      // Usar el nuevo método específico para estado
      await barberosService.updateBarberoStatus(barberoId, estadoBoolean);

      // Actualizar localmente
      setBarberos(prev => prev.map(b =>
        b.id === barberoId
          ? { ...b, status: nuevoEstado as 'active' | 'inactive' }
          : b
      ));

      success(
        `Barbero ${nuevoEstado === 'active' ? 'activado' : 'desactivado'}`,
        `El barbero "${barbero.nombre || barbero.nombres} ${barbero.apellido || barbero.apellidos}" ha sido ${nuevoEstado === 'active' ? 'activado' : 'desactivado'} exitosamente.`
      );
    } catch (err: unknown) {
      console.error('Error cambiando estado del barbero:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      error("Error", `No se pudo cambiar el estado del barbero: ${errorMessage}`);
    }
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
                    {/* Foto de Perfil y Tipo de Documento */}
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    {/* Información Personal y Documento */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          Número de Documento *
                        </Label>
                        <Input
                          id="documento"
                          value={newBarbero.documento}
                          onChange={(e) => setNewBarbero({ ...newBarbero, documento: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Número de documento"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Nombres *
                        </Label>
                        <Input
                          id="nombres"
                          value={newBarbero.nombre || ''}
                          onChange={(e) => setNewBarbero({ ...newBarbero, nombre: e.target.value })}
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
                          id="apellidos"
                          value={newBarbero.apellido || ''}
                          onChange={(e) => setNewBarbero({ ...newBarbero, apellido: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Ingresa los apellidos"
                        />
                      </div>
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
                          className="elegante-input w-full"
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
                          value={newBarbero.correo || ''}
                          onChange={(e) => setNewBarbero({ ...newBarbero, correo: e.target.value })}
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
                          id="celular"
                          value={newBarbero.telefono || ''}
                          onChange={(e) => setNewBarbero({ ...newBarbero, telefono: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    {/* Especialidad */}
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-orange-primary" />
                        Especialidad
                      </Label>
                      <Input
                        id="especialidad"
                        value={newBarbero.especialidad || ''}
                        onChange={(e) => setNewBarbero({ ...newBarbero, especialidad: e.target.value })}
                        className="elegante-input w-full"
                        placeholder="Ej: Cortes masculinos, Afeitados, Coloración, etc."
                      />
                    </div>

                    {/* Dirección */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Home className="w-4 h-4 text-orange-primary" />
                          Dirección
                        </Label>
                        <Input
                          id="direccion"
                          value={newBarbero.direccion}
                          onChange={(e) => setNewBarbero({ ...newBarbero, direccion: e.target.value })}
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
                          id="barrio"
                          value={newBarbero.barrio}
                          onChange={(e) => setNewBarbero({ ...newBarbero, barrio: e.target.value })}
                          className="elegante-input w-full"
                          placeholder="Nombre del barrio"
                        />
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
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-orange-primary animate-spin mr-3" />
                <span className="text-white-primary">Cargando barberos...</span>
              </div>
            ) : (
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
                          <span className="text-gray-lighter">{barbero.nombre || barbero.nombres} {barbero.apellido || barbero.apellidos}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">{barbero.documento}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">{barbero.telefono || barbero.celular}</span>
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
                            onClick={() => handleDeleteBarbero(barbero)}
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
            )}
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
                          avatar: (newBarbero.nombre || '').split(' ').map(n => n[0]).join('').toUpperCase() +
                            (newBarbero.apellido || '').split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                        : b
                    ));
                    success("Barbero actualizado", `Los datos de ${newBarbero.nombre || ''} ${newBarbero.apellido || ''} han sido actualizados exitosamente.`);
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
                onClick={confirmDeleteBarbero}
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
              <div className="pt-4">
                {/* Información principal con foto */}
                <div className="flex items-center gap-4 p-4 bg-gray-darker rounded-lg border border-gray-dark mb-6">
                  <Avatar className="w-16 h-16">
                    {selectedBarbero.imagenUrl ? (
                      <AvatarImage src={selectedBarbero.imagenUrl || selectedBarbero.fotoPerfil} alt={`${selectedBarbero.nombre || selectedBarbero.nombres} ${selectedBarbero.apellido || selectedBarbero.apellidos}`} />
                    ) : (
                      <AvatarFallback className="bg-orange-primary text-black-primary text-xl font-bold">
                        {selectedBarbero.avatar}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white-primary">{selectedBarbero.nombre || selectedBarbero.nombres} {selectedBarbero.apellido || selectedBarbero.apellidos}</h3>
                    <p className="text-gray-lighter">{selectedBarbero.correo}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-medium text-gray-lighter">
                        {selectedBarbero.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información detallada en dos columnas */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-lighter text-sm mb-2 block">Documento</Label>
                      <p className="text-white-primary text-lg">{selectedBarbero.tipoDocumento}: {selectedBarbero.documento}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm mb-2 block">Teléfono</Label>
                      <p className="text-white-primary text-lg">{selectedBarbero.telefono || selectedBarbero.celular}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm mb-2 block">Especialidad</Label>
                      <p className="text-white-primary text-lg">{selectedBarbero.especialidad || 'No especificada'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lighter text-sm mb-2 block">Fecha de Nacimiento</Label>
                      <p className="text-white-primary text-lg">{selectedBarbero.fechaNacimiento || 'No especificada'}</p>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-4">
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
                    <div>
                      <Label className="text-gray-lighter text-sm mb-2 block">ID de Usuario</Label>
                      <p className="text-white-primary text-lg">{selectedBarbero.usuarioId || 'No asignado'}</p>
                    </div>
                  </div>
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
