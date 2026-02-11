import { useState } from "react";
import { Input } from "../ui/input";
import { Scissors, Plus, Edit, Trash2, Search, Eye, ChevronLeft, ChevronRight, ToggleRight, ToggleLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useCustomAlert } from "../ui/custom-alert";

const serviciosData = [
  {
    id: 1,
    nombre: "Corte Caballero",
    descripcion: "Corte clásico masculino con tijera y máquina",
    duracion: 30,
    precio: 35000,
    activo: true
  },
  {
    id: 2,
    nombre: "Corte + Barba",
    descripcion: "Corte completo con arreglo de barba y bigote",
    duracion: 60,
    precio: 55000,
    activo: true
  },
  {
    id: 3,
    nombre: "Afeitado Clásico",
    descripcion: "Afeitado tradicional con navaja y toalla caliente",
    duracion: 30,
    precio: 30000,
    activo: true
  },
  {
    id: 4,
    nombre: "Corte Dama",
    descripcion: "Corte femenino con lavado y secado",
    duracion: 45,
    precio: 45000,
    activo: true
  },
  {
    id: 5,
    nombre: "Tratamiento Capilar",
    descripcion: "Tratamiento nutritivo e hidratante para el cabello",
    duracion: 90,
    precio: 85000,
    activo: true
  },
  {
    id: 6,
    nombre: "Peinado Evento",
    descripcion: "Peinado especial para eventos y ocasiones importantes",
    duracion: 60,
    precio: 70000,
    activo: true
  },
  {
    id: 7,
    nombre: "Tintura",
    descripcion: "Coloración completa del cabello",
    duracion: 120,
    precio: 120000,
    activo: true
  },
  {
    id: 8,
    nombre: "Mechas",
    descripcion: "Aplicación de mechas y reflejos",
    duracion: 150,
    precio: 150000,
    activo: false
  }
];

export function ServiciosPage() {
  const { created, edited, deleted, AlertContainer } = useCustomAlert();
  const [servicios, setServicios] = useState(serviciosData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<any>(null);
  const [selectedServicio, setSelectedServicio] = useState<any>(null);
  const [servicioToDelete, setServicioToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    activo: true
  });

  const filteredServicios = servicios.filter(servicio => {
    const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredServicios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedServicios = filteredServicios.slice(startIndex, startIndex + itemsPerPage);


  const handleCreateServicio = () => {
    const servicio = {
      id: Date.now(),
      ...nuevoServicio,
      precio: parseFloat(nuevoServicio.precio.toString())
    };
    setServicios([...servicios, servicio]);
    setNuevoServicio({ nombre: '', descripcion: '', duracion: 30, precio: 0, activo: true });
    setIsDialogOpen(false);

    created("Servicio creado ✔️", `El servicio "${servicio.nombre}" ha sido agregado exitosamente con una duración de ${servicio.duracion} minutos y precio de ${servicio.precio.toLocaleString('es-CO')}.`);
  };

  const handleEditServicio = (servicio: any) => {
    setEditingServicio(servicio);
    setNuevoServicio({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      activo: servicio.activo
    });
    setIsDialogOpen(true);
  };

  const handleUpdateServicio = () => {
    if (editingServicio) {
      const servicioActualizado = {
        ...editingServicio,
        ...nuevoServicio,
        precio: parseFloat(nuevoServicio.precio.toString())
      };
      setServicios(servicios.map(s =>
        s.id === editingServicio.id ? servicioActualizado : s
      ));
      setEditingServicio(null);
      setNuevoServicio({ nombre: '', descripcion: '', duracion: 30, precio: 0, activo: true });
      setIsDialogOpen(false);

      edited("Servicio editado ✔️", `El servicio "${servicioActualizado.nombre}" ha sido actualizado exitosamente con una duración de ${servicioActualizado.duracion} minutos y precio de ${servicioActualizado.precio.toLocaleString('es-CO')}.`);
    }
  };

  const handleDeleteServicio = (servicio: any) => {
    setServicioToDelete(servicio);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (servicioToDelete) {
      setServicios(servicios.filter(s => s.id !== servicioToDelete.id));
      setIsDeleteDialogOpen(false);

      deleted("Servicio eliminado ✔️", `El servicio "${servicioToDelete.nombre}" ha sido eliminado exitosamente del catálogo.`);
      setServicioToDelete(null);
    }
  };

  const toggleActivo = (servicioId: number) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (!servicio) return;

    setServicios(servicios.map(s =>
      s.id === servicioId
        ? { ...s, activo: !s.activo }
        : s
    ));

    edited(`Servicio ${!servicio.activo ? 'activado' : 'desactivado'} ✔️`, `El servicio "${servicio.nombre}" ha sido ${!servicio.activo ? 'activado' : 'desactivado'} exitosamente.`);
  };

  return (
    <>
      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Tabla de Servicios */}
        <div className="elegante-card">
          {/* Controles y Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            <div className="flex flex-wrap items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center"
                    onClick={() => {
                      setEditingServicio(null);
                      setNuevoServicio({ nombre: '', descripcion: '', duracion: 30, precio: 0, activo: true });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Servicio
                  </button>
                </DialogTrigger>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Servicio</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Descripción</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Duración</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Precio</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedServicios.map((servicio) => (
                  <tr key={servicio.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-medium flex items-center justify-center">
                          <Scissors className="w-5 h-5 text-orange-primary" />
                        </div>
                        <span className="text-gray-lighter">{servicio.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{servicio.descripcion}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-lighter">{servicio.duracion} min</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-lighter">${servicio.precio.toLocaleString('es-CO')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedServicio(servicio);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleEditServicio(servicio)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => toggleActivo(servicio.id)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title={servicio.activo ? "Desactivar servicio" : "Activar servicio"}
                        >
                          {servicio.activo ? (
                            <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteServicio(servicio)}
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

            {displayedServicios.length === 0 && (
              <div className="text-center py-8">
                <Scissors className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white-primary mb-2">No se encontraron servicios</h3>
                <p className="text-gray-lightest">Intenta con otros términos de búsqueda</p>
              </div>
            )}
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

        {/* Dialog de Creación/Edición */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-white-primary">
                {editingServicio ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Completa la información del servicio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white-primary">Nombre del Servicio</Label>
                <Input
                  value={nuevoServicio.nombre}
                  onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                  placeholder="Ej: Corte Moderno"
                  className="elegante-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white-primary">Descripción</Label>
              <Textarea
                value={nuevoServicio.descripcion}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })}
                placeholder="Describe el servicio detalladamente"
                className="elegante-input"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white-primary">Duración (min)</Label>
              <Input
                type="number"
                value={nuevoServicio.duracion}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, duracion: parseInt(e.target.value) || 0 })}
                className="elegante-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white-primary">Precio ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={nuevoServicio.precio}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: parseFloat(e.target.value) || 0 })}
                className="elegante-input"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={nuevoServicio.activo}
                onChange={(e) => setNuevoServicio({ ...nuevoServicio, activo: e.target.checked })}
                className="rounded"
              />
              <Label className="text-white-primary">Servicio activo</Label>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-dark mt-6">
              <button onClick={() => setIsDialogOpen(false)} className="elegante-button-secondary">
                Cancelar
              </button>
              <button
                onClick={editingServicio ? handleUpdateServicio : handleCreateServicio}
                className="elegante-button-primary"
                disabled={!nuevoServicio.nombre}
              >
                {editingServicio ? 'Actualizar' : 'Crear'} Servicio
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Detalle */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-7xl overflow-visible">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalle del Servicio</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa del servicio
              </DialogDescription>
            </DialogHeader>
            {selectedServicio && (
              <div className="grid grid-cols-4 gap-6 pt-4">
                <div className="col-span-4 flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-medium flex items-center justify-center">
                    <Scissors className="w-8 h-8 text-orange-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white-primary">{selectedServicio.nombre}</h3>
                  </div>
                </div>

                <div className="col-span-4">
                  <p className="text-sm text-gray-light mb-2">Descripción del Servicio</p>
                  <div className="bg-gray-medium p-3 rounded-lg border border-gray-dark">
                    <p className="text-white-primary">{selectedServicio.descripcion}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-light mb-2">Duración</p>
                  <p className="font-semibold text-white-primary text-lg">{selectedServicio.duracion} min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light mb-2">Precio</p>
                  <p className="font-semibold text-orange-primary text-lg">${selectedServicio.precio.toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light mb-2">Estado del Servicio</p>
                  <button
                    onClick={() => toggleActivo(selectedServicio.id)}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors bg-gray-medium text-gray-lighter`}
                  >
                    {selectedServicio.activo ? 'ACTIVO' : 'INACTIVO'}
                  </button>
                </div>
                <div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de Confirmación para Eliminar */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas eliminar el servicio{' '}
                <span className="font-semibold text-orange-primary">
                  "{servicioToDelete?.nombre}"
                </span>?
                <br />
                <br />
                <span className="text-red-400 font-medium">
                  Esta acción no se puede deshacer.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
              >
                Eliminar Servicio
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertContainer />
      </main>
    </>
  );
}