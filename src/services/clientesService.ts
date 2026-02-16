// Interfaces para la API de clientes
export interface ClienteAPI {
  id: number;
  usuarioId?: number;
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  telefono?: string;
  fechaNacimiento?: string;
  estado: boolean;
  agendamientos?: any[];
  devoluciones?: any[];
  venta?: any[];
  usuario?: any;
}

// Interface para el componente Cliente (mantener compatibilidad con el código existente)
export interface Cliente {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  barrio: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  ultimaVisita: string;
  activo: boolean;
  saldoAFavor: number;
  fotoPerfil?: string;
  contraseña: string;
}

// Interface para crear cliente
export interface CreateClienteData {
  usuarioId?: number; // Agregado para vinculación
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  barrio?: string;
  fotoPerfil?: string;
}

// Interface para actualizar cliente
export interface UpdateClienteData extends CreateClienteData {
  id: number;
  estado?: boolean; // Agregar campo estado
}

const API_BASE_URL = '/api/clientes';

class ClientesService {
  // Mapear datos de la API al formato del componente
  mapApiToComponent(apiCliente: ClienteAPI): Cliente {
    // Extraer tipo y número de documento del campo documento
    const partesDocumento = apiCliente.documento.split(' ');
    const tipoDocumento = partesDocumento.length > 1 ? partesDocumento[0] : 'CC';
    const numeroDocumento = partesDocumento.length > 1 ? partesDocumento.slice(1).join(' ') : apiCliente.documento;

    return {
      id: apiCliente.id.toString(),
      tipoDocumento: tipoDocumento || 'CC',
      numeroDocumento: numeroDocumento,
      nombre: apiCliente.nombre,
      apellido: apiCliente.apellido,
      email: apiCliente.correo,
      telefono: apiCliente.telefono || '',
      direccion: '', // La API no tiene campo dirección
      barrio: '', // La API no tiene campo barrio
      fechaNacimiento: apiCliente.fechaNacimiento || '',
      fechaRegistro: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      ultimaVisita: '', // La API no tiene este campo
      activo: apiCliente.estado,
      saldoAFavor: 0, // La API no tiene este campo
      fotoPerfil: '', // La API no tiene este campo
      contraseña: '' // La API no maneja contraseñas
    };
  }

  // Mapear datos del componente a la API (PascalCase para .NET)
  mapComponentToApi(componenteCliente: CreateClienteData | UpdateClienteData): any {
    const baseData: any = {
      UsuarioId: componenteCliente.usuarioId,
      Nombre: componenteCliente.nombre,
      Apellido: componenteCliente.apellido,
      Documento: componenteCliente.documento,
      Correo: componenteCliente.correo,
      Telefono: componenteCliente.telefono,
      FechaNacimiento: componenteCliente.fechaNacimiento,
      Direccion: componenteCliente.direccion,
      Barrio: componenteCliente.barrio,
      FotoPerfil: componenteCliente.fotoPerfil,
      Estado: true // Por defecto activo
    };

    // Si es actualización, agregar id
    if ('id' in componenteCliente) {
      baseData.Id = componenteCliente.id;
    }

    return baseData;
  }

  // Obtener todos los clientes
  async getClientes(): Promise<ClienteAPI[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  }

  // Obtener un cliente por ID
  async getClienteById(id: number): Promise<ClienteAPI> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      throw error;
    }
  }

  // Crear un nuevo cliente
  async createCliente(clienteData: CreateClienteData): Promise<ClienteAPI> {
    try {
      const apiData = this.mapComponentToApi(clienteData);

      console.log('🔵 Creando cliente - Datos originales:', clienteData);
      console.log('🔵 Creando cliente - Datos mapeados (enviados):', apiData);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  }

  // Actualizar un cliente
  async updateCliente(id: number, clienteData: UpdateClienteData): Promise<ClienteAPI> {
    try {
      const apiData = this.mapComponentToApi(clienteData);

      console.log('PUT request data:', JSON.stringify(apiData, null, 2));
      console.log('PUT request URL:', `${API_BASE_URL}/${id}`);

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...apiData,
          estado: clienteData.estado // Usar el estado real del cliente
        }),
      });

      console.log('PUT response status:', response.status);
      console.log('PUT response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      // Manejar respuesta 204 No Content (común en PUT operations)
      if (response.status === 204) {
        return clienteData as ClienteAPI; // Devolver los datos enviados
      }

      // Si hay contenido, parsear JSON
      const text = await response.text();
      return text ? JSON.parse(text) : (clienteData as ClienteAPI);
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  }

  // Eliminar un cliente
  async deleteCliente(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  }

  // Cambiar estado de un cliente (activar/desactivar)
  async toggleClienteEstado(id: number, estado: boolean): Promise<void> {
    try {
      console.log(`🔄 Cambiando estado del cliente ${id} a ${estado}`);

      const response = await fetch(`${API_BASE_URL}/${id}/estado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      console.log(`✅ Estado del cliente ${id} actualizado a ${estado}`);
    } catch (error) {
      console.error('Error cambiando estado del cliente:', error);
      throw error;
    }
  }
}

export const clientesService = new ClientesService();
