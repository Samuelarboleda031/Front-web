import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar, Clock, User, Scissors, Plus, Edit, Trash2, Search, Filter, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, MoreHorizontal, Copy, Save, RefreshCw, Settings, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
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

const estados = [
  { value: "pendiente", label: "Pendiente", color: "bg-orange-primary" },
  { value: "confirmada", label: "Confirmada", color: "bg-orange-primary text-black-primary" },
  { value: "en-curso", label: "En Curso", color: "bg-green-600" },
  { value: "completada", label: "Completada", color: "bg-blue-600" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-600" }
];

// Función para formatear precios en pesos colombianos
const formatearPrecio = (precio: number): string => {
  const precioEntero = Math.round(precio);
  return `$ ${precioEntero.toLocaleString('es-CO')}`;
};

export function AgendamientoPageGoogleCalendar() {
  const { success, error, AlertContainer } = useCustomAlert();
  const [citas, setCitas] = useState(citasData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterBarbero, setFilterBarbero] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
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

  const filteredCitas = citas.filter(cita => {
    const matchesSearch = cita.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.telefono.includes(searchTerm);
    const matchesEstado = filterEstado === "all" || cita.estado === filterEstado;
    const matchesBarbero = filterBarbero === "all" || cita.barbero === filterBarbero;
    return matchesSearch && matchesEstado && matchesBarbero;
  });

  // Funciones auxiliares para el calendario
  const getCurrentWeekDays = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (currentWeek * 7));
    return diasSemana.map((dia, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return {
        dia,
        fecha: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
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

    return filteredCitas.filter(cita => cita.fecha === targetDateString);
  };

  const getCitaDuration = (duracion: number) => {
    return (duracion / 60) * 64; // 64px por hora
  };

  const getCitaColor = (estado: string) => {
    // Obtener colores del tema actual
    const themeColor = document.documentElement.getAttribute('data-theme') === 'light' ? '#d8b081' : '#d8b081';

    switch (estado) {
      case 'confirmada': return themeColor;
      case 'en-curso': return '#22C55E';
      case 'completada': return '#3B82F6';
      case 'cancelada': return '#EF4444';
      case 'pendiente': return '#d8b081';
      default: return themeColor;
    }
  };

  // Función para manejar clic en celda vacía del calendario
  const handleCeldaClick = (dia: string, hora: number) => {
    const today = new Date();
    const currentWeekStart = new Date();
    currentWeekStart.setDate(today.getDate() + (currentWeek * 7));

    const dayIndex = diasSemana.indexOf(dia);
    const targetDate = new Date(currentWeekStart);
    targetDate.setDate(currentWeekStart.getDate() + dayIndex);

    const targetDateString = targetDate.toISOString().split('T')[0];
    const horaString = hora.toString().padStart(2, '0') + ':00';

    setNuevaCita({
      cliente: '',
      telefono: '',
      servicio: '',
      barbero: '',
      fecha: targetDateString,
      hora: horaString,
      duracion: 60,
      precio: 0,
      estado: 'pendiente',
      notas: ''
    });

    setEditingCita(null);
    setIsDialogOpen(true);
  };

  // Actualizar precio automáticamente cuando se selecciona un servicio
  const handleServicioChange = (nombreServicio: string) => {
    const servicio = servicios.find(s => s.nombre === nombreServicio);
    setNuevaCita({
      ...nuevaCita,
      servicio: nombreServicio,
      precio: servicio ? servicio.precio : 0
    });
  };

  const handleCreateCita = () => {
    if (!nuevaCita.cliente || !nuevaCita.telefono || !nuevaCita.servicio || !nuevaCita.barbero || !nuevaCita.fecha || !nuevaCita.hora) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: cliente, teléfono, servicio, barbero, fecha y hora.");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const confirmCreateCita = () => {
    const cita = {
      id: Date.now(),
      ...nuevaCita,
      precio: parseFloat(nuevaCita.precio.toString())
    };
    setCitas([...citas, cita]);
    setNuevaCita({
      cliente: '', telefono: '', servicio: '', barbero: '', fecha: '', hora: '',
      duracion: 60, precio: 0, estado: 'pendiente', notas: ''
    });
    setIsDialogOpen(false);
    setIsCreateDialogOpen(false);
    success("¡Cita creada exitosamente!", `La cita para ${cita.cliente} con ${cita.barbero} el ${cita.fecha} a las ${cita.hora} ha sido registrada.`);
  };

  const handleEditCita = (cita: any) => {
    setEditingCita(cita);
    setNuevaCita(cita);
    setIsDialogOpen(true);
  };

  const handleUpdateCita = () => {
    if (!nuevaCita.cliente || !nuevaCita.telefono || !nuevaCita.servicio || !nuevaCita.barbero || !nuevaCita.fecha || !nuevaCita.hora) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: cliente, teléfono, servicio, barbero, fecha y hora.");
      return;
    }
    setIsEditDialogOpen(true);
  };

  const confirmEditCita = () => {
    if (editingCita) {
      setCitas(citas.map(cita =>
        cita.id === editingCita.id
          ? { ...cita, ...nuevaCita, precio: parseFloat(nuevaCita.precio.toString()) }
          : cita
      ));
      setEditingCita(null);
      setNuevaCita({
        cliente: '', telefono: '', servicio: '', barbero: '', fecha: '', hora: '',
        duracion: 60, precio: 0, estado: 'pendiente', notas: ''
      });
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      success("¡Cita actualizada exitosamente!", `Los cambios en la cita de ${nuevaCita.cliente} han sido guardados correctamente.`);
    }
  };

  const handleDeleteCita = (citaId: number) => {
    const cita = citas.find(c => c.id === citaId);
    if (!cita) return;

    setCitaToDelete(cita);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCita = () => {
    if (citaToDelete) {
      setCitas(citas.filter(cita => cita.id !== citaToDelete.id));
      setIsDeleteDialogOpen(false);
      setCitaToDelete(null);
      success("¡Cita eliminada exitosamente!", `La cita de ${citaToDelete.cliente} del ${citaToDelete.fecha} ha sido eliminada del sistema.`);
    }
  };

  const getEstadoInfo = (estado: string) => {
    const estadoInfo = estados.find(e => e.value === estado);
    return estadoInfo || { value: estado, label: estado, color: "bg-gray-medium" };
  };

  // Stats para el dashboard
  const totalCitas = citas.length;
  const citasActivas = citas.filter(c => c.estado !== 'cancelada').length;
  const citasHoy = citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]).length;
  const citasFinSemana = citas.filter(c => {
    const fecha = new Date(c.fecha);
    const dayOfWeek = fecha.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }).length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Agendamiento</h1>
            <p className="text-sm text-gray-lightest mt-1">Haz clic en cualquier celda del calendario para crear una cita</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="elegante-button-primary gap-2 flex items-center"
                  onClick={() => {
                    setEditingCita(null);
                    setNuevaCita({
                      cliente: '', telefono: '', servicio: '', barbero: '', fecha: '', hora: '',
                      duracion: 60, precio: 0, estado: 'pendiente', notas: ''
                    });
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nueva Cita
                </button>
              </DialogTrigger>
              <DialogContent className="bg-gray-darkest border-gray-dark w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white-primary text-2xl flex items-center gap-3">
                    <Calendar className="w-7 h-7 text-orange-primary" />
                    {editingCita ? 'Editar Cita' : 'Agendar Nueva Cita'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-lightest text-lg">
                    Completa la información de la cita para registrarla en el sistema
                  </DialogDescription>
                </DialogHeader>

                <div className="py-8 px-6">
                  {/* Información del Cliente */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-orange-primary" />
                      Información del Cliente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Cliente</Label>
                        <Input
                          value={nuevaCita.cliente}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, cliente: e.target.value })}
                          placeholder="Nombre completo del cliente"
                          className="elegante-input text-lg p-4"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Teléfono</Label>
                        <Input
                          value={nuevaCita.telefono}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, telefono: e.target.value })}
                          placeholder="+57 300 123 4567"
                          className="elegante-input text-lg p-4"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detalles del Servicio */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-orange-primary" />
                      Detalles del Servicio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-white-primary mb-2  text-lg">Servicio</Label>
                        <Select
                          value={nuevaCita.servicio}
                          onValueChange={handleServicioChange}
                        >
                          <SelectTrigger className="elegante-input text-lg h-14">
                            <SelectValue placeholder="Seleccionar servicio" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-darkest border-gray-dark">
                            {servicios.map((servicio) => (
                              <SelectItem key={servicio.nombre} value={servicio.nombre} className="text-white-primary text-lg py-3">
                                {servicio.nombre} - {formatearPrecio(servicio.precio)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Barbero</Label>
                        <Select value={nuevaCita.barbero} onValueChange={(value) => setNuevaCita({ ...nuevaCita, barbero: value })}>
                          <SelectTrigger className="elegante-input text-lg h-14">
                            <SelectValue placeholder="Seleccionar barbero" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-darkest border-gray-dark">
                            {barberos.map((barbero) => (
                              <SelectItem key={barbero} value={barbero} className="text-white-primary text-lg py-3">
                                {barbero}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Programación */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-primary" />
                      Programación de la Cita
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Fecha</Label>
                        <Input
                          type="date"
                          value={nuevaCita.fecha}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                          className="elegante-input text-lg p-4"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Hora</Label>
                        <Input
                          type="time"
                          value={nuevaCita.hora}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                          className="elegante-input text-lg p-4"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Duración (minutos)</Label>
                        <Input
                          type="number"
                          value={nuevaCita.duracion}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, duracion: parseInt(e.target.value) })}
                          className="elegante-input text-lg p-4"
                          step="15"
                          min="15"
                          max="180"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Precio y Estado */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white-primary mb-6 flex items-center gap-2">
                      <span className="text-orange-primary">$</span>
                      Precio y Estado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Precio (COP)</Label>
                        <Input
                          type="number"
                          step="1000"
                          value={nuevaCita.precio}
                          onChange={(e) => setNuevaCita({ ...nuevaCita, precio: parseFloat(e.target.value) })}
                          placeholder="35000"
                          className="elegante-input text-lg p-4"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white-primary text-lg">Estado Inicial</Label>
                        <Select value={nuevaCita.estado} onValueChange={(value) => setNuevaCita({ ...nuevaCita, estado: value })}>
                          <SelectTrigger className="elegante-input text-lg h-14">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-darkest border-gray-dark">
                            {estados.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value} className="text-white-primary text-lg py-3">
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Notas Adicionales */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white-primary mb-6">Notas Adicionales</h3>
                    <div className="space-y-3">
                      <Label className="text-white-primary text-lg">Comentarios o instrucciones especiales</Label>
                      <Textarea
                        value={nuevaCita.notas}
                        onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
                        placeholder="Escribe aquí cualquier nota especial sobre la cita, preferencias del cliente, alergias, etc..."
                        className="elegante-input text-lg min-h-[120px] resize-none"
                        rows={5}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 mt-6 border-t border-gray-dark px-6">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="elegante-button-secondary text-lg px-8 py-4"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingCita ? handleUpdateCita : handleCreateCita}
                    className="elegante-button-primary text-lg px-8 py-4"
                    disabled={!nuevaCita.cliente || !nuevaCita.servicio || !nuevaCita.barbero || !nuevaCita.fecha || !nuevaCita.hora}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {editingCita ? 'Actualizar' : 'Agendar'} Cita
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Controles y Filtros */}
        <div className="elegante-card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <Input
                  placeholder="Buscar cliente o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-80"
                />
              </div>

              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-48 elegante-input">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent className="bg-gray-darkest border-gray-dark">
                  <SelectItem value="all" className="text-white-primary">Todos los estados</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value} className="text-white-primary">
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterBarbero} onValueChange={setFilterBarbero}>
                <SelectTrigger className="w-48 elegante-input">
                  <SelectValue placeholder="Todos los barberos" />
                </SelectTrigger>
                <SelectContent className="bg-gray-darkest border-gray-dark">
                  <SelectItem value="all" className="text-white-primary">Todos los barberos</SelectItem>
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

        {/* Vista Semanal estilo Google Calendar */}
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
                      const citasEnEstaHora = getCitasPorDia(dia).filter(c => {
                        const horaInicio = parseInt(c.hora.split(':')[0]);
                        const horaFin = horaInicio + Math.ceil(c.duracion / 60);
                        return horaInicio <= hora && hora < horaFin;
                      });

                      const tieneCitas = citasEnEstaHora.length > 0;

                      return (
                        <div
                          key={`${dia}-${hora}`}
                          className={`relative rounded border transition-all duration-200 ${tieneCitas
                              ? 'bg-gray-darker border-gray-dark'
                              : 'bg-gray-darker border-gray-dark hover:bg-gray-dark hover:border-orange-primary/50 cursor-pointer group'
                            }`}
                          onClick={() => !tieneCitas && handleCeldaClick(dia, hora)}
                          title={!tieneCitas ? `Crear cita para ${dia} a las ${hora}:00` : ''}
                        >
                          {/* Overlay para celdas vacías */}
                          {!tieneCitas && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Plus className="w-4 h-4 text-orange-primary" />
                            </div>
                          )}

                          {/* Citas para este día y hora */}
                          {citasEnEstaHora.map((cita) => {
                            const horaInicio = parseInt(cita.hora.split(':')[0]);
                            if (horaInicio === hora) {
                              return (
                                <div
                                  key={cita.id}
                                  className="absolute inset-1 rounded text-xs p-1 cursor-pointer transition-all hover:opacity-80 hover:scale-105 hover:z-10"
                                  style={{
                                    backgroundColor: getCitaColor(cita.estado),
                                    color: 'white',
                                    height: `${getCitaDuration(cita.duracion)}px`,
                                    minHeight: '50px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCita(cita);
                                  }}
                                  title={`${cita.cliente} - ${cita.servicio}`}
                                >
                                  <div className="font-semibold truncate">{cita.cliente}</div>
                                  <div className="truncate opacity-90">{cita.servicio}</div>
                                  <div className="text-xs opacity-75">
                                    {cita.hora} - {formatearPrecio(cita.precio)}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
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

      {/* Alert Dialogs para Confirmación de Citas */}

      {/* Confirmación de Creación */}
      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border border-orange-primary shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <AlertDialogTitle className="text-white-primary text-lg">
                Confirmar Creación de Cita
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-lightest">
              ¿Estás seguro de que deseas agendar la cita para {nuevaCita.cliente} con {nuevaCita.barbero} el {nuevaCita.fecha} a las {nuevaCita.hora}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3">
            <AlertDialogCancel
              className="elegante-button-secondary"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white border-none"
              onClick={confirmCreateCita}
            >
              Agendar Cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación de Edición */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border border-orange-primary shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Edit className="w-5 h-5 text-blue-400" />
              </div>
              <AlertDialogTitle className="text-white-primary text-lg">
                Confirmar Edición de Cita
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-lightest">
              ¿Estás seguro de que deseas guardar los cambios realizados en la cita de {nuevaCita.cliente}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3">
            <AlertDialogCancel
              className="elegante-button-secondary"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700 text-white border-none"
              onClick={confirmEditCita}
            >
              Guardar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-darkest border border-orange-primary shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-white-primary text-lg">
                Confirmar Eliminación
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-lightest">
              ¿Estás seguro de que deseas eliminar la cita de {citaToDelete?.cliente} del {citaToDelete?.fecha}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3">
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