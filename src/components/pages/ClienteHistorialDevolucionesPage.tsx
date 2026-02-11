import { useState } from "react";
import { Search, Eye, Calendar, DollarSign, RotateCcw, Package, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

// Función para formatear moneda colombiana
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

// Datos de ejemplo del historial de devoluciones del cliente
const devolucionesCliente = [
  {
    id: "DEV001",
    ventaId: "VNT001",
    fecha: "20-11-2024",
    motivo: "Producto defectuoso",
    descripcion: "La cera para cabello llegó con la tapa rota y producto derramado",
    items: [
      { tipo: "producto", nombre: "Cera para Cabello Premium", cantidad: 1, precio: 25000, devuelto: 25000 }
    ],
    totalDevuelto: 25000,
    estado: "Procesada",
    metodoPago: "Tarjeta",
    fechaProceso: "21-11-2024",
    barbero: "Miguel Rodriguez"
  },
  {
    id: "DEV002",
    ventaId: "VNT003",
    fecha: "15-10-2024",
    motivo: "Insatisfacción con el servicio",
    descripcion: "El corte no quedó como se solicitó, se requiere ajuste",
    items: [
      { tipo: "servicio", nombre: "Corte de Cabello", cantidad: 1, precio: 35000, devuelto: 17500 }
    ],
    totalDevuelto: 17500,
    estado: "Procesada",
    metodoPago: "Efectivo",
    fechaProceso: "15-10-2024",
    barbero: "Sofia Martinez"
  },
  {
    id: "DEV003",
    ventaId: "VNT005",
    fecha: "18-09-2024",
    motivo: "Producto vencido",
    descripcion: "El aceite de barba tenía fecha de vencimiento pasada",
    items: [
      { tipo: "producto", nombre: "Aceite de Barba Premium", cantidad: 1, precio: 32000, devuelto: 32000 }
    ],
    totalDevuelto: 32000,
    estado: "Procesada",
    metodoPago: "Transferencia",
    fechaProceso: "19-09-2024",
    barbero: "Carlos Mendoza"
  },
  {
    id: "DEV004",
    ventaId: "VNT007",
    fecha: "05-09-2024",
    motivo: "Cambio de opinión",
    descripcion: "Cliente decidió no usar el producto después de la compra",
    items: [
      { tipo: "producto", nombre: "Perfume Masculino", cantidad: 1, precio: 120000, devuelto: 96000 }
    ],
    totalDevuelto: 96000,
    estado: "Rechazada",
    motivoRechazo: "Producto ya abierto, no aplica para devolución por cambio de opinión",
    metodoPago: "Tarjeta",
    barbero: "Miguel Rodriguez"
  }
];

export function ClienteHistorialDevolucionesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevolucion, setSelectedDevolucion] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredDevoluciones = devolucionesCliente.filter(devolucion =>
    devolucion.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    devolucion.ventaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    devolucion.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (devolucion: any) => {
    setSelectedDevolucion(devolucion);
    setIsDetailDialogOpen(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Procesada": return "bg-green-600 text-white";
      case "Rechazada": return "bg-red-600 text-white";
      case "Pendiente": return "bg-orange-secondary text-white";
      case "En Revisión": return "bg-blue-600 text-white";
      default: return "bg-gray-medium text-white";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Procesada": return "✓";
      case "Rechazada": return "✗";
      case "Pendiente": return "⏳";
      case "En Revisión": return "👁";
      default: return "?";
    }
  };

  const totalDevuelto = devolucionesCliente
    .filter(d => d.estado === "Procesada")
    .reduce((sum, devolucion) => sum + devolucion.totalDevuelto, 0);

  const devolucionesProcesadas = devolucionesCliente.filter(d => d.estado === "Procesada").length;
  const devolucionesRechazadas = devolucionesCliente.filter(d => d.estado === "Rechazada").length;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Mi Historial de Devoluciones</h1>
            <p className="text-sm text-gray-lightest mt-1">Revisa todas tus solicitudes de devolución y reembolsos</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Search and Table */}
        <div className="elegante-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white-primary">Mis Solicitudes de Devolución</h2>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-lightest w-4 h-4" />
              <Input
                placeholder="Buscar por número, venta o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="elegante-input pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Devolución</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Venta Original</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Fecha</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Motivo</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Monto</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Estado</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevoluciones.map((devolucion) => (
                  <tr key={devolucion.id} className="border-b border-gray-dark hover:bg-gray-darkest transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-white-primary font-medium">{devolucion.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-orange-primary font-medium">{devolucion.ventaId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lightest">{devolucion.fecha}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-white-primary">{devolucion.motivo}</span>
                        <div className="text-xs text-gray-lightest mt-1 max-w-xs truncate">
                          {devolucion.descripcion}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${devolucion.estado === 'Procesada' ? 'text-green-400' : 'text-gray-lightest'}`}>
                        ${formatCurrency(devolucion.totalDevuelto)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(devolucion.estado)}`}>
                          {getEstadoIcon(devolucion.estado)} {devolucion.estado}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewDetails(devolucion)}
                        className="text-orange-primary hover:text-orange-secondary p-2 rounded-lg hover:bg-gray-darker transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDevoluciones.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-lightest mb-4">
                <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron devoluciones que coincidan con tu búsqueda.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl bg-gray-darkest border-gray-dark">
            {selectedDevolucion && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white-primary">
                    Detalle de Devolución - {selectedDevolucion.id}
                  </DialogTitle>
                  <DialogDescription className="text-gray-lightest">
                    Información completa de tu solicitud de devolución
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-white-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-primary" />
                        Fecha de Solicitud
                      </label>
                      <div className="elegante-input bg-gray-medium text-gray-lightest">
                        {selectedDevolucion.fecha}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white-primary flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-primary" />
                        Venta Original
                      </label>
                      <div className="elegante-input bg-gray-medium text-orange-primary font-medium">
                        {selectedDevolucion.ventaId}
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <label className="text-white-primary">Estado de la Devolución</label>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-2 rounded-lg text-sm ${getEstadoColor(selectedDevolucion.estado)}`}>
                        {getEstadoIcon(selectedDevolucion.estado)} {selectedDevolucion.estado}
                      </span>
                      {selectedDevolucion.fechaProceso && (
                        <span className="text-gray-lightest text-sm">
                          Procesada el {selectedDevolucion.fechaProceso}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Motivo y Descripción */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-white-primary font-medium">Motivo de la Devolución</label>
                      <div className="mt-2 p-3 bg-gray-darker rounded-lg border border-gray-dark">
                        <p className="text-white-primary">{selectedDevolucion.motivo}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-white-primary font-medium">Descripción Detallada</label>
                      <div className="mt-2 p-3 bg-gray-darker rounded-lg border border-gray-dark">
                        <p className="text-gray-lightest">{selectedDevolucion.descripcion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items Devueltos */}
                  <div className="space-y-4">
                    <label className="text-white-primary flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-orange-primary" />
                      Items Devueltos
                    </label>
                    {selectedDevolucion.items.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-darker p-3 rounded-lg border border-gray-dark">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white-primary font-medium">{item.nombre}</span>
                            <div className="text-gray-lightest text-sm mt-1">
                              {item.tipo === 'producto' ? 'Producto' : 'Servicio'} •
                              Cantidad: {item.cantidad} •
                              Precio original: ${formatCurrency(item.precio)}
                            </div>
                          </div>
                          <div className="text-orange-primary font-medium">
                            ${formatCurrency(item.devuelto)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Motivo de Rechazo (si aplica) */}
                  {selectedDevolucion.estado === "Rechazada" && selectedDevolucion.motivoRechazo && (
                    <div className="space-y-2">
                      <label className="text-white-primary font-medium text-red-400">Motivo de Rechazo</label>
                      <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                        <p className="text-red-300">{selectedDevolucion.motivoRechazo}</p>
                      </div>
                    </div>
                  )}

                  {/* Resumen Total */}
                  <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                    <h4 className="text-white-primary mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-primary" />
                      Resumen de la Devolución
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-lightest">Barbero responsable:</span>
                        <span className="text-white-primary font-medium">{selectedDevolucion.barbero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-lightest">Método de pago original:</span>
                        <span className="text-white-primary font-medium">{selectedDevolucion.metodoPago}</span>
                      </div>
                      <div className="border-t border-gray-dark pt-3">
                        <div className="flex justify-between text-lg">
                          <span className="text-white-primary font-bold">
                            {selectedDevolucion.estado === 'Procesada' ? 'Monto Devuelto:' : 'Monto Solicitado:'}
                          </span>
                          <span className={`font-bold ${selectedDevolucion.estado === 'Procesada' ? 'text-green-400' : 'text-orange-primary'
                            }`}>
                            ${formatCurrency(selectedDevolucion.totalDevuelto)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}