const API_BASE_URL = 'http://edwisbarber.somee.com/api';

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

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  estado: boolean;
}

export interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  servicios: string[];
  duracion: number;
  precio: number;
  descuento: number;
  precioOriginal: number;
  clientesAtendidos: number;
  categoria: string;
  activo: boolean;
}

export interface DetallePaquete {
  id: number;
  paqueteId: number;
  nombreServicio: string;
  precioServicio: number;
  cantidad: number;
  subtotal: number;
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
    
    // Campos para Servicios
    if (data.descripcion !== undefined) mapped.Descripcion = data.descripcion;
    if (data.duracion !== undefined) mapped.Duracion = Number(data.duracion);
    if (data.precio !== undefined) mapped.Precio = Number(data.precio);
    if (data.estado !== undefined) mapped.Activo = !!data.estado; // API usa Activo pero frontend usa estado
    
    // Campos para Paquetes
    if (data.nombre !== undefined) mapped.Nombre = data.nombre;
    if (data.servicios !== undefined) mapped.Servicios = data.servicios;
    if (data.descuento !== undefined) mapped.Descuento = Number(data.descuento);
    if (data.precioOriginal !== undefined) mapped.PrecioOriginal = Number(data.precioOriginal);
    if (data.clientesAtendidos !== undefined) mapped.ClientesAtendidos = Number(data.clientesAtendidos);
    if (data.categoria !== undefined) mapped.Categoria = data.categoria;
    if (data.activo !== undefined) mapped.Activo = !!data.activo;
    
    // Campos para DetallePaquetes
    if (data.paqueteId !== undefined) mapped.PaqueteId = Number(data.paqueteId);
    if (data.nombreServicio !== undefined) mapped.NombreServicio = data.nombreServicio;
    if (data.precioServicio !== undefined) mapped.PrecioServicio = Number(data.precioServicio);
    if (data.cantidad !== undefined) mapped.Cantidad = Number(data.cantidad);
    if (data.subtotal !== undefined) mapped.Subtotal = Number(data.subtotal);

    return mapped;
  }

  // Normalizar datos que vienen de la API para asegurar tipos correctos
  private normalizeServicioData(data: any): Servicio {
    console.log('🔍 Raw API data:', data);
    console.log('🔍 estado value:', data.estado, 'type:', typeof data.estado);
    console.log('🔍 Estado value:', data.Estado, 'type:', typeof data.Estado);
    
    const normalized = {
      id: Number(data.id) || 0,
      nombre: String(data.nombre || ''),
      descripcion: String(data.descripcion || ''),
      duracion: Number(data.duracion) || 0,
      precio: Number(data.precio) || 0,
      estado: Boolean(
        data.estado === true || 
        data.estado === 'true' || 
        data.estado === 1 || 
        data.estado === '1' ||
        data.Estado === true || 
        data.Estado === 'true' || 
        data.Estado === 1 ||
        data.Estado === '1' ||
        // Si es null, undefined o false, se mantiene false
        data.estado !== null && data.estado !== undefined && data.estado !== false && data.estado !== 'false' && data.estado !== 0 && data.estado !== '0'
      )
    };
    
    console.log('✅ Normalized estado:', normalized.estado);
    return normalized;
  }

  private normalizePaqueteData(data: any): Paquete {
    console.log('🔍 Raw Paquete API data:', data);
    
    const normalized = {
      id: Number(data.id) || 0,
      nombre: String(data.nombre || ''),
      descripcion: String(data.descripcion || ''),
      servicios: Array.isArray(data.servicios) ? data.servicios : [],
      duracion: Number(data.duracion) || 0,
      precio: Number(data.precio) || 0,
      descuento: Number(data.descuento) || 0,
      precioOriginal: Number(data.precioOriginal) || 0,
      clientesAtendidos: Number(data.clientesAtendidos) || 0,
      categoria: String(data.categoria || ''),
      activo: Boolean(
        data.activo === true || 
        data.activo === 'true' || 
        data.activo === 1 || 
        data.activo === '1' ||
        data.Activo === true || 
        data.Activo === 'true' || 
        data.Activo === 1 ||
        data.Activo === '1' ||
        data.activo !== null && data.activo !== undefined && data.activo !== false && data.activo !== 'false' && data.activo !== 0 && data.activo !== '0'
      )
    };
    
    console.log('✅ Normalized Paquete:', normalized);
    return normalized;
  }

  private normalizeDetallePaqueteData(data: any): DetallePaquete {
    console.log('🔍 Raw DetallePaquete API data:', data);
    
    const normalized = {
      id: Number(data.id) || 0,
      paqueteId: Number(data.paqueteId) || 0,
      nombreServicio: String(data.nombreServicio || ''),
      precioServicio: Number(data.precioServicio) || 0,
      cantidad: Number(data.cantidad) || 1,
      subtotal: Number(data.subtotal) || 0
    };
    
    console.log('✅ Normalized DetallePaquete:', normalized);
    return normalized;
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

  // Método especializado para actualizar solo el estado del usuario
  async updateUsuarioStatus(id: number, estado: boolean, userData?: Partial<ApiUser>): Promise<void> {
    try {
      let currentUser: Partial<ApiUser> | null | undefined = userData;

      // Si no se proporcionan datos del usuario, intentar obtenerlos de la API
      if (!currentUser) {
        currentUser = await this.getUsuarioById(id);
        if (!currentUser) {
          throw new Error('Usuario no encontrado');
        }
      }

      // Enviar todos los campos requeridos con el estado actualizado
      const apiBody = this.mapToApiFormat({
        ...currentUser,
        estado: estado
      });
      apiBody.Id = id;

      await this.request(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiBody),
      });

      console.log(`✅ Estado del usuario ${id} actualizado a ${estado}`);
    } catch (error) {
      console.error('Error updating usuario status:', error);
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
      // Este método ahora solo debe usarse para sincronización con Firebase
      // La autenticación principal debe manejarse a través de Firebase Auth
      console.warn('⚠️ authenticateUser está deprecado. Usa Firebase Auth para autenticación.');
      
      const usuarios = await this.getUsuarios();
      const user = usuarios.find(u => u.correo === correo);
      
      if (!user) {
        console.log('Usuario no encontrado:', correo);
        return null;
      }

      // Solo permitir autenticación local para usuarios sincronizados con Firebase
      if (user.contrasena === 'firebase_auth') {
        console.log('Usuario sincronizado con Firebase. Usa Firebase Auth para autenticación.');
        return null;
      }

      // Comparación normal de contraseñas para usuarios legacy
      if (user.contrasena === contrasena) {
        console.log('Autenticación local exitosa (legacy):', user.correo);
        return user;
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

  // ==================== MÉTODOS PARA SERVICIOS ====================
  async getServicios(): Promise<Servicio[]> {
    try {
      console.log('📥 Obteniendo servicios desde:', `${API_BASE_URL}/Servicios`);
      const response = await this.request('/Servicios');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Servicios obtenidos:', data);
      const normalizedData = Array.isArray(data) ? data.map(item => this.normalizeServicioData(item)) : [];
      console.log('✅ Servicios normalizados:', normalizedData);
      return normalizedData;
    } catch (error: any) {
      console.error('❌ Error obteniendo servicios:', error);
      throw error;
    }
  }

  async getServicioById(id: number): Promise<Servicio | null> {
    try {
      console.log(`📥 Obteniendo servicio ${id} desde:`, `${API_BASE_URL}/Servicios/${id}`);
      const response = await this.request(`/Servicios/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Servicio ${id} obtenido:`, data);
      return data ? this.normalizeServicioData(data) : null;
    } catch (error: any) {
      console.error(`❌ Error obteniendo servicio ${id}:`, error);
      throw error;
    }
  }

  async createServicio(servicioData: Partial<Servicio>): Promise<Servicio> {
    try {
      const mapped = this.mapToApiFormat(servicioData);
      console.log('📤 Creando servicio:', mapped);
      const response = await this.request('/Servicios', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Servicio creado:', data);
      return this.normalizeServicioData(data);
    } catch (error: any) {
      console.error('❌ Error creando servicio:', error);
      throw error;
    }
  }

  async updateServicio(id: number, servicioData: Partial<Servicio>): Promise<Servicio> {
    try {
      const mapped = this.mapToApiFormat({ ...servicioData, id });
      console.log(`📤 Actualizando servicio ${id}:`, mapped);
      const response = await this.request(`/Servicios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Servicio ${id} actualizado:`, data);
      return this.normalizeServicioData(data);
    } catch (error: any) {
      console.error(`❌ Error actualizando servicio ${id}:`, error);
      throw error;
    }
  }

  async deleteServicio(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando servicio ${id}...`);
      await this.request(`/Servicios/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Servicio ${id} eliminado`);
    } catch (error: any) {
      console.error(`❌ Error eliminando servicio ${id}:`, error);
      throw error;
    }
  }

  async updateServicioStatus(id: number, estado: boolean) {
  return fetch(`${API_BASE_URL}/servicios/${id}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ estado }) // 👈 ESTA es la clave
  });
}

  // ==================== MÉTODOS PARA PAQUETES ====================
  async getPaquetes(): Promise<Paquete[]> {
    try {
      console.log('📥 Obteniendo paquetes desde:', `${API_BASE_URL}/Paquetes`);
      const response = await this.request('/Paquetes');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Paquetes obtenidos:', data);
      const normalizedData = Array.isArray(data) ? data.map(item => this.normalizePaqueteData(item)) : [];
      console.log('✅ Paquetes normalizados:', normalizedData);
      return normalizedData;
    } catch (error: any) {
      console.error('❌ Error obteniendo paquetes:', error);
      throw error;
    }
  }

  async getPaqueteById(id: number): Promise<Paquete | null> {
    try {
      console.log(`📥 Obteniendo paquete ${id} desde:`, `${API_BASE_URL}/Paquetes/${id}`);
      const response = await this.request(`/Paquetes/${id}`);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      console.log(`✅ Paquete ${id} obtenido:`, data);
      return data ? this.normalizePaqueteData(data) : null;
    } catch (error: any) {
      console.error(`❌ Error obteniendo paquete ${id}:`, error);
      throw error;
    }
  }

  async createPaquete(paqueteData: Partial<Paquete>): Promise<Paquete> {
    try {
      const mapped = this.mapToApiFormat(paqueteData);
      console.log('📤 Creando paquete:', mapped);
      const response = await this.request('/Paquetes', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Paquete creado:', data);
      return this.normalizePaqueteData(data);
    } catch (error: any) {
      console.error('❌ Error creando paquete:', error);
      throw error;
    }
  }

  async updatePaquete(id: number, paqueteData: Partial<Paquete>): Promise<Paquete> {
    try {
      const mapped = this.mapToApiFormat({ ...paqueteData, id });
      console.log(`📤 Actualizando paquete ${id}:`, mapped);
      const response = await this.request(`/Paquetes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Paquete ${id} actualizado:`, data);
      return this.normalizePaqueteData(data);
    } catch (error: any) {
      console.error(`❌ Error actualizando paquete ${id}:`, error);
      throw error;
    }
  }

  async deletePaquete(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando paquete ${id}...`);
      await this.request(`/Paquetes/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Paquete ${id} eliminado`);
    } catch (error: any) {
      console.error(`❌ Error eliminando paquete ${id}:`, error);
      throw error;
    }
  }

  async updatePaqueteStatus(id: number, activo: boolean): Promise<void> {
    try {
      console.log(`📤 Actualizando estado del paquete ${id} a ${activo}...`);
      await this.request(`/Paquetes/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado: activo }), // 🔥 CAMBIAR A estado para coincidir con backend
      });
      console.log(`✅ Estado del paquete ${id} actualizado`);
    } catch (error: any) {
      console.error(`❌ Error actualizando estado del paquete ${id}:`, error);
      throw error;
    }
  }

  // ==================== MÉTODOS PARA DETALLE PAQUETES ====================
  async getDetallePaquetes(): Promise<DetallePaquete[]> {
    try {
      console.log('📥 Obteniendo detalles de paquetes desde:', `${API_BASE_URL}/DetallePaquetes`);
      const response = await this.request('/DetallePaquetes');
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      console.log('✅ Detalles de paquetes obtenidos:', data);
      const normalizedData = Array.isArray(data) ? data.map(item => this.normalizeDetallePaqueteData(item)) : [];
      console.log('✅ Detalles de paquetes normalizados:', normalizedData);
      return normalizedData;
    } catch (error: any) {
      console.error('❌ Error obteniendo detalles de paquetes:', error);
      throw error;
    }
  }

  async getDetallePaquetesByPaqueteId(paqueteId: number): Promise<DetallePaquete[]> {
    try {
      console.log(`📥 Obteniendo detalles del paquete ${paqueteId}...`);
      const detalles = await this.getDetallePaquetes();
      const filtered = detalles.filter(d => d.paqueteId === paqueteId);
      console.log(`✅ Detalles del paquete ${paqueteId}:`, filtered);
      return filtered;
    } catch (error: any) {
      console.error(`❌ Error obteniendo detalles del paquete ${paqueteId}:`, error);
      throw error;
    }
  }

  async createDetallePaquete(detalleData: Partial<DetallePaquete>): Promise<DetallePaquete> {
    try {
      const mapped = this.mapToApiFormat(detalleData);
      console.log('📤 Creando detalle de paquete:', mapped);
      const response = await this.request('/DetallePaquetes', {
        method: 'POST',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log('✅ Detalle de paquete creado:', data);
      return this.normalizeDetallePaqueteData(data);
    } catch (error: any) {
      console.error('❌ Error creando detalle de paquete:', error);
      throw error;
    }
  }

  async updateDetallePaquete(id: number, detalleData: Partial<DetallePaquete>): Promise<DetallePaquete> {
    try {
      const mapped = this.mapToApiFormat({ ...detalleData, id });
      console.log(`📤 Actualizando detalle de paquete ${id}:`, mapped);
      const response = await this.request(`/DetallePaquetes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(mapped),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      console.log(`✅ Detalle de paquete ${id} actualizado:`, data);
      return this.normalizeDetallePaqueteData(data);
    } catch (error: any) {
      console.error(`❌ Error actualizando detalle de paquete ${id}:`, error);
      throw error;
    }
  }

  async deleteDetallePaquete(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando detalle de paquete ${id}...`);
      await this.request(`/DetallePaquetes/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Detalle de paquete ${id} eliminado`);
    } catch (error: any) {
      console.error(`❌ Error eliminando detalle de paquete ${id}:`, error);
      throw error;
    }
  }

  async deleteDetallePaquetesByPaqueteId(paqueteId: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando todos los detalles del paquete ${paqueteId}...`);
      const detalles = await this.getDetallePaquetesByPaqueteId(paqueteId);
      
      for (const detalle of detalles) {
        if (detalle.id) {
          await this.deleteDetallePaquete(detalle.id);
        }
      }
      console.log(`✅ Todos los detalles del paquete ${paqueteId} han sido eliminados`);
    } catch (error: any) {
      console.error(`❌ Error eliminando detalles del paquete ${paqueteId}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
