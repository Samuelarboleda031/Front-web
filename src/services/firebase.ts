import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential
} from "firebase/auth";

// Configuración de Firebase - Proyecto: appbarber-845d7
const firebaseConfig = {
  apiKey: "AIzaSyCa6o15lvjvVMMY82cBd1kTV-AOQLh1qWU",
  authDomain: "appbarber-845d7.firebaseapp.com",
  projectId: "appbarber-845d7",
  storageBucket: "appbarber-845d7.firebasestorage.app",
  messagingSenderId: "309607252500",
  appId: "1:309607252500:web:e78174aaa828a28c3fdd01",
  measurementId: "G-6RC0F5GYGC"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Interfaces para tipado
export interface FirebaseAuthError {
  code: string;
  message: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Servicio de Autenticación Firebase
export class FirebaseAuthService {
  private auth = auth;

  // Obtener usuario actual
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Observador de estado de autenticación
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Login con email y contraseña
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Enviar verificación de email si no está verificado
      if (!result.user.emailVerified) {
        await this.sendEmailVerification();
      }
      
      return result;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Registro con email y contraseña
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Enviar email de verificación
      await this.sendEmailVerification();
      
      return result;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Login con Google
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(this.auth, googleProvider);
      return result;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Enviar email de verificación
  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Recuperar contraseña
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Obtener perfil de usuario
  getUserProfile(user: FirebaseUser): UserProfile {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  }

  // Manejar errores de autenticación
  private handleAuthError(error: any): FirebaseAuthError {
    const errorMap: { [key: string]: string } = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/too-many-requests': 'Demasiados intentos. Intente más tarde',
      'auth/network-request-failed': 'Error de conexión',
      'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
      'auth/popup-blocked': 'Ventana emergente bloqueada',
      'auth/cancelled-popup-request': 'Solicitud cancelada'
    };

    return {
      code: error.code || 'unknown',
      message: errorMap[error.code] || error.message || 'Error desconocido'
    };
  }

  // Verificar si el email está verificado
  isEmailVerified(): boolean {
    const user = this.auth.currentUser;
    return user?.emailVerified || false;
  }

  // Recargar usuario para actualizar estado de verificación
  async reloadUser(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      await user.reload();
    }
  }
}

// Exportar instancia del servicio
export const firebaseAuthService = new FirebaseAuthService();

export default app;
