import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Eye, EyeOff, User, Mail, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { SimpleCaptcha } from './captcha';
import logo from '../assets/a51cd14e3664f3752eaa436dadb14492d91e40aa.png';

interface RegisterPageProps {
  onBack: () => void;
}

export function RegisterPage({ onBack }: RegisterPageProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    tipoDocumento: '',
    documento: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [captchaValidated, setCaptchaValidated] = useState<boolean>(false);
  // Default role is always 'cliente'

  const validatePassword = (password: string) => {
    const validations = {
      minLength: password.length >= 6,
      hasNumber: /[0-9]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password)
    };

    return validations;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar que el captcha esté validado
    if (!captchaValidated) {
      setError('Completa la verificación "No soy un robot" para continuar');
      return;
    }

    setIsLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    const validations = validatePassword(formData.password);
    if (!validations.minLength) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.documento.trim()) {
      setError('El número de documento es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.tipoDocumento) {
      setError('El tipo de documento es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.telefono.trim()) {
      setError('El teléfono es obligatorio');
      setIsLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        telefono: formData.telefono.trim() || undefined,
        role: 'cliente',
        documento: formData.documento.trim() || undefined,
        tipoDocumento: formData.tipoDocumento || undefined,
        direccion: formData.direccion.trim() || undefined,
        barrio: formData.barrio.trim() || undefined,
        fechaNacimiento: formData.fechaNacimiento || undefined
      });

      if (result.success) {
        setSuccess(true);
        // Auto-redirect después de registro exitoso
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setError(result.error || 'Error al crear la cuenta');
        setCaptchaValidated(false); // Resetear captcha en error
      }
    } catch (err) {
      setError('Error al crear la cuenta. Intenta de nuevo.');
      setCaptchaValidated(false); // Resetear captcha en error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaValidation = (isValid: boolean) => {
    setCaptchaValidated(isValid);
  };

  const passwordValidations = validatePassword(formData.password);

  if (success) {
    return (
      <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="elegante-card text-center">
            <div className="w-20 h-20 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white-primary mb-4">
              ¡Cuenta creada exitosamente!
            </h1>
            <p className="text-gray-lightest mb-6">
              Tu cuenta ha sido creada como <strong>Cliente</strong> y ya estás autenticado. Serás redirigido en unos momentos.
            </p>
            <div className="w-8 h-8 border-2 border-orange-primary border-t-transparent rounded-full animate-spin mx-auto" />
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
            Crear Cuenta
          </h1>
          <p className="text-gray-lightest">
            Únete a EDWINS BARBER
          </p>
        </div>

        {/* Formulario de registro */}
        <div className="elegante-card">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Role selection removed - defaulting to 'cliente' */}
 {/* Documentación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento" className="text-white-primary">Tipo de Documento</Label>
                <select
                  id="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                  className="elegante-input w-full pl-2"
                >
                  <option value="">Selecciona tipo</option>
                  <option value="Cédula">Cédula</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento" className="text-white-primary">Número de Documento</Label>
                <div className="relative">
                  <Input
                    id="documento"
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder="No. Documento"
                    className="elegante-input pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white-primary">Nombre *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre"
                    className="elegante-input pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-white-primary">Apellido *</Label>
                <div className="relative">
                  <Input
                    id="apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Tu apellido"
                    className="elegante-input pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                </div>
              </div>
            </div>
            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white-primary">Email *</Label>
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
              <Label htmlFor="telefono" className="text-white-primary">Teléfono</Label>
              <div className="relative">
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+57 300 1234567"
                  className="elegante-input pl-10"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
              </div>
            </div>

            {/* Ubicación y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-white-primary">Dirección</Label>
                <Input
                  id="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Dirección completa"
                  className="elegante-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barrio" className="text-white-primary">Barrio</Label>
                <Input
                  id="barrio"
                  type="text"
                  value={formData.barrio}
                  onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
                  placeholder="Barrio"
                  className="elegante-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento" className="text-white-primary">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="elegante-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white-primary">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="elegante-input pl-10 pr-10"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Validaciones de contraseña */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-darker rounded-lg border border-gray-dark">
                  <h4 className="text-white-primary text-sm font-medium mb-2">Requisitos de seguridad:</h4>
                  <div className="space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${passwordValidations.minLength ? 'text-green-400' : 'text-gray-lighter'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidations.minLength ? 'bg-green-400' : 'bg-gray-medium'}`} />
                      Mínimo 6 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidations.hasNumber ? 'text-green-400' : 'text-gray-lighter'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidations.hasNumber ? 'bg-green-400' : 'bg-gray-medium'}`} />
                      Al menos un número (recomendado)
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidations.hasUpperCase ? 'text-green-400' : 'text-gray-lighter'}`}>
                      <div className={`w-2 h-2 rounded-full ${passwordValidations.hasUpperCase ? 'bg-green-400' : 'bg-gray-medium'}`} />
                      Al menos una mayúscula (recomendado)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white-primary">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repite tu contraseña"
                  className="elegante-input pl-10 pr-10"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-lighter" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-sm">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Captcha de seguridad */}
            <div className="mt-6">
              <SimpleCaptcha
                onValidate={handleCaptchaValidation}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.apellido || !formData.tipoDocumento || !formData.documento || !formData.email || !formData.telefono || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || !passwordValidations.minLength || !captchaValidated}
              className={`elegante-button-primary w-full flex items-center justify-center ${!captchaValidated ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Crear Cuenta
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
      </div>
    </div>
  );
}