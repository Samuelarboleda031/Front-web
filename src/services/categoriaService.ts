export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  productos: any[];
}

export interface CategoriaCreateRequest {
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export interface CategoriaUpdateRequest {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

class CategoriaService {
  private readonly API_BASE_URL = 'http://edwisbarber.somee.com/api';

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const isGet = !options.method || options.method === 'GET';
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = isGet ? `${this.API_BASE_URL}${endpoint}${separator}t=${Date.now()}` : `${this.API_BASE_URL}${endpoint}`;

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
      console.log(`API [${config.method || 'GET'}]: ${url}`);
      if (config.body) {
        console.log(`📤 Request Body:`, config.body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error [${response.status}]: ${errorText}`);
        throw new Error(`Error del servidor (${response.status}): ${errorText || response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('Network/API Error:', error);
      throw error;
    }
  }

  async getCategorias(): Promise<Categoria[]> {
    try {
      console.log('📥 Obteniendo categorías desde:', `${this.API_BASE_URL}/categorias`);
      const response = await this.request('/categorias');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Categorías obtenidas:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('❌ Error obteniendo categorías:', error);
      throw error;
    }
  }

  async getCategoriaById(id: number): Promise<Categoria | null> {
    try {
      console.log(`📥 Obteniendo categoría ${id}...`);
      const response = await this.request(`/categorias/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Categoría ${id} obtenida:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ Error obteniendo categoría ${id}:`, error);
      throw error;
    }
  }

  async createCategoria(categoriaData: CategoriaCreateRequest): Promise<Categoria> {
    try {
      const mapped = {
        Nombre: categoriaData.nombre,
        Descripcion: categoriaData.descripcion || null,
        Estado: categoriaData.estado
      };
      console.log('📤 Creando categoría:', mapped);
      const response = await this.request('/categorias', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Categoría creada:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error creando categoría:', error);
      throw error;
    }
  }

  async updateCategoria(id: number, categoriaData: CategoriaUpdateRequest): Promise<Categoria> {
    try {
      const mapped = {
        Id: id,
        Nombre: categoriaData.nombre,
        Descripcion: categoriaData.descripcion || null,
        Estado: categoriaData.estado
      };
      console.log(`📤 Actualizando categoría ${id}:`, mapped);
      const response = await this.request(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Categoría ${id} actualizada:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ Error actualizando categoría ${id}:`, error);
      throw error;
    }
  }

  async updateCategoriaStatus(id: number, estado: boolean): Promise<void> {
    try {
      // Primero obtener la categoría actual para conservar los demás datos
      const categoriaActual = await this.getCategoriaById(id);
      if (!categoriaActual) {
        throw new Error('Categoría no encontrada');
      }

      const mapped = {
        Id: id,
        Nombre: categoriaActual.nombre,
        Estado: estado
      };
      console.log(`📤 Actualizando estado de categoría ${id} a ${estado}:`, mapped);
      await this.request(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      console.log(`✅ Estado de categoría ${id} actualizado a ${estado}`);
    } catch (error: any) {
      console.error(`❌ Error actualizando estado de categoría ${id}:`, error);
      throw error;
    }
  }

  async deleteCategoria(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando categoría ${id}...`);
      await this.request(`/categorias/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Categoría ${id} eliminada`);
    } catch (error: any) {
      console.error(`❌ Error eliminando categoría ${id}:`, error);
      throw error;
    }
  }
}

export const categoriaService = new CategoriaService();
