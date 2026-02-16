const API_BASE_URL = '/api';

export interface Barbero {
  id: number;
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
  barrio: string;
  fechaNacimiento: string;
  rol: string;
  status: 'active' | 'inactive';
  fotoPerfil: string;
  especialidad?: string;
  // campos adicionales para compatibilidad
  nombres?: string;
  apellidos?: string;
  celular?: string;
  imagenUrl?: string;
  avatar?: string;
}

export interface CreateBarberoData {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
  barrio: string;
  fechaNacimiento: string;
  rol: string;
  status: string;
  fotoPerfil: string;
  especialidad?: string;
}

export interface UpdateBarberoData extends CreateBarberoData {
  id: number;
}

// Interface que refleja la respuesta de la API
interface BarberoApi {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  documento: string;
  correo: string;
  telefono: string;
  direccion: string;
  barrio: string;
  fechaNacimiento?: string;
  rol: string;
  estado: boolean;
  imagenUrl: string;
  especialidad: string;
}

class BarberosService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    };

    try {
      console.log(`Barberos API [${config.method || 'GET'}]: ${url}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  mapApiToComponent(api: BarberoApi): Barbero {
    return {
      id: api.id,
      nombre: api.nombres,
      nombres: api.nombres,
      apellido: api.apellidos,
      apellidos: api.apellidos,
      tipoDocumento: api.tipoDocumento,
      documento: api.documento,
      correo: api.correo,
      telefono: api.telefono,
      celular: api.telefono,
      direccion: api.direccion,
      barrio: api.barrio,
      fechaNacimiento: (api.fechaNacimiento?.split('T')[0]) ?? '',
      rol: api.rol,
      status: api.estado ? 'active' : 'inactive',
      fotoPerfil: api.imagenUrl,
      imagenUrl: api.imagenUrl,
      especialidad: api.especialidad
    };
  }

  mapComponentToApi(local: CreateBarberoData | UpdateBarberoData): any {
    return {
      ...('id' in local ? { Id: local.id } : {}),
      Nombres: local.nombre,
      Apellidos: local.apellido,
      TipoDocumento: local.tipoDocumento,
      Documento: local.documento,
      Correo: local.correo,
      Telefono: local.telefono,
      Direccion: local.direccion,
      Barrio: local.barrio,
      FechaNacimiento: local.fechaNacimiento ? new Date(local.fechaNacimiento).toISOString() : null,
      Rol: local.rol,
      Estado: local.status === 'active',
      ImagenUrl: local.fotoPerfil,
      Especialidad: local.especialidad
    };
  }

  async getBarberos(): Promise<BarberoApi[]> {
    const response = await this.request('/Barberos');
    const data = await response.json();
    return data;
  }

  async createBarbero(data: any): Promise<BarberoApi> {
    // Mapear datos a PascalCase para la API
    const mappedData = {
      UsuarioId: data.usuarioId,
      Nombre: data.nombre,
      Apellido: data.apellido,
      Documento: data.documento,
      Correo: data.correo,
      Telefono: data.telefono,
      Especialidad: data.especialidad || 'General',
      Estado: data.estado !== undefined ? data.estado : true,
      FotoPerfil: data.fotoPerfil ?? ''
    };

    console.log('🔵 Creando barbero - Datos originales:', data);
    console.log('🔵 Creando barbero - Datos mapeados (enviados):', mappedData);

    const response = await this.request('/Barberos', {
      method: 'POST',
      body: JSON.stringify(mappedData)
    });
    return await response.json();
  }

  async updateBarbero(id: number, data: any): Promise<BarberoApi> {
    const response = await this.request(`/Barberos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return await response.json();
  }

  async deleteBarbero(id: number): Promise<void> {
    await this.request(`/Barberos/${id}`, {
      method: 'DELETE'
    });
  }

  async updateBarberoStatus(id: number, estado: boolean): Promise<void> {
    await this.request(`/Barberos/${id}/estado`, {
      method: 'POST', // Changed from PUT to POST as per recent history
      body: JSON.stringify({ estado })
    });
  }
}

export const barberosService = new BarberosService();
