import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Package, Plus, Edit, Trash2, Search, Filter, DollarSign, AlertTriangle, Watch, Eye, Sparkles, Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight, Power, Percent, Calculator, ToggleRight, ToggleLeft, Tags, Boxes, FileText, Camera, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { useCustomAlert } from "../ui/custom-alert";
import { productoService, ApiProducto } from "../../services/productos";

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

export function ProductosPage() {
  const { error, created, edited, deleted, AlertContainer } = useCustomAlert();
  const [productos, setProductos] = useState<ApiProducto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
    stockVentas: 0,
    stockInsumos: 0,
    minCantidad: 10,
    marca: '',
    imagen: '',
    activo: true
  });
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productosData, categoriasData] = await Promise.all([
          productoService.getProductos(),
          productoService.getCategorias()
        ]);
        setProductos(productosData);
        setCategorias(categoriasData);
      } catch (error: any) {
        console.error('Error loading data:', error);
        error('Error de carga', 'No se pudieron cargar los productos y categorías desde el servidor.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === "all" || producto.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);



  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoriaChange = (value: string) => {
    setFilterCategoria(value);
    setCurrentPage(1);
  };



  const getStockTotal = (producto: any) =>
    (producto.stockVentas ?? 0) + (producto.stockInsumos ?? 0);

  const productosCantidadBaja = productos.filter(
    (p) => getStockTotal(p) <= p.minCantidad
  );
  const accesorios = productos.filter((p) => p.categoria === "Accesorios");
  const productosActivos = productos.filter((p) => p.activo);

  // Cantidad que se quiere mover entre inventarios dentro del formulario (ventas <-> insumos)
  const [ajusteStockEdicion, setAjusteStockEdicion] = useState(0);

  const moverStockEnFormulario = (destino: "ventas" | "insumos") => {
    const cantidadMovimiento = ajusteStockEdicion || 0;
    if (cantidadMovimiento <= 0) {
      error(
        "Cantidad inválida",
        "Ingresa una cantidad mayor a 0 para mover inventario."
      );
      return;
    }

    let stockVentas = nuevoProducto.stockVentas || 0;
    let stockInsumos = nuevoProducto.stockInsumos || 0;

    if (destino === "ventas") {
      // Mover desde insumos hacia ventas
      if (stockInsumos < cantidadMovimiento) {
        error(
          "Stock insuficiente",
          "No hay suficientes unidades en entregas para mover a ventas."
        );
        return;
      }
      stockInsumos -= cantidadMovimiento;
      stockVentas += cantidadMovimiento;
    } else {
      // Mover desde ventas hacia insumos
      if (stockVentas < cantidadMovimiento) {
        error(
          "Stock insuficiente",
          "No hay suficientes unidades en ventas para mover a entregas."
        );
        return;
      }
      stockVentas -= cantidadMovimiento;
      stockInsumos += cantidadMovimiento;
    }

    setNuevoProducto({
      ...nuevoProducto,
      stockVentas,
      stockInsumos,
    });
    setAjusteStockEdicion(0);
  };

  // Total de ventas potenciales (solo stock destinado a ventas)
  const totalVentasPotenciales = productos.reduce((acum, producto) => {
    const stockVentas = producto.stockVentas ?? 0;
    return acum + stockVentas * (producto.precio || 0);
  }, 0);

  const handleCreateProducto = () => {
    if (!nuevoProducto.nombre || !nuevoProducto.categoria || nuevoProducto.precioBase <= 0) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombre, categoría y precio base mayor a 0.");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const confirmCreateProducto = async () => {
    try {
      const precioFinal = nuevoProducto.precioBase;

      const stockVentas = nuevoProducto.stockVentas || 0;
      const stockInsumos = nuevoProducto.stockInsumos || 0;

      const productoData = {
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion,
        categoria: nuevoProducto.categoria,
        precioBase: nuevoProducto.precioBase,
        stockVentas,
        stockInsumos,
        minCantidad: nuevoProducto.minCantidad,
        marca: nuevoProducto.marca,
        imagen: nuevoProducto.imagen,
        activo: true
      };

      const productoCreado = await productoService.createProducto(productoData);
      
      // Refresh products list
      const productosActualizados = await productoService.getProductos();
      setProductos(productosActualizados);

      setNuevoProducto({
        nombre: '',
        descripcion: '',
        categoria: '',
        precioBase: 0,
        stockVentas: 0,
        stockInsumos: 0,
        minCantidad: 10,
        marca: '',
        imagen: '',
        activo: true
      });
      setImagenPreview(null);
      setIsDialogOpen(false);
      setIsCreateDialogOpen(false);

      created("Producto creado ✔️", `El producto "${productoCreado.nombre}" ha sido agregado exitosamente al inventario con un precio de ${formatCurrency(precioFinal)}.`);
    } catch (error: any) {
      console.error('Error creating product:', error);
      error('Error al crear producto', error.message || 'No se pudo crear el producto. Inténtalo nuevamente.');
    }
  };

  const handleEditProducto = (producto: any) => {
    setEditingProducto(producto);
    setNuevoProducto({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      precioBase: producto.precioBase,
      stockVentas: producto.stockVentas ?? producto.cantidad ?? 0,
      stockInsumos: producto.stockInsumos ?? 0,
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

  const confirmUpdateProducto = async () => {
    if (!editingProducto) return;

    try {
      const precioFinal = nuevoProducto.precioBase;

      const stockVentas = nuevoProducto.stockVentas || 0;
      const stockInsumos = nuevoProducto.stockInsumos || 0;

      const productoData = {
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion,
        categoria: nuevoProducto.categoria,
        precioBase: nuevoProducto.precioBase,
        stockVentas,
        stockInsumos,
        minCantidad: nuevoProducto.minCantidad,
        marca: nuevoProducto.marca,
        imagen: nuevoProducto.imagen,
        activo: nuevoProducto.activo
      };

      const productoActualizado = await productoService.updateProducto(editingProducto.id, productoData);
      
      // Refresh products list
      const productosActualizados = await productoService.getProductos();
      setProductos(productosActualizados);

      setEditingProducto(null);
      setNuevoProducto({
        nombre: '',
        descripcion: '',
        categoria: '',
        precioBase: 0,
        stockVentas: 0,
        stockInsumos: 0,
        minCantidad: 10,
        marca: '',
        imagen: '',
        activo: true
      });
      setImagenPreview(null);
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);

      edited("Producto editado ✔️", `El producto "${productoActualizado.nombre}" ha sido actualizado exitosamente. El nuevo precio es ${formatCurrency(precioFinal)}.`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      error('Error al actualizar producto', error.message || 'No se pudo actualizar el producto. Inténtalo nuevamente.');
    }
  };

  const handleDeleteProducto = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    setProductoToDelete(producto);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProducto = async () => {
    if (!productoToDelete) return;

    try {
      await productoService.deleteProducto(productoToDelete.id);
      
      // Refresh products list
      const productosActualizados = await productoService.getProductos();
      setProductos(productosActualizados);

      setIsDeleteDialogOpen(false);
      setProductoToDelete(null);
      deleted("Producto eliminado ✔️", `El producto "${productoToDelete.nombre}" ha sido eliminado exitosamente del inventario.`);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      error('Error al eliminar producto', error.message || 'No se pudo eliminar el producto. Inténtalo nuevamente.');
    }
  };

  const toggleProductoActivo = async (productoId: number) => {
    try {
      const productoActualizado = await productoService.toggleProductoActivo(productoId);
      
      // Refresh products list
      const productosActualizados = await productoService.getProductos();
      setProductos(productosActualizados);

      edited(`Producto ${!productoActualizado.activo ? 'activado' : 'desactivado'} ✔️`, `El producto "${productoActualizado.nombre}" ha sido ${!productoActualizado.activo ? 'activado' : 'desactivado'} exitosamente.`);
    } catch (error: any) {
      console.error('Error toggling product active status:', error);
      error('Error al cambiar estado', error.message || 'No se pudo cambiar el estado del producto. Inténtalo nuevamente.');
    }
  };

  const getCantidadStatus = (cantidad: number, minCantidad: number) => {
    // Todos los estados de inventario ahora usan el mismo estilo gris uniforme
    if (cantidad === 0) return { color: "text-gray-lighter", bg: "bg-gray-medium", text: "Sin Cantidad" };
    if (cantidad <= minCantidad) return { color: "text-gray-lighter", bg: "bg-gray-medium", text: "Cantidad Baja" };
    return { color: "text-gray-lighter", bg: "bg-gray-medium", text: "En Inventario" };
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Response del endpoint de upload de imágenes
interface UploadResponse {
  url: string;     // URL relativa del archivo guardado
  message: string; // Mensaje de confirmación
}

// Función para subir imágenes al servidor usando el endpoint /api/upload
// Este endpoint recibe un archivo (IFormFile) y lo guarda en wwwroot/assets/images/
// Validaciones: Solo imágenes (jpg, jpeg, png, gif, webp) con nombre único GUID
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://edwisbarber.somee.com/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir imagen: ${response.statusText}`);
    }

    const result: UploadResponse = await response.json();
    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      error('Error de formato', 'Por favor selecciona un archivo de imagen válido (jpg, jpeg, png, gif, webp).');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Archivo demasiado grande', 'La imagen no debe superar los 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Mostrar preview mientras se sube
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNuevoProducto({ ...nuevoProducto, imagen: result });
        setImagenPreview(result);
      };
      reader.readAsDataURL(file);

      // Subir al servidor
      const imageUrl = await uploadImage(file);
      setNuevoProducto({ ...nuevoProducto, imagen: imageUrl });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      error('Error al subir imagen', 'No se pudo subir la imagen al servidor. Intenta nuevamente.');
      // Limpiar preview si falló
      setImagenPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setNuevoProducto({ ...nuevoProducto, imagen: '' });
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const formatearPrecio = (precio: number): string => {
    return `$ ${precio.toLocaleString('es-CO')}`;
  };

  const getCategoriaColor = (categoria: string) => {
    // Todas las categorías ahora usan el mismo estilo gris uniforme
    return "bg-gray-medium text-gray-lighter";
  };

  return (
    <>
      {loading ? (
        <main className="flex-1 overflow-auto p-8 bg-black-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary mx-auto mb-4"></div>
            <p className="text-white-primary text-lg">Cargando productos...</p>
          </div>
        </main>
      ) : (
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
                    onClick={() => {
                      setEditingProducto(null);
                      setNuevoProducto({
                        nombre: '',
                        descripcion: '',
                        categoria: '',
                        precioBase: 0,
                        stockVentas: 0,
                        stockInsumos: 0,
                        minCantidad: 10,
                        marca: '',
                        imagen: '',
                        activo: true
                      });
                      setImagenPreview(null);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white-primary flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-primary" />
                      {editingProducto ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-lightest">
                      {editingProducto ? 'Modifica la información del producto' : 'Completa los datos del nuevo producto o accesorio'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* Datos Básicos */}
                     <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-primary" />
                          Imagen del Producto
                        </Label>
                        <div className="flex items-center gap-3">
                          {uploadingImage ? (
                            <div className="w-16 h-16 rounded bg-gray-dark border-2 border-gray-medium flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-orange-primary animate-spin" />
                            </div>
                          ) : imagenPreview ? (
                            <div className="relative">
                              <img
                                src={imagenPreview}
                                alt="Vista previa"
                                className="w-16 h-16 rounded object-cover border-2 border-orange-primary"
                              />
                              <button
                                onClick={removeImage}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                                type="button"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded bg-gray-dark border-2 border-gray-medium flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-lightest" />
                            </div>
                          )}
                          <button
                            onClick={triggerFileSelect}
                            disabled={uploadingImage}
                            className="elegante-button-secondary text-xs px-3 py-1.5 gap-1.5 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Camera className="w-3 h-3" />
                                {imagenPreview ? 'Cambiar' : 'Subir'}
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Tags className="w-4 h-4 text-orange-primary" />
                          Nombre del Producto *
                        </Label>
                        <Input
                          value={nuevoProducto.nombre}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                          placeholder="Ej: Cadena de Rodio"
                          className="elegante-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Tags className="w-4 h-4 text-orange-primary" />
                          Categoría *
                        </Label>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Tags className="w-4 h-4 text-orange-primary" />
                          Marca
                        </Label>
                        <Input
                          value={nuevoProducto.marca}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, marca: e.target.value })}
                          placeholder="Nombre de la marca"
                          className="elegante-input"
                        />
                      </div>
                     
                    </div>
                  </div>

                    {/* Configuración de Precios */}
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-orange-primary" />
                        Precio *
                      </Label>
                      <Input
                        type="number"
                        step="1000"
                        value={nuevoProducto.precioBase}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, precioBase: parseFloat(e.target.value) || 0 })}
                        className="elegante-input"
                        placeholder="0"
                      />
                    </div>

                    {/* Inventario - Solo Lectura */}
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-primary/10 border border-orange-primary/30 rounded-lg">
                        <p className="text-orange-primary text-sm flex items-center gap-2">
                          <Boxes className="w-4 h-4" />
                          <span className="font-medium">El stock se gestiona automáticamente desde el módulo de Compras por seguridad.</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Boxes className="w-4 h-4 text-orange-primary" />
                            Stock para Ventas
                          </Label>
                          <Input
                            type="number"
                            value={nuevoProducto.stockVentas}
                            className="elegante-input bg-gray-darkest cursor-not-allowed"
                            disabled
                            readOnly
                          />
                          <p className="text-xs text-gray-lighter">Solo lectura - Se actualiza desde Compras</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Boxes className="w-4 h-4 text-orange-primary" />
                            Stock para Entregas
                          </Label>
                          <Input
                            type="number"
                            value={nuevoProducto.stockInsumos}
                            className="elegante-input bg-gray-darkest cursor-not-allowed"
                            disabled
                            readOnly
                          />
                          <p className="text-xs text-gray-lighter">Solo lectura - Se actualiza desde Compras</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white-primary flex items-center gap-2">
                            <Boxes className="w-4 h-4 text-orange-primary" />
                            Cantidad Mínima (Total)
                          </Label>
                          <Input
                            type="number"
                            value={nuevoProducto.minCantidad}
                            onChange={(e) =>
                              setNuevoProducto({
                                ...nuevoProducto,
                                minCantidad: parseInt(e.target.value) || 0,
                              })
                            }
                            className="elegante-input"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ajuste de stock entre ventas y entregas (solo en edición) */}
                    {editingProducto && (
                      <div className="mt-4 space-y-2 bg-gray-darker p-4 rounded-lg border border-gray-dark">
                        <Label className="text-white-primary flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-orange-primary" />
                          Ajustar stock entre ventas y entregas
                        </Label>
                        <p className="text-gray-lightest text-xs">
                          Ingresa la cantidad a mover y elige hacia dónde transferirla. El
                          stock total se mantiene constante.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Input
                            type="number"
                            min={0}
                            value={ajusteStockEdicion}
                            onChange={(e) =>
                              setAjusteStockEdicion(parseInt(e.target.value) || 0)
                            }
                            className="elegante-input w-24 text-xs"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => moverStockEnFormulario("ventas")}
                              className="px-3 py-1 rounded-lg bg-green-900/30 border border-green-700 text-green-400 text-xs hover:bg-green-900/50"
                            >
                              → Ventas
                            </button>
                            <button
                              type="button"
                              onClick={() => moverStockEnFormulario("insumos")}
                              className="px-3 py-1 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 text-xs hover:bg-blue-900/50"
                            >
                              → Entregas
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vista Previa de Imagen */}
                    {imagenPreview && (
                      <div className="space-y-2">
                        <Label className="text-white-primary flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-primary" />
                          Vista Previa
                        </Label>
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-dark bg-gray-darker flex items-center justify-center group">
                          <img
                            src={imagenPreview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                            onError={() => setImagenPreview(null)}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNuevoProducto({ ...nuevoProducto, imagen: '' });
                              setImagenPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Descripción */}
                    <div className="space-y-2">
                      <Label className="text-white-primary flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-primary" />
                        Descripción
                      </Label>
                      <Textarea
                        value={nuevoProducto.descripcion}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                        placeholder="Detalles..."
                        className="elegante-input min-h-[80px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-dark">
                    <button onClick={() => setIsDialogOpen(false)} className="elegante-button-secondary px-6">
                      Cancelar
                    </button>
                    <button
                      onClick={editingProducto ? handleUpdateProducto : handleCreateProducto}
                      className="elegante-button-primary px-8"
                      disabled={!nuevoProducto.nombre || !nuevoProducto.categoria || nuevoProducto.precioBase <= 0}
                    >
                      {editingProducto ? 'Actualizar' : 'Agregar'} Producto
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter pointer-events-none z-10" />
                <Input
                  placeholder="Buscar productos y accesorios..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="elegante-input pl-11 w-80"
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

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="text-sm text-gray-lightest">
                Mostrando {displayedProductos.length} de {filteredProductos.length} productos
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="px-3 py-1 rounded-full bg-gray-darker border border-gray-dark text-gray-lightest flex items-center gap-1">
                  <Calculator className="w-4 h-4 text-orange-primary" />
                  Ventas potenciales totales:
                  <span className="text-orange-primary font-semibold">
                    ${formatCurrency(totalVentasPotenciales)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-dark">
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Imagen</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Nombre</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Precio</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Ventas</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Entregas</th>
                  <th className="text-left py-3 px-4 text-white-primary font-bold text-sm">Total</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm">Ventas Potenciales</th>
                  <th className="text-center py-3 px-4 text-white-primary font-bold text-sm" style={{ paddingLeft: '70px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedProductos.map((producto) => {
                  const stockTotal = getStockTotal(producto);
                  const cantidadStatus = getCantidadStatus(stockTotal, producto.minCantidad);
                  const stockVentas = producto.stockVentas ?? 0;
                  const stockInsumos = producto.stockInsumos ?? 0;
                  const totalVentasProducto = stockVentas * (producto.precio || 0);
                  return (
                    <tr key={producto.id} className="border-b border-gray-dark hover:bg-gray-darker transition-colors">
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-dark flex items-center justify-center">
                          {producto.imagen ? (
                            <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-lighter" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-center px-4">
                        <span className="text-gray-lighter">{producto.nombre}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">{formatearPrecio(producto.precio)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">{stockVentas}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter" style={{ paddingLeft: '20px' }}>{stockInsumos}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-lighter">{stockTotal}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-lighter">
                          ${formatCurrency(totalVentasProducto)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProducto(producto);
                              setIsDetailDialogOpen(true);
                            }}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-gray-lightest group-hover:text-orange-primary" />
                          </button>
                          <button
                            onClick={() => handleEditProducto(producto)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-lightest group-hover:text-blue-400" />
                          </button>
                          <button
                            onClick={() => toggleProductoActivo(producto.id)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title={producto.activo ? "Desactivar producto" : "Activar producto"}
                          >
                            {producto.activo ? (
                              <ToggleRight className="w-4 h-4 text-gray-lightest group-hover:text-green-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteProducto(producto.id)}
                            className="p-2 hover:bg-gray-darker rounded-lg transition-colors group"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-gray-lightest group-hover:text-red-400" />
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

        {/* Dialog de confirmación para crear */}
        <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Creación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas agregar este producto al inventario?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCreateProducto}
                className="elegante-button-primary"
              >
                Agregar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de confirmación para editar */}
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Actualización</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas actualizar este producto?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmUpdateProducto}
                className="elegante-button-primary"
              >
                Actualizar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de confirmación para eliminar */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-darkest border-gray-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white-primary">Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-lightest">
                ¿Estás seguro de que deseas eliminar "{productoToDelete?.nombre}"? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-darker border-gray-dark text-white-primary hover:bg-gray-dark">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProducto}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Eliminar Producto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de detalles del producto */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-white-primary flex items-center gap-2 text-2xl">
                <Package className="w-6 h-6 text-orange-primary" />
                Detalles del Producto
              </DialogTitle>
              <DialogDescription className="text-gray-lightest text-base">
                Información completa del producto seleccionado
              </DialogDescription>
            </DialogHeader>

            {selectedProducto && (
              <div className="grid grid-cols-4 gap-6 pt-4">
                <div className="col-span-4 flex items-center gap-4 p-4 bg-gray-darker rounded-lg border border-gray-dark">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-dark flex items-center justify-center">
                    {selectedProducto.imagen ? (
                      <img src={selectedProducto.imagen} alt={selectedProducto.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-lighter" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white-primary">{selectedProducto.nombre}</h3>
                    <p className="text-gray-lighter">{selectedProducto.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(selectedProducto.categoria)}`}>
                        {selectedProducto.categoria}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedProducto.activo ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {selectedProducto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COLUMNA 1: DATOS BÁSICOS */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-orange-primary mb-2 flex items-center gap-2">
                    <Tags className="w-4 h-4" /> Datos Básicos
                  </h3>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Nombre del Producto</Label>
                    <p className="text-white-primary font-medium">{selectedProducto.nombre}</p>
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Categoría</Label>
                    <p className="text-white-primary">{selectedProducto.categoria}</p>
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Marca</Label>
                    <p className="text-white-primary">{selectedProducto.marca}</p>
                  </div>
                </div>

                {/* COLUMNA 2: PRECIOS */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Configuración de Precios
                  </h3>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Precio Base</Label>
                    <p className="text-white-primary text-lg">${formatCurrency(selectedProducto.precioBase)}</p>
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">IVA</Label>
                    <p className="text-white-primary text-lg">{selectedProducto.porcentajeIva}% (${formatCurrency(selectedProducto.iva)})</p>
                  </div>

                  <div className="border-t border-gray-medium pt-3">
                    <Label className="text-gray-lighter text-sm mb-1 block">Precio Final</Label>
                    <p className="text-orange-primary font-semibold text-xl">{formatearPrecio(selectedProducto.precio)}</p>
                  </div>
                </div>

                {/* COLUMNA 3: INVENTARIO Y MOVIMIENTOS */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Boxes className="w-4 h-4" /> Inventario & Estado
                  </h3>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Stock para Ventas</Label>
                    <p className="text-white-primary text-lg">
                      {(selectedProducto.stockVentas ?? 0)} unidades
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Stock para Entregas</Label>
                    <p className="text-white-primary text-lg">
                      {(selectedProducto.stockInsumos ?? 0)} unidades
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Stock Total</Label>
                    <p className="text-white-primary text-lg">
                      {getStockTotal(selectedProducto)} unidades
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Cantidad Mínima</Label>
                    <p className="text-white-primary text-lg">
                      {selectedProducto.minCantidad} unidades
                    </p>
                  </div>
                </div>

                {/* COLUMNA 4: MULTIMEDIA */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Multimedia
                  </h3>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">URL Imagen</Label>
                    <p className="text-white-primary break-all">{selectedProducto.imagen || 'Sin imagen definida'}</p>
                  </div>

                  <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-dark bg-gray-darker flex items-center justify-center">
                    {selectedProducto.imagen ? (
                      <img
                        src={selectedProducto.imagen}
                        alt={selectedProducto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-lighter text-sm mb-1 block">Descripción</Label>
                    <p className="text-white-primary text-sm whitespace-pre-line">
                      {selectedProducto.descripcion || 'Sin descripción registrada'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-8 border-t border-gray-dark mt-6">
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="elegante-button-secondary"
              >
                Cerrar
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertContainer />
      </main>
      )}
    </>
  );
}