import React, { useState } from "react";
import { Input } from "../ui/input";
import {
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  X,
  ShoppingBag,
  Hash,
  User,
  HandHelping,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Ban,
  XCircle,
  Edit2,
  Clock,
  Truck
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";

import { toast } from "sonner";
import { useDoubleConfirmation } from "../ui/double-confirmation";

// Función para formatear moneda colombiana con puntos para separar miles
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

// Datos de barberos
const barberosData: Barbero[] = [
  { id: "BARB001", nombre: "Miguel Rodriguez", telefono: "+57 300 123 4567", especialidad: "Cortes Clásicos", estado: "Activo", ultimaEntrega: "15-08-2025", documento: "CC 2012345678" },
  { id: "BARB002", nombre: "Sofia Martinez", telefono: "+57 301 234 5678", especialidad: "Cortes Femeninos", estado: "Activo", ultimaEntrega: "12-08-2025", documento: "CC 2023456789" },
  { id: "BARB003", nombre: "Carlos Ruiz", telefono: "+57 302 345 6789", especialidad: "Barbería Tradicional", estado: "Activo", ultimaEntrega: "10-08-2025", documento: "CC 2034567890" },
  { id: "BARB004", nombre: "Ana Herrera", telefono: "+57 303 456 7890", especialidad: "Estilismo Avanzado", estado: "Activo", ultimaEntrega: "08-08-2025", documento: "CC 2045678901" },
  { id: "BARB005", nombre: "Luis Torres", telefono: "+57 304 567 8901", especialidad: "Barba y Bigote", estado: "Inactivo", ultimaEntrega: "05-08-2025", documento: "CC 2056789012" }
];

// Datos de insumos disponibles
const insumosDisponibles: Insumo[] = [
  { id: "INS001", nombre: "Champú Premium Kerastase", categoria: "Cuidado Capilar", stock: 45, minimo: 10, precio: 35000 },
  { id: "INS002", nombre: "Acondicionador L'Oréal Professional", categoria: "Cuidado Capilar", stock: 32, minimo: 8, precio: 28000 },
  { id: "INS003", nombre: "Cera para Cabello", categoria: "Styling", stock: 28, minimo: 15, precio: 18000 },
  { id: "INS004", nombre: "Gel Fijador Fuerte", categoria: "Styling", stock: 6, minimo: 12, precio: 15000 },
  { id: "INS005", nombre: "Aceite de Barba", categoria: "Barba", stock: 22, minimo: 8, precio: 25000 },
  { id: "INS006", nombre: "Tijeras Profesionales", categoria: "Herramientas", stock: 12, minimo: 5, precio: 120000 },
  { id: "INS007", nombre: "Máquina de Cortar", categoria: "Herramientas", stock: 8, minimo: 3, precio: 150000 },
  { id: "INS008", nombre: "Toallas Desechables", categoria: "Suministros", stock: 3, minimo: 20, precio: 12000 },
  { id: "INS009", nombre: "Spray Desinfectante", categoria: "Higiene", stock: 18, minimo: 10, precio: 8000 },
  { id: "INS010", nombre: "Talco en Polvo", categoria: "Finishing", stock: 25, minimo: 8, precio: 6000 }
];

// Tipos de datos
interface Barbero {
  id: string;
  nombre: string;
  telefono: string;
  especialidad: string;
  estado: string;
  ultimaEntrega: string;
}

interface Insumo {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  precio: number;
}

interface Entrega {
  id: string;
  barbero: string;
  barberoId: string;
  fecha: string;
  hora: string;
  cantidadTotal: number;
  valorTotal: number;
  estado: string;
  responsable: string;
  insumosDetalle: InsumoEntrega[];
}

interface InsumoEntrega {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precio: number;
}

// Estados disponibles para las entregas - Solo dos estados
const ESTADOS_ENTREGA = [
  { value: 'Entregado', label: 'Entregado', color: 'bg-green-600' },
  { value: 'Anulado', label: 'Anulado', color: 'bg-red-600' }
];

// Datos de entregas históricas con solo dos estados
const entregasHistorial: Entrega[] = [
  {
    id: "ENT001",
    barbero: "Miguel Rodriguez",
    barberoId: "BARB001",
    barberoDocumento: "CC 2012345678",
    fecha: "15-08-2025",
    hora: "09:30",
    cantidadTotal: 8,
    valorTotal: 142000,
    estado: "Entregado",
    responsable: "Admin Principal",
    insumosDetalle: [
      { id: "INS001", nombre: "Champú Premium Kerastase", categoria: "Cuidado Capilar", cantidad: 3, precio: 35000 },
      { id: "INS003", nombre: "Cera para Cabello", categoria: "Styling", cantidad: 5, precio: 18000 }
    ]
  },
  {
    id: "ENT002",
    barbero: "Sofia Martinez",
    barberoId: "BARB002",
    barberoDocumento: "CC 2023456789",
    fecha: "12-08-2025",
    hora: "14:15",
    cantidadTotal: 6,
    valorTotal: 173000,
    estado: "Entregado",
    responsable: "Admin Principal",
    insumosDetalle: [
      { id: "INS002", nombre: "Acondicionador L'Oréal Professional", categoria: "Cuidado Capilar", cantidad: 2, precio: 28000 },
      { id: "INS005", nombre: "Aceite de Barba", categoria: "Barba", cantidad: 3, precio: 25000 },
      { id: "INS006", nombre: "Tijeras Profesionales", categoria: "Herramientas", cantidad: 1, precio: 120000 }
    ]
  },
  {
    id: "ENT003",
    barbero: "Carlos Ruiz",
    barberoId: "BARB003",
    barberoDocumento: "CC 2034567890",
    fecha: "10-08-2025",
    hora: "11:00",
    cantidadTotal: 12,
    valorTotal: 96000,
    estado: "Entregado",
    responsable: "Admin Principal",
    insumosDetalle: [
      { id: "INS004", nombre: "Gel Fijador Fuerte", categoria: "Styling", cantidad: 6, precio: 15000 },
      { id: "INS009", nombre: "Spray Desinfectante", categoria: "Higiene", cantidad: 6, precio: 8000 }
    ]
  },
  {
    id: "ENT004",
    barbero: "Ana Herrera",
    barberoId: "BARB004",
    barberoDocumento: "CC 2045678901",
    fecha: "08-08-2025",
    hora: "16:45",
    cantidadTotal: 4,
    valorTotal: 162000,
    estado: "Entregado",
    responsable: "Admin Principal",
    insumosDetalle: [
      { id: "INS007", nombre: "Máquina de Cortar", categoria: "Herramientas", cantidad: 1, precio: 150000 },
      { id: "INS008", nombre: "Toallas Desechables", categoria: "Suministros", cantidad: 3, precio: 12000 }
    ]
  },
  {
    id: "ENT005",
    barbero: "Miguel Rodriguez",
    barberoId: "BARB001",
    barberoDocumento: "CC 2012345678",
    fecha: "05-08-2025",
    hora: "10:20",
    cantidadTotal: 15,
    valorTotal: 108000,
    estado: "Anulado",
    responsable: "Admin Secundario",
    insumosDetalle: [
      { id: "INS010", nombre: "Talco en Polvo", categoria: "Finishing", cantidad: 12, precio: 6000 },
      { id: "INS003", nombre: "Cera para Cabello", categoria: "Styling", cantidad: 3, precio: 18000 }
    ]
  }
];

export function EntregaInsumosPage() {
  const { confirmCreateAction, confirmDeleteAction, DoubleConfirmationContainer } = useDoubleConfirmation();

  const [barberos] = useState<Barbero[]>(barberosData);
  const [insumos, setInsumos] = useState<Insumo[]>(insumosDisponibles);
  const [entregas, setEntregas] = useState<Entrega[]>(entregasHistorial);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEstadoDialogOpen, setIsEstadoDialogOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [entregaToChangeStatus, setEntregaToChangeStatus] = useState<Entrega | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Estado para nueva entrega
  const inicialNuevaEntrega = {
    barberoSeleccionado: '',
    fechaEntrega: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    insumos: [] as InsumoEntrega[]
  };

  const [nuevaEntrega, setNuevaEntrega] = useState(inicialNuevaEntrega);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState('');
  const [cantidadInsumo, setCantidadInsumo] = useState(1);

  // Filtros y paginación
  const filteredEntregas = entregas.filter(entrega =>
    entrega.barbero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entrega.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntregas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedEntregas = filteredEntregas.slice(startIndex, startIndex + itemsPerPage);

  // Funciones auxiliares
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Entregado": return "bg-green-600 text-white";
      case "Anulado": return "bg-red-600 text-white";
      default: return "bg-gray-medium text-white";
    }
  };

  const getStockColor = (stock: number, minimo: number) => {
    if (stock === 0) return "text-red-500";
    if (stock <= minimo) return "text-orange-secondary";
    return "text-green-500";
  };

  const agregarInsumo = () => {
    if (!insumoSeleccionado || cantidadInsumo <= 0) return;

    const insumo = insumos.find(i => i.id === insumoSeleccionado);
    if (!insumo) return;

    // Verificar stock disponible
    if (cantidadInsumo > insumo.stock) {
      toast.error(`No hay suficiente stock. Disponible: ${insumo.stock} unidades`);
      return;
    }

    const insumosActuales = nuevaEntrega.insumos || [];
    const existeInsumo = insumosActuales.find(i => i.id === insumo.id);

    if (existeInsumo) {
      const nuevaCantidad = existeInsumo.cantidad + cantidadInsumo;
      if (nuevaCantidad > insumo.stock) {
        toast.error(`No hay suficiente stock. Disponible: ${insumo.stock} unidades`);
        return;
      }

      setNuevaEntrega({
        ...nuevaEntrega,
        insumos: insumosActuales.map(i =>
          i.id === insumo.id
            ? { ...i, cantidad: nuevaCantidad }
            : i
        )
      });
    } else {
      setNuevaEntrega({
        ...nuevaEntrega,
        insumos: [...insumosActuales, {
          id: insumo.id,
          nombre: insumo.nombre,
          categoria: insumo.categoria,
          cantidad: cantidadInsumo,
          precio: insumo.precio
        }]
      });
    }

    setInsumoSeleccionado('');
    setCantidadInsumo(1);
  };

  const eliminarInsumo = (insumoId: string) => {
    const insumosActuales = nuevaEntrega.insumos || [];
    setNuevaEntrega({
      ...nuevaEntrega,
      insumos: insumosActuales.filter(i => i.id !== insumoId)
    });
  };

  const calcularTotalEntrega = () => {
    if (!nuevaEntrega.insumos || !Array.isArray(nuevaEntrega.insumos)) {
      return 0;
    }
    return nuevaEntrega.insumos.reduce((total, insumo) =>
      total + (insumo.precio * insumo.cantidad), 0
    );
  };

  const handleCreateEntrega = () => {
    if (!nuevaEntrega.barberoSeleccionado || !nuevaEntrega.insumos || nuevaEntrega.insumos.length === 0) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    const barbero = barberos.find(b => b.id === nuevaEntrega.barberoSeleccionado);
    if (!barbero) return;

    const numeroEntrega = `ENT${String(entregas.length + 1).padStart(3, '0')}`;
    const total = calcularTotalEntrega();
    const insumosActuales = nuevaEntrega.insumos || [];
    const cantidadTotal = insumosActuales.reduce((sum, insumo) => sum + insumo.cantidad, 0);

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    const tempNuevaEntrega = { ...nuevaEntrega };
    const tempBarbero = { ...barbero };

    setIsDialogOpen(false);

    confirmCreateAction(
      `${numeroEntrega} para ${barbero.nombre}`,
      () => {
        const entrega: Entrega = {
          id: numeroEntrega,
          barbero: tempBarbero.nombre,
          barberoId: tempBarbero.id,
          fecha: tempNuevaEntrega.fechaEntrega,
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          cantidadTotal: cantidadTotal,
          valorTotal: total,
          estado: 'Entregado',
          responsable: 'Admin Principal',
          insumosDetalle: insumosActuales
        };

        // Actualizar stock de insumos
        const nuevosInsumos = insumos.map(insumo => {
          const insumoEntregado = insumosActuales.find(i => i.id === insumo.id);
          if (insumoEntregado) {
            return {
              ...insumo,
              stock: insumo.stock - insumoEntregado.cantidad
            };
          }
          return insumo;
        });

        setInsumos(nuevosInsumos);
        setEntregas([entrega, ...entregas]);
        setNuevaEntrega(inicialNuevaEntrega);
      },
      {
        confirmTitle: 'Registrar Nueva Entrega',
        confirmMessage: `¿Estás seguro de que deseas registrar la entrega ${numeroEntrega} para ${barbero.nombre} con ${cantidadTotal} insumos por un valor de ${formatCurrency(total)}?`,
        successTitle: 'Entrega registrada exitosamente ✔️',
        successMessage: `La entrega ${numeroEntrega} ha sido registrada para ${barbero.nombre}. El stock de insumos ha sido actualizado automáticamente.`,
        requireInput: false
      }
    );
  };

  const handleAnularClick = (entrega: Entrega) => {
    confirmCreateAction(
      `${entrega.id} para ${entrega.barbero}`,
      () => {
        // Cambiar estado de la entrega
        setEntregas(entregas.map(e =>
          e.id === entrega.id
            ? { ...e, estado: "Anulado" }
            : e
        ));

        // Devolver stock de insumos al inventario
        const nuevosInsumos = insumos.map(insumo => {
          const insumoDevuelto = entrega.insumosDetalle.find(i => i.id === insumo.id);
          if (insumoDevuelto) {
            return {
              ...insumo,
              stock: insumo.stock + insumoDevuelto.cantidad
            };
          }
          return insumo;
        });

        setInsumos(nuevosInsumos);
      },
      {
        confirmTitle: 'Anular Entrega',
        confirmMessage: `¿Estás seguro de que deseas anular la entrega ${entrega.id} para ${entrega.barbero}? Esta acción devolverá todos los insumos al inventario y marcará la entrega como anulada.`,
        successTitle: 'Entrega anulada exitosamente ✔️',
        successMessage: `La entrega ${entrega.id} ha sido anulada. El stock de ${entrega.cantidadTotal} insumos ha sido devuelto al inventario automáticamente.`,
        requireInput: false
      }
    );
  };

  const handleChangeStatusClick = (entrega: Entrega) => {
    setEntregaToChangeStatus(entrega);
    setNuevoEstado(entrega.estado);
    setIsEstadoDialogOpen(true);
  };

  const handleConfirmChangeStatus = () => {
    if (!entregaToChangeStatus || !nuevoEstado) return;

    setEntregas(entregas.map(e =>
      e.id === entregaToChangeStatus.id
        ? { ...e, estado: nuevoEstado }
        : e
    ));

    setIsEstadoDialogOpen(false);

    toast.success(`Estado de entrega ${entregaToChangeStatus.id} actualizado a ${nuevoEstado}`, {
      style: {
        background: 'var(--color-gray-darkest)',
        border: '1px solid var(--color-orange-primary)',
        color: 'var(--color-white-primary)',
      },
    });
    setEntregaToChangeStatus(null);
    setNuevoEstado('');
  };

  // Generar reporte PDF individual por entrega
  const generateIndividualEntregaPDF = (entrega: Entrega) => {
    const reportContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Entrega ${entrega.id} - EDWINS BARBER</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          
          .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #d8b081;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 12px;
          }
          
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #d8b081;
          }
          
          .subtitle {
            font-size: 18px;
            color: #aaaaaa;
            margin-bottom: 15px;
          }
          
          .entrega-id {
            font-size: 16px;
            background: #d8b081;
            color: #000000;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 20px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #d8b081;
          }
          
          .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-weight: bold;
          }
          
          .info-value {
            font-size: 16px;
            color: #000;
            font-weight: bold;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #d8b081;
          }
          
          .table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          
          .table th {
            background: #1a1a1a;
            color: #d8b081;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
          }
          
          .table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
          }
          
          .table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .highlight {
            color: #d8b081;
            font-weight: bold;
          }
          
          .total-box {
            background: #d8b081;
            color: #000;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          
          .total-label {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .total-value {
            font-size: 24px;
            font-weight: bold;
          }
          
          .footer {
            background: #1a1a1a;
            color: #aaa;
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            font-size: 12px;
            border-radius: 8px;
          }
          
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            ${entrega.estado === 'Entregado' ? 'background: #10B981; color: white;' : 'background: #EF4444; color: white;'}
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">✂️ EDWINS BARBER</div>
          <div class="subtitle">Reporte de Entrega Individual</div>
          <div class="entrega-id">${entrega.id}</div>
        </div>
        
        <div class="container">
          <!-- Información General -->
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Barbero</div>
              <div class="info-value">${entrega.barbero}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Fecha y Hora</div>
              <div class="info-value">${entrega.fecha} - ${entrega.hora}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Estado</div>
              <div class="info-value">
                <span class="status-badge">${entrega.estado}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-label">Responsable</div>
              <div class="info-value">${entrega.responsable}</div>
            </div>
          </div>

          <!-- Resumen -->
          <div class="total-box">
            <div class="total-label">Total de Insumos: ${entrega.cantidadTotal} unidades</div>
            <div class="total-value">${formatCurrency(entrega.valorTotal)}</div>
          </div>
          
          <!-- Detalle de Insumos -->
          <div class="section">
            <h2 class="section-title">📦 Insumos Entregados</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${entrega.insumosDetalle.map(insumo => `
                  <tr>
                    <td><strong>${insumo.nombre}</strong></td>
                    <td>${insumo.categoria}</td>
                    <td class="highlight">${insumo.cantidad}</td>
                    <td>${formatCurrency(insumo.precio)}</td>
                    <td class="highlight">${formatCurrency(insumo.cantidad * insumo.precio)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
          <p><strong class="highlight">EDWINS BARBER</strong> - Sistema de Gestión de Insumos</p>
          <p>Entrega: ${entrega.id} | Barbero: ${entrega.barbero}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Entrega_${entrega.id}_${entrega.barbero.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }

    toast.success(`Reporte PDF generado para la entrega ${entrega.id}`, {
      style: {
        background: 'var(--color-gray-darkest)',
        border: '1px solid var(--color-orange-primary)',
        color: 'var(--color-white-primary)',
      },
    });
  };

  // Estadísticas
  const totalEntregas = entregas.reduce((sum, entrega) => sum + entrega.valorTotal, 0);
  const entregasCompletadas = entregas.filter(e => e.estado === "Entregado").length;
  const entregasHoy = entregas.filter(e => e.fecha === new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })).length;
  const insumosConStockBajo = insumos.filter(i => i.stock <= i.minimo).length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Entrega de Insumos a Barberos</h1>
            <p className="text-sm text-gray-lightest mt-1">Gestión y control de entregas de insumos al personal</p>
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
                  <button className="elegante-button-primary gap-2 flex items-center">
                    <Plus className="w-4 h-4" />
                    Nueva Entrega
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary">Registrar Nueva Entrega</DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      Selecciona el barbero y los insumos a entregar
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                    {/* Formulario de entrega */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-white-primary">Barbero</Label>
                        <select
                          className="elegante-input w-full"
                          value={nuevaEntrega.barberoSeleccionado}
                          onChange={(e) => setNuevaEntrega({ ...nuevaEntrega, barberoSeleccionado: e.target.value })}
                        >
                          <option value="">Seleccionar barbero...</option>
                          {barberos.filter(b => b.estado === 'Activo').map((barbero) => (
                            <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white-primary">Fecha de Entrega</Label>
                        <Input
                          type="text"
                          className="elegante-input"
                          value={nuevaEntrega.fechaEntrega}
                          onChange={(e) => setNuevaEntrega({ ...nuevaEntrega, fechaEntrega: e.target.value })}
                        />
                      </div>

                      <div className="border-t border-gray-dark pt-6">
                        <h4 className="text-white-primary font-semibold mb-4">Agregar Insumos</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              className="elegante-input"
                              value={insumoSeleccionado}
                              onChange={(e) => setInsumoSeleccionado(e.target.value)}
                            >
                              <option value="">Seleccionar insumo...</option>
                              {insumos.filter(insumo => insumo.stock > 0).map((insumo) => (
                                <option key={insumo.id} value={insumo.id}>
                                  {insumo.nombre} (Stock: {insumo.stock})
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              min="1"
                              className="elegante-input"
                              placeholder="Cantidad"
                              value={cantidadInsumo}
                              onChange={(e) => setCantidadInsumo(parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <button
                            type="button"
                            className="elegante-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed "
                            onClick={agregarInsumo}
                            disabled={!insumoSeleccionado}
                          >
                            Agregar insumo

                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Resumen de la entrega */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-white-primary font-semibold mb-4">Resumen de la Entrega</h4>
                        <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-lightest">Total Insumos:</span>
                            <span className="text-white-primary font-semibold">
                              {(nuevaEntrega.insumos || []).reduce((sum, insumo) => sum + insumo.cantidad, 0)} unidades
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-lightest">Valor Total:</span>
                            <span className="text-orange-primary font-bold">
                              ${formatCurrency(calcularTotalEntrega())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white-primary font-semibold mb-3">Insumos Seleccionados</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {(nuevaEntrega.insumos || []).length === 0 ? (
                            <p className="text-gray-lightest text-center py-4">No hay insumos seleccionados</p>
                          ) : (
                            (nuevaEntrega.insumos || []).map((insumo) => (
                              <div key={insumo.id} className="flex justify-between items-center p-3 bg-gray-darker rounded-lg border border-gray-dark">
                                <div className="flex-1">
                                  <div className="text-white-primary font-medium">{insumo.nombre}</div>
                                  <div className="text-sm text-gray-lightest">{insumo.categoria} • ${formatCurrency(insumo.precio)} c/u</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-orange-primary font-semibold">{insumo.cantidad}</span>
                                  <button
                                    onClick={() => eliminarInsumo(insumo.id)}
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-dark">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="elegante-button-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateEntrega}
                      className="elegante-button-primary"
                      disabled={!nuevaEntrega.barberoSeleccionado || (nuevaEntrega.insumos || []).length === 0}
                    >

                      Registrar Entrega
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar por barbero o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedEntregas.length} de {filteredEntregas.length} entregas
              </div>
            </div>
          </div>

          {/* Tabla de entregas */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Barbero</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Insumos</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Total</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedEntregas.map((entrega) => (
                  <tr key={entrega.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-orange-primary" />
                        <span className="text-gray-lighter">
                          {entrega.documento || entrega.barberoDocumento || entrega.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-black-primary" />
                        </div>
                        <span className="text-gray-lighter">{entrega.barbero}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{entrega.fecha}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{entrega.cantidadTotal} unidades</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-gray-lighter">
                        ${formatCurrency(entrega.valorTotal)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs bg-gray-medium text-gray-lighter">
                        {entrega.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedEntrega(entrega);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => generateIndividualEntregaPDF(entrega)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                        </button>
                        {entrega.estado === "Entregado" && (
                          <button
                            onClick={() => handleAnularClick(entrega)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Anular entrega"
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

        {/* Modal de detalles de entrega */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Detalles de Entrega {selectedEntrega?.id}</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa de la entrega realizada
              </DialogDescription>
            </DialogHeader>

            {selectedEntrega && (
              <div className="space-y-6 py-4">
                {/* Información general */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-lightest">Barbero:</span>
                      <p className="text-white-primary font-semibold">{selectedEntrega.barbero}</p>
                    </div>
                    <div>
                      <span className="text-gray-lightest">Fecha y Hora:</span>
                      <p className="text-white-primary font-semibold">{selectedEntrega.fecha} - {selectedEntrega.hora}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-lightest">Estado:</span>
                      <p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(selectedEntrega.estado)}`}>
                          {selectedEntrega.estado}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-lightest">Responsable:</span>
                      <p className="text-white-primary font-semibold">{selectedEntrega.responsable}</p>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white-primary">{selectedEntrega.cantidadTotal}</div>
                      <div className="text-gray-lightest">Insumos Entregados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-primary">${formatCurrency(selectedEntrega.valorTotal)}</div>
                      <div className="text-gray-lightest">Valor Total</div>
                    </div>
                  </div>
                </div>

                {/* Lista de insumos */}
                <div>
                  <h4 className="text-white-primary font-semibold mb-3">Insumos Entregados</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedEntrega.insumosDetalle.map((insumo) => (
                      <div key={insumo.id} className="flex justify-between items-center p-3 bg-gray-darker rounded-lg border border-gray-dark">
                        <div className="flex-1">
                          <div className="text-white-primary font-medium">{insumo.nombre}</div>
                          <div className="text-sm text-gray-lightest">{insumo.categoria}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-primary font-semibold">{insumo.cantidad} unidades</div>
                          <div className="text-sm text-gray-lightest">${formatCurrency(insumo.precio)} c/u</div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-white-primary font-semibold">${formatCurrency(insumo.cantidad * insumo.precio)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-dark">
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="elegante-button-secondary"
              >
                Cerrar
              </button>
              {selectedEntrega && (
                <button
                  onClick={() => generateIndividualEntregaPDF(selectedEntrega)}
                  className="elegante-button-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de cambio de estado */}
        <Dialog open={isEstadoDialogOpen} onOpenChange={setIsEstadoDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Cambiar Estado de Entrega</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Selecciona el nuevo estado para la entrega {entregaToChangeStatus?.id}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2">
                <Label className="text-white-primary">Nuevo Estado</Label>
                <select
                  className="elegante-input w-full"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  {ESTADOS_ENTREGA.map((estado) => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-dark">
              <button
                onClick={() => setIsEstadoDialogOpen(false)}
                className="elegante-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmChangeStatus}
                className="elegante-button-primary"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Actualizar Estado
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <DoubleConfirmationContainer />
    </>
  );
}