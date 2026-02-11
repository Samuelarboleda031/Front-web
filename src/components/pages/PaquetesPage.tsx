import React, { useState } from "react";
import {
  Gift,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Search,
  Eye,
  Clock,
  DollarSign,
  Scissors,
  Users,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Trash2,
  Calculator,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCustomAlert } from "../ui/custom-alert";
import { useDoubleConfirmation } from "../ui/double-confirmation";

const paquetesData = [
  {
    id: 1,
    nombre: "Paquete Premium Completo",
    descripcion: "El servicio más completo para el caballero moderno",
    servicios: ["Corte de cabello", "Recorte de barba", "Perfilado de cejas"],
    duracion: 90,
    precio: 120000,
    descuento: 15,
    precioOriginal: 141000,
    clientesAtendidos: 142,
    categoria: "Premium",
    activo: true
  },
  {
    id: 2,
    nombre: "Paquete Elegante Plus",
    descripcion: "Elegancia y precisión en cada detalle",
    servicios: ["Corte de cabello", "Afeitado de barba", "Perfilado de cejas"],
    duracion: 85,
    precio: 110000,
    descuento: 12,
    precioOriginal: 125000,
    clientesAtendidos: 98,
    categoria: "Premium",
    activo: true
  },
  {
    id: 3,
    nombre: "Paquete Clásico Duo",
    descripcion: "La combinación perfecta de corte y afeitado",
    servicios: ["Corte de cabello", "Afeitado de barba"],
    duracion: 70,
    precio: 80000,
    descuento: 10,
    precioOriginal: 89000,
    clientesAtendidos: 156,
    categoria: "Clásico",
    activo: true
  },
  {
    id: 4,
    nombre: "Paquete Estilo Moderno",
    descripcion: "Corte moderno con detalles perfectos",
    servicios: ["Corte de cabello", "Perfilado de cejas"],
    duracion: 50,
    precio: 65000,
    descuento: 8,
    precioOriginal: 71000,
    clientesAtendidos: 89,
    categoria: "Moderno",
    activo: true
  }
];

const categorias = ["Premium", "Clásico", "Moderno", "Especial"];
const metodosPago = ["Efectivo", "Tarjeta de crédito", "Tarjeta débito", "Transferencia", "Nequi", "Daviplata"];

export function PaquetesPage() {
  const { created, edited, deleted, AlertContainer } = useCustomAlert();
  const { confirmCreateAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [paquetes, setPaquetes] = useState(paquetesData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState<any>(null);
  const [selectedPaquete, setSelectedPaquete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [serviciosAgregados, setServiciosAgregados] = useState<Array<{ nombre: string, precio: number }>>([]);
  const [nuevoPaquete, setNuevoPaquete] = useState({
    nombre: '',
    descripcion: '',
    servicios: [] as string[],
    serviciosTexto: '',
    duracion: 60,
    precio: 0,
    descuento: 0,
    categoria: '',
    activo: true,
    metodoPago: '',
    porcentajeDescuento: 0
  });

  // Estado inicial para reset
  const estadoInicialPaquete = {
    nombre: '',
    descripcion: '',
    servicios: [] as string[],
    serviciosTexto: '',
    duracion: 60,
    precio: 0,
    descuento: 0,
    categoria: '',
    activo: true,
    metodoPago: '',
    porcentajeDescuento: 0
  };

  // Servicios disponibles con precios (similar a ventas)
  const serviciosDisponibles = [
    { nombre: 'Corte de cabello', precio: 25000 },
    { nombre: 'Recorte de barba', precio: 15000 },
    { nombre: 'Afeitado de barba', precio: 20000 },
    { nombre: 'Perfilado de cejas', precio: 8000 },
    { nombre: 'Lavado', precio: 12000 },
    { nombre: 'Masaje capilar', precio: 18000 },
    { nombre: 'Tratamiento capilar', precio: 30000 },
    { nombre: 'Colorización', precio: 45000 },
    { nombre: 'Depilación facial', precio: 22000 },
    { nombre: 'Limpieza facial', precio: 35000 }
  ];

  const filteredPaquetes = paquetes.filter(paquete => {
    const matchesSearch = paquete.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paquete.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === "all" || paquete.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const totalPages = Math.ceil(filteredPaquetes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPaquetes = filteredPaquetes.slice(startIndex, startIndex + itemsPerPage);



  // Funciones para manejar servicios automáticamente con precios
  const agregarServicio = () => {
    if (!servicioSeleccionado) return;

    const yaExiste = serviciosAgregados.find(s => s.nombre === servicioSeleccionado);
    if (!yaExiste) {
      const servicioEncontrado = serviciosDisponibles.find(s => s.nombre === servicioSeleccionado);
      const precioServicio = servicioEncontrado ? servicioEncontrado.precio : 0;

      const nuevosServicios = [...serviciosAgregados, { nombre: servicioSeleccionado, precio: precioServicio }];

      setServiciosAgregados(nuevosServicios);
      setNuevoPaquete({
        ...nuevoPaquete,
        servicios: nuevosServicios.map(s => s.nombre),
        serviciosTexto: nuevosServicios.map(s => s.nombre).join(', '),
        precio: nuevosServicios.reduce((total, s) => total + s.precio, 0)
      });
    }

    setServicioSeleccionado('');
  };

  const eliminarServicio = (nombreServicio: string) => {
    const nuevosServicios = serviciosAgregados.filter(s => s.nombre !== nombreServicio);

    setServiciosAgregados(nuevosServicios);
    setNuevoPaquete({
      ...nuevoPaquete,
      servicios: nuevosServicios.map(s => s.nombre),
      serviciosTexto: nuevosServicios.map(s => s.nombre).join(', '),
      precio: nuevosServicios.reduce((total, s) => total + s.precio, 0)
    });
  };

  const actualizarPrecioServicio = (nombreServicio: string, nuevoPrecio: number) => {
    const nuevosServicios = serviciosAgregados.map(s =>
      s.nombre === nombreServicio ? { ...s, precio: nuevoPrecio } : s
    );

    setServiciosAgregados(nuevosServicios);
    setNuevoPaquete({
      ...nuevoPaquete,
      precio: nuevosServicios.reduce((total, s) => total + s.precio, 0)
    });
  };

  // Funciones para cálculos automáticos
  const calcularSubtotal = () => {
    return nuevoPaquete.precio;
  };

  const calcularDescuento = (subtotal: number) => {
    return subtotal * (nuevoPaquete.porcentajeDescuento / 100);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const descuento = calcularDescuento(subtotal);
    return subtotal - descuento;
  };

  const handleCreatePaquete = () => {
    if (!nuevoPaquete.nombre || !nuevoPaquete.descripcion || nuevoPaquete.servicios.length === 0) {
      // Toast de error si faltan campos requeridos 
      return;
    }

    const paquete = {
      id: Date.now(),
      ...nuevoPaquete,
      precio: parseFloat(nuevoPaquete.precio.toString()),
      precioOriginal: parseFloat(nuevoPaquete.precio.toString()) * (1 + nuevoPaquete.descuento / 100),
      clientesAtendidos: Math.floor(Math.random() * 100) + 20
    };
    setPaquetes([...paquetes, paquete]);
    setNuevoPaquete({ ...estadoInicialPaquete });
    setServiciosAgregados([]);
    setIsDialogOpen(false);

    created("Paquete creado exitosamente", `El paquete "${paquete.nombre}" ha sido creado correctamente.`);
  };

  const handleEditPaquete = (paquete: any) => {
    setEditingPaquete(paquete);
    const serviciosArray = Array.isArray(paquete.servicios) ? paquete.servicios : [];
    const serviciosTexto = serviciosArray.join(', ');

    // Convertir servicios a objetos con nombre y precio
    const serviciosConPrecio = serviciosArray.map((nombreServicio: string) => {
      const servicioEncontrado = serviciosDisponibles.find(s => s.nombre === nombreServicio);
      return {
        nombre: nombreServicio,
        precio: servicioEncontrado ? servicioEncontrado.precio : 0
      };
    });

    setNuevoPaquete({
      nombre: paquete.nombre || '',
      descripcion: paquete.descripcion || '',
      servicios: serviciosArray,
      serviciosTexto: serviciosTexto,
      duracion: paquete.duracion || 60,
      precio: paquete.precio || 0,
      descuento: paquete.descuento || 0,
      categoria: paquete.categoria || '',
      activo: paquete.activo ?? true,
      metodoPago: paquete.metodoPago || '',
      porcentajeDescuento: paquete.porcentajeDescuento || 0
    });

    setServiciosAgregados(serviciosConPrecio);
    setIsDialogOpen(true);
  };

  const handleUpdatePaquete = () => {
    if (!editingPaquete) return;

    const nombrePaquete = nuevoPaquete.nombre;
    const tempPaqueteData = { ...nuevoPaquete };
    const tempEditingPaquete = { ...editingPaquete };

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    setIsDialogOpen(false);

    confirmCreateAction(
      `${nombrePaquete}`,
      () => {
        setPaquetes(paquetes.map(p =>
          p.id === tempEditingPaquete.id ? {
            ...p,
            ...tempPaqueteData,
            precio: parseFloat(tempPaqueteData.precio.toString()),
            precioOriginal: parseFloat(tempPaqueteData.precio.toString()) * (1 + tempPaqueteData.descuento / 100)
          } : p
        ));

        setEditingPaquete(null);
        setNuevoPaquete({ ...estadoInicialPaquete });
        setServiciosAgregados([]);
      },
      {
        confirmTitle: 'Actualizar Paquete',
        confirmMessage: `¿Estás seguro de que deseas actualizar el paquete "${nombrePaquete}"? Se aplicarán todos los cambios realizados en el formulario.`,
        successTitle: 'Paquete actualizado exitosamente ✔️',
        successMessage: `El paquete "${nombrePaquete}" ha sido actualizado correctamente con la nueva información.`,
        requireInput: false
      }
    );
  };

  const handleToggleEstadoPaquete = (paquete: any) => {
    const nombrePaquete = paquete.nombre;
    const nuevoEstado = !paquete.activo;

    confirmCreateAction(
      `${nombrePaquete}`,
      () => {
        setPaquetes(paquetes.map(p =>
          p.id === paquete.id ? { ...p, activo: nuevoEstado } : p
        ));
      },
      {
        confirmTitle: `${nuevoEstado ? 'Activar' : 'Desactivar'} Paquete`,
        confirmMessage: `¿Estás seguro de que deseas ${nuevoEstado ? 'activar' : 'desactivar'} el paquete "${nombrePaquete}"?`,
        successTitle: `Paquete ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente ✔`,
        successMessage: `El paquete "${nombrePaquete}" ha sido ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`,
        requireInput: false
      }
    );
  };

  const handleEliminarPaquete = (paquete: any) => {
    const nombrePaquete = paquete.nombre;

    confirmCreateAction(
      `${nombrePaquete}`,
      () => {
        setPaquetes(paquetes.filter(p => p.id !== paquete.id));
      },
      {
        confirmTitle: 'Eliminar Paquete',
        confirmMessage: `¿Estás seguro de que deseas eliminar permanentemente el paquete "${nombrePaquete}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`,
        successTitle: 'Paquete eliminado exitosamente ✔️',
        successMessage: `El paquete "${nombrePaquete}" ha sido eliminado permanentemente del sistema.`,
        requireInput: true
      }
    );
  };

  const toggleEstadoPaquete = (paqueteId: number) => {
    const paquete = paquetes.find(p => p.id === paqueteId);
    if (!paquete) return;

    setPaquetes(paquetes.map(p =>
      p.id === paqueteId ? { ...p, activo: !p.activo } : p
    ));

    const nuevoEstado = !paquete.activo;
    edited(
      `Paquete ${nuevoEstado ? 'activado' : 'desactivado'}`,
      `El paquete "${paquete.nombre}" ha sido ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`
    );
  };

  const getCategoriaColor = (categoria: string) => {
    // Todas las categorías ahora usan el mismo estilo gris uniforme
    return "bg-gray-medium text-gray-lighter";
  };

  const totalClientesAtendidos = paquetes.reduce((sum, p) => sum + p.clientesAtendidos, 0);
  const promedioDescuento = paquetes.reduce((sum, p) => sum + p.descuento, 0) / paquetes.length;
  const paquetesActivos = paquetes.filter(p => p.activo).length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Paquetes de Servicios</h1>
            <p className="text-sm text-gray-lightest mt-1">Gestiona combinaciones de servicios con descuentos especiales</p>
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
                      setEditingPaquete(null);
                      setNuevoPaquete({ ...estadoInicialPaquete });
                      setServiciosAgregados([]);
                      setServicioSeleccionado('');
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Paquete
                  </button>
                </DialogTrigger>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar paquetes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="elegante-input"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedPaquetes.length} de {filteredPaquetes.length} paquetes
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Paquete</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Servicios</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Duración</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Precio</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedPaquetes.map((paquete) => (
                  <tr key={paquete.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-primary rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-black-primary" />
                        </div>
                        <span className="text-gray-lighter">{paquete.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-lighter">{paquete.servicios.length} servicios</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-lighter">{paquete.duracion} min</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-lighter">${paquete.precio.toLocaleString('es-CO')}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs bg-gray-medium text-gray-lighter">
                        {paquete.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPaquete(paquete);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleEditPaquete(paquete)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleToggleEstadoPaquete(paquete)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title={paquete.activo ? "Desactivar paquete" : "Activar paquete"}
                        >
                          {paquete.activo ? (
                            <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEliminarPaquete(paquete)}
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

            {displayedPaquetes.length === 0 && (
              <div className="text-center py-8">
                <Gift className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white-primary mb-2">No se encontraron paquetes</h3>
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPaquete(null);
            setNuevoPaquete({ ...estadoInicialPaquete });
            setServiciosAgregados([]);
            setServicioSeleccionado('');
          }
        }}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-primary" />
                {editingPaquete ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                {editingPaquete ? 'Modifica la información del paquete seleccionado' : 'Crea una nueva combinación de servicios con descuentos especiales'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              {/* Nombre y Descripción */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-primary" />
                    Nombre del Paquete *
                  </Label>
                  <Input
                    value={nuevoPaquete.nombre}
                    onChange={(e) => setNuevoPaquete({ ...nuevoPaquete, nombre: e.target.value })}
                    placeholder="Ej: Paquete Premium Completo"
                    className="elegante-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-primary" />
                    Precio ($) *
                  </Label>
                  <Input
                    type="number"
                    value={nuevoPaquete.precio}
                    onChange={(e) => setNuevoPaquete({ ...nuevoPaquete, precio: parseFloat(e.target.value) || 0 })}
                    className="elegante-input"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Duración y Descuento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-primary" />
                    Duración (min)
                  </Label>
                  <Input
                    type="number"
                    value={nuevoPaquete.duracion}
                    onChange={(e) => setNuevoPaquete({ ...nuevoPaquete, duracion: parseInt(e.target.value) || 0 })}
                    className="elegante-input"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-orange-primary" />
                    Porcentaje Descuento (%)
                  </Label>
                  <Input
                    type="number"
                    value={nuevoPaquete.porcentajeDescuento}
                    onChange={(e) => setNuevoPaquete({ ...nuevoPaquete, porcentajeDescuento: parseFloat(e.target.value) || 0 })}
                    className="elegante-input"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-primary" />
                  Descripción
                </Label>
                <Textarea
                  value={nuevoPaquete.descripcion}
                  onChange={(e) => setNuevoPaquete({ ...nuevoPaquete, descripcion: e.target.value })}
                  placeholder="Describe el paquete de servicios"
                  className="elegante-input"
                  rows={3}
                />
              </div>

              {/* Servicios */}
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-orange-primary" />
                  Servicios Seleccionados *
                </Label>
                <Input
                  value={nuevoPaquete.serviciosTexto}
                  readOnly
                  disabled
                  placeholder="Agrega servicios desde el selector inferior"
                  className="elegante-input bg-gray-medium cursor-not-allowed"
                />
                <p className="text-gray-lightest text-xs">
                  Los servicios agregados se mostrarán aquí. Puedes editar el precio de cada uno.
                </p>
              </div>

              {/* Gestión de Servicios */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-orange-primary" />
                    Agregar servicio
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={servicioSeleccionado}
                      onChange={(e) => setServicioSeleccionado(e.target.value)}
                      className="elegante-input flex-1"
                    >
                      <option value="">Selecciona un servicio</option>
                      {serviciosDisponibles.map((servicio, index) => (
                        <option key={index} value={servicio.nombre}>
                          {servicio.nombre} - ${servicio.precio.toLocaleString('es-CO')}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        agregarServicio();
                      }}
                      className="elegante-button-primary px-4 py-2"
                      disabled={!servicioSeleccionado}
                    >
                      Agregar Servicio
                    </button>
                  </div>
                </div>

                {/* Lista de servicios agregados */}
                {serviciosAgregados.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-white-primary">Servicios Agregados:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {serviciosAgregados.map((servicio, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                          <div className="flex-1">
                            <span className="text-white-primary font-medium">{servicio.nombre}</span>
                            <div className="text-sm text-gray-lightest">
                              Cantidad: 1 | Precio: ${servicio.precio.toLocaleString('es-CO')} |
                              Subtotal: ${servicio.precio.toLocaleString('es-CO')}
                            </div>
                          </div>
                          <button
                            onClick={() => eliminarServicio(servicio.nombre)}
                            className="ml-3 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                            title="Eliminar servicio"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de Totales */}
              {nuevoPaquete.precio > 0 && (
                <div className="bg-gray-darker border border-gray-dark rounded-lg p-4">
                  <h3 className="text-white-primary font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-primary" />
                    Resumen de Totales
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-lightest">Subtotal:</span>
                      <span className="text-white-primary">${calcularSubtotal().toLocaleString('es-CO')}</span>
                    </div>
                    {nuevoPaquete.porcentajeDescuento > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-lightest">Descuento ({nuevoPaquete.porcentajeDescuento}%):</span>
                        <span className="text-red-400">-${calcularDescuento(calcularSubtotal()).toLocaleString('es-CO')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-dark pt-2">
                      <span className="text-white-primary">Total:</span>
                      <span className="text-orange-primary">${calcularTotal().toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-dark">
                <button
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingPaquete(null);
                    setNuevoPaquete({ ...estadoInicialPaquete });
                    setServiciosAgregados([]);
                    setServicioSeleccionado('');
                  }}
                  className="elegante-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingPaquete ? handleUpdatePaquete : handleCreatePaquete}
                  className="elegante-button-primary"
                >
                  {editingPaquete ? 'Actualizar' : 'Crear'} Paquete
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>



        {/* Dialog de Detalle del Paquete */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-md">
            {selectedPaquete && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white-primary">{selectedPaquete.nombre}</DialogTitle>
                  <DialogDescription className="text-gray-lightest">{selectedPaquete.descripcion}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="elegante-card">
                      <div className="text-center">
                        <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <h4 className="text-xl font-bold text-white-primary">{selectedPaquete.duracion} min</h4>
                        <p className="text-gray-lightest text-sm">Duración</p>
                      </div>
                    </div>
                    <div className="elegante-card">
                      <div className="text-center">
                        <Scissors className="w-8 h-8 text-primary-orange mx-auto mb-2" />
                        <h4 className="text-xl font-bold text-white-primary">{selectedPaquete.servicios.length}</h4>
                        <p className="text-gray-lightest text-sm">Servicios</p>
                      </div>
                    </div>
                  </div>

                  <div className="elegante-card">
                    <h4 className="font-semibold text-white-primary mb-3">Servicios Incluidos</h4>
                    <div className="space-y-2">
                      {selectedPaquete.servicios.map((servicio: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-orange-primary rounded-full"></div>
                          <span className="text-gray-lightest">{servicio}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="elegante-card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-white-primary">Precio Final</span>
                      <span className="text-2xl font-bold text-primary-orange">
                        ${selectedPaquete.precio.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-lightest">Precio original:</span>
                      <span className="line-through text-gray-lighter">
                        ${selectedPaquete.precioOriginal.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-lightest">Descuento:</span>
                      <span className="text-green-400">{selectedPaquete.descuento}% OFF</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <AlertContainer />
        <DoubleConfirmationContainer />
      </main>
    </>
  );
}