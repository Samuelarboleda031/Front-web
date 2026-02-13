const API_BASE_URL = 'http://edwisbarber.somee.com/api';

export interface Proveedor {
  id?: number;
  nombre: string;
  nit?: string;
  correo?: string;
  telefono?: string | null;
  direccion?: string;
  estado?: boolean;
  tipoProveedor?: 'Juridico' | 'Natural';
  // Campos específicos para Jurídico
  razonSocial?: string;
  representanteLegal?: string;
  numeroIdentificacionRepLegal?: string;
  cargoRepLegal?: string;
  ciudad?: string;
  departamento?: string;
  // Campos adicionales que devuelve la API
  contacto?: string | null;
  numeroIdentificacion?: string | null;
  tipoIdentificacion?: string | null;
  compras?: any[];
  // Campos adicionales del frontend
  numero?: string; // Alias para telefono
  activo?: boolean; // Alias para estado
  fechaCreacion?: string;
  // Campos específicos para Jurídico adicionales
  documentoRepresentante?: string;
  telefonoRepresentante?: string;
  correoRepresentante?: string;
  sectorEconomico?: string;
  anosOperacion?: number;
  paginaWeb?: string;
  // Campo específico para Natural
  personaContacto?: string;
  apellidos?: string;
}

class ProveedorService {
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
      console.log(`Proveedor API [${config.method || 'GET'}]: ${url}`);
      if (config.body) {
        console.log(`📤 Proveedor Request Body:`, config.body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Proveedor API Error [${response.status}]: ${errorText}`);
        throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('Proveedor Network/API Error:', error);
      throw error;
    }
  }

  // Mapeo específico para proveedores Jurídicos desde API
  private mapFromApiToJuridico(apiData: any): Proveedor {
    return {
      id: apiData.id,
      nombre: apiData.nombre,
      nit: apiData.nit,
      correo: apiData.correo,
      telefono: apiData.telefono,
      direccion: apiData.direccion,
      estado: apiData.estado,
      tipoProveedor: 'Juridico' as const,
      razonSocial: apiData.razonSocial,
      representanteLegal: apiData.representanteLegal,
      numeroIdentificacionRepLegal: apiData.numeroIdentificacionRepLegal,
      cargoRepLegal: apiData.cargoRepLegal,
      ciudad: apiData.ciudad,
      departamento: apiData.departamento,
      contacto: apiData.contacto,
      numeroIdentificacion: apiData.numeroIdentificacion,
      tipoIdentificacion: apiData.tipoIdentificacion,
      compras: apiData.compras || [],
      // Alias para compatibilidad
      numero: apiData.telefono,
      activo: apiData.estado,
      fechaCreacion: new Date().toLocaleDateString('es-CO')
    };
  }

  // Mapeo específico para proveedores Naturales
  private mapNatural(data: Partial<Proveedor>) {
    return {
      nombre: data.nombre,
      numeroIdentificacion: data.numeroIdentificacion || "",
      correo: data.correo || "",
      telefono: data.telefono || data.numero || "",
      direccion: data.direccion || "",
      ciudad: data.ciudad || "",
      departamento: data.departamento || ""
    };
  }

  // Mapear objeto a PascalCase para las peticiones (POST/PUT) - LEGACY para PUT
  private mapToApiFormat(data: Partial<Proveedor>): any {
    const mapped: any = {};

    if (data.id !== undefined) mapped.Id = data.id;
    if (data.nombre !== undefined) mapped.Nombre = data.nombre;
    if (data.tipoProveedor !== undefined) mapped.TipoProveedor = data.tipoProveedor;
    if (data.nit !== undefined) mapped.Nit = data.nit;
    if (data.correo !== undefined) mapped.Correo = data.correo;
    if (data.numero !== undefined) mapped.Numero = data.numero;
    if (data.telefono !== undefined) mapped.Telefono = data.telefono;
    if (data.contacto !== undefined) mapped.Contacto = data.contacto;
    if (data.direccion !== undefined) mapped.Direccion = data.direccion;
    if (data.fechaCreacion !== undefined) mapped.FechaCreacion = new Date().toISOString();
    // Priorizar estado sobre activo para la API
    if (data.estado !== undefined) mapped.Estado = !!data.estado;
    else if (data.activo !== undefined) mapped.Estado = !!data.activo;
    
    // Campos específicos para Jurídico (según tu API)
    if (data.razonSocial !== undefined) mapped.RazonSocial = data.razonSocial;
    if (data.representanteLegal !== undefined) mapped.RepresentanteLegal = data.representanteLegal;
    if (data.numeroIdentificacionRepLegal !== undefined) mapped.NumeroIdentificacionRepLegal = data.numeroIdentificacionRepLegal;
    if (data.cargoRepLegal !== undefined) mapped.CargoRepLegal = data.cargoRepLegal;
    if (data.ciudad !== undefined) mapped.Ciudad = data.ciudad;
    if (data.departamento !== undefined) mapped.Departamento = data.departamento;
    
    // Campos adicionales que tu API podría necesitar
    if (data.documentoRepresentante !== undefined) mapped.DocumentoRepresentante = data.documentoRepresentante;
    if (data.telefonoRepresentante !== undefined) mapped.TelefonoRepresentante = data.telefonoRepresentante;
    if (data.correoRepresentante !== undefined) mapped.CorreoRepresentante = data.correoRepresentante;
    if (data.sectorEconomico !== undefined) mapped.SectorEconomico = data.sectorEconomico;
    if (data.anosOperacion !== undefined) mapped.AnosOperacion = data.anosOperacion;
    if (data.paginaWeb !== undefined) mapped.PaginaWeb = data.paginaWeb;
    if (data.personaContacto !== undefined) mapped.PersonaContacto = data.personaContacto;
    if (data.apellidos !== undefined) mapped.Apellidos = data.apellidos;
    if (data.numeroIdentificacion !== undefined) mapped.NumeroIdentificacion = data.numeroIdentificacion;

    return mapped;
  }

  async obtenerProveedoresJuridicos(): Promise<Proveedor[]> {
    try {
      console.log('📥 Obteniendo proveedores jurídicos desde:', `${API_BASE_URL}/Proveedores/juridicos`);
      const response = await this.request('/Proveedores/juridicos');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Proveedores jurídicos obtenidos:', data);
      
      // Mapear los datos de la API al formato del frontend
      return Array.isArray(data) ? data.map(item => this.mapFromApiToJuridico(item)) : [];
    } catch (error) {
      console.error('❌ Error obteniendo proveedores jurídicos:', error);
      throw error;
    }
  }

  async obtenerProveedorPorId(id: number): Promise<Proveedor | null> {
    try {
      console.log(`📥 Obteniendo proveedor ${id} desde:`, `${API_BASE_URL}/proveedores/${id}`);
      const response = await this.request(`/proveedores/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Proveedor ${id} obtenido:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error obteniendo proveedor ${id}:`, error);
      return null;
    }
  }

  async crearProveedor(proveedorData: Partial<Proveedor>): Promise<Proveedor> {
    try {
      // Usar el mapeo específico según el tipo de proveedor
      const apiBody = proveedorData.tipoProveedor === 'Natural'
        ? this.mapNatural(proveedorData)
        : this.mapFromApiToJuridico(proveedorData);
      
      console.log('🔵 Creando proveedor - Datos originales:', proveedorData);
      console.log('🔵 Creando proveedor - Tipo:', proveedorData.tipoProveedor);
      console.log('🔵 Creando proveedor - Datos mapeados (enviados):', apiBody);

      // Determinar el endpoint correcto según el tipo de proveedor
      const endpoint = proveedorData.tipoProveedor === 'Natural' 
        ? '/PRoveedores/naturales'  // Plural según API
        : '/Proveedores/juridicos'; // Plural según API real

      console.log(`🎯 Usando endpoint: ${endpoint} para tipo ${proveedorData.tipoProveedor}`);

      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(apiBody),
      });

      const text = await response.text();
      if (!text) return { ...proveedorData, id: 0 } as Proveedor;

      const result = JSON.parse(text);
      console.log('✅ Proveedor creado exitosamente:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error creando proveedor:', error);
      console.error('❌ Datos que causaron el error:', proveedorData);
      throw error;
    }
  }

  async actualizarProveedor(id: number, proveedorData: Partial<Proveedor>): Promise<Proveedor> {
    try {
      const apiBody = this.mapToApiFormat(proveedorData);
      apiBody.Id = id;

      const response = await this.request(`/proveedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiBody),
      });

      const text = await response.text();
      if (!text) return { ...proveedorData, id } as Proveedor;

      return JSON.parse(text);
    } catch (error) {
      console.error('Error actualizando proveedor:', error);
      throw error;
    }
  }

  async eliminarProveedor(id: number): Promise<void> {
    try {
      console.log(`🗑️ Intentando eliminar proveedor con ID: ${id}`);
      await this.request(`/proveedores/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Proveedor eliminado exitosamente`);
    } catch (error: any) {
      console.error('❌ Error eliminando proveedor:', error);
      throw error;
    }
  }

  async cambiarEstadoProveedor(id: number, estado: boolean): Promise<void> {
    try {
      console.log(`🔄 Cambiando estado del proveedor ${id} a ${estado}`);
      
      // Primero obtener el proveedor actual para mantener todos los datos requeridos
      const proveedorActual = await this.obtenerProveedorPorId(id);
      if (!proveedorActual) {
        throw new Error('Proveedor no encontrado');
      }

      // Actualizar solo el estado pero manteniendo todos los demás datos requeridos
      const apiBody = this.mapToApiFormat({
        ...proveedorActual,
        estado: estado
      });

      await this.request(`/proveedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiBody),
      });

      console.log(`✅ Estado del proveedor ${id} actualizado a ${estado}`);
    } catch (error) {
      console.error('❌ Error actualizando estado del proveedor:', error);
      throw error;
    }
  }
}

export const proveedorService = new ProveedorService();
