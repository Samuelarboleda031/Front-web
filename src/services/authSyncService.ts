import { ApiUser, apiService } from './api';
import { firebaseAuthService, UserProfile } from './firebase';

export interface SyncUser {
  id?: number;
  correo: string;
  contrasena: string;
  rolId: number;
  estado: boolean;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  tipoDocumento?: string;
  documento?: string;
  direccion?: string;
  barrio?: string;
  fechaNacimiento?: string;
  fotoPerfil?: string;
}

export interface SyncResult {
  success: boolean;
  user?: ApiUser;
  error?: string;
}

// Mapeo de roles según la documentación y análisis de Firebase
export enum AppRole {
  ADMIN = 1,
  BARBERO = 2,
  CLIENTE = 3,
  RECEPCIONISTA = 4,
  GERENTE = 5,
  CAJERO = 6
}

export class AuthSyncService {
  // Sincronizar usuario de Firebase con la API
  async syncUsuarioConApi(
    firebaseProfile: UserProfile,
    rolId: number,
    additionalData?: Partial<SyncUser>
  ): Promise<SyncResult> {
    try {
      if (!firebaseProfile.email) {
        return { success: false, error: 'Email de Firebase no disponible' };
      }

      const correo = firebaseProfile.email;

      // 1. Buscar si el usuario ya existe en la API
      let usuarioExistente: ApiUser | null = null;
      try {
        const usuarios = await apiService.getUsuarios();
        usuarioExistente = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase()) || null;
      } catch (error) {
        console.error('Error buscando usuario existente:', error);
      }

      let usuarioSincronizado: ApiUser;

      if (usuarioExistente) {
        // 2. Actualizar usuario existente si es necesario
        const necesitaActualizacion =
          usuarioExistente.rolId !== rolId ||
          usuarioExistente.estado !== true ||
          additionalData;

        if (necesitaActualizacion) {
          const datosActualizacion: Partial<ApiUser> = {
            correo: correo,
            contrasena: 'firebase_auth', // Contraseña por defecto para usuarios de Firebase
            rolId: rolId,
            estado: true,
            ...additionalData
          };

          try {
            usuarioSincronizado = await apiService.updateUsuario(usuarioExistente.id, datosActualizacion);
            console.log('Usuario actualizado exitosamente:', usuarioSincronizado);
          } catch (error) {
            console.error('Error actualizando usuario:', error);
            return { success: false, error: 'Error actualizando usuario en la API' };
          }
        } else {
          usuarioSincronizado = usuarioExistente;
          console.log('Usuario ya existe y está sincronizado:', usuarioSincronizado);
        }
      } else {
        // 3. Crear nuevo usuario
        const nuevoUsuario: SyncUser = {
          correo: correo,
          contrasena: 'firebase_auth', // Contraseña por defecto para usuarios de Firebase
          rolId: rolId,
          estado: true,
          nombre: firebaseProfile.displayName?.split(' ')[0] || '',
          apellido: firebaseProfile.displayName?.split(' ').slice(1).join(' ') || 'Usuario',
          fotoPerfil: firebaseProfile.photoURL || '',
          ...additionalData
        };

        try {
          usuarioSincronizado = await apiService.createUsuario(nuevoUsuario);
          console.log('Usuario creado exitosamente:', usuarioSincronizado);
        } catch (error) {
          console.error('Error creando usuario:', error);
          return { success: false, error: 'Error creando usuario en la API' };
        }
      }

      // 4. AUTO-CREAR PERFIL ASOCIADO (Análisis Paso 5)
      // Esta es la parte crítica de la implementación de Firebase: asegurar que cada Usuario tenga su perfil
      await this.ensuresProfileExists(usuarioSincronizado, rolId, firebaseProfile);

      return { success: true, user: usuarioSincronizado };

    } catch (error) {
      console.error('Error en sincronización:', error);
      return { success: false, error: 'Error general en sincronización' };
    }
  }

  /**
   * Asegura que exista un perfil de Cliente o Barbero para el usuario sincronizado
   * Implementa el Paso 5 del diagrama de interacción
   */
  private async ensuresProfileExists(apiUser: ApiUser, rolId: number, profile: UserProfile): Promise<void> {
    try {
      // Determinar si es Cliente o Barbero
      const isCliente = rolId === AppRole.CLIENTE || rolId === AppRole.CAJERO; // Ajustar según lógica de negocio
      const isBarbero = rolId === AppRole.BARBERO;

      if (isCliente) {
        const { clientesService } = await import('./clientesService');
        const clientes = await clientesService.getClientes();
        const existeCliente = clientes.some(c => c.usuarioId === apiUser.id || c.correo === apiUser.correo);

        if (!existeCliente) {
          console.log('🔄 Sincronización Firebase: Creando perfil de Cliente automático...');
          await clientesService.createCliente({
            usuarioId: apiUser.id,
            nombre: apiUser.nombre || profile.displayName?.split(' ')[0] || 'Nuevo',
            apellido: apiUser.apellido || profile.displayName?.split(' ').slice(1).join(' ') || 'Cliente',
            documento: apiUser.documento || `G-${Date.now()}`, // Documento temporal basado en Google/Firebase
            correo: apiUser.correo,
            telefono: apiUser.telefono || undefined,
            fotoPerfil: apiUser.fotoPerfil || profile.photoURL || undefined
          });
          console.log('✅ Perfil de Cliente vinculado exitosamente');
        }
      } else if (isBarbero) {
        const { barberosService } = await import('./barberosService');
        const barberos = await barberosService.getBarberos();
        const existeBarbero = barberos.some(b => b.usuarioId === apiUser.id || b.correo === apiUser.correo);

        if (!existeBarbero) {
          console.log('🔄 Sincronización Firebase: Creando perfil de Barbero automático...');
          await barberosService.createBarbero({
            usuarioId: apiUser.id,
            nombre: apiUser.nombre || profile.displayName?.split(' ')[0] || 'Nuevo',
            apellido: apiUser.apellido || profile.displayName?.split(' ').slice(1).join(' ') || 'Barbero',
            documento: apiUser.documento || `B-${Date.now()}`,
            correo: apiUser.correo,
            telefono: apiUser.telefono || 'N/A',
            especialidad: "General",
            estado: true,
            fotoPerfil: apiUser.fotoPerfil || profile.photoURL || undefined
          });
          console.log('✅ Perfil de Barbero vinculado exitosamente');
        }
      }
    } catch (error) {
      console.error('⚠️ Error al asegurar perfil asociado (Cliente/Barbero):', error);
      // No bloqueamos el login si falla la creación del perfil, pero lo registramos
    }
  }

  // Autenticar usuario y sincronizar con API
  async authenticateAndSync(
    email: string,
    password: string,
    rolId: number,
    additionalData?: Partial<SyncUser>
  ): Promise<SyncResult> {
    try {
      // 1. Autenticar con Firebase
      const userCredential = await firebaseAuthService.signIn(email, password);
      const firebaseProfile = firebaseAuthService.getUserProfile(userCredential.user);

      // 2. Sincronizar con API
      const syncResult = await this.syncUsuarioConApi(firebaseProfile, rolId, additionalData);

      if (syncResult.success && syncResult.user) {
        // 3. Guardar en localStorage para persistencia
        localStorage.setItem('barbershop_user', JSON.stringify({
          id: syncResult.user.id.toString(),
          email: syncResult.user.correo,
          name: `${syncResult.user.nombre || ''} ${syncResult.user.apellido || ''}`.trim() || syncResult.user.correo,
          role: this.getRoleName(syncResult.user.rolId),
          telefono: syncResult.user.telefono,
          fotoPerfil: syncResult.user.fotoPerfil,
          firebaseUid: firebaseProfile.uid,
          emailVerified: firebaseProfile.emailVerified
        }));
      }

      return syncResult;

    } catch (error: any) {
      console.error('Error en authenticateAndSync:', error);
      return { success: false, error: error.message || 'Error de autenticación' };
    }
  }

  // Registrar nuevo usuario con Firebase y sincronizar
  async registerAndSync(
    email: string,
    password: string,
    rolId: number,
    userData: Partial<SyncUser>
  ): Promise<SyncResult> {
    try {
      // 1. Registrar en Firebase
      const userCredential = await firebaseAuthService.signUp(email, password);
      const firebaseProfile = firebaseAuthService.getUserProfile(userCredential.user);

      // 2. Sincronizar con API
      const syncResult = await this.syncUsuarioConApi(firebaseProfile, rolId, userData);

      if (syncResult.success && syncResult.user) {
        // 3. Guardar en localStorage
        localStorage.setItem('barbershop_user', JSON.stringify({
          id: syncResult.user.id.toString(),
          email: syncResult.user.correo,
          name: `${syncResult.user.nombre || ''} ${syncResult.user.apellido || ''}`.trim() || syncResult.user.correo,
          role: this.getRoleName(syncResult.user.rolId),
          telefono: syncResult.user.telefono,
          fotoPerfil: syncResult.user.fotoPerfil,
          firebaseUid: firebaseProfile.uid,
          emailVerified: firebaseProfile.emailVerified
        }));
      }

      return syncResult;

    } catch (error: any) {
      console.error('Error en registerAndSync:', error);
      return { success: false, error: error.message || 'Error en el registro' };
    }
  }

  // Login con Google y sincronizar
  async googleSignInAndSync(
    rolId: number,
    additionalData?: Partial<SyncUser>
  ): Promise<SyncResult> {
    try {
      // 1. Autenticar con Google
      const userCredential = await firebaseAuthService.signInWithGoogle();
      const firebaseProfile = firebaseAuthService.getUserProfile(userCredential.user);

      if (!firebaseProfile.email) {
        return { success: false, error: 'No se pudo obtener el email de Google' };
      }

      // 2. Sincronizar con API
      const syncResult = await this.syncUsuarioConApi(firebaseProfile, rolId, {
        nombre: firebaseProfile.displayName?.split(' ')[0] || '',
        apellido: firebaseProfile.displayName?.split(' ').slice(1).join(' ') || 'Usuario',
        fotoPerfil: firebaseProfile.photoURL || '',
        ...additionalData
      });

      if (syncResult.success && syncResult.user) {
        // 3. Guardar en localStorage
        localStorage.setItem('barbershop_user', JSON.stringify({
          id: syncResult.user.id.toString(),
          email: syncResult.user.correo,
          name: `${syncResult.user.nombre || ''} ${syncResult.user.apellido || ''}`.trim() || syncResult.user.correo,
          role: this.getRoleName(syncResult.user.rolId),
          telefono: syncResult.user.telefono,
          fotoPerfil: syncResult.user.fotoPerfil,
          firebaseUid: firebaseProfile.uid,
          emailVerified: firebaseProfile.emailVerified
        }));
      }

      return syncResult;

    } catch (error: any) {
      console.error('Error en googleSignInAndSync:', error);
      return { success: false, error: error.message || 'Error con Google Sign-In' };
    }
  }

  // Cerrar sesión en Firebase y limpiar localStorage
  async signOut(): Promise<void> {
    try {
      await firebaseAuthService.signOut();
      localStorage.removeItem('barbershop_user');
    } catch (error) {
      console.error('Error en signOut:', error);
      // Limpiar localStorage aunque haya error en Firebase
      localStorage.removeItem('barbershop_user');
    }
  }

  // Recuperar contraseña
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseAuthService.resetPassword(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error enviando email de recuperación' };
    }
  }

  // Obtener usuario desde localStorage
  getStoredUser(): any {
    const userJson = localStorage.getItem('barbershop_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Verificar si el email está verificado
  isEmailVerified(): boolean {
    const storedUser = this.getStoredUser();
    return storedUser?.emailVerified || false;
  }

  // Convertir rolId a nombre de rol
  getRoleName(rolId: number | null): string {
    switch (rolId) {
      case AppRole.ADMIN:
        return 'admin';
      case AppRole.BARBERO:
        return 'barbero';
      case AppRole.CLIENTE:
      case AppRole.CAJERO:
        return 'cliente';
      default:
        return 'cliente';
    }
  }

  // Obtener rolId desde nombre de rol
  getRolId(roleName: string | number | null): number {
    if (typeof roleName === 'number') {
      return roleName || AppRole.CLIENTE;
    }

    if (roleName === null) {
      return AppRole.CLIENTE;
    }

    switch (roleName.toLowerCase()) {
      case 'admin':
        return AppRole.ADMIN;
      case 'barbero':
        return AppRole.BARBERO;
      case 'cliente':
        return AppRole.CLIENTE;
      default:
        return AppRole.CLIENTE;
    }
  }
}

// Exportar instancia del servicio
export const authSyncService = new AuthSyncService();
