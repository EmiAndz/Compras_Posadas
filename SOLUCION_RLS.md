# 🔒 SOLUCIÓN: Error de Políticas RLS

## 🚨 **PROBLEMA**
Los errores que ves son por **Row Level Security (RLS)** en Supabase. Las políticas de seguridad están bloqueando:
- ❌ Subida de imágenes al Storage
- ❌ Creación de productos en la base de datos

## ✅ **SOLUCIÓN RÁPIDA**

### Opción 1: Desactivar RLS (MÁS FÁCIL)
```sql
-- En Supabase SQL Editor, ejecuta:
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiendas DISABLE ROW LEVEL SECURITY;
```

### Opción 2: Configurar Políticas (RECOMENDADO)
1. Ve a **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Ejecuta el archivo `CONFIGURAR_POLITICAS_RLS.sql`

## 🎯 **PASOS DETALLADOS:**

### 1. Acceder a Supabase
- Ve a [supabase.com](https://supabase.com)
- Entra a tu proyecto
- Ve a **SQL Editor**

### 2. Ejecutar el Script
- Abre el archivo `CONFIGURAR_POLITICAS_RLS.sql`
- Copia todo el contenido
- Pégalo en SQL Editor
- Haz clic en **"Run"**

### 3. Verificar Resultado
- Deberías ver: "Success. No rows returned"
- No debe haber errores rojos

## 🚀 **DESPUÉS DE CONFIGURAR:**

1. **Recarga** la página del formulario
2. **Prueba nuevamente** subir un producto con imagen
3. **Deberías ver**: "🎉 ¡Producto guardado exitosamente con imagen!"

## 🆘 **SI SIGUES CON PROBLEMAS:**

### Verificación rápida en SQL Editor:
```sql
-- Ver si RLS está activado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('productos', 'categorias', 'tiendas');

-- Ver políticas existentes
SELECT * FROM pg_policies 
WHERE tablename IN ('productos', 'categorias', 'tiendas');
```

### Solución de emergencia (desactivar todo):
```sql
-- SOLO SI NADA MÁS FUNCIONA
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiendas DISABLE ROW LEVEL SECURITY;

-- Para Storage (si sigue fallando)
-- Ve a Storage > Settings > Policies y desactiva RLS
```

## 📋 **CHECKLIST:**

- [ ] Ejecutar script de políticas RLS
- [ ] Verificar sin errores en SQL Editor  
- [ ] Recargar página del formulario
- [ ] Probar subir producto con imagen
- [ ] Verificar mensaje de éxito

¡Una vez configurado, tu formulario funcionará perfectamente! 🎉