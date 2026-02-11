const API_BASE_URL = '/api';

export interface ApiUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rolId: number | null;
  tipoDocumento: string | null;
  documento: string | null;
  telefono: string | null;
  direccion: string | null;
  barrio: string | null;
  fechaNacimiento: string | null;
  fotoPerfil: string | null;
  estado: boolean;
  rol?: {
    id: number;
    nombre: string;
    descripcion: string;
    estado: boolean;
  };
}

export interface UserRole {
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

class ApiService {
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

  // Mapear objeto a PascalCase para las peticiones (POST/PUT)
  private mapToApiFormat(data: any): any {
    if (!data) return data;

    // Lista de campos que sabemos que la API espera en el modelo de Usuario
    // Según errores de validación y estructura de la tabla
    const mapped: any = {};

    if (data.id !== undefined) mapped.Id = data.id;
    if (data.nombre !== undefined) mapped.Nombre = data.nombre;
    if (data.apellido !== undefined) mapped.Apellido = data.apellido;
    if (data.correo !== undefined) mapped.Correo = data.correo;
    if (data.contrasena !== undefined) mapped.Contrasena = data.contrasena;
    if (data.rolId !== undefined) mapped.RolId = data.rolId === null ? null : Number(data.rolId);
    if (data.tipoDocumento !== undefined) mapped.TipoDocumento = data.tipoDocumento;
    if (data.documento !== undefined) mapped.Documento = data.documento;
    if (data.telefono !== undefined) mapped.Telefono = data.telefono;
    if (data.direccion !== undefined) mapped.Direccion = data.direccion;
    if (data.barrio !== undefined) mapped.Barrio = data.barrio;
    if (data.fechaNacimiento !== undefined) mapped.FechaNacimiento = data.fechaNacimiento;
    if (data.fotoPerfil !== undefined) mapped.FotoPerfil = data.fotoPerfil;
    if (data.estado !== undefined) mapped.Estado = !!data.estado;

    return mapped;
  }

  async getUsuarios(): Promise<ApiUser[]> {
    try {
      console.log('Fetching usuarios from:', `${API_BASE_URL}/usuarios`);
      const response = await this.request('/usuarios');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];

      console.log('API Raw Data Type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('API Data Length:', data.length);

      // Si la API devuelve una lista de roles con usuarios anidados, aplanarla
      // Verificamos si el primer elemento tiene una propiedad de usuarios
      if (Array.isArray(data) && data.length > 0 && ('usuarios' in data[0] || 'Usuarios' in data[0])) {
        console.log('Sincronización: Aplanando estructura de roles...');
        const flatUsers = data.flatMap((item: any) => (item.usuarios || item.Usuarios || []))
          .filter((u: any) => u !== null && typeof u === 'object' && 'id' in u);
        console.log('Sincronización: Usuarios aplanados:', flatUsers.length);
        return flatUsers;
      }

      return data;
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      throw error;
    }
  }

  async getUsuarioById(id: number): Promise<ApiUser | null> {
    try {
      const response = await this.request(`/usuarios/${id}`);
      const text = await response.text();
      if (!text) return null;

      const data = JSON.parse(text);

      // Manejar respuesta si viene envuelta en un array o tiene estructura anidada
      if (Array.isArray(data)) return data[0] || null;

      return data;
    } catch (error) {
      console.error('Error fetching usuario by ID:', error);
      return null;
    }
  }

  async createUsuario(userData: Partial<ApiUser>): Promise<ApiUser> {
    try {
      const apiBody = this.mapToApiFormat(userData);
      console.log('🔵 Creando usuario - Datos originales:', userData);
      console.log('🔵 Creando usuario - Datos mapeados (enviados):', apiBody);

      const response = await this.request('/usuarios', {
        method: 'POST',
        body: JSON.stringify(apiBody),
      });

      // Si la respuesta está vacía, retornar un objeto basado en lo enviado
      const text = await response.text();
      if (!text) return { ...userData, id: 0 } as ApiUser;

      const result = JSON.parse(text);
      console.log('✅ Usuario creado exitosamente:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error creating usuario:', error);
      console.error('❌ Datos que causaron el error:', userData);
      throw error;
    }
  }

  async updateUsuario(id: number, userData: Partial<ApiUser>): Promise<ApiUser> {
    try {
      const apiBody = this.mapToApiFormat(userData);
      apiBody.Id = id;

      const response = await this.request(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiBody),
      });

      // Manejar respuestas vacías (204 No Content o similar)
      const text = await response.text();
      if (!text) return { ...userData, id } as ApiUser;

      return JSON.parse(text);
    } catch (error) {
      console.error('Error updating usuario:', error);
      throw error;
    }
  }

  async deleteUsuario(id: number): Promise<void> {
    try {
      console.log(`🗑️ Intentando eliminar usuario con ID: ${id}`);
      const response = await this.request(`/usuarios/${id}`, {
        method: 'DELETE',
      });

      const text = await response.text();
      console.log(`✅ Usuario eliminado - Respuesta del servidor:`, text || '(sin contenido)');

      if (text) {
        try {
          const data = JSON.parse(text);
          console.log(`📊 Datos de respuesta parseados:`, data);
        } catch (e) {
          console.log(`📝 Respuesta en texto plano:`, text);
        }
      }
    } catch (error: any) {
      console.error('❌ Error deleting usuario:', error);
      console.error('❌ Detalles del error:', error.message);
      throw error;
    }
  }

  async authenticateUser(correo: string, contrasena: string): Promise<ApiUser | null> {
    try {
      const usuarios = await this.getUsuarios();
      const user = usuarios.find(u => u.correo === correo);
      
      if (!user) {
        console.log('Usuario no encontrado:', correo);
        return null;
      }

      // Para demostración, permitir contraseñas comunes
      const validPasswords = ['admin123', 'cliente123', 'cajero123', 'super123', 'invitado123'];
      if (validPasswords.includes(contrasena)) {
        console.log('Autenticación exitosa (demo):', user.correo);
        return user;
      }

      // Comparación normal de contraseñas
      if (user.contrasena === contrasena) {
        console.log('Autenticación exitosa:', user.correo);
        return user;
      }

      // Si la contraseña está hasheada, permitir contraseñas comunes para demostración
      if (user.contrasena.startsWith('hash')) {
        if (validPasswords.includes(contrasena)) {
          return user;
        }
      }

      console.log('Contraseña incorrecta para:', correo);
      return null;
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS PARA ROLES ====================
  async getRoles(): Promise<any[]> {
    try {
      console.log('📥 Obteniendo roles desde:', `${API_BASE_URL}/Roles`);
      const response = await this.request('/Roles');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Roles obtenidos:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('❌ Error obteniendo roles:', error);
      throw error;
    }
  }

  async getRoleById(id: number): Promise<any> {
    try {
      console.log(`📥 Obteniendo rol ${id} desde:`, `${API_BASE_URL}/Roles/${id}`);
      const response = await this.request(`/Roles/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Rol ${id} obtenido:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ Error obteniendo rol ${id}:`, error);
      throw error;
    }
  }

  async createRole(roleData: any): Promise<any> {
    try {
      const mapped = this.mapToApiFormat({ ...roleData, Nombre: roleData.nombre, Descripcion: roleData.descripcion });
      console.log('📤 Creando rol:', mapped);
      const response = await this.request('/Roles', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Rol creado:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error creando rol:', error);
      throw error;
    }
  }

  async updateRole(id: number, roleData: any): Promise<any> {
    try {
      const mapped = this.mapToApiFormat({ ...roleData, id });
      console.log(`📤 Actualizando rol ${id}:`, mapped);
      const response = await this.request(`/Roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Rol ${id} actualizado:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ Error actualizando rol ${id}:`, error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando rol ${id}...`);
      await this.request(`/Roles/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Rol ${id} eliminado`);
    } catch (error: any) {
      console.error(`❌ Error eliminando rol ${id}:`, error);
      throw error;
    }
  }

  // ==================== MÉTODOS PARA MÓDULOS ====================
  async getModulos(): Promise<any[]> {
    try {
      console.log('📥 Obteniendo módulos desde:', `${API_BASE_URL}/Modulos`);
      const response = await this.request('/Modulos');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Módulos obtenidos:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('❌ Error obteniendo módulos:', error);
      throw error;
    }
  }

  async getModuloById(id: number): Promise<any> {
    try {
      console.log(`📥 Obteniendo módulo ${id}...`);
      const response = await this.request(`/Modulos/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Módulo ${id} obtenido:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ Error obteniendo módulo ${id}:`, error);
      throw error;
    }
  }

  async createModulo(moduloData: any): Promise<any> {
    try {
      const mapped = this.mapToApiFormat(moduloData);
      console.log('📤 Creando módulo:', mapped);
      const response = await this.request('/Modulos', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Módulo creado:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error creando módulo:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS PARA ROLES-MÓDULOS ====================
  async getRolesModulos(): Promise<any[]> {
    try {
      console.log('📥 Obteniendo asignaciones rol-módulo desde:', `${API_BASE_URL}/RolesModulos`);
      const response = await this.request('/RolesModulos');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Asignaciones rol-módulo obtenidas:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('❌ Error obteniendo asignaciones rol-módulo:', error);
      throw error;
    }
  }

  async getRolesModulosByRolId(rolId: number): Promise<any[]> {
    try {
      console.log(`📥 Obteniendo módulos del rol ${rolId}...`);
      const rolesModulos = await this.getRolesModulos();
      const filtered = rolesModulos.filter((rm: any) => rm.rolId === rolId);
      console.log(`✅ Módulos del rol ${rolId}:`, filtered);
      return filtered;
    } catch (error: any) {
      console.error(`❌ Error obteniendo módulos del rol ${rolId}:`, error);
      throw error;
    }
  }

  async createRolModulo(rolModuloData: any): Promise<any> {
    try {
      const mapped = {
        RolId: rolModuloData.rolId || rolModuloData.RolId,
        ModuloId: rolModuloData.moduloId || rolModuloData.ModuloId,
        PuedeVer: !!rolModuloData.puedeVer || !!rolModuloData.PuedeVer || true,
        PuedeCrear: !!rolModuloData.puedeCrear || !!rolModuloData.PuedeCrear || false,
        PuedeEditar: !!rolModuloData.puedeEditar || !!rolModuloData.PuedeEditar || false,
        PuedeEliminar: !!rolModuloData.puedeEliminar || !!rolModuloData.PuedeEliminar || false,
      };
      console.log('📤 Asignando módulo a rol:', mapped);
      const response = await this.request('/RolesModulos', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Módulo asignado al rol:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Error asignando módulo a rol:', error);
      throw error;
    }
  }

  async updateRolModulo(id: number, rolModuloData: any): Promise<any> {
    try {
      const mapped = {
        Id: id,
        RolId: rolModuloData.rolId || rolModuloData.RolId,
        ModuloId: rolModuloData.moduloId || rolModuloData.ModuloId,
        PuedeVer: !!rolModuloData.puedeVer || !!rolModuloData.PuedeVer,
        PuedeCrear: !!rolModuloData.puedeCrear || !!rolModuloData.PuedeCrear,
        PuedeEditar: !!rolModuloData.puedeEditar || !!rolModuloData.PuedeEditar,
        PuedeEliminar: !!rolModuloData.puedeEliminar || !!rolModuloData.PuedeEliminar,
      };
      console.log(`📤 Actualizando asignación rol-módulo ${id}:`, mapped);
      const response = await this.request(`/RolesModulos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Asignación rol-módulo ${id} actualizada:`, data);
      return data;
    } catch (error: any) {
      console.error(`❌ Error actualizando asignación rol-módulo ${id}:`, error);
      throw error;
    }
  }

  async deleteRolModulo(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando asignación rol-módulo ${id}...`);
      await this.request(`/RolesModulos/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Asignación rol-módulo ${id} eliminada`);
    } catch (error: any) {
      console.error(`❌ Error eliminando asignación rol-módulo ${id}:`, error);
      throw error;
    }
  }

  async deleteRolesModulosByRolId(rolId: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando todas las asignaciones del rol ${rolId}...`);
      const rolesModulos = await this.getRolesModulos();
      const modulosDelRol = rolesModulos.filter((rm: any) => rm.rolId === rolId);
      
      for (const rm of modulosDelRol) {
        if (rm.id) {
          await this.deleteRolModulo(rm.id);
        }
      }
      console.log(`✅ Todas las asignaciones del rol ${rolId} han sido eliminadas`);
    } catch (error: any) {
      console.error(`❌ Error eliminando asignaciones del rol ${rolId}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
