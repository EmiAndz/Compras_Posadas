# Configuración para Producción

## Para eliminar la advertencia de Tailwind CDN

### Opción 1: Instalar Tailwind CSS localmente
```bash
npm init -y
npm install -D tailwindcss
npx tailwindcss init
```

### Opción 2: Usar PostCSS (Recomendado)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Opción 3: Generar CSS compilado
```bash
npx tailwindcss -o assets/css/tailwind.css --watch
```

### Configuración tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Para desarrollo rápido (mantener CDN)
El CDN de Tailwind es perfecto para desarrollo y prototipado.
Solo genera la advertencia, pero funciona correctamente.

### Para producción
Reemplazar en el HTML:
```html
<!-- Remover: -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Agregar: -->
<link href="assets/css/tailwind.css" rel="stylesheet">
```