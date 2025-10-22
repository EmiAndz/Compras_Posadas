// Gestión de productos - Formulario
class ProductManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.setupEventListeners();
        this.setupImagePreview();
    }

    // Cargar categorías desde Supabase
    async loadCategories() {
        try {
            console.log('🔄 Iniciando carga de categorías...');
            
            // Esperar a que Supabase esté disponible
            await this.waitForSupabase();
            console.log('✅ Supabase disponible, obteniendo categorías...');
            
            const result = await window.SimpleSupabaseService.getAllCategories();
            if (result.success) {
                const categorias = result.data;
                console.log('📦 Categorías obtenidas:', categorias);
                
                const selectElement = document.getElementById('categoria');
                if (!selectElement) {
                    console.error('❌ Elemento select de categoría no encontrado');
                    return;
                }
                
                selectElement.innerHTML = '<option value="">Seleccionar categoría</option>';
                
                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id; // Usar ID en lugar de nombre
                    option.textContent = `${categoria.icono || '📦'} ${categoria.nombre}`;
                    selectElement.appendChild(option);
                    console.log(`➕ Categoría agregada: ${categoria.nombre} (ID: ${categoria.id})`);
                });
                
                console.log(`✅ ${categorias.length} categorías cargadas exitosamente en el select`);
            } else {
                throw new Error('No se pudieron cargar las categorías: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
            this.showError('Error cargando categorías. Verifica tu conexión a Supabase.');
            
            // Fallback: agregar categorías básicas para testing
            this.loadFallbackCategories();
        }
    }

    // Categorías de fallback para testing
    loadFallbackCategories() {
        console.log('🔄 Cargando categorías de fallback...');
        
        const selectElement = document.getElementById('categoria');
        if (!selectElement) return;
        
        const fallbackCategories = [
            { id: 'electronics', nombre: 'Electrónicos', icono: '📱' },
            { id: 'fashion', nombre: 'Moda', icono: '👕' },
            { id: 'home', nombre: 'Hogar', icono: '🏠' },
            { id: 'beauty', nombre: 'Belleza', icono: '💄' },
            { id: 'sports', nombre: 'Deportes', icono: '⚽' }
        ];
        
        selectElement.innerHTML = '<option value="">Seleccionar categoría</option>';
        fallbackCategories.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = `${categoria.icono} ${categoria.nombre}`;
            selectElement.appendChild(option);
        });
        
        console.log('✅ Categorías de fallback cargadas');
    }

    // Esperar a que Supabase esté disponible
    async waitForSupabase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.SimpleSupabaseService) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Supabase no está disponible');
    }

    // Configurar event listeners
    setupEventListeners() {
        const form = document.getElementById('product-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Listener para el archivo de imagen
        document.getElementById('imagen').addEventListener('change', (e) => {
            this.handleImageSelection(e);
        });
    }

    // Manejar selección de imagen
    handleImageSelection(e) {
        const file = e.target.files[0];
        const fileName = document.getElementById('file-name');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        
        console.log('📷 Archivo seleccionado:', file);
        
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                this.showError('Por favor selecciona un archivo de imagen válido.');
                e.target.value = '';
                fileName.textContent = 'Ningún archivo seleccionado';
                imagePreview.classList.add('hidden');
                return;
            }
            
            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showError('La imagen no puede ser mayor a 5MB.');
                e.target.value = '';
                fileName.textContent = 'Ningún archivo seleccionado';
                imagePreview.classList.add('hidden');
                return;
            }
            
            // Actualizar nombre del archivo
            fileName.textContent = file.name;
            fileName.classList.remove('text-gray-500');
            fileName.classList.add('text-green-600');
            
            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            fileName.textContent = 'Ningún archivo seleccionado';
            fileName.classList.remove('text-green-600');
            fileName.classList.add('text-gray-500');
            imagePreview.classList.add('hidden');
        }
    }

    // Vista previa de imagen
    setupImagePreview() {
        // La vista previa se maneja en handleImageSelection
        // Esto mantiene compatibilidad con código existente
    }

    // Manejar envío del formulario
    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const formData = this.getFormData();
            
            // Validar datos
            if (!this.validateProduct(formData)) {
                return;
            }

            // Simular guardado (en una aplicación real, esto iría a un servidor)
            await this.saveProduct(formData);
            
            // Mostrar mensaje de éxito
            this.showSuccessModal();
            
            // Limpiar formulario
            this.resetForm();
            
        } catch (error) {
            console.error('Error al guardar producto:', error);
            this.showError('Error al guardar el producto. Inténtalo nuevamente.');
        }
    }

    // Obtener datos del formulario
    getFormData() {
        const form = document.getElementById('product-form');
        const formData = new FormData(form);
        
        // Obtener especificaciones
        const especificaciones = this.getSpecifications();
        
        const producto = {
            id: Date.now(), // ID temporal
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            precio: parseFloat(formData.get('precio')),
            categoria: formData.get('categoria'),
            stock: parseInt(formData.get('stock')),
            destacado: formData.get('destacado') === 'on',
            imagen: this.getImagePath(formData.get('imagen')),
            especificaciones: especificaciones,
            tienda_id: this.getCurrentStoreId(), // Obtener de la sesión
            fecha_agregado: new Date().toISOString().split('T')[0]
        };

        return producto;
    }

    // Obtener especificaciones del producto
    getSpecifications() {
        const container = document.getElementById('especificaciones-container');
        const rows = container.querySelectorAll('div');
        const especificaciones = {};
        
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length === 2) {
                const key = inputs[0].value.trim();
                const value = inputs[1].value.trim();
                if (key && value) {
                    especificaciones[key.toLowerCase().replace(/\s+/g, '_')] = value;
                }
            }
        });
        
        return especificaciones;
    }

    // Obtener ruta de imagen (simulado)
    getImagePath(file) {
        if (file && file.name) {
            // En una aplicación real, aquí se subiría la imagen a un servidor
            return `img/products/${file.name}`;
        }
        return 'img/products/default.jpg';
    }

    // Obtener ID de tienda actual
    getCurrentStoreId() {
        // En una aplicación real, esto vendría de la sesión del usuario autenticado
        // Por ahora, vamos a usar el UUID real de TechStore desde Supabase
        const savedStoreId = localStorage.getItem('currentStoreId');
        
        // Si hay un ID guardado, usarlo, sino usar el UUID real de TechStore
        if (savedStoreId && savedStoreId.length > 10) {
            return savedStoreId;
        }
        
        // UUID real de TechStore desde tu base de datos Supabase
        return '6e899453-08c8-4b2a-a6d1-393fc5b0ae73'; 
    }

    // Validar producto
    validateProduct(producto) {
        if (!producto.nombre || producto.nombre.length < 3) {
            this.showError('El nombre del producto debe tener al menos 3 caracteres.');
            return false;
        }

        if (!producto.precio || producto.precio <= 0) {
            this.showError('El precio debe ser mayor a 0.');
            return false;
        }

        if (!producto.categoria) {
            this.showError('Debes seleccionar una categoría.');
            return false;
        }

        if (!producto.stock || producto.stock < 0) {
            this.showError('El stock debe ser 0 o mayor.');
            return false;
        }

        if (!producto.descripcion || producto.descripcion.length < 10) {
            this.showError('La descripción debe tener al menos 10 caracteres.');
            return false;
        }

        return true;
    }

    // Guardar producto en Supabase
    async saveProduct(producto) {
        try {
            console.log('💾 Guardando producto en Supabase...', producto);
            
            let imageUrl = null;
            
            // Intentar subir imagen si está seleccionada
            const imageInput = document.getElementById('imagen');
            if (imageInput.files && imageInput.files[0]) {
                console.log('📤 Subiendo imagen a Supabase Storage...');
                const file = imageInput.files[0];
                
                try {
                    const imageResult = await window.SimpleSupabaseService.uploadProductImage(file, producto.nombre);
                    
                    if (imageResult.success) {
                        imageUrl = imageResult.url;
                        console.log('✅ Imagen subida exitosamente:', imageUrl);
                        this.showSuccess('📷 Imagen subida correctamente a Storage');
                    } else {
                        console.warn('⚠️ No se pudo subir la imagen:', imageResult.error);
                        
                        if (imageResult.needsBucket) {
                            this.showError('❌ Bucket "productos" no encontrado. Verifica la configuración de Storage.');
                            return; // No continuar si falta el bucket
                        } else {
                            this.showSuccess('⚠️ Producto se guardará sin imagen (error de Storage)');
                        }
                    }
                } catch (storageError) {
                    console.warn('⚠️ Error de Storage:', storageError);
                    this.showSuccess('⚠️ Producto se guardará sin imagen (Storage no disponible)');
                }
            }
            
            // Preparar datos para Supabase según el esquema
            const productData = {
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                categoria_id: producto.categoria,
                tienda_id: this.getCurrentStoreId(),
                stock: producto.stock,
                destacado: producto.destacado,
                imagen: imageUrl || null, // NULL si no hay imagen
                especificaciones: producto.especificaciones
            };

            console.log('💾 Guardando producto en base de datos...', productData);

            // Usar el servicio de Supabase para crear el producto
            const result = await window.SimpleSupabaseService.createProduct(productData);
            
            if (result.success) {
                console.log('✅ Producto guardado exitosamente en Supabase:', result.data);
                
                if (imageUrl) {
                    this.showSuccess('🎉 ¡Producto guardado exitosamente con imagen!');
                } else {
                    this.showSuccess('✅ ¡Producto guardado exitosamente!');
                }
                
                return result.data;
            } else {
                throw new Error(result.error || 'Error guardando producto');
            }
            
        } catch (error) {
            console.error('❌ Error guardando producto en Supabase:', error);
            this.showError(`Error guardando producto: ${error.message}`);
            throw error;
        }
    }

    // Mostrar modal de éxito
    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    // Mostrar error
    showError(message) {
        // Crear toast de error
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">❌</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Mostrar mensaje de éxito
    showSuccess(message) {
        // Crear toast de éxito
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">✅</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Limpiar formulario
    resetForm() {
        document.getElementById('product-form').reset();
        document.getElementById('file-name').textContent = 'Ningún archivo seleccionado';
        document.getElementById('image-preview').classList.add('hidden');
        
        // Limpiar especificaciones
        const container = document.getElementById('especificaciones-container');
        container.innerHTML = `
            <div class="flex space-x-2">
                <input 
                    type="text" 
                    placeholder="Característica (ej: Pantalla)"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <input 
                    type="text" 
                    placeholder="Valor (ej: 6.8 pulgadas)"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <button 
                    type="button" 
                    onclick="removeSpecification(this)"
                    class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                    ✕
                </button>
            </div>
        `;
    }
}

// Funciones globales para especificaciones
function addSpecification() {
    const container = document.getElementById('especificaciones-container');
    const newRow = document.createElement('div');
    newRow.className = 'flex space-x-2';
    newRow.innerHTML = `
        <input 
            type="text" 
            placeholder="Característica"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <input 
            type="text" 
            placeholder="Valor"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <button 
            type="button" 
            onclick="removeSpecification(this)"
            class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
        >
            ✕
        </button>
    `;
    container.appendChild(newRow);
}

function removeSpecification(button) {
    const container = document.getElementById('especificaciones-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Redirigir al panel de administración
    window.location.href = 'panel-vendedor.html';
}

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    new ProductManager();
});