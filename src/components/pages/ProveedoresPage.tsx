import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  IdCard,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Globe,
  Calendar,
  Briefcase,
  Users,
  FileText,
  UserCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { useCustomAlert } from "../ui/custom-alert";
import { useDoubleConfirmation } from "../ui/double-confirmation";

// Tipos de proveedor
const TIPOS_PROVEEDOR = [
  { value: 'Juridico', label: 'Jurídico (Empresa)' },
  { value: 'Natural', label: 'Natural (Persona)' }
];

interface Proveedor {
  id: string;
  nombre: string;
  tipoProveedor: 'Juridico' | 'Natural';
  nit: string;
  correo: string;
  numero: string;
  direccion: string;
  fechaCreacion: string;
  activo: boolean;
  // Campos específicos para Jurídico
  razonSocial?: string;
  representanteLegal?: string;
  documentoRepresentante?: string;
  telefonoRepresentante?: string;
  correoRepresentante?: string;
  sectorEconomico?: string;
  anosOperacion?: number;
  paginaWeb?: string;
}

const proveedoresData: Proveedor[] = [
  {
    id: "PRV001",
    nombre: "Suministros Barbería Pro",
    razonSocial: "Suministros Barbería Pro S.A.S",
    tipoProveedor: "Juridico",
    nit: "900123456-7",
    correo: "ventas@barberiapro.com",
    numero: "+57 301 234 5678",
    direccion: "Calle 72 #10-34, Oficina 501, Bogotá",
    representanteLegal: "María Elena García",
    documentoRepresentante: "52123456",
    telefonoRepresentante: "+57 301 111 2222",
    correoRepresentante: "maria.garcia@barberiapro.com",
    sectorEconomico: "Comercio al por mayor de productos de belleza",
    anosOperacion: 12,
    paginaWeb: "www.barberiapro.com",
    fechaCreacion: "15-03-2025",
    activo: true
  },
  {
    id: "PRV002",
    nombre: "Perfumería Andina Ltda",
    razonSocial: "Perfumería Andina Ltda",
    tipoProveedor: "Juridico",
    nit: "800987654-3",
    correo: "contacto@perfumeriaandina.co",
    numero: "+57 302 345 6789",
    direccion: "Carrera 15 #93-47, Local 102, Bogotá",
    representanteLegal: "Carlos Andrés Rodríguez",
    documentoRepresentante: "71987654",
    telefonoRepresentante: "+57 302 333 4444",
    correoRepresentante: "carlos.rodriguez@perfumeriaandina.co",
    sectorEconomico: "Comercio de perfumes y fragancias",
    anosOperacion: 8,
    paginaWeb: "www.perfumeriaandina.co",
    fechaCreacion: "22-06-2025",
    activo: true
  },
  {
    id: "PRV003",
    nombre: "Accesorios & Más Ltda",
    razonSocial: "Accesorios & Más Ltda",
    tipoProveedor: "Juridico",
    nit: "900555666-9",
    correo: "info@accesoriosymas.com",
    numero: "+57 303 456 7890",
    direccion: "Centro Comercial Santafé, Local 245, Bogotá",
    representanteLegal: "Ana María Pérez",
    documentoRepresentante: "41555666",
    telefonoRepresentante: "+57 303 555 6666",
    correoRepresentante: "ana.perez@accesoriosymas.com",
    sectorEconomico: "Comercio de accesorios y joyería",
    anosOperacion: 5,
    paginaWeb: "www.accesoriosymas.com",
    fechaCreacion: "08-04-2025",
    activo: false
  },
  {
    id: "PRV004",
    nombre: "Carlos Andrés Martínez",
    tipoProveedor: "Natural",
    nit: "12345678-9",
    correo: "carlos.martinez@email.com",
    numero: "+57 305 678 9012",
    direccion: "Barrio La Candelaria, Calle 11 #6-42, Bogotá",
    fechaCreacion: "12-07-2025",
    activo: true
  }
];

export function ProveedoresPage() {
  const { created, edited, deleted, AlertContainer } = useCustomAlert();
  const { confirmDeleteAction, confirmEditAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    nombre: "",
    tipoProveedor: "Juridico" as 'Juridico' | 'Natural',
    nit: "",
    correo: "",
    numero: "",
    direccion: "",
    razonSocial: "",
    representanteLegal: "",
    documentoRepresentante: "",
    telefonoRepresentante: "",
    correoRepresentante: "",
    sectorEconomico: "",
    anosOperacion: 0,
    paginaWeb: ""
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipoProveedor: "Juridico",
      nit: "",
      correo: "",
      numero: "",
      direccion: "",
      razonSocial: "",
      representanteLegal: "",
      documentoRepresentante: "",
      telefonoRepresentante: "",
      correoRepresentante: "",
      sectorEconomico: "",
      anosOperacion: 0,
      paginaWeb: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProveedor: Proveedor = {
      id: `PRV${(proveedores.length + 1).toString().padStart(3, '0')}`,
      ...formData,
      fechaCreacion: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      activo: true
    };

    setProveedores([...proveedores, nuevoProveedor]);
    created("Proveedor creado", `El proveedor "${formData.nombre}" ha sido agregado exitosamente al sistema.`);

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      tipoProveedor: proveedor.tipoProveedor,
      nit: proveedor.nit,
      correo: proveedor.correo,
      numero: proveedor.numero,
      direccion: proveedor.direccion,
      razonSocial: proveedor.razonSocial || "",
      representanteLegal: proveedor.representanteLegal || "",
      documentoRepresentante: proveedor.documentoRepresentante || "",
      telefonoRepresentante: proveedor.telefonoRepresentante || "",
      correoRepresentante: proveedor.correoRepresentante || "",
      sectorEconomico: proveedor.sectorEconomico || "",
      anosOperacion: proveedor.anosOperacion || 0,
      paginaWeb: proveedor.paginaWeb || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProveedor) return;

    // Cerrar el modal temporalmente para evitar conflictos de z-index
    const tempFormData = { ...formData };
    const tempSelectedProveedor = { ...selectedProveedor };

    setIsEditDialogOpen(false);

    confirmEditAction(
      formData.nombre,
      () => {
        const proveedorActualizado: Proveedor = {
          ...tempSelectedProveedor,
          ...tempFormData
        };

        setProveedores(proveedores.map(p =>
          p.id === tempSelectedProveedor.id ? proveedorActualizado : p
        ));

        setSelectedProveedor(null);
        resetForm();
      },
      {
        confirmTitle: 'Confirmar Edición',
        confirmMessage: `¿Estás seguro de que deseas actualizar la información del proveedor "${formData.nombre}"?`,
        successTitle: 'Proveedor actualizado ✔️',
        successMessage: `La información del proveedor "${formData.nombre}" ha sido actualizada exitosamente.`,
        requireInput: false
      }
    );
  };

  const handleDeleteClick = (proveedor: Proveedor) => {
    confirmDeleteAction(
      proveedor.nombre,
      () => {
        setProveedores(proveedores.filter(p => p.id !== proveedor.id));
      },
      {
        confirmTitle: 'Eliminar Proveedor',
        confirmMessage: `¿Estás seguro de que deseas eliminar el proveedor "${proveedor.nombre}" y toda su información asociada? Esta acción no se puede deshacer.`,
        requireInput: false,
        successTitle: 'Proveedor eliminado ✔️',
        successMessage: `El proveedor "${proveedor.nombre}" ha sido eliminado exitosamente del sistema.`
      }
    );
  };

  const handleToggleStatus = (proveedor: Proveedor) => {
    const nuevoEstado = !proveedor.activo;

    setProveedores(proveedores.map(p =>
      p.id === proveedor.id ? { ...p, activo: nuevoEstado } : p
    ));

    if (nuevoEstado) {
      created("Proveedor activado", `El proveedor "${proveedor.nombre}" ha sido activado.`);
    } else {
      edited("Proveedor desactivado", `El proveedor "${proveedor.nombre}" ha sido desactivado.`);
    }
  };

  const handleViewDetails = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsDetailDialogOpen(true);
  };

  const getTipoProveedorLabel = (tipo: string) => {
    const tipoProveedor = TIPOS_PROVEEDOR.find(t => t.value === tipo);
    return tipoProveedor ? tipoProveedor.label : tipo;
  };

  const proveedoresActivos = proveedores.filter(p => p.activo).length;
  const proveedoresInactivos = proveedores.filter(p => !p.activo).length;

  // Filtrado y paginación
  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.tipoProveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProveedores = filteredProveedores.slice(startIndex, endIndex);

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Proveedores</h1>
            <p className="text-sm text-gray-lightest mt-1">Administra la red de proveedores</p>
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
                    onClick={() => resetForm()}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Proveedor
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Truck className="w-5 h-5 text-orange-primary" />
                      Agregar Nuevo Proveedor
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      Complete los datos del nuevo proveedor en el sistema
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Building className="w-4 h-4 text-orange-primary" />
                          Tipo de Proveedor
                        </Label>
                        <select
                          id="tipoProveedor"
                          value={formData.tipoProveedor}
                          onChange={(e) => setFormData({ ...formData, tipoProveedor: e.target.value as 'Juridico' | 'Natural' })}
                          className="elegante-input w-full"
                          required
                        >
                          {TIPOS_PROVEEDOR.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-primary" />
                          {formData.tipoProveedor === 'Juridico' ? 'Nombre de la Empresa' : 'Nombre Completo'}
                        </Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="elegante-input"
                          required
                        />
                      </div>
                    </div>

                    {formData.tipoProveedor === 'Juridico' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <FileText className="w-4 h-4 text-orange-primary" />
                              Razón Social
                            </Label>
                            <Input
                              id="razonSocial"
                              value={formData.razonSocial}
                              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                              className="elegante-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-orange-primary" />
                              Representante Legal
                            </Label>
                            <Input
                              id="representanteLegal"
                              value={formData.representanteLegal}
                              onChange={(e) => setFormData({ ...formData, representanteLegal: e.target.value })}
                              className="elegante-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <IdCard className="w-4 h-4 text-orange-primary" />
                              Documento Representante
                            </Label>
                            <Input
                              id="documentoRepresentante"
                              value={formData.documentoRepresentante}
                              onChange={(e) => setFormData({ ...formData, documentoRepresentante: e.target.value })}
                              className="elegante-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Phone className="w-4 h-4 text-orange-primary" />
                              Teléfono Representante
                            </Label>
                            <Input
                              id="telefonoRepresentante"
                              value={formData.telefonoRepresentante}
                              onChange={(e) => setFormData({ ...formData, telefonoRepresentante: e.target.value })}
                              className="elegante-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Mail className="w-4 h-4 text-orange-primary" />
                              Correo Representante
                            </Label>
                            <Input
                              id="correoRepresentante"
                              type="email"
                              value={formData.correoRepresentante}
                              onChange={(e) => setFormData({ ...formData, correoRepresentante: e.target.value })}
                              className="elegante-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-orange-primary" />
                              Sector Económico
                            </Label>
                            <Input
                              id="sectorEconomico"
                              value={formData.sectorEconomico}
                              onChange={(e) => setFormData({ ...formData, sectorEconomico: e.target.value })}
                              className="elegante-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-orange-primary" />
                              Años de Operación
                            </Label>
                            <Input
                              id="anosOperacion"
                              type="number"
                              min="0"
                              value={formData.anosOperacion}
                              onChange={(e) => setFormData({ ...formData, anosOperacion: parseInt(e.target.value) || 0 })}
                              className="elegante-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white-primary flex items-center gap-2">
                              <Globe className="w-4 h-4 text-orange-primary" />
                              Página Web
                            </Label>
                            <Input
                              id="paginaWeb"
                              value={formData.paginaWeb}
                              onChange={(e) => setFormData({ ...formData, paginaWeb: e.target.value })}
                              className="elegante-input"
                              placeholder="www.ejemplo.com"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          NIT
                        </Label>
                        <Input
                          id="nit"
                          value={formData.nit}
                          onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                          className="elegante-input"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-primary" />
                          Correo Electrónico
                        </Label>
                        <Input
                          id="correo"
                          type="email"
                          value={formData.correo}
                          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                          className="elegante-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Phone className="w-4 h-4 text-orange-primary" />
                          Número de Teléfono
                        </Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          className="elegante-input"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-primary" />
                          Dirección
                        </Label>
                        <Input
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          className="elegante-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                        className="elegante-button-secondary"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="elegante-button-primary"
                      >
                        Agregar Proveedor
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar por nombre, NIT, correo o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {currentProveedores.length} de {filteredProveedores.length} proveedores
              </div>
            </div>
          </div>

          {/* Tabla de Proveedores */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Proveedor</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">NIT</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Contacto</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Fecha</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-white-primary font-bold text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProveedores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Truck className="w-12 h-12 text-gray-medium mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white-primary mb-2">No hay proveedores</h3>
                      <p className="text-gray-lightest">
                        {searchTerm ? 'No se encontraron proveedores con ese criterio de búsqueda.' : 'Comience agregando un nuevo proveedor.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentProveedores.map((proveedor) => (
                    <tr
                      key={proveedor.id}
                      className="border-b border-gray-dark hover:bg-gray-darker transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-primary rounded-lg flex items-center justify-center">
                            {proveedor.tipoProveedor === 'Juridico' ? (
                              <Building className="w-4 h-4 text-black-primary" />
                            ) : (
                              <User className="w-4 h-4 text-black-primary" />
                            )}
                          </div>
                          <span className="text-sm text-gray-lighter">{proveedor.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-lighter">{proveedor.nit}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-lighter">{proveedor.correo}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-lighter">{proveedor.fechaCreacion}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`elegante-tag text-xs bg-gray-medium text-gray-lighter
                            }`}>
                            {proveedor.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(proveedor)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                          </button>
                          <button
                            onClick={() => handleEdit(proveedor)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(proveedor)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title={proveedor.activo ? "Desactivar" : "Activar"}
                          >
                            {proveedor.activo ? (
                              <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(proveedor)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de proveedores - OLD */}
        <div className="elegante-card" style={{ display: 'none' }}>
          {currentProveedores.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-medium mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white-primary mb-2">No hay proveedores</h3>
              <p className="text-gray-lightest">
                {searchTerm ? 'No se encontraron proveedores con ese criterio de búsqueda.' : 'Comience agregando un nuevo proveedor.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Encabezados de tabla */}
              <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-dark bg-gray-darker">
                <div className="text-sm font-medium text-white-primary">ID</div>
                <div className="text-sm font-medium text-white-primary">Proveedor</div>
                <div className="text-sm font-medium text-white-primary">Fecha</div>
                <div className="text-sm font-medium text-white-primary">Total</div>
                <div className="text-sm font-medium text-white-primary">Estado</div>
                <div className="text-sm font-medium text-white-primary">Acciones</div>
              </div>

              {/* Filas de datos */}
              <div className="space-y-0">
                {currentProveedores.map((proveedor) => (
                  <div
                    key={proveedor.id}
                    className="grid grid-cols-6 gap-4 p-4 border-b border-gray-dark hover:bg-gray-darker transition-colors"
                  >
                    {/* ID */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-primary rounded-lg flex items-center justify-center mr-3">
                        {proveedor.tipoProveedor === 'Juridico' ? (
                          <Building className="w-4 h-4 text-black-primary" />
                        ) : (
                          <User className="w-4 h-4 text-black-primary" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-white-primary">{proveedor.id}</span>
                    </div>

                    {/* Proveedor */}
                    <div>
                      <div className="text-sm font-medium text-white-primary">{proveedor.nombre}</div>
                      <div className="text-xs text-gray-lightest">{proveedor.correo}</div>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center">
                      <span className="text-sm text-gray-lightest">{proveedor.fechaCreacion}</span>
                    </div>

                    {/* Total */}
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-primary-orange">
                        ${(Math.random() * 3000000 + 500000).toLocaleString('es-CO')}
                      </span>
                      <div className="text-xs text-gray-lightest ml-1">
                        {proveedor.tipoProveedor === 'Juridico' ? 'Transferencia' : 'Efectivo'}
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-2">
                      <span className={`elegante-tag text-xs bg-gray-medium text-gray-lighter
                        }`}>
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(proveedor)}
                        className="flex items-center"
                      >
                        {proveedor.activo ? (
                          <ToggleRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-gray-medium" />
                        )}
                      </button>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(proveedor)}
                        className="elegante-button-secondary p-2 h-8 w-8"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(proveedor)}
                        className="elegante-button-secondary p-2 h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(proveedor)}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white p-2 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Modal de Edición */}
      {selectedProveedor && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <Edit className="w-5 h-5 text-orange-primary" />
                Editar Proveedor
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Modifique los datos del proveedor seleccionado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-primary" />
                    Tipo de Proveedor
                  </Label>
                  <select
                    id="editTipoProveedor"
                    value={formData.tipoProveedor}
                    onChange={(e) => setFormData({ ...formData, tipoProveedor: e.target.value as 'Juridico' | 'Natural' })}
                    className="elegante-input w-full"
                    required
                  >
                    {TIPOS_PROVEEDOR.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-primary" />
                    {formData.tipoProveedor === 'Juridico' ? 'Nombre de la Empresa' : 'Nombre Completo'}
                  </Label>
                  <Input
                    id="editNombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="elegante-input"
                    required
                  />
                </div>
              </div>

              {formData.tipoProveedor === 'Juridico' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-primary" />
                        Razón Social
                      </Label>
                      <Input
                        id="editRazonSocial"
                        value={formData.razonSocial}
                        onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-orange-primary" />
                        Representante Legal
                      </Label>
                      <Input
                        id="editRepresentanteLegal"
                        value={formData.representanteLegal}
                        onChange={(e) => setFormData({ ...formData, representanteLegal: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-orange-primary" />
                        Documento Representante
                      </Label>
                      <Input
                        id="editDocumentoRepresentante"
                        value={formData.documentoRepresentante}
                        onChange={(e) => setFormData({ ...formData, documentoRepresentante: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-primary" />
                        Teléfono Representante
                      </Label>
                      <Input
                        id="editTelefonoRepresentante"
                        value={formData.telefonoRepresentante}
                        onChange={(e) => setFormData({ ...formData, telefonoRepresentante: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-primary" />
                        Correo Representante
                      </Label>
                      <Input
                        id="editCorreoRepresentante"
                        type="email"
                        value={formData.correoRepresentante}
                        onChange={(e) => setFormData({ ...formData, correoRepresentante: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-orange-primary" />
                        Sector Económico
                      </Label>
                      <Input
                        id="editSectorEconomico"
                        value={formData.sectorEconomico}
                        onChange={(e) => setFormData({ ...formData, sectorEconomico: e.target.value })}
                        className="elegante-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-primary" />
                        Años de Operación
                      </Label>
                      <Input
                        id="editAnosOperacion"
                        type="number"
                        min="0"
                        value={formData.anosOperacion}
                        onChange={(e) => setFormData({ ...formData, anosOperacion: parseInt(e.target.value) || 0 })}
                        className="elegante-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-primary" />
                        Página Web
                      </Label>
                      <Input
                        id="editPaginaWeb"
                        value={formData.paginaWeb}
                        onChange={(e) => setFormData({ ...formData, paginaWeb: e.target.value })}
                        className="elegante-input"
                        placeholder="www.ejemplo.com"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-orange-primary" />
                    NIT
                  </Label>
                  <Input
                    id="editNit"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="elegante-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-primary" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="editCorreo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="elegante-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-primary" />
                    Número de Teléfono
                  </Label>
                  <Input
                    id="editNumero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="elegante-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-primary" />
                    Dirección
                  </Label>
                  <Input
                    id="editDireccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="elegante-input"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedProveedor(null);
                    resetForm();
                  }}
                  className="elegante-button-secondary"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="elegante-button-primary"
                >
                  Actualizar Proveedor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Detalle */}
      {selectedProveedor && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-orange" />
                Detalle del Proveedor
              </DialogTitle>
              <DialogDescription>
                Información completa del proveedor seleccionado
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="elegante-card bg-gray-darker">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-primary rounded-lg flex items-center justify-center">
                    {selectedProveedor.tipoProveedor === 'Juridico' ? (
                      <Building className="w-5 h-5 text-black-primary" />
                    ) : (
                      <User className="w-5 h-5 text-black-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white-primary">{selectedProveedor.nombre}</h3>
                    <p className="text-sm text-gray-lightest">{getTipoProveedorLabel(selectedProveedor.tipoProveedor)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-gray-lightest" />
                    <span className="text-sm text-gray-lightest">NIT:</span>
                    <span className="text-sm text-white-primary">{selectedProveedor.nit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-lightest" />
                    <span className="text-sm text-gray-lightest">Fecha registro:</span>
                    <span className="text-sm text-white-primary">{selectedProveedor.fechaCreacion}</span>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="elegante-card bg-gray-darker">
                <h4 className="text-sm font-medium text-white-primary mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-orange" />
                  Información de Contacto
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-lightest" />
                    <span className="text-sm text-gray-lightest">Correo:</span>
                    <span className="text-sm text-white-primary">{selectedProveedor.correo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-lightest" />
                    <span className="text-sm text-gray-lightest">Teléfono:</span>
                    <span className="text-sm text-white-primary">{selectedProveedor.numero}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-lightest" />
                    <span className="text-sm text-gray-lightest">Dirección:</span>
                    <span className="text-sm text-white-primary">{selectedProveedor.direccion}</span>
                  </div>
                </div>
              </div>

              {/* Información específica para proveedores jurídicos */}
              {selectedProveedor.tipoProveedor === 'Juridico' && (
                <div className="elegante-card bg-gray-darker">
                  <h4 className="text-sm font-medium text-white-primary mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary-orange" />
                    Información Empresarial
                  </h4>
                  <div className="space-y-3">
                    {selectedProveedor.razonSocial && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-lightest" />
                        <span className="text-sm text-gray-lightest">Razón Social:</span>
                        <span className="text-sm text-white-primary">{selectedProveedor.razonSocial}</span>
                      </div>
                    )}
                    {selectedProveedor.representanteLegal && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-lightest" />
                        <span className="text-sm text-gray-lightest">Representante Legal:</span>
                        <span className="text-sm text-white-primary">{selectedProveedor.representanteLegal}</span>
                      </div>
                    )}
                    {selectedProveedor.sectorEconomico && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-lightest" />
                        <span className="text-sm text-gray-lightest">Sector Económico:</span>
                        <span className="text-sm text-white-primary">{selectedProveedor.sectorEconomico}</span>
                      </div>
                    )}
                    {selectedProveedor.anosOperacion && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-lightest" />
                        <span className="text-sm text-gray-lightest">Años de Operación:</span>
                        <span className="text-sm text-white-primary">{selectedProveedor.anosOperacion} años</span>
                      </div>
                    )}
                    {selectedProveedor.paginaWeb && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-lightest" />
                        <span className="text-sm text-gray-lightest">Página Web:</span>
                        <span className="text-sm text-primary-orange">{selectedProveedor.paginaWeb}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="elegante-card bg-gray-darker">
                <h4 className="text-sm font-medium text-white-primary mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary-orange" />
                  Estado del Proveedor
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`elegante-tag ${selectedProveedor.activo ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {selectedProveedor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsDetailDialogOpen(false)}
                className="elegante-button-primary"
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertContainer />
      <DoubleConfirmationContainer />
    </>
  );
}