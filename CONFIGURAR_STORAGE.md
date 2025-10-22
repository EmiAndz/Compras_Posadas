# 📁 Configuración de Supabase Storage

## 🚨 **PROBLEMA ACTUAL**
El error `Bucket not found` indica que el bucket **"productos"** no existe en tu proyecto de Supabase.

## ✅ **SOLUCIÓN: Crear Bucket en Supabase**

### Paso 1: Acceder al Dashboard
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto

### Paso 2: Crear el Bucket
1. En el menú lateral, ve a **Storage**
2. Haz clic en **"Create a new bucket"**
3. Configura:
   - **Name**: `productos`
   - **Public bucket**: ✅ **Activado** (importante para URLs públicas)
   - **File size limit**: 50MB (opcional)
   - **Allowed MIME types**: `image/*` (opcional, para solo imágenes)

### Paso 3: Configurar Políticas RLS (Opcional)
```sql
-- Permitir INSERT para usuarios autenticados
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'productos' 
  AND auth.role() = 'authenticated'
);

-- Permitir SELECT público (lectura)
CREATE POLICY "Allow public access" ON storage.objects FOR SELECT USING (
  bucket_id = 'productos'
);

-- Permitir DELETE para el propietario
CREATE POLICY "Allow owner delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'productos' 
  AND auth.uid() = owner
);
```

## 🔧 **CONFIGURACIÓN ALTERNATIVA (TEMPORAL)**

Si no puedes crear el bucket ahora, el código ya está actualizado para funcionar **sin imágenes**:

- ✅ El producto se guardará normalmente en la base de datos
- ⚠️ La imagen simplemente no se subirá
- 📝 Se mostrará un mensaje informativo

## 🧪 **PROBAR LA FUNCIONALIDAD**

### Con Storage configurado:
1. Crea el bucket "productos"
2. Recarga la página `agregar-producto.html`
3. Llena el formulario y selecciona una imagen
4. El producto se guardará con imagen

### Sin Storage (temporal):
1. Llena el formulario (con o sin imagen)
2. El producto se guardará sin imagen
3. Verás un mensaje: "Producto guardado, pero sin imagen"

## 📋 **VERIFICAR CONFIGURACIÓN**

Usa la página de prueba: `http://localhost:8080/test-supabase.html`

Esta página te dirá si:
- ✅ Supabase está conectado
- ✅ Las categorías se cargan
- ✅ Las tiendas se cargan
- ⚠️ Storage está disponible

## 🎯 **RESULTADO ESPERADO**

Una vez configurado el Storage:
- 📷 Las imágenes se subirán automáticamente
- 🔗 Se generarán URLs públicas para las imágenes
- 💾 Todo se guardará en la base de datos
- ✨ El formulario funcionará completamente

---

**¿Necesitas ayuda?** El código ya está preparado para ambos escenarios (con y sin Storage).