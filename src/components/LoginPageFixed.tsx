import { useState, useEffect } from 'react';
import { useAuth, RegisterData } from './AuthContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { EmailSimulator } from './EmailSimulator';
import { generatePasswordResetHTML } from './PasswordResetStandalone';
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
            .link-section { 
              background: #8a8a8a; 
              padding: 16px; 
              border-radius: 8px; 
              margin-bottom: 24px; 
            }
            .link-section h4 { color: #1a1a1a; margin-bottom: 8px; }
            .link-container { 
              display: flex; 
              align-items: center; 
              gap: 8px; 
              padding: 12px; 
              background: white; 
              border: 1px solid #6a6a6a; 
              border-radius: 4px; 
              font-family: monospace; 
              font-size: 12px; 
              color: #4a4a4a; 
            }
            .link-text {
              flex: 1;
              cursor: pointer;
              transition: color 0.2s ease;
            }
            .link-text:hover {
              color: #d8b081;
              text-decoration: underline;
            }
            .copy-btn { 
              background: none; 
              border: none; 
              color: #d8b081; 
              cursor: pointer; 
              padding: 4px; 
            }
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
            .steps-section h4 { color: #1a1a1a; margin-bottom: 16px; }
            .steps-list { list-style: none; }
            .step-item { 
              display: flex; 
              gap: 8px; 
              margin-bottom: 8px; 
              align-items: flex-start; 
            }
            .step-number { 
              width: 20px; 
              height: 20px; 
              background: #d8b081; 
              color: white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 12px; 
              font-weight: bold; 
              flex-shrink: 0; 
            }
            .step-text { color: #4a4a4a; font-size: 14px; line-height: 1.4; }
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
              
              <div class="link-section">
                <h4>¿No funciona el botón? Usa este enlace alternativo:</h4>
                <div class="link-container">
                  <span class="link-text" onclick="openPasswordResetPage()" title="Clic para abrir el formulario">https://barbershop-sistema.local/reset-password?token=sim_${Math.random().toString(36).substr(2, 16)} [CLICK AQUÍ PARA ABRIR]</span>
                  <button class="copy-btn" onclick="copyLink(this)" title="Copiar enlace">📋</button>
                </div>
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
              
              <div class="steps-section">
                <h4>Pasos a seguir:</h4>
                <ol class="steps-list">
                  <li class="step-item">
                    <span class="step-number">1</span>
                    <span class="step-text">Haz clic en el botón "Restablecer Contraseña" de arriba o en el enlace alternativo</span>
                  </li>
                  <li class="step-item">
                    <span class="step-number">2</span>
                    <span class="step-text">Serás dirigido a una página segura para cambiar tu contraseña</span>
                  </li>
                  <li class="step-item">
                    <span class="step-number">3</span>
                    <span class="step-text">Ingresa tu nueva contraseña (mínimo 6 caracteres)</span>
                  </li>
                  <li class="step-item">
                    <span class="step-number">4</span>
                    <span class="step-text">Confirma el cambio e inicia sesión con tu nueva contraseña</span>
                  </li>
                </ol>
                <p class=\\"demo-note\\" style=\\"margin-top: 12px; padding: 12px; background: rgba(227, 147, 28, 0.1); border: 1px solid rgba(227, 147, 28, 0.3); border-radius: 8px; color: #d8b081; font-size: 14px;\\">💡 <strong>Modo Demostración:</strong> Al hacer clic en el botón o enlace, se abrirá una nueva pestaña con el formulario de restablecimiento.</p>
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
            function copyLink(button) {
              const linkContainer = button.parentElement;
              const linkText = linkContainer.querySelector('.link-text').textContent;
              navigator.clipboard.writeText(linkText).then(() => {
                button.textContent = '✅';
                setTimeout(() => {
                  button.textContent = '📋';
                }, 2000);
              }).catch(() => {
                // Fallback para navegadores que no soportan clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = linkText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                button.textContent = '✅';
                setTimeout(() => {
                  button.textContent = '📋';
                }, 2000);
              });
            }
            
            function openPasswordResetPage() {
              console.log('Abriendo página de restablecimiento de contraseña...');
              const resetWindow = window.open('', '_blank', 'width=520,height=800,scrollbars=yes,resizable=yes');
              if (resetWindow) {
                const token = 'sim_' + Math.random().toString(36).substr(2, 16);
                const email = '${email}';
                
                // Crear página HTML completa y funcional
                const resetHTML = generatePasswordResetHTML(email, token);
                resetWindow.document.write(resetHTML);
                resetWindow.document.close();
              }
            }
            
            // Función para generar el HTML de la página de restablecimiento
            function generatePasswordResetHTML(email, token) {
              return \`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Edwins Barber</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif; 
      background: #000000; 
      color: #FFFFFF; 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 16px; 
    }
    .container { width: 100%; max-width: 32rem; }
    .header { text-align: center; margin-bottom: 2rem; }
    .logo { 
      width: 5rem; height: 5rem; 
      background: linear-gradient(135deg, #d8b081, #d8b081); 
      border-radius: 1rem; 
      display: flex; align-items: center; justify-content: center; 
      margin: 0 auto 1rem; 
      box-shadow: rgba(0, 0, 0, 0.7) 0px 8px 24px; 
    }
    .logo::before { content: '✂️'; font-size: 2.5rem; }
    .title { font-size: 1.875rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.5rem; }
    .subtitle { color: #aaaaaa; font-size: 0.875rem; }
    .card { 
      background: #1a1a1a; border: 1px solid #3a3a3a; 
      border-radius: 0.75rem; padding: 1.5rem; 
      box-shadow: rgba(0, 0, 0, 0.5) 0px 4px 12px; 
      margin-bottom: 1.5rem; 
    }
    .details h3 { font-size: 1.125rem; font-weight: 600; color: #FFFFFF; margin-bottom: 1rem; }
    .details-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .detail-row { display: flex; justify-content: space-between; font-size: 0.875rem; }
    .detail-label { color: #aaaaaa; }
    .detail-value { color: #FFFFFF; font-family: 'Monaco', 'Menlo', monospace; }
    .form { display: flex; flex-direction: column; gap: 1.5rem; }
    .timer-info { 
      display: flex; align-items: center; justify-content: center; gap: 0.5rem; 
      padding: 0.75rem; border-radius: 0.5rem; 
      background: rgba(227, 147, 28, 0.1); border: 1px solid rgba(227, 147, 28, 0.2); 
      color: #d8b081; font-size: 0.875rem; 
    }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-label { font-weight: 500; color: #FFFFFF; font-size: 0.875rem; }
    .input-container { position: relative; }
    .form-input { 
      width: 100%; background: #2a2a2a; border: 1px solid #3a3a3a; 
      color: #FFFFFF; border-radius: 0.5rem; padding: 0.75rem; 
      font-size: 0.875rem; padding-right: 2.5rem; 
    }
    .form-input:focus { outline: none; border-color: #d8b081; box-shadow: 0 0 0 1px #d8b081; }
    .form-input::placeholder { color: #6a6a6a; }
    .toggle-btn { 
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); 
      background: none; border: none; color: #6a6a6a; cursor: pointer; 
      font-size: 1rem; padding: 0.25rem; 
    }
    .toggle-btn:hover { color: #FFFFFF; }
    .error-message { 
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; 
      border-radius: 0.5rem; background: rgba(127, 29, 29, 0.2); 
      border: 1px solid rgba(220, 38, 38, 0.3); 
      color: #f87171; font-size: 0.875rem; 
    }
    .validation-info { 
      margin-top: 0.75rem; padding: 0.75rem; background: #2a2a2a; 
      border: 1px solid #3a3a3a; border-radius: 0.5rem; 
    }
    .validation-title { color: #FFFFFF; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
    .validation-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .validation-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .validation-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; }
    .validation-valid { color: #4ade80; }
    .validation-valid .validation-dot { background: #4ade80; }
    .validation-invalid { color: #aaaaaa; }
    .validation-invalid .validation-dot { background: #4a4a4a; }
    .mismatch-error { color: #f87171; font-size: 0.875rem; margin-top: 0.25rem; }
    .submit-section { padding-top: 1rem; border-top: 1px solid #3a3a3a; }
    .submit-btn { 
      width: 100%; background: #d8b081; color: #000000; border: none; 
      border-radius: 0.75rem; padding: 0.75rem 1.5rem; font-weight: 600; 
      font-size: 0.875rem; cursor: pointer; transition: all 0.2s ease; 
      display: flex; align-items: center; justify-content: center; gap: 0.5rem; 
    }
    .submit-btn:hover { background: #d8b081; }
    .submit-btn:disabled { background: #4a4a4a; color: #6a6a6a; cursor: not-allowed; }
    .spinner { 
      width: 1rem; height: 1rem; border: 2px solid #000000; 
      border-top: 2px solid transparent; border-radius: 50%; 
      animation: spin 1s linear infinite; 
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .back-section { 
      margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #3a3a3a; 
      text-align: center; 
    }
    .back-btn { 
      background: none; border: none; color: #d8b081; font-size: 0.875rem; 
      cursor: pointer; transition: color 0.2s ease; 
      display: inline-flex; align-items: center; gap: 0.5rem; 
    }
    .back-btn:hover { color: #d8b081; }
    .security-info { 
      margin-top: 1.5rem; padding: 1rem; 
      background: rgba(227, 147, 28, 0.05); border: 1px solid rgba(227, 147, 28, 0.2); 
      border-radius: 0.5rem; 
    }
    .security-header { display: flex; align-items: flex-start; gap: 0.75rem; }
    .security-icon { color: #d8b081; font-size: 1.25rem; margin-top: 0.125rem; }
    .security-content h4 { font-weight: 500; color: #FFFFFF; margin-bottom: 0.5rem; }
    .security-list { 
      list-style: none; display: flex; flex-direction: column; gap: 0.25rem; 
    }
    .security-list li { color: #aaaaaa; font-size: 0.875rem; }
    .success-page { text-align: center; }
    .success-icon { 
      width: 5rem; height: 5rem; background: rgba(22, 163, 74, 0.2); 
      border-radius: 1rem; display: flex; align-items: center; justify-content: center; 
      margin: 0 auto 1.5rem; 
    }
    .success-icon::before { content: '✅'; font-size: 2.5rem; }
    .success-title { font-size: 1.5rem; font-weight: 700; color: #FFFFFF; margin-bottom: 1rem; }
    .success-text { color: #aaaaaa; margin-bottom: 1.5rem; }
    .btn-group { display: flex; flex-direction: column; gap: 0.75rem; }
    .btn-secondary { 
      width: 100%; background: transparent; color: #d8b081; 
      border: 1px solid #d8b081; border-radius: 0.75rem; 
      padding: 0.75rem 1.5rem; font-weight: 600; font-size: 0.875rem; 
      cursor: pointer; transition: all 0.2s ease; 
    }
    .btn-secondary:hover { background: rgba(227, 147, 28, 0.1); color: #d8b081; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Paso de verificación -->
    <div id="verify-step">
      <div class="card">
        <div class="header">
          <div class="logo"></div>
          <h1 class="title">Verificando enlace...</h1>
          <p class="subtitle">Estamos validando tu enlace de recuperación de contraseña</p>
        </div>
        <div style="text-align: center;">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

    <!-- Paso principal -->
    <div id="reset-step" class="hidden">
      <div class="header">
        <div class="logo"></div>
        <h1 class="title">Recuperación de Contraseña</h1>
        <p class="subtitle">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta</p>
      </div>

      <div class="card details">
        <h3>Detalles de la solicitud:</h3>
        <div class="details-list">
          <div class="detail-row">
            <span class="detail-label">Cuenta:</span>
            <span class="detail-value">\${email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">\${new Date().toLocaleString('es-ES')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">IP:</span>
            <span class="detail-value">192.168.1.100 (Simulado)</span>
          </div>
        </div>
      </div>

      <div class="card">
        <form class="form" id="resetForm">
          <div id="error-container" class="hidden">
            <div class="error-message">
              <span>⚠️</span>
              <span id="error-text"></span>
            </div>
          </div>

          <div class="timer-info">
            <span>🕒</span>
            <span>Este enlace es válido por: <span id="timer">24:00:00</span></span>
          </div>

          <div class="form-group">
            <label class="form-label">Nueva contraseña</label>
            <div class="input-container">
              <input type="password" id="newPassword" class="form-input" placeholder="Mínimo 6 caracteres" required>
              <button type="button" class="toggle-btn" id="toggleNewPassword">👁️</button>
            </div>
            <div id="validation-info" class="validation-info hidden">
              <div class="validation-title">Requisitos de seguridad:</div>
              <div class="validation-list">
                <div class="validation-item validation-invalid" id="length-validation">
                  <div class="validation-dot"></div>
                  <span>Mínimo 6 caracteres</span>
                </div>
                <div class="validation-item validation-invalid" id="number-validation">
                  <div class="validation-dot"></div>
                  <span>Al menos un número (recomendado)</span>
                </div>
                <div class="validation-item validation-invalid" id="uppercase-validation">
                  <div class="validation-dot"></div>
                  <span>Al menos una mayúscula (recomendado)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirmar contraseña</label>
            <div class="input-container">
              <input type="password" id="confirmPassword" class="form-input" placeholder="Repite tu nueva contraseña" required>
              <button type="button" class="toggle-btn" id="toggleConfirmPassword">👁️</button>
            </div>
            <div id="mismatch-error" class="mismatch-error hidden">Las contraseñas no coinciden</div>
          </div>

          <div class="submit-section">
            <button type="submit" class="submit-btn" id="submitBtn" disabled>
              <span>🛡️</span>
              <span>Restablecer Contraseña</span>
            </button>
          </div>
        </form>

        <div class="back-section">
          <button class="back-btn" onclick="window.close()">
            <span>←</span>
            <span>Cerrar ventana</span>
          </button>
        </div>
      </div>

      <div class="security-info">
        <div class="security-header">
          <div class="security-icon">🛡️</div>
          <div class="security-content">
            <h4>Información de Seguridad</h4>
            <ul class="security-list">
              <li>• Este enlace expira automáticamente para tu seguridad</li>
              <li>• Solo puede ser usado una vez</li>
              <li>• Tu nueva contraseña se aplicará inmediatamente</li>
              <li>• Cierra esta ventana después de completar el proceso</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Paso de éxito -->
    <div id="success-step" class="hidden">
      <div class="card success-page">
        <div class="success-icon"></div>
        <h1 class="success-title">¡Contraseña actualizada!</h1>
        <p class="success-text">Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <div class="btn-group">
          <button class="submit-btn" onclick="window.close()">Cerrar ventana</button>
          <button class="btn-secondary" onclick="if(window.opener) window.opener.location.reload()">Volver al login</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    let timeLeft = 24 * 60 * 60; // 24 horas en segundos
    let timerInterval;

    // Elementos del DOM
    const verifyStep = document.getElementById('verify-step');
    const resetStep = document.getElementById('reset-step');
    const successStep = document.getElementById('success-step');
    const form = document.getElementById('resetForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');
    const validationInfo = document.getElementById('validation-info');
    const mismatchError = document.getElementById('mismatch-error');
    const timer = document.getElementById('timer');

    // Función para formatear tiempo
    function formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
    }

    // Actualizar timer
    function updateTimer() {
      timer.textContent = formatTime(timeLeft);
      timeLeft--;
      if (timeLeft < 0) {
        clearInterval(timerInterval);
        showError('El enlace ha expirado');
        submitBtn.disabled = true;
      }
    }

    // Mostrar error
    function showError(message) {
      errorText.textContent = message;
      errorContainer.classList.remove('hidden');
    }

    // Ocultar error
    function hideError() {
      errorContainer.classList.add('hidden');
    }

    // Validar contraseña
    function validatePassword(password) {
      return {
        minLength: password.length >= 6,
        hasNumber: /[0-9]/.test(password),
        hasUpperCase: /[A-Z]/.test(password)
      };
    }

    // Actualizar validaciones
    function updateValidations() {
      const password = newPasswordInput.value;
      const validations = validatePassword(password);

      if (password) {
        validationInfo.classList.remove('hidden');
        
        const lengthValidation = document.getElementById('length-validation');
        const numberValidation = document.getElementById('number-validation');
        const uppercaseValidation = document.getElementById('uppercase-validation');

        // Actualizar validación de longitud
        if (validations.minLength) {
          lengthValidation.classList.remove('validation-invalid');
          lengthValidation.classList.add('validation-valid');
        } else {
          lengthValidation.classList.remove('validation-valid');
          lengthValidation.classList.add('validation-invalid');
        }

        // Actualizar validación de número
        if (validations.hasNumber) {
          numberValidation.classList.remove('validation-invalid');
          numberValidation.classList.add('validation-valid');
        } else {
          numberValidation.classList.remove('validation-valid');
          numberValidation.classList.add('validation-invalid');
        }

        // Actualizar validación de mayúscula
        if (validations.hasUpperCase) {
          uppercaseValidation.classList.remove('validation-invalid');
          uppercaseValidation.classList.add('validation-valid');
        } else {
          uppercaseValidation.classList.remove('validation-valid');
          uppercaseValidation.classList.add('validation-invalid');
        }
      } else {
        validationInfo.classList.add('hidden');
      }
    }

    // Validar coincidencia de contraseñas
    function validatePasswordMatch() {
      const password = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (confirmPassword && password !== confirmPassword) {
        mismatchError.classList.remove('hidden');
        return false;
      } else {
        mismatchError.classList.add('hidden');
        return true;
      }
    }

    // Verificar si el formulario es válido
    function checkFormValidity() {
      const password = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const validations = validatePassword(password);
      const passwordsMatch = validatePasswordMatch();

      const isValid = validations.minLength && 
                     password === confirmPassword && 
                     passwordsMatch && 
                     password && 
                     confirmPassword;

      submitBtn.disabled = !isValid;
    }

    // Event listeners
    toggleNewPassword.addEventListener('click', () => {
      const type = newPasswordInput.type === 'password' ? 'text' : 'password';
      newPasswordInput.type = type;
      toggleNewPassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    toggleConfirmPassword.addEventListener('click', () => {
      const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
      confirmPasswordInput.type = type;
      toggleConfirmPassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    newPasswordInput.addEventListener('input', () => {
      hideError();
      updateValidations();
      checkFormValidity();
    });

    confirmPasswordInput.addEventListener('input', () => {
      hideError();
      validatePasswordMatch();
      checkFormValidity();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const validations = validatePassword(password);

      if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
      }

      if (!validations.minLength) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Mostrar loading
      submitBtn.innerHTML = '<div class="spinner"></div><span>Actualizando contraseña...</span>';
      submitBtn.disabled = true;

      // Simular proceso
      setTimeout(() => {
        verifyStep.classList.add('hidden');
        resetStep.classList.add('hidden');
        successStep.classList.remove('hidden');
      }, 2000);
    });

    // Inicializar
    setTimeout(() => {
      verifyStep.classList.add('hidden');
      resetStep.classList.remove('hidden');
      
      // Iniciar timer
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
    }, 1000);
  </script>
</body>
</html>\`;
            }
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // ... resto de las funciones del componente (continuaré con el resto del código)

  useEffect(() => {
    if (canResendAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (now >= canResendAt) {
          setCanResendAt(null);
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(Math.ceil((canResendAt - now) / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canResendAt]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.telefono) {
      setRegisterError('Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError('Por favor ingresa un email válido');
      return;
    }

    // Validar longitud de contraseña
    if (registerData.password.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsRegisterLoading(true);
    setRegisterError('');

    try {
      const success = await register(registerData);
      if (success) {
        setIsRegisterOpen(false);
        setRegisterData({
          name: '',
          email: '',
          password: '',
          telefono: '',
          role: 'cliente'
        });
      } else {
        throw new Error('Error en el registro');
      }
    } catch (err) {
      setRegisterError('Error al crear la cuenta. El email podría estar en uso.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordData.email) {
      setForgotPasswordError('Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordData.email)) {
      setForgotPasswordError('Por favor ingresa un email válido');
      return;
    }

    setIsForgotPasswordLoading(true);
    setForgotPasswordError('');
    setRecoveryStep('sending');
    setSendingProgress(0);

    // Simulación de envío con barra de progreso
    const interval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRecoveryStep('sent');
          setForgotPasswordSuccess(true);
          setIsForgotPasswordLoading(false);
          
          // Configurar tiempo de espera para reenvío (30 segundos)
          const resendTime = Date.now() + 30000;
          setCanResendAt(resendTime);
          
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleResendEmail = async () => {
    if (canResendAt && Date.now() < canResendAt) {
      return;
    }

    setIsForgotPasswordLoading(true);
    setRecoveryStep('sending');
    setSendingProgress(0);

    // Simulación de reenvío
    const interval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRecoveryStep('sent');
          setIsForgotPasswordLoading(false);
          
          // Configurar tiempo de espera para próximo reenvío
          const resendTime = Date.now() + 30000;
          setCanResendAt(resendTime);
          
          return 100;
        }
        return prev + 3;
      });
    }, 50);
  };

  const handleViewInstructions = () => {
    setRecoveryStep('instructions');
  };

  const handleOpenEmailSimulator = () => {
    openEmailSimulatorTab(forgotPasswordData.email);
  };

  return (
    <div className="min-h-screen bg-black-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-primary to-orange-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 elegante-shadow-lg">
            <Scissors className="w-10 h-10 text-black-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white-primary mb-2">EDWINS BARBER</h1>
          <p className="text-gray-lightest">Sistema de Gestión Integral</p>
        </div>

        {/* Formulario de Login */}
        <div className="elegante-card">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white-primary flex items-center gap-2">
                <User className="w-4 h-4 text-orange-primary" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@elitebarbershop.com"
                className="elegante-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-primary" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Tu contraseña"
                  className="elegante-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-sm text-orange-primary hover:text-orange-secondary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
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

          <div className="mt-6 pt-6 border-t border-gray-dark text-center">
            <p className="text-gray-lightest text-sm mb-3">¿No tienes cuenta?</p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="elegante-button-secondary w-full flex items-center justify-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-xs text-gray-light">
          <p>© 2025 Edwins Barber. Todos los derechos reservados.</p>
          <p className="mt-1">Sistema desarrollado para gestión integral de barbería</p>
        </div>
      </div>

      {/* Dialog de Registro */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white-primary flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-primary" />
              Crear Cuenta Nueva
            </DialogTitle>
            <DialogDescription className="text-gray-lightest">
              Completa tus datos para registrarte en el sistema
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRegister} className="space-y-4 pt-4">
            {registerError && (
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{registerError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white-primary">Nombre Completo</Label>
              <Input
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="Juan Pérez"
                className="elegante-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white-primary">Email</Label>
              <Input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="juan@ejemplo.com"
                className="elegante-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white-primary">Teléfono</Label>
              <Input
                value={registerData.telefono}
                onChange={(e) => setRegisterData({ ...registerData, telefono: e.target.value })}
                placeholder="+57 300 123 4567"
                className="elegante-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white-primary">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showRegisterPassword ? "text" : "password"}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="elegante-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary transition-colors"
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="elegante-button-secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isRegisterLoading}
                className="elegante-button-primary"
              >
                {isRegisterLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Recuperación de Contraseña */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="bg-gray-darkest border-gray-dark max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white-primary flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-orange-primary" />
              Recuperar Contraseña
            </DialogTitle>
            <DialogDescription className="text-gray-lightest">
              {recoveryStep === 'form' && 'Ingresa tu email para recibir las instrucciones'}
              {recoveryStep === 'sending' && 'Enviando correo de recuperación...'}
              {recoveryStep === 'sent' && 'Correo enviado exitosamente'}
              {recoveryStep === 'instructions' && 'Instrucciones de recuperación'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4">
            {recoveryStep === 'form' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotPasswordError && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{forgotPasswordError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-white-primary flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-primary" />
                    Email de tu cuenta
                  </Label>
                  <Input
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                    placeholder="admin@elitebarbershop.com"
                    className="elegante-input"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="elegante-button-secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isForgotPasswordLoading}
                    className="elegante-button-primary"
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
                <div className="flex items-center justify-center space-x-3 p-6">
                  <div className="w-8 h-8 border-2 border-orange-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-white-primary">Procesando solicitud...</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-lightest">Progreso</span>
                    <span className="text-orange-primary">{sendingProgress}%</span>
                  </div>
                  <Progress value={sendingProgress} className="h-2" />
                </div>

                <div className="bg-orange-primary/10 border border-orange-primary/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-orange-primary">
                    <Clock className="w-4 h-4" />
                    <span>Conectando con el servidor de correo...</span>
                  </div>
                </div>
              </div>
            )}

            {recoveryStep === 'sent' && (
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white-primary mb-2">¡Correo Enviado!</h3>
                    <p className="text-sm text-gray-lightest mb-1">
                      Hemos enviado las instrucciones de recuperación a:
                    </p>
                    <p className="text-sm font-medium text-orange-primary">{forgotPasswordData.email}</p>
                  </div>
                </div>

                <div className="bg-gray-darker p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-white-primary flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-primary" />
                    ¿Qué hacer ahora?
                  </h4>
                  <ul className="text-sm text-gray-lightest space-y-1">
                    <li>• Revisa tu bandeja de entrada</li>
                    <li>• Busca en la carpeta de spam/correo no deseado</li>
                    <li>• Haz clic en el enlace del correo</li>
                    <li>• Sigue las instrucciones para cambiar tu contraseña</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleOpenEmailSimulator}
                    className="w-full elegante-button-primary flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Correo (Simulación)
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleViewInstructions}
                      className="flex-1 elegante-button-secondary flex items-center justify-center"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Ver Instrucciones
                    </button>

                    <button
                      onClick={handleResendEmail}
                      disabled={canResendAt && Date.now() < canResendAt}
                      className="flex-1 elegante-button-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {canResendAt && Date.now() < canResendAt 
                        ? `Reenviar (${timeLeft}s)` 
                        : 'Reenviar'
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}

            {recoveryStep === 'instructions' && (
              <div className="space-y-4">
                <div className="bg-orange-primary/10 border border-orange-primary/20 rounded-lg p-4">
                  <h4 className="font-medium text-white-primary mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-primary" />
                    Proceso de Recuperación
                  </h4>
                  <ol className="text-sm text-gray-lightest space-y-2">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-primary text-black-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Recibiste un correo con el asunto "Recuperación de contraseña"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-primary text-black-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Haz clic en el botón "Restablecer Contraseña" dentro del correo</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-primary text-black-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Se abrirá una nueva ventana con el formulario seguro</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-primary text-black-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Ingresa tu nueva contraseña y confírmala</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-primary text-black-primary rounded-full flex items-center justify-center text-xs font-bold">5</span>
                      <span>¡Listo! Ya puedes iniciar sesión con tu nueva contraseña</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-gray-darker p-4 rounded-lg">
                  <h4 className="font-medium text-white-primary mb-2">⚠️ Importante</h4>
                  <ul className="text-sm text-gray-lightest space-y-1">
                    <li>• El enlace expira en 24 horas</li>
                    <li>• Solo puede usarse una vez</li>
                    <li>• Si no funciona, solicita uno nuevo</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setRecoveryStep('sent')}
                    className="flex-1 elegante-button-secondary"
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 elegante-button-primary"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}