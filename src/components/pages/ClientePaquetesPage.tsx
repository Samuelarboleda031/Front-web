import { useState } from "react";
import { Search, Star, Clock, DollarSign, Package, Scissors, User, Calendar, Check } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { toast } from "sonner@2.0.3";

// Función para formatear moneda colombiana
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

// Datos de paquetes disponibles
const paquetesDisponibles = [
  {
    id: "PAQ001",
    nombre: "Paquete Básico",
    descripcion: "Perfecto para el cuidado esencial de tu imagen",
    precio: 45000,
    precioIndividual: 55000,
    ahorro: 10000,
    duracion: "60 min",
    popularidad: 4.2,
    servicios: [
      { nombre: "Corte de Cabello", incluido: true },
      { nombre: "Arreglo de Barba", incluido: true },
      { nombre: "Lavado", incluido: true }
    ],
    productos: [
      { nombre: "Gel Fijador", incluido: true },
      { nombre: "Toalla Caliente", incluido: true }
    ],
    beneficios: [
      "Ideal para mantenimiento semanal",
      "Incluye productos básicos",
      "Atención personalizada"
    ],
    categoria: "Básico",
    disponible: true
  },
  {
    id: "PAQ002",
    nombre: "Paquete Premium",
    descripcion: "La experiencia completa de barbería de lujo",
    precio: 80000,
    precioIndividual: 110000,
    ahorro: 30000,
    duracion: "120 min",
    popularidad: 4.8,
    servicios: [
      { nombre: "Corte de Cabello Premium", incluido: true },
      { nombre: "Arreglo de Barba Profesional", incluido: true },
      { nombre: "Afeitado con Navaja", incluido: true },
      { nombre: "Masaje Capilar", incluido: true },
      { nombre: "Arreglo de Cejas", incluido: true }
    ],
    productos: [
      { nombre: "Aceite de Barba Premium", incluido: true },
      { nombre: "Cera Modeladora", incluido: true },
      { nombre: "Perfume Masculino", incluido: true },
      { nombre: "Toalla Caliente Premium", incluido: true }
    ],
    beneficios: [
      "Experiencia VIP completa",
      "Productos premium incluidos",
      "Masaje relajante",
      "Bebida de cortesía",
      "Ambiente exclusivo"
    ],
    categoria: "Premium",
    disponible: true,
    popular: true
  },
  {
    id: "PAQ003",
    nombre: "Paquete Ejecutivo",
    descripcion: "Rápido y profesional para el hombre de negocios",
    precio: 60000,
    precioIndividual: 75000,
    ahorro: 15000,
    duracion: "90 min",
    popularidad: 4.5,
    servicios: [
      { nombre: "Corte Ejecutivo", incluido: true },
      { nombre: "Arreglo de Barba", incluido: true },
      { nombre: "Peinado Profesional", incluido: true },
      { nombre: "Arreglo de Cejas", incluido: true }
    ],
    productos: [
      { nombre: "Gel Profesional", incluido: true },
      { nombre: "Spray Fijador", incluido: true },
      { nombre: "Loción Post-Afeitado", incluido: true }
    ],
    beneficios: [
      "Servicio rápido y eficiente",
      "Look profesional garantizado",
      "Cita express disponible",
      "Productos de larga duración"
    ],
    categoria: "Ejecutivo",
    disponible: true
  },
  {
    id: "PAQ004",
    nombre: "Paquete Estudiante",
    descripcion: "Precio especial para estudiantes con descuento",
    precio: 35000,
    precioIndividual: 45000,
    ahorro: 10000,
    duracion: "45 min",
    popularidad: 4.0,
    servicios: [
      { nombre: "Corte de Cabello", incluido: true },
      { nombre: "Arreglo de Barba Básico", incluido: true }
    ],
    productos: [
      { nombre: "Gel Básico", incluido: true }
    ],
    beneficios: [
      "Precio accesible para estudiantes",
      "Calidad profesional",
      "Requiere credencial estudiantil válida"
    ],
    categoria: "Estudiante",
    disponible: true,
    descuento: true
  },
  {
    id: "PAQ005",
    nombre: "Paquete Novio",
    descripcion: "Especial para el día más importante de tu vida",
    precio: 150000,
    precioIndividual: 200000,
    ahorro: 50000,
    duracion: "180 min",
    popularidad: 4.9,
    servicios: [
      { nombre: "Corte Premium", incluido: true },
      { nombre: "Afeitado Clásico con Navaja", incluido: true },
      { nombre: "Masaje Facial", incluido: true },
      { nombre: "Manicure Masculino", incluido: true },
      { nombre: "Pedicure Express", incluido: true },
      { nombre: "Arreglo de Cejas", incluido: true }
    ],
    productos: [
      { nombre: "Kit Completo de Cuidado", incluido: true },
      { nombre: "Perfume de Lujo", incluido: true },
      { nombre: "Aceites Esenciales", incluido: true },
      { nombre: "Productos para Casa", incluido: true }
    ],
    beneficios: [
      "Preparación completa para boda",
      "Kit de productos para llevar",
      "Atención VIP exclusiva",
      "Sesión de fotos profesional incluida",
      "Garantía de perfección"
    ],
    categoria: "Especial",
    disponible: true,
    especial: true
  }
];

export function ClientePaquetesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaquete, setSelectedPaquete] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredPaquetes = paquetesDisponibles.filter(paquete => {
    const matchesSearch = paquete.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paquete.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewDetails = (paquete: any) => {
    setSelectedPaquete(paquete);
    setIsDetailDialogOpen(true);
  };

  const handleReservarPaquete = (paquete: any) => {
    toast.success("¡Paquete seleccionado!", {
      description: `El paquete "${paquete.nombre}" ha sido añadido a tu reserva. Serás redirigido para agendar la cita.`
    });
    setIsDetailDialogOpen(false);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Básico": return "bg-blue-600 text-white";
      case "Premium": return "bg-orange-primary text-black";
      case "Ejecutivo": return "bg-purple-600 text-white";
      case "Estudiante": return "bg-green-600 text-white";
      case "Especial": return "bg-red-600 text-white";
      default: return "bg-gray-medium text-white";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-orange-primary text-orange-primary" : "text-gray-medium"
            }`}
          />
        ))}
        <span className="text-gray-lightest text-sm ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Paquetes de Servicios</h1>
            <p className="text-sm text-gray-lightest mt-1">Descubre nuestros paquetes especiales con precios preferenciales</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Filtros */}
        <div className="elegante-card mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-lightest w-4 h-4" />
            <Input
              placeholder="Buscar paquetes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="elegante-input pl-10"
            />
          </div>
        </div>

        {/* Grid de Paquetes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaquetes.map((paquete) => (
            <div key={paquete.id} className="elegante-card relative">


              {/* Contenido del paquete */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white-primary mb-2">{paquete.nombre}</h3>
                <p className="text-gray-lightest text-sm mb-3">{paquete.descripcion}</p>
                {renderStars(paquete.popularidad)}
              </div>

              {/* Servicios principales */}
              <div className="mb-4">
                <h4 className="text-white-primary font-medium text-sm mb-2">Incluye:</h4>
                <div className="space-y-1">
                  {paquete.servicios.slice(0, 3).map((servicio, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-gray-lightest">{servicio.nombre}</span>
                    </div>
                  ))}
                  {paquete.servicios.length > 3 && (
                    <div className="text-orange-primary text-xs font-medium">
                      +{paquete.servicios.length - 3} servicios más
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              <div className="flex items-center justify-between text-xs text-gray-lightest mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{paquete.duracion}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Scissors className="w-3 h-3" />
                  <span>{paquete.servicios.length} servicios</span>
                </div>
              </div>

              {/* Precios */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-orange-primary font-bold text-xl">
                    ${formatCurrency(paquete.precio)}
                  </span>
                  <span className="text-gray-lightest line-through text-sm">
                    ${formatCurrency(paquete.precioIndividual)}
                  </span>
                </div>
                <div className="text-green-400 text-sm font-medium">
                  Ahorras ${formatCurrency(paquete.ahorro)}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(paquete)}
                  className="elegante-button-secondary flex-1 text-sm py-2"
                >
                  Ver Detalles
                </button>
                <button
                  onClick={() => handleReservarPaquete(paquete)}
                  className="elegante-button-primary flex-1 text-sm py-2"
                  disabled={!paquete.disponible}
                >
                  {paquete.disponible ? "Reservar" : "No Disponible"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPaquetes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-lightest mb-4">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron paquetes que coincidan con tu búsqueda.</p>
            </div>
          </div>
        )}

        {/* Modal de Detalles */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl bg-gray-darkest border-gray-dark">
            {selectedPaquete && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-white-primary text-xl">
                    {selectedPaquete.nombre}
                  </DialogTitle>
                  <DialogDescription className="text-gray-lightest">
                    Detalles completos del paquete de servicios
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Descripción y Rating */}
                  <div>
                    <p className="text-gray-lightest mb-3">{selectedPaquete.descripcion}</p>
                    {renderStars(selectedPaquete.popularidad)}
                  </div>

                  {/* Información del precio */}
                  <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-lightest">Precio del paquete:</span>
                      <span className="text-orange-primary font-bold text-xl">
                        ${formatCurrency(selectedPaquete.precio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-lightest">Precio individual:</span>
                      <span className="text-gray-lightest line-through">
                        ${formatCurrency(selectedPaquete.precioIndividual)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-green-400 font-medium">
                      <span>Tu ahorro:</span>
                      <span>${formatCurrency(selectedPaquete.ahorro)}</span>
                    </div>
                  </div>

                  {/* Servicios incluidos */}
                  <div>
                    <h4 className="text-white-primary font-semibold mb-3 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-orange-primary" />
                      Servicios Incluidos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedPaquete.servicios.map((servicio: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-darker rounded-lg">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-white-primary text-sm">{servicio.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>





                  {/* Información adicional */}
                  <div className="bg-gray-darker p-4 rounded-lg border border-gray-dark">
                    <h4 className="text-white-primary font-semibold mb-3">Información Adicional</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-primary" />
                        <span className="text-gray-lightest">Duración: {selectedPaquete.duracion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-primary" />
                        <span className="text-gray-lightest">Disponible para reservar</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4 border-t border-gray-dark">
                    <Button
                      onClick={() => setIsDetailDialogOpen(false)}
                      className="elegante-button-secondary flex-1"
                    >
                      Cerrar
                    </Button>
                    <Button
                      onClick={() => handleReservarPaquete(selectedPaquete)}
                      className="elegante-button-primary flex-1"
                      disabled={!selectedPaquete.disponible}
                    >
                      Reservar Paquete
                    </Button>
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