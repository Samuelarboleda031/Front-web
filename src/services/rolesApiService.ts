/**
 * Servicio Adapter: Roles con Módulos
 * 
 * Este servicio adapta los servicios reales (apiService, rolesModulosService)
 * a la interfaz que espera RolesPage.tsx
 */

import { apiService } from './api';
import { rolesModulosService } from './rolesModulosService';

const API_BASE_URL = 'http://edwisbarber.somee.com/api';

interface AuthHeaders extends Record<string, string> {
  'Content-Type': string;
  'Authorization'?: string;
}

const getAuthHeaders = (): AuthHeaders => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Tipos para RolesModulos (Permisos Granulares) - Basado en estructura del backend
export interface PermisoModulo {
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

// Estructura de la tabla intermedia RolesModulos
export interface RolesModulos {
  id: number;
  rolId: number;
  moduloId: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  modulo?: {
    id: string;
    nombre: string;
    descripcion: string;
  };
}

// Estructura de la entidad Modulo
export interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

// Estructura de la entidad Role
export interface Role {
  id: string;
  nombre: string;
  descripcion?: string; // Renombrado de observaciones para consistencia
  estado: boolean; // boolean en backend, no string
  fechaCreacion: string;
  usuariosAsignados?: number;
}

export interface ModuloAcceso {
  id: string;
  nombre: string;
  descripcion: string;
  icono: any;
  color: string;
}

export interface RoleWithModules {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: boolean; // boolean para consistencia con backend
  modulos: string[]; // Array de IDs de módulos
  usuariosAsignados: number;
  fechaCreacion: string;
  rolesModulos?: RolesModulos[]; // Relación raw de la API
  permisosPorModulo?: Record<string, PermisoModulo>; // Permisos por módulo
}

export interface CreateRoleData {
  nombre: string;
  descripcion?: string;
  modulos: string[];
  permisos?: Record<string, PermisoModulo>; // Permisos granulares
}

export interface UpdateRoleData extends CreateRoleData {
  estado: boolean;
  permisos?: Record<string, PermisoModulo>;
}

// ==================== SERVICIO ADAPTER ====================

class RolesApiService {
  /**
   * Normaliza la respuesta de la API convirtiendo rolesModulos a array de IDs y extrae permisos
   */
  private normalizeRole(apiRole: any): RoleWithModules {
    let moduloIds: string[] = [];
    let permisosPorModulo: Record<string, PermisoModulo> = {};

    // Si viene del array rolesModulos, extraer los IDs y permisos
    if (apiRole.rolesModulos && Array.isArray(apiRole.rolesModulos)) {
      moduloIds = apiRole.rolesModulos.map((rm: RolesModulos) => rm.moduloId);
      
      // Mapear permisos por módulo
      apiRole.rolesModulos.forEach((rm: RolesModulos) => {
        permisosPorModulo[rm.moduloId] = {
          puedeVer: rm.puedeVer,
          puedeCrear: rm.puedeCrear,
          puedeEditar: rm.puedeEditar,
          puedeEliminar: rm.puedeEliminar
        };
      });
    }
    // Si ya viene como array de strings, usar directamente
    else if (Array.isArray(apiRole.modulos)) {
      moduloIds = apiRole.modulos;
    }

    return {
      id: String(apiRole.id),
      nombre: apiRole.nombre || '',
      descripcion: apiRole.descripcion?.trim() || '',
      estado: apiRole.estado === true || apiRole.estado === 'active', // Convertir a boolean
      modulos: moduloIds.map(id => String(id)), // Asegurar que todos los IDs sean strings
      usuariosAsignados: apiRole.usuariosAsignados || 0,
      fechaCreacion: apiRole.fechaCreacion || new Date().toISOString(),
      rolesModulos: apiRole.rolesModulos,
      permisosPorModulo
    };
  }

  /**
   * Obtiene todos los roles con sus módulos
   */
  async getRolesWithModules(): Promise<RoleWithModules[]> {
    try {
      // Primero intentar con include
      let response = await fetch(`${API_BASE_URL}/roles?include=rolesmodulos,modulos`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      let data: any;
      
      if (!response.ok) {
        // Si falla, intentar endpoint simple
        response = await fetch(`${API_BASE_URL}/roles`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        data = await response.json();
        console.log('📋 Datos recibidos de API (endpoint simple):', data);
        
        // Si no incluye rolesmodulos, hacer llamada separada
        console.log('🔍 Haciendo llamada separada para rolesmodulos...');
        const rolesModulosResponse = await fetch(`${API_BASE_URL}/rolesmodulos`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        
        if (rolesModulosResponse.ok) {
          const rolesModulosData = await rolesModulosResponse.json();
          console.log('📋 Datos de rolesmodulos:', rolesModulosData);
          
          // Combinar roles con rolesmodulos
          if (Array.isArray(data)) {
            data = data.map((role: any) => {
              const roleModulos = Array.isArray(rolesModulosData) 
                ? rolesModulosData.filter((rm: any) => rm.rolId === role.id)
                : [];
              return {
                ...role,
                rolesModulos: roleModulos
              };
            });
          }
        }
      } else {
        data = await response.json();
        console.log('📋 Datos recibidos de API (con include):', data);
      }
      
      // Normalizar cada rol
      const normalizedRoles = (Array.isArray(data) ? data : data.data || [])
        .map((role: any) => {
          console.log('🔍 Rol antes de normalizar:', role);
          console.log('📋 rolesModulos del rol:', role.rolesModulos);
          console.log('📋 modulos del rol:', role.modulos);
          const normalized = this.normalizeRole(role);
          console.log('✅ Rol normalizado:', normalized);
          console.log('📊 modulos después de normalizar:', normalized.modulos);
          console.log('🔑 permisosPorModulo después de normalizar:', normalized.permisosPorModulo);
          return normalized;
        });
      
      console.log('📊 Roles finales:', normalizedRoles);
      return normalizedRoles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Obtiene un rol específico con sus módulos y permisos
   */
  async getRoleById(roleId: number): Promise<RoleWithModules> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeRole(data);
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo rol con sus módulos y permisos
   */
  async createRoleWithModules(roleData: CreateRoleData): Promise<RoleWithModules> {
    try {
      if (!roleData.nombre?.trim()) {
        throw new Error('El nombre del rol es requerido');
      }
      if (!roleData.modulos || roleData.modulos.length === 0) {
        throw new Error('Debe seleccionar al menos un módulo');
      }

      // Preparar payload - Crear el rol primero
      const rolePayload = {
        nombre: roleData.nombre.trim(),
        descripcion: roleData.descripcion?.trim() || '',
        estado: true
      };

      const roleResponse = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rolePayload),
      });

      if (!roleResponse.ok) {
        const error = await roleResponse.json();
        throw new Error(error.message || `Error: ${roleResponse.status}`);
      }

      const createdRole = await roleResponse.json();
      const roleId = createdRole.id;

      // Asignar módulos con los permisos enviados desde el frontend
      for (const moduloId of roleData.modulos) {
        const permisosDelModulo = roleData.permisos?.[moduloId] || {
          puedeVer: true,
          puedeCrear: true,
          puedeEditar: true,
          puedeEliminar: true
        };
        
        const rolesModulosPayload = {
          rolId: roleId,
          moduloId: moduloId,
          ...permisosDelModulo
        };

        await fetch(`${API_BASE_URL}/rolesmodulos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(rolesModulosPayload),
        });
      }

      // Obtener el rol completo con módulos
      return this.getRoleById(roleId);
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Actualiza un rol existente
   */
  async updateRoleWithModules(roleId: number, roleData: UpdateRoleData): Promise<RoleWithModules> {
    try {
      if (!roleData.nombre?.trim()) {
        throw new Error('El nombre del rol es requerido');
      }
      if (!roleData.modulos || roleData.modulos.length === 0) {
        throw new Error('Debe seleccionar al menos un módulo');
      }

      // Actualizar datos básicos del rol
      const updatePayload = {
        nombre: roleData.nombre.trim(),
        descripcion: roleData.descripcion?.trim() || '',
        estado: roleData.estado
      };

      const updateResponse = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || `Error: ${updateResponse.status}`);
      }

      // Obtener módulos actuales
      const currentRole = await this.getRoleById(roleId);
      const currentModulos = currentRole.modulos;

      // Módulos a eliminar
      const modulosToDelete = currentModulos.filter(m => !roleData.modulos.includes(m));
      
      // Módulos a agregar
      const modulosToAdd = roleData.modulos.filter(m => !currentModulos.includes(m));

      // Eliminar módulos no seleccionados
      for (const moduloId of modulosToDelete) {
        const rolesModulo = currentRole.rolesModulos?.find(rm => rm.moduloId === moduloId);
        if (rolesModulo) {
          await fetch(`${API_BASE_URL}/rolesmodulos/${rolesModulo.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
        }
      }

      // Agregar nuevos módulos
      const permisosDefault: PermisoModulo = {
        puedeVer: true,
        puedeCrear: false,
        puedeEditar: false,
        puedeEliminar: false
      };

      for (const moduloId of modulosToAdd) {
        const rolesModulosPayload = {
          rolId: roleId,
          moduloId: moduloId,
          ...permisosDefault
        };

        await fetch(`${API_BASE_URL}/rolesmodulos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(rolesModulosPayload),
        });
      }

      // Actualizar permisos si se proporcionan
      if (roleData.permisos) {
        for (const [moduloId, permisos] of Object.entries(roleData.permisos)) {
          const rolesModulo = currentRole.rolesModulos?.find(rm => rm.moduloId === moduloId);
          if (rolesModulo) {
            await fetch(`${API_BASE_URL}/rolesmodulos/${rolesModulo.id}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                rolId: roleId,
                moduloId: moduloId,
                ...permisos
              }),
            });
          }
        }
      }

      // Obtener el rol actualizado
      return this.getRoleById(roleId);
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Elimina un rol (soft delete)
   */
  async deleteRole(roleId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Obtiene los módulos de un rol específico
   */
  async getRoleModules(roleId: number): Promise<RolesModulos[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/rolesmodulos/role/${roleId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Error fetching role modules:', error);
      throw error;
    }
  }
};

export const rolesApiService = new RolesApiService();
