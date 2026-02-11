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
  Truck,
  Building,
  FileText,
  Ban,
  Download,
  Percent,
  Calculator,
  Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { useDoubleConfirmation } from "../ui/double-confirmation";

// Función para formatear moneda colombiana con puntos para separar miles
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

const comprasData = [
  {
    id: "CPR001",
    proveedor: "Distribuidora El Dorado",
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

export function ComprasPageComplete() {
  const [compras, setCompras] = useState(comprasData);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { confirmCreateAction, confirmEditAction, confirmDeleteAction, DoubleConfirmationContainer } = useDoubleConfirmation();

  const filteredCompras = compras.filter(compra =>
    compra.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compra.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Asegurar que siempre haya al menos 1 página
  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCompras = filteredCompras.slice(startIndex, startIndex + itemsPerPage);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada": return "bg-green-600 text-white";
      case "Pendiente": return "bg-orange-secondary text-white";
      case "Anulada": return "bg-red-600 text-white";
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

  const handleAnularCompra = (compra: any) => {
    confirmDeleteAction(
      compra.id,
      () => {
        setCompras(currentCompras => currentCompras.map(c =>
          c.id === compra.id
            ? { ...c, estado: "Anulada" }
            : c
        ));
      },
      {
        confirmTitle: "Confirmar Anulación",
        confirmMessage: `¿Estás seguro de que deseas anular la compra "${compra.id}" del proveedor "${compra.proveedor}"? Esta acción no se puede deshacer.`,
        successTitle: "Compra anulada exitosamente",
        successMessage: `La compra "${compra.id}" ha sido anulada del sistema.`,
        requireInput: true
      }
    );
  };

  const handleNuevaCompra = () => {
    const nombreCompra = `CPR${String(compras.length + 1).padStart(3, '0')}`;
    confirmCreateAction(
      nombreCompra,
      () => {
        // Logic for creating new purchase would go here
      },
      {
        confirmTitle: "Confirmar Nueva Compra",
        confirmMessage: `¿Estás seguro de que deseas crear la compra "${nombreCompra}"?`,
        successTitle: "Compra creada exitosamente",
        successMessage: `La compra "${nombreCompra}" ha sido creada en el sistema.`,
        requireInput: false
      }
    );
  };

  const handleEditarCompra = (compra: any) => {
    confirmEditAction(
      compra.id,
      () => {
        // Logic for editing purchase would go here
      },
      {
        confirmTitle: "Confirmar Edición",
        confirmMessage: `¿Estás seguro de que deseas editar la compra "${compra.id}"?`,
        successTitle: "Compra editada exitosamente",
        successMessage: `La compra "${compra.id}" ha sido actualizada en el sistema.`,
        requireInput: false
      }
    );
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
          <div className="flex items-center space-x-4">
            <div className="elegante-tag-orange">
              Hoy: {comprasHoy} compras
            </div>
            <div className="elegante-tag bg-green-600 text-white">
              Total: ${formatCurrency(totalCompras)}
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
              <button
                onClick={handleNuevaCompra}
                className="elegante-button-primary gap-2 flex items-center"
              >
                <Plus className="w-4 h-4" />
                Nueva Compra
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-lighter w-4 h-4" />
                <Input
                  placeholder="Buscar por proveedor o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Compras */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left font-semibold text-white-primary pb-4">ID</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Proveedor</th>
                  <th className="text-center font-semibold text-white-primary pb-4">Fecha</th>
                  <th className="text-right font-semibold text-white-primary pb-4">Total</th>
                  <th className="text-center font-semibold text-white-primary pb-4">Estado</th>
                  <th className="text-center font-semibold text-white-primary pb-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedCompras.map((compra) => (
                  <tr key={compra.id} className="border-b border-gray-dark hover:bg-gray-darkest transition-colors">
                    <td className="py-4">
                      <span className="font-medium text-orange-primary">{compra.id}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <Building className="w-4 h-4 text-blue-400" />
                        <div>
                          <span className="font-medium text-white-primary">{compra.proveedor}</span>
                          <div className="text-xs text-gray-lightest">{compra.responsableCompra}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm text-gray-lightest">{compra.fecha}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div>
                        <span className="font-bold text-orange-primary">${formatCurrency(compra.total)}</span>
                        {compra.metodoPago && (
                          <div className={`text-xs ${getMetodoPagoColor(compra.metodoPago)}`}>
                            {compra.metodoPago}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(compra.estado)}`}>
                        {compra.estado}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCompra(compra);
                            setIsDetailDialogOpen(true);
                          }}
                          className="elegante-button-secondary p-2"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditarCompra(compra)}
                          className="elegante-button-primary p-2"
                          title="Editar compra"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {compra.estado !== "Anulada" && (
                          <button
                            onClick={() => handleAnularCompra(compra)}
                            className="elegante-button-danger p-2"
                            title="Anular compra"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación - SIEMPRE VISIBLE */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-dark">
            <div className="text-sm text-gray-lightest">
              Mostrando {Math.min(startIndex + 1, filteredCompras.length)} a {Math.min(startIndex + itemsPerPage, filteredCompras.length)} de {filteredCompras.length} registros
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="elegante-button-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-lightest px-3">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="elegante-button-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dialog de Detalles */}
        {selectedCompra && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="elegante-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white-primary flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-primary" />
                  Detalles de Compra - {selectedCompra.id}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-lightest">Proveedor</label>
                    <p className="text-white-primary font-medium">{selectedCompra.proveedor}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-lightest">Fecha</label>
                    <p className="text-white-primary font-medium">{selectedCompra.fecha}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-lightest">Responsable</label>
                    <p className="text-white-primary font-medium">{selectedCompra.responsableCompra}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-lightest">Estado</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(selectedCompra.estado)}`}>
                      {selectedCompra.estado}
                    </span>
                  </div>
                </div>

                {selectedCompra.productosDetalle && selectedCompra.productosDetalle.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-lightest mb-2 block">Productos</label>
                    <div className="space-y-2">
                      {selectedCompra.productosDetalle.map((producto: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-darker rounded">
                          <span className="text-white-primary">{producto.nombre}</span>
                          <span className="text-gray-lightest text-sm">
                            {producto.cantidad}x ${formatCurrency(producto.precio)} = ${formatCurrency(producto.cantidad * producto.precio)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-dark pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-lightest">Subtotal:</span>
                      <span className="text-white-primary">${formatCurrency(selectedCompra.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-lightest">IVA:</span>
                      <span className="text-white-primary">${formatCurrency(selectedCompra.iva)}</span>
                    </div>
                    {selectedCompra.descuento > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-lightest">Descuento:</span>
                        <span className="text-red-400">-${formatCurrency(selectedCompra.descuento)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-medium pt-2">
                      <span className="text-white-primary">Total:</span>
                      <span className="text-orange-primary">${formatCurrency(selectedCompra.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>

      {/* Contenedor de Alertas de Doble Confirmación */}
      <DoubleConfirmationContainer />
    </>
  );
}