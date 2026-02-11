import React, { useState } from "react";
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
  Truck,
  Building,
  FileText,
  Ban,
  Download,
  Percent,
  Calculator,
  FileDown,
  Boxes
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useDoubleConfirmation } from "../ui/double-confirmation";
import { useCustomAlert } from "../ui/custom-alert";

// Función para formatear moneda colombiana con puntos para separar miles
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

const comprasData = [
  {
    id: "CPR001",
    proveedor: "Distribuidora El Dorado",
    proveedorDocumento: "NIT 900123456-1",
    fecha: "01-08-2025",
    productos: "Champú Premium, Acondicionador",
    subtotal: 1050420,
    iva: 199580,
    descuento: 0,
    total: 1250000,
    responsableCompra: "Carlos Rodriguez",
    estado: "Completada",
    metodoPago: "Transferencia",
    productosDetalle: [
      { id: "PROD001", nombre: "Champú Premium Kerastase", cantidad: 15, precio: 45000 },
      { id: "PROD002", nombre: "Acondicionador L'Oréal Professional", cantidad: 10, precio: 38000 }
    ]
  },
  {
    id: "CPR002",
    proveedor: "Perfumería Andina S.A.S",
    proveedorDocumento: "NIT 900234567-2",
    fecha: "01-08-2025",
    productos: "Perfumes Masculinos, Aftershave",
    subtotal: 798319,
    iva: 151681,
    descuento: 0,
    total: 950000,
    responsableCompra: "Maria Gonzalez",
    estado: "Completada",
    metodoPago: "Tarjeta",
    productosDetalle: [
      { id: "PROD004", nombre: "Perfume Masculino Hugo Boss", cantidad: 5, precio: 120000 },
      { id: "PROD005", nombre: "Aftershave Nivea Men", cantidad: 8, precio: 35000 }
    ]
  },
  {
    id: "CPR003",
    proveedor: "Accesorios & Más Ltda",
    proveedorDocumento: "NIT 900345678-3",
    fecha: "31-07-2025",
    productos: "Gafas Ray-Ban, Cadenas Acero",
    subtotal: 2352941,
    iva: 447059,
    descuento: 0,
    total: 2800000,
    responsableCompra: "Carlos Rodriguez",
    estado: "Completada",
    metodoPago: "Efectivo",
    productosDetalle: [
      { id: "PROD006", nombre: "Gafas de Sol Ray-Ban", cantidad: 8, precio: 280000 },
      { id: "PROD010", nombre: "Cadenas de Acero", cantidad: 4, precio: 75000 }
    ]
  },
  {
    id: "CPR004",
    proveedor: "Dermacosméticos Profesionales",
    proveedorDocumento: "NIT 900456789-4",
    fecha: "31-07-2025",
    productos: "Cremas Faciales, Paños Húmedos",
    subtotal: 655462,
    iva: 124538,
    descuento: 0,
    total: 780000,
    responsableCompra: "Ana Lopez",
    estado: "Pendiente",
    metodoPago: "Transferencia",
    productosDetalle: [
      { id: "PROD007", nombre: "Crema Facial Eucerin", cantidad: 8, precio: 65000 },
      { id: "PROD009", nombre: "Paños Húmedos", cantidad: 5, precio: 15000 }
    ]
  }
];

// Datos de productos disponibles para compra (basados en proveedores)
const productosParaCompra = [
  { id: "PROD001", nombre: "Champú Premium Kerastase", precio: 45000, proveedor: "Distribuidora El Dorado" },
  { id: "PROD002", nombre: "Acondicionador L'Oréal Professional", precio: 38000, proveedor: "Distribuidora El Dorado" },
  { id: "PROD003", nombre: "Cera para Cabello", precio: 25000, proveedor: "Distribuidora El Dorado" },
  { id: "PROD004", nombre: "Perfume Masculino Hugo Boss", precio: 120000, proveedor: "Perfumería Andina S.A.S" },
  { id: "PROD005", nombre: "Aftershave Nivea Men", precio: 35000, proveedor: "Perfumería Andina S.A.S" },
  { id: "PROD006", nombre: "Gafas de Sol Ray-Ban", precio: 280000, proveedor: "Accesorios & Más Ltda" },
  { id: "PROD007", nombre: "Crema Facial Eucerin", precio: 65000, proveedor: "Dermacosméticos Profesionales" },
  { id: "PROD008", nombre: "Tónico Capilar", precio: 32000, proveedor: "Distribuidora El Dorado" },
  { id: "PROD009", nombre: "Paños Húmedos", precio: 15000, proveedor: "Dermacosméticos Profesionales" },
  { id: "PROD010", nombre: "Cadenas de Acero", precio: 75000, proveedor: "Accesorios & Más Ltda" },
  { id: "PROD011", nombre: "Tijeras Profesionales Jaguar", precio: 350000, proveedor: "Herramientas Pro Barbershop" },
  { id: "PROD012", nombre: "Máquinas de Cortar Wahl", precio: 480000, proveedor: "Herramientas Pro Barbershop" }
];

// Lista de proveedores disponibles
const proveedoresDisponibles = [
  "Distribuidora El Dorado",
  "Perfumería Andina S.A.S",
  "Accesorios & Más Ltda",
  "Dermacosméticos Profesionales",
  "Herramientas Pro Barbershop"
];

export function ComprasPage() {
  const { confirmDeleteAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const { created, AlertContainer } = useCustomAlert();
  const [compras, setCompras] = useState(comprasData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<any>(null);
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

  const inicialNuevaCompra = {
    numeroCompra: '',
    proveedorSeleccionado: '',
    metodoPago: '',
    fechaRegistro: generateCurrentDate(),
    fechaFactura: '',
    subtotal: 0,
    descuento: 0,
    porcentajeDescuento: 0,
    productos: [] as Array<{ id: string, nombre: string, cantidad: number, precio: number, proveedor: string, stockVentas: number, stockInsumos: number }>
  };

  const [nuevaCompra, setNuevaCompra] = useState(inicialNuevaCompra);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [stockVentas, setStockVentas] = useState(0);
  const [stockInsumos, setStockInsumos] = useState(0);

  const filteredCompras = compras.filter(compra =>
    compra.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compra.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCompras = filteredCompras.slice(startIndex, startIndex + itemsPerPage);

  const getEstadoColor = (estado: string) => {
    // Todos los estados ahora usan el mismo estilo gris uniforme
    return "bg-gray-medium text-gray-lighter";
  };

  const getMetodoPagoColor = (metodo: string) => {
    // Todos los métodos de pago ahora usan el mismo estilo gris uniforme
    return "text-gray-lighter";
  };

  const calcularSubtotal = () => {
    if (!nuevaCompra.productos || !Array.isArray(nuevaCompra.productos)) {
      return 0;
    }
    return nuevaCompra.productos.reduce((total, producto) =>
      total + (producto.precio * producto.cantidad), 0
    );
  };

  const calcularDescuento = (subtotal: number) => {
    return subtotal * (nuevaCompra.porcentajeDescuento / 100);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const descuento = calcularDescuento(subtotal);
    return subtotal - descuento;
  };

  // Mostrar todos los productos disponibles (sin filtro por proveedor)
  const productosDisponibles = productosParaCompra;

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) return;

    const producto = productosParaCompra.find(p => p.id === productoSeleccionado);
    if (!producto) return;

    // Validar que la suma de stock coincida con la cantidad total
    if (stockVentas + stockInsumos !== cantidadProducto) {
      toast.error("Error en distribución de stock", "La suma de Stock para Ventas y Stock para Entregas debe ser igual a la Cantidad Total");
      return;
    }

    const productosActuales = nuevaCompra.productos || [];
    const existeProducto = productosActuales.find(p => p.id === producto.id);

    if (existeProducto) {
      setNuevaCompra({
        ...nuevaCompra,
        productos: productosActuales.map(p =>
          p.id === producto.id
            ? {
              ...p,
              cantidad: p.cantidad + cantidadProducto,
              stockVentas: p.stockVentas + stockVentas,
              stockInsumos: p.stockInsumos + stockInsumos
            }
            : p
        )
      });
    } else {
      setNuevaCompra({
        ...nuevaCompra,
        productos: [...productosActuales, {
          id: producto.id,
          nombre: producto.nombre,
          cantidad: cantidadProducto,
          precio: producto.precio,
          proveedor: producto.proveedor,
          stockVentas: stockVentas,
          stockInsumos: stockInsumos
        }]
      });
    }

    setProductoSeleccionado('');
    setCantidadProducto(1);
    setStockVentas(0);
    setStockInsumos(0);
  };

  const eliminarProducto = (productId: string) => {
    const productosActuales = nuevaCompra.productos || [];
    setNuevaCompra({
      ...nuevaCompra,
      productos: productosActuales.filter(p => p.id !== productId)
    });
  };

  const handleCreateCompra = () => {
    if (!nuevaCompra.proveedorSeleccionado || !nuevaCompra.metodoPago || !nuevaCompra.fechaFactura || nuevaCompra.productos.length === 0) {
      toast.error("Por favor completa todos los campos obligatorios y agrega al menos un producto");
      return;
    }

    const numeroCompra = `CPR${String(compras.length + 1).padStart(3, '0')}`;
    const subtotal = calcularSubtotal();
    const descuento = calcularDescuento(subtotal);
    const total = calcularTotal();
    const productosActuales = nuevaCompra.productos || [];
    const productosTexto = productosActuales.length > 0
      ? productosActuales.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')
      : 'Ninguno';

    const compra = {
      id: numeroCompra,
      proveedor: nuevaCompra.proveedorSeleccionado,
      fecha: nuevaCompra.fechaRegistro,
      fechaFactura: nuevaCompra.fechaFactura,
      productos: productosTexto,
      subtotal: subtotal,
      descuento: descuento,
      total: total,
      responsableCompra: 'Administrador',
      estado: 'Completada',
      metodoPago: nuevaCompra.metodoPago,
      productosDetalle: productosActuales
    };

    setCompras([compra, ...compras]);
    setNuevaCompra({
      ...inicialNuevaCompra,
      fechaRegistro: generateCurrentDate()
    });
    setIsDialogOpen(false);

    created("Compra creada ✔️", `La compra ${numeroCompra} ha sido registrada exitosamente por ${formatCurrency(total)} con ${productosActuales.length} productos del proveedor ${nuevaCompra.proveedorSeleccionado}.`);
  };

  const handleAnularCompra = (compraId: string) => {
    const compra = compras.find(c => c.id === compraId);
    if (!compra) return;

    confirmDeleteAction(
      compraId,
      () => {
        setCompras(compras.map(c =>
          c.id === compraId
            ? { ...c, estado: "Anulada" }
            : c
        ));
      },
      {
        confirmTitle: "Confirmar Anulación",
        confirmMessage: `¿Estás seguro de que deseas anular la compra "${compraId}"? Esta acción cambiará el estado a "Anulada" y no se puede deshacer.`,
        successTitle: "Compra anulada ✔️",
        successMessage: `La compra ${compraId} ha sido anulada exitosamente. El estado se ha actualizado en el sistema.`,
        requireInput: false
      }
    );
  };

  const generatePurchaseReport = (compra: any) => {
    // Crear contenido HTML para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Compra - ${compra.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #d8b081; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { color: #d8b081; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .report-title { font-size: 18px; color: #666; }
          .info-section { margin: 20px 0; }
          .section-title { background-color: #f5f5f5; padding: 10px; font-weight: bold; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
          .info-item { border-bottom: 1px solid #eee; padding: 8px 0; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; margin-top: 5px; }
          .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .products-table th, .products-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .products-table th { background-color: #f8f9fa; font-weight: bold; }
          .totals-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .total-final { font-size: 18px; font-weight: bold; color: #d8b081; border-top: 2px solid #d8b081; padding-top: 10px; margin-top: 15px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">BARBERÍA ELEGANTE</div>
          <div class="report-title">Reporte de Compra</div>
          <div>Fecha de generación: ${new Date().toLocaleDateString('es-CO')}</div>
        </div>

        <div class="info-section">
          <div class="section-title">Información General</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">ID de Compra:</div>
              <div class="info-value">${compra.id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado:</div>
              <div class="info-value">${compra.estado}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Proveedor:</div>
              <div class="info-value">${compra.proveedor}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Responsable:</div>
              <div class="info-value">${compra.responsableCompra}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Registro:</div>
              <div class="info-value">${compra.fecha}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Factura:</div>
              <div class="info-value">${compra.fechaFactura || compra.fecha}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Método de Pago:</div>
              <div class="info-value">${compra.metodoPago}</div>
            </div>
          </div>
        </div>

        ${compra.productosDetalle && compra.productosDetalle.length > 0 ? `
        <div class="info-section">
          <div class="section-title">Productos</div>
          <table class="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${compra.productosDetalle.map((producto: any) => `
                <tr>
                  <td>${producto.nombre}</td>
                  <td>${producto.cantidad}</td>
                  <td>${formatCurrency(producto.precio)}</td>
                  <td>${formatCurrency(producto.precio * producto.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="totals-section">
          <div class="section-title">Resumen Financiero</div>
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(compra.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>IVA:</span>
            <span>${formatCurrency(compra.iva)}</span>
          </div>
          <div class="total-row">
            <span>Descuento:</span>
            <span>-${formatCurrency(compra.descuento)}</span>
          </div>
          <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>${formatCurrency(compra.total)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Este es un documento generado automáticamente por el sistema de gestión de barbería.</p>
          <p>Reporte generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
        </div>
      </body>
      </html>
    `;

    // Crear y descargar el archivo
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Compra_${compra.id}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Reporte PDF generado exitosamente", {
      description: `Reporte de compra ${compra.id} descargado`,
    });
  };

  const totalCompras = compras.reduce((sum, compra) => sum + compra.total, 0);
  const comprasCompletadas = compras.filter(c => c.estado === "Completada").length;
  const comprasHoy = compras.filter(c => c.fecha === new Date().toLocaleDateString('es-ES')).length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Compras</h1>
            <p className="text-sm text-gray-lightest mt-1">Control y seguimiento de compras a proveedores</p>
          </div>

        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="elegante-card text-center">
            <DollarSign className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">${formatCurrency(totalCompras)}</h4>
            <p className="text-gray-lightest text-sm">Total Compras</p>
          </div>
          <div className="elegante-card text-center">
            <ShoppingCart className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{comprasCompletadas}</h4>
            <p className="text-gray-lightest text-sm">Completadas</p>
          </div>
          <div className="elegante-card text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{comprasHoy}</h4>
            <p className="text-gray-lightest text-sm">Compras Hoy</p>
          </div>
          <div className="elegante-card text-center">
            <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              ${formatCurrency(Math.round(totalCompras / compras.length))}
            </h4>
            <p className="text-gray-lightest text-sm">Promedio</p>
          </div>
        </div>

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
                      setNuevaCompra({
                        ...inicialNuevaCompra,
                        fechaRegistro: generateCurrentDate()
                      });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Compra
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-orange-primary" />
                      Registrar Nueva Compra
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      Completa la información de la compra al proveedor
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Información Principal de la Compra */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Hash className="w-4 h-4 text-orange-primary" />
                          Número de Compra
                        </Label>
                        <Input
                          value={`CPR${String(compras.length + 1).padStart(3, '0')}`}
                          disabled
                          className="elegante-input bg-gray-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-primary" />
                          Fecha de Registro
                        </Label>
                        <Input
                          value={nuevaCompra.fechaRegistro}
                          disabled
                          readOnly
                          className="elegante-input bg-gray-medium"
                        />
                      </div>
                    </div>

                    {/* Fecha de Factura */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-primary" />
                          Fecha de Factura *
                        </Label>
                        <Input
                          type="date"
                          value={nuevaCompra.fechaFactura}
                          onChange={(e) => setNuevaCompra({ ...nuevaCompra, fechaFactura: e.target.value })}
                          className="elegante-input"
                        />
                      </div>
                    </div>

                    {/* Proveedor y Método de Pago */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Building className="w-4 h-4 text-orange-primary" />
                          Proveedor *
                        </Label>
                        <select
                          value={nuevaCompra.proveedorSeleccionado}
                          onChange={(e) => setNuevaCompra({ ...nuevaCompra, proveedorSeleccionado: e.target.value })}
                          className="elegante-input w-full"
                        >
                          <option value="">Seleccionar proveedor...</option>
                          {proveedoresDisponibles.map(proveedor => (
                            <option key={proveedor} value={proveedor}>{proveedor}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-orange-primary" />
                          Método de Pago *
                        </Label>
                        <select
                          value={nuevaCompra.metodoPago}
                          onChange={(e) => setNuevaCompra({ ...nuevaCompra, metodoPago: e.target.value })}
                          className="elegante-input w-full"
                        >
                          <option value="">Seleccionar método...</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta</option>
                          <option value="Transferencia">Transferencia</option>
                        </select>
                      </div>
                    </div>

                    {/* Configuración de Descuento */}
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-orange-primary" />
                        Porcentaje Descuento (%)
                      </Label>
                      <Input
                        type="number"
                        value={nuevaCompra.porcentajeDescuento}
                        onChange={(e) => setNuevaCompra({ ...nuevaCompra, porcentajeDescuento: parseFloat(e.target.value) || 0 })}
                        className="elegante-input"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    {/* Agregar Productos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white-primary">Agregar Productos</h3>

                      {/* Primera Fila: Producto y Cantidad Total */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-orange-primary" />
                            Producto *
                          </Label>
                          <select
                            value={productoSeleccionado}
                            onChange={(e) => setProductoSeleccionado(e.target.value)}
                            className="elegante-input w-full"
                          >
                            <option value="">Seleccionar producto...</option>
                            {productosDisponibles.map(producto => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre} - ${formatCurrency(producto.precio)} ({producto.proveedor})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Hash className="w-4 h-4 text-orange-primary" />
                            Cantidad Total *
                          </Label>
                          <Input
                            type="number"
                            value={cantidadProducto}
                            onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                            className="elegante-input"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Segunda Fila: Distribución de Stock */}
                      <div className="p-4 bg-orange-primary/10 border border-orange-primary/30 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-orange-primary text-sm font-medium">
                          <Boxes className="w-4 h-4" />
                          <span>Distribución de Stock (debe sumar {cantidadProducto})</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Boxes className="w-4 h-4 text-orange-primary" />
                              Stock para Ventas *
                            </Label>
                            <Input
                              type="number"
                              value={stockVentas}
                              onChange={(e) => setStockVentas(parseInt(e.target.value) || 0)}
                              className="elegante-input"
                              min="0"
                              max={cantidadProducto}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Boxes className="w-4 h-4 text-orange-primary" />
                              Stock para Entregas *
                            </Label>
                            <Input
                              type="number"
                              value={stockInsumos}
                              onChange={(e) => setStockInsumos(parseInt(e.target.value) || 0)}
                              className="elegante-input"
                              min="0"
                              max={cantidadProducto}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary">ㅤ</Label>
                            <button
                              onClick={agregarProducto}
                              disabled={!productoSeleccionado || cantidadProducto <= 0 || (stockVentas + stockInsumos) !== cantidadProducto}
                              className="elegante-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Agregar Producto

                            </button>
                          </div>
                        </div>
                        {(stockVentas + stockInsumos) !== cantidadProducto && cantidadProducto > 0 && (
                          <p className="text-red-400 text-sm">
                            ⚠️ La suma ({stockVentas + stockInsumos}) debe ser igual a la cantidad total ({cantidadProducto})
                          </p>
                        )}
                      </div>

                      {/* Lista de Productos Agregados */}
                      {nuevaCompra.productos && nuevaCompra.productos.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-md font-medium text-white-primary">Productos Agregados:</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {nuevaCompra.productos.map((producto, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                                <div className="flex-1">
                                  <span className="text-white-primary font-medium">{producto.nombre}</span>
                                  <div className="text-sm text-gray-lightest">
                                    Cantidad Total: {producto.cantidad} | Precio: ${formatCurrency(producto.precio)} |
                                    Subtotal: ${formatCurrency(producto.precio * producto.cantidad)}
                                  </div>
                                  <div className="text-xs text-gray-light">
                                    Proveedor: {producto.proveedor} |
                                    <span className="text-green-400 ml-2">🛒 Ventas: {producto.stockVentas}</span> |
                                    <span className="text-blue-400 ml-2">📦 Entregas: {producto.stockInsumos}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => eliminarProducto(producto.id)}
                                  className="ml-3 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                  title="Eliminar producto"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resumen de Totales */}
                      {nuevaCompra.productos && nuevaCompra.productos.length > 0 && (
                        <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                          <div className="flex justify-between text-gray-lightest">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(calcularSubtotal())}</span>
                          </div>
                          {nuevaCompra.porcentajeDescuento > 0 && (
                            <div className="flex justify-between text-gray-lightest">
                              <span>Descuento ({nuevaCompra.porcentajeDescuento}%):</span>
                              <span>-${formatCurrency(calcularDescuento(calcularSubtotal()))}</span>
                            </div>
                          )}
                          <hr className="border-gray-medium" />
                          <div className="flex justify-between text-white-primary font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-orange-primary">${formatCurrency(calcularTotal())}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                      <button
                        onClick={() => {
                          setIsDialogOpen(false);
                          setNuevaCompra({
                            ...inicialNuevaCompra,
                            fechaRegistro: generateCurrentDate()
                          });
                        }}
                        className="elegante-button-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateCompra}
                        className="elegante-button-primary"
                        disabled={!nuevaCompra.proveedorSeleccionado || !nuevaCompra.metodoPago || !nuevaCompra.fechaFactura || nuevaCompra.productos.length === 0}
                      >
                        Crear Compra
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar compra por proveedor o ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Compras */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Proveedor</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Fecha</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Total</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedCompras.map((compra) => (
                  <tr key={compra.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">
                        {compra.documento || compra.proveedorDocumento || compra.id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-orange-primary" />
                        <span className="text-gray-lighter">{compra.proveedor}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-lighter">{compra.fecha}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-gray-lighter">${formatCurrency(compra.total)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${getEstadoColor(compra.estado)}`}>
                        {compra.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCompra(compra);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => generatePurchaseReport(compra)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Generar reporte"
                        >
                          <FileDown className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        {compra.estado !== "Anulada" && (
                          <button
                            onClick={() => handleAnularCompra(compra.id)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Anular"
                          >
                            <Ban className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
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

        {/* Dialog de Detalle */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalle de Compra</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                {selectedCompra?.id} - {selectedCompra?.proveedor}
              </DialogDescription>
            </DialogHeader>
            {selectedCompra && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-light">ID de Compra</p>
                    <p className="font-semibold text-orange-primary">{selectedCompra.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Fecha de Registro</p>
                    <p className="font-semibold text-white-primary">{selectedCompra.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Proveedor</p>
                    <p className="font-semibold text-white-primary">{selectedCompra.proveedor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Responsable</p>
                    <p className="font-semibold text-white-primary">{selectedCompra.responsableCompra}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Estado</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedCompra.estado)}`}>
                      {selectedCompra.estado}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-light">Método de Pago</p>
                    <p className={`font-semibold ${getMetodoPagoColor(selectedCompra.metodoPago)}`}>
                      {selectedCompra.metodoPago}
                    </p>
                  </div>
                </div>

                {selectedCompra.productosDetalle && selectedCompra.productosDetalle.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white-primary mb-3">Productos</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedCompra.productosDetalle.map((producto: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                          <div className="flex-1">
                            <span className="text-white-primary font-medium">{producto.nombre}</span>
                            <div className="text-sm text-gray-lightest">
                              Cantidad: {producto.cantidad} | Precio: ${formatCurrency(producto.precio)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-orange-primary font-semibold">
                              ${formatCurrency(producto.cantidad * producto.precio)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-gray-lightest">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(selectedCompra.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-lightest">
                    <span>IVA:</span>
                    <span>${formatCurrency(selectedCompra.iva)}</span>
                  </div>
                  <div className="flex justify-between text-gray-lightest">
                    <span>Descuento:</span>
                    <span>-${formatCurrency(selectedCompra.descuento)}</span>
                  </div>
                  <hr className="border-gray-medium" />
                  <div className="flex justify-between text-white-primary font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-primary">${formatCurrency(selectedCompra.total)}</span>
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