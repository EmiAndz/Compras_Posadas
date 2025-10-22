# 🚀 Guía Paso a Paso: Configurar Supabase para Compras Posadas

## 📋 Requisitos Previos
- Cuenta de email válida
- Navegador web moderno
- Acceso a tu proyecto de Compras Posadas

---

## 🔥 PASO 1: Crear Cuenta en Supabase

1. **Ir a Supabase**
   - Visita: https://supabase.com
   - Clic en "Start your project"

2. **Registrarse**
   - Clic en "Sign up"
   - Usar email y contraseña
   - O conectar con GitHub (recomendado)

3. **Verificar Email**
   - Revisar bandeja de entrada
   - Clic en enlace de verificación

---

## 🏗️ PASO 2: Crear Proyecto

1. **Nuevo Proyecto**
   - Clic en "New Project"
   - Si es tu primer proyecto, aparecerá automáticamente

2. **Configurar Proyecto**
   ```
   Nombre: compras-posadas
   Base de datos: [crear contraseña segura]
   Región: South America (São Paulo) - sa-east-1
   Plan: Free (para empezar)
   ```

3. **Esperar Creación**
   - El proceso toma 1-2 minutos
   - No cerrar la página

---

## 🗄️ PASO 3: Ejecutar Schema SQL

1. **Ir al SQL Editor**
   - En el menú izquierdo: "SQL Editor"
   - Clic en "New query"

2. **Copiar y Pegar SQL**
   - Abrir el archivo: `database/supabase-schema.sql`
   - Copiar TODO el contenido
   - Pegarlo en el editor de Supabase

3. **Ejecutar Script**
   - Clic en "Run" (botón verde)
   - Esperar confirmación: "Success. No rows returned"

4. **Verificar Tablas**
   - Ir a "Table Editor"
   - Deberías ver: categorias, tiendas, productos, usuarios, carrito, favoritos

---

## 🔑 PASO 4: Obtener Credenciales

1. **Ir a Configuración**
   - Menú izquierdo: "Settings"
   - Submenu: "API"

2. **Copiar Datos Importantes**
   ```
   Project URL: https://[tu-id-unico].supabase.co
   anon public: eyJ... [clave muy larga]
   service_role: eyJ... [clave muy larga - ¡MANTENER SECRETA!]
   ```

3. **Guardar Credenciales**
   - Anótalas en un lugar seguro
   - Las necesitarás en el siguiente paso

---

## ⚙️ PASO 5: Configurar en tu Proyecto

1. **Editar archivo de configuración**
   - Abrir: `assets/js/config/supabase.js`
   - Reemplazar estas líneas:

   ```javascript
   // ANTES:
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co'
   const SUPABASE_ANON_KEY = 'tu-clave-anonima-aqui'

   // DESPUÉS (con tus datos):
   const SUPABASE_URL = 'https://[tu-id-unico].supabase.co'
   const SUPABASE_ANON_KEY = 'eyJ[tu-clave-anonima-completa]'
   ```

2. **Guardar Cambios**
   - Ctrl+S para guardar
   - ¡Muy importante!

---

## 🧪 PASO 6: Probar Conexión

1. **Abrir tu Proyecto**
   - Abrir `index.html` en el navegador
   - O usar Live Server en VS Code

2. **Verificar Console**
   - F12 → Console
   - Deberías ver:
     ```
     📡 Cliente Supabase inicializado
     ✅ Supabase está listo
     📡 Cargando datos desde Supabase...
     ✅ Datos cargados: X productos, Y tiendas, Z categorías
     ```

3. **Verificar Datos**
   - Los productos deberían aparecer en la página
   - Sección "Productos Destacados" con datos

---

## 🔧 PASO 7: Configuraciones Adicionales

### 7.1 Storage para Imágenes (Opcional)

1. **Crear Bucket**
   - Ir a "Storage"
   - Clic "New bucket"
   - Nombre: `product-images`
   - Público: ✅

2. **Configurar Políticas**
   ```sql
   -- En SQL Editor, ejecutar:
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('product-images', 'product-images', true);
   
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
   ```

### 7.2 Autenticación (Opcional)

1. **Configurar Auth**
   - Ir a "Authentication" → "Settings"
   - Site URL: `http://localhost:3000` (para desarrollo)
   - Para producción: tu dominio real

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Configuración:
- [ ] ✅ Proyecto creado en Supabase
- [ ] ✅ Schema SQL ejecutado correctamente
- [ ] ✅ 6 tablas creadas (categorias, tiendas, productos, etc.)
- [ ] ✅ Datos de ejemplo insertados
- [ ] ✅ Credenciales copiadas y configuradas
- [ ] ✅ Archivo `supabase.js` actualizado
- [ ] ✅ Conexión exitosa desde el navegador
- [ ] ✅ Productos visibles en la página web

### Verificar Datos en Supabase:
1. **Table Editor → categorias**: 6 categorías
2. **Table Editor → tiendas**: 3 tiendas
3. **Table Editor → productos**: 5 productos

---

## 🚨 Solución de Problemas

### Error: "fetch is not defined"
- **Causa**: Proyecto no servido por HTTP
- **Solución**: Usar Live Server o servidor local

### Error: "Invalid API key"
- **Causa**: Clave copiada incorrectamente
- **Solución**: Re-copiar la clave completa desde Supabase

### Error: "CORS policy"
- **Causa**: Dominio no configurado
- **Solución**: Agregar dominio en Settings → API → CORS

### No aparecen datos
- **Causa**: RLS (Row Level Security) muy restrictivo
- **Solución**: Verificar políticas en SQL Editor

---

## 🎉 ¡Listo!

Tu proyecto ahora está conectado a Supabase y puede:
- ✅ Cargar productos dinámicamente
- ✅ Mostrar datos de tiendas reales
- ✅ Filtrar por categorías
- ✅ Escalar con miles de productos
- ✅ Tener administración en tiempo real

### Próximos Pasos:
1. Probar agregar productos desde el panel de vendedor
2. Configurar autenticación real de tiendas
3. Implementar upload de imágenes
4. Deploy a producción

### Soporte:
- Documentación: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues del proyecto