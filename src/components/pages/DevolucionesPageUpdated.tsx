import { useState } from "react";
import { Input } from "../ui/input";
import {
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RotateCcw,
  FileText,
  Download,
  AlertTriangle,
  TrendingDown,
  User,
  Package,
  MessageSquare,
  Filter,
  Check,
  X,
  CreditCard,
  History,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  Wallet,
  Edit,
  Ban
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { toast } from "sonner@2.0.3";
import { useDoubleConfirmation } from "../ui/double-confirmation";

// Función para formatear moneda colombiana
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

// Motivos estandarizados - Solo para productos
const MOTIVOS_DEVOLUCION = [
  { value: 'producto_defectuoso', label: 'Producto Defectuoso' },
  { value: 'error_compra', label: 'Error en la Compra' },
  { value: 'producto_vencido', label: 'Producto Vencido' },
  { value: 'reaccion_alergica', label: 'Reacción Alérgica' },
  { value: 'no_conforme', label: 'No Conforme con Expectativas' },
  { value: 'cambio_opinion', label: 'Cambio de Opinión' },
  { value: 'otros', label: 'Otros' }
];

// Tipos de datos actualizados
interface Devolucion {
  id: string;
  cliente: string;
  clienteId: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  motivoCategoria: string;
  motivoDetalle: string;
  observaciones?: string;
  fecha: string;
  hora: string;
  monto: number;
  estado: 'Activo' | 'Anulado';
  responsable: string;
  numeroVenta: string;
  saldoAFavor: number;
}

// Interface para manejar saldos de clientes
interface SaldoCliente {
  clienteId: string;
  cliente: string;
  saldoTotal: number;
}

// Datos de ejemplo actualizados - Solo productos
const devolucionesData: Devolucion[] = [
  {
    id: "DEV001",
    cliente: "Juan Pérez",
    clienteId: "CLI001",
    producto: "Champú Premium",
    cantidad: 2,
    precioUnitario: 17500,
    motivoCategoria: "producto_defectuoso",
    motivoDetalle: "Producto Defectuoso",
    observaciones: "Envase roto, producto derramado",
    fecha: "23-08-2025",
    hora: "14:30",
    monto: 35000,
    estado: "Activo",
    responsable: "Miguel Rodriguez",
    numeroVenta: "VEN001",
    saldoAFavor: 35000
  },
  {
    id: "DEV002",
    cliente: "María González",
    clienteId: "CLI002",
    producto: "Aceite de Barba Premium",
    cantidad: 1,
    precioUnitario: 25000,
    motivoCategoria: "no_conforme",
    motivoDetalle: "No Conforme con Expectativas",
    observaciones: "No le gustó la fragancia",
    fecha: "22-08-2025",
    hora: "16:45",
    monto: 25000,
    estado: "Activo",
    responsable: "Sofia Martinez",
    numeroVenta: "VEN002",
    saldoAFavor: 25000
  },
  {
    id: "DEV003",
    cliente: "Carlos Ruiz",
    clienteId: "CLI003",
    producto: "Cera para Cabello",
    cantidad: 1,
    precioUnitario: 28000,
    motivoCategoria: "reaccion_alergica",
    motivoDetalle: "Reacción Alérgica",
    observaciones: "Cliente presentó irritación en la piel",
    fecha: "21-08-2025",
    hora: "11:20",
    monto: 28000,
    estado: "Anulado",
    responsable: "Ana López",
    numeroVenta: "VEN003",
    saldoAFavor: 0
  },
  {
    id: "DEV004",
    cliente: "Laura Zapata",
    clienteId: "CLI004",
    producto: "Kit de Cuidado Completo",
    cantidad: 1,
    precioUnitario: 45000,
    motivoCategoria: "error_compra",
    motivoDetalle: "Error en la Compra",
    observaciones: "Cliente compró producto equivocado",
    fecha: "20-08-2025",
    hora: "09:15",
    monto: 45000,
    estado: "Activo",
    responsable: "Miguel Rodriguez",
    numeroVenta: "VEN004",
    saldoAFavor: 45000
  },
  {
    id: "DEV005",
    cliente: "Pedro López",
    clienteId: "CLI005",
    producto: "Loción Aftershave",
    cantidad: 3,
    precioUnitario: 18000,
    motivoCategoria: "producto_vencido",
    motivoDetalle: "Producto Vencido",
    observaciones: "Fecha de vencimiento cercana",
    fecha: "19-08-2025",
    hora: "13:30",
    monto: 54000,
    estado: "Anulado",
    responsable: "Sofia Martinez",
    numeroVenta: "VEN005",
    saldoAFavor: 0
  },
  {
    id: "DEV006",
    cliente: "Juan Pérez",
    clienteId: "CLI001",
    producto: "Gel Fijador",
    cantidad: 1,
    precioUnitario: 22000,
    motivoCategoria: "no_conforme",
    motivoDetalle: "No Conforme con Expectativas",
    observaciones: "Textura diferente a la esperada",
    fecha: "15-08-2025",
    hora: "10:20",
    monto: 22000,
    estado: "Activo",
    responsable: "Ana López",
    numeroVenta: "VEN006",
    saldoAFavor: 22000
  }
];

export function DevolucionesPage() {
  const { confirmCreateAction, confirmEditAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(devolucionesData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isHistorialDialogOpen, setIsHistorialDialogOpen] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState<Devolucion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [isPdfPopoverOpen, setIsPdfPopoverOpen] = useState(false);

  // Estado para nueva devolución
  const [nuevaDevolucion, setNuevaDevolucion] = useState({
    numeroVenta: '',
    cliente: '',
    producto: '',
    cantidad: 1,
    precioUnitario: 0,
    motivoCategoria: '',
    observaciones: '',
    monto: 0
  });

  // Estado para editar devolución
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editarDevolucion, setEditarDevolucion] = useState({
    id: '',
    numeroVenta: '',
    cliente: '',
    producto: '',
    cantidad: 1,
    precioUnitario: 0,
    motivoCategoria: '',
    observaciones: '',
    monto: 0
  });

  // Datos simulados de ventas para el selector - Solo productos
  const ventasDisponibles = [
    {
      id: 'VEN001', cliente: 'Juan Pérez', fecha: '23-08-2025', total: 85000, productos: [
        { nombre: 'Champú Premium', precio: 17500, cantidad: 3 },
        { nombre: 'Cera para Cabello', precio: 25000, cantidad: 1 },
        { nombre: 'Aceite de Barba', precio: 15000, cantidad: 2 }
      ]
    },
    {
      id: 'VEN002', cliente: 'María González', fecha: '22-08-2025', total: 45000, productos: [
        { nombre: 'Aceite de Barba Premium', precio: 25000, cantidad: 1 },
        { nombre: 'Loción Aftershave', precio: 20000, cantidad: 1 }
      ]
    },
    {
      id: 'VEN003', cliente: 'Carlos Ruiz', fecha: '21-08-2025', total: 53000, productos: [
        { nombre: 'Cera para Cabello', precio: 28000, cantidad: 1 },
        { nombre: 'Kit de Cuidado', precio: 25000, cantidad: 1 }
      ]
    },
    {
      id: 'VEN004', cliente: 'Laura Zapata', fecha: '20-08-2025', total: 45000, productos: [
        { nombre: 'Kit de Cuidado Completo', precio: 45000, cantidad: 1 }
      ]
    },
  ];

  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const [productoDevolucion, setProductoDevolucion] = useState('');

  // Filtros y paginación - Actualizado para eliminar búsqueda por producto
  const filteredDevoluciones = devoluciones.filter(devolucion => {
    const matchesSearch = devolucion.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devolucion.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devolucion.clienteId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === "Todos" || devolucion.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDevoluciones = filteredDevoluciones.slice(startIndex, startIndex + itemsPerPage);

  // Funciones auxiliares
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Activo": return "bg-green-600 text-white";
      case "Anulado": return "bg-red-600 text-white";
      default: return "bg-gray-medium text-white";
    }
  };

  const getMotivoLabel = (motivoCategoria: string) => {
    const motivo = MOTIVOS_DEVOLUCION.find(m => m.value === motivoCategoria);
    return motivo ? motivo.label : motivoCategoria;
  };

  const getHistorialCliente = (clienteId: string) => {
    return devoluciones.filter(d => d.clienteId === clienteId).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  };

  // Función para calcular el saldo total acumulativo de un cliente
  const getSaldoTotalCliente = (clienteId: string): number => {
    return devoluciones
      .filter(d => d.clienteId === clienteId && d.estado === 'Activo')
      .reduce((total, d) => total + d.saldoAFavor, 0);
  };

  // Función para obtener todos los saldos por cliente
  const getSaldosClientes = (): SaldoCliente[] => {
    const clientesUnicos = [...new Set(devoluciones.map(d => d.clienteId))];
    return clientesUnicos.map(clienteId => {
      const cliente = devoluciones.find(d => d.clienteId === clienteId);
      return {
        clienteId,
        cliente: cliente?.cliente || '',
        saldoTotal: getSaldoTotalCliente(clienteId)
      };
    }).filter(s => s.saldoTotal > 0);
  };

  const handleVentaChange = (numeroVenta: string) => {
    setNuevaDevolucion(prev => ({ ...prev, numeroVenta }));
    const venta = ventasDisponibles.find(v => v.id === numeroVenta);
    if (venta) {
      setVentaSeleccionada(venta);
      setNuevaDevolucion(prev => ({
        ...prev,
        cliente: venta.cliente,
        producto: '',
        cantidad: 1,
        precioUnitario: 0,
        monto: 0
      }));
      setProductoDevolucion('');
    } else {
      setVentaSeleccionada(null);
      setProductoDevolucion('');
      setNuevaDevolucion(prev => ({
        ...prev,
        cliente: '',
        producto: '',
        cantidad: 1,
        precioUnitario: 0,
        monto: 0
      }));
    }
  };

  const handleProductoDevolucionChange = (nombreProducto: string) => {
    setProductoDevolucion(nombreProducto);
    if (ventaSeleccionada && nombreProducto) {
      const producto = ventaSeleccionada.productos.find((p: any) => p.nombre === nombreProducto);
      if (producto) {
        setNuevaDevolucion(prev => ({
          ...prev,
          producto: nombreProducto,
          precioUnitario: producto.precio,
          monto: producto.precio * prev.cantidad
        }));
      }
    }
  };

  const handleCantidadChange = (cantidad: number) => {
    setNuevaDevolucion(prev => ({
      ...prev,
      cantidad: Math.max(1, cantidad),
      monto: prev.precioUnitario * Math.max(1, cantidad)
    }));
  };

  const handleCreateDevolucion = () => {
    if (!nuevaDevolucion.numeroVenta || !nuevaDevolucion.producto || !nuevaDevolucion.motivoCategoria) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    // Validar cantidad disponible
    if (ventaSeleccionada) {
      const producto = ventaSeleccionada.productos.find((p: any) => p.nombre === nuevaDevolucion.producto);
      if (producto && nuevaDevolucion.cantidad > producto.cantidad) {
        toast.error(`Solo se pueden devolver máximo ${producto.cantidad} unidades de este producto`);
        return;
      }
    }

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    setIsDialogOpen(false);

    confirmCreateAction(
      `${nuevaDevolucion.producto} - ${nuevaDevolucion.cliente}`,
      () => {
        const motivoDetalle = getMotivoLabel(nuevaDevolucion.motivoCategoria);

        // Buscar cliente existente para obtener su ID
        const clienteExistente = devoluciones.find(d => d.cliente === nuevaDevolucion.cliente);
        const clienteId = clienteExistente ? clienteExistente.clienteId : `CLI${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

        const nuevaDev: Devolucion = {
          id: `DEV${String(devoluciones.length + 1).padStart(3, '0')}`,
          cliente: nuevaDevolucion.cliente,
          clienteId: clienteId,
          producto: nuevaDevolucion.producto,
          cantidad: nuevaDevolucion.cantidad,
          precioUnitario: nuevaDevolucion.precioUnitario,
          motivoCategoria: nuevaDevolucion.motivoCategoria,
          motivoDetalle: motivoDetalle,
          observaciones: nuevaDevolucion.observaciones,
          fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          monto: nuevaDevolucion.monto,
          estado: "Activo",
          responsable: "Usuario Actual",
          numeroVenta: nuevaDevolucion.numeroVenta,
          saldoAFavor: nuevaDevolucion.monto
        };

        setDevoluciones([nuevaDev, ...devoluciones]);

        // Calcular el nuevo saldo total del cliente
        const saldoTotalCliente = getSaldoTotalCliente(clienteId) + nuevaDevolucion.monto;

        // Mostrar mensaje de éxito con información del saldo
        toast.success(`Devolución registrada exitosamente. Saldo a favor del cliente: ${formatCurrency(saldoTotalCliente)}`);

        resetFormularios();
      },
      {
        confirmTitle: 'Confirmar Registro de Devolución',
        confirmMessage: `¿Estás seguro de que deseas registrar la devolución de ${nuevaDevolucion.cantidad} unidad(es) de "${nuevaDevolucion.producto}" para el cliente "${nuevaDevolucion.cliente}"?`,
        successTitle: '¡Devolución registrada exitosamente!',
        successMessage: `La devolución ha sido registrada correctamente en el sistema.`,
        requireInput: false
      }
    );
  };

  const resetFormularios = () => {
    setNuevaDevolucion({
      numeroVenta: '',
      cliente: '',
      producto: '',
      cantidad: 1,
      precioUnitario: 0,
      motivoCategoria: '',
      observaciones: '',
      monto: 0
    });

    setEditarDevolucion({
      id: '',
      numeroVenta: '',
      cliente: '',
      producto: '',
      cantidad: 1,
      precioUnitario: 0,
      motivoCategoria: '',
      observaciones: '',
      monto: 0
    });

    setVentaSeleccionada(null);
    setProductoDevolucion('');
  };

  const handleToggleEstado = (devolucion: Devolucion) => {
    const nuevoEstado = devolucion.estado === 'Activo' ? 'Anulado' : 'Activo';
    const accion = nuevoEstado === 'Activo' ? 'reactivar' : 'anular';

    confirmEditAction(
      `${devolucion.producto} - ${devolucion.cliente}`,
      () => {
        setDevoluciones(prev => prev.map(d =>
          d.id === devolucion.id
            ? {
              ...d,
              estado: nuevoEstado,
              saldoAFavor: nuevoEstado === 'Activo' ? d.monto : 0
            }
            : d
        ));

        // Mostrar el saldo actualizado del cliente
        const saldoActualizado = nuevoEstado === 'Activo'
          ? getSaldoTotalCliente(devolucion.clienteId) + devolucion.monto
          : getSaldoTotalCliente(devolucion.clienteId) - devolucion.monto;

        toast.info(`Saldo a favor actualizado para ${devolucion.cliente}: ${formatCurrency(Math.max(0, saldoActualizado))}`);
      },
      {
        confirmTitle: `Confirmar ${accion.charAt(0).toUpperCase() + accion.slice(1)} Devolución`,
        confirmMessage: `¿Estás seguro de que deseas ${accion} la devolución "${devolucion.producto}" del cliente "${devolucion.cliente}"?`,
        successTitle: `¡Devolución ${nuevoEstado.toLowerCase()}a exitosamente!`,
        successMessage: `La devolución ha sido ${nuevoEstado.toLowerCase()}ada correctamente en el sistema.`,
        requireInput: false
      }
    );
  };

  const handleOpenEditDialog = (devolucion: Devolucion) => {
    setEditarDevolucion({
      id: devolucion.id,
      numeroVenta: devolucion.numeroVenta,
      cliente: devolucion.cliente,
      producto: devolucion.producto,
      cantidad: devolucion.cantidad,
      precioUnitario: devolucion.precioUnitario,
      motivoCategoria: devolucion.motivoCategoria,
      observaciones: devolucion.observaciones || '',
      monto: devolucion.monto
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDevolucion = () => {
    if (!editarDevolucion.motivoCategoria) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    setIsEditDialogOpen(false);

    confirmEditAction(
      `${editarDevolucion.producto} - ${editarDevolucion.cliente}`,
      () => {
        const motivoDetalle = getMotivoLabel(editarDevolucion.motivoCategoria);

        setDevoluciones(prev => prev.map(d =>
          d.id === editarDevolucion.id
            ? {
              ...d,
              cantidad: editarDevolucion.cantidad,
              precioUnitario: editarDevolucion.precioUnitario,
              motivoCategoria: editarDevolucion.motivoCategoria,
              motivoDetalle: motivoDetalle,
              observaciones: editarDevolucion.observaciones,
              monto: editarDevolucion.monto,
              saldoAFavor: d.estado === 'Activo' ? editarDevolucion.monto : 0
            }
            : d
        ));

        resetFormularios();
      },
      {
        confirmTitle: 'Confirmar Actualización de Devolución',
        confirmMessage: `¿Estás seguro de que deseas actualizar la devolución de "${editarDevolucion.producto}" para el cliente "${editarDevolucion.cliente}"?`,
        successTitle: '¡Devolución actualizada exitosamente!',
        successMessage: `La devolución ha sido actualizada correctamente en el sistema.`,
        requireInput: false
      }
    );
  };

  // Función para generar PDF (simulada)
  const generatePdfReport = (periodo: 'daily' | 'weekly' | 'monthly' | 'annual') => {
    let filteredData = [...devoluciones];
    const today = new Date();

    switch (periodo) {
      case 'daily':
        const todayString = today.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        filteredData = devoluciones.filter(d => d.fecha === todayString);
        break;
      case 'weekly':
        const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        filteredData = devoluciones.filter(d => {
          const devDate = new Date(d.fecha.split('-').reverse().join('-'));
          return devDate >= weekStart;
        });
        break;
      case 'monthly':
        filteredData = devoluciones.filter(d => {
          const devDate = new Date(d.fecha.split('-').reverse().join('-'));
          return devDate.getMonth() === today.getMonth() && devDate.getFullYear() === today.getFullYear();
        });
        break;
      case 'annual':
        filteredData = devoluciones.filter(d => {
          const devDate = new Date(d.fecha.split('-').reverse().join('-'));
          return devDate.getFullYear() === today.getFullYear();
        });
        break;
    }

    const totalRegistros = filteredData.length;
    const totalMonto = filteredData.reduce((sum, d) => sum + d.monto, 0);

    // Simular generación de PDF
    toast.success(`Reporte PDF generado`, {
      description: `${totalRegistros} devoluciones exportadas. Total: $${formatCurrency(totalMonto)}`
    });

    setIsPdfPopoverOpen(false);
  };

  // Estadísticas
  const devolucionesHoy = devoluciones.filter(d => d.fecha === new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })).length;
  const totalMontoDevoluciones = devoluciones.reduce((sum, d) => sum + d.monto, 0);
  const devolucionesActivas = devoluciones.filter(d => d.estado === "Activo").length;
  const devolucionesAnuladas = devoluciones.filter(d => d.estado === "Anulado").length;
  const totalSaldosAFavor = devoluciones.filter(d => d.estado === "Activo").reduce((sum, d) => sum + d.saldoAFavor, 0);
  const clientesConSaldo = getSaldosClientes().length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Devoluciones</h1>
            <p className="text-sm text-gray-lightest mt-1">Control y seguimiento de devoluciones de productos con saldo a favor acumulativo</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="elegante-tag-orange">
              Hoy: {devolucionesHoy} devoluciones
            </div>
            <div className="elegante-tag bg-red-600 text-white">
              Total: ${formatCurrency(totalMontoDevoluciones)}
            </div>
            <div className="elegante-tag bg-green-600 text-white">
              Saldos: ${formatCurrency(totalSaldosAFavor)}
            </div>
            <Popover open={isPdfPopoverOpen} onOpenChange={setIsPdfPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="elegante-button-primary gap-2 flex items-center hover:scale-105 transition-transform"
                  title="Generar reporte de devoluciones en PDF"
                >
                  <FileText className="w-4 h-4" />
                  Reporte PDF
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-darkest border-gray-dark">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white-primary mb-2">Generar Reporte de Devoluciones</h4>
                    <p className="text-sm text-gray-lightest">Selecciona el período para el reporte en PDF</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white-primary">Períodos Disponibles</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => generatePdfReport('daily')}
                        className="elegante-button-secondary text-xs p-2 flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Diario
                      </button>
                      <button
                        onClick={() => generatePdfReport('weekly')}
                        className="elegante-button-secondary text-xs p-2 flex items-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3" />
                        Semanal
                      </button>
                      <button
                        onClick={() => generatePdfReport('monthly')}
                        className="elegante-button-secondary text-xs p-2 flex items-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Mensual
                      </button>
                      <button
                        onClick={() => generatePdfReport('annual')}
                        className="elegante-button-secondary text-xs p-2 flex items-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3" />
                        Anual
                      </button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="elegante-card text-center">
            <RotateCcw className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{devolucionesHoy}</h4>
            <p className="text-gray-lightest text-sm">Devoluciones Hoy</p>
          </div>
          <div className="elegante-card text-center">
            <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">${formatCurrency(totalMontoDevoluciones)}</h4>
            <p className="text-gray-lightest text-sm">Monto Total</p>
          </div>
          <div className="elegante-card text-center">
            <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{devolucionesActivas}</h4>
            <p className="text-gray-lightest text-sm">Devoluciones Activas</p>
          </div>
          <div className="elegante-card text-center">
            <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{devolucionesAnuladas}</h4>
            <p className="text-gray-lightest text-sm">Devoluciones Anuladas</p>
          </div>
          <div className="elegante-card text-center">
            <Wallet className="w-8 h-8 text-orange-secondary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">${formatCurrency(totalSaldosAFavor)}</h4>
            <p className="text-gray-lightest text-sm">Saldos a Favor</p>
          </div>
        </div>

        {/* Sección Principal */}
        <div className="elegante-card">
          {/* Barra de Controles */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="elegante-button-primary gap-2 flex items-center"
              >
                <Plus className="w-4 h-4" />
                Nueva Devolución
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <Input
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-80"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="elegante-button-secondary gap-2 flex items-center">
                    <Filter className="w-4 h-4" />
                    Filtrar: {filtroEstado}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 bg-gray-darkest border-gray-dark">
                  <div className="space-y-2">
                    <Label className="text-white-primary">Estado</Label>
                    <div className="grid gap-2">
                      {['Todos', 'Activo', 'Anulado'].map((estado) => (
                        <button
                          key={estado}
                          onClick={() => setFiltroEstado(estado)}
                          className={`text-left p-2 rounded text-sm transition-colors ${filtroEstado === estado
                              ? 'bg-orange-primary text-black-primary'
                              : 'hover:bg-gray-darker text-gray-lightest'
                            }`}
                        >
                          {estado}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {getSaldosClientes().length > 0 && (
                <button
                  onClick={() => setIsHistorialDialogOpen(true)}
                  className="elegante-button-secondary gap-2 flex items-center"
                >
                  <History className="w-4 h-4" />
                  Saldos a Favor ({clientesConSaldo})
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedDevoluciones.length} de {filteredDevoluciones.length} devoluciones
              </div>
            </div>
          </div>

          {/* Tabla de Devoluciones - MODIFICADA PARA ELIMINAR COLUMNAS */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">ID</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Cliente</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Monto</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Saldo a Favor</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-gray-lightest font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedDevoluciones.length > 0 ? (
                  displayedDevoluciones.map((devolucion) => (
                    <tr key={devolucion.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-white-primary font-medium">{devolucion.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-primary rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-black-primary" />
                          </div>
                          <div>
                            <div className="text-white-primary font-medium">{devolucion.cliente}</div>
                            <div className="text-gray-lightest text-sm">{devolucion.clienteId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white-primary">{devolucion.fecha}</div>
                        <div className="text-gray-lightest text-sm">{devolucion.hora}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-red-400 font-semibold">${formatCurrency(devolucion.monto)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-400 font-semibold">${formatCurrency(devolucion.saldoAFavor)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(devolucion.estado)}`}>
                          {devolucion.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedDevolucion(devolucion);
                              setIsDetailDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                          </button>
                          <button
                            onClick={() => handleOpenEditDialog(devolucion)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Editar devolución"
                          >
                            <Edit className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                          </button>
                          <button
                            onClick={() => handleToggleEstado(devolucion)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title={devolucion.estado === 'Activo' ? 'Anular devolución' : 'Reactivar devolución'}
                          >
                            {devolucion.estado === 'Activo' ? (
                              <Ban className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                            ) : (
                              <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-lightest">
                      <div className="flex flex-col items-center gap-4">
                        <RotateCcw className="w-12 h-12 text-gray-medium" />
                        <div>
                          <p className="font-medium">No hay devoluciones registradas</p>
                          <p className="text-sm">Crea tu primera devolución para comenzar</p>
                        </div>
                        <button
                          onClick={() => setIsDialogOpen(true)}
                          className="elegante-button-primary gap-2 flex items-center"
                        >
                          <Plus className="w-4 h-4" />
                          Nueva Devolución
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
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
          )}
        </div>
      </main>

      {/* Modal de Ver Detalle - MODIFICADO PARA AGREGAR CANTIDAD */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-darkest border-gray-dark max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Detalle de Devolución</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Información completa de la devolución {selectedDevolucion?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedDevolucion && (
            <div className="space-y-6 overflow-y-auto pr-2 max-h-[calc(90vh-120px)]">
              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-lightest">ID de Devolución</Label>
                    <p className="text-white-primary font-medium">{selectedDevolucion.id}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Cliente</Label>
                    <p className="text-white-primary font-medium">{selectedDevolucion.cliente}</p>
                    <p className="text-gray-lightest text-sm">{selectedDevolucion.clienteId}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Fecha y Hora</Label>
                    <p className="text-white-primary">{selectedDevolucion.fecha} - {selectedDevolucion.hora}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-lightest">Estado</Label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedDevolucion.estado)}`}>
                      {selectedDevolucion.estado}
                    </span>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Número de Venta</Label>
                    <p className="text-white-primary font-medium">{selectedDevolucion.numeroVenta}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Responsable</Label>
                    <p className="text-white-primary">{selectedDevolucion.responsable}</p>
                  </div>
                </div>
              </div>

              {/* Información del Producto */}
              <div className="border-t border-gray-dark pt-6">
                <h4 className="text-white-primary font-semibold mb-4">Información del Producto</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-lightest">Producto</Label>
                      <p className="text-white-primary font-medium">{selectedDevolucion.producto}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lightest">Cantidad</Label>
                      <p className="text-white-primary font-medium">{selectedDevolucion.cantidad} unidad(es)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-lightest">Precio Unitario</Label>
                      <p className="text-white-primary font-medium">${formatCurrency(selectedDevolucion.precioUnitario)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-lightest">Monto Total</Label>
                      <p className="text-red-400 font-semibold">${formatCurrency(selectedDevolucion.monto)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Motivo */}
              <div className="border-t border-gray-dark pt-6">
                <h4 className="text-white-primary font-semibold mb-4">Motivo de la Devolución</h4>
                <div>
                  <Label className="text-gray-lightest">Motivo</Label>
                  <p className="text-white-primary font-medium">{selectedDevolucion.motivoDetalle}</p>
                </div>
                {selectedDevolucion.observaciones && (
                  <div className="mt-4">
                    <Label className="text-gray-lightest">Observaciones</Label>
                    <p className="text-gray-lightest bg-gray-darker p-3 rounded-lg mt-1">
                      {selectedDevolucion.observaciones}
                    </p>
                  </div>
                )}
              </div>

              {/* Información del Saldo */}
              <div className="border-t border-gray-dark pt-6">
                <h4 className="text-white-primary font-semibold mb-4">Información de Saldo</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-lightest">Saldo a Favor Actual</Label>
                    <p className="text-green-400 font-semibold">${formatCurrency(selectedDevolucion.saldoAFavor)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Saldo Total del Cliente</Label>
                    <p className="text-green-400 font-semibold">${formatCurrency(getSaldoTotalCliente(selectedDevolucion.clienteId))}</p>
                  </div>
                </div>
              </div>

              {/* Historial del Cliente */}
              <div className="border-t border-gray-dark pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white-primary font-semibold">Historial de Devoluciones del Cliente</h4>
                  <span className="text-gray-lightest text-sm">
                    {getHistorialCliente(selectedDevolucion.clienteId).length} devoluciones totales
                  </span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {getHistorialCliente(selectedDevolucion.clienteId).slice(0, 5).map((dev, index) => (
                    <div key={dev.id} className="flex items-center justify-between p-2 bg-gray-darker rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-lightest text-sm">{dev.id}</span>
                        <span className="text-white-primary text-sm">{dev.producto}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-lightest text-sm">{dev.fecha}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(dev.estado)}`}>
                          {dev.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Nueva Devolución */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-darkest border-gray-dark max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Nueva Devolución</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Registra una nueva devolución de producto para generar saldo a favor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto pr-2 max-h-[calc(90vh-120px)]">
            {/* Selección de Venta */}
            <div className="space-y-2">
              <Label className="text-white-primary">Número de Venta *</Label>
              <select
                value={nuevaDevolucion.numeroVenta}
                onChange={(e) => handleVentaChange(e.target.value)}
                className="elegante-input w-full"
              >
                <option value="">Seleccionar venta...</option>
                {ventasDisponibles.map((venta) => (
                  <option key={venta.id} value={venta.id}>
                    {venta.id} - {venta.cliente} - ${formatCurrency(venta.total)} ({venta.fecha})
                  </option>
                ))}
              </select>
            </div>

            {/* Información del Cliente (Auto-llenado) */}
            {ventaSeleccionada && (
              <div className="bg-gray-darker p-4 rounded-lg space-y-3">
                <h4 className="text-white-primary font-medium">Cliente Seleccionado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-lightest">Cliente</Label>
                    <p className="text-white-primary">{ventaSeleccionada.cliente}</p>
                  </div>
                  <div>
                    <Label className="text-gray-lightest">Fecha de Venta</Label>
                    <p className="text-white-primary">{ventaSeleccionada.fecha}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selección de Producto */}
            {ventaSeleccionada && (
              <div className="space-y-2">
                <Label className="text-white-primary">Producto a Devolver *</Label>
                <select
                  value={productoDevolucion}
                  onChange={(e) => handleProductoDevolucionChange(e.target.value)}
                  className="elegante-input w-full"
                >
                  <option value="">Seleccionar producto...</option>
                  {ventaSeleccionada.productos.map((producto: any, index: number) => (
                    <option key={index} value={producto.nombre}>
                      {producto.nombre} - ${formatCurrency(producto.precio)} (Máx: {producto.cantidad})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cantidad y Precio */}
            {nuevaDevolucion.producto && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary">Cantidad a Devolver *</Label>
                  <Input
                    type="number"
                    min="1"
                    max={ventaSeleccionada?.productos.find((p: any) => p.nombre === nuevaDevolucion.producto)?.cantidad || 1}
                    value={nuevaDevolucion.cantidad}
                    onChange={(e) => handleCantidadChange(parseInt(e.target.value) || 1)}
                    className="elegante-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary">Precio Unitario</Label>
                  <Input
                    type="text"
                    value={`$${formatCurrency(nuevaDevolucion.precioUnitario)}`}
                    disabled
                    className="elegante-input bg-gray-medium"
                  />
                </div>
              </div>
            )}

            {/* Motivo */}
            <div className="space-y-2">
              <Label className="text-white-primary">Motivo de la Devolución *</Label>
              <select
                value={nuevaDevolucion.motivoCategoria}
                onChange={(e) => setNuevaDevolucion(prev => ({ ...prev, motivoCategoria: e.target.value }))}
                className="elegante-input w-full"
              >
                <option value="">Seleccionar motivo...</option>
                {MOTIVOS_DEVOLUCION.map((motivo) => (
                  <option key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label className="text-white-primary">Observaciones (Opcional)</Label>
              <textarea
                value={nuevaDevolucion.observaciones}
                onChange={(e) => setNuevaDevolucion(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Describe detalles adicionales sobre la devolución..."
                rows={3}
                className="elegante-input w-full resize-none"
              />
            </div>

            {/* Resumen del Monto */}
            {nuevaDevolucion.monto > 0 && (
              <div className="bg-orange-primary/10 border border-orange-primary/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white-primary font-medium">Monto Total a Devolver:</span>
                  <span className="text-orange-primary font-bold text-lg">${formatCurrency(nuevaDevolucion.monto)}</span>
                </div>
                <p className="text-gray-lightest text-sm mt-2">
                  Este monto se agregará como saldo a favor del cliente
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  resetFormularios();
                }}
                className="elegante-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDevolucion}
                disabled={!nuevaDevolucion.numeroVenta || !nuevaDevolucion.producto || !nuevaDevolucion.motivoCategoria}
                className="elegante-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar Devolución
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Devolución */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-darkest border-gray-dark max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Editar Devolución</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Modifica la información de la devolución {editarDevolucion.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto pr-2 max-h-[calc(90vh-120px)]">
            {/* Información de la Venta (Solo lectura) */}
            <div className="bg-gray-darker p-4 rounded-lg space-y-3">
              <h4 className="text-white-primary font-medium">Información de la Venta</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-lightest">Número de Venta</Label>
                  <p className="text-white-primary">{editarDevolucion.numeroVenta}</p>
                </div>
                <div>
                  <Label className="text-gray-lightest">Cliente</Label>
                  <p className="text-white-primary">{editarDevolucion.cliente}</p>
                </div>
              </div>
            </div>

            {/* Información del Producto (Solo lectura) */}
            <div className="bg-gray-darker p-4 rounded-lg space-y-3">
              <h4 className="text-white-primary font-medium">Información del Producto</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-lightest">Producto</Label>
                  <p className="text-white-primary">{editarDevolucion.producto}</p>
                </div>
                <div>
                  <Label className="text-gray-lightest">Precio Unitario</Label>
                  <p className="text-white-primary">${formatCurrency(editarDevolucion.precioUnitario)}</p>
                </div>
              </div>
            </div>

            {/* Campos Editables */}
            <div className="space-y-4">
              {/* Cantidad */}
              <div className="space-y-2">
                <Label className="text-white-primary">Cantidad *</Label>
                <Input
                  type="number"
                  min="1"
                  value={editarDevolucion.cantidad}
                  onChange={(e) => {
                    const cantidad = Math.max(1, parseInt(e.target.value) || 1);
                    setEditarDevolucion(prev => ({
                      ...prev,
                      cantidad,
                      monto: prev.precioUnitario * cantidad
                    }));
                  }}
                  className="elegante-input"
                />
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <Label className="text-white-primary">Motivo de la Devolución *</Label>
                <select
                  value={editarDevolucion.motivoCategoria}
                  onChange={(e) => setEditarDevolucion(prev => ({ ...prev, motivoCategoria: e.target.value }))}
                  className="elegante-input w-full"
                >
                  <option value="">Seleccionar motivo...</option>
                  {MOTIVOS_DEVOLUCION.map((motivo) => (
                    <option key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label className="text-white-primary">Observaciones</Label>
                <textarea
                  value={editarDevolucion.observaciones}
                  onChange={(e) => setEditarDevolucion(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Describe detalles adicionales sobre la devolución..."
                  rows={3}
                  className="elegante-input w-full resize-none"
                />
              </div>
            </div>

            {/* Resumen del Monto */}
            <div className="bg-orange-primary/10 border border-orange-primary/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white-primary font-medium">Monto Total:</span>
                <span className="text-orange-primary font-bold text-lg">${formatCurrency(editarDevolucion.monto)}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetFormularios();
                }}
                className="elegante-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateDevolucion}
                disabled={!editarDevolucion.motivoCategoria}
                className="elegante-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Actualizar Devolución
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Saldos a Favor */}
      <Dialog open={isHistorialDialogOpen} onOpenChange={setIsHistorialDialogOpen}>
        <DialogContent className="max-w-4xl bg-gray-darkest border-gray-dark">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Saldos a Favor por Cliente</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Clientes con saldo acumulativo disponible para futuras compras
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {getSaldosClientes().map((saldo) => (
              <div key={saldo.clienteId} className="bg-gray-darker p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-black-primary" />
                    </div>
                    <div>
                      <h4 className="text-white-primary font-medium">{saldo.cliente}</h4>
                      <p className="text-gray-lightest text-sm">{saldo.clienteId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-lg">${formatCurrency(saldo.saldoTotal)}</p>
                    <p className="text-gray-lightest text-sm">Saldo disponible</p>
                  </div>
                </div>

                {/* Historial resumido */}
                <div className="mt-4 pt-4 border-t border-gray-dark">
                  <h5 className="text-white-primary text-sm font-medium mb-2">Devoluciones Activas:</h5>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                    {getHistorialCliente(saldo.clienteId)
                      .filter(d => d.estado === 'Activo')
                      .slice(0, 3)
                      .map((dev) => (
                        <div key={dev.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-lightest">{dev.id} - {dev.producto}</span>
                          <span className="text-green-400">${formatCurrency(dev.saldoAFavor)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}

            {getSaldosClientes().length === 0 && (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-medium mx-auto mb-4" />
                <p className="text-gray-lightest">No hay clientes con saldo a favor actualmente</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DoubleConfirmationContainer />
    </>
  );
}