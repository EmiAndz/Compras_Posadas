# Sistema de Tiendas - Compras Posadas

## Archivos implementados

### Páginas HTML
- `tiendas.html` - Listado principal de tiendas con búsqueda y filtros
- `vendor.html` - Perfil individual de tienda con productos
- `ubicaciones.html` - Mapa y listado de ubicaciones de todas las tiendas

### Datos JSON
- `assets/data/stores.json` - 10 tiendas de ejemplo con información completa
- `assets/data/products.json` - 16 productos vinculados a las tiendas

### JavaScript
- `assets/js/tiendas.js` - Lógica para listado de tiendas
- `assets/js/vendor.js` - Lógica para perfil de tienda individual
- `assets/js/ubicaciones.js` - Lógica para página de ubicaciones

### CSS
- Se agregaron estilos completos en `assets/css/styles.css` (secciones "TIENDAS STYLES", "VENDOR STYLES" y "UBICACIONES STYLES")

### Navegación actualizada
- `index.html` - Enlaces de navegación actualizados para apuntar a `tiendas.html` y `ubicaciones.html`
- `assets/js/script.js` - Lógica de navegación activa actualizada para todas las páginas

## Funcionalidades implementadas

### Página de Tiendas (`tiendas.html`)
✅ Hero section con título y descripción  
✅ Barra de búsqueda por nombre/alias/barrio  
✅ Filtro por categoría (dinámico según datos)  
✅ Ordenamiento (alfabético, rating, fecha, precio)  
✅ Grid responsive (3 cols desktop / 2 tablet / 1 mobile)  
✅ Cards con logo, rating, precio, barrio, servicios  
✅ Status abierto/cerrado calculado por horarios  
✅ Botones: Ver tienda, WhatsApp, Google Maps  
✅ Paginación (12 tiendas por página)  
✅ Estados de carga y vacío  

### Página de Vendor (`vendor.html`)
✅ Breadcrumb de navegación  
✅ Hero con logo, nombre, rating, categorías  
✅ Información detallada (descripción, servicios, contacto)  
✅ Horarios de atención para toda la semana  
✅ Botones de contacto (WhatsApp, Maps, Sitio web)  
✅ Listado de productos filtrado por storeId  
✅ Búsqueda y filtro de productos  
✅ Manejo de errores (tienda no encontrada)  

### Página de Ubicaciones (`ubicaciones.html`)
✅ Header con navegación de regreso y toggle vista lista/mapa  
✅ Barra de búsqueda por nombre, barrio o dirección  
✅ Filtros por barrio y categoría (dinámicos)  
✅ Vista de lista con tarjetas de ubicación  
✅ Información completa de cada tienda (dirección, teléfono, horarios)  
✅ Estado abierto/cerrado en tiempo real  
✅ Servicios disponibles (delivery, retiro, garantía)  
✅ Botones de acción: Ver tienda, WhatsApp, Google Maps  
✅ Vista de mapa (placeholder para integración futura)  
✅ Estados de carga y vacío  
✅ Diseño responsivo con navegación inferior integrada  

### Responsive Design
✅ Mobile First approach  
✅ Breakpoints: 480px, 768px, 1024px  
✅ Grid adaptativo según pantalla  
✅ Navegación optimizada para móvil  

### Accesibilidad
✅ Aria-labels en elementos interactivos  
✅ Roles semánticos (navigation, search, etc.)  
✅ Focus visible en elementos  
✅ Alt text en imágenes  
✅ Estados aria-expanded para dropdowns  

### Integración con navegación existente
✅ Bottom navigation actualizada  
✅ Desktop navigation actualizada  
✅ Detección automática de página activa  
✅ Compatibilidad con sistema existente  

## Datos de ejemplo incluidos

### Tiendas (10 tiendas)
- VisãoVip Informática (Informática, Electrónica)
- ElectroMax (Electrónica, Celulares)  
- Bella Piel Cosmética (Cosmética, Perfumería)
- Outdoor Life (Camping, Deportes)
- Apple Misiones (Apple, Electrónica)
- Moda Urbana (Indumentaria, Calzado)
- Game Zone (Informática, Gaming)
- Mega Ofertas (Ofertas, Varios)
- Tech Plus (Informática, Electrónica)
- Fragancia VIP (Perfumería, Cosmética)

### Productos (16 productos)
Distribuidos entre las tiendas con categorías:
- Notebooks, Mini PC, Smartphones, Tablets
- Perfumes, Gaming, Componentes, Audio
- Camping, Monitores, etc.

## Próximos pasos para producción

### Imágenes de logos
1. Crear carpeta `img/logo/` si no existe
2. Agregar logos reales de las tiendas:
   - `visaovip.png`, `electromax.png`, `bellapiel.png`, etc.
3. Actualizar los placeholders CSS por imágenes reales

### Datos reales
1. Reemplazar `assets/data/stores.json` con datos reales
2. Actualizar `assets/data/products.json` con inventario real
3. Verificar coordenadas GPS para Google Maps

### Optimizaciones opcionales
1. Lazy loading para imágenes de productos
2. Cache de datos JSON en localStorage
3. Integración con API de backend
4. Sistema de favoritos para tiendas
5. Reseñas y calificaciones de usuarios

## Tecnologías utilizadas
- HTML5 semántico
- CSS3 con Grid y Flexbox
- JavaScript ES6+ (módulos, async/await, fetch)
- JSON para almacenamiento de datos
- Responsive design mobile-first
- Accesibilidad WCAG 2.1

## Estructura de archivos
```
/
├── tiendas.html
├── vendor.html
├── ubicaciones.html
├── assets/
│   ├── css/
│   │   └── styles.css (estilos agregados)
│   ├── js/
│   │   ├── tiendas.js (nuevo)
│   │   ├── vendor.js (nuevo)
│   │   ├── ubicaciones.js (nuevo)
│   │   └── script.js (actualizado)
│   └── data/
│       ├── stores.json (nuevo)
│       └── products.json (nuevo)
└── img/
    └── logo/ (pendiente crear logos)
```
