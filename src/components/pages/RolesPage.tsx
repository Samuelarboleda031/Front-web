import { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "../ui/input";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCheck,
  FileText,
  Check,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { useCustomAlert } from "../ui/custom-alert";
import { rolesApiService, RoleWithModules, CreateRoleData, UpdateRoleData, PermisoModulo } from "@/services/rolesApiService";
import { modulosService, Modulo } from "@/services/modulosService";

// Interfaz extendida para módulos con propiedades adicionales
interface ModuloExtendido {
  id: string;
  nombre: string;
  estado: boolean;
  icono: any;
  color: string;
  descripcion: string;
  rolesModulos?: any[];
}

export function RolesPageModular() {
  const { success: showSuccess, error: showError, AlertContainer } = useCustomAlert();
  const [roles, setRoles] = useState<RoleWithModules[]>([]);
  const [modulosProyecto, setModulosProyecto] = useState<ModuloExtendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithModules | null>(null);
  const [editingRole, setEditingRole] = useState<RoleWithModules | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithModules | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [nuevoRol, setNuevoRol] = useState<CreateRoleData>({
    nombre: '',
    descripcion: '',
    modulos: []
  });

  // Adaptar módulos de la API al formato esperado por el componente
  const adaptarModulos = useCallback((modulos: Modulo[]): ModuloExtendido[] => {
    return modulos.map(modulo => ({
      ...modulo,
      id: modulo.id.toString(), // Convertir id a string
      icono: Settings, // Icono por defecto
      color: 'blue', // Color por defecto
      descripcion: modulo.nombre // Usar nombre como descripción
    }));
  }, []);

  // Cargar roles desde la API
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📋 Iniciando carga de roles y módulos...');
      
      // Cargar roles y módulos en paralelo
      const [rolesData, modulosData] = await Promise.all([
        rolesApiService.getRolesWithModules(),
        modulosService.getModulos()
      ]);
      
      setRoles(rolesData);
      setModulosProyecto(adaptarModulos(modulosData));
      console.log('✅ Roles cargados correctamente:', rolesData.length);
      console.log('✅ Módulos cargados correctamente:', modulosData.length);
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      showError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [showError, adaptarModulos]);

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Filtrar roles según el término de búsqueda
  const filteredRoles = useMemo(() => {
    return roles.filter((rol) =>
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  // Validación unificada para roles
  const validateRoleData = useCallback((roleData: { nombre: string; modulos: string[] }) => {
    if (!roleData.nombre.trim()) {
      showError("El nombre del rol es obligatorio");
      return false;
    }

    if (roleData.modulos.length === 0) {
      showError("Debe seleccionar al menos un módulo");
      return false;
    }

    const modulosValidos = roleData.modulos.every(id => 
      modulosProyecto.find(m => m.id === id)
    );
    if (!modulosValidos) {
      showError("Uno o más módulos seleccionados no existen");
      return false;
    }

    return true;
  }, [showError]);

  // Funciones para manejar la selección de módulos
  const toggleModulo = useCallback((moduloId: string, isEditing: boolean = false) => {
    if (isEditing) {
      setEditingRole((prev) => ({
        ...prev!,
        modulos: prev!.modulos.includes(moduloId)
          ? prev!.modulos.filter((id: string) => id !== moduloId)
          : [...prev!.modulos, moduloId]
      }));
    } else {
      setNuevoRol((prev) => ({
        ...prev,
        modulos: prev.modulos.includes(moduloId)
          ? prev.modulos.filter((id: string) => id !== moduloId)
          : [...prev.modulos, moduloId]
      }));
    }
  }, []);

  const selectAllModulos = useCallback((isEditing: boolean = false) => {
    const allModulosIds = modulosProyecto.map(m => m.id);
    if (isEditing) {
      setEditingRole((prev) => ({ ...prev!, modulos: allModulosIds }));
    } else {
      setNuevoRol((prev) => ({ ...prev, modulos: allModulosIds }));
    }
  }, []);

  const deselectAllModulos = useCallback((isEditing: boolean = false) => {
    if (isEditing) {
      setEditingRole((prev) => ({ ...prev!, modulos: [] }));
    } else {
      setNuevoRol((prev) => ({ ...prev, modulos: [] }));
    }
  }, []);

  // Función para crear nuevo rol
  const handleCreateRole = useCallback (async () => {
    if (!validateRoleData(nuevoRol)) return;

    try {
      setIsCreating(true);
      console.log('➕ Creando nuevo rol con módulos:', nuevoRol.modulos);
      
      const newRole = await rolesApiService.createRoleWithModules({
        nombre: nuevoRol.nombre.trim(),
        descripcion: nuevoRol.descripcion?.trim() || '',
        modulos: nuevoRol.modulos
      });

      // Validar que el rol creado tenga módulos
      if (!newRole.modulos || newRole.modulos.length === 0) {
        console.warn('⚠️ Rol creado sin módulos, recargando...');
        await loadRoles();
      } else {
        setRoles(prev => [...prev, newRole]);
        console.log('✅ Rol creado con permisos:', newRole.permisosPorModulo);
      }

      setNuevoRol({ nombre: '', descripcion: '', modulos: [] });
      setIsDialogOpen(false);
      showSuccess(`Rol "${newRole.nombre}" creado exitosamente con ${newRole.modulos.length} módulo(s)`);
      console.log('✅ Rol creado:', newRole);
    } catch (err) {
      console.error('❌ Error creando rol:', err);
      showError(err instanceof Error ? err.message : 'Error al crear el rol. Por favor, intente nuevamente.');
    } finally {
      setIsCreating(false);
    }
  }, [nuevoRol, validateRoleData, loadRoles, showSuccess, showError]);

  // Función para editar rol
  const handleEditRole = useCallback (async () => {
    if (!editingRole || !validateRoleData(editingRole)) return;

    try {
      setIsEditing(true);
      console.log('🔧 Actualizando rol con módulos:', editingRole.modulos);
      
      const updateData: UpdateRoleData = {
        nombre: editingRole.nombre.trim(),
        descripcion: editingRole.descripcion?.trim() || '',
        modulos: editingRole.modulos,
        estado: editingRole.estado === true
      };
      
      const updatedRole = await rolesApiService.updateRoleWithModules(
        parseInt(editingRole.id), 
        updateData
      );
      
      // Validar que el rol actualizado tenga módulos
      if (!updatedRole.modulos || updatedRole.modulos.length === 0) {
        console.warn('⚠️ Rol actualizado sin módulos, recargando...');
        await loadRoles();
      } else {
        setRoles(prev => prev.map(rol => 
          rol.id === editingRole.id ? updatedRole : rol
        ));
        console.log('✅ Rol actualizado con permisos:', updatedRole.permisosPorModulo);
      }
      
      setIsEditDialogOpen(false);
      setEditingRole(null);
      showSuccess(`Rol "${updatedRole.nombre}" actualizado exitosamente`);
      console.log('✅ Rol actualizado:', updatedRole);
    } catch (err) {
      console.error('❌ Error actualizando rol:', err);
      showError(err instanceof Error ? err.message : 'Error al actualizar el rol. Por favor, intente nuevamente.');
    } finally {
      setIsEditing(false);
    }
  }, [editingRole, validateRoleData, loadRoles, showSuccess, showError]);

  // Función para eliminar rol
  const handleDeleteRole = useCallback (async () => {
    if (roleToDelete) {
      try {
        setIsDeleting(true);
        console.log('🗑️ Eliminando rol...');
        await rolesApiService.deleteRole(parseInt(roleToDelete.id));
        setRoles(prev => prev.filter(rol => rol.id !== roleToDelete.id));
        showSuccess(`Rol "${roleToDelete.nombre}" eliminado exitosamente`);
        setIsDeleteDialogOpen(false);
        setRoleToDelete(null);
        console.log('✅ Rol eliminado correctamente.');
      } catch (err) {
        console.error('❌ Error eliminando rol:', err);
        showError('Error al eliminar el rol. Por favor, intente nuevamente.');
      } finally {
        setIsDeleting(false);
      }
    }
  }, [roleToDelete, showSuccess, showError]);

  const getModuloInfo = useCallback((moduloId: string) => {
    return modulosProyecto.find(m => m.id === moduloId);
  }, []);

  // Componente para mostrar la selección de módulos con permisos granulares
  const ModuleSelector = useCallback(({ 
    modulos, 
    onToggle, 
    isEditing = false, 
    showSelectAll = true,
    showPermisos = false,
    permisos = {}
  }: { 
    modulos: string[]; 
    onToggle: (id: string, isEdit: boolean) => void; 
    isEditing?: boolean; 
    showSelectAll?: boolean;
    showPermisos?: boolean;
    permisos?: Record<string, PermisoModulo>;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white-primary flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-primary" />
          Acceso a Módulos del Sistema
        </Label>
        <div className="text-sm text-gray-lightest">
          Seleccionados: {modulos.length} de {modulosProyecto.length}
        </div>
      </div>

      {showSelectAll && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => selectAllModulos(isEditing)}
            className="text-xs px-3 py-1 bg-orange-primary/20 border border-orange-primary/30 rounded-lg text-orange-primary hover:bg-orange-primary/30 transition-colors"
          >
            Seleccionar Todos
          </button>
          <button
            type="button"
            onClick={() => deselectAllModulos(isEditing)}
            className="text-xs px-3 py-1 bg-gray-medium text-gray-lightest rounded-lg hover:bg-gray-light transition-colors"
          >
            Deseleccionar Todos
          </button>
        </div>
      )}

      <div className="p-4 bg-gray-darker rounded-lg space-y-3 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {modulosProyecto.map((modulo) => {
            const IconComponent = modulo.icono;
            const isSelected = modulos.includes(modulo.id);
            const moduloPermisos = permisos[modulo.id];

            return (
              <div
                key={modulo.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                    ? 'border-orange-primary bg-orange-primary/20 shadow-md'
                    : 'border-gray-dark bg-gray-darkest hover:border-gray-medium hover:bg-gray-dark'
                  }`}
                onClick={() => onToggle(modulo.id, isEditing)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-orange-primary/30' : 'bg-gray-medium'
                    }`}>
                    <IconComponent className={`w-5 h-5 ${isSelected ? 'text-orange-primary' : modulo.color
                      }`} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-white-primary text-sm flex items-center gap-2">
                      {modulo.nombre}
                      {isSelected && (
                        <Check className="w-4 h-4 text-orange-primary" />
                      )}
                    </h4>
                    <p className="text-xs text-gray-lightest mt-1">{modulo.descripcion}</p>
                    
                    {showPermisos && isSelected && moduloPermisos && (
                      <div className="mt-2 p-2 bg-gray-darkest rounded text-xs">
                        <div className="grid grid-cols-2 gap-1">
                          <label className="flex items-center gap-1 text-gray-lightest">
                            <input
                              type="checkbox"
                              checked={moduloPermisos.puedeVer}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <span>Ver</span>
                          </label>
                          <label className="flex items-center gap-1 text-gray-lightest">
                            <input
                              type="checkbox"
                              checked={moduloPermisos.puedeCrear}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <span>Crear</span>
                          </label>
                          <label className="flex items-center gap-1 text-gray-lightest">
                            <input
                              type="checkbox"
                              checked={moduloPermisos.puedeEditar}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <span>Editar</span>
                          </label>
                          <label className="flex items-center gap-1 text-gray-lightest">
                            <input
                              type="checkbox"
                              checked={moduloPermisos.puedeEliminar}
                              onChange={() => {}}
                              className="rounded"
                            />
                            <span>Eliminar</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                      ? 'border-orange-primary bg-orange-primary'
                      : 'border-gray-medium'
                    }`}>
                    {isSelected && <Check className="w-3 h-3 text-black-primary" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ), [selectAllModulos, deselectAllModulos]);

  return (
    <div className="w-full bg-black-primary text-white-primary h-full overflow-y-auto">
      <AlertContainer />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="elegante-card">

          {/* Barra de Controles */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              {/* Botón Nuevo Rol */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center disabled:opacity-50"
                    onClick={() => {
                      setNuevoRol({ nombre: '', descripcion: '', modulos: [] });
                    }}
                    disabled={isCreating || isEditing || isDeleting}
                  >
                    {isCreating || isEditing || isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Nuevo Rol
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary">Crear Nuevo Rol</DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      Define el nombre, descripción y módulos de acceso para el nuevo rol
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Información Básica */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-orange-primary" />
                          Nombre del Rol *
                        </Label>
                        <Input
                          value={nuevoRol.nombre}
                          onChange={(e) => setNuevoRol({ ...nuevoRol, nombre: e.target.value })}
                          placeholder="Ej: Content Manager"
                          className="elegante-input w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-primary" />
                          Descripción
                        </Label>
                        <Input
                          value={nuevoRol.descripcion}
                          onChange={(e) => setNuevoRol({ ...nuevoRol, descripcion: e.target.value })}
                          placeholder="Descripción del rol..."
                          className="elegante-input w-full"
                        />
                      </div>
                    </div>

                    {/* Módulos */}
                    <ModuleSelector
                      modulos={nuevoRol.modulos}
                      onToggle={toggleModulo}
                      isEditing={false}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="elegante-button-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateRole}
                      className="elegante-button-primary disabled:opacity-50"
                      disabled={!nuevoRol.nombre || nuevoRol.modulos.length === 0 || isCreating}
                    >
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {isCreating ? 'Creando...' : 'Crear Rol'}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <Input
                  placeholder="Buscar roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-80"
                />
              </div>
            </div>

            <div className="text-sm text-gray-lightest">
              Mostrando {displayedRoles.length} de {filteredRoles.length} roles
            </div>
          </div>

          {/* Tabla de Roles */}
          <div className="overflow-x-auto">
            {loading && roles.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-primary mr-3" />
                <span className="text-gray-lightest">Cargando roles...</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-dark">
                    <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Rol</th>
                    <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Usuarios</th>
                    <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Módulos</th>
                    <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                    <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRoles.map((rol) => (
                    <tr key={rol.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">{rol.nombre}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-lighter">{rol.usuariosAsignados}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-lighter">{rol.modulos.length}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs bg-gray-medium text-gray-lighter">
                          {rol.estado === true ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRole(rol);
                              setIsDetailDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Ver Detalle"
                            disabled={isCreating || isEditing || isDeleting}
                          >
                            <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRole({ ...rol });
                              setIsEditDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Editar"
                            disabled={isCreating || isEditing || isDeleting}
                          >
                            <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                          </button>
                          <button
                            onClick={() => {
                              setRoleToDelete(rol);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Eliminar"
                            disabled={isCreating || isEditing || isDeleting}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-dark">
              <div className="text-sm text-gray-lightest">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-dark hover:bg-gray-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-dark hover:bg-gray-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dialog de Detalles */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalles del Rol</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa del rol seleccionado
              </DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-lightest">Nombre</Label>
                    <p className="font-semibold text-white-primary">{selectedRole.nombre}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Fecha de Creación</Label>
                    <p className="text-white-primary">{selectedRole.fechaCreacion}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Usuarios Asignados</Label>
                    <p className="text-orange-primary font-semibold">{selectedRole.usuariosAsignados}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Estado</Label>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-medium text-gray-lighter">
                      {selectedRole.estado === true ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-lightest">Descripción</Label>
                  <p className="text-white-primary text-sm mt-1 p-3 bg-gray-darker rounded-lg">
                    {selectedRole.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-lightest">Módulos con Acceso ({selectedRole.modulos?.length || 0})</Label>
                  <div className="mt-2 space-y-2">
                    {selectedRole.modulos?.map((moduloId: string) => {
                      const modulo = getModuloInfo(moduloId);
                      if (!modulo) return null;

                      const IconComponent = modulo.icono;
                      const permisos = selectedRole.permisosPorModulo?.[moduloId];
                      
                      return (
                        <div key={moduloId} className="flex items-center gap-3 p-3 bg-gray-darker rounded-lg">
                          <IconComponent className={`w-4 h-4 ${modulo.color}`} />
                          <div className="flex-1">
                            <p className="text-white-primary font-medium text-sm">{modulo.nombre}</p>
                            <p className="text-gray-lightest text-xs">{modulo.descripcion}</p>
                            {permisos && (
                              <div className="mt-1 text-xs text-gray-lightest">
                                <span className="text-orange-primary">
                                  Permisos: {permisos.puedeVer ? '✓' : '✗'} Ver, 
                                  {permisos.puedeCrear ? '✓' : '✗'} Crear, 
                                  {permisos.puedeEditar ? '✓' : '✗'} Editar, 
                                  {permisos.puedeEliminar ? '✓' : '✗'} Eliminar
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Editar Rol</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Modifica los datos y módulos de acceso del rol
              </DialogDescription>
            </DialogHeader>
            {editingRole && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white-primary">Nombre del Rol *</Label>
                    <Input
                      value={editingRole.nombre}
                      onChange={(e) => setEditingRole({ ...editingRole, nombre: e.target.value })}
                      className="elegante-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white-primary">Descripción</Label>
                    <Input
                      value={editingRole.descripcion}
                      onChange={(e) => setEditingRole({ ...editingRole, descripcion: e.target.value })}
                      className="elegante-input"
                    />
                  </div>
                </div>

                <ModuleSelector
                  modulos={editingRole.modulos}
                  onToggle={toggleModulo}
                  isEditing={true}
                  showPermisos={true}
                  permisos={editingRole.permisosPorModulo || {}}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="elegante-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditRole}
                className="elegante-button-primary"
                disabled={!editingRole?.nombre || editingRole?.modulos.length === 0 || isEditing}
              >
                {isEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isEditing ? 'Actualizando...' : 'Actualizar Rol'}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Eliminación */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">¿Eliminar Rol?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas eliminar el rol "{roleToDelete?.nombre}"? Esta acción no se puede deshacer y afectará a {roleToDelete?.usuariosAsignados} usuario(s) asignado(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRole}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
