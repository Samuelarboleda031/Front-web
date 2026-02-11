import { useState } from 'react';
import { useAuth, RegisterData } from './AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Eye, EyeOff, Scissors, User, Lock, AlertCircle, UserPlus, Phone, Mail, KeyRound, ArrowRight, Send } from 'lucide-react';

export function LoginPage() {
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    telefono: '',
    role: 'cliente' as const
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    setRegisterError('');

    try {
      await register(registerData);
      setIsRegisterOpen(false);
      setRegisterData({
        name: '',
        email: '',
        password: '',
        telefono: '',
        role: 'cliente'
      });
    } catch (err) {
      setRegisterError('Error al crear la cuenta');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación de contraseña en desarrollo');
    setIsForgotPasswordOpen(false);
  };

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-primary to-orange-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 elegante-shadow-lg">
            <Scissors className="w-10 h-10 text-black-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white-primary mb-2">
            EDWINS BARBER
          </h1>
          <p className="text-gray-lightest">
            Sistema de Gestión Integral
          </p>
        </div>

        {/* Formulario principal de login */}
        <div className="elegante-card mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white-primary">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="elegante-input pl-10"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white-primary">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Tu contraseña"
                  className="elegante-input pl-10 pr-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="elegante-button-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-dark">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-sm text-orange-primary hover:text-orange-secondary transition-colors text-center"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="text-sm text-gray-lighter hover:text-white-primary transition-colors text-center"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
            </div>
          </div>
        </div>

        {/* Modal de registro */}
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-primary" />
                Crear Cuenta Nueva
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Completa los datos para crear tu cuenta en el sistema
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegister} className="space-y-4">
              {registerError && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{registerError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-white-primary">Nombre completo</Label>
                <div className="relative">
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="elegante-input pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-white-primary">Email</Label>
                <div className="relative">
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="elegante-input pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone" className="text-white-primary">Teléfono</Label>
                <div className="relative">
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerData.telefono}
                    onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                    placeholder="Tu número de teléfono"
                    className="elegante-input pl-10"
                    required
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-white-primary">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Crea una contraseña segura"
                    className="elegante-input pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="elegante-button-secondary flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isRegisterLoading}
                  className="elegante-button-primary flex-1"
                >
                  {isRegisterLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Cuenta
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal básico de recuperación */}
        <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-primary" />
                Recuperar Contraseña
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                Esta funcionalidad estará disponible próximamente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-gray-lightest text-sm">
                Por favor, contacta al administrador del sistema para recuperar tu contraseña.
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="elegante-button-secondary flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  className="elegante-button-primary flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Entendido
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}