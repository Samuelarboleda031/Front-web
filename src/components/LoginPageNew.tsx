import { useState, useEffect } from 'react';
import { useAuth, RegisterData } from './AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { PasswordResetPage } from './PasswordResetPage';
import { Eye, EyeOff, Scissors, User, Lock, AlertCircle, UserPlus, Phone, Mail, KeyRound, CheckCircle, Send, Clock, Shield, ArrowRight, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';

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
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'form' | 'sending' | 'sent' | 'instructions'>('form');
  const [sendingProgress, setSendingProgress] = useState(0);
  const [canResendAt, setCanResendAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showEmailSimulator, setShowEmailSimulator] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');

  // Función para activar el formulario de restablecimiento desde el correo
  const activatePasswordReset = (email: string, token: string) => {
    setResetEmail(email);
    setResetToken(token);
    setShowPasswordReset(true);
    setIsForgotPasswordOpen(false);
  };

  // Agregar función al objeto window para comunicación con popups
  useEffect(() => {
    (window as any).activatePasswordReset = activatePasswordReset;
    
    return () => {
      delete (window as any).activatePasswordReset;
    };
  }, []);

  // Funciones para manejar el formulario de restablecimiento
  const handlePasswordResetComplete = () => {
    setShowPasswordReset(false);
    setResetToken('');
    setResetEmail('');
    // Opcional: mostrar mensaje de éxito
  };

  const handlePasswordResetBack = () => {
    setShowPasswordReset(false);
    setResetToken('');
    setResetEmail('');
  };

  // Función para abrir el simulador de correo en una nueva pestaña
  const openEmailSimulatorTab = (email: string) => {
    const newWindow = window.open('', '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Correo de Recuperación - Edwins Barber</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              background: #aaaaaa; 
              min-height: 100vh; 
              padding: 16px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              overflow: hidden; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            }
            .header { 
              background: #8a8a8a; 
              padding: 16px; 
              border-bottom: 1px solid #6a6a6a; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
            }
            .header-info h3 { color: #1a1a1a; font-size: 16px; margin-bottom: 4px; }
            .header-info p { color: #4a4a4a; font-size: 14px; }
            .close-btn { 
              background: none; 
              border: none; 
              font-size: 20px; 
              cursor: pointer; 
              color: #4a4a4a; 
              padding: 4px 8px;
            }
            .close-btn:hover { color: #1a1a1a; }
            .email-meta { 
              padding: 16px; 
              border-bottom: 1px solid #6a6a6a; 
              background: #f5f5f5;
            }
            .email-meta p { font-size: 14px; color: #4a4a4a; margin-bottom: 4px; }
            .email-content { padding: 32px; }
            .logo-section { text-align: center; margin-bottom: 32px; }
            .logo { 
              width: 64px; 
              height: 64px; 
              background: linear-gradient(135deg, #d8b081, #d8b081); 
              border-radius: 16px; 
              margin: 0 auto 16px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            }
            .logo::before { 
              content: '✂️'; 
              font-size: 32px; 
            }
            .logo-section h1 { color: #1a1a1a; font-size: 24px; margin-bottom: 8px; }
            .logo-section p { color: #4a4a4a; }
            .account-info { 
              background: #8a8a8a; 
              padding: 16px; 
              border-radius: 8px; 
              margin-bottom: 24px; 
            }
            .account-info h3 { color: #1a1a1a; margin-bottom: 8px; }
            .account-info p { color: #4a4a4a; font-size: 14px; margin-bottom: 4px; }
            .action-section { text-align: center; margin-bottom: 32px; }
            .reset-btn { 
              background: #d8b081; 
              color: white; 
              border: none; 
              padding: 16px 32px; 
              border-radius: 8px; 
              font-size: 16px; 
              font-weight: 600; 
              cursor: pointer; 
              transition: background 0.2s;
            }
            .reset-btn:hover { background: #d8b081; }
            .validity-note { color: #4a4a4a; font-size: 14px; margin-top: 12px; }
            .security-section { 
              background: rgba(227, 147, 28, 0.05); 
              border: 1px solid rgba(227, 147, 28, 0.2); 
              padding: 16px; 
              border-radius: 8px; 
              margin-bottom: 24px; 
            }
            .security-section h4 { color: #1a1a1a; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
            .security-section ul { list-style: none; }
            .security-section li { color: #4a4a4a; font-size: 14px; margin-bottom: 4px; }
            .footer { 
              background: #1a1a1a; 
              color: white; 
              padding: 24px; 
              text-align: center; 
            }
            .footer p { margin-bottom: 8px; }
            .footer .company { font-weight: 600; }
            .footer .note { color: #8a8a8a; }
            .footer .copyright { 
              color: #8a8a8a; 
              font-size: 12px; 
              border-top: 1px solid #3a3a3a; 
              padding-top: 16px; 
              margin-top: 16px; 
            }
            .simulation-notice { 
              margin-top: 16px; 
              padding: 16px; 
              background: rgba(59, 130, 246, 0.1); 
              border: 1px solid rgba(59, 130, 246, 0.3); 
              border-radius: 8px; 
              color: #3b82f6; 
              text-align: center;
            }
            .simulation-notice h5 { margin-bottom: 8px; font-weight: 600; }
            .simulation-notice p { font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-info">
                <h3>Edwins Barber - Sistema de Gestión</h3>
                <p>no-reply@elitebarbershop.com</p>
              </div>
              <button class="close-btn" onclick="window.close()">✕</button>
            </div>
            
            <div class="email-meta">
              <p><strong>Para:</strong> ${email}</p>
              <p><strong>Asunto:</strong> Recuperación de contraseña - Edwins Barber</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
            
            <div class="email-content">
              <div class="logo-section">
                <div class="logo"></div>
                <h1>Recuperación de Contraseña</h1>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta</p>
              </div>
              
              <div class="account-info">
                <h3>Detalles de la solicitud:</h3>
                <p><strong>Cuenta:</strong> ${email}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>IP:</strong> 192.168.1.100 (Simulado)</p>
              </div>
              
              <div class="action-section">
                <button class="reset-btn" onclick="openPasswordResetPage()">
                  🛡️ Abrir Formulario de Restablecimiento
                </button>
                <p class="validity-note">Este enlace es válido por 24 horas desde el momento de la solicitud</p>
              </div>
              
              <div class="security-section">
                <h4>🛡️ Importante - Información de Seguridad</h4>
                <ul>
                  <li>• Este enlace expira en 24 horas por tu seguridad</li>
                  <li>• Solo puede ser usado una vez</li>
                  <li>• Si no solicitaste este cambio, ignora este correo</li>
                  <li>• Nunca compartas este enlace con otras personas</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p class="company">EDWINS BARBER - Sistema de Gestión</p>
              <p class="note">Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p class="note">Si tienes problemas, contacta al administrador del sistema.</p>
              <p class="copyright">&copy; 2025 Edwins Barber. Todos los derechos reservados.</p>
            </div>
          </div>
          
          <div class="simulation-notice">
            <h5>🔗 Simulación de Correo</h5>
            <p>Esta es una simulación del correo de recuperación que se enviaría al usuario. En un entorno real, este correo llegaría a la bandeja de entrada del usuario.</p>
          </div>
          
          <script>
            function openPasswordResetPage() {
              console.log('Abriendo formulario de restablecimiento de contraseña...');
              
              // En lugar de abrir nueva ventana, activamos el formulario interno
              if (window.opener && window.opener.activatePasswordReset) {
                const token = 'sim_' + Math.random().toString(36).substr(2, 16);
                window.opener.activatePasswordReset('${email}', token);
                window.close();
                return;
              }
              
              alert('Error: No se pudo comunicar con la ventana principal. Por favor, cierra esta ventana e intenta de nuevo.');
            }
          </script>
        </body>
        </html>
      `);
    }
  };

  // Resto de funciones del login (simplificadas)
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordError('');
    setRecoveryStep('sending');

    // Simular progreso de envío
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setSendingProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
        setRecoveryStep('sent');
      }
    }, 200);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setForgotPasswordSuccess(true);
    } catch (err) {
      setForgotPasswordError('Error al enviar el correo de recuperación');
      setRecoveryStep('form');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // Si se debe mostrar el formulario de restablecimiento de contraseña
  if (showPasswordReset) {
    return (
      <PasswordResetPage
        token={resetToken}
        email={resetEmail}
        onComplete={handlePasswordResetComplete}
        onBack={handlePasswordResetBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
      <div className="w-full max-width-sm">
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

        {/* Modal de recuperación de contraseña */}
        <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
          <DialogContent className="bg-gray-darkest border-gray-dark max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white-primary flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-primary" />
                Recuperar Contraseña
              </DialogTitle>
              <DialogDescription className="text-gray-lightest">
                {recoveryStep === 'form' && "Ingresa tu email para recibir las instrucciones de recuperación"}
                {recoveryStep === 'sending' && "Enviando correo de recuperación..."}
                {recoveryStep === 'sent' && "¡Correo enviado exitosamente!"}
              </DialogDescription>
            </DialogHeader>

            {recoveryStep === 'form' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotPasswordError && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{forgotPasswordError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-white-primary">Email de la cuenta</Label>
                  <div className="relative">
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotPasswordData.email}
                      onChange={(e) => setForgotPasswordData({ email: e.target.value })}
                      placeholder="tu@email.com"
                      className="elegante-input pl-10"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="elegante-button-secondary flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isForgotPasswordLoading}
                    className="elegante-button-primary flex-1"
                  >
                    {isForgotPasswordLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {recoveryStep === 'sending' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-orange-primary animate-pulse" />
                  </div>
                  <p className="text-gray-lightest mb-4">
                    Enviando correo de recuperación a: <br />
                    <span className="text-white-primary font-mono">{forgotPasswordData.email}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-lightest">Progreso</span>
                    <span className="text-orange-primary">{sendingProgress}%</span>
                  </div>
                  <Progress value={sendingProgress} className="h-2" />
                </div>
              </div>
            )}

            {recoveryStep === 'sent' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-lightest mb-4">
                    Se ha enviado un correo de recuperación a: <br />
                    <span className="text-white-primary font-mono">{forgotPasswordData.email}</span>
                  </p>
                  <p className="text-sm text-gray-lighter mb-4">
                    Revisa tu bandeja de entrada y haz clic en el enlace de recuperación.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => openEmailSimulatorTab(forgotPasswordData.email)}
                    className="elegante-button-primary w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Correo Simulado
                  </Button>
                  
                  <Button
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="elegante-button-secondary w-full"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}