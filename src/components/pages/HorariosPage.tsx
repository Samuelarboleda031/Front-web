import { useState } from "react";
import {
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  User,
  Scissors,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useCustomAlert } from "../ui/custom-alert";

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Tipo para un bloque de horario (día + hora inicio + hora fin)
interface BloqueHorario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

// Tipo para un horario completo
interface Horario {
  id: number;
  barbero: string;
  tipo: string;
  servicios: string[];
  notas: string;
  color: string;
  activo: boolean;
  bloques: BloqueHorario[];
}

// Datos iniciales con la nueva estructura
const horariosData: Horario[] = [
  {
    id: 1,
    barbero: 'Carlos Mendez',
    tipo: 'Disponible',
    servicios: ['Corte', 'Barba', 'Cejas', 'Mascarilla'],
    notas: 'Horario semanal completo de Carlos',
    activo: true,
    color: '#4CAF50',
    bloques: [
      { dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' },
      { dia: 'Lunes', horaInicio: '14:00', horaFin: '19:00' },
      { dia: 'Jueves', horaInicio: '08:00', horaFin: '18:00' },
      { dia: 'Sábado', horaInicio: '09:00', horaFin: '17:00' },
    ]
  },
  {
    id: 2,
    barbero: 'Miguel Rodriguez',
    tipo: 'Disponible',
    servicios: ['Corte', 'Barba', 'Afeitado', 'Cejas'],
    notas: 'Horario semanal completo de Miguel',
    activo: true,
    color: '#2196F3',
    bloques: [
      { dia: 'Martes', horaInicio: '09:00', horaFin: '13:00' },
      { dia: 'Martes', horaInicio: '15:00', horaFin: '20:00' },
      { dia: 'Viernes', horaInicio: '08:00', horaFin: '21:00' },
      { dia: 'Domingo', horaInicio: '10:00', horaFin: '15:00' },
    ]
  },
  {
    id: 3,
    barbero: 'Sistema',
    tipo: 'Mantenimiento',
    servicios: [],
    notas: 'Limpieza y mantenimiento de equipos',
    activo: true,
    color: '#FF9800',
    bloques: [
      { dia: 'Miércoles', horaInicio: '10:00', horaFin: '14:00' },
    ]
  }
];

const barberos = ['Carlos Mendez', 'Miguel Rodriguez', 'Ana Lopez', 'Sistema'];
const tiposHorario = ['Disponible', 'Ocupado', 'Mantenimiento', 'Descanso', 'Vacaciones'];
const serviciosDisponibles = ['Corte', 'Barba', 'Cejas', 'Afeitado', 'Mascarilla', 'Lavado'];

export function HorariosPage() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [horarios, setHorarios] = useState<Horario[]>(horariosData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [horarioToDelete, setHorarioToDelete] = useState<Horario | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarbero, setFilterBarbero] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [showInactivos, setShowInactivos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estado para el formulario
  const [nuevoHorario, setNuevoHorario] = useState<{
    barbero: string;
    tipo: string;
    servicios: string[];
    notas: string;
    color: string;
    activo: boolean;
    bloques: BloqueHorario[];
  }>({
    barbero: '',
    tipo: 'Disponible',
    servicios: [],
    notas: '',
    color: '#4CAF50',
    activo: true,
    bloques: []
  });

  // Estado para agregar un nuevo bloque
  const [nuevoBloque, setNuevoBloque] = useState<BloqueHorario>({
    dia: '',
    horaInicio: '',
    horaFin: ''
  });

  const filteredHorarios = horarios.filter(horario => {
    const matchesSearch = horario.barbero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horario.notas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBarbero = filterBarbero === "all" || horario.barbero === filterBarbero;
    const matchesTipo = filterTipo === "all" || horario.tipo === filterTipo;
    const matchesActivo = showInactivos || horario.activo;
    return matchesSearch && matchesBarbero && matchesTipo && matchesActivo;
  });

  // Paginación para la lista
  const totalPages = Math.ceil(filteredHorarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedHorarios = filteredHorarios.slice(startIndex, startIndex + itemsPerPage);

  // Agregar bloque al formulario
  const handleAgregarBloque = () => {
    if (!nuevoBloque.dia || !nuevoBloque.horaInicio || !nuevoBloque.horaFin) {
      error("Campos incompletos", "Por favor selecciona día, hora de inicio y hora de fin para agregar el bloque.");
      return;
    }
    if (nuevoBloque.horaInicio >= nuevoBloque.horaFin) {
      error("Horario inválido", "La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
    setNuevoHorario({
      ...nuevoHorario,
      bloques: [...nuevoHorario.bloques, { ...nuevoBloque }]
    });
    setNuevoBloque({ dia: '', horaInicio: '', horaFin: '' });
  };

  // Eliminar bloque del formulario
  const handleEliminarBloque = (index: number) => {
    setNuevoHorario({
      ...nuevoHorario,
      bloques: nuevoHorario.bloques.filter((_, i) => i !== index)
    });
  };

  const resetFormulario = () => {
    setNuevoHorario({
      barbero: '',
      tipo: 'Disponible',
      servicios: [],
      notas: '',
      color: '#4CAF50',
      activo: true,
      bloques: []
    });
    setNuevoBloque({ dia: '', horaInicio: '', horaFin: '' });
  };

  const handleCreateHorario = () => {
    if (!nuevoHorario.barbero) {
      error("Barbero requerido", "Por favor selecciona un barbero.");
      return;
    }
    if (nuevoHorario.bloques.length === 0) {
      error("Sin bloques de horario", "Debes agregar al menos un bloque de horario (día + horas).");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const confirmCreateHorario = () => {
    const horario: Horario = {
      id: Date.now(),
      ...nuevoHorario
    };
    setHorarios([...horarios, horario]);
    resetFormulario();
    setIsDialogOpen(false);
    setIsCreateDialogOpen(false);
    const diasUnicos = [...new Set(horario.bloques.map(b => b.dia))];
    success(
      "¡Horario creado exitosamente!",
      `El horario para ${horario.barbero} con ${horario.bloques.length} bloques (${diasUnicos.join(', ')}) ha sido registrado.`
    );
  };

  const handleEditHorario = (horario: Horario) => {
    setEditingHorario(horario);
    setNuevoHorario({
      barbero: horario.barbero,
      tipo: horario.tipo,
      servicios: [...horario.servicios],
      notas: horario.notas,
      color: horario.color,
      activo: horario.activo,
      bloques: [...horario.bloques]
    });
    setIsDialogOpen(true);
  };

  const handleUpdateHorario = () => {
    if (!nuevoHorario.barbero) {
      error("Barbero requerido", "Por favor selecciona un barbero.");
      return;
    }
    if (nuevoHorario.bloques.length === 0) {
      error("Sin bloques de horario", "Debes agregar al menos un bloque de horario (día + horas).");
      return;
    }
    setIsEditDialogOpen(true);
  };

  const confirmEditHorario = () => {
    if (editingHorario) {
      setHorarios(horarios.map(h =>
        h.id === editingHorario.id ? { ...editingHorario, ...nuevoHorario } : h
      ));
      setEditingHorario(null);
      resetFormulario();
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      success(
        "¡Horario actualizado exitosamente!",
        `Los cambios en el horario de ${nuevoHorario.barbero} han sido guardados correctamente.`
      );
    }
  };

  const handleDeleteHorario = (horario: Horario) => {
    setHorarioToDelete(horario);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (horarioToDelete) {
      setHorarios(horarios.filter(h => h.id !== horarioToDelete.id));
      setIsDeleteDialogOpen(false);
      setHorarioToDelete(null);
      success(
        "¡Horario eliminado exitosamente!",
        `El horario de ${horarioToDelete.barbero} ha sido eliminado del sistema.`
      );
    }
  };

  const toggleEstadoHorario = (horario: Horario) => {
    setHorarios(horarios.map(h =>
      h.id === horario.id ? { ...h, activo: !h.activo } : h
    ));
    success(
      `¡Estado actualizado!`,
      `El horario de ${horario.barbero} ahora está ${!horario.activo ? 'activo' : 'inactivo'}`
    );
  };

  const handleViewDetail = (horario: Horario) => {
    setSelectedHorario(horario);
    setIsDetailDialogOpen(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Disponible': return 'bg-green-600';
      case 'Ocupado': return 'bg-red-600';
      case 'Mantenimiento': return 'bg-orange-primary';
      case 'Descanso': return 'bg-blue-600';
      case 'Vacaciones': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  // Obtener resumen de días del horario
  const getDiasResumen = (bloques: BloqueHorario[]) => {
    const diasUnicos = [...new Set(bloques.map(b => b.dia))];
    return diasUnicos.join(', ');
  };

  // Contar horarios de fin de semana
  const horariosFinSemana = horarios.filter(h =>
    h.bloques.some(b => b.dia === 'Sábado' || b.dia === 'Domingo')
  ).length;

  const totalHorarios = horarios.length;
  const horariosActivos = horarios.filter(h => h.activo).length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Horarios de Barbería</h1>
            <p className="text-sm text-gray-lightest mt-1">Gestiona los horarios y disponibilidad del personal</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="elegante-button-primary gap-2 flex items-center"
                  onClick={() => {
                    setEditingHorario(null);
                    resetFormulario();
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Horario
                </button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="elegante-card text-center">
            <Clock className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{totalHorarios}</h4>
            <p className="text-gray-lightest text-sm">Total Horarios</p>
          </div>
          <div className="elegante-card text-center">
            <Settings className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{horariosActivos}</h4>
            <p className="text-gray-lightest text-sm">Horarios Activos</p>
          </div>
          <div className="elegante-card text-center">
            <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{barberos.length - 1}</h4>
            <p className="text-gray-lightest text-sm">Barberos</p>
          </div>
          <div className="elegante-card text-center">
            <Calendar className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{horariosFinSemana}</h4>
            <p className="text-gray-lightest text-sm">Con Fin de Semana</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="elegante-card mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <Input
                  placeholder="Buscar barbero o notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10"
                />
              </div>
            </div>
            <select
              value={filterBarbero}
              onChange={(e) => setFilterBarbero(e.target.value)}
              className="elegante-input w-40"
            >
              <option value="all">Todos los barberos</option>
              {barberos.map((barbero) => (
                <option key={barbero} value={barbero}>{barbero}</option>
              ))}
            </select>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="elegante-input w-40"
            >
              <option value="all">Todos los tipos</option>
              {tiposHorario.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <button
              onClick={() => setShowInactivos(!showInactivos)}
              className={`p-2 rounded-lg border transition-colors ${showInactivos
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-gray-medium border-gray-dark text-gray-lighter'
                }`}
              title={showInactivos ? 'Ocultar inactivos' : 'Mostrar inactivos'}
            >
              {showInactivos ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lista de Horarios */}
        <div className="elegante-card">
          <div className="pb-6">
            <h3 className="text-xl font-bold text-white-primary mb-2">Lista de Horarios</h3>
            <p className="text-gray-lightest font-medium">
              {filteredHorarios.length} de {horarios.length} horarios
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left font-semibold text-white-primary pb-4">Barbero</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Días</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Bloques</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Tipo</th>
                  <th className="text-center font-semibold text-white-primary pb-4">Estado</th>
                  <th className="text-center font-semibold text-white-primary pb-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedHorarios.map((horario) => (
                  <tr key={horario.id} className="border-b border-gray-dark hover:bg-gray-darkest transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: horario.color }}
                        ></div>
                        <span className="font-semibold text-white-primary">{horario.barbero}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-gray-lightest">
                        {getDiasResumen(horario.bloques)}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="elegante-tag bg-orange-primary/20 border border-orange-primary/40 text-orange-primary">
                        {horario.bloques.length} bloque{horario.bloques.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className={`elegante-tag ${getTipoColor(horario.tipo)} text-white`}>
                        {horario.tipo}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center">
                        {horario.activo ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span className={`ml-2 text-sm ${horario.activo ? 'text-green-400' : 'text-red-400'}`}>
                          {horario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(horario)}
                          className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => toggleEstadoHorario(horario)}
                          className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                          title={horario.activo ? 'Desactivar' : 'Activar'}
                        >
                          {horario.activo ? (
                            <EyeOff className="w-4 h-4 text-red-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditHorario(horario)}
                          className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteHorario(horario)}
                          className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {displayedHorarios.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white-primary mb-2">No se encontraron horarios</h3>
                <p className="text-gray-lightest">Intenta con otros términos de búsqueda o filtros</p>
              </div>
            )}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-dark">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-lightest">
                  Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredHorarios.length)} de {filteredHorarios.length} horarios
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4 text-white-primary" />
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-lightest">Página</span>
                    <span className="text-sm font-semibold text-white-primary px-2 py-1 bg-gray-darker rounded">
                      {currentPage}
                    </span>
                    <span className="text-sm text-gray-lightest">de {totalPages}</span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4 text-white-primary" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialog de Creación/Edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary text-2xl flex items-center gap-3">
              <Clock className="w-7 h-7 text-orange-primary" />
              {editingHorario ? 'Editar Horario' : 'Crear Nuevo Horario'}
            </DialogTitle>
            <DialogDescription className="text-gray-lightest text-lg">
              {editingHorario
                ? 'Modifica la información del horario seleccionado'
                : 'Configura un nuevo horario semanal para un barbero. Agrega los bloques de días y horas que correspondan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna izquierda: Información del horario */}
              <div className="space-y-8">
                {/* Barbero y Tipo */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-primary" />
                    Información del Barbero
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Barbero *</Label>
                      <select
                        value={nuevoHorario.barbero}
                        onChange={(e) => setNuevoHorario({ ...nuevoHorario, barbero: e.target.value })}
                        className="elegante-input w-full h-14 bg-gray-darkest border-gray-dark text-white-primary"
                      >
                        <option value="">Seleccionar barbero</option>
                        {barberos.map((barbero) => (
                          <option key={barbero} value={barbero}>{barbero}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Tipo de horario</Label>
                      <select
                        value={nuevoHorario.tipo}
                        onChange={(e) => setNuevoHorario({ ...nuevoHorario, tipo: e.target.value })}
                        className="elegante-input w-full h-14 bg-gray-darkest border-gray-dark text-white-primary"
                      >
                        {tiposHorario.map((tipo) => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Estado</Label>
                      <select
                        value={nuevoHorario.activo ? 'activo' : 'inactivo'}
                        onChange={(e) => setNuevoHorario({ ...nuevoHorario, activo: e.target.value === 'activo' })}
                        className="elegante-input w-full h-14 bg-gray-darkest border-gray-dark text-white-primary"
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Color identificativo</Label>
                      <Input
                        type="color"
                        value={nuevoHorario.color}
                        onChange={(e) => setNuevoHorario({ ...nuevoHorario, color: e.target.value })}
                        className="elegante-input h-14 w-full bg-gray-darkest border-gray-dark"
                      />
                    </div>
                  </div>
                </div>

                {/* Servicios */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-orange-primary" />
                    Servicios Disponibles
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviciosDisponibles.map((servicio) => (
                      <label key={servicio} className="flex items-center space-x-2 p-3 rounded-lg bg-gray-darkest border border-gray-dark hover:border-orange-primary transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nuevoHorario.servicios.includes(servicio)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNuevoHorario({ ...nuevoHorario, servicios: [...nuevoHorario.servicios, servicio] });
                            } else {
                              setNuevoHorario({ ...nuevoHorario, servicios: nuevoHorario.servicios.filter(s => s !== servicio) });
                            }
                          }}
                          className="w-4 h-4 rounded bg-gray-darker border-gray-dark accent-orange-primary"
                        />
                        <span className="text-white-primary text-sm">{servicio}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-primary" />
                    Notas Adicionales
                  </h3>
                  <Textarea
                    value={nuevoHorario.notas}
                    onChange={(e) => setNuevoHorario({ ...nuevoHorario, notas: e.target.value })}
                    placeholder="Escribe aquí información adicional sobre este horario..."
                    className="elegante-input min-h-[100px] resize-none p-4 bg-gray-darkest border-gray-dark text-white-primary"
                    rows={4}
                  />
                </div>
              </div>

              {/* Columna derecha: Bloques de horario */}
              <div className="space-y-8">
                {/* Agregar nuevo bloque */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-primary" />
                    Agregar Bloque de Horario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Día</Label>
                      <select
                        value={nuevoBloque.dia}
                        onChange={(e) => setNuevoBloque({ ...nuevoBloque, dia: e.target.value })}
                        className="elegante-input w-full h-14 bg-gray-darkest border-gray-dark text-white-primary"
                      >
                        <option value="">Seleccionar día</option>
                        {diasSemana.map((dia) => (
                          <option key={dia} value={dia}>{dia}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Hora inicio</Label>
                      <Input
                        type="time"
                        value={nuevoBloque.horaInicio}
                        onChange={(e) => setNuevoBloque({ ...nuevoBloque, horaInicio: e.target.value })}
                        className="elegante-input h-14 bg-gray-darkest border-gray-dark text-white-primary"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Hora fin</Label>
                      <Input
                        type="time"
                        value={nuevoBloque.horaFin}
                        onChange={(e) => setNuevoBloque({ ...nuevoBloque, horaFin: e.target.value })}
                        className="elegante-input h-14 bg-gray-darkest border-gray-dark text-white-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAgregarBloque}
                    className="elegante-button-primary w-full flex items-center justify-center gap-2"
                    disabled={!nuevoBloque.dia || !nuevoBloque.horaInicio || !nuevoBloque.horaFin}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Bloque
                  </button>
                </div>

                {/* Lista de bloques agregados */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-primary" />
                    Bloques de Horario ({nuevoHorario.bloques.length})
                  </h3>

                  {nuevoHorario.bloques.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-dark rounded-lg">
                      <Clock className="w-12 h-12 text-gray-medium mx-auto mb-3" />
                      <p className="text-gray-lightest">No hay bloques de horario agregados</p>
                      <p className="text-sm text-gray-medium mt-1">Agrega al menos un bloque usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {nuevoHorario.bloques.map((bloque, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-darkest border border-gray-dark"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-primary/20 border border-orange-primary/40 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-orange-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-white-primary">{bloque.dia}</p>
                              <p className="text-sm text-gray-lightest">
                                {bloque.horaInicio} - {bloque.horaFin}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEliminarBloque(index)}
                            className="p-2 rounded-lg bg-red-600/20 border border-red-600/40 hover:bg-red-600/40 transition-colors"
                            title="Eliminar bloque"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="elegante-card bg-gray-darkest border-t border-gray-dark rounded-b-lg rounded-t-none p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="elegante-button-secondary text-lg px-8 py-4"
              >
                Cancelar
              </button>
              <button
                onClick={editingHorario ? handleUpdateHorario : handleCreateHorario}
                className="elegante-button-primary text-lg px-8 py-4 flex items-center gap-2"
                disabled={!nuevoHorario.barbero || nuevoHorario.bloques.length === 0}
              >
                <Clock className="w-5 h-5" />
                {editingHorario ? 'Actualizar' : 'Crear'} Horario
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialogs para Confirmación */}
      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border-gray-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              ¿Crear nuevo horario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              Se creará un horario para <span className="font-semibold text-white-primary">{nuevoHorario.barbero}</span> con{' '}
              <span className="font-semibold text-orange-primary">{nuevoHorario.bloques.length} bloque(s)</span> de horario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCreateDialogOpen(false)} className="elegante-button-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreateHorario} className="elegante-button-primary">
              Crear Horario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border-gray-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              ¿Guardar cambios?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              Se actualizarán los datos del horario de <span className="font-semibold text-white-primary">{nuevoHorario.barbero}</span>.
              Los cambios se aplicarán inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsEditDialogOpen(false)} className="elegante-button-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmEditHorario} className="elegante-button-primary">
              Guardar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border-gray-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              ¿Eliminar Horario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              Esta acción no se puede deshacer. Se eliminará permanentemente el horario de{' '}
              <span className="font-semibold text-white-primary">{horarioToDelete?.barbero}</span>{' '}
              con {horarioToDelete?.bloques.length} bloque(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)} className="elegante-button-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Eliminar Horario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Ver Detalle */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark w-[95vw] max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary text-2xl flex items-center gap-3">
              <Eye className="w-7 h-7 text-blue-400" />
              Detalles del Horario
            </DialogTitle>
            <DialogDescription className="text-gray-lightest text-lg">
              Información completa del horario seleccionado
            </DialogDescription>
          </DialogHeader>

          {selectedHorario && (
            <div className="py-6 space-y-6">
              {/* Información Principal */}
              <div className="elegante-card p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: selectedHorario.color }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white-primary">{selectedHorario.barbero}</h3>
                    <div className={`elegante-tag ${getTipoColor(selectedHorario.tipo)} text-white mt-1`}>
                      {selectedHorario.tipo}
                    </div>
                  </div>
                  <div className="ml-auto">
                    {selectedHorario.activo ? (
                      <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm font-medium">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bloques de horario */}
              <div className="elegante-card p-6">
                <h4 className="text-lg font-bold text-white-primary mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-primary" />
                  Bloques de Horario ({selectedHorario.bloques.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedHorario.bloques.map((bloque: BloqueHorario, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-darker border border-gray-dark">
                      <p className="font-semibold text-white-primary">{bloque.dia}</p>
                      <p className="text-orange-primary font-medium">
                        {bloque.horaInicio} - {bloque.horaFin}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              {selectedHorario.servicios.length > 0 && (
                <div className="elegante-card p-6">
                  <h4 className="text-lg font-bold text-white-primary mb-4 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-orange-primary" />
                    Servicios
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHorario.servicios.map((servicio: string) => (
                      <span key={servicio} className="px-3 py-1 rounded-full bg-orange-primary/20 text-orange-primary text-sm font-medium">
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedHorario.notas && (
                <div className="elegante-card p-6">
                  <h4 className="text-lg font-bold text-white-primary mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-primary" />
                    Notas
                  </h4>
                  <p className="text-gray-lightest">{selectedHorario.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertContainer />
    </>
  );
}
