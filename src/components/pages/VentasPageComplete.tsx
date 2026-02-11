import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DollarSign,
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingCart,
  Calendar,
  Package,
  X,
  ShoppingBag,
  CreditCard,
  Receipt,
  Hash,
  Clock,
  Star,
  FileText,
  Ban,
  Download,
  Percent,
  Calculator,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import { useCustomAlert } from "../ui/custom-alert";
import { useDoubleConfirmation } from "../ui/double-confirmation";

// Función para formatear moneda colombiana con puntos para separar miles
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

const ventasData = [
  {
    id: "VNT001",
    cliente: "Juan Pérez",
    fecha: "01-08-2025",
    servicios: "Corte, Barba",
    productos: "Cera, Perfume",
    subtotal: 92437,
    iva: 17563,
    descuento: 0,
    total: 110000,
    barbero: "Miguel Rodriguez",
    estado: "Completada",
    metodoPago: "Efectivo",
    productosDetalle: [
      { id: "PROD003", nombre: "Cera para Cabello", cantidad: 1, precio: 25000 },
      { id: "PROD004", nombre: "Perfume Masculino", cantidad: 1, precio: 120000 }
    ]
  },
  {
    id: "VNT002",
    cliente: "María Gómez",
    fecha: "01-08-2025",
    servicios: "Corte, Cejas",
    productos: "Minoxidil",
    subtotal: 71429,
    iva: 13571,
    descuento: 0,
    total: 85000,
    barbero: "Sofia Martinez",
    estado: "Completada",
    metodoPago: "Tarjeta",
    productosDetalle: [
      { id: "PROD005", nombre: "Minoxidil", cantidad: 1, precio: 85000 }
    ]
  },
  {
    id: "VNT003",
    cliente: "Carlos Ruiz",
    fecha: "01-08-2025",
    servicios: "Paquete Premium",
    productos: "Gafas",
    subtotal: 100840,
    iva: 19160,
    descuento: 0,
    total: 120000,
    barbero: "Miguel Rodriguez",
    estado: "Completada",
    metodoPago: "Transferencia",
    productosDetalle: [
      { id: "PROD006", nombre: "Gafas de Sol Ray-Ban", cantidad: 1, precio: 280000 }
    ]
  },
  {
    id: "VNT004",
    cliente: "Laura Zapata",
    fecha: "31-07-2025",
    servicios: "Corte, Tinturado",
    productos: "Ninguno",
    subtotal: 54622,
    iva: 10378,
    descuento: 0,
    total: 65000,
    barbero: "Sofia Martinez",
    estado: "Anulada",
    metodoPago: "Efectivo",
    productosDetalle: []
  }
];

// Datos de productos disponibles
const productosDisponibles = [
  { id: "PROD001", nombre: "Champú Premium Kerastase", precio: 45000 },
  { id: "PROD002", nombre: "Acondicionador L'Oréal Professional", precio: 38000 },
  { id: "PROD003", nombre: "Cera para Cabello", precio: 25000 },
  { id: "PROD004", nombre: "Perfume Masculino", precio: 120000 },
  { id: "PROD005", nombre: "Minoxidil", precio: 85000 },
  { id: "PROD006", nombre: "Gafas de Sol Ray-Ban", precio: 280000 },
  { id: "PROD007", nombre: "Crema Facial Eucerin", precio: 65000 },
  { id: "PROD008", nombre: "Tónico Capilar", precio: 32000 },
  { id: "PROD009", nombre: "Paños Húmedos", precio: 15000 },
  { id: "PROD010", nombre: "Cadenas de Acero", precio: 75000 }
];

export function VentasPage() {
  const { created, edited, deleted, AlertContainer } = useCustomAlert();
  const { confirmEditAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [ventas, setVentas] = useState(ventasData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Función para generar fecha automática
  const generateCurrentDate = () => {
    return new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const inicialNuevaVenta = {
    numeroVenta: '',
    cliente: '',
    servicios: '',
    metodoPago: '',
    fechaCreacion: generateCurrentDate(),
    subtotal: 0,
    iva: 0,
    descuento: 0,
    porcentajeIva: 19,
    porcentajeDescuento: 0,
    productos: [] as Array<{ id: string, nombre: string, cantidad: number, precio: number }>
  };

  const [nuevaVenta, setNuevaVenta] = useState(inicialNuevaVenta);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);

  const filteredVentas = ventas.filter(venta =>
    venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedVentas = filteredVentas.slice(startIndex, startIndex + itemsPerPage);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada": return "bg-green-600 text-white";
      case "Anulada": return "bg-red-600 text-white";
      case "Pendiente": return "bg-orange-secondary text-white";
      case "Por confirmar": return "bg-orange-primary text-white";
      default: return "bg-gray-medium text-white";
    }
  };

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case "Efectivo": return "text-green-400";
      case "Tarjeta": return "text-blue-400";
      case "Transferencia": return "text-purple-400";
      default: return "text-gray-lightest";
    }
  };

  const calcularSubtotal = () => {
    if (!nuevaVenta.productos || !Array.isArray(nuevaVenta.productos)) {
      return 0;
    }
    return nuevaVenta.productos.reduce((total, producto) =>
      total + (producto.precio * producto.cantidad), 0
    );
  };

  const calcularIva = (subtotal: number) => {
    return subtotal * (nuevaVenta.porcentajeIva / 100);
  };

  const calcularDescuento = (subtotal: number) => {
    return subtotal * (nuevaVenta.porcentajeDescuento / 100);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const iva = calcularIva(subtotal);
    const descuento = calcularDescuento(subtotal);
    return subtotal + iva - descuento;
  };

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) return;

    const producto = productosDisponibles.find(p => p.id === productoSeleccionado);
    if (!producto) return;

    const productosActuales = nuevaVenta.productos || [];
    const existeProducto = productosActuales.find(p => p.id === producto.id);

    if (existeProducto) {
      setNuevaVenta({
        ...nuevaVenta,
        productos: productosActuales.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + cantidadProducto }
            : p
        )
      });
    } else {
      setNuevaVenta({
        ...nuevaVenta,
        productos: [...productosActuales, {
          id: producto.id,
          nombre: producto.nombre,
          cantidad: cantidadProducto,
          precio: producto.precio
        }]
      });
    }

    setProductoSeleccionado('');
    setCantidadProducto(1);
  };

  const eliminarProducto = (productId: string) => {
    const productosActuales = nuevaVenta.productos || [];
    setNuevaVenta({
      ...nuevaVenta,
      productos: productosActuales.filter(p => p.id !== productId)
    });
  };

  const handleCreateVenta = () => {
    if (!nuevaVenta.cliente || !nuevaVenta.servicios || !nuevaVenta.metodoPago) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const numeroVenta = `VNT${String(ventas.length + 1).padStart(3, '0')}`;
    const subtotal = calcularSubtotal();
    const iva = calcularIva(subtotal);
    const descuento = calcularDescuento(subtotal);
    const total = calcularTotal();
    const productosActuales = nuevaVenta.productos || [];
    const productosTexto = productosActuales.length > 0
      ? productosActuales.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')
      : 'Ninguno';

    const venta = {
      id: numeroVenta,
      cliente: nuevaVenta.cliente,
      fecha: nuevaVenta.fechaCreacion,
      servicios: nuevaVenta.servicios,
      productos: productosTexto,
      subtotal: subtotal,
      iva: iva,
      descuento: descuento,
      total: total,
      barbero: 'Administrador',
      estado: 'Completada',
      metodoPago: nuevaVenta.metodoPago,
      productosDetalle: productosActuales
    };

    setVentas([venta, ...ventas]);
    setNuevaVenta({
      ...inicialNuevaVenta,
      fechaCreacion: generateCurrentDate()
    });
    setIsDialogOpen(false);

    created("Venta creada ✔️", `La venta ${numeroVenta} ha sido registrada exitosamente por ${formatCurrency(total)} para el cliente ${nuevaVenta.cliente}.`);
  };

  const handleAnularVenta = (ventaId: string) => {
    setVentas(ventas.map(venta =>
      venta.id === ventaId
        ? { ...venta, estado: "Anulada" }
        : venta
    ));
    deleted("Venta anulada ✔️", `La venta ${ventaId} ha sido anulada exitosamente. El estado se ha actualizado en el sistema.`);
  };

  const handleToggleEstado = (venta: any) => {
    // Solo permitir cambios entre "Completada" y "Anulada"
    const nuevoEstado = venta.estado === 'Completada' ? 'Anulada' : 'Completada';
    const accion = nuevoEstado === 'Completada' ? 'activar' : 'anular';

    confirmEditAction(
      `${venta.id} - ${venta.cliente}`,
      () => {
        setVentas(prev => prev.map(v =>
          v.id === venta.id
            ? { ...v, estado: nuevoEstado }
            : v
        ));
      },
      {
        confirmTitle: `Confirmar ${accion.charAt(0).toUpperCase() + accion.slice(1)} Venta`,
        confirmMessage: `¿Estás seguro de que deseas ${accion} la venta "${venta.id}" del cliente "${venta.cliente}"?`,
        successTitle: `¡Venta ${nuevoEstado.toLowerCase()}a exitosamente!`,
        successMessage: `La venta ha sido ${nuevoEstado.toLowerCase()}ada correctamente en el sistema.`,
        requireInput: false
      }
    );
  };

  const generateVentaPDF = (venta: any) => {
    // Crear el contenido HTML del PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura de Venta ${venta.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #fff;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #d8b081;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #d8b081;
            margin-bottom: 10px;
          }
          .invoice-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 5px;
          }
          .invoice-number {
            font-size: 18px;
            color: #666;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-section {
            flex: 1;
            margin-right: 20px;
          }
          .info-title {
            font-size: 16px;
            font-weight: bold;
            color: #d8b081;
            margin-bottom: 10px;
            border-bottom: 1px solid #d8b081;
            padding-bottom: 5px;
          }
          .info-item {
            margin-bottom: 8px;
            display: flex;
          }
          .info-label {
            font-weight: bold;
            min-width: 120px;
            color: #333;
          }
          .info-value {
            color: #666;
          }
          .services-section, .products-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #d8b081;
            margin-bottom: 15px;
            border-bottom: 2px solid #d8b081;
            padding-bottom: 8px;
          }
          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .products-table th {
            background-color: #d8b081;
            color: white;
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
          }
          .products-table td {
            padding: 10px;
            border: 1px solid #ddd;
            color: #333;
          }
          .products-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .totals-section {
            background-color: #f8f9fa;
            border: 2px solid #d8b081;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
          }
          .total-label {
            font-weight: bold;
            color: #333;
          }
          .total-value {
            font-weight: bold;
            color: #333;
          }
          .final-total {
            border-top: 2px solid #d8b081;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 20px;
          }
          .final-total .total-value {
            color: #d8b081;
            font-size: 24px;
          }
          .payment-info {
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background-color: #fff;
            border: 1px solid #d8b081;
            border-radius: 8px;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            color: white;
            background-color: ${venta.estado === 'Completada' ? '#10B981' : venta.estado === 'Anulada' ? '#DC2626' : '#d8b081'};
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #d8b081;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">BARBERÍA ELEGANTE</div>
          <div class="invoice-title">FACTURA DE VENTA</div>
          <div class="invoice-number">${venta.id}</div>
        </div>

        <div class="invoice-info" style="display: block;">
          <div class="info-section" style="width: 48%; display: inline-block; vertical-align: top;">
            <div class="info-title">INFORMACIÓN DEL CLIENTE</div>
            <div class="info-item">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${venta.cliente}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha:</span>
              <span class="info-value">${venta.fecha}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="status-badge">${venta.estado}</span>
            </div>
          </div>
          
          <div class="info-section" style="width: 48%; display: inline-block; vertical-align: top; margin-left: 4%;">
            <div class="info-title">INFORMACIÓN DE SERVICIO</div>
            <div class="info-item">
              <span class="info-label">Barbero:</span>
              <span class="info-value">${venta.barbero}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Método de Pago:</span>
              <span class="info-value">${venta.metodoPago}</span>
            </div>
          </div>
        </div>

        <div class="services-section">
          <div class="section-title">SERVICIOS REALIZADOS</div>
          <p style="color: #333; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #d8b081;">
            ${venta.servicios}
          </p>
        </div>

        ${venta.productosDetalle && venta.productosDetalle.length > 0 ? `
        <div class="products-section">
          <div class="section-title">PRODUCTOS VENDIDOS</div>
          <table class="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${venta.productosDetalle.map((producto: any) => `
                <tr>
                  <td>${producto.nombre}</td>
                  <td style="text-align: center;">${producto.cantidad}</td>
                  <td style="text-align: right;">$${formatCurrency(producto.precio)}</td>
                  <td style="text-align: right;">$${formatCurrency(producto.precio * producto.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : `
        <div class="products-section">
          <div class="section-title">PRODUCTOS VENDIDOS</div>
          <p style="color: #666; font-style: italic; text-align: center; padding: 20px;">
            No se vendieron productos en esta transacción
          </p>
        </div>
        `}

        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">$${formatCurrency(venta.subtotal)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">IVA (19%):</span>
            <span class="total-value">$${formatCurrency(venta.iva)}</span>
          </div>
          ${venta.descuento > 0 ? `
          <div class="total-row">
            <span class="total-label">Descuento:</span>
            <span class="total-value" style="color: #DC2626;">-$${formatCurrency(venta.descuento)}</span>
          </div>
          ` : ''}
          <div class="total-row final-total">
            <span class="total-label">TOTAL A PAGAR:</span>
            <span class="total-value">$${formatCurrency(venta.total)}</span>
          </div>
        </div>

        <div class="payment-info">
          <strong>Método de Pago: ${venta.metodoPago}</strong>
          <br>
          <span style="color: #666; margin-top: 10px; display: block;">
            ${venta.estado === 'Completada' ? 'Pago procesado exitosamente' :
        venta.estado === 'Anulada' ? 'Venta anulada' : 'Pago pendiente de confirmación'}
          </span>
        </div>

        <div class="footer">
          <p><strong>Barbería Elegante</strong> - Sistema de Gestión Integral</p>
          <p>Documento generado automáticamente el ${new Date().toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
          <p style="margin-top: 10px; color: #d8b081;">
            <strong>¡Gracias por preferirnos!</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    // Crear y abrir una nueva ventana con el contenido del PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Esperar a que se cargue el contenido y luego imprimir
      printWindow.onload = () => {
        printWindow.print();
        // Opcional: cerrar la ventana después de imprimir
        // printWindow.close();
      };
    }

    created("PDF generado ✔️", `La factura de la venta ${venta.id} ha sido generada y está lista para imprimir.`);
  };

  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const ventasCompletadas = ventas.filter(v => v.estado === "Completada").length;
  const ventasHoy = ventas.filter(v => v.fecha === new Date().toLocaleDateString('es-ES')).length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Ventas</h1>
            <p className="text-sm text-gray-lightest mt-1">Control y seguimiento de transacciones</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="elegante-tag-orange">
              Hoy: {ventasHoy} ventas
            </div>
            <div className="elegante-tag bg-green-600 text-white">
              Total: ${formatCurrency(totalVentas)}
            </div>
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
                      setNuevaVenta({
                        ...inicialNuevaVenta,
                        fechaCreacion: generateCurrentDate()
                      });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Venta
                  </button>
                </DialogTrigger>
                <DialogContent className="elegante-card max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-orange-primary" />
                      Registrar Nueva Venta
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      Completa la información de la transacción
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Información Principal de la Venta */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Hash className="w-4 h-4 text-orange-primary" />
                          Número de Venta
                        </Label>
                        <Input
                          value={`VNT${String(ventas.length + 1).padStart(3, '0')}`}
                          disabled
                          className="elegante-input bg-gray-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-primary" />
                          Fecha de Creación
                        </Label>
                        <Input
                          value={nuevaVenta.fechaCreacion}
                          disabled
                          readOnly
                          className="elegante-input bg-gray-medium"
                        />
                      </div>
                    </div>

                    {/* Cliente y Servicios */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Cliente *
                        </Label>
                        <Input
                          value={nuevaVenta.cliente}
                          onChange={(e) => setNuevaVenta({ ...nuevaVenta, cliente: e.target.value })}
                          placeholder="Nombre del cliente"
                          className="elegante-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-primary" />
                          Servicios *
                        </Label>
                        <Input
                          value={nuevaVenta.servicios}
                          onChange={(e) => setNuevaVenta({ ...nuevaVenta, servicios: e.target.value })}
                          placeholder="Corte, Barba, etc."
                          className="elegante-input"
                        />
                      </div>
                    </div>

                    {/* Método de Pago */}
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-orange-primary" />
                        Método de Pago *
                      </Label>
                      <select
                        value={nuevaVenta.metodoPago}
                        onChange={(e) => setNuevaVenta({ ...nuevaVenta, metodoPago: e.target.value })}
                        className="elegante-input w-full"
                      >
                        <option value="">Seleccionar método...</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Transferencia">Transferencia</option>
                      </select>
                    </div>

                    {/* Sección de Productos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white-primary flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-orange-primary" />
                        Productos Adicionales
                      </h3>

                      {/* Agregar Producto */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white-primary">Producto</Label>
                          <select
                            value={productoSeleccionado}
                            onChange={(e) => setProductoSeleccionado(e.target.value)}
                            className="elegante-input w-full"
                          >
                            <option value="">Seleccionar producto...</option>
                            {productosDisponibles.map(producto => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre} - ${formatCurrency(producto.precio)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={cantidadProducto}
                            onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                            className="elegante-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary">&nbsp;</Label>
                          <Button
                            onClick={agregarProducto}
                            className="elegante-button-primary w-full"
                            disabled={!productoSeleccionado}
                          >
                            Agregar
                          </Button>
                        </div>
                      </div>

                      {/* Lista de Productos Agregados */}
                      {nuevaVenta.productos && nuevaVenta.productos.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-white-primary">Productos Agregados</Label>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {nuevaVenta.productos.map((producto, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                                <div className="flex-1">
                                  <p className="text-white-primary">{producto.nombre}</p>
                                  <p className="text-gray-lightest text-sm">
                                    Cantidad: {producto.cantidad} × ${formatCurrency(producto.precio)} = ${formatCurrency(producto.cantidad * producto.precio)}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => eliminarProducto(producto.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  variant="ghost"
                                  size="sm"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Configuración de Cálculos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Percent className="w-4 h-4 text-orange-primary" />
                          IVA (%)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={nuevaVenta.porcentajeIva}
                          onChange={(e) => setNuevaVenta({ ...nuevaVenta, porcentajeIva: parseFloat(e.target.value) || 0 })}
                          className="elegante-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-orange-primary" />
                          Descuento (%)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={nuevaVenta.porcentajeDescuento}
                          onChange={(e) => setNuevaVenta({ ...nuevaVenta, porcentajeDescuento: parseFloat(e.target.value) || 0 })}
                          className="elegante-input"
                        />
                      </div>
                    </div>

                    {/* Resumen de Totales */}
                    <div className="bg-gray-darker p-4 rounded-lg space-y-3">
                      <h3 className="text-lg font-semibold text-white-primary">Resumen de Totales</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-lightest">Subtotal:</span>
                          <span className="text-white-primary">${formatCurrency(calcularSubtotal())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-lightest">IVA ({nuevaVenta.porcentajeIva}%):</span>
                          <span className="text-white-primary">${formatCurrency(calcularIva(calcularSubtotal()))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-lightest">Descuento ({nuevaVenta.porcentajeDescuento}%):</span>
                          <span className="text-red-400">-${formatCurrency(calcularDescuento(calcularSubtotal()))}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t border-gray-dark pt-2">
                          <span className="text-orange-primary">Total:</span>
                          <span className="text-orange-primary">${formatCurrency(calcularTotal())}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={() => setIsDialogOpen(false)}
                        className="elegante-button-secondary flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateVenta}
                        className="elegante-button-primary flex-1"
                      >
                        Registrar Venta
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Barra de Búsqueda */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-lightest w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Ventas */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">Servicios</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">Estado</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium">Método Pago</th>
                  <th className="text-center py-3 px-4 text-gray-lightest font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedVentas.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-orange-primary font-medium">{venta.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-lightest" />
                        <span className="text-white-primary">{venta.cliente}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-lightest" />
                        <span className="text-gray-lightest">{venta.fecha}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lightest">{venta.servicios}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-green-400 font-semibold">${formatCurrency(venta.total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`${getMetodoPagoColor(venta.metodoPago)}`}>
                        {venta.metodoPago}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedVenta(venta);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => generateVentaPDF(venta)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors"
                          title="Generar PDF"
                        >
                          <Download className="w-4 h-4 text-green-400" />
                        </button>
                        {(venta.estado === 'Completada' || venta.estado === 'Anulada') && (
                          <button
                            onClick={() => handleToggleEstado(venta)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors"
                            title={venta.estado === 'Completada' ? 'Anular venta' : 'Activar venta'}
                          >
                            {venta.estado === 'Completada' ? (
                              <ToggleRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-red-400" />
                            )}
                          </button>
                        )}
                        {venta.estado !== 'Anulada' && (
                          <button
                            onClick={() => handleAnularVenta(venta.id)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors"
                            title="Anular venta"
                          >
                            <Ban className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-dark">
            <div className="flex items-center gap-2">
              <span className="text-gray-lightest text-sm">Mostrar</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="elegante-input w-20 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-gray-lightest text-sm">elementos</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-lightest text-sm">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredVentas.length)} de {filteredVentas.length} ventas
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-darker rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-lightest" />
                </button>
                <span className="px-3 py-2 text-orange-primary font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-darker rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-gray-lightest" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog para Detalles de Venta */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="elegante-card max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-primary" />
              Detalles de Venta - {selectedVenta?.id}
            </DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Información completa de la transacción
            </DialogDescription>
          </DialogHeader>
          {selectedVenta && (
            <div className="space-y-6 pt-4">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white-primary">Información General</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-lightest text-sm">ID de Venta:</span>
                      <p className="text-orange-primary font-medium">{selectedVenta.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-lightest text-sm">Cliente:</span>
                      <p className="text-white-primary">{selectedVenta.cliente}</p>
                    </div>
                    <div>
                      <span className="text-gray-lightest text-sm">Fecha:</span>
                      <p className="text-white-primary">{selectedVenta.fecha}</p>
                    </div>
                    <div>
                      <span className="text-gray-lightest text-sm">Barbero:</span>
                      <p className="text-white-primary">{selectedVenta.barbero}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white-primary">Estado y Pago</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-lightest text-sm">Estado:</span>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedVenta.estado)}`}>
                          {selectedVenta.estado}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-lightest text-sm">Método de Pago:</span>
                      <p className={`${getMetodoPagoColor(selectedVenta.metodoPago)}`}>
                        {selectedVenta.metodoPago}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-lightest text-sm">Total:</span>
                      <p className="text-green-400 font-semibold text-lg">${formatCurrency(selectedVenta.total)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div>
                <h3 className="text-lg font-semibold text-white-primary mb-3">Servicios Realizados</h3>
                <div className="bg-gray-darker p-4 rounded-lg">
                  <p className="text-white-primary">{selectedVenta.servicios}</p>
                </div>
              </div>

              {/* Productos */}
              {selectedVenta.productosDetalle && selectedVenta.productosDetalle.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white-primary mb-3">Productos Vendidos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-dark">
                          <th className="text-left py-2 px-3 text-gray-lightest text-sm">Producto</th>
                          <th className="text-center py-2 px-3 text-gray-lightest text-sm">Cantidad</th>
                          <th className="text-right py-2 px-3 text-gray-lightest text-sm">Precio Unit.</th>
                          <th className="text-right py-2 px-3 text-gray-lightest text-sm">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVenta.productosDetalle.map((producto: any, index: number) => (
                          <tr key={index} className="border-b border-gray-dark">
                            <td className="py-3 px-3 text-white-primary">{producto.nombre}</td>
                            <td className="py-3 px-3 text-center text-gray-lightest">{producto.cantidad}</td>
                            <td className="py-3 px-3 text-right text-gray-lightest">${formatCurrency(producto.precio)}</td>
                            <td className="py-3 px-3 text-right text-green-400">${formatCurrency(producto.precio * producto.cantidad)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totales */}
              <div>
                <h3 className="text-lg font-semibold text-white-primary mb-3">Resumen de Totales</h3>
                <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-lightest">Subtotal:</span>
                    <span className="text-white-primary">${formatCurrency(selectedVenta.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-lightest">IVA:</span>
                    <span className="text-white-primary">${formatCurrency(selectedVenta.iva)}</span>
                  </div>
                  {selectedVenta.descuento > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-lightest">Descuento:</span>
                      <span className="text-red-400">-${formatCurrency(selectedVenta.descuento)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-dark pt-2 font-semibold">
                    <span className="text-orange-primary">Total:</span>
                    <span className="text-orange-primary text-lg">${formatCurrency(selectedVenta.total)}</span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="elegante-button-secondary flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    generateVentaPDF(selectedVenta);
                    setIsDetailDialogOpen(false);
                  }}
                  className="elegante-button-primary flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertContainer />
      <DoubleConfirmationContainer />
    </>
  );
}