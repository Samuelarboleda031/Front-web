import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  List,
  Hash,
  AlertCircle,
  Power,
  PowerOff
} from "lucide-react";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { useCustomAlert } from "../ui/custom-alert";
import { useDoubleConfirmation } from "../ui/double-confirmation";

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  activo: boolean;
}

const categoriasData: Categoria[] = [
  {
    id: "CAT001",
    nombre: "Cuidado Capilar",
    descripcion: "Productos para el cuidado y mantenimiento del cabello",
    fechaCreacion: "15-07-2025",
    activo: true
  },
  {
    id: "CAT002",
    nombre: "Perfumería",
    descripcion: "Fragancias y productos aromáticos",
    fechaCreacion: "18-07-2025",
    activo: true
  },
  {
    id: "CAT003",
    nombre: "Accesorios",
    descripcion: "Complementos y accesorios para el cuidado personal",
    fechaCreacion: "20-07-2025",
    activo: false
  },
  {
    id: "CAT004",
    nombre: "Cuidado Facial",
    descripcion: "Productos especializados para el cuidado de la piel",
    fechaCreacion: "22-07-2025",
    activo: true
  },
  {
    id: "CAT005",
    nombre: "Herramientas",
    descripcion: "Instrumentos y herramientas profesionales",
    fechaCreacion: "25-07-2025",
    activo: false
  }
];

export function CategoriasPage() {
  const { created, edited, deleted, AlertContainer } = useCustomAlert();
  const { confirmDeleteAction, confirmEditAction, confirmCreateAction, DoubleConfirmationContainer } = useDoubleConfirmation();

  // Función para asegurar IDs únicos
  const ensureUniqueIds = (categorias: Categoria[]): Categoria[] => {
    const seen = new Set<string>();
    return categorias.filter(categoria => {
      if (seen.has(categoria.id)) {
        console.warn(`Duplicate ID found: ${categoria.id}, removing duplicate`);
        return false;
      }
      seen.add(categoria.id);
      return true;
    });
  };

  const [categorias, setCategorias] = useState<Categoria[]>(() => ensureUniqueIds(categoriasData));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [error, setError] = useState('');

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });

  const [editCategoria, setEditCategoria] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCategorias = filteredCategorias.slice(startIndex, startIndex + itemsPerPage);

  const validateForm = (form: any, isEdit: boolean = false) => {
    if (!form.nombre) {
      setError('El nombre de la categoría es obligatorio');
      return false;
    }

    // Verificar si el nombre ya existe
    const nombreExiste = categorias.some(c =>
      c.nombre.toLowerCase() === form.nombre.toLowerCase() &&
      (!isEdit || c.id !== selectedCategoria?.id)
    );

    if (nombreExiste) {
      setError('Ya existe una categoría con este nombre');
      return false;
    }

    return true;
  };



  const handleCreateCategoria = () => {
    if (!validateForm(nuevaCategoria)) {
      return;
    }

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    const tempNuevaCategoria = { ...nuevaCategoria };

    setIsDialogOpen(false);

    confirmCreateAction(
      nuevaCategoria.nombre,
      () => {
        // Generar ID único basado en los IDs existentes
        const existingIds = categorias.map(cat => parseInt(cat.id.replace('CAT', '')));
        const nextId = Math.max(...existingIds, 0) + 1;

        const categoria: Categoria = {
          id: `CAT${String(nextId).padStart(3, '0')}`,
          fechaCreacion: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          ...tempNuevaCategoria
        };

        setCategorias(prev => ensureUniqueIds([categoria, ...prev]));
        setNuevaCategoria({
          nombre: '',
          descripcion: '',
          activo: true
        });
        setError('');
      },
      {
        confirmTitle: 'Crear Nueva Categoría',
        confirmMessage: `¿Estás seguro de que deseas crear la categoría "${nuevaCategoria.nombre}"?`,
        successTitle: 'Categoría creada ✔️',
        successMessage: `La categoría "${nuevaCategoria.nombre}" ha sido creada exitosamente y está disponible en el sistema.`,
        requireInput: false
      }
    );
  };

  const handleEditClick = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setEditCategoria({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: categoria.activo
    });
    setError('');
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategoria = () => {
    if (!selectedCategoria || !validateForm(editCategoria, true)) {
      return;
    }

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    const tempEditCategoria = { ...editCategoria };
    const tempSelectedCategoria = { ...selectedCategoria };

    setIsEditDialogOpen(false);

    confirmEditAction(
      editCategoria.nombre,
      () => {
        const categoriaActualizada: Categoria = {
          ...tempSelectedCategoria,
          ...tempEditCategoria
        };

        setCategorias(prev => ensureUniqueIds(prev.map(c =>
          c.id === tempSelectedCategoria.id ? categoriaActualizada : c
        )));

        setSelectedCategoria(null);
        setError('');
      },
      {
        confirmTitle: 'Confirmar Edición',
        confirmMessage: `¿Estás seguro de que deseas actualizar la información de la categoría "${editCategoria.nombre}"?`,
        successTitle: 'Categoría actualizada ✔️',
        successMessage: `La información de la categoría "${editCategoria.nombre}" ha sido actualizada exitosamente.`,
        requireInput: false
      }
    );
  };

  const handleDeleteClick = (categoria: Categoria) => {
    confirmDeleteAction(
      categoria.nombre,
      () => {
        setCategorias(prev => ensureUniqueIds(prev.filter(c => c.id !== categoria.id)));

      },
      {
        confirmTitle: 'Eliminar Categoría',
        confirmMessage: `¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}" y toda su información asociada? Esta acción no se puede deshacer.`,
        requireInput: false,
        successTitle: 'Categoría eliminada ✔️',
        successMessage: `La categoría "${categoria.nombre}" ha sido eliminada exitosamente del sistema.`
      }
    );
  };



  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Categorías</h1>
            <p className="text-sm text-gray-lightest mt-1">Administra las categorías de productos</p>
          </div>

        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
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
                      setNuevaCategoria({
                        nombre: '',
                        descripcion: '',
                        activo: true
                      });
                      setError('');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Plus className="w-5 h-5 text-orange-primary" />
                      Crear Nueva Categoría
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      Completa la información de la categoría
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {error && (
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-white-primary">Nombre de la Categoría *</Label>
                      <Input
                        value={nuevaCategoria.nombre}
                        onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })}
                        placeholder="Ej: Cuidado Capilar"
                        className="elegante-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary">Descripción</Label>
                      <textarea
                        value={nuevaCategoria.descripcion}
                        onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })}
                        placeholder="Descripción de la categoría..."
                        className="elegante-input min-h-[100px] resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary">Estado</Label>
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={nuevaCategoria.activo}
                          onCheckedChange={(checked) => setNuevaCategoria({ ...nuevaCategoria, activo: checked })}
                          className="data-[state=checked]:bg-orange-primary"
                        />
                        <span className={`text-sm font-medium ${nuevaCategoria.activo ? 'text-orange-primary' : 'text-gray-lightest'}`}>
                          {nuevaCategoria.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-lightest">
                      * Campos obligatorios
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                    <button onClick={() => {
                      setIsDialogOpen(false);
                      setError('');
                    }} className="elegante-button-secondary">
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateCategoria}
                      className="elegante-button-primary"
                      disabled={!nuevaCategoria.nombre}
                    >
                      Crear Categoría
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedCategorias.length} de {filteredCategorias.length} categorías
              </div>
            </div>
          </div>

          {/* Tabla de Categorías */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Nombre</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Descripción</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Fecha Creación</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedCategorias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Tags className="w-12 h-12 text-gray-medium mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white-primary mb-2">No hay categorías</h3>
                      <p className="text-gray-lightest">
                        {searchTerm ? 'No se encontraron categorías con ese criterio de búsqueda.' : 'Comience agregando una nueva categoría.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedCategorias.map((categoria, index) => (
                    <tr
                      key={categoria.id}
                      className="border-b border-gray-dark hover:bg-gray-darker transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-primary rounded-lg flex items-center justify-center">
                            <Tags className="w-4 h-4 text-black-primary" />
                          </div>
                          <span className="font-medium text-white-primary">{categoria.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-lightest">{categoria.descripcion || 'Sin descripción'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-lightest">{categoria.fechaCreacion}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {categoria.activo ? (
                            <span className="elegante-tag bg-green-600 text-white text-xs">Activa</span>
                          ) : (
                            <span className="elegante-tag bg-red-600 text-white text-xs">Inactiva</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setIsDetailDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setEditCategoria({
                                nombre: categoria.nombre,
                                descripcion: categoria.descripcion,
                                activo: categoria.activo
                              });
                              setIsEditDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategoria(categoria);
                              setEditCategoria({
                                nombre: categoria.nombre,
                                descripcion: categoria.descripcion,
                                activo: !categoria.activo
                              });
                              handleUpdateCategoria();
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title={categoria.activo ? "Desactivar" : "Activar"}
                          >
                            {categoria.activo ? (
                              <PowerOff className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                            ) : (
                              <Power className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(categoria)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tabla antigua - OLD */}
          <div style={{ display: 'none' }}>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
              <Input
                placeholder="Buscar categoría por nombre o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="elegante-input pl-10 w-80"
              />
            </div>
          </div>
        </div>

        {/* Tabla antigua - OLD */}
        <div style={{ display: 'none' }}>

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

        {/* Dialog de Edición */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-primary" />
                Editar Categoría
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Modifica la información de la categoría
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white-primary">Nombre de la Categoría *</Label>
                <Input
                  value={editCategoria.nombre}
                  onChange={(e) => setEditCategoria({ ...editCategoria, nombre: e.target.value })}
                  placeholder="Ej: Cuidado Capilar"
                  className="elegante-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary">Descripción</Label>
                <textarea
                  value={editCategoria.descripcion}
                  onChange={(e) => setEditCategoria({ ...editCategoria, descripcion: e.target.value })}
                  placeholder="Descripción de la categoría..."
                  className="elegante-input min-h-[100px] resize-none"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary">Estado</Label>
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={editCategoria.activo}
                    onCheckedChange={(checked) => setEditCategoria({ ...editCategoria, activo: checked })}
                    className="data-[state=checked]:bg-orange-primary"
                  />
                  <span className={`text-sm font-medium ${editCategoria.activo ? 'text-orange-primary' : 'text-gray-lightest'}`}>
                    {editCategoria.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-lightest">
                * Campos obligatorios
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
              <button onClick={() => {
                setIsEditDialogOpen(false);
                setError('');
                setSelectedCategoria(null);
              }} className="elegante-button-secondary">
                Cancelar
              </button>
              <button
                onClick={handleUpdateCategoria}
                className="elegante-button-primary"
                disabled={!editCategoria.nombre}
              >
                Guardar Cambios
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Detalle */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalle de Categoría</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                {selectedCategoria?.id} - {selectedCategoria?.nombre}
              </DialogDescription>
            </DialogHeader>
            {selectedCategoria && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-light">ID de Categoría</p>
                    <p className="font-semibold text-orange-primary">{selectedCategoria.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Fecha de Creación</p>
                    <p className="font-semibold text-white-primary">{selectedCategoria.fechaCreacion}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Nombre</p>
                  <p className="font-semibold text-white-primary text-lg">{selectedCategoria.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Descripción</p>
                  <p className="text-white-primary">{selectedCategoria.descripcion || 'Sin descripción'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Estado</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedCategoria.activo ? (
                      <Power className="w-4 h-4 text-orange-primary" />
                    ) : (
                      <PowerOff className="w-4 h-4 text-gray-lightest" />
                    )}
                    <span className={`font-semibold ${selectedCategoria.activo ? 'text-orange-primary' : 'text-gray-lightest'}`}>
                      {selectedCategoria.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-dark">
                  <button
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="elegante-button-primary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


      </main>

      <AlertContainer />
      <DoubleConfirmationContainer />
    </>
  );
}