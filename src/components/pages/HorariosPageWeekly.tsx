import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  CheckCircle,
  AlertTriangle,
  X,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useCustomAlert } from "../ui/custom-alert";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Tipo para un bloque de horario (día + hora inicio + hora fin)
interface BloqueHorario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

// Tipo para un horario completo (un solo registro con múltiples bloques)
interface HorarioSemanal {
  id: number;
  barbero: string;
  activo: boolean;
  bloques: BloqueHorario[];
}

// Datos iniciales con la nueva estructura
const horariosData: HorarioSemanal[] = [
  {
    id: 1,
    barbero: "Carlos Mendez",
    activo: true,
    bloques: [
      { dia: "Lunes", horaInicio: "08:00", horaFin: "12:00" },
      { dia: "Lunes", horaInicio: "14:00", horaFin: "19:00" },
      { dia: "Miércoles", horaInicio: "09:00", horaFin: "18:00" },
      { dia: "Viernes", horaInicio: "08:00", horaFin: "17:00" },
      { dia: "Sábado", horaInicio: "09:00", horaFin: "14:00" },
    ],
  },
  {
    id: 2,
    barbero: "Miguel Rodriguez",
    activo: true,
    bloques: [
      { dia: "Martes", horaInicio: "09:00", horaFin: "13:00" },
      { dia: "Martes", horaInicio: "15:00", horaFin: "20:00" },
      { dia: "Jueves", horaInicio: "10:00", horaFin: "19:00" },
      { dia: "Sábado", horaInicio: "10:00", horaFin: "16:00" },
    ],
  },
  {
    id: 3,
    barbero: "Ana Lopez",
    activo: true,
    bloques: [
      { dia: "Lunes", horaInicio: "10:00", horaFin: "18:00" },
      { dia: "Miércoles", horaInicio: "10:00", horaFin: "18:00" },
      { dia: "Viernes", horaInicio: "10:00", horaFin: "18:00" },
    ],
  },
];

const barberos = ["Carlos Mendez", "Miguel Rodriguez", "Ana Lopez", "Sistema"];

export function HorariosPageWeekly() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [horarios, setHorarios] = useState<HorarioSemanal[]>(horariosData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioSemanal | null>(null);
  const [horarioToDelete, setHorarioToDelete] = useState<HorarioSemanal | null>(null);
  const [selectedHorario, setSelectedHorario] = useState<HorarioSemanal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBarbero, setFilterBarbero] = useState("all");
  const [showInactivos, setShowInactivos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estado para el formulario de nuevo horario
  const [nuevoHorario, setNuevoHorario] = useState<{
    barbero: string;
    activo: boolean;
    bloques: BloqueHorario[];
  }>({
    barbero: "",
    activo: true,
    bloques: [],
  });

  // Estado para agregar un nuevo bloque
  const [nuevoBloque, setNuevoBloque] = useState<BloqueHorario>({
    dia: "",
    horaInicio: "",
    horaFin: "",
  });

  const filteredHorarios = horarios.filter((horario) => {
    const matchesSearch = horario.barbero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBarbero = filterBarbero === "all" || horario.barbero === filterBarbero;
    const matchesActivo = showInactivos || horario.activo;
    return matchesSearch && matchesBarbero && matchesActivo;
  });

  // Paginación
  const totalPages = Math.ceil(filteredHorarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedHorarios = filteredHorarios.slice(startIndex, startIndex + itemsPerPage);

  // Agregar bloque al formulario
  const handleAgregarBloque = () => {
    if (!nuevoBloque.dia) {
      error("Día requerido", "Por favor selecciona un día de la semana.");
      return;
    }
    if (!nuevoBloque.horaInicio || !nuevoBloque.horaFin) {
      error("Horario incompleto", "Por favor ingresa la hora de inicio y fin.");
      return;
    }
    if (nuevoBloque.horaInicio >= nuevoBloque.horaFin) {
      error("Horario inválido", "La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    setNuevoHorario({
      ...nuevoHorario,
      bloques: [...nuevoHorario.bloques, { ...nuevoBloque }],
    });
    setNuevoBloque({ dia: "", horaInicio: "", horaFin: "" });
  };

  // Eliminar bloque del formulario
  const handleEliminarBloque = (index: number) => {
    setNuevoHorario({
      ...nuevoHorario,
      bloques: nuevoHorario.bloques.filter((_, i) => i !== index),
    });
  };

  // Resetear formulario
  const resetFormulario = () => {
    setNuevoHorario({
      barbero: "",
      activo: true,
      bloques: [],
    });
    setNuevoBloque({ dia: "", horaInicio: "", horaFin: "" });
  };

  const handleCreateHorario = () => {
    if (!nuevoHorario.barbero) {
      error("Barbero requerido", "Por favor selecciona un barbero.");
      return;
    }
    if (nuevoHorario.bloques.length === 0) {
      error("Sin bloques", "Debes agregar al menos un bloque de horario (día + horas).");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const confirmCreateHorario = () => {
    const horario: HorarioSemanal = {
      id: Date.now(),
      ...nuevoHorario,
    };
    setHorarios([...horarios, horario]);
    resetFormulario();
    setIsDialogOpen(false);
    setIsCreateDialogOpen(false);

    const diasUnicos = [...new Set(horario.bloques.map((b) => b.dia))];
    success(
      "¡Horario creado exitosamente!",
      `Se ha registrado 1 horario para ${horario.barbero} con ${horario.bloques.length} bloques (${diasUnicos.join(", ")}).`
    );
  };

  const handleEditHorario = (horario: HorarioSemanal) => {
    setEditingHorario(horario);
    setNuevoHorario({
      barbero: horario.barbero,
      activo: horario.activo,
      bloques: [...horario.bloques],
    });
    setIsDialogOpen(true);
  };

  const handleUpdateHorario = () => {
    if (!nuevoHorario.barbero) {
      error("Barbero requerido", "Por favor selecciona un barbero.");
      return;
    }
    if (nuevoHorario.bloques.length === 0) {
      error("Sin bloques", "Debes agregar al menos un bloque de horario.");
      return;
    }
    setIsEditDialogOpen(true);
  };

  const confirmEditHorario = () => {
    if (editingHorario) {
      setHorarios(
        horarios.map((h) =>
          h.id === editingHorario.id ? { ...editingHorario, ...nuevoHorario } : h
        )
      );
      setEditingHorario(null);
      resetFormulario();
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      success(
        "¡Horario actualizado exitosamente!",
        `Los cambios en el horario de ${nuevoHorario.barbero} han sido guardados.`
      );
    }
  };

  const handleDeleteHorario = (horario: HorarioSemanal) => {
    setHorarioToDelete(horario);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (horarioToDelete) {
      setHorarios(horarios.filter((h) => h.id !== horarioToDelete.id));
      setIsDeleteDialogOpen(false);
      setHorarioToDelete(null);
      success(
        "¡Horario eliminado exitosamente!",
        `El horario de ${horarioToDelete.barbero} ha sido eliminado del sistema.`
      );
    }
  };

  const toggleEstadoHorario = (horario: HorarioSemanal) => {
    setHorarios(
      horarios.map((h) => (h.id === horario.id ? { ...h, activo: !h.activo } : h))
    );
    success(
      `¡Estado actualizado!`,
      `El horario de ${horario.barbero} ahora está ${!horario.activo ? "activo" : "inactivo"}`
    );
  };

  const handleViewDetail = (horario: HorarioSemanal) => {
    setSelectedHorario(horario);
    setIsDetailDialogOpen(true);
  };


  // Obtener resumen de días del horario
  const getDiasResumen = (bloques: BloqueHorario[]) => {
    const diasUnicos = [...new Set(bloques.map((b) => b.dia))];
    if (diasUnicos.length <= 3) {
      return diasUnicos.join(", ");
    }
    return `${diasUnicos.slice(0, 2).join(", ")} +${diasUnicos.length - 2} más`;
  };

  // Ordenar bloques por día de la semana
  const ordenarBloques = (bloques: BloqueHorario[]) => {
    const ordenDias: { [key: string]: number } = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
      Domingo: 7,
    };
    return [...bloques].sort((a, b) => {
      const ordenA = ordenDias[a.dia] || 0;
      const ordenB = ordenDias[b.dia] || 0;
      if (ordenA !== ordenB) return ordenA - ordenB;
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  };

  const totalHorarios = horarios.length;
  const horariosActivos = horarios.filter((h) => h.activo).length;
  const totalBloques = horarios.reduce((acc, h) => acc + h.bloques.length, 0);

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">
              Horarios de Barbería
            </h1>
            <p className="text-sm text-gray-lightest mt-1">
              Gestiona los horarios semanales del personal
            </p>
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
                      setEditingHorario(null);
                      resetFormulario();
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Horario
                  </button>
                </DialogTrigger>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar barbero o notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>

              <select
                value={filterBarbero}
                onChange={(e) => setFilterBarbero(e.target.value)}
                className="elegante-input"
              >
                <option value="all">Todos los barberos</option>
                {barberos.map((barbero) => (
                  <option key={barbero} value={barbero}>
                    {barbero}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedHorarios.length} de {filteredHorarios.length} registros
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">
                    Barbero
                  </th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">
                    Días
                  </th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">
                    Horas
                  </th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">
                    Bloques
                  </th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedHorarios.map((horario) => (
                  <tr
                    key={horario.id}
                    className="border-b border-gray-dark hover:bg-gray-darker transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-dark border border-gray-medium flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-lighter" />
                        </div>
                        <span className="text-gray-lighter">
                          {horario.barbero}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">
                        {getDiasResumen(horario.bloques)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-lighter text-sm">
                        {horario.bloques.length > 0 && (
                          <div className="text-gray-lighter">
                            {horario.bloques[0].horaInicio} - {horario.bloques[0].horaFin}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded bg-gray-medium text-gray-lighter text-sm">
                        {horario.bloques.length} bloque{horario.bloques.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(horario)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => toggleEstadoHorario(horario)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title={horario.activo ? "Desactivar" : "Activar"}
                        >
                          {horario.activo ? (
                            <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditHorario(horario)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteHorario(horario)}
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

            {displayedHorarios.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white-primary mb-2">
                  No se encontraron horarios
                </h3>
                <p className="text-gray-lightest">
                  Intenta con otros términos de búsqueda o filtros
                </p>
              </div>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-dark">
              <div className="text-sm text-gray-lightest">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-dark hover:bg-gray-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-lightest" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-dark hover:bg-gray-darker disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-lightest" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialog de Creación/Edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-dark">
            <DialogTitle className="text-white-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-primary" />
              {editingHorario ? "Editar Horario" : "Nuevo Horario"}
            </DialogTitle>
            <DialogDescription className="text-gray-lightest mt-1.5">
              {editingHorario
                ? "Modifica la información del horario"
                : "Crea un horario semanal agregando bloques de día y hora"}
            </DialogDescription>
          </DialogHeader>


          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda: Barbero + Agregar Bloque */}
              <div className="space-y-4">
                {/* Barbero */}
                <div className="space-y-1.5">
                  <Label className="text-gray-lightest text-sm">Barbero *</Label>
                  <select
                    value={nuevoHorario.barbero}
                    onChange={(e) =>
                      setNuevoHorario({ ...nuevoHorario, barbero: e.target.value })
                    }
                    className="elegante-input p-2.5 w-full"
                  >
                    <option value="">Seleccionar barbero</option>
                    {barberos.map((barbero) => (
                      <option key={barbero} value={barbero}>
                        {barbero}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Agregar Bloque */}
                <div className="bg-gray-darker rounded-lg p-4 border border-gray-dark">
                  <h3 className="text-white-primary font-medium mb-3 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-orange-primary" />
                    Agregar Bloque de Horario
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-gray-lightest text-sm">Día</Label>
                      <select
                        value={nuevoBloque.dia}
                        onChange={(e) => setNuevoBloque({ ...nuevoBloque, dia: e.target.value })}
                        className="elegante-input p-2.5 w-full"
                      >
                        <option value="">Seleccionar día</option>
                        {diasSemana.map((dia) => (
                          <option key={dia} value={dia}>
                            {dia}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-gray-lightest text-sm">Hora inicio</Label>
                        <Input
                          type="time"
                          value={nuevoBloque.horaInicio}
                          onChange={(e) =>
                            setNuevoBloque({ ...nuevoBloque, horaInicio: e.target.value })
                          }
                          className="elegante-input p-2.5"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-lightest text-sm">Hora fin</Label>
                        <Input
                          type="time"
                          value={nuevoBloque.horaFin}
                          onChange={(e) =>
                            setNuevoBloque({ ...nuevoBloque, horaFin: e.target.value })
                          }
                          className="elegante-input p-2.5"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAgregarBloque}
                      className="w-full elegante-button-primary py-2 flex items-center justify-center gap-2 text-sm"
                      disabled={!nuevoBloque.dia || !nuevoBloque.horaInicio || !nuevoBloque.horaFin}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Bloque
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Bloques Agregados */}
              <div className="space-y-4">
                <div className="bg-gray-darker rounded-lg p-6 border border-gray-dark h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white-primary font-medium flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-orange-primary" />
                      Bloques Agregados
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-orange-primary/20 text-orange-primary text-xs font-medium">
                      {nuevoHorario.bloques.length}
                    </span>
                  </div>

                  {nuevoHorario.bloques.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-dark rounded-lg">
                      <Calendar className="w-8 h-8 text-gray-medium mx-auto mb-2" />
                      <p className="text-gray-lightest text-sm">Sin bloques</p>
                      <p className="text-gray-medium text-xs mt-1">
                        Agrega bloques de día y hora
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {ordenarBloques(nuevoHorario.bloques).map((bloque, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-gray-darkest border border-gray-dark"
                        >
                          <div className="flex items-center gap-2" style={{ padding: "1rem" }}>
                            <div className="w-7 h-7 rounded bg-orange-primary/20 flex items-center justify-center">
                              <Calendar className="w-3.5 h-3.5 text-orange-primary" />
                            </div>
                            <div>
                              <p className="text-white-primary font-semibold text-base">
                                {bloque.dia}
                              </p>
                              <p className="text-gray-lightest text-xs">
                                {bloque.horaInicio} - {bloque.horaFin}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEliminarBloque(nuevoHorario.bloques.indexOf(bloque))}
                            className="p-1.5 rounded hover:bg-red-600/20 transition-colors group" style={{ padding: "1rem" }}
                            title="Eliminar bloque"
                          >
                            <X className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-dark">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark text-white-primary transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={editingHorario ? handleUpdateHorario : handleCreateHorario}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={!nuevoHorario.barbero || nuevoHorario.bloques.length === 0}
            >
              <Clock className="w-4 h-4" />
              {editingHorario ? "Actualizar" : "Crear"} Horario
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialogs */}
      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border-gray-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              ¿Crear horario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              Se creará <span className="font-semibold text-orange-primary">1 registro</span> de
              horario para{" "}
              <span className="font-semibold text-white-primary">{nuevoHorario.barbero}</span> con{" "}
              <span className="font-semibold text-orange-primary">
                {nuevoHorario.bloques.length} bloque{nuevoHorario.bloques.length !== 1 ? "s" : ""}
              </span>{" "}
              de horario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsCreateDialogOpen(false)}
              className="elegante-button-secondary"
            >
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
              Se actualizará el horario de{" "}
              <span className="font-semibold text-white-primary">{nuevoHorario.barbero}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsEditDialogOpen(false)}
              className="elegante-button-secondary"
            >
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
              Se eliminará permanentemente el horario de{" "}
              <span className="font-semibold text-white-primary">{horarioToDelete?.barbero}</span>{" "}
              con todos sus bloques.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsDeleteDialogOpen(false)}
              className="elegante-button-secondary"
            >
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
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary text-xl flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Detalles del Horario
            </DialogTitle>
          </DialogHeader>

          {selectedHorario && (
            <div className="py-4 space-y-4">
              {/* Info Principal */}
              <div className="bg-gray-darker rounded-lg p-4 border border-gray-dark">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-dark border border-gray-medium flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-lighter" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white-primary font-semibold text-lg">
                      {selectedHorario.barbero}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedHorario.activo
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                        }`}
                    >
                      {selectedHorario.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloques de Horario */}
              <div className="bg-gray-darker rounded-lg p-4 border border-gray-dark">
                <h4 className="text-white-primary font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-primary" />
                  Bloques de Horario ({selectedHorario.bloques.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ordenarBloques(selectedHorario.bloques).map(
                    (bloque: BloqueHorario, index: number) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-gray-darkest border border-gray-dark"
                      >
                        <p className="text-white-primary font-medium">{bloque.dia}</p>
                        <p className="text-orange-primary text-sm">
                          {bloque.horaInicio} - {bloque.horaFin}
                        </p>
                      </div>
                    )
                  )
                  }
                </div>
              </div>

              {/* Notas */}
              {selectedHorario.notas && (
                <div className="bg-gray-darker rounded-lg p-4 border border-gray-dark">
                  <h4 className="text-white-primary font-medium mb-2">Notas</h4>
                  <p className="text-gray-lightest text-sm">{selectedHorario.notas}</p>
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
