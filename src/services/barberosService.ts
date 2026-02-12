/**
 * Servicio para gestión de Barberos
 * API: http://edwisbarber.somee.com/api/Barberos
 */

export interface Barbero {
  id: number;
  usuarioId?: number;
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  telefono: string;
  especialidad?: string;
  fotoPerfil?: string;
  estado: boolean;
  agendamientos?: any[];
  entregasInsumos?: any[];
  horarios?: any[];
  venta?: any[];
  usuario?: {
    id: number;
    nombre: string;
    correo: string;
    rol?: string;
  };
  // Campos compatibles con el componente actual
  nombres?: string; // Para compatibilidad, mapeado desde nombre
  apellidos?: string; // Para compatibilidad, mapeado desde apellido
  tipoDocumento?: string; // Para compatibilidad
  celular?: string; // Para compatibilidad, mapeado desde telefono
  direccion?: string;
  barrio?: string;
  fechaNacimiento?: string;
  password?: string;
  rol?: string;
  status?: 'active' | 'inactive'; // Para compatibilidad, mapeado desde estado
  imagenUrl?: string; // Para compatibilidad, mapeado desde fotoPerfil
  fechaCreacion?: string;
  avatar?: string;
}

export interface CreateBarberoData {
  usuarioId?: number;
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  telefono: string;
  especialidad?: string;
  fotoPerfil?: string;
  estado?: boolean;
  // Campos compatibles con el componente actual
  nombres?: string; // Para compatibilidad, se mapeará a nombre
  apellidos?: string; // Para compatibilidad, se mapeará a apellido
  tipoDocumento?: string;
  celular?: string; // Para compatibilidad, se mapeará a telefono
  direccion?: string;
  barrio?: string;
  fechaNacimiento?: string;
  password?: string;
  rol?: string;
  status?: 'active' | 'inactive'; // Para compatibilidad, se mapeará a estado
  imagenUrl?: string; // Para compatibilidad, se mapeará a fotoPerfil
}

export interface UpdateBarberoData {
  id: number;
  usuarioId?: number;
  nombre?: string;
  apellido?: string;
  documento?: string;
  correo?: string;
  telefono?: string;
  especialidad?: string;
  fotoPerfil?: string;
  estado?: boolean;
  // Campos compatibles con el componente actual
  nombres?: string; // Para compatibilidad, se mapeará a nombre
  apellidos?: string; // Para compatibilidad, se mapeará a apellido
  tipoDocumento?: string;
  celular?: string; // Para compatibilidad, se mapeará a telefono
  direccion?: string;
  barrio?: string;
  fechaNacimiento?: string;
  password?: string;
  rol?: string;
  status?: 'active' | 'inactive'; // Para compatibilidad, se mapeará a estado
  imagenUrl?: string; // Para compatibilidad, se mapeará a fotoPerfil
}

const API_BASE_URL = 'http://edwisbarber.somee.com/api';

class BarberosService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔄 Barberos API [${options.method || 'GET'}]: ${url}`);
    if (options.body) {
      console.log(`📤 Request Body:`, options.body);
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        console.error('❌ Respuesta de error del servidor:', errorText);
        errorMessage += ` - ${errorText}`;
      } catch (e) {
        console.error('❌ No se pudo leer el error del servidor');
      }
      throw new Error(errorMessage);
    }

    return response;
  }

  // Obtener todos los barberos
  async getBarberos(): Promise<Barbero[]> {
    try {
      console.log('📋 Obteniendo barberos...');
      const response = await this.request('/Barberos');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      
      console.log('✅ Barberos obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo barberos:', error);
      throw error;
    }
  }

  // Obtener un barbero por ID
  async getBarberoById(id: number): Promise<Barbero | null> {
    try {
      console.log(`🔍 Obteniendo barbero ${id}...`);
      const response = await this.request(`/Barberos/${id}`);
      const text = await response.text();
      
      if (!text) return null;
      
      const data = JSON.parse(text);
      console.log(`✅ Barbero ${id} obtenido:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error obteniendo barbero ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo barbero
  async createBarbero(barberoData: CreateBarberoData): Promise<Barbero> {
    try {
      console.log('➕ Creando nuevo barbero:', barberoData);
      
      const response = await this.request('/Barberos', {
        method: 'POST',
        body: JSON.stringify(barberoData),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : barberoData;
      
      console.log('✅ Barbero creado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creando barbero:', error);
      throw error;
    }
  }

  // Actualizar un barbero existente
  async updateBarbero(id: number, updateData: UpdateBarberoData): Promise<Barbero> {
    try {
      console.log(`🔄 Actualizando barbero ${id}:`, updateData);
      console.log(`🔄 Estado en updateData:`, updateData.estado);
      console.log(`🔄 Status en updateData:`, updateData.status);
      
      const response = await this.request(`/Barberos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const text = await response.text();
      console.log(`🔄 Respuesta cruda de API para barbero ${id}:`, text);
      
      const data = text ? JSON.parse(text) : { ...updateData, id };
      console.log(`✅ Barbero ${id} actualizado (parseado):`, data);
      console.log(`✅ Estado en respuesta:`, data.estado);
      console.log(`✅ Status en respuesta:`, data.status);
      
      return data;
    } catch (error) {
      console.error(`❌ Error actualizando barbero ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un barbero
  async deleteBarbero(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando barbero ${id}...`);
      
      await this.request(`/Barberos/${id}`, {
        method: 'DELETE',
      });
      
      console.log(`✅ Barbero ${id} eliminado exitosamente`);
    } catch (error) {
      console.error(`❌ Error eliminando barbero ${id}:`, error);
      throw error;
    }
  }

  // Mapear datos de la API al formato del componente
  mapApiToComponent(apiData: any): Barbero {
    return {
      // Nuevos campos de la API
      id: apiData.id || 0,
      usuarioId: apiData.usuarioId,
      nombre: apiData.nombre || '',
      apellido: apiData.apellido || '',
      documento: apiData.documento || '',
      correo: apiData.correo || '',
      telefono: apiData.telefono || '',
      especialidad: apiData.especialidad || '',
      fotoPerfil: apiData.fotoPerfil || '',
      estado: apiData.estado !== undefined ? apiData.estado : true,
      agendamientos: apiData.agendamientos || [],
      entregasInsumos: apiData.entregasInsumos || [],
      horarios: apiData.horarios || [],
      venta: apiData.venta || [],
      usuario: apiData.usuario || undefined,
      
      // Campos de compatibilidad con el componente actual
      nombres: apiData.nombre || apiData.nombres || '',
      apellidos: apiData.apellido || apiData.apellidos || '',
      tipoDocumento: apiData.tipoDocumento || 'Cédula',
      celular: apiData.telefono || apiData.celular || '',
      direccion: apiData.direccion || '',
      barrio: apiData.barrio || '',
      fechaNacimiento: apiData.fechaNacimiento || '',
      password: apiData.password || '',
      rol: apiData.rol || 'Barbero',
      status: apiData.estado === true || apiData.status === 'active' ? 'active' : 'inactive',
      imagenUrl: apiData.fotoPerfil || apiData.imagenUrl || '',
      fechaCreacion: apiData.fechaCreacion || new Date().toLocaleDateString('es-ES'),
      avatar: `${(apiData.nombre || apiData.nombres || '').split(' ')[0]?.[0] || ''}${(apiData.apellido || apiData.apellidos || '').split(' ')[0]?.[0] || ''}`.toUpperCase()
    };
  }

  // Mapear datos del componente al formato de la API
  mapComponentToApi(componentData: Partial<Barbero>): any {
    return {
      // Nuevos campos para la API
      id: componentData.id,
      usuarioId: componentData.usuarioId,
      nombre: componentData.nombre || componentData.nombres,
      apellido: componentData.apellido || componentData.apellidos,
      documento: componentData.documento,
      correo: componentData.correo,
      telefono: componentData.telefono || componentData.celular,
      especialidad: componentData.especialidad,
      fotoPerfil: componentData.fotoPerfil || componentData.imagenUrl,
      estado: componentData.estado !== undefined ? componentData.estado : (componentData.status === 'active' ? true : false),
      agendamientos: componentData.agendamientos,
      entregasInsumos: componentData.entregasInsumos,
      horarios: componentData.horarios,
      venta: componentData.venta,
      usuario: componentData.usuario,
      
      // Campos de compatibilidad (se mantienen por si la API los espera)
      tipoDocumento: componentData.tipoDocumento,
      direccion: componentData.direccion,
      barrio: componentData.barrio,
      fechaNacimiento: componentData.fechaNacimiento,
      password: componentData.password,
      rol: componentData.rol
    };
  }
}

export const barberosService = new BarberosService();
