import React, { useState, useMemo } from "react";
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

  Scissors
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { toast } from "sonner";
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
    clienteDocumento: "CC 1012345678",
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
    ],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 },
      { id: "SERV002", nombre: "Arreglo de Barba", precio: 20000 }
    ]
  },
  {
    id: "VNT002",
    cliente: "María Gómez",
    clienteDocumento: "CC 1023456789",
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
    ],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 },
      { id: "SERV003", nombre: "Arreglo de Cejas", precio: 15000 }
    ]
  },
  {
    id: "VNT003",
    cliente: "Carlos Ruiz",
    clienteDocumento: "CC 1034567890",
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
    ],
    serviciosDetalle: [
      { id: "SERV004", nombre: "Paquete Premium Completo", precio: 80000 }
    ]
  },
  {
    id: "VNT004",
    cliente: "Laura Zapata",
    clienteDocumento: "CC 1045678901",
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
    productosDetalle: [],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 },
      { id: "SERV005", nombre: "Tinturado", precio: 30000 }
    ]
  },
  {
    id: "VNT005",
    cliente: "Ana García",
    clienteDocumento: "CC 1056789012",
    fecha: "30-07-2025",
    servicios: "Corte",
    productos: "Champú",
    subtotal: 42017,
    iva: 7983,
    descuento: 0,
    total: 50000,
    barbero: "Miguel Rodriguez",
    estado: "Completada",
    metodoPago: "Efectivo",
    productosDetalle: [
      { id: "PROD001", nombre: "Champú Premium Kerastase", cantidad: 1, precio: 45000 }
    ],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 }
    ]
  },
  {
    id: "VNT006",
    cliente: "Pedro López",
    clienteDocumento: "CC 1067890123",
    fecha: "29-07-2025",
    servicios: "Barba",
    productos: "Aceite",
    subtotal: 33613,
    iva: 6387,
    descuento: 0,
    total: 40000,
    barbero: "Sofia Martinez",
    estado: "Completada",
    metodoPago: "Tarjeta",
    productosDetalle: [
      { id: "PROD008", nombre: "Tónico Capilar", cantidad: 1, precio: 32000 }
    ],
    serviciosDetalle: [
      { id: "SERV002", nombre: "Arreglo de Barba", precio: 20000 }
    ]
  },
  {
    id: "VNT007",
    cliente: "Sofía Mendoza",
    clienteDocumento: "CC 1078901234",
    fecha: "28-07-2025",
    servicios: "Paquete Completo",
    productos: "Varios",
    subtotal: 126050,
    iva: 23950,
    descuento: 0,
    total: 150000,
    barbero: "Miguel Rodriguez",
    estado: "Completada",
    metodoPago: "Transferencia",
    productosDetalle: [
      { id: "PROD002", nombre: "Acondicionador L'Oréal Professional", cantidad: 1, precio: 38000 },
      { id: "PROD009", nombre: "Paños Húmedos", cantidad: 2, precio: 15000 }
    ],
    serviciosDetalle: [
      { id: "SERV004", nombre: "Paquete Completo", precio: 90000 }
    ]
  },
  {
    id: "VNT008",
    cliente: "Roberto Silva",
    clienteDocumento: "CC 1089012345",
    fecha: "27-07-2025",
    servicios: "Corte",
    productos: "Ninguno",
    subtotal: 25210,
    iva: 4790,
    descuento: 0,
    total: 30000,
    barbero: "Sofia Martinez",
    estado: "Completada",
    metodoPago: "Efectivo",
    productosDetalle: [],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 }
    ]
  },
  {
    id: "VNT009",
    cliente: "Carmen Díaz",
    clienteDocumento: "CC 1090123456",
    fecha: "26-07-2025",
    servicios: "Cejas, Depilación",
    productos: "Crema",
    subtotal: 58824,
    iva: 11176,
    descuento: 0,
    total: 70000,
    barbero: "Miguel Rodriguez",
    estado: "Completada",
    metodoPago: "Tarjeta",
    productosDetalle: [
      { id: "PROD007", nombre: "Crema Facial Eucerin", cantidad: 1, precio: 65000 }
    ],
    serviciosDetalle: [
      { id: "SERV003", nombre: "Arreglo de Cejas", precio: 15000 },
      { id: "SERV006", nombre: "Depilación", precio: 25000 }
    ]
  },
  {
    id: "VNT010",
    cliente: "Diego Morales",
    clienteDocumento: "CC 1101234567",
    fecha: "25-07-2025",
    servicios: "Corte, Barba",
    productos: "Cadena",
    subtotal: 88235,
    iva: 16765,
    descuento: 0,
    total: 105000,
    barbero: "Sofia Martinez",
    estado: "Pendiente",
    metodoPago: "Transferencia",
    productosDetalle: [
      { id: "PROD010", nombre: "Cadenas de Acero", cantidad: 1, precio: 75000 }
    ],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 },
      { id: "SERV002", nombre: "Arreglo de Barba", precio: 20000 }
    ]
  },
  {
    id: "VNT011",
    cliente: "Elena Vargas",
    clienteDocumento: "CC 1112345678",
    fecha: "24-07-2025",
    servicios: "Tinturado",
    productos: "Ninguno",
    subtotal: 67227,
    iva: 12773,
    descuento: 0,
    total: 80000,
    barbero: "Miguel Rodriguez",
    estado: "Completada",
    metodoPago: "Efectivo",
    productosDetalle: [],
    serviciosDetalle: [
      { id: "SERV005", nombre: "Tinturado", precio: 55000 }
    ]
  },
  {
    id: "VNT012",
    cliente: "Fernando Castro",
    clienteDocumento: "CC 1123456789",
    fecha: "23-07-2025",
    servicios: "Corte",
    productos: "Gel",
    subtotal: 37815,
    iva: 7185,
    descuento: 0,
    total: 45000,
    barbero: "Sofia Martinez",
    estado: "Anulada",
    metodoPago: "Tarjeta",
    productosDetalle: [
      { id: "PROD003", nombre: "Cera para Cabello", cantidad: 1, precio: 25000 }
    ],
    serviciosDetalle: [
      { id: "SERV001", nombre: "Corte de Cabello", precio: 35000 }
    ]
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
  // Valor especial para representar \"todos los barberos\" en el filtro
  const VALOR_TODOS_BARBEROS = "todos";
  // Valor especial para representar \"sin barbero\" en el formulario de nueva venta
  const VALOR_SIN_BARBERO = "sin-barbero";
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>(VALOR_TODOS_BARBEROS);

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
    clienteDocumento: '',
    servicios: '',
    barbero: VALOR_SIN_BARBERO,
    metodoPago: '',
    fechaCreacion: generateCurrentDate(),
    subtotal: 0,
    descuento: 0,
    porcentajeDescuento: 0,
    productos: [] as Array<{ id: string, nombre: string, cantidad: number, precio: number }>
  };

  // Extraer servicios únicos de ventas anteriores
  const serviciosDisponibles = Array.from(new Set(
    ventasData.flatMap(venta =>
      venta.servicios.split(',').map(servicio => servicio.trim())
    )
  )).filter(servicio => servicio && servicio !== '').sort();

  // Barberos únicos para el filtro de comisiones
  const barberosDisponibles = Array.from(
    new Set(ventas.map((venta) => venta.barbero).filter(Boolean))
  ).sort();

  // Clientes únicos disponibles para asignar a una venta
  const clientesDisponibles = Array.from(
    new Map(
      ventasData.map((venta) => [
        venta.cliente,
        { nombre: venta.cliente, documento: (venta as any).clienteDocumento || '' }
      ])
    ).values()
  );

  const [nuevaVenta, setNuevaVenta] = useState(inicialNuevaVenta);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [isServicioDialogOpen, setIsServicioDialogOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [serviciosAgregados, setServiciosAgregados] = useState<string[]>([]);

  const filteredVentas = ventas.filter((venta) => {
    const matchesSearch =
      venta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBarbero =
      barberoSeleccionado === VALOR_TODOS_BARBEROS ||
      venta.barbero === barberoSeleccionado;

    return matchesSearch && matchesBarbero;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedVentas = filteredVentas.slice(startIndex, startIndex + itemsPerPage);

  // Reset página al filtrar
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Cálculo de totales SOLO sobre servicios de las ventas filtradas del barbero
  const {
    totalServiciosFiltrados,
    totalBarbero,
    totalBarberia,
  } = useMemo(() => {
    // Solo ventas completadas para comisiones
    const ventasParaComision = filteredVentas.filter(
      (venta) =>
        venta.estado === "Completada" &&
        venta.serviciosDetalle &&
        venta.serviciosDetalle.length > 0
    );

    const totalServicios = ventasParaComision.reduce((acum, venta) => {
      const totalServiciosVenta = venta.serviciosDetalle.reduce(
        (suma: number, servicio: any) => suma + (servicio.precio || 0),
        0
      );
      return acum + totalServiciosVenta;
    }, 0);

    const totalBarberoCalc = totalServicios * 0.6;
    const totalBarberiaCalc = totalServicios * 0.4;

    return {
      totalServiciosFiltrados: totalServicios,
      totalBarbero: totalBarberoCalc,
      totalBarberia: totalBarberiaCalc,
    };
  }, [filteredVentas]);

  const getEstadoColor = (estado: string) => {
    // Todos los estados ahora usan el mismo estilo gris uniforme
    return "bg-gray-medium text-gray-lighter";
  };


  const calcularSubtotal = () => {
    if (!nuevaVenta.productos || !Array.isArray(nuevaVenta.productos)) {
      return 0;
    }
    return nuevaVenta.productos.reduce((total, producto) =>
      total + (producto.precio * producto.cantidad), 0
    );
  };

  const calcularDescuento = (subtotal: number) => {
    return subtotal * (nuevaVenta.porcentajeDescuento / 100);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    const descuento = calcularDescuento(subtotal);
    return subtotal - descuento;
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

  const agregarServicio = () => {
    if (!servicioSeleccionado) return;

    if (!serviciosAgregados.includes(servicioSeleccionado)) {
      const nuevosServicios = [...serviciosAgregados, servicioSeleccionado];
      setServiciosAgregados(nuevosServicios);
      setNuevaVenta({
        ...nuevaVenta,
        servicios: nuevosServicios.join(', ')
      });
    }

    setServicioSeleccionado('');
  };

  const eliminarServicio = (servicio: string) => {
    const nuevosServicios = serviciosAgregados.filter(s => s !== servicio);
    setServiciosAgregados(nuevosServicios);
    setNuevaVenta({
      ...nuevaVenta,
      servicios: nuevosServicios.join(', ')
    });
  };

  // Función para abrir el diálogo de detalles
  const handleViewDetails = (venta: any) => {
    setSelectedVenta(venta);
    setIsDetailDialogOpen(true);
  };

  const handleCreateVenta = () => {
    const productosActuales = nuevaVenta.productos || [];
    const tieneServicios = serviciosAgregados.length > 0;

    if (!nuevaVenta.cliente || !nuevaVenta.metodoPago) {
      toast.error("Por favor completa el cliente y el método de pago");
      return;
    }

    if (productosActuales.length === 0 && !tieneServicios) {
      toast.error("Debes agregar al menos un producto o un servicio a la venta");
      return;
    }

    const numeroVenta = `VNT${String(ventas.length + 1).padStart(3, '0')}`;
    const subtotal = calcularSubtotal();
    const iva = calcularIva(subtotal);
    const descuento = calcularDescuento(subtotal);
    const total = calcularTotal();
    const productosTexto = productosActuales.length > 0
      ? productosActuales.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')
      : 'Ninguno';

    const serviciosTexto = tieneServicios
      ? serviciosAgregados.join(', ')
      : 'Ninguno';

    const barberoVenta =
      !nuevaVenta.barbero || nuevaVenta.barbero === VALOR_SIN_BARBERO
        ? ''
        : nuevaVenta.barbero;

    const venta = {
      id: numeroVenta,
      cliente: nuevaVenta.cliente,
      clienteDocumento: nuevaVenta.clienteDocumento || '',
      documento: nuevaVenta.clienteDocumento || '',
      fecha: nuevaVenta.fechaCreacion,
      servicios: serviciosTexto,
      productos: productosTexto,
      subtotal: subtotal,
      iva: iva,
      descuento: descuento,
      total: total,
      barbero: barberoVenta || 'Administrador',
      estado: 'Completada',
      metodoPago: nuevaVenta.metodoPago,
      productosDetalle: productosActuales,
      serviciosDetalle: tieneServicios
        ? serviciosAgregados.map((nombre, index) => ({
          id: `SERVPERS-${index + 1}`,
          nombre,
          precio: 0, // No hay tarifario definido; el total de servicios se gestiona aparte
        }))
        : []
    };

    setVentas([venta, ...ventas]);
    setNuevaVenta({
      ...inicialNuevaVenta,
      fechaCreacion: generateCurrentDate(),
    });
    setServiciosAgregados([]);
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
    // Si la venta está anulada, no se puede cambiar a completada
    if (venta.estado === 'Anulada') {
      toast.error("No es posible activar una venta anulada", {
        style: {
          background: 'var(--color-gray-darkest)',
          border: '1px solid #DC2626',
          color: 'var(--color-white-primary)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: 'rgba(0, 0, 0, 0.5) 0px 4px 12px'
        },
        icon: '🚫',
        duration: 4000,
        description: 'Una vez anulada, una venta no puede ser reactivada por políticas de seguridad.'
      });
      return;
    }

    // Solo permitir cambiar de "Completada" a "Anulada"
    const nuevoEstado = 'Anulada';
    const accion = 'anular';

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
    // Crear el contenido HTML del PDF con la misma estructura del modal de detalle
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Detalle de Venta ${venta.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #fff;
            color: #000;
            line-height: 1.5;
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
          .invoice-subtitle {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
            border: 1px solid #d8b081;
            border-radius: 8px;
            padding: 15px;
            background-color: #f9f9f9;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #d8b081;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #d8b081;
            padding-bottom: 8px;
          }
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .field {
            margin-bottom: 12px;
          }
          .field-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .field-value {
            color: #666;
            padding: 8px 12px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }
          .products-section, .services-section {
            margin-bottom: 20px;
          }
          .item-card {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .item-details {
            flex: 1;
          }
          .item-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }
          .item-description {
            font-size: 12px;
            color: #666;
          }
          .item-price {
            font-weight: bold;
            color: #d8b081;
            font-size: 16px;
          }
          .totals-section {
            background-color: #f8f9fa;
            border: 2px solid #d8b081;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
            font-size: 14px;
          }
          .total-label {
            color: #666;
          }
          .total-value {
            font-weight: bold;
            color: #333;
          }
          .final-total {
            border-top: 2px solid #d8b081;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
          }
          .final-total .total-value {
            color: #d8b081;
            font-size: 20px;
            font-weight: bold;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 12px;
            color: white;
            background-color: ${venta.estado === 'Completada' ? '#10B981' : venta.estado === 'Anulada' ? '#DC2626' : '#d8b081'};
          }
          .additional-info {
            background-color: #f5f5f5;
            border: 1px solid #d8b081;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .empty-state {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 6px;
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
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">BARBERÍA ELEGANTE</div>
          <div class="invoice-title">Detalles de Venta ${venta.id}</div>
          <div class="invoice-subtitle">Información completa de la transacción</div>
        </div>

        <!-- Información básica -->
        <div class="section">
          <div class="section-grid">
            <div class="field">
              <div class="field-label">📋 Número de Venta</div>
              <div class="field-value">${venta.id}</div>
            </div>
            <div class="field">
              <div class="field-label">📅 Fecha de Creación</div>
              <div class="field-value">${venta.fecha}</div>
            </div>
            <div class="field">
              <div class="field-label">👤 Cliente</div>
              <div class="field-value">${venta.cliente}</div>
            </div>
            <div class="field">
              <div class="field-label">💳 Método de Pago</div>
              <div class="field-value">${venta.metodoPago}</div>
            </div>
          </div>
        </div>

        <!-- Productos -->
        <div class="section">
          <div class="section-title">🛍️ Productos</div>
          <div class="products-section">
            ${venta.productosDetalle && venta.productosDetalle.length > 0 ?
        venta.productosDetalle.map((producto: any) => `
                <div class="item-card">
                  <div class="item-details">
                    <div class="item-name">${producto.nombre}</div>
                    <div class="item-description">Cantidad: ${producto.cantidad} × ${formatCurrency(producto.precio)} = ${formatCurrency(producto.cantidad * producto.precio)}</div>
                  </div>
                  <div class="item-price">${formatCurrency(producto.cantidad * producto.precio)}</div>
                </div>
              `).join('') :
        '<div class="empty-state">Ningún producto agregado</div>'
      }
          </div>
        </div>

        <!-- Servicios -->
        <div class="section">
          <div class="section-title">✂️ Servicios</div>
          <div class="services-section">
            ${venta.serviciosDetalle && venta.serviciosDetalle.length > 0 ?
        venta.serviciosDetalle.map((servicio: any) => `
                <div class="item-card">
                  <div class="item-details">
                    <div class="item-name">${servicio.nombre}</div>
                    <div class="item-description">Precio del servicio</div>
                  </div>
                  <div class="item-price">${formatCurrency(servicio.precio)}</div>
                </div>
              `).join('') :
        '<div class="empty-state">Ningún servicio registrado</div>'
      }
          </div>
        </div>

        <!-- Porcentajes -->
        <div class="section">
          <div class="section-title">📊 IVA (%) & Descuento (%)</div>
          <div class="section-grid">
            <div class="field">
              <div class="field-label">📈 IVA (%)</div>
              <div class="field-value">19</div>
            </div>
            <div class="field">
              <div class="field-label">📉 Descuento (%)</div>
              <div class="field-value">${venta.descuento > 0 ? Math.round((venta.descuento / venta.subtotal) * 100) : "0"}</div>
            </div>
          </div>
        </div>

        <!-- Resumen de Totales -->
        <div class="section">
          <div class="section-title">🧮 Resumen de Totales</div>
          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${formatCurrency(venta.subtotal)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">IVA (19%):</span>
              <span class="total-value">${formatCurrency(venta.iva)}</span>
            </div>
            ${venta.descuento > 0 ? `
            <div class="total-row">
              <span class="total-label">Descuento:</span>
              <span class="total-value" style="color: #DC2626;">-${formatCurrency(venta.descuento)}</span>
            </div>
            ` : ''}
            <div class="total-row final-total">
              <span class="total-label">Total:</span>
              <span class="total-value">${formatCurrency(venta.total)}</span>
            </div>
          </div>
        </div>

        <!-- Información Adicional -->
        <div class="additional-info">
          <div class="section-title">📄 Información Adicional</div>
          <div class="info-grid">
            <div>
              <div class="field-label">Barbero asignado:</div>
              <div style="color: #333; font-weight: 500; margin-top: 5px;">${venta.barbero}</div>
            </div>
            <div>
              <div class="field-label">Estado de la venta:</div>
              <div style="margin-top: 8px;">
                <span class="status-badge">${venta.estado}</span>
              </div>
            </div>
          </div>
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

        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="elegante-card text-center">
            <DollarSign className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">${formatCurrency(totalVentas)}</h4>
            <p className="text-gray-lightest text-sm">Total Ventas</p>
          </div>
          <div className="elegante-card text-center">
            <ShoppingCart className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{ventasCompletadas}</h4>
            <p className="text-gray-lightest text-sm">Completadas</p>
          </div>
          <div className="elegante-card text-center">
            <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{ventasHoy}</h4>
            <p className="text-gray-lightest text-sm">Ventas Hoy</p>
          </div>
          <div className="elegante-card text-center">
            <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              ${formatCurrency(Math.round(totalVentas / ventas.length))}
            </h4>
            <p className="text-gray-lightest text-sm">Promedio</p>
          </div>
        </div>

        {/* Sección Principal */}
        <div className="elegante-card">
          {/* Barra de Controles */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-dark">
            {/* Lado izquierdo: botón + búsqueda + filtro de barbero */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Botón Nueva Venta */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className="elegante-button-primary gap-2 flex items-center"
                    onClick={() => {
                      setNuevaVenta({
                        ...inicialNuevaVenta,
                        fechaCreacion: generateCurrentDate()
                      });
                      setServiciosAgregados([]);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Venta
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {/* Información Principal */}
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

                    {/* Cliente y Método de Pago */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          Cliente *
                        </Label>
                        <Select
                          value={nuevaVenta.cliente}
                          onValueChange={(value) => {
                            const cliente = clientesDisponibles.find((c) => c.nombre === value);
                            setNuevaVenta({
                              ...nuevaVenta,
                              cliente: value,
                              clienteDocumento: cliente?.documento || ''
                            });
                          }}
                        >
                          <SelectTrigger className="elegante-input">
                            <SelectValue placeholder="Selecciona el cliente" />
                          </SelectTrigger>
                          <SelectContent className="elegante-card">
                            {clientesDisponibles.map((cliente) => (
                              <SelectItem key={cliente.nombre} value={cliente.nombre}>
                                {cliente.nombre}{cliente.documento ? ` — ${cliente.documento}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-orange-primary" />
                          Método de Pago *
                        </Label>
                        <Select value={nuevaVenta.metodoPago} onValueChange={(value) => setNuevaVenta({ ...nuevaVenta, metodoPago: value })}>
                          <SelectTrigger className="elegante-input">
                            <SelectValue placeholder="Selecciona el método de pago" />
                          </SelectTrigger>
                          <SelectContent className="elegante-card">
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Descuento */}
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-orange-primary" />
                        Porcentaje Descuento (%)
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

                    {/* Agregar Productos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white-primary">Agregar Productos</h3>
                      <div className="grid grid-cols-3 gap-4">
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
                                {producto.nombre} - ${formatCurrency(producto.precio)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Hash className="w-4 h-4 text-orange-primary" />
                            Cantidad
                          </Label>
                          <Input
                            type="number"
                            value={cantidadProducto}
                            onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                            className="elegante-input"
                            min="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary">ㅤ</Label>
                          <button
                            onClick={agregarProducto}
                            disabled={!productoSeleccionado || cantidadProducto <= 0}
                            className="elegante-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Agregar producto
                          </button>
                        </div>
                      </div>

                      {/* Lista de Productos Agregados */}
                      {nuevaVenta.productos && nuevaVenta.productos.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-md font-medium text-white-primary">Productos Agregados:</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {nuevaVenta.productos.map((producto, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                                <div className="flex-1">
                                  <span className="text-white-primary font-medium">{producto.nombre}</span>
                                  <div className="text-sm text-gray-lightest">
                                    Cantidad: {producto.cantidad} | Precio: ${formatCurrency(producto.precio)} |
                                    Subtotal: ${formatCurrency(producto.precio * producto.cantidad)}
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
                    </div>

                    {/* Agregar Servicios */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white-primary">Agregar Servicios</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Barbero (opcional) */}
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <User className="w-4 h-4 text-orange-primary" />
                            Barbero (opcional)
                          </Label>
                          <Select
                            value={nuevaVenta.barbero}
                            onValueChange={(value) =>
                              setNuevaVenta({ ...nuevaVenta, barbero: value })
                            }
                          >
                            <SelectTrigger className="elegante-input bg-gray-darker border-gray-dark">
                              <SelectValue placeholder="Sin barbero asignado" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-darkest border border-gray-dark text-white-primary">
                              <SelectItem value={VALOR_SIN_BARBERO}>Sin barbero</SelectItem>
                              {barberosDisponibles.map((barbero) => (
                                <SelectItem key={barbero} value={barbero}>
                                  {barbero}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Servicio */}
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-orange-primary" />
                            Servicios
                          </Label>
                          <select
                            value={servicioSeleccionado}
                            onChange={(e) => setServicioSeleccionado(e.target.value)}
                            className="elegante-input w-full"
                          >
                            <option value="">Seleccionar servicio...</option>
                            {serviciosDisponibles.map((servicio, index) => (
                              <option key={index} value={servicio}>{servicio}</option>
                            ))}
                          </select>
                        </div>

                        {/* Botón agregar servicio */}
                        <div className="space-y-2">
                          <Label className="text-white-primary">ㅤ</Label>
                          <button
                            onClick={agregarServicio}
                            disabled={!servicioSeleccionado}
                            className="elegante-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Agregar Servicio
                          </button>
                        </div>
                      </div>

                      {/* Lista de Servicios Agregados */}
                      {serviciosAgregados.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-md font-medium text-white-primary">Servicios Agregados:</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {serviciosAgregados.map((servicio, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                                <div className="flex-1">
                                  <span className="text-white-primary font-medium">{servicio}</span>
                                </div>
                                <button
                                  onClick={() => eliminarServicio(servicio)}
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
                    {((nuevaVenta.productos && nuevaVenta.productos.length > 0) || serviciosAgregados.length > 0) && (
                      <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-gray-lightest">
                          <span>Subtotal:</span>
                          <span>${formatCurrency(calcularSubtotal())}</span>
                        </div>
                        {nuevaVenta.porcentajeDescuento > 0 && (
                          <div className="flex justify-between text-gray-lightest">
                            <span>Descuento ({nuevaVenta.porcentajeDescuento}%):</span>
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

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                      <button
                        onClick={() => setIsDialogOpen(false)}
                        className="elegante-button-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateVenta}
                        className="elegante-button-primary"
                      >
                        Registrar Venta
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                  <Input
                    placeholder="Buscar por cliente o ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="elegante-input pl-11 w-80"
                  />
                </div>

                {/* Filtro de barbero */}
                <div className="flex items-center gap-2">
                  <Label className="text-gray-lightest text-sm flex items-center gap-1">
                    <User className="w-4 h-4 text-orange-primary" />
                    Barbero
                  </Label>
                  <Select
                    value={barberoSeleccionado}
                    onValueChange={(value) => {
                      setBarberoSeleccionado(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-52 elegante-input bg-gray-darker border-gray-dark">
                      <SelectValue placeholder="Todos los barberos" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-darkest border border-gray-dark text-white-primary">
                      <SelectItem value={VALOR_TODOS_BARBEROS}>Todos</SelectItem>
                      {barberosDisponibles.map((barbero) => (
                        <SelectItem key={barbero} value={barbero}>
                          {barbero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lado derecho: resumen de comisiones + contador */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {barberoSeleccionado !== VALOR_TODOS_BARBEROS && (
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <span className="px-3 py-1 rounded-full bg-gray-darker border border-gray-dark text-gray-lightest">
                      Total servicios:{" "}
                      <span className="text-orange-primary font-semibold">
                        ${formatCurrency(totalServiciosFiltrados)}
                      </span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-darker border border-gray-dark text-gray-lightest">
                      60% Barbero:{" "}
                      <span className="text-green-400 font-semibold">
                        ${formatCurrency(totalBarbero)}
                      </span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-darker border border-gray-dark text-gray-lightest">
                      40% Barbería:{" "}
                      <span className="text-blue-300 font-semibold">
                        ${formatCurrency(totalBarberia)}
                      </span>
                    </span>
                  </div>
                )}
                <div className="text-xs sm:text-sm text-gray-lightest sm:ml-2">
                  Mostrando {displayedVentas.length} de {filteredVentas.length} ventas
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Ventas */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Cliente</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Total</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Método</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Barbero</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedVentas.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">
                        {venta.documento || venta.clienteDocumento || venta.id}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-gray-lighter">{venta.cliente}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{venta.fecha}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">${formatCurrency(venta.total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">
                        {venta.metodoPago}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lightest">{venta.barbero}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedVenta(venta);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        {venta.estado === 'Completada' && (
                          <button
                            onClick={() => handleToggleEstado(venta)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Anular venta"
                          >
                            <Ban className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          </button>
                        )}
                        {venta.estado === 'Anulada' && (
                          <button
                            onClick={() => handleToggleEstado(venta)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group opacity-50 cursor-not-allowed"
                            title="No se puede reactivar una venta anulada"
                          >
                            <Ban className="w-4 h-4 text-gray-lightest" />
                          </button>
                        )}
                        <button
                          onClick={() => generateVentaPDF(venta)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Generar PDF"
                        >
                          <Download className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación Funcional */}
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

          {/* Sin resultados */}
          {filteredVentas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-lightest mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron ventas</h3>
                <p className="text-sm">
                  {searchTerm
                    ? `No hay ventas que coincidan con "${searchTerm}"`
                    : "No hay ventas registradas en el sistema"
                  }
                </p>
              </div>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="elegante-button-secondary mt-4"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>

        {/* Diálogo de Detalles de Venta */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-primary" />
                Detalles de Venta {selectedVenta?.id}
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa de la transacción
              </DialogDescription>
            </DialogHeader>
            {selectedVenta && (
              <div className="space-y-6 pt-4">
                {/* Información Principal de la Venta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white-primary flex items-center gap-2">
                      <Hash className="w-4 h-4 text-orange-primary" />
                      Número de Venta
                    </Label>
                    <Input
                      value={selectedVenta.id}
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
                      value={selectedVenta.fecha}
                      disabled
                      className="elegante-input bg-gray-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white-primary flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-primary" />
                      Cliente
                    </Label>
                    <Input
                      value={selectedVenta.cliente}
                      disabled
                      className="elegante-input bg-gray-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white-primary flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-primary" />
                      Método de Pago
                    </Label>
                    <Input
                      value={selectedVenta.metodoPago}
                      disabled
                      className="elegante-input bg-gray-medium"
                    />
                  </div>
                </div>

                {/* Productos Detallados */}
                <div className="space-y-4">
                  <Label className="text-white-primary flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-orange-primary" />
                    Productos
                  </Label>
                  {selectedVenta.productosDetalle && selectedVenta.productosDetalle.length > 0 ? (
                    <div className="space-y-2">
                      {selectedVenta.productosDetalle.map((producto: any, index: number) => (
                        <div key={index} className="bg-gray-darker p-3 rounded-lg border border-gray-dark">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-white-primary font-medium">{producto.nombre}</span>
                              <div className="text-gray-lightest text-sm">
                                Cantidad: {producto.cantidad} × ${formatCurrency(producto.precio)} = ${formatCurrency(producto.cantidad * producto.precio)}
                              </div>
                            </div>
                            <div className="text-orange-primary font-medium">
                              ${formatCurrency(producto.cantidad * producto.precio)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-darker p-3 rounded-lg border border-gray-dark text-center">
                      <span className="text-gray-lightest">Ningún producto agregado</span>
                    </div>
                  )}
                </div>

                {/* Servicios Detallados */}
                <div className="space-y-4">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-orange-primary" />
                    Servicios
                  </Label>
                  {selectedVenta.serviciosDetalle && selectedVenta.serviciosDetalle.length > 0 ? (
                    <div className="space-y-2">
                      {selectedVenta.serviciosDetalle.map((servicio: any, index: number) => (
                        <div key={index} className="bg-gray-darker p-3 rounded-lg border border-gray-dark">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-white-primary font-medium">{servicio.nombre}</span>
                              <div className="text-gray-lightest text-sm">
                                Precio del servicio
                              </div>
                            </div>
                            <div className="text-orange-primary font-medium">
                              ${formatCurrency(servicio.precio)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-darker p-3 rounded-lg border border-gray-dark text-center">
                      <span className="text-gray-lightest">Ningún servicio registrado</span>
                    </div>
                  )}
                </div>

                {/* Distribución de ganancias (solo servicios) */}
                {selectedVenta.serviciosDetalle && selectedVenta.serviciosDetalle.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white-primary flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-primary" />
                      Distribución de ganancias (solo servicios)
                    </Label>
                    {(() => {
                      const totalServiciosVenta = selectedVenta.serviciosDetalle.reduce(
                        (acum: number, servicio: any) => acum + (servicio.precio || 0),
                        0
                      );
                      const totalBarberoVenta = totalServiciosVenta * 0.6;
                      const totalBarberiaVenta = totalServiciosVenta * 0.4;
                      return (
                        <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-lightest">Total servicios:</span>
                            <span className="text-orange-primary font-semibold">
                              ${formatCurrency(totalServiciosVenta)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-lightest">60% Barbero:</span>
                            <span className="text-green-400 font-semibold">
                              ${formatCurrency(totalBarberoVenta)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-lightest">40% Barbería:</span>
                            <span className="text-blue-300 font-semibold">
                              ${formatCurrency(totalBarberiaVenta)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Porcentajes de IVA y Descuento */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white-primary flex items-center gap-2">
                      <Percent className="w-4 h-4 text-orange-primary" />
                      IVA (%)
                    </Label>
                    <Input
                      value="19"
                      disabled
                      className="elegante-input bg-gray-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white-primary flex items-center gap-2">
                      <Percent className="w-4 h-4 text-orange-primary" />
                      Descuento (%)
                    </Label>
                    <Input
                      value={selectedVenta.descuento > 0 ? Math.round((selectedVenta.descuento / selectedVenta.subtotal) * 100) : "0"}
                      disabled
                      className="elegante-input bg-gray-medium"
                    />
                  </div>
                </div>

                {/* Resumen de Totales */}
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-orange-primary" />
                    Resumen de Totales
                  </Label>
                  <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-lightest">Subtotal:</span>
                        <span className="text-white-primary font-medium">${formatCurrency(selectedVenta.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-lightest">IVA (19%):</span>
                        <span className="text-white-primary font-medium">${formatCurrency(selectedVenta.iva)}</span>
                      </div>
                      {selectedVenta.descuento > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-lightest">Descuento:</span>
                          <span className="text-red-400 font-medium">-${formatCurrency(selectedVenta.descuento)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-dark pt-3">
                        <div className="flex justify-between text-lg">
                          <span className="text-white-primary font-bold">Total:</span>
                          <span className="text-orange-primary font-bold">${formatCurrency(selectedVenta.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                  <h4 className="text-white-primary mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-primary" />
                    Información Adicional
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-lightest">Barbero asignado:</span>
                      <p className="text-white-primary font-medium">{selectedVenta.barbero}</p>
                    </div>
                    <div>
                      <span className="text-gray-lightest">Estado de la venta:</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(selectedVenta.estado)}`}>
                          {selectedVenta.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2 pt-4 border-t border-gray-dark">
                  <button
                    onClick={() => generateVentaPDF(selectedVenta)}
                    className="elegante-button-primary flex-1 gap-2 flex items-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Generar PDF
                  </button>
                  <button
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="elegante-button-secondary flex-1"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertContainer />
        <DoubleConfirmationContainer />
      </main>
    </>
  );
}