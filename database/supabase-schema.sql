-- ===================================================
-- ESQUEMA DE BASE DE DATOS PARA COMPRAS POSADAS
-- Supabase PostgreSQL
-- ===================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================
-- TABLA: categorias
-- ===================================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(10),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- TABLA: tiendas
-- ===================================================
CREATE TABLE tiendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    logo VARCHAR(500),
    propietario VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    activa BOOLEAN DEFAULT true,
    verificada BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- TABLA: productos
-- ===================================================
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(12,2) NOT NULL CHECK (precio >= 0),
    imagen VARCHAR(500),
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    tienda_id UUID REFERENCES tiendas(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    destacado BOOLEAN DEFAULT false,
    especificaciones JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- TABLA: usuarios (para clientes)
-- ===================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255),
    apellido VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================
-- TABLA: carrito (persistente)
-- ===================================================
CREATE TABLE carrito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- ===================================================
-- TABLA: favoritos
-- ===================================================
CREATE TABLE favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- ===================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===================================================
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_tienda ON productos(tienda_id);
CREATE INDEX idx_productos_destacado ON productos(destacado) WHERE destacado = true;
CREATE INDEX idx_productos_activo ON productos(activo) WHERE activo = true;
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_stock ON productos(stock);
CREATE INDEX idx_productos_created_at ON productos(created_at);
CREATE INDEX idx_tiendas_activa ON tiendas(activa) WHERE activa = true;
CREATE INDEX idx_carrito_usuario ON carrito(usuario_id);
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);

-- ===================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ===================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===================================================
-- TRIGGERS PARA updated_at
-- ===================================================
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiendas_updated_at BEFORE UPDATE ON tiendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carrito_updated_at BEFORE UPDATE ON carrito
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- DATOS INICIALES - CATEGORÍAS
-- ===================================================
INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Electrónicos', 'Smartphones, laptops, tablets y accesorios', '📱'),
('Moda', 'Ropa, zapatos y accesorios de vestir', '👕'),
('Hogar', 'Muebles, decoración y artículos para el hogar', '🏠'),
('Belleza', 'Cosméticos, perfumes y cuidado personal', '💄'),
('Deportes', 'Ropa deportiva, equipamiento y accesorios', '⚽'),
('Libros', 'Literatura, educación y entretenimiento', '📚');

-- ===================================================
-- DATOS INICIALES - TIENDAS
-- ===================================================
INSERT INTO tiendas (nombre, descripcion, logo, propietario, email, telefono, direccion, verificada) VALUES
('TechStore', 'Electrónicos y tecnología', 'img/stores/techstore.jpg', 'Juan Pérez', 'juan@techstore.com', '3757-123456', 'Av. Libertad 123, Posadas', true),
('Moda & Estilo', 'Ropa y accesorios', 'img/stores/modaestilo.jpg', 'María González', 'maria@modaestilo.com', '3757-789012', 'San Martín 456, Posadas', true),
('Casa & Hogar', 'Artículos para el hogar', 'img/stores/casahogar.jpg', 'Carlos López', 'carlos@casahogar.com', '3757-345678', 'Córdoba 789, Posadas', true);

-- ===================================================
-- DATOS INICIALES - PRODUCTOS
-- ===================================================
INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, tienda_id, stock, destacado, especificaciones) 
SELECT 
    'Samsung Galaxy S25',
    'Smartphone de última generación con cámara de 108MP y 5G',
    899999,
    'img/products/samsung_s25.jpg',
    c.id,
    t.id,
    15,
    true,
    '{"pantalla": "6.8 pulgadas AMOLED", "memoria": "256GB", "ram": "12GB", "bateria": "5000mAh"}'::jsonb
FROM categorias c, tiendas t 
WHERE c.nombre = 'Electrónicos' AND t.email = 'juan@techstore.com';

INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, tienda_id, stock, destacado, especificaciones) 
SELECT 
    'Notebook Gamer HP',
    'Laptop gaming con RTX 4060 y procesador Intel i7',
    1299999,
    'img/products/notebook.jpg',
    c.id,
    t.id,
    8,
    false,
    '{"procesador": "Intel i7-12700H", "grafica": "RTX 4060", "ram": "16GB DDR5", "almacenamiento": "1TB SSD"}'::jsonb
FROM categorias c, tiendas t 
WHERE c.nombre = 'Electrónicos' AND t.email = 'juan@techstore.com';

INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, tienda_id, stock, destacado, especificaciones) 
SELECT 
    'Auriculares Bluetooth',
    'Auriculares inalámbricos con cancelación de ruido',
    89999,
    'img/products/auriculares.jpg',
    c.id,
    t.id,
    25,
    true,
    '{"autonomia": "30 horas", "conectividad": "Bluetooth 5.2", "cancelacion_ruido": "Activa", "resistencia": "IPX4"}'::jsonb
FROM categorias c, tiendas t 
WHERE c.nombre = 'Electrónicos' AND t.email = 'juan@techstore.com';

INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, tienda_id, stock, destacado, especificaciones) 
SELECT 
    'Perfume Yves Saint Laurent',
    'Fragancia premium para mujer, 100ml',
    129999,
    'img/products/yves.png',
    c.id,
    t.id,
    12,
    true,
    '{"volumen": "100ml", "tipo": "Eau de Parfum", "familia_olfativa": "Floral Oriental", "duracion": "8-10 horas"}'::jsonb
FROM categorias c, tiendas t 
WHERE c.nombre = 'Belleza' AND t.email = 'maria@modaestilo.com';

INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, tienda_id, stock, destacado, especificaciones) 
SELECT 
    'Smartphone Básico',
    'Teléfono básico con buena relación calidad-precio',
    199999,
    'img/products/smartphone.jpg',
    c.id,
    t.id,
    20,
    false,
    '{"pantalla": "6.1 pulgadas LCD", "memoria": "64GB", "ram": "4GB", "bateria": "4000mAh"}'::jsonb
FROM categorias c, tiendas t 
WHERE c.nombre = 'Electrónicos' AND t.email = 'carlos@casahogar.com';

-- ===================================================
-- POLÍTICAS RLS (Row Level Security)
-- ===================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas para categorías (lectura pública)
CREATE POLICY "Categorías son visibles para todos" ON categorias
    FOR SELECT USING (activa = true);

-- Políticas para tiendas (lectura pública de tiendas activas)
CREATE POLICY "Tiendas activas son visibles para todos" ON tiendas
    FOR SELECT USING (activa = true);

CREATE POLICY "Tiendas pueden actualizar su perfil" ON tiendas
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para productos (lectura pública de productos activos)
CREATE POLICY "Productos activos son visibles para todos" ON productos
    FOR SELECT USING (activo = true);

CREATE POLICY "Tiendas pueden gestionar sus productos" ON productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tiendas 
            WHERE tiendas.id = productos.tienda_id 
            AND auth.uid()::text = tiendas.id::text
        )
    );

-- Políticas para usuarios (solo el usuario puede ver/editar sus datos)
CREATE POLICY "Usuarios pueden ver su perfil" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Usuarios pueden actualizar su perfil" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para carrito (solo el usuario puede ver/gestionar su carrito)
CREATE POLICY "Usuarios pueden gestionar su carrito" ON carrito
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Políticas para favoritos (solo el usuario puede ver/gestionar sus favoritos)
CREATE POLICY "Usuarios pueden gestionar sus favoritos" ON favoritos
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- ===================================================
-- FUNCIONES ÚTILES
-- ===================================================

-- Función para buscar productos
CREATE OR REPLACE FUNCTION buscar_productos(
    termino TEXT DEFAULT '',
    categoria_filtro UUID DEFAULT NULL,
    tienda_filtro UUID DEFAULT NULL,
    solo_destacados BOOLEAN DEFAULT false,
    limite_resultados INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    nombre VARCHAR,
    descripcion TEXT,
    precio DECIMAL,
    imagen VARCHAR,
    categoria_nombre VARCHAR,
    tienda_nombre VARCHAR,
    stock INTEGER,
    destacado BOOLEAN,
    especificaciones JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.imagen,
        c.nombre as categoria_nombre,
        t.nombre as tienda_nombre,
        p.stock,
        p.destacado,
        p.especificaciones
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN tiendas t ON p.tienda_id = t.id
    WHERE 
        p.activo = true
        AND t.activa = true
        AND c.activa = true
        AND (termino = '' OR p.nombre ILIKE '%' || termino || '%' OR p.descripcion ILIKE '%' || termino || '%')
        AND (categoria_filtro IS NULL OR p.categoria_id = categoria_filtro)
        AND (tienda_filtro IS NULL OR p.tienda_id = tienda_filtro)
        AND (solo_destacados = false OR p.destacado = true)
    ORDER BY 
        p.destacado DESC,
        p.created_at DESC
    LIMIT limite_resultados;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- COMENTARIOS FINALES
-- ===================================================
COMMENT ON DATABASE postgres IS 'Base de datos para Compras Posadas - Plataforma de comparación de precios';
COMMENT ON TABLE categorias IS 'Categorías de productos disponibles';
COMMENT ON TABLE tiendas IS 'Tiendas registradas en la plataforma';
COMMENT ON TABLE productos IS 'Productos ofrecidos por las tiendas';
COMMENT ON TABLE usuarios IS 'Usuarios registrados (clientes)';
COMMENT ON TABLE carrito IS 'Carrito de compras persistente por usuario';
COMMENT ON TABLE favoritos IS 'Lista de productos favoritos por usuario';