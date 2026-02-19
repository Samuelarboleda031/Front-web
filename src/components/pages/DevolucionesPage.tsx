import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import {
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText,
  Download,
  User,
  Filter,
  Check,
  History,
  AlertCircle,
  ToggleRight,
  Wallet,
  Ban,
  Receipt,
  ShoppingBag,
  DollarSign,
  Hash,
  TrendingDown
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { toast } from "sonner";
import { useDoubleConfirmation } from "../ui/double-confirmation";
import { devolucionService } from "../../services/devolucionService";
import { ventaService } from "../../services/ventaService";
import { useAuth } from "../AuthContext"; // Added

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
  estado: 'Activo' | 'Anulado' | 'Pendiente' | 'Procesado';
  responsable: string;
  numeroVenta: string;
  saldoAFavor: number;
  apiId?: number;
  ventaId?: number;
  productoId?: number;
}

// Interface para manejar saldos de clientes
interface SaldoCliente {
  clienteId: string;
  cliente: string;
  saldoTotal: number;
}

// DevolucionesPage component


export function DevolucionesPage() {
  const { user } = useAuth();
  const { confirmCreateAction, confirmEditAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [ventasDisponibles, setVentasDisponibles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isHistorialDialogOpen, setIsHistorialDialogOpen] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState<Devolucion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [isPdfPopoverOpen, setIsPdfPopoverOpen] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [devs, sales] = await Promise.all([
        devolucionService.getDevoluciones(),
        ventaService.getVentas()
      ]);

      // Formatear devoluciones de la API al formato de la interfaz local si es necesario
      // Pero por ahora miremos si coinciden lo suficiente
      const formattedDevs: Devolucion[] = devs.map(d => {
        const monto = Number(d.monto) || 0;
        const cantidad = Number(d.cantidad) || 1;
        const estadoRaw = d.estado || 'Activo';

        return {
          id: String(d.id),
          cliente: d.clienteNombre || 'Cliente',
          clienteId: String(d.clienteId || ''),
          producto: d.productoNombre || 'Producto',
          cantidad: cantidad,
          precioUnitario: monto / (cantidad || 1),
          motivoCategoria: d.motivo,
          motivoDetalle: getMotivoLabel(d.motivo),
          observaciones: d.observaciones,
          fecha: d.fecha ? new Date(d.fecha).toLocaleDateString('es-CO') : '',
          hora: d.fecha ? new Date(d.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '',
          monto: monto,
          estado: estadoRaw as any,
          responsable: d.responsableNombre || 'Responsable',
          numeroVenta: String(d.ventaId),
          saldoAFavor: d.saldoAFavor || 0,
          apiId: d.id,
          ventaId: d.ventaId,
          productoId: d.productoId
        };
      });

      setDevoluciones(formattedDevs);

      // Formatear ventas para el selector
      const formattedSales = sales.map(s => ({
        id: s.id,
        numeroVenta: String(s.numeroVenta || s.id),
        cliente: s.cliente,
        clienteId: s.clienteId,
        fecha: s.fecha ? new Date(s.fecha).toLocaleDateString('es-CO') : '',
        total: s.total,
        productos: s.productosDetalle.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad
        }))
      }));

      setVentasDisponibles(formattedSales.filter(v => v.estado === "Completada"));
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estados para rango de fechas en reporte Excel
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Estado para nueva devolución
  const [nuevaDevolucion, setNuevaDevolucion] = useState({
    numeroVenta: '',
    ventaId: 0,
    clienteId: null as number | null,
    cliente: '',
    productoId: 0,
    producto: '',
    cantidad: 1,
    precioUnitario: 0,
    motivoCategoria: '',
    observaciones: '',
    monto: 0
  });

  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const [productoDevolucion, setProductoDevolucion] = useState('');

  // Filtros y paginación - Actualizado para eliminar búsqueda por producto
  const filteredDevoluciones = devoluciones.filter(devolucion => {
    const matchesSearch = devolucion.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devolucion.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (devolucion.clienteId?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === "Todos" || devolucion.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  const totalPages = Math.ceil(filteredDevoluciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedDevoluciones = filteredDevoluciones.slice(startIndex, startIndex + itemsPerPage);

  // Funciones auxiliares
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return "bg-green-500/20 text-green-400 border border-green-500/30";
      case 'Anulado': return "bg-red-500/20 text-red-400 border border-red-500/30";
      case 'Pendiente': return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case 'Procesado': return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default: return "bg-gray-medium text-gray-lighter";
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

  const handleVentaChange = async (ventaIdStr: string) => {
    const ventaId = Number(ventaIdStr);
    let venta = ventasDisponibles.find(v => v.id === ventaId);

    if (venta) {
      // Si la venta no tiene productos o servicios cargados, intentar obtener los detalles completos
      if (!venta.productos || venta.productos.length === 0) {
        try {
          const ventaCompleta = await ventaService.getVentaById(ventaId);
          if (ventaCompleta) {
            const productosActualizados = ventaCompleta.productosDetalle.map(p => ({
              id: p.id,
              nombre: p.nombre,
              precio: p.precio,
              cantidad: p.cantidad
            }));

            // Actualizar el objeto localmente
            venta = { ...venta, productos: productosActualizados };

            // Actualizar en el estado global de la página para no repetir la carga
            setVentasDisponibles(prev => prev.map(v =>
              v.id === ventaId ? { ...v, productos: productosActualizados } : v
            ));
          }
        } catch (error) {
          console.error("Error al cargar detalles completos de la venta:", error);
        }
      }

      setVentaSeleccionada(venta);
      setNuevaDevolucion(prev => ({
        ...prev,
        numeroVenta: venta!.numeroVenta,
        ventaId: venta!.id,
        clienteId: venta!.clienteId,
        cliente: venta!.cliente,
        producto: '',
        productoId: 0,
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
        numeroVenta: '',
        ventaId: 0,
        clienteId: null,
        cliente: '',
        producto: '',
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0,
        monto: 0
      }));
    }
  };

  const handleProductoDevolucionChange = (nombreProducto: string) => {
    setProductoDevolucion(nombreProducto);
    if (!nombreProducto || !ventaSeleccionada || !ventaSeleccionada.productos) {
      setNuevaDevolucion(prev => ({
        ...prev,
        producto: '',
        productoId: 0,
        precioUnitario: 0,
        monto: 0
      }));
      return;
    }

    const producto = ventaSeleccionada.productos.find((p: any) => p.nombre === nombreProducto);
    if (producto && producto.precio !== undefined) {
      setNuevaDevolucion(prev => ({
        ...prev,
        producto: nombreProducto,
        productoId: Number(producto.id),
        precioUnitario: producto.precio,
        monto: producto.precio * prev.cantidad
      }));
    } else {
      setNuevaDevolucion(prev => ({
        ...prev,
        producto: nombreProducto,
        productoId: 0,
        precioUnitario: 0,
        monto: 0
      }));
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
    // ---------------------------------------------------------
    // VALIDACIÓN FUERTE (SOLUCIÓN PROFESIONAL)
    // ---------------------------------------------------------
    if (!nuevaDevolucion.ventaId || Number(nuevaDevolucion.ventaId) <= 0) {
      toast.error("Venta inválida: El ID de la venta debe ser mayor a 0");
      return;
    }

    if (!nuevaDevolucion.clienteId || Number(nuevaDevolucion.clienteId) <= 0) {
      toast.error("Cliente inválido: El ID del cliente debe ser mayor a 0");
      return;
    }

    if (!nuevaDevolucion.productoId || Number(nuevaDevolucion.productoId) <= 0) {
      toast.error("Producto inválido: El ID del producto debe ser mayor a 0");
      return;
    }

    if (!nuevaDevolucion.motivoCategoria) {
      toast.error("Por favor selecciona un motivo");
      return;
    }
    // ---------------------------------------------------------

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    setIsDialogOpen(false);

    confirmCreateAction(
      `${nuevaDevolucion.producto} - ${nuevaDevolucion.cliente}`,
      async () => {
        try {
          // Validar sesión de usuario
          const stringUserId = user?.id ? String(user.id) : null;
          const currentUserId = stringUserId ? parseInt(stringUserId) : 0;

          if (!currentUserId || isNaN(currentUserId) || currentUserId <= 0) {
            toast.error("Error de sesión", { description: "No se ha identificado el usuario responsable. Por favor inicie sesión nuevamente." });
            return;
          }

          const payload = {
            ventaId: Number(nuevaDevolucion.ventaId),
            productoId: Number(nuevaDevolucion.productoId),
            clienteId: Number(nuevaDevolucion.clienteId),
            cantidad: Number(nuevaDevolucion.cantidad),
            motivoCategoria: nuevaDevolucion.motivoCategoria,
            motivoDetalle: getMotivoLabel(nuevaDevolucion.motivoCategoria),
            montoDevuelto: Number(nuevaDevolucion.monto),
            saldoAFavor: Number(nuevaDevolucion.monto),
            usuarioId: currentUserId,
            observaciones: nuevaDevolucion.observaciones || ''
          };

          console.log("🚀 Payload real antes del service:", payload);

          // Verificar si hay algún valor sospechoso
          const hasInvalidIds = [payload.ventaId, payload.productoId, payload.clienteId, payload.usuarioId].some(id => isNaN(id) || id <= 0);
          if (hasInvalidIds) {
            console.error("❌ Se detectaron IDs inválidos en el payload:", payload);
            toast.error("Error crítico: Se detectaron IDs inválidos (0 o NaN)");
            return;
          }

          await devolucionService.createDevolucion(payload);

          toast.success(`Devolución registrada exitosamente.`);
          loadData(); // Recargar todos los datos desde la API
          resetFormularios();
        } catch (error) {
          toast.error("Error al registrar la devolución");
          console.error(error);
        }
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
      ventaId: 0,
      clienteId: null,
      cliente: '',
      productoId: 0,
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
    // Aseguramos que tenemos un ID válido antes de proceder
    const idParaActualizar = devolucion.apiId || Number(devolucion.id);

    if (!idParaActualizar || isNaN(idParaActualizar)) {
      toast.error("No se pudo identificar el ID de la devolución para actualizar");
      console.error("❌ Error: ID de devolución inválido:", { apiId: devolucion.apiId, id: devolucion.id });
      return;
    }

    const nuevoEstado = devolucion.estado === 'Activo' ? 'Anulado' : 'Activo';
    const accion = nuevoEstado === 'Activo' ? 'reactivar' : 'anular';

    confirmEditAction(
      `${devolucion.producto} - ${devolucion.cliente}`,
      async () => {
        try {
          console.log(`🚀 Intentando ${accion} devolución con ID: ${idParaActualizar}, Nuevo estado: ${nuevoEstado}`);

          await devolucionService.updateDevolucionStatus(idParaActualizar, nuevoEstado);

          toast.success(`Devolución ${nuevoEstado.toLowerCase()}ada exitosamente`);
          loadData();
        } catch (error: any) {
          console.error(`❌ Error al ${accion} devolución:`, error);
          toast.error(error.message || `Error al actualizar el estado`);
        }
      },
      {
        confirmTitle: `Confirmar ${accion.charAt(0).toUpperCase() + accion.slice(1)} Devolución`,
        confirmMessage: `¿Estás seguro de que deseas ${accion} la devolución del producto "${devolucion.producto}" para el cliente "${devolucion.cliente}"?`,
        successTitle: `¡Devolución ${nuevoEstado.toLowerCase()}ada exitosamente!`,
        successMessage: `El estado ha sido actualizado a ${nuevoEstado} y el stock ha sido ajustado según corresponda.`,
        requireInput: false
      }
    );
  };



  // Función para generar reporte Excel real por rango de fechas
  const generateExcelReport = async (_periodo: 'custom', startDate?: string, endDate?: string) => {
    try {
      // Validar que las fechas estén presentes
      if (!startDate || !endDate) {
        toast.error('Por favor selecciona ambas fechas para generar el reporte');
        return;
      }

      setIsGeneratingReport(true);
      toast.info('Generando reporte Excel...', { duration: 1000 });

      const XLSX = await import('xlsx');
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validar que la fecha de inicio sea anterior a la de fin
      if (start > end) {
        toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
        setIsGeneratingReport(false);
        return;
      }

      // Filtrar devoluciones por rango de fechas
      const filteredData = devoluciones.filter(d => {
        const devDate = new Date(d.fecha.split('-').reverse().join('-'));
        return devDate >= start && devDate <= end;
      });

      // Si no hay datos en el rango, mostrar mensaje
      if (filteredData.length === 0) {
        toast.warning('No se encontraron devoluciones en el rango de fechas seleccionado');
        setIsGeneratingReport(false);
        return;
      }

      const periodoTexto = `${startDate}_a_${endDate}`;

      const totalRegistros = filteredData.length;
      const totalMonto = filteredData.reduce((sum, d) => sum + d.monto, 0);
      const totalSaldos = filteredData.filter(d => d.estado === 'Activo').reduce((sum, d) => sum + d.saldoAFavor, 0);

      // Preparar datos para Excel
      const excelData = filteredData.map(dev => ({
        'ID Devolución': dev.id,
        'Cliente': dev.cliente,
        'Producto': dev.producto,
        'Cantidad': dev.cantidad,
        'Precio Unitario': `${formatCurrency(dev.precioUnitario)}`,
        'Monto Total': `${formatCurrency(dev.monto)}`,
        'Motivo': dev.motivoDetalle,
        'Estado': dev.estado,
        'Fecha': dev.fecha,
        'Hora': dev.hora,
        'Responsable': dev.responsable,
        'No. Venta': dev.numeroVenta,
        'Saldo a Favor': `${formatCurrency(dev.saldoAFavor)}`,
        'Observaciones': dev.observaciones || 'N/A'
      }));

      // Agregar resumen al final
      excelData.push({
        'ID Devolución': '',
        'Cliente': '',
        'Producto': '',
        'Cantidad': 0,
        'Precio Unitario': '',
        'Monto Total': '',
        'Motivo': '',
        'Estado': 'Activo',
        'Fecha': '',
        'Hora': '',
        'Responsable': '',
        'No. Venta': '',
        'Saldo a Favor': '',
        'Observaciones': ''
      } as any);
      excelData.push({
        'ID Devolución': 'RESUMEN',
        'Cliente': '',
        'Producto': '',
        'Cantidad': 0,
        'Precio Unitario': '',
        'Monto Total': '',
        'Motivo': '',
        'Estado': 'Activo',
        'Fecha': '',
        'Hora': '',
        'Responsable': '',
        'No. Venta': '',
        'Saldo a Favor': '',
        'Observaciones': ''
      } as any);
      excelData.push({
        'ID Devolución': 'Total Registros:',
        'Cliente': totalRegistros.toString(),
        'Producto': '',
        'Cantidad': 0,
        'Precio Unitario': '',
        'Monto Total': '',
        'Motivo': '',
        'Estado': 'Activo',
        'Fecha': '',
        'Hora': '',
        'Responsable': '',
        'No. Venta': '',
        'Saldo a Favor': '',
        'Observaciones': ''
      } as any);
      excelData.push({
        'ID Devolución': 'Total Monto:',
        'Cliente': `${formatCurrency(totalMonto)}`,
        'Producto': '',
        'Cantidad': 0,
        'Precio Unitario': '',
        'Monto Total': '',
        'Motivo': '',
        'Estado': 'Activo',
        'Fecha': '',
        'Hora': '',
        'Responsable': '',
        'No. Venta': '',
        'Saldo a Favor': '',
        'Observaciones': ''
      } as any);
      excelData.push({
        'ID Devolución': 'Total Saldos:',
        'Cliente': `${formatCurrency(totalSaldos)}`,
        'Producto': '',
        'Cantidad': 0,
        'Precio Unitario': '',
        'Monto Total': '',
        'Motivo': '',
        'Estado': 'Activo',
        'Fecha': '',
        'Hora': '',
        'Responsable': '',
        'No. Venta': '',
        'Saldo a Favor': '',
        'Observaciones': ''
      } as any);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 15 }, // ID Devolución
        { wch: 20 }, // Cliente
        { wch: 25 }, // Producto
        { wch: 10 }, // Cantidad
        { wch: 15 }, // Precio Unitario
        { wch: 15 }, // Monto Total
        { wch: 25 }, // Motivo
        { wch: 10 }, // Estado
        { wch: 12 }, // Fecha
        { wch: 8 },  // Hora
        { wch: 20 }, // Responsable
        { wch: 12 }, // No. Venta
        { wch: 15 }, // Saldo a Favor
        { wch: 30 }  // Observaciones
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');

      // Generar nombre de archivo con fecha actual
      const fechaActual = new Date().toISOString().split('T')[0];
      const fileName = `Devoluciones_${periodoTexto}_${fechaActual}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`Reporte Excel generado exitosamente`, {
        description: `Archivo: ${fileName} - ${totalRegistros} devoluciones exportadas`
      });

      setIsPdfPopoverOpen(false);
      setIsGeneratingReport(false);
    } catch (error) {
      // Error handling - could be replaced with proper logging service
      toast.error('Error al generar el reporte Excel');
      setIsGeneratingReport(false);
    }
  };

  // Función para generar PDF individual de devolución real
  const generateIndividualPdf = async (devolucion: Devolucion) => {
    try {
      const jsPDF = (await import('jspdf')).default;

      const doc = new jsPDF();

      // Configuración de fuentes y colores
      doc.setTextColor(40, 40, 40);

      // Header del documento
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROBANTE DE DEVOLUCIÓN', 105, 25, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Barbería - Sistema de Gestión`, 105, 35, { align: 'center' });

      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);

      // Información de la devolución
      let yPos = 60;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DE LA DEVOLUCIÓN', 20, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Datos en dos columnas
      const leftColumn = 20;
      const rightColumn = 110;

      doc.setFont('helvetica', 'bold');
      doc.text('ID Devolución:', leftColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.id, leftColumn + 35, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('Estado:', rightColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.estado, rightColumn + 20, yPos);
      yPos += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Cliente:', leftColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.cliente, leftColumn + 25, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('Fecha:', rightColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.fecha, rightColumn + 20, yPos);
      yPos += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('No. Venta:', leftColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.numeroVenta, leftColumn + 30, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('Hora:', rightColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.hora, rightColumn + 20, yPos);
      yPos += 20;

      // Información del producto
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL PRODUCTO', 20, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Producto:', leftColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.producto, leftColumn + 25, yPos);
      yPos += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Cantidad:', leftColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.cantidad.toString(), leftColumn + 25, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('Precio Unitario:', rightColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formatCurrency(devolucion.precioUnitario)}`, rightColumn + 35, yPos);
      yPos += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Monto Total:', leftColumn, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`${formatCurrency(devolucion.monto)}`, leftColumn + 30, yPos);
      yPos += 20;

      // Motivo y observaciones
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MOTIVO DE LA DEVOLUCIÓN', 20, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(devolucion.motivoDetalle, 20, yPos);
      yPos += 15;

      if (devolucion.observaciones) {
        doc.setFont('helvetica', 'bold');
        doc.text('Observaciones:', 20, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');

        // Dividir observaciones en líneas si es muy largo
        const splitObservaciones = doc.splitTextToSize(devolucion.observaciones, 170);
        doc.text(splitObservaciones, 20, yPos);
        yPos += splitObservaciones.length * 6;
      }

      yPos += 20;

      // Información del saldo
      if (devolucion.estado === 'Activo' && devolucion.saldoAFavor > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('SALDO A FAVOR', 20, yPos);
        yPos += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`El cliente ${devolucion.cliente} tiene un saldo a favor de:`, 20, yPos);
        yPos += 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatCurrency(devolucion.saldoAFavor)}`, 20, yPos);
        yPos += 20;
      }

      // Responsable
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Responsable: ${devolucion.responsable}`, 20, yPos);

      // Footer
      yPos = 270;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Este documento es un comprobante oficial de devolución.', 105, yPos, { align: 'center' });
      doc.text(`Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`, 105, yPos + 5, { align: 'center' });

      // Guardar el PDF
      const fileName = `Devolucion_${devolucion.id}_${devolucion.cliente.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      toast.success(`PDF generado exitosamente`, {
        description: `Archivo: ${fileName} para ${devolucion.cliente}`
      });

    } catch (error) {
      // Error handling - could be replaced with proper logging service
      toast.error('Error al generar el PDF de la devolución');
    }
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
            <Popover open={isPdfPopoverOpen} onOpenChange={setIsPdfPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="elegante-button-primary gap-2 flex items-center hover:scale-105 transition-transform"
                  title="Generar reporte de devoluciones en Excel por rango de fechas"
                >
                  <Download className="w-4 h-4" />
                  Reporte Excel
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-darkest border-gray-dark">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white-primary mb-2">Generar Reporte de Devoluciones</h4>
                    <p className="text-sm text-gray-lightest">Selecciona el rango de fechas para el reporte en Excel</p>
                    <p className="text-xs text-orange-primary mt-1">✓ Sin límite de rango de fechas</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-white-primary text-sm mb-2 block">Fecha Inicio</Label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="elegante-input"
                      />
                    </div>
                    <div>
                      <Label className="text-white-primary text-sm mb-2 block">Fecha Fin</Label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="elegante-input"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          generateExcelReport('custom', customStartDate, customEndDate);
                        } else {
                          toast.error('Por favor selecciona ambas fechas');
                        }
                      }}
                      disabled={isGeneratingReport}
                      className="elegante-button-primary w-full p-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className={`w-4 h-4 ${isGeneratingReport ? 'animate-bounce' : ''}`} />
                      {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
                    </button>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
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
                      {['Todos', 'Activo', 'Anulado', 'Pendiente', 'Procesado'].map((estado) => (
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
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Cliente</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Monto</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Saldo a Favor</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-lighter">
                      Cargando devoluciones...
                    </td>
                  </tr>
                ) : displayedDevoluciones.length > 0 ? (
                  displayedDevoluciones.map((devolucion) => (
                    <tr key={devolucion.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-white-primary font-medium">
                          {devolucion.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-primary rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-black-primary" />
                          </div>
                          <div className="text-gray-lighter">{devolucion.cliente}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-lighter">{devolucion.fecha}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">${formatCurrency(devolucion.monto)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">${formatCurrency(devolucion.saldoAFavor)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${getEstadoColor(devolucion.estado)}`}>
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
                            onClick={() => generateIndividualPdf(devolucion)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Generar PDF de devolución"
                          >
                            <FileText className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
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
                  {getHistorialCliente(selectedDevolucion.clienteId).slice(0, 5).map((dev) => (
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
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Nueva Devolución</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Registra una nueva devolución de producto para generar saldo a favor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Selección de Venta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-primary" />
                  Número de Venta *
                </Label>
                <select
                  value={nuevaDevolucion.ventaId || ""}
                  onChange={(e) => handleVentaChange(e.target.value)}
                  className="elegante-input w-full"
                >
                  <option value="">Seleccionar venta...</option>
                  {ventasDisponibles.map((venta) => (
                    <option key={venta.id} value={venta.id}>
                      {venta.numeroVenta} - {venta.cliente} - ${formatCurrency(venta.total)} ({venta.fecha})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-primary" />
                  Cliente
                </Label>
                <Input
                  value={ventaSeleccionada ? ventaSeleccionada.cliente : ''}
                  disabled
                  className="elegante-input bg-gray-medium"
                  placeholder="Se selecciona automáticamente"
                />
              </div>
            </div>

            {/* Información del Cliente (Auto-llenado) */}
            {ventaSeleccionada && (
              <div className="bg-gray-darker p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-light">Cliente</p>
                    <p className="font-semibold text-white-primary">{ventaSeleccionada.cliente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Fecha de Venta</p>
                    <p className="font-semibold text-white-primary">{ventaSeleccionada.fecha}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selección de Producto */}
            {ventaSeleccionada && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-orange-primary" />
                    Producto a Devolver *
                  </Label>
                  <select
                    value={productoDevolucion}
                    onChange={(e) => handleProductoDevolucionChange(e.target.value)}
                    className="elegante-input w-full"
                  >
                    <option value="">Seleccionar producto...</option>
                    {ventaSeleccionada?.productos && Array.isArray(ventaSeleccionada.productos) && ventaSeleccionada.productos.map((producto: any, index: number) => (
                      <option key={index} value={producto?.nombre || ''}>
                        {producto?.nombre || 'Producto sin nombre'} - ${formatCurrency(producto?.precio || 0)} (Máx: {producto?.cantidad || 0})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-primary" />
                    Precio Unitario
                  </Label>
                  <Input
                    type="text"
                    value={`$${formatCurrency(nuevaDevolucion.precioUnitario)}`}
                    disabled
                    className="elegante-input bg-gray-medium"
                  />
                </div>
              </div>
            )}

            {/* Cantidad y Motivo */}
            {nuevaDevolucion.producto && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Hash className="w-4 h-4 text-orange-primary" />
                    Cantidad a Devolver *
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max={ventaSeleccionada?.productos?.find((p: any) => p?.nombre === nuevaDevolucion.producto)?.cantidad || 1}
                    value={nuevaDevolucion.cantidad}
                    onChange={(e) => handleCantidadChange(parseInt(e.target.value) || 1)}
                    className="elegante-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-primary" />
                    Motivo de la Devolución *
                  </Label>
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
              </div>
            )}

            {/* Observaciones */}
            <div className="space-y-2">
              <Label className="text-white-primary flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-primary" />
                Observaciones (Opcional)
              </Label>
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
              <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-gray-lightest">
                  <span>Monto Total a Devolver:</span>
                  <span className="text-orange-primary font-bold text-lg">${formatCurrency(nuevaDevolucion.monto)}</span>
                </div>
                <p className="text-sm text-gray-lightest">
                  Este monto se agregará como saldo a favor del cliente
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
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