# 📊 Análisis: Creación de Usuarios y Perfiles Asociados

## 🎯 Objetivo
Verificar que cuando se crea un usuario, se genere automáticamente su perfil correspondiente en la tabla apropiada según su rol.

---

## 🔄 Flujo de Creación de Usuarios

### 1️⃣ **Desde la Interfaz de Usuario** (`UsersPage.tsx`)

```typescript
handleCreateUser() {
  ↓
  1. Validar campos obligatorios
  ↓
  2. Mapear datos del componente → DTO de API
  ↓
  3. Crear usuario en tabla Usuarios (POST /api/usuarios)
  ↓
  4. Verificar rol del usuario creado
  ↓
  5. Crear perfil asociado según rol
}
```

### 2️⃣ **Desde Firebase Auth** (`authSyncService.ts`)

```typescript
syncUsuarioConApi() {
  ↓
  1. Verificar si usuario existe en BD
  ↓
  2. Crear/actualizar en tabla Usuarios
  ↓
  3. Llamar a ensuresProfileExists()
  ↓
  4. Crear perfil según rol
}
```

---

## 📋 Lógica de Creación de Perfiles por Rol

| Rol ID | Nombre | Perfil Creado | Tabla | Campos Especiales |
|--------|--------|---------------|-------|-------------------|
| **1** | Admin | ❌ Ninguno | - | - |
| **2** | Barbero | ✅ Barbero | `Barberos` | `especialidad: "General"`, `estado: true` |
| **3** | Cliente | ✅ Cliente | `Clientes` | `documento`, `direccion`, `barrio` |
| **4** | Recepcionista | ❌ Ninguno | - | - |
| **5** | Gerente | ❌ Ninguno | - | - |
| **6** | Cajero | ✅ Cliente | `Clientes` | Mismo que Cliente |

---

## ✅ Verificación de Implementación

### **UsersPage.tsx** (Creación Manual)

```typescript
// ✅ CORRECTO - Líneas 329-367
if (roleId === 3 || roleId === 6) {
  // Crear perfil de Cliente para Clientes y Cajeros
  await clientesService.createCliente({...});
}
else if (roleId === 2) {
  // Crear perfil de Barbero
  await barberosService.createBarbero({...});
}
else {
  // Admin, Recepcionista, Gerente no requieren perfil
  console.log('ℹ️ Rol no requiere perfil adicional');
}
```

### **authSyncService.ts** (Sincronización Firebase)

```typescript
// ✅ CORRECTO - Líneas 127-176
const isCliente = rolId === AppRole.CLIENTE || rolId === AppRole.CAJERO;
const isBarbero = rolId === AppRole.BARBERO;

if (isCliente) {
  // Crear perfil de Cliente
  await clientesService.createCliente({...});
}
else if (isBarbero) {
  // Crear perfil de Barbero
  await barberosService.createBarbero({...});
}
```

---

## 🔍 Casos de Uso

### **Caso 1: Crear Cliente desde UI**
1. Admin completa formulario con rol "Cliente"
2. Sistema crea registro en `Usuarios` con `rolId = 3`
3. Sistema detecta `roleId === 3`
4. ✅ Sistema crea automáticamente registro en `Clientes`
5. Toast: "Perfil de Cliente creado automáticamente"

### **Caso 2: Crear Barbero desde UI**
1. Admin completa formulario con rol "Barbero"
2. Sistema crea registro en `Usuarios` con `rolId = 2`
3. Sistema detecta `roleId === 2`
4. ✅ Sistema crea automáticamente registro en `Barberos`
5. Toast: "Perfil de Barbero creado automáticamente"

### **Caso 3: Crear Cajero desde UI**
1. Admin completa formulario con rol "Cajero"
2. Sistema crea registro en `Usuarios` con `rolId = 6`
3. Sistema detecta `roleId === 6`
4. ✅ Sistema crea automáticamente registro en `Clientes`
5. Toast: "Perfil de Cliente creado automáticamente"

### **Caso 4: Crear Admin/Recepcionista/Gerente**
1. Admin completa formulario con rol "Admin"
2. Sistema crea registro en `Usuarios` con `rolId = 1`
3. Sistema detecta que no requiere perfil
4. ✅ Log: "ℹ️ Rol 1 no requiere perfil adicional"
5. No se crea perfil adicional

### **Caso 5: Registro vía Firebase (Google Sign-In)**
1. Usuario se registra con Google
2. Firebase autentica al usuario
3. `authSyncService.syncUsuarioConApi()` se ejecuta
4. Sistema crea registro en `Usuarios` con `rolId = 3` (default)
5. ✅ Sistema crea automáticamente registro en `Clientes`
6. Usuario puede acceder al sistema

---

## 🛡️ Manejo de Errores

### **Error en creación de perfil**
```typescript
try {
  // Crear perfil asociado
} catch (profileError) {
  console.error("❌ Error creando perfil asociado:", profileError);
  toast.warning("Usuario creado, pero hubo un error creando el perfil asociado");
}
```

**Comportamiento:**
- ✅ El usuario **SÍ se crea** en la tabla `Usuarios`
- ⚠️ El perfil asociado **NO se crea**
- 📝 Se registra el error en consola
- 🔔 Se muestra advertencia al usuario
- 🔧 El perfil puede crearse manualmente después

---

## 📊 Datos Creados en Cada Perfil

### **Perfil de Cliente**
```typescript
{
  usuarioId: createdUser.id,
  nombre: createdUser.nombre,
  apellido: createdUser.apellido,
  documento: createdUser.documento || newUser.documento,
  correo: createdUser.correo,
  telefono: createdUser.telefono || newUser.celular,
  fechaNacimiento: createdUser.fechaNacimiento || undefined,
  direccion: createdUser.direccion || newUser.direccion,
  barrio: createdUser.barrio || newUser.barrio,
  fotoPerfil: createdUser.fotoPerfil || undefined
}
```

### **Perfil de Barbero**
```typescript
{
  usuarioId: createdUser.id,
  nombre: createdUser.nombre,
  apellido: createdUser.apellido,
  documento: createdUser.documento || newUser.documento,
  correo: createdUser.correo,
  telefono: createdUser.telefono || newUser.celular,
  especialidad: "General", // ⚠️ Valor por defecto
  fotoPerfil: createdUser.fotoPerfil || undefined,
  estado: true
}
```

---

## ✅ Conclusión

El sistema **FUNCIONA CORRECTAMENTE** y crea automáticamente los perfiles asociados según el rol:

1. ✅ **Clientes (Rol 3)** → Perfil en tabla `Clientes`
2. ✅ **Barberos (Rol 2)** → Perfil en tabla `Barberos`
3. ✅ **Cajeros (Rol 6)** → Perfil en tabla `Clientes`
4. ✅ **Admin/Recepcionista/Gerente** → Sin perfil adicional
5. ✅ Manejo robusto de errores
6. ✅ Consistencia entre creación manual y Firebase

---

## 🔧 Mejoras Recientes Aplicadas

1. ✅ Actualizado `UsersPage.tsx` para incluir Cajeros (rol 6) en la creación de perfil de Cliente
2. ✅ Agregado logging detallado para cada tipo de rol
3. ✅ Documentación mejorada en comentarios del código
4. ✅ Consistencia total con `authSyncService.ts`

**Fecha de análisis:** 2026-02-15
**Estado:** ✅ Verificado y Funcionando
