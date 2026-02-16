import React, { useState, useEffect } from "react";
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
  Boxes,
  Pencil
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useDoubleConfirmation } from "../ui/double-confirmation";
import { useCustomAlert } from "../ui/custom-alert";
import { compraService, Compra, CreateCompraRequest, DetalleCompra } from "../../services/compraService";
import { proveedorService, Proveedor } from "../../services/proveedorService";
import { insumosService, Insumo } from "../../services/insumosService";

// Función para formatear moneda colombiana con puntos para separar miles
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

export function ComprasPage() {
  const { confirmDeleteAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const { created, AlertContainer } = useCustomAlert();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Insumo[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [loading, setLoading] = useState(false);

  // Función para generar fecha automática (solo visualización o defaults)
  const generateCurrentDate = () => {
    return new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const inicialNuevaCompra = {
    proveedorId: 0,
    metodoPago: '',
    fechaRegistro: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    fechaFactura: '',
    porcentajeDescuento: 0,
    productos: [] as Array<{
      id: number,
      nombre: string,
      cantidad: number,
      precio: number,
      stockVentas: number,
      stockInsumos: number
    }>
  };

  const [nuevaCompra, setNuevaCompra] = useState(inicialNuevaCompra);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);
  const [stockVentas, setStockVentas] = useState(0);
  const [stockInsumos, setStockInsumos] = useState(0);

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [comprasData, proveedoresData, productosData] = await Promise.all([
        compraService.getCompras(),
        proveedorService.obtenerProveedoresJuridicos(), // Assuming we want basic provider list
        insumosService.getInsumos()
      ]);
      setCompras(comprasData);
      setProveedores(proveedoresData);
      setProductos(productosData);
    } catch (error) {
      toast.error("Error al cargar datos", { description: "No se pudieron obtener los datos actualizados." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCompras = compras.filter(compra =>
    (compra.proveedorNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (compra.numeroFactura || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (compra.numeroCompra || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCompras = filteredCompras.slice(startIndex, startIndex + itemsPerPage);

  const getEstadoColor = (estado: string) => {
    return "bg-gray-medium text-gray-lighter";
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

  // Al seleccionar producto, actualizar precio unitario sugerido
  useEffect(() => {
    if (productoSeleccionado) {
      const prod = productos.find(p => p.id === Number(productoSeleccionado));
      if (prod) {
        setPrecioUnitario(prod.precio);
      }
    }
  }, [productoSeleccionado, productos]);

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) return;

    const producto = productos.find(p => p.id === Number(productoSeleccionado));
    if (!producto) return;

    // Validación de stock es opcional en compras o requerida según lógica de negocio.
    if (stockVentas + stockInsumos !== cantidadProducto) {
      toast.error("Error en distribución", "La suma de Stock Ventas y Entregas debe ser igual a la Cantidad Total");
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
              precio: precioUnitario,
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
          precio: precioUnitario,
          stockVentas: stockVentas,
          stockInsumos: stockInsumos
        }]
      });
    }

    setProductoSeleccionado('');
    setCantidadProducto(1);
    setPrecioUnitario(0);
    setStockVentas(0);
    setStockInsumos(0);
  };

  const eliminarProducto = (productId: number) => {
    const productosActuales = nuevaCompra.productos || [];
    setNuevaCompra({
      ...nuevaCompra,
      productos: productosActuales.filter(p => p.id !== productId)
    });
  };

  const handleViewDetails = async (compra: Compra) => {
    try {
      // Show dialog immediately or loading state
      const detalles = await compraService.getDetallesPorCompra(compra.id);
      setSelectedCompra({ ...compra, detalles: detalles });
      setIsDetailDialogOpen(true);
    } catch (error) {
      toast.error("Error al cargar detalles de la compra");
    }
  };

  const handleCreateCompra = async () => {
    if (!nuevaCompra.proveedorId || !nuevaCompra.metodoPago || !nuevaCompra.fechaFactura || nuevaCompra.productos.length === 0) {
      toast.error("Por favor completa todos los campos obligatorios y agrega al menos un producto");
      return;
    }

    const subtotal = calcularSubtotal();
    const descuento = calcularDescuento(subtotal);
    const total = calcularTotal();

    const compraRequest: CreateCompraRequest = {
      proveedorId: Number(nuevaCompra.proveedorId),
      fecha: new Date().toISOString(), // Fecha actual como registro
      fechaFactura: nuevaCompra.fechaFactura,
      metodoPago: nuevaCompra.metodoPago,
      // subtotal and total removed as per API requirement
      iva: 0,
      descuento: descuento,
      usuarioId: 1, // Harcoded 
      detalles: nuevaCompra.productos.map(p => ({
        productoId: p.id,
        cantidad: p.cantidad,
        precioUnitario: p.precio
      }))
    };

    try {
      await compraService.createCompra(compraRequest);
      created("Compra creada ✔️", `La compra ha sido registrada exitosamente por ${formatCurrency(total)}.`);
      setIsDialogOpen(false);
      setNuevaCompra(inicialNuevaCompra);
      loadData();
    } catch (error) {
      toast.error("Error al crear compra", { description: "Hubo un problema al guardar la compra." });
      console.error(error);
    }
  };

  const handleAnularCompra = (compraId: number) => {
    const compra = compras.find(c => c.id === compraId);
    if (!compra) return;

    confirmDeleteAction(
      String(compraId),
      async () => {
        try {
          await compraService.anularCompra(compraId);
          toast.success("Compra anulada", { description: `La compra ${compra.numeroCompra} ha sido anulada.` });
          loadData();
        } catch (error) {
          toast.error("Error al anular", { description: "No se pudo anular la compra." });
        }
      },
      {
        confirmTitle: "Confirmar Anulación",
        confirmMessage: `¿Estás seguro de que deseas anular la compra?`,
        successTitle: "Compra anulada ✔️",
        successMessage: `La compra ha sido anulada exitosamente.`,
        requireInput: false
      }
    );
  };

  const generatePurchaseReport = async (compra: Compra) => {
    let productosDetalle = compra.detalles || [];

    if (productosDetalle.length === 0) {
      try {
        const toastId = toast.loading("Obteniendo detalles para el reporte...");
        productosDetalle = await compraService.getDetallesPorCompra(compra.id);
        toast.dismiss(toastId);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los productos para el reporte.");
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Compra - ${compra.numeroCompra}</title>
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
              <div class="info-value">${(compra.numeroCompra || '').replace(/^(FC|CPR)-?/i, '')}</div>
            </div>
             <div class="info-item">
              <div class="info-label">N factura:</div>
              <div class="info-value">${(compra.numeroFactura || 'N/A').replace(/^(FC|CPR)-?/i, '')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado:</div>
              <div class="info-value">${compra.estado}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Proveedor:</div>
              <div class="info-value">${compra.proveedorNombre}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Responsable:</div>
              <div class="info-value">${compra.responsableNombre}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Registro:</div>
              <div class="info-value">${new Date(compra.fecha).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Factura:</div>
              <div class="info-value">${compra.fechaFactura ? new Date(compra.fechaFactura).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Método de Pago:</div>
              <div class="info-value">${compra.metodoPago}</div>
            </div>
          </div>
        </div>

        ${productosDetalle.length > 0 ? `
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
              ${productosDetalle.map((producto) => `
                <tr>
                  <td>${producto.productoNombre}</td>
                  <td>${producto.cantidad}</td>
                  <td>${formatCurrency(producto.precioUnitario)}</td>
                  <td>${formatCurrency(producto.subtotal || 0)}</td>
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

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Compra_${compra.numeroCompra || compra.id}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Reporte HTML generado exitosamente");
  };

  return (
    <>
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Compras</h1>
            <p className="text-sm text-gray-lightest mt-1">Control y seguimiento de compras a proveedores</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats removed/hidden */}
        </div>

        <div className="elegante-card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            <div className="flex flex-wrap items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center"
                    onClick={() => {
                      setNuevaCompra({
                        ...inicialNuevaCompra,
                        fechaRegistro: new Date().toISOString().split('T')[0]
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Hash className="w-4 h-4 text-orange-primary" />
                          Número de Compra (Automático)
                        </Label>
                        <Input
                          value="###"
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Building className="w-4 h-4 text-orange-primary" />
                          Proveedor *
                        </Label>
                        <select
                          value={nuevaCompra.proveedorId}
                          onChange={(e) => setNuevaCompra({ ...nuevaCompra, proveedorId: Number(e.target.value) })}
                          className="elegante-input w-full"
                        >
                          <option value="0">Seleccionar proveedor...</option>
                          {proveedores.map(proveedor => (
                            <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
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

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white-primary">Agregar Productos</h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
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
                            {productos.map(producto => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre} - ${formatCurrency(producto.precio)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            Precio Unitario (Compra)
                          </Label>
                          <Input
                            type="number"
                            value={precioUnitario}
                            onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                            className="elegante-input"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                          setNuevaCompra(inicialNuevaCompra);
                        }}
                        className="elegante-button-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateCompra}
                        className="elegante-button-primary"
                        disabled={!nuevaCompra.proveedorId || !nuevaCompra.metodoPago || !nuevaCompra.fechaFactura || nuevaCompra.productos.length === 0}
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
                  placeholder="Buscar compra por proveedor o factura"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-white-primary text-center py-8">Cargando compras...</div>
            ) : (
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
                  {displayedCompras.length > 0 ? displayedCompras.map((compra) => (
                    <tr key={compra.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">
                          {(compra.numeroFactura || compra.numeroCompra || String(compra.id)).replace(/^(FC|CPR)-?/i, '')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-orange-primary" />
                          <span className="text-gray-lighter">{compra.proveedorNombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-lighter">{new Date(compra.fecha).toLocaleDateString()}</span>
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
                            onClick={() => handleViewDetails(compra)}
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
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-lighter">No se encontraron compras.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl text-white-primary">
            {selectedCompra && (
              <>
                <DialogHeader className="border-b border-gray-dark pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-xl font-bold">Detalle de Compra</DialogTitle>
                      <DialogDescription className="text-gray-400 mt-1">
                        {(selectedCompra.numeroCompra || '').replace(/^(FC|CPR)-?/i, '')} - {selectedCompra.proveedorNombre}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12 text-sm">
                    <div>
                      <span className="block text-gray-500 mb-1">ID de Compra</span>
                      <span className="font-semibold text-orange-primary">{(selectedCompra.numeroCompra || '').replace(/^(FC|CPR)-?/i, '')}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Fecha de Registro</span>
                      <span className="font-semibold">{new Date(selectedCompra.fecha).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Proveedor</span>
                      <span className="font-semibold">{selectedCompra.proveedorNombre}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Responsable</span>
                      <span className="font-semibold">{selectedCompra.responsableNombre}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Estado</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(selectedCompra.estado)}`}>
                        {selectedCompra.estado}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Método de Pago</span>
                      <span className="font-semibold">{selectedCompra.metodoPago}</span>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div>
                    <h3 className="font-semibold mb-3">Productos</h3>
                    <div className="space-y-2">
                      {(selectedCompra.detalles || []).map((detalle, idx) => (
                        <div key={idx} className="bg-gray-darker p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="font-medium">{detalle.productoNombre}</div>
                            <div className="text-sm text-gray-500">
                              Cantidad: {detalle.cantidad} | Precio: ${formatCurrency(detalle.precioUnitario)}
                            </div>
                          </div>
                          <div className="text-orange-primary font-semibold">
                            ${formatCurrency(detalle.cantidad * detalle.precioUnitario)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal:</span>
                      <span>${formatCurrency(selectedCompra.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>IVA:</span>
                      <span>${formatCurrency(selectedCompra.iva)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Descuento:</span>
                      <span>-${formatCurrency(selectedCompra.descuento)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-dark mt-2">
                      <span>Total:</span>
                      <span className="text-orange-primary">${formatCurrency(selectedCompra.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="px-6 py-2 bg-orange-primary hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <DoubleConfirmationContainer />
      <AlertContainer />
    </>
  );
}