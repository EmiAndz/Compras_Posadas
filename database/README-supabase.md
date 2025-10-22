# Configuración de Supabase para Compras Posadas

## Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-servicio-aqui
```

## Instalación

### Opción 1: CDN (Recomendada para este proyecto)
Agregar en el `<head>` de tus archivos HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Opción 2: NPM (Para proyectos con bundler)
```bash
npm install @supabase/supabase-js
```

## Configuración del Cliente

### Para archivos HTML (usando CDN):
```javascript
// config/supabase.js
const SUPABASE_URL = 'https://ckcbzeizzjhnbhdaenrg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY2J6ZWl6empobmJoZGFlbnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjI5NDAsImV4cCI6MjA3NTYzODk0MH0.YKgnKRG4UdS2BQPyzjIhe7wtXufIxr_p6drnurQyE_U'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

### Para proyectos con módulos:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## Pasos para Configurar Supabase

### 1. Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Clic en "New Project"
4. Elige organización y nombre: "compras-posadas"
5. Crea contraseña para la base de datos
6. Selecciona región más cercana (São Paulo)

### 2. Ejecutar Script SQL
1. En el dashboard de Supabase, ve a "SQL Editor"
2. Copia y pega el contenido de `database/supabase-schema.sql`
3. Ejecuta el script completo
4. Verifica que se crearon las tablas en "Table Editor"

### 3. Obtener Credenciales
1. Ve a "Settings" → "API"
2. Copia la "Project URL"
3. Copia la "anon public" key
4. Guarda estas credenciales de forma segura

### 4. Configurar Autenticación
1. Ve a "Authentication" → "Settings"
2. Habilita "Enable email confirmations" (opcional)
3. Configura "Site URL": tu dominio de producción
4. En "Auth Providers", configura los que necesites

### 5. Configurar Storage (Para imágenes)
1. Ve a "Storage"
2. Crea un bucket llamado "products"
3. Configura políticas de acceso público para lectura
4. Crea carpetas: "products/", "stores/", "categories/"

## Estructura de Carpetas Recomendada

```
/
├── assets/
│   ├── js/
│   │   ├── config/
│   │   │   └── supabase.js       # Configuración
│   │   ├── services/
│   │   │   ├── productService.js # CRUD productos
│   │   │   ├── storeService.js   # CRUD tiendas
│   │   │   ├── authService.js    # Autenticación
│   │   │   └── uploadService.js  # Subida archivos
│   │   └── utils/
│   │       └── helpers.js        # Funciones útiles
├── database/
│   ├── supabase-schema.sql       # Schema completo
│   ├── migrations/               # Migraciones futuras
│   └── seeds/                    # Datos de prueba
└── .env                          # Variables de entorno
```

## Políticas de Seguridad (RLS)

El schema incluye Row Level Security configurado:

- **Lectura pública**: Categorías, tiendas activas, productos activos
- **Gestión de tienda**: Solo el propietario puede editar sus productos
- **Datos de usuario**: Solo el usuario puede ver/editar sus datos
- **Carrito y favoritos**: Privados por usuario

## Próximos Pasos

1. ✅ Ejecutar el schema SQL en Supabase
2. ✅ Obtener credenciales del proyecto
3. 🔄 Configurar cliente JavaScript
4. 🔄 Migrar funciones JSON a Supabase
5. 🔄 Implementar autenticación real
6. 🔄 Configurar upload de imágenes

## Comandos Útiles

### Verificar conexión:
```javascript
const { data, error } = await supabase
  .from('categorias')
  .select('*')
  .limit(1)

console.log('Conexión exitosa:', data)
```

### Insertar producto:
```javascript
const { data, error } = await supabase
  .from('productos')
  .insert([
    {
      nombre: 'Producto de prueba',
      descripcion: 'Descripción del producto',
      precio: 99999,
      tienda_id: 'uuid-de-tienda',
      categoria_id: 'uuid-de-categoria'
    }
  ])
```