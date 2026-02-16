const API_BASE_URL = '/api';

export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  duracion?: number;
}

class ServicioService {
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
      console.log(`ServicioService [${config.method || 'GET'}]: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ServicioService Error [${response.status}]: ${errorText}`);
        throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('ServicioService Network/API Error:', error);
      throw error;
    }
  }

  async getServicios(): Promise<Servicio[]> {
    try {
      console.log('📥 Obteniendo servicios desde:', `${API_BASE_URL}/servicios`);
      const response = await this.request('/servicios');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Servicios obtenidos:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('❌ Error obteniendo servicios:', error);
      throw error;
    }
  }
}

export const servicioService = new ServicioService();
export default servicioService;
