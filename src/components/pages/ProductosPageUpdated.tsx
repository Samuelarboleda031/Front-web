import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Package, Plus, Edit, Trash2, Search, Filter, DollarSign, AlertTriangle, Watch, Eye, Sparkles, Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight, Power, Percent, Calculator } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { useCustomAlert } from "../ui/custom-alert";

// Función para formatear moneda
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

const productosData = [
  {
    id: 1,
    nombre: "Pomada Hair Wax",
    descripcion: "Pomada premium para fijación fuerte",
    categoria: "Cuidado Capilar",
    precioBase: 37815,
    iva: 7185,
    porcentajeIva: 19,
    precio: 45000,
    cantidad: 45,
    minCantidad: 10,
    marca: "Hair Products Co.",
    imagen: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop&crop=center",
    activo: true
  },
  {
    id: 2,
    nombre: "Shampoo Premium",
    descripcion: "Shampoo profesional para todo tipo de cabello",
    categoria: "Cuidado Capilar",
    precioBase: 46218,
    iva: 8782,
    porcentajeIva: 19,
    precio: 55000,
    cantidad: 3,
    minCantidad: 10,
    marca: "Beauty Supply Inc.",
    imagen: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop&crop=center",
    activo: true
  },
  {
    id: 3,
    nombre: "Aceite de Barba",
    descripcion: "Aceite nutritivo para barba y bigote",
    categoria: "Cuidado Barba",
    precioBase: 40336,
    iva: 7664,
    porcentajeIva: 19,
    precio: 48000,
    cantidad: 28,
    minCantidad: 15,
    marca: "Beard Masters",
    imagen: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=200&h=200&fit=crop&crop=center",
    activo: true
  },
  {
    id: 4,
    nombre: "Cera Modeladora",
    descripcion: "Cera texturizante para peinados modernos",
    categoria: "Cuidado Capilar",
    precioBase: 54622,
    iva: 10378,
    porcentajeIva: 19,
    precio: 65000,
    cantidad: 8,
    minCantidad: 20,
    marca: "Style Pro",
    imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop&crop=center",
    activo: false
  },
  {
    id: 5,
    nombre: "Cuchillas de Afeitar",
    descripcion: "Cuchillas profesionales de acero inoxidable",
    categoria: "Herramientas",
    precioBase: 21008,
    iva: 3992,
    porcentajeIva: 19,
    precio: 25000,
    cantidad: 8,
    minCantidad: 20,
    marca: "Blade Co.",
    imagen: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=200&h=200&fit=crop&crop=center",
    activo: true
  },
  {
    id: 6,
    nombre: "Cadena de Rodio Plateada",
    descripcion: "Cadena elegante de rodio con acabado brillante, resistente al agua",
    categoria: "Accesorios",
    precioBase: 151261,
    iva: 28739,
    porcentajeIva: 19,
    precio: 180000,
    cantidad: 15,
    minCantidad: 8,
    marca: "Jewelry Elite",
    imagen: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop&crop=center",
    activo: true
  }
];

const categorias = [
  "Cuidado Capilar", "Cuidado Barba", "Herramientas", "Suministros", "Accesorios"
];

export function ProductosPage() {
  const { success, error, created, edited, deleted, AlertContainer } = useCustomAlert();
  const [productos, setProductos] = useState(productosData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<any>(null);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const [productoToDelete, setProductoToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precioBase: 0,
    porcentajeIva: 19,
    cantidad: 0,
    minCantidad: 10,
    marca: '',
    imagen: '',
    activo: true
  });
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === "all" || producto.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

  const calcularIva = (precioBase: number, porcentajeIva: number) => {
    return precioBase * (porcentajeIva / 100);
  };

  const calcularPrecioFinal = (precioBase: number, porcentajeIva: number) => {
    const iva = calcularIva(precioBase, porcentajeIva);
    return precioBase + iva;
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoriaChange = (value: string) => {
    setFilterCategoria(value);
    setCurrentPage(1);
  };

  const productosCantidadBaja = productos.filter(p => p.cantidad <= p.minCantidad);
  const accesorios = productos.filter(p => p.categoria === "Accesorios");
  const productosActivos = productos.filter(p => p.activo);

  const handleCreateProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.categoria || nuevoProducto.precioBase <= 0) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombre, categoría y precio base mayor a 0.");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const confirmCreateProducto = () => {
    const iva = calcularIva(nuevoProducto.precioBase, nuevoProducto.porcentajeIva);
    const precioFinal = calcularPrecioFinal(nuevoProducto.precioBase, nuevoProducto.porcentajeIva);

    const producto = {
      id: Date.now(),
      ...nuevoProducto,
      iva: iva,
      precio: precioFinal
    };

    setProductos([...productos, producto]);
    setNuevoProducto({
      nombre: '', descripcion: '', categoria: '', precioBase: 0, porcentajeIva: 19,
      cantidad: 0, minCantidad: 10, marca: '', imagen: '', activo: true
    });
    setImagenPreview(null);
    setIsDialogOpen(false);
    setIsCreateDialogOpen(false);

    created("Producto creado ✔️", `El producto "${producto.nombre}" ha sido agregado exitosamente al inventario con un precio de ${formatCurrency(precioFinal)}.`);
  };

  const handleEditProducto = (producto: any) => {
    setEditingProducto(producto);
    setNuevoProducto({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precioBase: producto.precioBase,
      porcentajeIva: producto.porcentajeIva,
      cantidad: producto.cantidad,
      minCantidad: producto.minCantidad,
      marca: producto.marca,
      imagen: producto.imagen,
      activo: producto.activo
    });
    setImagenPreview(producto.imagen || null);
    setIsDialogOpen(true);
  };

  const handleUpdateProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.categoria || nuevoProducto.precioBase <= 0) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombre, categoría y precio base mayor a 0.");
      return;
    }
    setIsEditDialogOpen(true);
  };

  const confirmUpdateProducto = () => {
    if (!editingProducto) return;

    const iva = calcularIva(nuevoProducto.precioBase, nuevoProducto.porcentajeIva);
    const precioFinal = calcularPrecioFinal(nuevoProducto.precioBase, nuevoProducto.porcentajeIva);

    const productoActualizado = {
      ...editingProducto,
      ...nuevoProducto,
      iva: iva,
      precio: precioFinal
    };

    setProductos(productos.map(p =>
      p.id === editingProducto.id ? productoActualizado : p
    ));

    setEditingProducto(null);
    setNuevoProducto({
      nombre: '', descripcion: '', categoria: '', precioBase: 0, porcentajeIva: 19,
      cantidad: 0, minCantidad: 10, marca: '', imagen: '', activo: true
    });
    setImagenPreview(null);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);

    edited("Producto editado ✔️", `El producto "${productoActualizado.nombre}" ha sido actualizado exitosamente. El nuevo precio es ${formatCurrency(precioFinal)}.`);
  };

  const handleDeleteProducto = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    setProductoToDelete(producto);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProducto = () => {
    if (productoToDelete) {
      setProductos(productos.filter(producto => producto.id !== productoToDelete.id));
      setIsDeleteDialogOpen(false);
      setProductoToDelete(null);
      deleted("Producto eliminado ✔️", `El producto "${productoToDelete.nombre}" ha sido eliminado exitosamente del inventario.`);
    }
  };

  const toggleProductoActivo = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    setProductos(productos.map(p =>
      p.id === productoId ? { ...p, activo: !p.activo } : p
    ));

    edited(`Producto ${!producto.activo ? 'activado' : 'desactivado'} ✔️`, `El producto "${producto.nombre}" ha sido ${!producto.activo ? 'activado' : 'desactivado'} exitosamente.`);
  };

  const getCantidadStatus = (cantidad: number, minCantidad: number) => {
    if (cantidad === 0) return { color: "text-red-500", bg: "bg-red-900/20", text: "Sin Cantidad" };
    if (cantidad <= minCantidad) return { color: "text-orange-primary", bg: "bg-orange-primary/20", text: "Cantidad Baja" };
    return { color: "text-green-400", bg: "bg-green-900/20", text: "En Inventario" };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagenPreview(result);
        setNuevoProducto({ ...nuevoProducto, imagen: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagenPreview(null);
    setNuevoProducto({ ...nuevoProducto, imagen: '' });
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Accesorios": return "bg-purple-600 text-white";
      case "Cuidado Capilar": return "bg-blue-600 text-white";
      case "Cuidado Barba": return "bg-green-600 text-white";
      case "Herramientas": return "bg-orange-primary text-white";
      case "Suministros": return "bg-gray-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const formatearPrecio = (precio: number): string => {
    return `$ ${precio.toLocaleString('es-CO')}`;
  };

  return (
    <>
      <header className="bg-black-primary border-b border-gray-dark px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white-primary">Productos & Accesorios</h1>
            <p className="text-sm text-gray-lightest mt-1">Gestiona el inventario completo de barbería</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-black-primary">
        {/* Stats Cards */}
        <div style={{ display: 'none' }} className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="elegante-card text-center">
            <Package className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{productos.length}</h4>
            <p className="text-gray-lightest text-sm">Total Productos</p>
          </div>
          <div className="elegante-card text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{accesorios.length}</h4>
            <p className="text-gray-lightest text-sm">Accesorios</p>
          </div>
          <div className="elegante-card text-center">
            <Power className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{productosActivos.length}</h4>
            <p className="text-gray-lightest text-sm">Activos</p>
          </div>
          <div className="elegante-card text-center">
            <AlertTriangle className="w-8 h-8 text-orange-primary mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">{productosCantidadBaja.length}</h4>
            <p className="text-gray-lightest text-sm">Cantidad Baja</p>
          </div>
          <div className="elegante-card text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-2xl font-bold text-white-primary mb-1">
              {formatearPrecio(productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0))}
            </h4>
            <p className="text-gray-lightest text-sm">Valor Inventario</p>
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
                      setEditingProducto(null);
                      setNuevoProducto({
                        nombre: '', descripcion: '', categoria: '', precioBase: 0, porcentajeIva: 19,
                        cantidad: 0, minCantidad: 10, marca: '', imagen: '', activo: true
                      });
                      setImagenPreview(null);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                  </button>
                </DialogTrigger>
                <DialogContent className="elegante-card max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-primary" />
                      {editingProducto ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      {editingProducto ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto o accesorio'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-white-primary">Nombre del Producto *</Label>
                      <Input
                        value={nuevoProducto.nombre}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                        placeholder="Ej: Cadena de Rodio, Gafas Aviador..."
                        className="elegante-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white-primary">Descripción</Label>
                      <Textarea
                        value={nuevoProducto.descripcion}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                        placeholder="Describe el producto o accesorio"
                        className="elegante-input"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary">Categoría *</Label>
                        <select
                          value={nuevoProducto.categoria}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
                          className="elegante-input w-full"
                        >
                          <option value="">Seleccionar</option>
                          {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>{categoria}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary">Marca</Label>
                        <Input
                          value={nuevoProducto.marca}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, marca: e.target.value })}
                          placeholder="Nombre de la marca"
                          className="elegante-input"
                        />
                      </div>
                    </div>

                    {/* Configuración de Precios e IVA */}
                    <div className="space-y-4 border-t border-gray-dark pt-4">
                      <h3 className="text-lg font-semibold text-white-primary">Configuración de Precios</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-primary" />
                            Precio Base (sin IVA) *
                          </Label>
                          <Input
                            type="number"
                            step="1000"
                            value={nuevoProducto.precioBase}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precioBase: parseFloat(e.target.value) || 0 })}
                            className="elegante-input"
                            placeholder="37815"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Percent className="w-4 h-4 text-orange-primary" />
                            Porcentaje IVA (%)
                          </Label>
                          <Input
                            type="number"
                            value={nuevoProducto.porcentajeIva}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, porcentajeIva: parseFloat(e.target.value) || 0 })}
                            className="elegante-input"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>

                      {/* Resumen de Precios */}
                      {nuevoProducto.precioBase > 0 && (
                        <div className="bg-gray-darker p-4 rounded-lg space-y-2">
                          <h4 className="font-semibold text-white-primary">Resumen de Precios</h4>
                          <div className="flex justify-between">
                            <span className="text-gray-lightest">Precio Base:</span>
                            <span className="text-white-primary">${formatCurrency(nuevoProducto.precioBase)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-lightest">IVA ({nuevoProducto.porcentajeIva}%):</span>
                            <span className="text-white-primary">${formatCurrency(calcularIva(nuevoProducto.precioBase, nuevoProducto.porcentajeIva))}</span>
                          </div>
                          <div className="border-t border-gray-medium pt-2">
                            <div className="flex justify-between text-lg">
                              <span className="text-white-primary font-bold">Precio Final:</span>
                              <span className="text-orange-primary font-bold">${formatCurrency(calcularPrecioFinal(nuevoProducto.precioBase, nuevoProducto.porcentajeIva))}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cantidad y Configuración */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary">Cantidad Actual</Label>
                        <Input
                          type="number"
                          value={nuevoProducto.cantidad}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: parseInt(e.target.value) || 0 })}
                          className="elegante-input"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary">Cantidad Mínima</Label>
                        <Input
                          type="number"
                          value={nuevoProducto.minCantidad}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, minCantidad: parseInt(e.target.value) || 0 })}
                          className="elegante-input"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={nuevoProducto.activo}
                        onCheckedChange={(checked) => setNuevoProducto({ ...nuevoProducto, activo: checked })}
                      />
                      <Label className="text-white-primary">Producto activo</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                    <button onClick={() => setIsDialogOpen(false)} className="elegante-button-secondary">
                      Cancelar
                    </button>
                    <button
                      onClick={editingProducto ? handleUpdateProducto : handleCreateProducto}
                      className="elegante-button-primary"
                      disabled={!nuevoProducto.nombre || !nuevoProducto.categoria || nuevoProducto.precioBase <= 0}
                    >
                      {editingProducto ? 'Actualizar' : 'Agregar'} Producto
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <Input
                  placeholder="Buscar productos y accesorios..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="elegante-input pl-10 w-80"
                />
              </div>

              <select
                value={filterCategoria}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className="elegante-input w-48"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left font-semibold text-white-primary pb-4">Imagen</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Producto</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Categoría</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Marca</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Precio</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Cantidad</th>
                  <th className="text-center font-semibold text-white-primary pb-4">Estado</th>
                  <th className="text-left font-semibold text-white-primary pb-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedProductos.map((producto) => {
                  const cantidadStatus = getCantidadStatus(producto.cantidad, producto.minCantidad);
                  return (
                    <tr key={producto.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                      <td className="py-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-dark flex items-center justify-center">
                          {producto.imagen ? (
                            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-lighter" />
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-white-primary">{producto.nombre}</p>
                          <p className="text-sm text-gray-lighter">{producto.descripcion}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(producto.categoria)}`}>
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="py-4 text-white-primary">{producto.marca}</td>
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-green-400">{formatearPrecio(producto.precio)}</p>
                          <p className="text-xs text-gray-lighter">Base: ${formatCurrency(producto.precioBase)}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white-primary">{producto.cantidad}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${cantidadStatus.color} ${cantidadStatus.bg}`}>
                            {cantidadStatus.text}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => toggleProductoActivo(producto.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${producto.activo
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          title={producto.activo ? 'Clic para desactivar' : 'Clic para activar'}
                        >
                          {producto.activo ? 'ACTIVO' : 'INACTIVO'}
                        </button>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProducto(producto);
                              setIsDetailDialogOpen(true);
                            }}
                            className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4 h-4 text-gold-primary" />
                          </button>
                          <button
                            onClick={() => handleEditProducto(producto)}
                            className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteProducto(producto.id)}
                            className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-6 pt-6 border-t border-gray-dark">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-lightest">
                Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProductos.length)} de {filteredProductos.length} productos
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-white-primary" />
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-lightest">Página</span>
                  <span className="text-sm font-semibold text-white-primary px-2 py-1 bg-gray-darker rounded">
                    {currentPage}
                  </span>
                  <span className="text-sm text-gray-lightest">de {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-medium hover:bg-gray-dark border border-gray-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4 text-white-primary" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Dialogs */}
        <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Creación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Está seguro de agregar este producto al inventario?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCreateProducto} className="elegante-button-primary">
                Crear Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Edición</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Está seguro de actualizar la información de este producto?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmUpdateProducto} className="elegante-button-primary">
                Actualizar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Está seguro de eliminar el producto "{productoToDelete?.nombre}"? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="elegante-button-secondary">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteProducto} className="elegante-button-primary">
                Eliminar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>

      <AlertContainer />
    </>
  );
}