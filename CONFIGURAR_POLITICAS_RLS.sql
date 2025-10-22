-- =====================================================
-- CONFIGURACIÓN DE POLÍTICAS RLS PARA COMPRAS POSADAS
-- =====================================================

-- =========== POLÍTICAS PARA STORAGE (IMÁGENES) ===========

-- 1. Permitir INSERT (subida) de imágenes para todos
CREATE POLICY "Allow public image uploads" ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'productos');

-- 2. Permitir SELECT (lectura) de imágenes para todos  
CREATE POLICY "Allow public image access" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'productos');

-- 3. Permitir UPDATE de imágenes para todos
CREATE POLICY "Allow public image updates" ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'productos');

-- 4. Permitir DELETE de imágenes para todos
CREATE POLICY "Allow public image deletes" ON storage.objects 
FOR DELETE 
USING (bucket_id = 'productos');

-- =========== POLÍTICAS PARA TABLA PRODUCTOS ===========

-- 1. Permitir INSERT (crear) productos para todos
CREATE POLICY "Allow public product creation" ON public.productos 
FOR INSERT 
WITH CHECK (true);

-- 2. Permitir SELECT (leer) productos para todos
CREATE POLICY "Allow public product reading" ON public.productos 
FOR SELECT 
USING (true);

-- 3. Permitir UPDATE productos para todos
CREATE POLICY "Allow public product updates" ON public.productos 
FOR UPDATE 
USING (true);

-- 4. Permitir DELETE productos para todos  
CREATE POLICY "Allow public product deletes" ON public.productos 
FOR DELETE 
USING (true);

-- =========== POLÍTICAS PARA OTRAS TABLAS ===========

-- Categorías (lectura pública)
CREATE POLICY "Allow public category reading" ON public.categorias 
FOR SELECT 
USING (true);

-- Tiendas (lectura pública)  
CREATE POLICY "Allow public store reading" ON public.tiendas 
FOR SELECT 
USING (true);

-- =========== ACTIVAR RLS EN LAS TABLAS ===========

-- Asegurar que RLS esté activado
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ve a tu proyecto Supabase
-- 2. Ve a SQL Editor
-- 3. Pega y ejecuta este script completo
-- 4. Verifica que no hay errores
-- 5. Prueba nuevamente el formulario
-- =====================================================

-- =========== VERIFICACIÓN (OPCIONAL) ===========
-- Ejecutar después del script principal para verificar:

-- Ver políticas de Storage
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Ver políticas de productos  
SELECT * FROM pg_policies WHERE tablename = 'productos' AND schemaname = 'public';

-- Ver políticas de categorias
SELECT * FROM pg_policies WHERE tablename = 'categorias' AND schemaname = 'public';

-- Ver políticas de tiendas
SELECT * FROM pg_policies WHERE tablename = 'tiendas' AND schemaname = 'public';