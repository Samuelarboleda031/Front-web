import { useState, useEffect, useRef } from "react";
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
  ToggleLeft,
  ToggleRight,
  UserX,
  Trash2,
  Key,
  EyeOff,
  Clock,
  FileText,
  Hash
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useCustomAlert } from "../ui/custom-alert";
import { useDoubleConfirmation } from "../ui/double-confirmation";
import { toast } from "sonner";

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
  barrio: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  ultimaVisita: string;
  activo: boolean;
  saldoAFavor: number;
  fotoPerfil?: string; // Nueva propiedad para la foto de perfil
  contraseña: string;
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
    barrio: "El Poblado",
    fechaNacimiento: "22-07-1990",
    fechaRegistro: "22-06-2025",
    ultimaVisita: "28-07-2025",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "maria2024"
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
    barrio: "San Fernando",
    fechaNacimiento: "10-12-1988",
    fechaRegistro: "10-07-2025",
    ultimaVisita: "25-07-2025",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "carlos456"
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
    barrio: "Alto Prado",
    fechaNacimiento: "18-05-2005",
    fechaRegistro: "18-07-2025",
    ultimaVisita: "",
    activo: true,
    saldoAFavor: 0, // Se calculará dinámicamente
    contraseña: "laura789"
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
    contraseña: "pedro321"
  },
  {
    id: "cliente-6",
    tipoDocumento: "CC",
    numeroDocumento: "1111222233",
    nombre: "Ana María",
    apellido: "Fernández Castro",
    email: "ana.fernandez@email.com",
    telefono: "+57 306 789 0123",
    direccion: "Carrera 15 #33-44, Manizales",
    barrio: "La Sultana",
    fechaNacimiento: "08-09-1992",
    fechaRegistro: "12-07-2025",
    ultimaVisita: "02-08-2025",
    activo: true,
    saldoAFavor: 0,
    contraseña: "ana654"
  },
  {
    id: "cliente-7",
    tipoDocumento: "CC",
    numeroDocumento: "4444555566",
    nombre: "Roberto",
    apellido: "Sánchez Morales",
    email: "roberto.sanchez@email.com",
    telefono: "+57 307 890 1234",
    direccion: "Calle 88 #19-25, Pereira",
    barrio: "Los Alamos",
    fechaNacimiento: "14-02-1987",
    fechaRegistro: "20-06-2025",
    ultimaVisita: "15-07-2025",
    activo: true,
    saldoAFavor: 0,
    contraseña: "roberto987"
  },
  {
    id: "cliente-8",
    tipoDocumento: "CC",
    numeroDocumento: "7777888899",
    nombre: "Claudia Patricia",
    apellido: "Vásquez Ramírez",
    email: "claudia.vasquez@email.com",
    telefono: "+57 308 901 2345",
    direccion: "Avenida 26 #45-67, Armenia",
    barrio: "La Secreta",
    fechaNacimiento: "03-06-1995",
    fechaRegistro: "05-07-2025",
    ultimaVisita: "",
    activo: true,
    saldoAFavor: 0,
    contraseña: "claudia147"
  },
  {
    id: "cliente-9",
    tipoDocumento: "CC",
    numeroDocumento: "2222333344",
    nombre: "Fernando",
    apellido: "García Torres",
    email: "fernando.garcia@email.com",
    telefono: "+57 309 012 3456",
    direccion: "Calle 45 #78-90, Ibagué",
    barrio: "Tolima",
    fechaNacimiento: "21-10-1983",
    fechaRegistro: "18-06-2025",
    ultimaVisita: "22-07-2025",
    activo: true,
    saldoAFavor: 0,
    contraseña: "fernando258"
  },
  {
    id: "cliente-10",
    tipoDocumento: "CC",
    numeroDocumento: "6666777788",
    nombre: "Gabriela",
    apellido: "Herrera Jiménez",
    email: "gabriela.herrera@email.com",
    telefono: "+57 310 123 4567",
    direccion: "Carrera 30 #12-34, Popayán",
    barrio: "Centro",
    fechaNacimiento: "17-04-1991",
    fechaRegistro: "28-06-2025",
    ultimaVisita: "10-08-2025",
    activo: true,
    saldoAFavor: 0,
    contraseña: "gabriela963"
  },
  {
    id: "cliente-11",
    tipoDocumento: "CC",
    numeroDocumento: "3333444455",
    nombre: "Miguel Ángel",
    apellido: "Rojas Silva",
    email: "miguel.rojas@email.com",
    telefono: "+57 311 234 5678",
    direccion: "Diagonal 22 #56-78, Neiva",
    fechaNacimiento: "29-12-1986",
    fechaRegistro: "08-07-2025",
    ultimaVisita: "05-08-2025",
    activo: false,
    saldoAFavor: 0
  },
  {
    id: "cliente-12",
    tipoDocumento: "CC",
    numeroDocumento: "8888999900",
    nombre: "Diana Carolina",
    apellido: "Muñoz Pérez",
    email: "diana.munoz@email.com",
    telefono: "+57 312 345 6789",
    direccion: "Calle 67 #89-01, Villavicencio",
    fechaNacimiento: "11-07-1994",
    fechaRegistro: "15-07-2025",
    ultimaVisita: "28-07-2025",
    activo: true,
    saldoAFavor: 0
  }
];

// Función para inicializar clientes con saldos calculados
const initializeClientesWithSaldos = (): Cliente[] => {
  return clientesMockDataBase.map(cliente => ({
    ...cliente,
    saldoAFavor: calcularSaldoAFavorCliente(cliente.id, devolucionesMockData)
  }));
};

export function ClientesPageWithPhoto() {
  const { success, error: showAlert, created, edited, deleted, AlertContainer } = useCustomAlert();
  const { confirmDeleteAction, DoubleConfirmationContainer } = useDoubleConfirmation();
  const [clientes, setClientes] = useState<Cliente[]>(initializeClientesWithSaldos());
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(devolucionesMockData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Estados para acciones de cliente
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editSelectedProfileImage, setEditSelectedProfileImage] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const generateRandomClientPassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGenerateCreatePassword = () => {
    const password = generateRandomClientPassword();
    setCreateForm(prev => ({
      ...prev,
      contraseña: password,
      confirmarContraseña: password
    }));
  };

  const handleGenerateEditPassword = () => {
    const password = generateRandomClientPassword();
    setNewPassword(password);
    setConfirmNewPassword(password);
  };

  const filteredClientes = clientes.filter(cliente => {
    const searchMatch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.direccion?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'active' && cliente.activo) ||
      (statusFilter === 'inactive' && !cliente.activo);

    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage);

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

  const validateForm = (form: any) => {
    if (!form.numeroDocumento || !form.nombre || !form.apellido || !form.email) {
      showAlert('error', 'Campos obligatorios faltantes', 'Por favor completa todos los campos obligatorios: tipo de documento, número de documento, nombre, apellido y email.');
      return false;
    }

    // Validar contraseñas
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

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showAlert('error', 'Email inválido', 'Por favor ingresa un email válido con el formato correcto.');
      return false;
    }

    // Verificar si el documento ya existe
    const documentoExiste = clientes.some(c =>
      c.numeroDocumento === form.numeroDocumento &&
      c.tipoDocumento === form.tipoDocumento
    );

    if (documentoExiste) {
      showAlert('error', 'Documento duplicado', 'Ya existe un cliente registrado con este tipo y número de documento.');
      return false;
    }

    // Verificar si el email ya existe
    const emailExiste = clientes.some(c => c.email === form.email);

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
      saldoAFavor: 0 // Nuevo cliente sin saldo inicial
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

  const getEstadoTexto = (ultimaVisita?: string) => {
    if (!ultimaVisita) return "Nuevo";

    const fechaVisita = new Date(ultimaVisita.split('-').reverse().join('-'));
    const ahora = new Date();
    const diasSinVisitar = Math.floor((ahora.getTime() - fechaVisita.getTime()) / (1000 * 60 * 60 * 24));

    if (diasSinVisitar <= 30) return "Activo";
    if (diasSinVisitar <= 60) return "Regular";
    return "Inactivo";
  };

  const getDevolucionesCliente = (clienteId: string) => {
    return devoluciones
      .filter(d => d.clienteId === clienteId)
      .sort((a, b) => new Date(b.fecha.split('-').reverse().join('-')).getTime() - new Date(a.fecha.split('-').reverse().join('-')).getTime());
  };

  // Funciones de paginación
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Resetear página cuando se filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Funciones para acciones de cliente
  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowPassword(false);
    setIsViewDialogOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEditForm({
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      barrio: cliente.barrio,
      fechaNacimiento: cliente.fechaNacimiento,
      fotoPerfil: cliente.fotoPerfil || '',
      contraseña: cliente.contraseña
    });

    // Si tiene foto de perfil, mostrarla en la edición
    if (cliente.fotoPerfil) {
      setEditPreviewUrl(cliente.fotoPerfil);
    } else {
      setEditPreviewUrl(null);
    }
    setEditSelectedProfileImage(null);

    setIsEditDialogOpen(true);
  };

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setEditSelectedProfileImage(file);

      // Crear URL de vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditProfileImage = () => {
    setEditSelectedProfileImage(null);
    setEditPreviewUrl(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditForm({ ...editForm, fotoPerfil: '' });
  };

  const triggerEditFileSelect = () => {
    editFileInputRef.current?.click();
  };

  const validateEditForm = (form: any) => {
    if (!form.numeroDocumento || !form.nombre || !form.apellido || !form.email) {
      showAlert('error', 'Campos obligatorios faltantes', 'Por favor completa todos los campos obligatorios: tipo de documento, número de documento, nombre, apellido y email.');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      showAlert('error', 'Email inválido', 'Por favor ingresa un email válido con el formato correcto.');
      return false;
    }

    // Verificar si el documento ya existe (excepto el cliente actual)
    const documentoExiste = clientes.some(c =>
      c.id !== selectedCliente?.id &&
      c.numeroDocumento === form.numeroDocumento &&
      c.tipoDocumento === form.tipoDocumento
    );

    if (documentoExiste) {
      showAlert('error', 'Documento duplicado', 'Ya existe otro cliente registrado con este tipo y número de documento.');
      return false;
    }

    // Verificar si el email ya existe (excepto el cliente actual)
    const emailExiste = clientes.some(c => c.id !== selectedCliente?.id && c.email === form.email);

    if (emailExiste) {
      showAlert('error', 'Email duplicado', 'Ya existe otro cliente registrado con este email.');
      return false;
    }

    return true;
  };

  const handleSaveEditCliente = () => {
    if (!validateEditForm(editForm)) {
      return;
    }
    setIsEditConfirmOpen(true);
  };

  const confirmEditCliente = () => {
    if (!selectedCliente) return;

    // Validar contraseña si se está cambiando
    if (isChangingPassword) {
      if (!newPassword || !confirmNewPassword) {
        showAlert('error', 'Contraseña requerida', 'Por favor ingresa la nueva contraseña y confírmala.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showAlert('error', 'Contraseñas no coinciden', 'La nueva contraseña y la confirmación deben ser idénticas.');
        return;
      }
      if (newPassword.length < 6) {
        showAlert('error', 'Contraseña muy corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    // Usar la imagen nueva si se seleccionó, o mantener la existente
    let fotoPerfilFinal = selectedCliente.fotoPerfil || '';
    if (editSelectedProfileImage && editPreviewUrl) {
      fotoPerfilFinal = editPreviewUrl;
    } else if (editPreviewUrl) {
      fotoPerfilFinal = editPreviewUrl;
    }

    const clienteActualizado: Cliente = {
      ...selectedCliente,
      ...editForm,
      fotoPerfil: fotoPerfilFinal,
      contraseña: isChangingPassword ? newPassword : selectedCliente.contraseña
    };

    setClientes(clientes.map(c =>
      c.id === selectedCliente.id ? clienteActualizado : c
    ));

    setIsEditDialogOpen(false);
    setIsEditConfirmOpen(false);
    setSelectedCliente(null);
    setEditForm({});
    setEditSelectedProfileImage(null);
    setEditPreviewUrl(null);
    setIsChangingPassword(false);
    setNewPassword('');
    setConfirmNewPassword('');

    edited('Cliente actualizado exitosamente ✔️', `Los datos de ${clienteActualizado.nombre} ${clienteActualizado.apellido} han sido actualizados.`);
  };

  // Función para eliminar cliente
  const handleDeleteCliente = (cliente: Cliente) => {
    confirmDeleteAction(
      `${cliente.nombre} ${cliente.apellido} (${cliente.tipoDocumento} ${cliente.numeroDocumento})`,
      () => {
        setClientes(prev => prev.filter(c => c.id !== cliente.id));
        setSelectedItems(prev => prev.filter(id => id !== cliente.id));
        deleted('Cliente eliminado exitosamente ✔️', `El cliente ${cliente.nombre} ${cliente.apellido} ha sido eliminado permanentemente del sistema.`);
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

  // Función para cambiar estado del cliente
  const toggleClienteStatus = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    setClientes(clientes.map(c =>
      c.id === clienteId
        ? { ...c, activo: !c.activo }
        : c
    ));

    const nuevoEstado = !cliente.activo;
    toast.success(
      `Cliente ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
      {
        style: {
          background: 'var(--color-gray-darkest)',
          border: `1px solid ${nuevoEstado ? 'var(--color-orange-primary)' : '#DC2626'}`,
          color: 'var(--color-white-primary)',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: 'rgba(0, 0, 0, 0.5) 0px 4px 12px'
        },
        icon: nuevoEstado ? '🟢' : '🔴',
        duration: 4000,
        description: `${cliente.nombre} ${cliente.apellido} ahora está ${nuevoEstado ? 'activo' : 'inactivo'} en el sistema`
      }
    );
  };

  // Estadísticas de saldos
  const totalClientesConSaldo = clientes.filter(c => c.saldoAFavor > 0).length;
  const totalSaldosAFavor = clientes.reduce((total, c) => total + c.saldoAFavor, 0);

  return (
    <>
      {/* Header */}
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Gestión de Clientes</h1>
            <p className="text-sm text-gray-lightest mt-1">Administra los clientes registrados con fotos de perfil</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="elegante-card text-center">
            <Users className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{clientes.length}</h4>
            <p className="text-gray-lightest text-sm">Total Clientes</p>
          </div>
          <div className="elegante-card text-center">
            <UserCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {clientes.filter(c => c.activo).length}
            </h4>
            <p className="text-gray-lightest text-sm">Clientes Activos</p>
          </div>
          <div className="elegante-card text-center">
            <UserX className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {clientes.filter(c => !c.activo).length}
            </h4>
            <p className="text-gray-lightest text-sm">Clientes Inactivos</p>
          </div>
          <div className="elegante-card text-center">
            <Wallet className="w-8 h-8 text-orange-secondary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{totalClientesConSaldo}</h4>
            <p className="text-gray-lightest text-sm">Con Saldo a Favor</p>
          </div>
          <div className="elegante-card text-center">
            <TrendingUp className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">${formatCurrency(totalSaldosAFavor)}</h4>
            <p className="text-gray-lightest text-sm">Total Saldos</p>
          </div>
        </div>

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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar por documento, nombre, email o teléfono"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="elegante-input pl-11 w-80"
                />
              </div>

              {/* Filtros de Estado */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                    ? 'bg-orange-primary text-black-primary'
                    : 'bg-gray-darker text-gray-lightest hover:bg-gray-dark border border-gray-dark'
                    }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-darker text-gray-lightest hover:bg-gray-dark border border-gray-dark'
                    }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-darker text-gray-lightest hover:bg-gray-dark border border-gray-dark'
                    }`}
                >
                  Inactivos
                </button>
              </div>
            </div>

            {/* Información de filtros activos */}
            <div className="flex items-center space-x-4">
              {(searchTerm || statusFilter !== 'all') && (
                <div className="flex items-center space-x-2">
                  {searchTerm && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-orange-primary/20 border border-orange-primary rounded-full">
                      <Search className="w-3 h-3 text-orange-primary" />
                      <span className="text-xs text-orange-primary font-medium">
                        "{searchTerm}"
                      </span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-orange-primary hover:text-orange-secondary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {statusFilter !== 'all' && (
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusFilter === 'active'
                      ? 'bg-green-600/20 border-green-600 text-green-400'
                      : 'bg-red-600/20 border-red-600 text-red-400'
                      }`}>
                      {statusFilter === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span className="text-xs font-medium">
                        {statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                      </span>
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <span className="text-sm text-gray-lightest">
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''}
                {(searchTerm || statusFilter !== 'all') && ` (de ${clientes.length} total)`}
              </span>
            </div>
          </div>

          {/* Tabla de Clientes */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Documento</th>
                  <th className="text-left py-3 px-4 text-gray-lightest font-medium text-sm">Cliente</th>
                  <th className="text-center py-3 px-4 text-gray-lightest font-medium text-sm">Teléfono</th>
                  <th className="text-center py-3  px-4 text-gray-lightest font-medium text-sm">Saldo a Favor</th>
                  <th className="text-center py-3 px-4 text-gray-lightest font-medium text-sm">Estado</th>
                  <th className="text-right py-3 px-4 text-gray-lightest font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedClientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <IdCard className="w-4 h-4 text-orange-primary" />
                        <span className="text-gray-lighter">{cliente.numeroDocumento}</span>
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
                        <span className="text-gray-lighter">{cliente.nombre} {cliente.apellido}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-lighter">{cliente.telefono}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {cliente.saldoAFavor > 0 ? (
                        <span className="text-gray-lighter">${formatCurrency(cliente.saldoAFavor)}</span>
                      ) : (
                        <span className="text-gray-medium">$0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs bg-gray-medium text-gray-lighter">
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewCliente(cliente)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                        </button>
                        <button
                          onClick={() => handleEditCliente(cliente)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Editar cliente"
                        >
                          <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteCliente(cliente)}
                          className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                        </button>
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

          {/* Mensaje cuando no hay resultados */}
          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-medium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white-primary mb-2">No se encontraron clientes</h3>
              <p className="text-gray-lightest mb-4">
                {searchTerm ?
                  `No hay clientes que coincidan con "${searchTerm}"` :
                  'No hay clientes registrados en el sistema'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="elegante-button-secondary"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Diálogo para Ver Detalles del Cliente */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Detalle del Cliente</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              {selectedCliente?.numeroDocumento} - {selectedCliente?.nombre} {selectedCliente?.apellido}
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <div className="space-y-6 pt-4 overflow-y-auto pr-2 max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-light">ID de Cliente</p>
                  <p className="font-semibold text-orange-primary">{selectedCliente.numeroDocumento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Fecha de Registro</p>
                  <p className="font-semibold text-white-primary">{selectedCliente.fechaRegistro}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Nombre Completo</p>
                  <p className="font-semibold text-white-primary">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Tipo de Documento</p>
                  <p className="font-semibold text-white-primary">{selectedCliente.tipoDocumento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCliente.activo ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    }`}>
                    {selectedCliente.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-light">Última Visita</p>
                  <p className="font-semibold text-white-primary">
                    {selectedCliente.ultimaVisita || 'Nunca'}
                  </p>
                </div>
              </div>

              {/* Información de Contacto */}
              <div>
                <h4 className="font-semibold text-white-primary mb-3">Información de Contacto</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="text-white-primary font-medium">Email</span>
                      <div className="text-sm text-gray-lightest">
                        {selectedCliente.email}
                      </div>
                    </div>
                  </div>
                  {selectedCliente.telefono && (
                    <div className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="text-white-primary font-medium">Teléfono</span>
                        <div className="text-sm text-gray-lightest">
                          {selectedCliente.telefono}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedCliente.direccion && (
                    <div className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="text-white-primary font-medium">Dirección</span>
                        <div className="text-sm text-gray-lightest">
                          {selectedCliente.direccion}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedCliente.barrio && (
                    <div className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="text-white-primary font-medium">Barrio</span>
                        <div className="text-sm text-gray-lightest">
                          {selectedCliente.barrio}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Personal */}
              <div>
                <h4 className="font-semibold text-white-primary mb-3">Información Personal</h4>
                <div className="space-y-2">
                  {selectedCliente.fechaNacimiento && (
                    <div className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="text-white-primary font-medium">Fecha de Nacimiento</span>
                        <div className="text-sm text-gray-lightest">
                          {selectedCliente.fechaNacimiento}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between bg-gray-darker p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="text-white-primary font-medium">Contraseña</span>
                      <div className="text-sm text-gray-lightest font-mono">
                        {selectedCliente.contraseña ? (showPassword ? selectedCliente.contraseña : '••••••••') : 'No establecida'}
                      </div>
                    </div>
                    {selectedCliente.contraseña && (
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-gray-dark rounded transition-colors"
                        type="button"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-lightest" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-lightest" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen del Cliente */}
              <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-gray-lightest">
                  <span>Saldo a Favor:</span>
                  <span>${formatCurrency(selectedCliente.saldoAFavor)}</span>
                </div>
                <div className="flex justify-between text-gray-lightest">
                  <span>Devoluciones Activas:</span>
                  <span>{getDevolucionesCliente(selectedCliente.id).filter(d => d.estado === 'Activo').length}</span>
                </div>
                <div className="flex justify-between text-gray-lightest">
                  <span>Estado de Visitas:</span>
                  <span>{getEstadoTexto(selectedCliente.ultimaVisita)}</span>
                </div>
                <hr className="border-gray-medium" />
                <div className="flex justify-between text-white-primary font-bold text-lg">
                  <span>Estado del Cliente:</span>
                  <span className={`${selectedCliente.activo ? "text-green-400" : "text-red-400"}`}>
                    {selectedCliente.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-dark">
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="elegante-button-primary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para Editar Cliente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Editar Cliente</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Modifica la información del cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Información de Identificación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-primary" />
                  Tipo de Documento *
                </Label>
                <select
                  value={editForm.tipoDocumento}
                  onChange={(e) => setEditForm({ ...editForm, tipoDocumento: e.target.value })}
                  className="elegante-input w-full"
                >
                  {TIPOS_DOCUMENTO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-primary" />
                  Número de Documento *
                </Label>
                <Input
                  value={editForm.numeroDocumento}
                  onChange={(e) => setEditForm({ ...editForm, numeroDocumento: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Ingresa el número de documento"
                />
              </div>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-primary" />
                  Nombre *
                </Label>
                <Input
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Ingresa el nombre"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-primary" />
                  Apellido *
                </Label>
                <Input
                  value={editForm.apellido}
                  onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Ingresa el apellido"
                />
              </div>
            </div>

            {/* Fecha de Nacimiento y Foto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-primary" />
                  Fecha de Nacimiento
                </Label>
                <Input
                  type="date"
                  value={editForm.fechaNacimiento}
                  onChange={(e) => setEditForm({ ...editForm, fechaNacimiento: e.target.value })}
                  className="elegante-input w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Camera className="w-4 h-4 text-orange-primary" />
                  Foto de Perfil
                </Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {editPreviewUrl ? (
                      <div className="relative">
                        <img
                          src={editPreviewUrl}
                          alt="Vista previa"
                          className="w-16 h-16 rounded-full object-cover border-2 border-orange-primary"
                        />
                        <button
                          onClick={removeEditProfileImage}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-dark border-2 border-gray-medium flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-lightest" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={triggerEditFileSelect}
                    className="elegante-button-secondary text-xs px-3 py-1.5 gap-1.5 flex items-center"
                    type="button"
                  >
                    <Camera className="w-3 h-3" />
                    {editPreviewUrl ? 'Cambiar' : 'Subir'}
                  </button>
                </div>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-primary" />
                  Email *
                </Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-primary" />
                  Teléfono
                </Label>
                <Input
                  value={editForm.telefono}
                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="+57 300 123 4567"
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
                  value={editForm.direccion}
                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Calle 123 #45-67, Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-primary" />
                  Barrio
                </Label>
                <Input
                  value={editForm.barrio}
                  onChange={(e) => setEditForm({ ...editForm, barrio: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Chapinero, Poblado, etc."
                />
              </div>
            </div>

            {/* Gestión de Contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-primary" />
                  Gestión de Contraseña
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    if (!isChangingPassword) {
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isChangingPassword
                    ? 'bg-orange-primary text-black-primary hover:bg-orange-secondary'
                    : 'bg-gray-dark text-white-primary hover:bg-gray-medium border border-orange-primary'
                    }`}
                >
                  {isChangingPassword ? 'Cancelar Cambio' : 'Cambiar Contraseña'}
                </button>
              </div>
              {isChangingPassword && (
                <div className="space-y-2">
                  <Label className="text-white-primary">ㅤ</Label>
                  <div className="text-sm text-gray-lightest">
                    Completa los campos de contraseña a la izquierda
                  </div>
                </div>
              )}
            </div>

            {/* Campos de Contraseña (solo si está cambiando) */}
            {isChangingPassword && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-primary" />
                    Nueva Contraseña *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="elegante-input w-full"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateEditPassword}
                      className="elegante-button-secondary h-11 px-3 text-xs font-semibold flex-shrink-0"
                    >
                      Generar
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Key className="w-4 h-4 text-orange-primary" />
                    Confirmar Nueva Contraseña *
                  </Label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="elegante-input w-full"
                    placeholder="Repetir nueva contraseña"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="elegante-button-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditCliente}
                className="elegante-button-primary"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Crear Cliente */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white-primary">Añadir Nuevo Cliente</DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Completa la información del nuevo cliente. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Información de Identificación */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-primary" />
                  Tipo de Documento *
                </Label>
                <select
                  value={createForm.tipoDocumento}
                  onChange={(e) => setCreateForm({ ...createForm, tipoDocumento: e.target.value })}
                  className="elegante-input w-full"
                >
                  {TIPOS_DOCUMENTO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-primary" />
                  Número de Documento *
                </Label>
                <Input
                  value={createForm.numeroDocumento}
                  onChange={(e) => setCreateForm({ ...createForm, numeroDocumento: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Ingresa el número de documento"
                />
              </div>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-primary" />
                  Nombre *
                </Label>
                <Input
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Ingresa el nombre"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-primary" />
                  Apellido *
                </Label>
                <Input
                  value={createForm.apellido}
                  onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })}
                  className="elegante-input w-full"
                  placeholder="Ingresa el apellido"
                />
              </div>
            </div>

            {/* Fecha de Nacimiento y Foto */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-primary" />
                  Fecha de Nacimiento
                </Label>
                <Input
                  type="date"
                  value={createForm.fechaNacimiento}
                  onChange={(e) => setCreateForm({ ...createForm, fechaNacimiento: e.target.value })}
                  className="elegante-input w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Camera className="w-4 h-4 text-orange-primary" />
                  Foto de Perfil
                </Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="w-16 h-16 rounded-full object-cover border-2 border-orange-primary"
                        />
                        <button
                          onClick={removeProfileImage}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-dark border-2 border-gray-medium flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-lightest" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={triggerFileSelect}
                    className="elegante-button-secondary text-xs px-3 py-1.5 gap-1.5 flex items-center"
                    type="button"
                  >
                    <Camera className="w-3 h-3" />
                    {previewUrl ? 'Cambiar' : 'Subir'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Información de Contacto */}
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
                  className="elegante-input w-full"
                  placeholder="cliente@email.com"
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
                  className="elegante-input w-full"
                  placeholder="+57 300 123 4567"
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
                  className="elegante-input w-full"
                  placeholder="Calle 123 #45-67, Ciudad"
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
                  className="elegante-input w-full"
                  placeholder="Chapinero, Poblado, etc."
                />
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white-primary flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-primary" />
                  Contraseña *
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    value={createForm.contraseña}
                    onChange={(e) => setCreateForm({ ...createForm, contraseña: e.target.value })}
                    className="elegante-input w-full"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCreatePassword}
                    className="elegante-button-secondary h-11 px-3 text-xs font-semibold flex-shrink-0"
                  >
                    Generar
                  </button>
                </div>
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
                  className="elegante-input w-full"
                  placeholder="Repetir contraseña"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
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

      {/* Diálogo de confirmación crear */}
      <AlertDialog open={isCreateConfirmOpen} onOpenChange={setIsCreateConfirmOpen}>
        <AlertDialogContent className="bg-gray-darkest border border-gray-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary">Confirmar Creación</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              ¿Estás seguro de que deseas crear este nuevo cliente? La información será guardada en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsCreateConfirmOpen(false)}
              className="elegante-button-secondary"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCreateCliente}
              className="elegante-button-primary"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación editar */}
      <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
        <AlertDialogContent className="bg-gray-darkest border border-gray-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white-primary">Confirmar Cambios</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-lightest">
              ¿Estás seguro de que deseas guardar los cambios realizados en este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsEditConfirmOpen(false)}
              className="elegante-button-secondary"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEditCliente}
              className="elegante-button-primary"
            >
              Guardar Cambios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contenedor de alertas */}
      <AlertContainer />

      {/* Contenedor de confirmaciones de eliminación */}
      <DoubleConfirmationContainer />
    </>
  );
}