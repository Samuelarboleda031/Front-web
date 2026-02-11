import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import { 
  Users, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Plus, 
  Edit, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  UserCheck,
  AlertCircle,
  CreditCard,
  UserPlus,
  MapPin,
  Calendar as CalendarIcon,
  IdCard,
  Wallet,
  RotateCcw,
  TrendingUp,
  History,
  Camera,
  Upload,
  X,
  Trash2,
  Key,
  EyeOff
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useCustomAlert } from "../ui/custom-alert";
import { useDoubleConfirmation } from "../ui/double-confirmation";

// Tipos de documento
const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'NIT', label: 'NIT' }
];

// Tipo de datos del cliente actualizado
interface Cliente {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  barrio?: string; // Campo agregado para barrio
  fechaNacimiento: string;
  fechaRegistro: string;
  ultimaVisita: string;
  activo: boolean;
  saldoAFavor: number;
  fotoPerfil?: string; // Nueva propiedad para la foto de perfil
  contraseña?: string; // Campo agregado para contraseña
}

// Interface para devoluciones (simulada desde el módulo de devoluciones)
interface Devolucion {
  id: string;
  cliente: string;
  clienteId: string;
  producto: string;
  tipo: 'Producto' | 'Servicio';
  motivoCategoria: string;
  motivoDetalle: string;
  observaciones?: string;
  fecha: string;
  hora: string;
  monto: number;
  estado: 'Activo' | 'Inactivo';
  responsable: string;
  numeroVenta: string;
  saldoAFavor: number;
}

// Datos mock de devoluciones (simulados desde el módulo de devoluciones)
const devolucionesMockData: Devolucion[] = [
  {
    id: "DEV001",
    cliente: "Juan Carlos Pérez Gómez",
    clienteId: "cliente-1",
    producto: "Champú Premium",
    tipo: "Producto",
    motivoCategoria: "producto_defectuoso",
    motivoDetalle: "Producto Defectuoso",
    observaciones: "Envase roto, producto derramado",
    fecha: "23-08-2025",
    hora: "14:30",
    monto: 35000,
    estado: "Activo",
    responsable: "Miguel Rodriguez",
    numeroVenta: "VEN001",
    saldoAFavor: 35000
  },
  {
    id: "DEV002",
    cliente: "María Alejandra González Rodríguez",
    clienteId: "cliente-2",
    producto: "Corte de Cabello",
    tipo: "Servicio",
    motivoCategoria: "servicio_insatisfactorio",
    motivoDetalle: "Servicio Insatisfactorio",
    observaciones: "Corte no cumplió expectativas del cliente",
    fecha: "22-08-2025",
    hora: "16:45",
    monto: 25000,
    estado: "Activo",
    responsable: "Sofia Martinez",
    numeroVenta: "VEN002",
    saldoAFavor: 25000
  },
  {
    id: "DEV003",
    cliente: "Carlos Eduardo Ruiz López",
    clienteId: "cliente-3",
    producto: "Aceite de Barba",
    tipo: "Producto",
    motivoCategoria: "reaccion_alergica",
    motivoDetalle: "Reacción Alérgica",
    observaciones: "Cliente presentó irritación en la piel",
    fecha: "21-08-2025",
    hora: "11:20",
    monto: 28000,
    estado: "Inactivo",
    responsable: "Ana López",
    numeroVenta: "VEN003",
    saldoAFavor: 0
  },
  {
    id: "DEV006",
    cliente: "Juan Carlos Pérez Gómez",
    clienteId: "cliente-1",
    producto: "Cera para Cabello",
    tipo: "Producto",
    motivoCategoria: "no_conforme",
    motivoDetalle: "No Conforme con Expectativas",
    observaciones: "Textura diferente a la esperada",
    fecha: "15-08-2025",
    hora: "10:20",
    monto: 22000,
    estado: "Activo",
    responsable: "Ana López",
    numeroVenta: "VEN006",
    saldoAFavor: 22000
  },
  {
    id: "DEV007",
    cliente: "Juan Carlos Pérez Gómez",
    clienteId: "cliente-1",
    producto: "Afeitado Clásico",
    tipo: "Servicio",
    motivoCategoria: "servicio_insatisfactorio",
    motivoDetalle: "Servicio Insatisfactorio",
    observaciones: "Corte menor en mejilla",
    fecha: "10-08-2025",
    hora: "16:45",
    monto: 18000,
    estado: "Activo",
    responsable: "Miguel Rodriguez",
    numeroVenta: "VEN007",
    saldoAFavor: 18000
  },
  {
    id: "DEV004",
    cliente: "Laura Sofía Zapata Herrera",
    clienteId: "cliente-4",
    producto: "Tratamiento Capilar",
    tipo: "Servicio",
    motivoCategoria: "cancelacion_cliente",
    motivoDetalle: "Cancelación por Cliente",
    observaciones: "Cliente enfermo, no pudo asistir",
    fecha: "20-08-2025",
    hora: "09:15",
    monto: 45000,
    estado: "Activo",
    responsable: "Miguel Rodriguez",
    numeroVenta: "VEN004",
    saldoAFavor: 45000
  }
];

// Función para formatear moneda colombiana
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

// Función para calcular el saldo a favor acumulativo de un cliente
const calcularSaldoAFavorCliente = (clienteId: string, devoluciones: Devolucion[]): number => {
  return devoluciones
    .filter(d => d.clienteId === clienteId && d.estado === 'Activo')
    .reduce((total, d) => total + d.saldoAFavor, 0);
};

// Datos mock de clientes con estructura actualizada (incluyendo saldo a favor)
const clientesMockDataBase: Cliente[] = [
  {
    id: "cliente-1",
    tipoDocumento: "CC",
    numeroDocumento: "1234567890",
    nombre: "Juan Carlos",
    apellido: "Pérez Gómez",
    email: "juan.perez@email.com",
    telefono: "+57 301 234 5678",
    direccion: "Calle 123 #45-67, Bogotá",
    barrio: "Chapinero",
    fechaNacimiento: "15-03-1985",
    fechaRegistro: "15-06-2025",
    ultimaVisita: "01-08-2025",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "cliente123"
  },
  {
    id: "cliente-2", 
    tipoDocumento: "CC",
    numeroDocumento: "9876543210",
    nombre: "María Alejandra",
    apellido: "González Rodríguez",
    email: "maria.gonzalez@email.com",
    telefono: "+57 302 345 6789",
    direccion: "Carrera 78 #12-34, Medellín",
    barrio: "Poblado",
    fechaNacimiento: "22-07-1990",
    fechaRegistro: "22-06-2025",
    ultimaVisita: "28-07-2025",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "cliente456"
  },
  {
    id: "cliente-3",
    tipoDocumento: "CE",
    numeroDocumento: "5555666677",
    nombre: "Carlos Eduardo",
    apellido: "Ruiz López",
    email: "carlos.ruiz@email.com",
    telefono: "+57 303 456 7890",
    direccion: "Avenida 40 #67-89, Cali",
    barrio: "Granada",
    fechaNacimiento: "10-12-1988",
    fechaRegistro: "10-07-2025",
    ultimaVisita: "25-07-2025",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "cliente789"
  },
  {
    id: "cliente-4",
    tipoDocumento: "TI",
    numeroDocumento: "1122334455",
    nombre: "Laura Sofía",
    apellido: "Zapata Herrera",
    email: "laura.zapata@email.com",
    telefono: "+57 304 567 8901",
    direccion: "Calle 56 #23-45, Barranquilla",
    barrio: "Norte",
    fechaNacimiento: "18-05-2005",
    fechaRegistro: "18-07-2025",
    ultimaVisita: "",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "cliente321"
  },
  {
    id: "cliente-5",
    tipoDocumento: "PP",
    numeroDocumento: "9988776655",
    nombre: "Pedro Antonio",
    apellido: "López Martínez",
    email: "pedro.lopez@email.com",
    telefono: "+57 305 678 9012",
    direccion: "Diagonal 15 #78-90, Bucaramanga",
    barrio: "Cabecera",
    fechaNacimiento: "25-11-1982",
    fechaRegistro: "25-07-2025",
    ultimaVisita: "30-07-2025",
    activo: false,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "cliente654"
  }
];

// Función para inicializar clientes con saldos calculados
const initializeClientesWithSaldos = (): Cliente[] => {
  return clientesMockDataBase.map(cliente => ({
    ...cliente,
    saldoAFavor: calcularSaldoAFavorCliente(cliente.id, devolucionesMockData)
  }));
};

export function ClientesPage() {
  const { success, error: showAlert, created, edited, deleted, AlertContainer } = useCustomAlert();
  const { confirmDeleteAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [clientes, setClientes] = useState<Cliente[]>(initializeClientesWithSaldos());
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(devolucionesMockData);
  const [isHistorialSaldosOpen, setIsHistorialSaldosOpen] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [createForm, setCreateForm] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: '',
    fotoPerfil: '',
    contraseña: '',
    confirmarContraseña: ''
  });

  // Estados para manejo de foto de perfil
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: ''
  });

  const filteredClientes = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.barrio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage);

  // Función para actualizar saldos de todos los clientes
  const actualizarSaldosClientes = () => {
    setClientes(prev => prev.map(cliente => ({
      ...cliente,
      saldoAFavor: calcularSaldoAFavorCliente(cliente.id, devoluciones)
    })));
  };

  // Effect para actualizar saldos cuando cambien las devoluciones
  useEffect(() => {
    actualizarSaldosClientes();
  }, [devoluciones]);

  const refreshClientes = () => {
    setClientes(initializeClientesWithSaldos());
  };



  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(displayedClientes.map(c => c.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id));
    }
  };

  // Funciones para manejo de imagen de perfil
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Archivo inválido', 'Por favor selecciona una imagen válida (JPG, PNG, etc.)');
        return;
      }

      // Validar tamaño de archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Archivo muy grande', 'La imagen debe pesar menos de 5MB');
        return;
      }

      setSelectedProfileImage(file);
      
      // Crear URL de vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setSelectedProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleCreateClick = () => {
    setCreateForm({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      barrio: '',
      fechaNacimiento: '',
      fotoPerfil: '',
      contraseña: '',
      confirmarContraseña: ''
    });
    setSelectedProfileImage(null);
    setPreviewUrl(null);
    setError('');
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEditForm({
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      barrio: cliente.barrio || '',
      fechaNacimiento: cliente.fechaNacimiento
    });
    setError('');
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (cliente: Cliente) => {
    confirmDeleteAction(
      `${cliente.nombre} ${cliente.apellido} (${cliente.tipoDocumento} ${cliente.numeroDocumento})`,
      () => {
        setClientes(prev => prev.filter(c => c.id !== cliente.id));
        setSelectedItems(prev => prev.filter(id => id !== cliente.id));
      },
      {
        confirmTitle: "Confirmar Eliminación de Cliente",
        confirmMessage: `¿Estás seguro de que deseas eliminar permanentemente al cliente "${cliente.nombre} ${cliente.apellido}" con documento "${cliente.tipoDocumento} ${cliente.numeroDocumento}"?`,
        successTitle: "¡Cliente eliminado exitosamente!",
        successMessage: `El cliente ha sido eliminado permanentemente del sistema.`,
        requireInput: true
      }
    );
  };

  const toggleEstadoCliente = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    setClientes(clientes.map(c => 
      c.id === clienteId 
        ? { ...c, activo: !c.activo }
        : c
    ));

    // Mostrar alerta según el nuevo estado
    if (cliente.activo) {
      // Se va a desactivar
      success(
        `Cliente desactivado ⚠️`, 
        `El cliente ${cliente.nombre} ${cliente.apellido} (${cliente.tipoDocumento} ${cliente.numeroDocumento}) ha sido desactivado exitosamente.`
      );
    } else {
      // Se va a activar
      success(
        `Cliente activado ✔️`, 
        `El cliente ${cliente.nombre} ${cliente.apellido} (${cliente.tipoDocumento} ${cliente.numeroDocumento}) ha sido activado exitosamente.`
      );
    }
  };

  const validateForm = (form: any, isEdit: boolean = false) => {
    if (!form.numeroDocumento || !form.nombre || !form.apellido || !form.email) {
      showAlert('error', 'Campos obligatorios faltantes', 'Por favor completa todos los campos obligatorios: tipo de documento, número de documento, nombre, apellido y email.');
      return false;
    }

    // Validar contraseñas solo en modo creación
    if (!isEdit) {
      if (!form.contraseña || !form.confirmarContraseña) {
        showAlert('error', 'Contraseña requerida', 'Por favor ingresa una contraseña y confírmala.');
        return false;
      }

      if (form.contraseña !== form.confirmarContraseña) {
        showAlert('error', 'Contraseñas no coinciden', 'La contraseña y la confirmación deben ser idénticas.');
        return false;
      }

      if (form.contraseña.length < 6) {
        showAlert('error', 'Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showAlert('error', 'Email inválido', 'Por favor ingresa un email válido con el formato correcto.');
      return false;
    }

    // En modo edición, no validar documento duplicado ya que no se puede editar
    if (!isEdit) {
      // Verificar si el documento ya existe (solo en creación)
      const documentoExiste = clientes.some(c => 
        c.numeroDocumento === form.numeroDocumento && 
        c.tipoDocumento === form.tipoDocumento
      );
      
      if (documentoExiste) {
        showAlert('error', 'Documento duplicado', 'Ya existe un cliente registrado con este tipo y número de documento.');
        return false;
      }
    }

    // Verificar si el email ya existe (solo en creación o al cambiar email en edición)
    const emailExiste = clientes.some(c => 
      c.email === form.email &&
      (!isEdit || c.id !== selectedCliente?.id)
    );
    
    if (emailExiste) {
      showAlert('error', 'Email duplicado', 'Ya existe un cliente registrado con este email.');
      return false;
    }

    return true;
  };

  const handleCreateCliente = () => {
    if (!validateForm(createForm)) {
      return;
    }
    setIsCreateConfirmOpen(true);
  };

  const confirmCreateCliente = () => {
    // Convertir imagen a base64 si existe
    let fotoPerfilBase64 = '';
    if (selectedProfileImage && previewUrl) {
      fotoPerfilBase64 = previewUrl;
    }

    const nuevoCliente: Cliente = {
      id: `cliente-${Date.now()}`,
      ...createForm,
      fotoPerfil: fotoPerfilBase64,
      fechaRegistro: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      ultimaVisita: '',
      activo: true,
      saldoAFavor: 0, // Nuevo cliente sin saldo inicial
      contraseña: createForm.contraseña
    };

    setClientes([nuevoCliente, ...clientes]);
    setIsCreateDialogOpen(false);
    setIsCreateConfirmOpen(false);
    setCreateForm({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      barrio: '',
      fechaNacimiento: '',
      fotoPerfil: '',
      contraseña: '',
      confirmarContraseña: ''
    });
    setSelectedProfileImage(null);
    setPreviewUrl(null);
    setError('');
    
    created('Cliente creado exitosamente ✔️', `El cliente ${nuevoCliente.nombre} ${nuevoCliente.apellido} ha sido registrado en el sistema.`);
  };

  const handleUpdateCliente = () => {
    if (!selectedCliente || !validateForm(editForm, true)) {
      return;
    }
    setIsEditConfirmOpen(true);
  };

  const confirmUpdateCliente = () => {
    if (!selectedCliente) return;

    const clienteActualizado: Cliente = {
      ...selectedCliente,
      // Solo actualizar campos editables (excluir tipoDocumento y numeroDocumento)
      nombre: editForm.nombre,
      apellido: editForm.apellido,
      email: editForm.email,
      telefono: editForm.telefono,
      direccion: editForm.direccion,
      barrio: editForm.barrio,
      fechaNacimiento: editForm.fechaNacimiento
    };

    setClientes(clientes.map(c => 
      c.id === selectedCliente.id ? clienteActualizado : c
    ));
    
    setIsEditDialogOpen(false);
    setIsEditConfirmOpen(false);
    setSelectedCliente(null);
    setError('');
    
    edited('Cliente actualizado exitosamente ✔️', `Los datos de ${clienteActualizado.nombre} ${clienteActualizado.apellido} han sido actualizados correctamente.`);
  };

  const getEstadoColor = (ultimaVisita?: string) => {
    if (!ultimaVisita) return "bg-gray-600 text-white";
    
    const fechaVisita = new Date(ultimaVisita.split('-').reverse().join('-'));
    const ahora = new Date();
    const diasSinVisitar = Math.floor((ahora.getTime() - fechaVisita.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasSinVisitar <= 30) return "bg-green-600 text-white";
    if (diasSinVisitar <= 60) return "bg-orange-primary text-white";
    return "bg-red-600 text-white";
  };

  const getEstadoTexto = (ultimaVisita?: string) => {
    if (!ultimaVisita) return "Nuevo";
    
    const fechaVisita = new Date(ultimaVisita.split('-').reverse().join('-'));
    const ahora = new Date();
    const diasSinVisitar = Math.floor((ahora.getTime() - fechaVisita.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasSinVisitar <= 30) return "Activo";
    if (diasSinVisitar <= 60) return "Regular";
    return "Inactivo";
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    const tipoDoc = TIPOS_DOCUMENTO.find(t => t.value === tipo);
    return tipoDoc ? tipoDoc.label : tipo;
  };

  // Función para obtener las devoluciones de un cliente específico
  const getDevolucionesCliente = (clienteId: string) => {
    return devoluciones
      .filter(d => d.clienteId === clienteId)
      .sort((a, b) => new Date(b.fecha.split('-').reverse().join('-')).getTime() - new Date(a.fecha.split('-').reverse().join('-')).getTime());
  };

  // Estadísticas de saldos
  const totalClientesConSaldo = clientes.filter(c => c.saldoAFavor > 0).length;
  const totalSaldosAFavor = clientes.reduce((total, c) => total + c.saldoAFavor, 0);
  const promedioSaldoCliente = totalClientesConSaldo > 0 ? totalSaldosAFavor / totalClientesConSaldo : 0;

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Clientes</h1>
            <p className="text-sm text-gray-lightest mt-1">Administra los clientes registrados con sus saldos a favor acumulativos</p>
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
                onClick={handleCreateClick}
                className="elegante-button-primary gap-2 flex items-center"
              >
                <UserPlus className="w-4 h-4" />
                Añadir Cliente
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <Input
                  placeholder="Buscar por documento, nombre, email, teléfono o barrio"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedClientes.length} de {filteredClientes.length} clientes
              </div>
            </div>
          </div>

          {/* Tabla de Clientes */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === displayedClientes.length && displayedClientes.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded bg-gray-darker border-gray-dark"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Nombre</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Apellido</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Telefono</th>
                  <th className="text-center py-3 px-4 text-gray-lightest font-medium text-sm">Saldo a Favor</th>
                  <th className="text-center py-3 px-4 text-gray-lightest font-medium text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-gray-lightest font-medium text-sm min-w-[140px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedClientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(cliente.id)}
                        onChange={(e) => handleSelectItem(cliente.id, e.target.checked)}
                        className="rounded bg-gray-darker border-gray-dark"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <IdCard className="w-4 h-4 text-orange-primary" />
                        <span className="font-semibold text-white-primary">{cliente.numeroDocumento}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        {cliente.fotoPerfil ? (
                          <img
                            src={cliente.fotoPerfil}
                            alt={`Foto de ${cliente.nombre}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-orange-primary"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-dark border-2 border-gray-medium flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-lightest" />
                          </div>
                        )}
                        <span className="font-semibold text-white-primary">{cliente.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                        <span className="font-semibold text-white-primary">{cliente.apellido}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white-primary">{cliente.email}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                        {cliente.saldoAFavor > 0 ? (
                        <span className="text-orange-secondary font-semibold">${formatCurrency(cliente.saldoAFavor)}</span>
                      ) : (
                        <span className="text-gray-medium">$0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${!cliente.activo
                          ? 'bg-red-600 text-white'
                              : getEstadoTexto(cliente.ultimaVisita) === 'Activo'
                            ? 'bg-green-600 text-white'
                                : getEstadoTexto(cliente.ultimaVisita) === 'Regular'
                              ? 'bg-orange-primary text-white'
                              : 'bg-gray-600 text-white'
                        }`}>
                        {!cliente.activo ? 'Inactivo' : getEstadoTexto(cliente.ultimaVisita)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCliente(cliente);
                            setIsDetailDialogOpen(true);
                          }}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>

                        <button
                          onClick={() => handleEditClick(cliente)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(cliente)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {displayedClientes.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white-primary mb-2">No se encontraron clientes</h3>
                <p className="text-gray-lightest">Intenta con otros términos de búsqueda</p>
              </div>
            )}
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

        {/* Dialog de Resumen de Saldos */}
        <Dialog open={isHistorialSaldosOpen} onOpenChange={setIsHistorialSaldosOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange-primary" />
                Resumen de Saldos a Favor
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Detalle de todos los saldos acumulativos por cliente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Estadísticas generales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="elegante-card text-center">
                  <Users className="w-6 h-6 text-orange-primary mx-auto mb-2" />
                  <h4 className="text-xl font-bold text-white-primary mb-1">{totalClientesConSaldo}</h4>
                  <p className="text-gray-lightest text-sm">Clientes con Saldo</p>
                </div>
                <div className="elegante-card text-center">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <h4 className="text-xl font-bold text-white-primary mb-1">${formatCurrency(totalSaldosAFavor)}</h4>
                  <p className="text-gray-lightest text-sm">Total Acumulado</p>
                </div>
                <div className="elegante-card text-center">
                  <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-xl font-bold text-white-primary mb-1">${formatCurrency(promedioSaldoCliente)}</h4>
                  <p className="text-gray-lightest text-sm">Promedio por Cliente</p>
                </div>
              </div>

              {/* Lista de clientes con saldo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white-primary">Clientes con Saldo a Favor</h3>
                
                {clientes
                  .filter(c => c.saldoAFavor > 0)
                  .sort((a, b) => b.saldoAFavor - a.saldoAFavor)
                  .map((cliente) => {
                    const devolucionesCliente = getDevolucionesCliente(cliente.id).filter(d => d.estado === 'Activo');
                    return (
                      <div key={cliente.id} className="elegante-card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <UserIcon className="w-5 h-5 text-orange-primary" />
                            <div>
                              <h4 className="font-semibold text-white-primary">{cliente.nombre} {cliente.apellido}</h4>
                              <p className="text-sm text-gray-lightest">{cliente.tipoDocumento} {cliente.numeroDocumento}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Wallet className="w-5 h-5 text-orange-secondary" />
                              <span className="text-xl font-bold text-orange-secondary">${formatCurrency(cliente.saldoAFavor)}</span>
                            </div>
                            <p className="text-sm text-gray-lightest">{devolucionesCliente.length} devolución(es)</p>
                          </div>
                        </div>

                        {/* Historial de devoluciones del cliente */}
                        <div className="border-t border-gray-dark pt-3">
                          <h5 className="text-sm font-semibold text-white-primary mb-2 flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Historial de Devoluciones
                          </h5>
                          <div className="space-y-2">
                            {devolucionesCliente.map((devolucion) => (
                              <div key={devolucion.id} className="flex items-center justify-between py-2 px-3 bg-gray-darker rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <RotateCcw className="w-4 h-4 text-orange-primary" />
                                  <div>
                                    <p className="font-medium text-white-primary">{devolucion.producto}</p>
                                    <p className="text-xs text-gray-lightest">{devolucion.fecha} - {devolucion.motivoDetalle}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold text-orange-secondary">${formatCurrency(devolucion.saldoAFavor)}</span>
                                  <p className="text-xs text-gray-lightest">{devolucion.tipo}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {totalClientesConSaldo === 0 && (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-gray-medium mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white-primary mb-2">No hay saldos a favor</h3>
                    <p className="text-gray-lightest">Actualmente no hay clientes con saldo a favor acumulado</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Detalle del Cliente (actualizado con saldo) */}
        {selectedCliente && (
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="bg-gray-darkest border-gray-dark max-w-3xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-white-primary flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-orange-primary" />
                  Detalle del Cliente
                </DialogTitle>
                <DialogDescription className="text-gray-lightest">
                  Información completa del cliente incluyendo saldo a favor
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Información principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white-primary font-semibold">Información Personal</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <IdCard className="w-4 h-4 text-orange-primary" />
                          <span className="text-sm text-gray-lightest">{getTipoDocumentoLabel(selectedCliente.tipoDocumento)}: {selectedCliente.numeroDocumento}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-orange-primary" />
                          <span className="text-sm text-white-primary font-medium">{selectedCliente.nombre} {selectedCliente.apellido}</span>
                        </div>
                        {selectedCliente.fechaNacimiento && (
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-orange-primary" />
                            <span className="text-sm text-gray-lightest">Nació: {selectedCliente.fechaNacimiento}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white-primary font-semibold">Contacto</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-orange-primary" />
                          <span className="text-sm text-gray-lightest">{selectedCliente.email}</span>
                        </div>
                        {selectedCliente.telefono && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-orange-primary" />
                            <span className="text-sm text-gray-lightest">{selectedCliente.telefono}</span>
                          </div>
                        )}
                        {selectedCliente.direccion && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-orange-primary" />
                            <span className="text-sm text-gray-lightest">{selectedCliente.direccion}</span>
                          </div>
                        )}
                        {selectedCliente.barrio && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-orange-primary" />
                            <span className="text-sm text-gray-lightest">Barrio: {selectedCliente.barrio}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Saldo a favor destacado */}
                    <div className="elegante-card bg-gray-darker">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white-primary flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-orange-secondary" />
                          Saldo a Favor
                        </h4>
                        <span className="text-2xl font-bold text-orange-secondary">
                          ${formatCurrency(selectedCliente.saldoAFavor)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-lightest">
                        {selectedCliente.saldoAFavor > 0 
                          ? `Acumulado de ${getDevolucionesCliente(selectedCliente.id).filter(d => d.estado === 'Activo').length} devolución(es) activa(s)`
                          : "Sin saldo a favor actualmente"
                        }
                      </div>
                    </div>

                    <div>
                      <Label className="text-white-primary font-semibold">Estados</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${selectedCliente.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-lightest">
                            Cliente {selectedCliente.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-orange-primary" />
                          <span className="text-sm text-gray-lightest">
                            Registrado: {selectedCliente.fechaRegistro}
                          </span>
                        </div>
                        {selectedCliente.ultimaVisita && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-orange-primary" />
                            <span className="text-sm text-gray-lightest">
                              Última visita: {selectedCliente.ultimaVisita}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Acceso */}
                <div className="elegante-card bg-gray-darker">
                  <h4 className="font-semibold text-white-primary mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-primary" />
                    Información de Acceso
                  </h4>
                  <div className="space-y-2">
                    {selectedCliente.contraseña && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-primary"></div>
                        <span className="text-sm text-gray-lightest">Contraseña: </span>
                        <span className="text-sm text-white-primary font-mono bg-gray-darkest px-2 py-1 rounded border border-gray-dark">
                          {selectedCliente.contraseña}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-light mt-2">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Esta información es confidencial y solo debe ser usada por el personal autorizado
                    </div>
                  </div>
                </div>

                {/* Historial de devoluciones si tiene saldo */}
                {selectedCliente.saldoAFavor > 0 && (
                  <div>
                    <h4 className="font-semibold text-white-primary mb-3 flex items-center gap-2">
                      <History className="w-5 h-5 text-orange-primary" />
                      Historial de Devoluciones
                    </h4>
                    <div className="space-y-2">
                      {getDevolucionesCliente(selectedCliente.id)
                        .filter(d => d.estado === 'Activo')
                        .map((devolucion) => (
                        <div key={devolucion.id} className="flex items-center justify-between py-3 px-4 bg-gray-darker rounded-lg border border-gray-dark">
                          <div className="flex items-center space-x-3">
                            <RotateCcw className="w-4 h-4 text-orange-primary" />
                            <div>
                              <p className="font-medium text-white-primary">{devolucion.producto}</p>
                              <p className="text-sm text-gray-lightest">{devolucion.fecha} - {devolucion.motivoDetalle}</p>
                              {devolucion.observaciones && (
                                <p className="text-xs text-gray-light mt-1">"{devolucion.observaciones}"</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                              <span className="font-semibold text-orange-secondary text-lg">${formatCurrency(devolucion.saldoAFavor)}</span>
                            <p className="text-sm text-gray-lightest">{devolucion.tipo}</p>
                            <p className="text-xs text-gray-light">Venta: {devolucion.numeroVenta}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Resto de los diálogos existentes (crear, editar, confirmaciones) */}
        {/* Dialog de Creación */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-primary" />
                Añadir Nuevo Cliente
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Completa la información del nuevo cliente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Tipo y Número de Documento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-orange-primary" />
                    Tipo de Documento *
                  </Label>
                  <select
                    value={createForm.tipoDocumento}
                    onChange={(e) => setCreateForm({ ...createForm, tipoDocumento: e.target.value })}
                    className="elegante-input w-full"
                  >
                    {TIPOS_DOCUMENTO.map(tipo => (
                      <option key={`create-${tipo.value}`} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white-primary">Número de Documento *</Label>
                  <Input
                    value={createForm.numeroDocumento}
                    onChange={(e) => setCreateForm({ ...createForm, numeroDocumento: e.target.value })}
                    placeholder="1234567890"
                    className="elegante-input"
                  />
                </div>
              </div>
              
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-orange-primary" />
                    Nombre *
                  </Label>
                  <Input
                    value={createForm.nombre}
                    onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                    placeholder="Juan Carlos"
                    className="elegante-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white-primary">Apellido *</Label>
                  <Input
                    value={createForm.apellido}
                    onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                    placeholder="Pérez Gómez"
                    className="elegante-input"
                  />
                </div>
              </div>

              {/* Email y Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-primary" />
                    Email *
                  </Label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="juan.perez@email.com"
                    className="elegante-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-primary" />
                    Teléfono
                  </Label>
                  <Input
                    value={createForm.telefono}
                    onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })}
                    placeholder="+57 301 234 5678"
                    className="elegante-input"
                  />
                </div>
              </div>

              {/* Dirección y Barrio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-primary" />
                    Dirección
                  </Label>
                  <Input
                    value={createForm.direccion}
                    onChange={(e) => setCreateForm({ ...createForm, direccion: e.target.value })}
                    placeholder="Calle 123 #45-67, Bogotá"
                    className="elegante-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-primary" />
                    Barrio
                  </Label>
                  <Input
                    value={createForm.barrio}
                    onChange={(e) => setCreateForm({ ...createForm, barrio: e.target.value })}
                    placeholder="Chapinero, Poblado, etc."
                    className="elegante-input"
                  />
                </div>
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-primary" />
                  Fecha de Nacimiento
                </Label>
                <Input
                  value={createForm.fechaNacimiento}
                  onChange={(e) => setCreateForm({ ...createForm, fechaNacimiento: e.target.value })}
                  placeholder="15-03-1985"
                  className="elegante-input"
                />
              </div>

              {/* Contraseña y Confirmar Contraseña */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-primary" />
                    Contraseña *
                  </Label>
                  <Input
                    type="password"
                    value={createForm.contraseña}
                    onChange={(e) => setCreateForm({ ...createForm, contraseña: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="elegante-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-primary" />
                    Confirmar Contraseña *
                  </Label>
                  <Input
                    type="password"
                    value={createForm.confirmarContraseña}
                    onChange={(e) => setCreateForm({ ...createForm, confirmarContraseña: e.target.value })}
                    placeholder="Repetir contraseña"
                    className="elegante-input"
                  />
                </div>
              </div>

              {/* Nota informativa sobre la contraseña */}
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-orange-primary/10 border border-orange-primary/20">
                <AlertCircle className="w-4 h-4 text-orange-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-lightest">
                  <p className="font-medium text-white-primary mb-1">Información de acceso</p>
                  <p>Esta contraseña será utilizada por el cliente para acceder al sistema. Debe tener al menos 6 caracteres y ser fácil de recordar para el cliente.</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="elegante-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCliente}
                  className="elegante-button-primary"
                >
                  Crear Cliente
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Edición de Cliente */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white-primary">Editar Cliente</DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Modifica los datos del cliente. El tipo y número de documento no pueden ser modificados.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Documento - Solo lectura */}
                <div>
                  <Label htmlFor="edit-tipo-documento" className="text-white-primary">
                    Tipo de Documento *
                  </Label>
                  <select
                    id="edit-tipo-documento"
                    value={editForm.tipoDocumento}
                    disabled
                    className="elegante-input mt-2 opacity-50 cursor-not-allowed"
                  >
                    {TIPOS_DOCUMENTO.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-light mt-1">Este campo no puede ser modificado</p>
                </div>

                {/* Número de Documento - Solo lectura */}
                <div>
                  <Label htmlFor="edit-numero-documento" className="text-white-primary">
                    Número de Documento *
                  </Label>
                  <Input
                    id="edit-numero-documento"
                    value={editForm.numeroDocumento}
                    readOnly
                    className="elegante-input mt-2 opacity-50 cursor-not-allowed"
                    placeholder="Número de documento"
                  />
                  <p className="text-xs text-gray-light mt-1">Este campo no puede ser modificado</p>
                </div>

                {/* Nombre - Editable */}
                <div>
                  <Label htmlFor="edit-nombre" className="text-white-primary">
                    Nombre *
                  </Label>
                  <Input
                    id="edit-nombre"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="elegante-input mt-2"
                    placeholder="Nombre del cliente"
                  />
                </div>

                {/* Apellido - Editable */}
                <div>
                  <Label htmlFor="edit-apellido" className="text-white-primary">
                    Apellido *
                  </Label>
                  <Input
                    id="edit-apellido"
                    value={editForm.apellido}
                    onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                    className="elegante-input mt-2"
                    placeholder="Apellido del cliente"
                  />
                </div>

                {/* Email - Editable */}
                <div>
                  <Label htmlFor="edit-email" className="text-white-primary">
                    Email *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="elegante-input mt-2"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                {/* Teléfono - Editable */}
                <div>
                  <Label htmlFor="edit-telefono" className="text-white-primary">
                    Teléfono
                  </Label>
                  <Input
                    id="edit-telefono"
                    value={editForm.telefono}
                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    className="elegante-input mt-2"
                    placeholder="+57 3XX XXX XXXX"
                  />
                </div>

                {/* Dirección - Editable */}
                <div>
                  <Label htmlFor="edit-direccion" className="text-white-primary">
                    Dirección
                  </Label>
                  <Input
                    id="edit-direccion"
                    value={editForm.direccion}
                    onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                    className="elegante-input mt-2"
                    placeholder="Dirección completa"
                  />
                </div>

                {/* Barrio - Editable */}
                <div>
                  <Label htmlFor="edit-barrio" className="text-white-primary">
                    Barrio
                  </Label>
                  <Input
                    id="edit-barrio"
                    value={editForm.barrio}
                    onChange={(e) => setEditForm({ ...editForm, barrio: e.target.value })}
                    className="elegante-input mt-2"
                    placeholder="Barrio"
                  />
                </div>

                {/* Fecha de Nacimiento - Editable */}
                <div>
                  <Label htmlFor="edit-fecha-nacimiento" className="text-white-primary">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="edit-fecha-nacimiento"
                    type="date"
                    value={editForm.fechaNacimiento ? editForm.fechaNacimiento.split('-').reverse().join('-') : ''}
                    onChange={(e) => {
                      const fecha = e.target.value;
                      const fechaFormateada = fecha ? fecha.split('-').reverse().join('-') : '';
                      setEditForm({ ...editForm, fechaNacimiento: fechaFormateada });
                    }}
                    className="elegante-input mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-dark">
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="elegante-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateCliente}
                  className="elegante-button-primary"
                >
                  Actualizar Cliente
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogos de confirmación */}
        <AlertDialog open={isCreateConfirmOpen} onOpenChange={setIsCreateConfirmOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Creación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas crear el cliente <span className="font-semibold text-orange-primary">{createForm.nombre} {createForm.apellido}</span> con documento <span className="font-semibold text-orange-primary">{createForm.tipoDocumento} {createForm.numeroDocumento}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCreateCliente} className="elegante-button-primary">
                Crear Cliente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Actualización</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas actualizar los datos del cliente <span className="font-semibold text-orange-primary">{selectedCliente?.nombre} {selectedCliente?.apellido}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmUpdateCliente} className="elegante-button-primary">
                Actualizar Cliente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Detalle del Cliente */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-primary" />
                Detalle del Cliente
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Información completa del cliente seleccionado
              </DialogDescription>
            </DialogHeader>
            
            {selectedCliente && (
              <div className="space-y-6 pt-4 overflow-y-auto pr-2 max-h-[calc(90vh-120px)]">
                {/* Foto de perfil y datos básicos */}
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {selectedCliente.fotoPerfil ? (
                      <img
                        src={selectedCliente.fotoPerfil}
                        alt={`Foto de ${selectedCliente.nombre}`}
                        className="w-24 h-24 rounded-full object-cover border-4 border-orange-primary"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-dark border-4 border-gray-medium flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-gray-lightest" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-white-primary">
                        {selectedCliente.nombre} {selectedCliente.apellido}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCliente.activo ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {selectedCliente.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-lightest">
                      <div className="flex items-center space-x-2">
                        <IdCard className="w-4 h-4" />
                        <span>{selectedCliente.tipoDocumento} {selectedCliente.numeroDocumento}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        <span>CLT{selectedCliente.id.split('-')[1]?.padStart(3, '0') || '000'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="elegante-card">
                  <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-orange-primary" />
                    Información de Contacto
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-lightest">Email</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-4 h-4 text-orange-primary" />
                          <span className="text-white-primary">{selectedCliente.email}</span>
                        </div>
                      </div>
                      
                      {selectedCliente.telefono && (
                        <div>
                          <label className="text-sm text-gray-lightest">Teléfono</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="w-4 h-4 text-orange-primary" />
                            <span className="text-white-primary">{selectedCliente.telefono}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {selectedCliente.direccion && (
                        <div>
                          <label className="text-sm text-gray-lightest">Dirección</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-4 h-4 text-orange-primary" />
                            <span className="text-white-primary">{selectedCliente.direccion}</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedCliente.barrio && (
                        <div>
                          <label className="text-sm text-gray-lightest">Barrio</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-4 h-4 text-orange-primary" />
                            <span className="text-white-primary">{selectedCliente.barrio}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información personal */}
                <div className="elegante-card">
                  <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-orange-primary" />
                    Información Personal
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCliente.fechaNacimiento && (
                      <div>
                        <label className="text-sm text-gray-lightest">Fecha de Nacimiento</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <CalendarIcon className="w-4 h-4 text-orange-primary" />
                          <span className="text-white-primary">{selectedCliente.fechaNacimiento}</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm text-gray-lightest">Fecha de Registro</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <CalendarIcon className="w-4 h-4 text-orange-primary" />
                        <span className="text-white-primary">{selectedCliente.fechaRegistro}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-lightest">Última Visita</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <History className="w-4 h-4 text-orange-primary" />
                        <span className="text-white-primary">
                          {selectedCliente.ultimaVisita || 'Sin visitas registradas'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de acceso */}
                <div className="elegante-card">
                  <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-orange-primary" />
                    Información de Acceso
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-lightest">Email de acceso</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-4 h-4 text-orange-primary" />
                        <span className="text-white-primary font-mono bg-gray-darker px-2 py-1 rounded">
                          {selectedCliente.email}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-lightest">Contraseña</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <UserCheck className="w-4 h-4 text-orange-primary" />
                        <span className="text-white-primary font-mono bg-gray-darker px-2 py-1 rounded">
                          {selectedCliente.contraseña || 'No configurada'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información financiera */}
                <div className="elegante-card">
                  <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-orange-primary" />
                    Información Financiera
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-lightest">Saldo a Favor</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Wallet className="w-4 h-4 text-orange-secondary" />
                        <span className="text-2xl font-bold text-orange-secondary">
                          ${formatCurrency(selectedCliente.saldoAFavor)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-lightest">Devoluciones Activas</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <RotateCcw className="w-4 h-4 text-orange-primary" />
                        <span className="text-white-primary">
                          {getDevolucionesCliente(selectedCliente.id).filter(d => d.estado === 'Activo').length} devolución(es)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial de devoluciones si tiene saldo */}
                {selectedCliente.saldoAFavor > 0 && (
                  <div className="elegante-card">
                    <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-orange-primary" />
                      Historial de Devoluciones
                    </h4>
                    
                    <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                      {getDevolucionesCliente(selectedCliente.id)
                        .filter(d => d.estado === 'Activo')
                        .map((devolucion) => (
                          <div key={devolucion.id} className="bg-gray-darker p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-white-primary">{devolucion.producto}</p>
                                <p className="text-sm text-gray-lightest">
                                  {devolucion.fecha} - {devolucion.motivoDetalle}
                                </p>
                                {devolucion.observaciones && (
                                  <p className="text-xs text-gray-light mt-1">
                                    "{devolucion.observaciones}"
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-semibold text-orange-secondary text-lg">
                                  ${formatCurrency(devolucion.saldoAFavor)}
                                </span>
                                <p className="text-sm text-gray-lightest">{devolucion.tipo}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-dark">
                  <button
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="elegante-button-secondary"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleEditClick(selectedCliente);
                    }}
                    className="elegante-button-primary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Cliente
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