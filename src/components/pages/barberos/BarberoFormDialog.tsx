import { useState, useEffect } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Camera, Lock, Eye, EyeOff, User } from "lucide-react";
import { useCustomAlert } from "../../ui/custom-alert";

const tiposDocumento = ["Cédula", "Cédula de Extranjería", "Pasaporte"];

interface BarberoFormDialogProps {
  editingBarbero: any;
  onCreateBarbero: (barberoData: any) => void;
  onUpdateBarbero: (barberoData: any) => void;
  onClose: () => void;
}

export function BarberoFormDialog({ editingBarbero, onCreateBarbero, onUpdateBarbero, onClose }: BarberoFormDialogProps) {
  const { error } = useCustomAlert();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    documento: '',
    correo: '',
    celular: '',
    direccion: '',
    barrio: '',
    fechaNacimiento: '',
    password: '',
    rol: 'Barbero',
    status: 'active',
    imagenUrl: ''
  });

  useEffect(() => {
    if (editingBarbero) {
      setFormData({
        nombres: editingBarbero.nombres || '',
        apellidos: editingBarbero.apellidos || '',
        tipoDocumento: editingBarbero.tipoDocumento || '',
        documento: editingBarbero.documento || '',
        correo: editingBarbero.correo || '',
        celular: editingBarbero.celular || '',
        direccion: editingBarbero.direccion || '',
        barrio: editingBarbero.barrio || '',
        fechaNacimiento: editingBarbero.fechaNacimiento || '',
        password: editingBarbero.password || '',
        rol: editingBarbero.rol || '',
        status: editingBarbero.status || 'active',
        imagenUrl: editingBarbero.imagenUrl || ''
      });
    } else {
      setFormData({
        nombres: '',
        apellidos: '',
        tipoDocumento: '',
        documento: '',
        correo: '',
        celular: '',
        direccion: '',
        barrio: '',
        fechaNacimiento: '',
        password: '',
        rol: 'Barbero',
        status: 'active',
        imagenUrl: ''
      });
    }
  }, [editingBarbero]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({...formData, password});
  };

  const handleSubmit = () => {
    if (!formData.nombres || !formData.apellidos || !formData.documento || !formData.correo || !formData.celular) {
      error("Campos obligatorios faltantes", "Por favor completa todos los campos obligatorios: nombres, apellidos, documento, correo y celular.");
      return;
    }

    if (editingBarbero) {
      onUpdateBarbero(formData);
    } else {
      onCreateBarbero(formData);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({...formData, [field]: value});
  };

  return (
    <DialogContent className="elegante-card max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-white-primary">
          {editingBarbero ? 'Editar Barbero' : 'Crear Nuevo Barbero'}
        </DialogTitle>
        <DialogDescription className="text-gray-lightest">
          {editingBarbero ? 'Modifica los datos del barbero seleccionado' : 'Completa la información del nuevo barbero para agregarlo al sistema'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-6">
        {/* Sección de Imagen de Barbero */}
        <div className="bg-gray-darker rounded-lg p-6 border border-gray-dark">
          <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-primary" />
            Imagen de Barbero
          </h4>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-orange-primary">
                {formData.imagenUrl ? (
                  <AvatarImage src={formData.imagenUrl} alt="Avatar del barbero" />
                ) : (
                  <AvatarFallback className="bg-orange-primary text-black-primary text-xl font-bold">
                    {formData.nombres && formData.apellidos 
                      ? `${formData.nombres[0]}${formData.apellidos[0]}`.toUpperCase()
                      : <User className="w-8 h-8" />
                    }
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="flex-1">
              <Label htmlFor="imagenUrl" className="text-white-primary">URL de la Imagen</Label>
              <Input
                id="imagenUrl"
                value={formData.imagenUrl}
                onChange={(e) => updateField('imagenUrl', e.target.value)}
                className="elegante-input mt-2"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-gray-lighter mt-1">
                Ingresa la URL de la imagen del barbero (opcional). Si no se proporciona, se usarán las iniciales.
              </p>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nombres" className="text-white-primary">Nombres *</Label>
            <Input
              id="nombres"
              value={formData.nombres}
              onChange={(e) => updateField('nombres', e.target.value)}
              className="elegante-input"
              placeholder="Ingresa los nombres"
            />
          </div>
          <div>
            <Label htmlFor="apellidos" className="text-white-primary">Apellidos *</Label>
            <Input
              id="apellidos"
              value={formData.apellidos}
              onChange={(e) => updateField('apellidos', e.target.value)}
              className="elegante-input"
              placeholder="Ingresa los apellidos"
            />
          </div>
        </div>

        {/* Documentación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="tipoDocumento" className="text-white-primary">Tipo de Documento *</Label>
            <select
              id="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={(e) => updateField('tipoDocumento', e.target.value)}
              className="elegante-input w-full"
              disabled={editingBarbero !== null}
            >
              <option value="">Selecciona tipo de documento</option>
              {tiposDocumento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {editingBarbero && (
              <p className="text-xs text-gray-lighter mt-1">
                El tipo de documento no puede modificarse en modo edición.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="documento" className="text-white-primary">Número de Documento *</Label>
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) => updateField('documento', e.target.value)}
              className="elegante-input"
              placeholder="Número de documento"
            />
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="correo" className="text-white-primary">Correo Electrónico *</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => updateField('correo', e.target.value)}
              className="elegante-input"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="celular" className="text-white-primary">Número de Celular *</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => updateField('celular', e.target.value)}
              className="elegante-input"
              placeholder="+57 300 123 4567"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="direccion" className="text-white-primary">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => updateField('direccion', e.target.value)}
              className="elegante-input"
              placeholder="Dirección completa"
            />
          </div>
          <div>
            <Label htmlFor="barrio" className="text-white-primary">Barrio</Label>
            <Input
              id="barrio"
              value={formData.barrio}
              onChange={(e) => updateField('barrio', e.target.value)}
              className="elegante-input"
              placeholder="Nombre del barrio"
            />
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <Label htmlFor="fechaNacimiento" className="text-white-primary">Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => updateField('fechaNacimiento', e.target.value)}
            className="elegante-input"
          />
        </div>

        {/* Contraseña */}
        <div className="bg-gray-darker rounded-lg p-6 border border-gray-dark">
          <h4 className="font-semibold text-white-primary mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-primary" />
            Contraseña
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="password" className="text-white-primary">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="elegante-input pr-10"
                  placeholder="Contraseña del barbero"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-lighter hover:text-white-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={generatePassword}
                className="elegante-button-secondary h-10 px-4"
              >
                Generar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-dark">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-dark rounded-lg text-gray-lightest hover:bg-gray-darker transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="elegante-button-primary"
        >
          {editingBarbero ? 'Actualizar Barbero' : 'Crear Barbero'}
        </button>
      </div>
    </DialogContent>
  );
}
