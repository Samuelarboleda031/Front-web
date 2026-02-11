// =============================================================================
// MÓDULO COMPLETO DE PRODUCTOS - TODO EN UN SOLO ARCHIVO
// =============================================================================

import { useCustomAlert } from "../components/ui/custom-alert";

// -----------------------------------------------------------------------------
// INTERFACES Y TIPOS
// -----------------------------------------------------------------------------

export interface ApiProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  precioBase: number;
  precio: number;
  iva: number;
  porcentajeIva: number;
  stockVentas: number;
  stockInsumos: number;
  cantidad: number;
  minCantidad: number;
  marca: string | null;
  imagen: string | null;
  activo: boolean;
}

export interface ApiCategoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

// -----------------------------------------------------------------------------
// SERVICIO DE PRODUCTOS
// -----------------------------------------------------------------------------

const API_BASE_URL = '/api';

// Mapeo de nombres de categorías a IDs (se actualizará dinámicamente)
let CATEGORIA_MAP: { [key: string]: number } = {
  "Cuidado Capilar": 1,
  "Cuidado Barba": 2,
  "Herramientas": 3,
  "Suministros": 4,
  "Accesorios": 5
};

class ProductoService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const isGet = !options.method || options.method === 'GET';
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = isGet ? `${API_BASE_URL}${endpoint}${separator}t=${Date.now()}` : `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`Producto API [${config.method || 'GET'}]: ${url}`);
      if (config.body) {
        console.log(`📤 Request Body:`, config.body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Producto API Error [${response.status}]: ${errorText}`);
        console.error(`❌ Request URL: ${url}`);
        console.error(`❌ Request Method: ${config.method || 'GET'}`);
        console.error(`❌ Request Headers:`, config.headers);
        console.error(`❌ Request Body:`, config.body);
        
        // Intentar parsear el error como JSON para más detalles
        try {
          const errorJson = JSON.parse(errorText);
          console.error(`❌ Error JSON:`, errorJson);
          throw new Error(`Error del servidor (${response.status}): ${JSON.stringify(errorJson)}`);
        } catch (parseError) {
          throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      console.error('Producto API Network/Error:', error);
      throw error;
    }
  }

  // Mapear desde formato API a formato frontend
  private mapFromApiFormat(data: any): ApiProducto {
    if (!data) return data as any;

    return {
      id: data.Id || data.id,
      nombre: data.Nombre || data.nombre,
      descripcion: data.Descripcion || data.descripcion,
      categoria: data.Categoria || data.categoria,
      precioBase: Number(data.PrecioBase || data.precioBase || data.precioVenta || data.precioCompra),
      precio: Number(data.Precio || data.precio || data.precioVenta || data.precioCompra),
      iva: Number(data.Iva || data.iva || 0),
      porcentajeIva: Number(data.PorcentajeIva || data.porcentajeIva || 0),
      stockVentas: Number(data.StockVentas || data.stockVentas),
      stockInsumos: Number(data.StockInsumos || data.stockInsumos),
      cantidad: Number(data.Cantidad || data.cantidad),
      minCantidad: Number(data.MinCantidad || data.minCantidad || data.stockMinimo),
      marca: data.Marca || data.marca || '',
      imagen: data.Imagen || data.imagen || '',
      activo: data.Activo !== undefined ? !!data.Activo : (data.activo !== undefined ? !!data.activo : (data.estado !== undefined ? !!data.estado : true)),
    };
  }

  // =============================================================================
  // MÉTODOS CRUD
  // =============================================================================

  async getProductos(): Promise<ApiProducto[]> {
    try {
      console.log('Fetching productos from:', `${API_BASE_URL}/productos`);
      const response = await this.request('/productos');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      
      console.log('📦 Productos crudos de API:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('📦 Primer producto crudo:', data[0]);
        console.log('📦 Keys del primer producto:', Object.keys(data[0]));
      }

      const mappedData = Array.isArray(data) ? data.map(item => this.mapFromApiFormat(item)) : [];
      console.log('📦 Productos mapeados:', mappedData);
      if (mappedData.length > 0) {
        console.log('📦 Primer producto mapeado:', mappedData[0]);
      }
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching productos:', error);
      throw error;
    }
  }

  async getProductoById(id: number): Promise<ApiProducto | null> {
    try {
      const response = await this.request(`/productos/${id}`);
      const text = await response.text();
      const data = JSON.parse(text);
      return this.mapFromApiFormat(data);
    } catch (error) {
      console.error('Error fetching producto by ID:', error);
      return null;
    }
  }

  async createProducto(productoData: Partial<ApiProducto>): Promise<ApiProducto> {
    try {
      // Obtener el ID de la categoría
      const categoriaId = CATEGORIA_MAP[productoData.categoria || ''] || 1;
      
      // Enviar los campos exactos que la API espera
      const apiBody = {
        nombre: productoData.nombre || '',
        descripcion: productoData.descripcion || '',
        precioVenta: Number(productoData.precioBase) || 0,
        precioCompra: Number(productoData.precioBase) || 0,
        stockVentas: Number(productoData.stockVentas) || 0,
        stockInsumos: Number(productoData.stockInsumos) || 0,
        stockMinimo: Number(productoData.minCantidad) || 0,
        categoriaId: categoriaId,
        estado: productoData.activo !== undefined ? !!productoData.activo : true
      };
      
      console.log('🔵 Creando producto - Datos originales:', productoData);
      console.log('🔵 Creando producto - Datos mapeados (enviados):', apiBody);

      const response = await this.request('/productos', {
        method: 'POST',
        body: JSON.stringify(apiBody),
      });

      const text = await response.text();
      if (!text) {
        // Si la respuesta está vacía, crear un objeto basado en lo enviado
        const productoCreado = {
          id: Date.now(), // ID temporal
          ...productoData,
          precio: productoData.precioBase,
          cantidad: (Number(productoData.stockVentas) || 0) + (Number(productoData.stockInsumos) || 0)
        } as ApiProducto;
        console.log('✅ Producto creado (respuesta vacía):', productoCreado);
        return productoCreado;
      }

      const result = JSON.parse(text);
      console.log('✅ Producto creado exitosamente:', result);
      return this.mapFromApiFormat(result);
    } catch (error: any) {
      console.error('❌ Error creating producto:', error);
      console.error('❌ Datos que causaron el error:', productoData);
      throw error;
    }
  }

  async updateProducto(id: number, productoData: Partial<ApiProducto>): Promise<ApiProducto> {
    try {
      // Obtener el ID de la categoría
      const categoriaId = CATEGORIA_MAP[productoData.categoria || ''] || 1;
      
      // Enviar los campos exactos que la API espera para PUT
      const apiBody = {
        id: id,
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        precioVenta: Number(productoData.precioBase),
        precioCompra: Number(productoData.precioBase),
        stockVentas: Number(productoData.stockVentas),
        stockInsumos: Number(productoData.stockInsumos),
        stockMinimo: Number(productoData.minCantidad),
        categoriaId: categoriaId,
        estado: productoData.activo !== undefined ? !!productoData.activo : true
      };
      
      console.log('🔵 Actualizando producto - Datos originales:', productoData);
      console.log('🔵 Actualizando producto - Datos mapeados (enviados):', apiBody);

      const response = await this.request(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiBody),
      });

      const text = await response.text();
      if (!text) return { ...productoData, id } as ApiProducto;

      const result = JSON.parse(text);
      return this.mapFromApiFormat(result);
    } catch (error: any) {
      console.error('❌ Error updating producto:', error);
      console.error('❌ Datos que causaron el error:', productoData);
      
      // Detectar errores específicos de PUT
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('precioventa') || errorMessage.includes('precio')) {
        const customError = new Error(
          'Error en el precio: Verifica que el precio sea válido y mayor a 0.'
        );
        customError.name = 'PrecioInvalido';
        throw customError;
      }
      
      if (errorMessage.includes('categoriaid') || errorMessage.includes('categoría')) {
        const customError = new Error(
          'Error en la categoría: La categoría seleccionada no es válida.'
        );
        customError.name = 'CategoriaInvalida';
        throw customError;
      }
      
      throw error;
    }
  }

  async deleteProducto(id: number): Promise<void> {
    try {
      console.log(`🗑️ Intentando eliminar producto con ID: ${id}`);
      const response = await this.request(`/productos/${id}`, {
        method: 'DELETE',
      });

      const text = await response.text();
      console.log(`✅ Producto eliminado - Respuesta del servidor:`, text || '(sin contenido)');
    } catch (error: any) {
      console.error('❌ Error deleting producto:', error);
      console.error('❌ Detalles del error:', error.message);
      
      // Detectar errores de restricción de clave externa
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('foreign key') || 
          errorMessage.includes('constraint') || 
          errorMessage.includes('relación') ||
          errorMessage.includes('referencia') ||
          errorMessage.includes('related') ||
          errorMessage.includes('dependiente')) {
        
        const customError = new Error(
          'No se puede eliminar el producto porque está relacionado con otros registros (ventas, compras, etc.). ' +
          'Primero debe eliminar o actualizar los registros relacionados.'
        );
        customError.name = 'ForeignKeyConstraint';
        throw customError;
      }
      
      throw error;
    }
  }

  // =============================================================================
  // MÉTODOS ADICIONALES
  // =============================================================================

  async toggleProductoActivo(id: number): Promise<ApiProducto> {
    try {
      // Primero obtener el producto actual
      const producto = await this.getProductoById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Obtener el ID de la categoría
      const categoriaId = CATEGORIA_MAP[producto.categoria || ''] || 1;
      
      // Enviar solo los campos necesarios para cambiar el estado
      const apiBody = {
        id: id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precioVenta: Number(producto.precioBase) || 0,
        precioCompra: Number(producto.precioBase) || 0,
        stockVentas: Number(producto.stockVentas) || 0,
        stockInsumos: Number(producto.stockInsumos) || 0,
        stockMinimo: Number(producto.minCantidad) || 0,
        categoriaId: categoriaId,
        estado: !producto.activo  // Solo cambiar este campo
      };
      
      console.log('🔄 Toggle activo - Producto:', producto.nombre);
      console.log('🔄 Toggle activo - Estado actual:', producto.activo);
      console.log('🔄 Toggle activo - Nuevo estado:', !producto.activo);
      console.log('🔄 Toggle activo - Payload enviado:', apiBody);

      const response = await this.request(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiBody),
      });

      const text = await response.text();
      if (!text) {
        // Si la respuesta está vacía, retornar el producto con el estado actualizado
        return {
          ...producto,
          activo: !producto.activo
        } as ApiProducto;
      }

      const result = JSON.parse(text);
      const updatedProducto = this.mapFromApiFormat(result);
      console.log(`✅ Producto ${!producto.activo ? 'activado' : 'desactivado'}:`, updatedProducto);
      
      return updatedProducto;
    } catch (error) {
      console.error('Error toggling producto activo:', error);
      throw error;
    }
  }

  async ajustarStock(id: number, cantidad: number, destino: 'ventas' | 'insumos'): Promise<ApiProducto> {
    try {
      const producto = await this.getProductoById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      let nuevoStockVentas = producto.stockVentas || 0;
      let nuevoStockInsumos = producto.stockInsumos || 0;

      if (destino === 'ventas') {
        if (cantidad > nuevoStockInsumos) {
          throw new Error('No hay suficiente stock de entregas para mover a ventas.');
        }
        nuevoStockVentas += cantidad;
        nuevoStockInsumos -= cantidad;
      } else {
        if (cantidad > nuevoStockVentas) {
          throw new Error('No hay suficiente stock de ventas para mover a entregas.');
        }
        nuevoStockVentas -= cantidad;
        nuevoStockInsumos += cantidad;
      }

      const updatedProducto = await this.updateProducto(id, {
        stockVentas: nuevoStockVentas,
        stockInsumos: nuevoStockInsumos,
        cantidad: nuevoStockVentas + nuevoStockInsumos
      });

      return updatedProducto;
    } catch (error) {
      console.error('Error ajustando stock:', error);
      throw error;
    }
  }

  async searchProductos(query: string): Promise<ApiProducto[]> {
    try {
      const productos = await this.getProductos();
      return productos.filter(producto =>
        producto.nombre?.toLowerCase().includes(query.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(query.toLowerCase()) ||
        producto.categoria?.toLowerCase().includes(query.toLowerCase()) ||
        producto.marca?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching productos:', error);
      return [];
    }
  }

  async getCategorias(): Promise<string[]> {
    try {
      // Si la API tiene un endpoint de categorías, usarlo
      const response = await this.request('/categorias');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      
      console.log('📂 Categorías crudas de API:', data);
      
      // Si vienen como objetos, extraer los nombres y IDs
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const categoriasConIds = data.map((cat: any) => ({
          id: cat.Id || cat.id,
          nombre: cat.Nombre || cat.nombre
        }));
        console.log('📂 Categorías mapeadas con IDs:', categoriasConIds);
        
        // Actualizar el mapeo con los IDs reales
        categoriasConIds.forEach((cat: any) => {
          CATEGORIA_MAP[cat.nombre] = cat.id;
        });
        
        return categoriasConIds.map(cat => cat.nombre);
      }
      
      // Si vienen como strings directos
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching categorias:', error);
      // Categorías por defecto si la API no tiene el endpoint
      return [
        "Cuidado Capilar", 
        "Cuidado Barba", 
        "Herramientas", 
        "Suministros", 
        "Accesorios"
      ];
    }
  }
}

// =============================================================================
// INSTANCIA GLOBAL DEL SERVICIO
// =============================================================================

export const productoService = new ProductoService();

// =============================================================================
// UTILIDADES
// =============================================================================

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-CO');
};

export const formatearPrecio = (precio: number): string => {
  return `$ ${precio.toLocaleString('es-CO')}`;
};

// =============================================================================
// FUNCIONES DE PRUEBA (CONSOLA)
// =============================================================================

// Prueba simplificada para POST
async function testSimplePost() {
  console.log('🧪 Probando POST simple con estructura correcta...');
  
  try {
    const testData = {
      nombre: 'Producto Test Simple',
      descripcion: 'Test description',
      precioVenta: 25000,
      precioCompra: 25000,
      stockVentas: 10,
      stockInsumos: 0,
      stockMinimo: 5,
      categoriaId: 5, // ID para "Accesorios"
      estado: true
    };

    console.log('📤 Enviando datos:', testData);

    const response = await fetch('/api/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Error JSON:', errorJson);
      } catch (e) {
        console.error('❌ No se pudo parsear el error como JSON');
      }
      return;
    }

    const result = await response.json();
    console.log('✅ Producto creado:', result);

  } catch (error) {
    console.error('❌ Error en prueba simple:', error);
  }
}

// Prueba completa de CRUD
async function testProductosCRUD() {
  console.log('🧪 Iniciando pruebas CRUD de productos...\n');

  try {
    // 1. Obtener todos los productos
    console.log('📋 1. Obteniendo todos los productos...');
    const productos = await productoService.getProductos();
    console.log(`✅ Se encontraron ${productos.length} productos`);

    // 2. Obtener categorías
    console.log('\n📂 2. Obteniendo categorías...');
    const categorias = await productoService.getCategorias();
    console.log(`✅ Categorías disponibles:`, categorias);

    // 3. Crear un producto de prueba
    console.log('\n➕ 3. Creando producto de prueba...');
    const nuevoProducto = {
      nombre: 'Producto Test CRUD',
      descripcion: 'Producto creado para probar la API',
      categoria: categorias[0] || 'Cuidado Capilar',
      precioBase: 25000,
      stockVentas: 10,
      stockInsumos: 5,
      minCantidad: 5,
      marca: 'Test Brand',
      activo: true,
      porcentajeIva: 19
    };

    const productoCreado = await productoService.createProducto(nuevoProducto);
    console.log('✅ Producto creado:', productoCreado);

    // 4. Actualizar producto
    console.log('\n✏️ 4. Actualizando producto...');
    const productoActualizado = await productoService.updateProducto(productoCreado.id, {
      nombre: 'Producto Test CRUD - Actualizado',
      descripcion: 'Descripción actualizada',
      precioBase: 30000
    });
    console.log('✅ Producto actualizado:', productoActualizado);

    // 5. Probar toggle activo
    console.log('\n🔄 5. Probando toggle activo...');
    const toggleActivo = await productoService.toggleProductoActivo(productoCreado.id);
    console.log('✅ Toggle activo:', toggleActivo);

    // 6. Buscar productos
    console.log('\n🔎 6. Probando búsqueda...');
    const searchResults = await productoService.searchProductos('Test');
    console.log('✅ Resultados de búsqueda:', searchResults.length, 'productos');

    // 7. Eliminar producto
    console.log('\n🗑️ 7. Eliminando producto de prueba...');
    await productoService.deleteProducto(productoCreado.id);
    console.log('✅ Producto eliminado exitosamente');

    console.log('\n🎉 Todas las pruebas CRUD completadas exitosamente!');

  } catch (error: any) {
    console.error('❌ Error en las pruebas:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Prueba de eliminación
async function testDeleteProducto() {
  console.log('🧪 Probando eliminación de productos...');
  
  try {
    const productos = await productoService.getProductos();
    console.log('📦 Productos disponibles:', productos.map((p: any) => ({ id: p.id, nombre: p.nombre })));
    
    if (productos.length === 0) {
      console.log('❌ No hay productos para eliminar');
      return;
    }
    
    const productoAEliminar = productos[0];
    console.log(`🗑️ Intentando eliminar producto: "${productoAEliminar.nombre}" (ID: ${productoAEliminar.id})`);
    
    try {
      await productoService.deleteProducto(productoAEliminar.id);
      console.log('✅ Producto eliminado exitosamente');
      
      const productosDespues = await productoService.getProductos();
      const eliminado = !productosDespues.some((p: any) => p.id === productoAEliminar.id);
      console.log('✅ Verificación: Producto', eliminado ? 'SÍ fue eliminado' : 'NO fue eliminado');
      
    } catch (deleteError: any) {
      console.error('❌ Error al eliminar producto:', deleteError.message);
      
      if (deleteError.name === 'ForeignKeyConstraint') {
        console.log('🔗 Error de clave externa detectado');
        console.log('💡 Solución: Desactivar el producto en lugar de eliminarlo');
        
        try {
          console.log('🔄 Intentando desactivar el producto como alternativa...');
          const productoDesactivado = await productoService.toggleProductoActivo(productoAEliminar.id);
          console.log('✅ Producto desactivado exitosamente:', productoDesactivado.activo ? 'ACTIVO' : 'INACTIVO');
        } catch (toggleError) {
          console.error('❌ Error al desactivar producto:', toggleError);
        }
      } else {
        console.log('❓ Otro tipo de error:', deleteError.name);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
  
  console.log('🧪 Fin de la prueba de eliminación');
}

// Prueba de actualización
async function testUpdateProducto() {
  console.log('🧪 Probando actualización de productos (PUT)...');
  
  try {
    const productos = await productoService.getProductos();
    console.log('📦 Productos disponibles:', productos.map((p: any) => ({ id: p.id, nombre: p.nombre })));
    
    if (productos.length === 0) {
      console.log('❌ No hay productos para actualizar');
      return;
    }
    
    const productoAActualizar = productos[0];
    console.log(`✏️ Intentando actualizar producto: "${productoAActualizar.nombre}" (ID: ${productoAActualizar.id})`);
    
    const datosActualizacion = {
      nombre: `${productoAActualizar.nombre} - EDITADO`,
      descripcion: `Descripción actualizada: ${new Date().toLocaleTimeString()}`,
      precioBase: (productoAActualizar.precioBase || 1000) + 1000,
      stockVentas: (productoAActualizar.stockVentas || 0) + 1,
      stockInsumos: productoAActualizar.stockInsumos || 0,
      minCantidad: productoAActualizar.minCantidad || 5,
      categoria: productoAActualizar.categoria || 'Cuidado Capilar',
      activo: productoAActualizar.activo !== false
    };
    
    console.log('📝 Datos de actualización:', datosActualizacion);
    
    try {
      const productoActualizado = await productoService.updateProducto(
        productoAActualizar.id, 
        datosActualizacion
      );
      
      console.log('✅ Producto actualizado exitosamente:', productoActualizado);
      
      const productosDespues = await productoService.getProductos();
      const productoVerificado = productosDespues.find((p: any) => p.id === productoAActualizar.id);
      
      if (productoVerificado) {
        console.log('✅ Verificación: Producto actualizado en la lista');
        console.log('📊 Cambios aplicados:', {
          nombre: productoVerificado.nombre,
          descripcion: productoVerificado.descripcion,
          precioBase: productoVerificado.precioBase
        });
      } else {
        console.log('❌ Verificación: Producto no encontrado después de actualizar');
      }
      
    } catch (updateError: any) {
      console.error('❌ Error al actualizar producto:', updateError.message);
      
      if (updateError.name === 'PrecioInvalido') {
        console.log('💰 Error de precio detectado');
      } else if (updateError.name === 'CategoriaInvalida') {
        console.log('📂 Error de categoría detectado');
      } else {
        console.log('❓ Otro tipo de error:', updateError.name);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general en la prueba:', error);
  }
  
  console.log('🧪 Fin de la prueba de actualización');
}

// Debug API
async function debugAPI() {
  console.log('🔍 === DEPURACIÓN DE API ===');
  
  try {
    // 1. Ver categorías
    console.log('\n📂 1. Obteniendo categorías...');
    const catResponse = await fetch('/api/categorias?t=' + Date.now());
    const catText = await catResponse.text();
    const catData = JSON.parse(catText);
    console.log('Categorías respuesta:', catData);
    console.log('Tipo de categorías:', Array.isArray(catData) ? 'Array' : typeof catData);
    if (Array.isArray(catData) && catData.length > 0) {
      console.log('Primera categoría:', catData[0]);
      console.log('Keys de primera categoría:', Object.keys(catData[0]));
    }
    
    // 2. Ver productos existentes
    console.log('\n📦 2. Obteniendo productos existentes...');
    const prodResponse = await fetch('/api/productos?t=' + Date.now());
    const prodText = await prodResponse.text();
    const prodData = JSON.parse(prodText);
    console.log('Productos respuesta:', prodData);
    if (Array.isArray(prodData) && prodData.length > 0) {
      console.log('Primer producto:', prodData[0]);
      console.log('Keys de primer producto:', Object.keys(prodData[0]));
    }
    
  } catch (error) {
    console.error('❌ Error en depuración:', error);
  }
  
  console.log('\n🔍 === FIN DEPURACIÓN ===');
}

// =============================================================================
// HACER FUNCIONES DISPONIBLES EN CONSOLA
// =============================================================================

if (typeof window !== 'undefined') {
  (window as any).testSimplePost = testSimplePost;
  (window as any).testProductosCRUD = testProductosCRUD;
  (window as any).testDeleteProducto = testDeleteProducto;
  (window as any).testUpdateProducto = testUpdateProducto;
  (window as any).debugAPI = debugAPI;
  
  console.log('🧪 Funciones de prueba disponibles en consola:');
  console.log('  - testSimplePost()');
  console.log('  - testProductosCRUD()');
  console.log('  - testDeleteProducto()');
  console.log('  - testUpdateProducto()');
  console.log('  - debugAPI()');
}

// =============================================================================
// EXPORTACIONES
// =============================================================================

export {
  testSimplePost,
  testProductosCRUD,
  testDeleteProducto,
  testUpdateProducto,
  debugAPI
};
