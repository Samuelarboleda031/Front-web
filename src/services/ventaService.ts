const API_BASE_URL = '/api';

export interface Venta {
  id: number;
  numeroVenta: number;
  cliente: string;
  clienteId: number | null;
  clienteDocumento: string;
  fecha: string;
  servicios: string;
  productos: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  barbero: string;
  barberoId?: number | null;
  estado: string;
  metodoPago: string;
  productosDetalle: ProductoDetalle[];
  serviciosDetalle: ServicioDetalle[];
}

export interface ProductoDetalle {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface ServicioDetalle {
  id: string;
  nombre: string;
  precio: number;
}

export interface CreateVentaRequest {
  numeroVenta: number;
  clienteId: number | null;
  clienteDocumento: string;
  fecha: string;
  servicios: string;
  productos: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  barberoId?: number | null;
  barberoNombre?: string;
  estado: string;
  metodoPago: string;
  productosDetalle: ProductoDetalle[];
  serviciosDetalle: ServicioDetalle[];
}

class VentaService {
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
      console.log(`VentaService [${config.method || 'GET'}]: ${url}`);
      if (config.body) {
        console.log(`📤 Request Body:`, config.body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ VentaService Error [${response.status}]: ${errorText}`);
        throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('VentaService Network/API Error:', error);
      throw error;
    }
  }

  private mapToApiFormat(data: any): any {
    const mapped: any = {};

    // Campos requeridos por el backend (VentaInput)
    if (data.id !== undefined) mapped.id = data.id;
    if (data.clienteId !== undefined) mapped.clienteId = data.clienteId;

    // Mapear usuarioId para el barbero
    if (data.barberoId !== undefined && data.barberoId !== null) {
      mapped.usuarioId = data.barberoId;
    } else if (data.usuarioId !== undefined) {
      mapped.usuarioId = data.usuarioId;
    }

    if (data.metodoPago !== undefined) mapped.metodoPago = data.metodoPago;
    if (data.descuento !== undefined) mapped.descuento = Number(data.descuento);
    // Aunque el usuario sugirió que el backend recalcula, incluimos IVA si está presente para consistencia
    if (data.iva !== undefined) mapped.iva = Number(data.iva);

    // Unificar detalles en la propiedad 'detalles' (camelCase)
    const detalles: any[] = [];

    if (data.productosDetalle && Array.isArray(data.productosDetalle)) {
      data.productosDetalle.forEach((p: any) => {
        detalles.push({
          productoId: parseInt(p.id),
          cantidad: Number(p.cantidad),
          precioUnitario: Number(p.precio)
        });
      });
    }

    if (data.serviciosDetalle && Array.isArray(data.serviciosDetalle)) {
      data.serviciosDetalle.forEach((s: any) => {
        // Extraer ID numérico (ej: "SERV-2" -> 2)
        const idStr = String(s.id).replace('SERV-', '');
        const id = parseInt(idStr);
        if (!isNaN(id)) {
          detalles.push({
            servicioId: id,
            cantidad: 1,
            precioUnitario: Number(s.precio)
          });
        }
      });
    }

    if (detalles.length > 0) {
      mapped.detalles = detalles;
    }

    return mapped;
  }

  private async normalizeVentaData(data: any): Promise<Venta> {
    if (!data) return {} as Venta;

    // 1. Normalización de objetos principales (Soporte Pascal/camel)
    const cliente = data.cliente || data.Cliente || {};
    const usuario = data.usuario || data.Usuario || {};
    const detallesApi = data.detalleVenta || data.detalleVentas || data.detalles ||
      data.DetalleVenta || data.DetalleVentas || data.Detalles || [];

    // 2. Procesar detalles de productos y servicios
    const productosDetalle: ProductoDetalle[] = [];
    const serviciosDetalle: ServicioDetalle[] = [];

    // Primero procesamos los detalles anidados si existen
    for (const d of detallesApi) {
      const p = d.producto || d.Producto;
      const s = d.servicio || d.Servicio;
      const paq = d.paquete || d.Paquete;
      const precioUnit = Number(d.precioUnitario || d.PrecioUnitario || 0);

      if (p) {
        productosDetalle.push({
          id: String(p.id || p.Id || d.productoId || d.ProductoId),
          nombre: p.nombre || p.Nombre || 'Producto',
          cantidad: Number(d.cantidad || d.Cantidad || 1),
          precio: precioUnit
        });
      } else if (s) {
        serviciosDetalle.push({
          id: String(s.id || s.Id || d.servicioId || d.ServicioId),
          nombre: s.nombre || s.Nombre || 'Servicio',
          precio: precioUnit
        });
      } else if (paq || d.paqueteId || d.PaqueteId) {
        serviciosDetalle.push({
          id: `PAQ-${d.paqueteId || d.PaqueteId || paq?.id || paq?.Id}`,
          nombre: paq?.nombre || paq?.Nombre || 'Paquete',
          precio: precioUnit
        });
      }
    }

    // Si no hay detalles anidados, buscamos arreglos planos (resiliencia)
    if (productosDetalle.length === 0) {
      (data.productosDetalle || data.ProductosDetalle || []).forEach((p: any) => {
        productosDetalle.push({
          id: String(p.id || p.Id),
          nombre: p.nombre || p.Nombre,
          cantidad: p.cantidad || p.Cantidad,
          precio: p.precio || p.Precio
        });
      });
    }
    if (serviciosDetalle.length === 0) {
      (data.serviciosDetalle || data.ServiciosDetalle || []).forEach((s: any) => {
        serviciosDetalle.push({
          id: String(s.id || s.Id),
          nombre: s.nombre || s.Nombre,
          precio: s.precio || s.Precio
        });
      });
    }

    // 3. Resolución de nombres con soporte para Pascal/camel y fallbacks
    const clienteNombre = cliente.nombre || cliente.Nombre
      ? `${cliente.nombre || cliente.Nombre} ${cliente.apellido || cliente.Apellido || ''}`.trim()
      : (data.clienteNombre || data.ClienteNombre || data.cliente || data.Cliente || 'Cliente');

    const barberoNombre = usuario.nombre || usuario.Nombre
      ? `${usuario.nombre || usuario.Nombre} ${usuario.apellido || usuario.Apellido || ''}`.trim()
      : (data.barberoNombre || data.BarberoNombre || data.barbero || data.Barbero || 'Sin asignar');

    // 4. Extracción segura de IDs numéricos para evitar NaN/Nombres en campos de ID
    const getNumericId = (val: any, fallbackId?: any) => {
      const num = Number(val);
      if (!isNaN(num) && val !== null && val !== "" && typeof val !== 'object' && num > 0) return num;
      const fallbackNum = Number(fallbackId);
      return (!isNaN(fallbackNum) && fallbackId !== null && fallbackId !== "" && fallbackNum > 0) ? fallbackNum : null;
    };

    const finalClienteId = getNumericId(data.clienteId || data.ClienteId, cliente.id || cliente.Id);
    const finalBarberoId = getNumericId(data.barberoId || data.BarberoId || data.usuarioId || data.UsuarioId, usuario.id || usuario.Id);

    // 5. Retorno del objeto normalizado
    return {
      id: Number(data.id || data.Id) || 0,
      numeroVenta: Number(data.numeroVenta || data.NumeroVenta || data.id || data.Id || 0),
      cliente: clienteNombre,
      clienteId: finalClienteId,
      clienteDocumento: String(cliente.documento || cliente.Documento || data.clienteDocumento || data.ClienteDocumento || ''),
      fecha: String(data.fecha || data.Fecha || ''),
      servicios: data.servicios || data.Servicios || serviciosDetalle.map(s => s.nombre).join(', ') || 'Sin servicios',
      productos: data.productos || data.Productos || productosDetalle.map(p => `${p.nombre} (x${p.cantidad})`).join(', ') || 'Sin productos',
      subtotal: Number(data.subtotal || data.Subtotal) || 0,
      iva: Number(data.iva || data.Iva) || 0,
      descuento: Number(data.descuento || data.Descuento) || 0,
      total: Number(data.total || data.Total) || 0,
      barbero: barberoNombre,
      barberoId: finalBarberoId,
      estado: String(data.estado || data.Estado || 'Completada'),
      metodoPago: String(data.metodoPago || data.MetodoPago || 'Efectivo'),
      productosDetalle,
      serviciosDetalle
    };
  }

  async getVentas(): Promise<Venta[]> {
    try {
      console.log('📥 Obteniendo ventas desde:', `${API_BASE_URL}/ventas`);
      const response = await this.request('/ventas');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Ventas obtenidas:', data);
      const normalizedData = Array.isArray(data) ? await Promise.all(data.map(item => this.normalizeVentaData(item))) : [];
      console.log('✅ Ventas normalizadas:', normalizedData);
      return normalizedData;
    } catch (error: any) {
      console.error('❌ Error obteniendo ventas:', error);
      throw error;
    }
  }

  async getVentaById(id: number): Promise<Venta | null> {
    try {
      console.log(`📥 Obteniendo venta ${id} desde:`, `${API_BASE_URL}/ventas/${id}`);
      const response = await this.request(`/ventas/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Venta ${id} obtenida:`, data);

      if (!data) return null;

      return await this.normalizeVentaData(data);
    } catch (error: any) {
      console.error(`❌ Error obteniendo venta ${id}:`, error);
      throw error;
    }
  }

  async createVenta(ventaData: CreateVentaRequest): Promise<Venta> {
    try {
      console.log('🔍 Original ventaData before mapping:', ventaData);
      console.log('🔍 productosDetalle:', ventaData.productosDetalle);
      console.log('🔍 serviciosDetalle:', ventaData.serviciosDetalle);
      const mapped = this.mapToApiFormat(ventaData);
      console.log('📤 VentaService [POST]: /Ventas - Payload:', mapped);
      console.log('🔍 ClienteId enviado a la API:', mapped.ClienteId);

      const response = await this.request('/Ventas', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Venta creada:', data);
      return await this.normalizeVentaData(data);
    } catch (error: any) {
      console.error('❌ Error creando venta:', error);
      throw error;
    }
  }

  async updateVenta(id: number, ventaData: Partial<Venta>): Promise<Venta> {
    try {
      const mapped = this.mapToApiFormat({ ...ventaData, id });
      console.log(`📤 Actualizando venta ${id}:`, mapped);
      const response = await this.request(`/Ventas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Venta ${id} actualizada:`, data);
      return await this.normalizeVentaData(data);
    } catch (error: any) {
      console.error(`❌ Error actualizando venta ${id}:`, error);
      throw error;
    }
  }

  async updateVentaStatus(id: number, estado: string): Promise<void> {
    try {
      console.log(`📤 Actualizando estado de venta ${id} a ${estado}...`);
      await this.request(`/Ventas/${id}/estado`, {
        method: 'POST',
        body: JSON.stringify({ estado }),
      });
      console.log(`✅ Estado de venta ${id} actualizado`);
    } catch (error: any) {
      console.error(`❌ Error actualizando estado de venta ${id}:`, error);
      throw error;
    }
  }

  async deleteVenta(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando venta ${id}...`);
      await this.request(`/Ventas/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Venta ${id} eliminada`);
    } catch (error: any) {
      console.error(`❌ Error eliminando venta ${id}:`, error);
      throw error;
    }
  }

  async getVentasByBarbero(barbero: string): Promise<Venta[]> {
    try {
      console.log(`📥 Obteniendo ventas del barbero ${barbero}...`);
      const ventas = await this.getVentas();
      const filtered = ventas.filter(v => v.barbero === barbero);
      console.log(`✅ Ventas del barbero ${barbero}:`, filtered);
      return filtered;
    } catch (error: any) {
      console.error(`❌ Error obteniendo ventas del barbero ${barbero}:`, error);
      throw error;
    }
  }

  async getVentasByFecha(fechaInicio: string, fechaFin: string): Promise<Venta[]> {
    try {
      console.log(`📥 Obteniendo ventas entre ${fechaInicio} y ${fechaFin}...`);
      const ventas = await this.getVentas();
      const filtered = ventas.filter(v => {
        const ventaFecha = new Date(v.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return ventaFecha >= inicio && ventaFecha <= fin;
      });
      console.log(`✅ Ventas filtradas por fecha:`, filtered);
      return filtered;
    } catch (error: any) {
      console.error(`❌ Error obteniendo ventas por fecha:`, error);
      throw error;
    }
  }
}

export const ventaService = new VentaService();
export default ventaService;