import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Shield, Clock, Eye, EyeOff, Lock } from 'lucide-react';
import logo from '../assets/a51cd14e3664f3752eaa436dadb14492d91e40aa.png';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onPasswordReset?: (email: string, token: string) => void;
}

export function ForgotPasswordPage({ onBack, onPasswordReset }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Lista de emails válidos (simulado)
  const validEmails: string[] = [];

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email.trim()) {
      setError('El email es obligatorio');
      setIsLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      setIsLoading(false);
      return;
    }

    try {
      // Simular proceso de envío de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar si el email existe en nuestro sistema
      const emailExists = validEmails.includes(email.toLowerCase().trim());
      
      if (emailExists) {
        setSentEmail(email.toLowerCase().trim());
        setSuccess(true);
        
        // Simular que se envía un enlace de recuperación
        // En una implementación real, aquí se enviaría un email con un token único
        const simulatedToken = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Opcional: Llamar a callback para manejar el proceso de reset
        if (onPasswordReset) {
          onPasswordReset(email.toLowerCase().trim(), simulatedToken);
        }
      } else {
        // Por seguridad, no revelamos si el email existe o no
        // Mostramos el mismo mensaje de éxito
        setSentEmail(email.toLowerCase().trim());
        setSuccess(true);
      }
    } catch (err) {
      setError('Error al procesar la solicitud. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (newPassword.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }

    setIsResetting(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsResetting(false);
    setResetMessage('Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tus nuevos datos.');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-stretch">
          <div className="elegante-card text-center flex flex-col justify-center">
            <div className="w-20 h-20 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white-primary mb-4">
              ¡Email enviado!
            </h1>
            <p className="text-gray-lightest mb-6">
              Si existe una cuenta asociada con <span className="text-orange-primary font-mono">{sentEmail}</span>, 
              recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-orange-primary/10 border border-orange-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-primary flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-medium text-white-primary mb-2">Próximos pasos:</h4>
                    <ul className="text-sm text-gray-lightest space-y-1">
                      <li>• Revisa tu bandeja de entrada y spam</li>
                      <li>• El enlace expira en 24 horas</li>
                      <li>• Solo puedes usar el enlace una vez</li>
                      <li>• Si no lo recibes, intenta de nuevo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={onBack}
                  className="elegante-button-primary w-full"
                >
                  Volver al inicio de sesión
                </Button>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full text-sm text-orange-primary hover:text-orange-secondary transition-colors underline"
                >
                  Enviar a otro email
                </button>
              </div>
            </div>
          </div>

          <div className="elegante-card bg-gray-darkest border border-gray-dark/70 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-white-primary mb-4">
              Restablece tu contraseña ahora
            </h2>
            <p className="text-sm text-gray-lightest mb-6">
              Una vez recibas el enlace, puedes crear tu nueva contraseña directamente desde aquí para tener todo listo.
            </p>
            <form onSubmit={handleLocalPasswordReset} className="space-y-5">
              {resetError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30 text-sm text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  {resetError}
                </div>
              )}
              {resetMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/20 border border-green-600/30 text-sm text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  {resetMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white-primary">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ingresa una nueva contraseña"
                    className="elegante-input pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-lightest">
                  Debe tener al menos 6 caracteres y combinar letras y números.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white-primary">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    className="elegante-input pl-10 pr-10"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isResetting}
                className="elegante-button-primary w-full flex items-center justify-center"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Guardar nueva contraseña
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-lightest text-center">
                Este formulario es una simulación para visualizar el flujo completo de recuperación.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 elegante-shadow-lg relative overflow-hidden">
            <img
              src={logo}
              alt="Edwin's Barbería Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white-primary mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-lightest">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Formulario de recuperación */}
        <div className="elegante-card">
          <form onSubmit={handleForgotPassword} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white-primary">Email de tu cuenta</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="elegante-input pl-10"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
              </div>
              <p className="text-xs text-gray-lightest">
                Ingresa el email asociado con tu cuenta de EDWINS BARBER
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="elegante-button-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando enlace...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar enlace de recuperación
                </>
              )}
            </Button>
          </form>

          {/* Botón de regreso */}
          <div className="mt-6 pt-6 border-t border-gray-dark">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-orange-primary hover:text-orange-secondary transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="mt-6 p-4 bg-orange-primary/5 border border-orange-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-orange-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-white-primary mb-2">Información de Seguridad</h4>
              <ul className="text-sm text-gray-lightest space-y-1">
                <li>• Solo enviamos enlaces a emails registrados en nuestro sistema</li>
                <li>• El enlace de recuperación expira en 24 horas</li>
                <li>• Cada enlace solo puede ser usado una vez</li>
                <li>• Si no recibes el email, revisa tu carpeta de spam</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}