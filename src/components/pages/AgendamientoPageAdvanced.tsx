import { useState } from "react";
import { Input } from "../ui/input";
import { Calendar, Clock, User, Edit, Trash2, Search, ChevronLeft, ChevronRight, Eye, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCustomAlert } from "../ui/custom-alert";

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const horasDelDia = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 AM a 9:00 PM

const citasData = [
  {
    id: 1,
    cliente: "Carlos Mendez",
    telefono: "+1234567890",
    servicio: "Corte + Barba",
    barbero: "Miguel Rodriguez",
    fecha: "2024-01-15",
    hora: "09:00",
    duracion: 60,
    precio: 45000,
    estado: "confirmada",
    notas: "Cliente regular, prefiere corte degradado"
  },
  {
    id: 2,
    cliente: "Ana García",
    telefono: "+1234567891",
    servicio: "Corte Dama",
    barbero: "Sofia Martinez",
    fecha: "2024-01-15",
    hora: "10:30",
    duracion: 45,
    precio: 35000,
    estado: "en-curso",
    notas: ""
  },
  {
    id: 3,
    cliente: "José Torres",
    telefono: "+1234567892",
    servicio: "Afeitado Clásico",
    barbero: "Miguel Rodriguez",
    fecha: "2024-01-15",
    hora: "11:00",
    duracion: 30,
    precio: 25000,
    estado: "pendiente",
    notas: "Primera vez, explicar proceso"
  },
  {
    id: 4,
    cliente: "María López",
    telefono: "+1234567893",
    servicio: "Tratamiento Capilar",
    barbero: "Sofia Martinez",
    fecha: "2024-01-15",
    hora: "12:00",
    duracion: 90,
    precio: 65000,
    estado: "confirmada",
    notas: "Cabello graso, usar productos específicos"
  },
  {
    id: 5,
    cliente: "Pedro Sanchez",
    telefono: "+1234567894",
    servicio: "Corte Caballero",
    barbero: "Miguel Rodriguez",
    fecha: "2024-01-15",
    hora: "09:30",
    duracion: 30,
    precio: 25000,
    estado: "pendiente",
    notas: ""
  }
];

const servicios = [
  { nombre: "Corte Caballero", precio: 25000 },
  { nombre: "Corte Dama", precio: 35000 },
  { nombre: "Corte + Barba", precio: 45000 },
  { nombre: "Afeitado Clásico", precio: 25000 },
  { nombre: "Tratamiento Capilar", precio: 65000 },
  { nombre: "Peinado Evento", precio: 40000 },
  { nombre: "Tintura", precio: 80000 },
  { nombre: "Mechas", precio: 95000 }
];

const barberos = [
  "Miguel Rodriguez", "Sofia Martinez", "Carlos Ruiz", "Ana Herrera"
];

const clientes = [
  { nombre: "Carlos Mendez", telefono: "+1234567890" },
  { nombre: "Ana García", telefono: "+1234567891" },
  { nombre: "José Torres", telefono: "+1234567892" },
  { nombre: "María López", telefono: "+1234567893" },
  { nombre: "Pedro Sanchez", telefono: "+1234567894" },
  { nombre: "Laura Martínez", telefono: "+1234567895" },
  { nombre: "Diego Hernández", telefono: "+1234567896" },
  { nombre: "Carmen Rodríguez", telefono: "+1234567897" },
  { nombre: "Roberto Díaz", telefono: "+1234567898" },
  { nombre: "Patricia Gómez", telefono: "+1234567899" }
];

const estados = [
  { value: "pendiente", label: "Pendiente", color: "bg-orange-primary" },
  { value: "confirmada", label: "Confirmada", color: "bg-orange-primary text-black-primary" },
  { value: "en-curso", label: "En Curso", color: "bg-green-600" },
  { value: "completada", label: "Completada", color: "bg-blue-600" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-600" }
];

// Función para formatear precios
const formatearPrecio = (precio: number): string => {
  const precioEntero = Math.round(precio);
  return `$ ${precioEntero.toLocaleString('es-CO')}`;
};

export function AgendamientoPageAdvanced() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [citas, setCitas] = useState(citasData);
  const [currentWeek, setCurrentWeek] = useState(0);

  // Estados para el modal de gestión de franja horaria
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dia: string, hora: number, fecha: string } | null>(null);
  const [slotSearchTerm, setSlotSearchTerm] = useState("");
  const [slotFilterEstado, setSlotFilterEstado] = useState("all");
  const [activeTab, setActiveTab] = useState<'lista' | 'crear' | 'detalle'>('lista');
  const [selectedCita, setSelectedCita] = useState<any>(null);

  // Estados para formulario de nueva cita
  const [nuevaCita, setNuevaCita] = useState({
    cliente: '',
    telefono: '',
    servicio: '',
    barbero: '',
    fecha: '',
    hora: '',
    duracion: 60,
    precio: 0,
    estado: 'pendiente',
    notas: ''
  });

  // Estados para confirmaciones
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState<any>(null);

  // Funciones auxiliares para el calendario
  const getCurrentWeekDays = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (currentWeek * 7));
    return diasSemana.map((dia, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return {
        dia,
        fecha: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        fechaCompleta: date.toISOString().split('T')[0]
      };
    });
  };

  const getCitasPorDia = (dia: string) => {
    const today = new Date();
    const currentWeekStart = new Date();
    currentWeekStart.setDate(today.getDate() + (currentWeek * 7));

    const dayIndex = diasSemana.indexOf(dia);
    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(currentWeekStart.getDate() + dayIndex);

    const targetDateString = targetDate.toISOString().split('T')[0];

    return citas.filter(cita => cita.fecha === targetDateString);
  };

  // Obtener citas específicas para una hora y día
  const getCitasEnSlot = (dia: string, hora: number) => {
    const citasDelDia = getCitasPorDia(dia);
    return citasDelDia.filter(cita => {
      const horaSplit = cita.hora.split(':');
      const horaInicio = parseInt(horaSplit[0] || '0');
      const minutosInicio = parseInt(horaSplit[1] || '0');

      const horaFin = horaInicio + Math.ceil(cita.duracion / 60);
      return horaInicio <= hora && hora < horaFin;
    }).filter(cita => {
      // Aplicar filtros de búsqueda
      const matchesSearch = cita.cliente.toLowerCase().includes(slotSearchTerm.toLowerCase()) ||
        cita.telefono.includes(slotSearchTerm) ||
        cita.servicio.toLowerCase().includes(slotSearchTerm.toLowerCase());
      const matchesEstado = slotFilterEstado === "all" || cita.estado === slotFilterEstado;
      return matchesSearch && matchesEstado;
    });
  };

  const getCitaColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return '#d8b081';
      case 'en-curso': return '#22C55E';
      case 'completada': return '#3B82F6';
      case 'cancelada': return '#EF4444';
      case 'pendiente': return '#d8b081';
      default: return '#d8b081';
    }
  };

  const getEstadoInfo = (estado: string) => {
    const estadoInfo = estados.find(e => e.value === estado);
    return estadoInfo || { value: estado, label: estado, color: "bg-gray-medium" };
  };

  // Manejar clic en celda del calendario
  const handleSlotClick = (dia: string, hora: number) => {
    const weekDays = getCurrentWeekDays();
    const dayInfo = weekDays.find(d => d.dia === dia);

    setSelectedSlot({
      dia,
      hora,
      fecha: dayInfo?.fechaCompleta || ''
    });

    // Preparar formulario para nueva cita
    const horaString = hora.toString().padStart(2, '0') + ':00';
    setNuevaCita({
      cliente: '',
      telefono: '',
      servicio: '',
      barbero: '',
      fecha: dayInfo?.fechaCompleta || '',
      hora: horaString,
      duracion: 60,
      precio: 0,
      estado: 'pendiente',
      notas: ''
    });

    setActiveTab('lista');
    setSlotSearchTerm("");
    setSlotFilterEstado("all");
    setIsSlotModalOpen(true);
  };

  // Manejar selección de servicio
  const handleServicioChange = (nombreServicio: string) => {
    const servicio = servicios.find(s => s.nombre === nombreServicio);
    setNuevaCita({
      ...nuevaCita,
      servicio: nombreServicio,
      precio: servicio ? servicio.precio : 0
    });
  };

  // Crear nueva cita
  const handleCreateCita = () => {
    if (!nuevaCita.cliente || !nuevaCita.telefono || !nuevaCita.servicio || !nuevaCita.barbero) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios.");
      return;
    }

    const cita = {
      id: Date.now(),
      ...nuevaCita,
      precio: parseFloat(nuevaCita.precio.toString())
    };

    setCitas([...citas, cita]);
    setNuevaCita({
      cliente: '',
      telefono: '',
      servicio: '',
      barbero: '',
      fecha: selectedSlot?.fecha || '',
      hora: selectedSlot?.hora.toString().padStart(2, '0') + ':00' || '',
      duracion: 60,
      precio: 0,
      estado: 'pendiente',
      notas: ''
    });

    success("¡Cita creada exitosamente!", `La cita para ${cita.cliente} ha sido registrada.`);
    setActiveTab('lista');
  };

  // Editar cita
  const handleEditCita = (cita: any) => {
    setSelectedCita(cita);
    setNuevaCita(cita);
    setActiveTab('crear');
  };

  // Actualizar cita
  const handleUpdateCita = () => {
    if (!nuevaCita.cliente || !nuevaCita.telefono || !nuevaCita.servicio || !nuevaCita.barbero) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios.");
      return;
    }

    setCitas(citas.map(cita =>
      cita.id === selectedCita.id
        ? { ...cita, ...nuevaCita, precio: parseFloat(nuevaCita.precio.toString()) }
        : cita
    ));

    success("¡Cita actualizada exitosamente!", `Los cambios han sido guardados correctamente.`);
    setSelectedCita(null);
    setActiveTab('lista');
  };

  // Eliminar cita
  const handleDeleteCita = (cita: any) => {
    setCitaToDelete(cita);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCita = () => {
    if (citaToDelete) {
      setCitas(citas.filter(cita => cita.id !== citaToDelete.id));
      setIsDeleteDialogOpen(false);
      setCitaToDelete(null);
      success("¡Cita eliminada exitosamente!", `La cita ha sido eliminada del sistema.`);
    }
  };

  // Cambiar estado de cita
  const handleChangeEstado = (citaId: number, nuevoEstado: string) => {
    setCitas(citas.map(cita =>
      cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita
    ));
    success("Estado actualizado", "El estado de la cita ha sido modificado.");
  };

  // Ver detalle de cita
  const handleViewDetail = (cita: any) => {
    setSelectedCita(cita);
    setActiveTab('detalle');
  };

  // Stats para el dashboard
  const totalCitas = citas.length;
  const citasActivas = citas.filter(c => c.estado !== 'cancelada').length;
  const citasHoy = citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length;

  return (
    <>
      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="elegante-card text-center">
            <Calendar className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{totalCitas}</h4>
            <p className="text-gray-lightest text-sm">Total Citas</p>
          </div>
          <div className="elegante-card text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{citasActivas}</h4>
            <p className="text-gray-lightest text-sm">Citas Activas</p>
          </div>
          <div className="elegante-card text-center">
            <User className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{citasHoy}</h4>
            <p className="text-gray-lightest text-sm">Citas Hoy</p>
          </div>
        </div>

        {/* Navegación de Semana */}
        <div className="elegante-card mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="elegante-button-secondary p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-white-primary">
              Semana {currentWeek === 0 ? 'Actual' :
                currentWeek > 0 ? `+${currentWeek}` : currentWeek}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentWeek(0)}
                className="elegante-button-secondary text-sm"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentWeek(currentWeek + 1)}
                className="elegante-button-secondary p-2"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendario Semanal */}
        <div className="elegante-card">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header de días */}
              <div className="grid grid-cols-8 gap-1 mb-4 border-b border-gray-dark pb-4">
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-light">Horas</span>
                </div>
                {getCurrentWeekDays().map(({ dia, fecha }) => (
                  <div key={dia} className="text-center">
                    <h4 className="font-semibold text-white-primary">{dia}</h4>
                    <p className="text-xs text-gray-lightest">{fecha}</p>
                    <div className="text-xs text-orange-primary mt-1">
                      {getCitasPorDia(dia).length} citas
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid de horarios */}
              <div className="relative">
                {horasDelDia.map((hora) => (
                  <div key={hora} className="grid grid-cols-8 gap-1 h-16 border-b border-gray-dark">
                    <div className="flex items-center justify-center text-sm text-gray-light">
                      {hora}:00
                    </div>
                    {diasSemana.map((dia) => {
                      const citasEnSlot = getCitasEnSlot(dia, hora);

                      return (
                        <div
                          key={`${dia}-${hora}`}
                          className="relative rounded border transition-all duration-200 bg-gray-darker border-gray-dark hover:bg-gray-dark hover:border-orange-primary/50 cursor-pointer group"
                          onClick={() => handleSlotClick(dia, hora)}
                          title={`Gestionar citas de ${dia} a las ${hora}:00`}
                        >
                          {/* Indicador de citas */}
                          {citasEnSlot.length > 0 && (
                            <div className="absolute top-1 right-1 bg-orange-primary text-black-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                              {citasEnSlot.length}
                            </div>
                          )}

                          {/* Overlay hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="text-center">
                              <MoreHorizontal className="w-6 h-6 text-orange-primary mx-auto mb-1" />
                              <span className="text-xs text-orange-primary">Gestionar</span>
                            </div>
                          </div>

                          {/* Vista previa de citas */}
                          <div className="p-1 space-y-1 max-h-14 overflow-hidden">
                            {citasEnSlot.slice(0, 2).map((cita) => (
                              <div
                                key={cita.id}
                                className="text-xs p-1 rounded truncate"
                                style={{
                                  backgroundColor: getCitaColor(cita.estado) + '40',
                                  color: getCitaColor(cita.estado),
                                  border: `1px solid ${getCitaColor(cita.estado)}`
                                }}
                              >
                                {cita.cliente}
                              </div>
                            ))}
                            {citasEnSlot.length > 2 && (
                              <div className="text-xs text-gray-light text-center">
                                +{citasEnSlot.length - 2} más
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Gestión de Franja Horaria */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-dark pb-4">
            <DialogTitle className="text-white-primary text-2xl flex items-center gap-3">
              <Clock className="w-7 h-7 text-orange-primary" />
              {selectedSlot && `${selectedSlot.dia} - ${selectedSlot.hora}:00`}
            </DialogTitle>
            <DialogDescription className="text-gray-lightest text-lg">
              Gestiona todas las citas para esta franja horaria
            </DialogDescription>
          </DialogHeader>

          {/* Tabs de navegación */}
          <div className="flex border-b border-gray-dark mb-6">
            <button
              onClick={() => setActiveTab('lista')}
              className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'lista'
                  ? 'border-orange-primary text-orange-primary'
                  : 'border-transparent text-gray-lightest hover:text-white-primary'
                }`}
            >
              Lista de Citas
            </button>
            <button
              onClick={() => {
                setActiveTab('crear');
                if (!selectedCita) {
                  setNuevaCita({
                    cliente: '',
                    telefono: '',
                    servicio: '',
                    barbero: '',
                    fecha: selectedSlot?.fecha || '',
                    hora: selectedSlot?.hora.toString().padStart(2, '0') + ':00' || '',
                    duracion: 60,
                    precio: 0,
                    estado: 'pendiente',
                    notas: ''
                  });
                }
              }}
              className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'crear'
                  ? 'border-orange-primary text-orange-primary'
                  : 'border-transparent text-gray-lightest hover:text-white-primary'
                }`}
            >
              {selectedCita ? 'Editar Cita' : 'Nueva Cita'}
            </button>
            {activeTab === 'detalle' && selectedCita && (
              <button
                onClick={() => setActiveTab('detalle')}
                className="px-6 py-3 border-b-2 border-orange-primary text-orange-primary"
              >
                Detalle de Cita
              </button>
            )}
          </div>

          {/* Contenido según tab activo */}
          {activeTab === 'lista' && (
            <div className="space-y-6">
              {/* Filtros y búsqueda */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                  <Input
                    placeholder="Buscar por cliente, teléfono o servicio..."
                    value={slotSearchTerm}
                    onChange={(e) => setSlotSearchTerm(e.target.value)}
                    className="elegante-input pl-11"
                  />
                </div>

                <Select value={slotFilterEstado} onValueChange={setSlotFilterEstado}>
                  <SelectTrigger className="w-48 elegante-input">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-darkest border-gray-dark">
                    <SelectItem value="all" className="text-white-primary">Todos</SelectItem>
                    {estados.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value} className="text-white-primary">
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de citas */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedSlot && getCitasEnSlot(selectedSlot.dia, selectedSlot.hora).map((cita) => (
                  <div key={cita.id} className="bg-gray-darker border border-gray-dark rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getCitaColor(cita.estado) }}
                        />
                        <h4 className="font-semibold text-white-primary">{cita.cliente}</h4>
                        <div className={`elegante-tag ${getEstadoInfo(cita.estado).color} text-white text-xs`}>
                          {getEstadoInfo(cita.estado).label}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(cita)}
                          className="p-2 rounded bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleEditCita(cita)}
                          className="p-2 rounded bg-orange-primary/20 hover:bg-orange-primary/30 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteCita(cita)}
                          className="p-2 rounded bg-red-600/20 hover:bg-red-600/30 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>

                        {/* Cambio rápido de estado */}
                        <Select value={cita.estado} onValueChange={(value) => handleChangeEstado(cita.id, value)}>
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-darkest border-gray-dark">
                            {estados.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value} className="text-white-primary text-xs">
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-lightest">
                      <div>
                        <span className="text-gray-light">Servicio:</span> {cita.servicio}
                      </div>
                      <div>
                        <span className="text-gray-light">Barbero:</span> {cita.barbero}
                      </div>
                      <div>
                        <span className="text-gray-light">Hora:</span> {cita.hora} ({cita.duracion}min)
                      </div>
                      <div>
                        <span className="text-gray-light">Precio:</span> {formatearPrecio(cita.precio)}
                      </div>
                    </div>

                    {cita.notas && (
                      <div className="mt-2 text-sm text-gray-lightest">
                        <span className="text-gray-light">Notas:</span> {cita.notas}
                      </div>
                    )}
                  </div>
                ))}

                {selectedSlot && getCitasEnSlot(selectedSlot.dia, selectedSlot.hora).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-medium mx-auto mb-4" />
                    <p className="text-gray-lightest">No hay citas para esta franja horaria</p>
                    <button
                      onClick={() => setActiveTab('crear')}
                      className="elegante-button-primary mt-4"
                    >
                      
                      Crear Cita
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'crear' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información del Cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white-primary">Información del Cliente</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white-primary mb-2">Cliente</Label>
                      <Select 
                        value={nuevaCita.cliente} 
                        onValueChange={(value) => {
                          const clienteSeleccionado = clientes.find(c => c.nombre === value);
                          setNuevaCita({ 
                            ...nuevaCita, 
                            cliente: value,
                            telefono: clienteSeleccionado ? clienteSeleccionado.telefono : ''
                          });
                        }}
                      >
                        <SelectTrigger className="elegante-input">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-darkest border-gray-dark">
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.nombre} value={cliente.nombre} className="text-white-primary">
                              {cliente.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white-primary mb-2">Teléfono</Label>
                      <Input
                        value={nuevaCita.telefono}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, telefono: e.target.value })}
                        placeholder="+57 300 123 4567"
                        className="elegante-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles del Servicio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white-primary">Detalles del Servicio</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white-primary mb-2">Servicio</Label>
                      <Select value={nuevaCita.servicio} onValueChange={handleServicioChange}>
                        <SelectTrigger className="elegante-input">
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-darkest border-gray-dark">
                          {servicios.map((servicio) => (
                            <SelectItem key={servicio.nombre} value={servicio.nombre} className="text-white-primary">
                              {servicio.nombre} - {formatearPrecio(servicio.precio)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white-primary mb-2">Barbero</Label>
                      <Select value={nuevaCita.barbero} onValueChange={(value) => setNuevaCita({ ...nuevaCita, barbero: value })}>
                        <SelectTrigger className="elegante-input">
                          <SelectValue placeholder="Seleccionar barbero" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-darkest border-gray-dark">
                          {barberos.map((barbero) => (
                            <SelectItem key={barbero} value={barbero} className="text-white-primary">
                              {barbero}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Programación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white-primary">Programación</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-white-primary  mb-2">Fecha</Label>
                      <Input
                        type="date"
                        value={nuevaCita.fecha}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                    <div>
                      <Label className="text-white-primary mb-2">Hora</Label>
                      <Input
                        type="time"
                        value={nuevaCita.hora}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                    <div>
                      <Label className="text-white-primary mb-2">Duración (min)</Label>
                      <Input
                        type="number"
                        value={nuevaCita.duracion}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, duracion: parseInt(e.target.value) })}
                        className="elegante-input"
                        step="15"
                        min="15"
                        max="180"
                      />
                    </div>
                  </div>
                </div>

                {/* Precio y Estado */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white-primary">Precio y Estado</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white-primary mb-2">Precio (COP)</Label>
                      <Input
                        type="number"
                        value={nuevaCita.precio}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, precio: parseFloat(e.target.value) })}
                        className="elegante-input"
                        step="1000"
                      />
                    </div>
                    <div>
                      <Label className="text-white-primary mb-2">Estado</Label>
                      <Select value={nuevaCita.estado} onValueChange={(value) => setNuevaCita({ ...nuevaCita, estado: value })}>
                        <SelectTrigger className="elegante-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-darkest border-gray-dark">
                          {estados.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value} className="text-white-primary">
                              {estado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <Label className="text-white-primary mb-2">Notas Adicionales</Label>
                <Textarea
                  value={nuevaCita.notas}
                  onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
                  placeholder="Comentarios especiales sobre la cita..."
                  className="elegante-input min-h-[50px]"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-dark">
                <button
                  onClick={() => {
                    setActiveTab('lista');
                    setSelectedCita(null);
                  }}
                  className="elegante-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={selectedCita ? handleUpdateCita : handleCreateCita}
                  className="elegante-button-primary"
                  disabled={!nuevaCita.cliente || !nuevaCita.servicio || !nuevaCita.barbero}
                >
                  {selectedCita ? 'Actualizar' : 'Crear'} Cita
                </button>
              </div>
            </div>
          )}

          {activeTab === 'detalle' && selectedCita && (
            <div className="space-y-6">
              <div className="bg-gray-darker border border-gray-dark rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white-primary">{selectedCita.cliente}</h3>
                  <div className={`elegante-tag ${getEstadoInfo(selectedCita.estado).color} text-white`}>
                    {getEstadoInfo(selectedCita.estado).label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-light mb-1">Información del Cliente</h4>
                      <p className="text-white-primary">{selectedCita.cliente}</p>
                      <p className="text-gray-lightest text-sm">{selectedCita.telefono}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-light mb-1">Servicio</h4>
                      <p className="text-white-primary">{selectedCita.servicio}</p>
                      <p className="text-orange-primary font-semibold">{formatearPrecio(selectedCita.precio)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-light mb-1">Programación</h4>
                      <p className="text-white-primary">{selectedCita.fecha}</p>
                      <p className="text-gray-lightest">{selectedCita.hora} - {selectedCita.duracion} minutos</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-light mb-1">Barbero Asignado</h4>
                      <p className="text-white-primary">{selectedCita.barbero}</p>
                    </div>
                  </div>
                </div>

                {selectedCita.notas && (
                  <div className="mt-6 pt-4 border-t border-gray-dark">
                    <h4 className="text-sm font-semibold text-gray-light mb-2">Notas Especiales</h4>
                    <p className="text-gray-lightest">{selectedCita.notas}</p>
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-dark">
                  <button
                    onClick={() => setActiveTab('lista')}
                    className="elegante-button-secondary"
                  >
                    Volver a Lista
                  </button>
                  <button
                    onClick={() => handleEditCita(selectedCita)}
                    className="elegante-button-primary"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Cita
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer del modal */}
          
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border border-orange-primary">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-white-primary">
                Confirmar Eliminación
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-lightest">
              ¿Estás seguro de que deseas eliminar la cita de {citaToDelete?.cliente}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="elegante-button-secondary"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCitaToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={confirmDeleteCita}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertContainer />
    </>
  );
}