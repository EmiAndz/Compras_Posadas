// Panel de administración para vendedores
class VendorPanel {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentStore = null;
        this.productToDelete = null;
        this.init();
    }

    async init() {
        // Verificar autenticación
        if (!AuthManager.requireAuth()) {
            return;
        }

        this.currentStore = AuthManager.getCurrentStore();
        await this.loadData();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadData() {
        try {
            console.log('🔄 Cargando datos desde Supabase...');
            
            // Usar el UUID de Supabase directamente
            let storeId = this.currentStore.supabase_id || this.currentStore.id;
            console.log('📍 Usando Store ID:', storeId, 'para tienda:', this.currentStore.nombre);
            
            // Cargar productos de la tienda desde Supabase
            const productsResult = await SimpleSupabaseService.getProductsByStore(storeId);
            if (productsResult.success) {
                this.products = productsResult.data;
                this.filteredProducts = [...this.products];
                console.log(`✅ ${this.products.length} productos cargados para tienda ${this.currentStore.nombre}`);
                
                // Debug: Verificar estructura de productos
                if (this.products.length > 0) {
                    console.log('🔍 Estructura del primer producto:', this.products[0]);
                    console.log('🏷️ Categoría del primer producto:', this.products[0].categorias);
                }
            } else {
                console.error('❌ Error cargando productos:', productsResult.error);
                this.products = [];
                this.filteredProducts = [];
            }

            // Cargar categorías desde Supabase
            const categoriesResult = await SimpleSupabaseService.getAllCategories();
            if (categoriesResult.success) {
                this.populateCategories(categoriesResult.data);
                console.log('✅ Categorías cargadas desde Supabase');
            } else {
                console.error('❌ Error cargando categorías:', categoriesResult.error);
            }

        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    }

    setupEventListeners() {
        // Búsqueda
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterProducts();
        });

        // Filtros
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterProducts();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterProducts();
        });

        // Formulario de edición
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            this.handleEditSubmit(e);
        });
    }

    updateUI() {
        // Actualizar nombre de tienda
        document.getElementById('store-name').textContent = this.currentStore.nombre;

        // Actualizar estadísticas
        this.updateStats();

        // Actualizar tabla de productos
        this.renderProducts();
    }

    updateStats() {
        const totalProducts = this.products.length;
        const inStock = this.products.filter(p => p.stock > 0).length;
        const featured = this.products.filter(p => p.destacado).length;
        const outStock = this.products.filter(p => p.stock === 0).length;

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('in-stock').textContent = inStock;
        document.getElementById('featured').textContent = featured;
        document.getElementById('out-stock').textContent = outStock;
    }

    populateCategories(categories) {
        // Llenar filtro de categorías
        const selectFilter = document.getElementById('category-filter');
        selectFilter.innerHTML = '<option value="">Todas las categorías</option>';
        
        // Llenar select del modal de edición
        const selectEdit = document.getElementById('edit-categoria');
        selectEdit.innerHTML = '<option value="">Seleccionar categoría</option>';
        
        categories.forEach(category => {
            // Opción para filtro
            const optionFilter = document.createElement('option');
            optionFilter.value = category.nombre;
            optionFilter.textContent = category.nombre;
            selectFilter.appendChild(optionFilter);
            
            // Opción para edición
            const optionEdit = document.createElement('option');
            optionEdit.value = category.id;
            optionEdit.textContent = category.nombre;
            selectEdit.appendChild(optionEdit);
        });
    }

    filterProducts() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        this.filteredProducts = this.products.filter(product => {
            // Filtro de búsqueda
            const matchesSearch = product.nombre.toLowerCase().includes(searchTerm) ||
                                product.descripcion.toLowerCase().includes(searchTerm);

            // Filtro de categoría
            const productCategory = product.categorias ? product.categorias.nombre : (product.categoria || '');
            const matchesCategory = !categoryFilter || productCategory === categoryFilter;

            // Filtro de estado
            let matchesStatus = true;
            if (statusFilter === 'in-stock') {
                matchesStatus = product.stock > 0;
            } else if (statusFilter === 'out-stock') {
                matchesStatus = product.stock === 0;
            } else if (statusFilter === 'featured') {
                matchesStatus = product.destacado;
            }

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.renderProducts();
    }

    renderProducts() {
        const tbody = document.getElementById('products-table');
        const emptyState = document.getElementById('empty-state');

        if (this.filteredProducts.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        tbody.innerHTML = this.filteredProducts.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img 
                                class="h-10 w-10 rounded-lg object-cover" 
                                src="${product.imagen}" 
                                alt="${product.nombre}"
                                onerror="this.src='img/products/default.jpg'"
                            >
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${product.nombre}</div>
                            <div class="text-sm text-gray-500">${product.descripcion.substring(0, 50)}...</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        ${product.categorias ? product.categorias.nombre : (product.categoria || 'Sin categoría')}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $${product.precio.toLocaleString('es-AR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">${product.stock}</span>
                    ${product.stock === 0 ? '<span class="ml-2 text-xs text-red-600">Sin stock</span>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                        ${product.destacado ? '<span class="text-yellow-500">⭐</span>' : ''}
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">
                            ${product.stock > 0 ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button 
                            onclick="vendorPanel.editProduct('${product.id}')"
                            class="text-blue-600 hover:text-blue-900"
                        >
                            Editar
                        </button>
                        <button 
                            onclick="vendorPanel.deleteProduct('${product.id}')"
                            class="text-red-600 hover:text-red-900"
                        >
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Llenar formulario de edición
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-nombre').value = product.nombre;
        document.getElementById('edit-descripcion').value = product.descripcion || '';
        document.getElementById('edit-precio').value = product.precio;
        document.getElementById('edit-stock').value = product.stock;
        document.getElementById('edit-destacado').checked = product.destacado;

        // Seleccionar categoría
        if (product.categorias && product.categorias.id) {
            console.log('🏷️ Seleccionando categoría desde relación:', product.categorias.id, product.categorias.nombre);
            document.getElementById('edit-categoria').value = product.categorias.id;
        } else if (product.categoria_id) {
            console.log('🏷️ Seleccionando categoría desde ID directo:', product.categoria_id);
            document.getElementById('edit-categoria').value = product.categoria_id;
        } else {
            console.warn('⚠️ No se encontró categoría para el producto');
        }

        // Mostrar modal
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');
    }

    async handleEditSubmit(e) {
        e.preventDefault();

        const productId = document.getElementById('edit-product-id').value;
        const categoriaValue = document.getElementById('edit-categoria').value;
        
        // Validar que se seleccionó una categoría
        if (!categoriaValue) {
            this.showNotification('Debes seleccionar una categoría', 'error');
            return;
        }

        const updatedData = {
            nombre: document.getElementById('edit-nombre').value,
            descripcion: document.getElementById('edit-descripcion').value || '',
            precio: parseFloat(document.getElementById('edit-precio').value),
            categoria_id: categoriaValue, // Mantener como string (UUID)
            stock: parseInt(document.getElementById('edit-stock').value),
            destacado: document.getElementById('edit-destacado').checked
        };

        try {
            console.log('📝 Actualizando producto en Supabase:', productId);
            console.log('📋 Datos a actualizar:', updatedData);

            const result = await SimpleSupabaseService.updateProduct(productId, updatedData);
            
            if (result.success) {
                // Actualizar producto en la lista local
                const productIndex = this.products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    // Recargar datos desde Supabase para tener datos actualizados
                    await this.loadData();
                }
                
                // Actualizar UI
                this.updateUI();
                this.closeEditModal();
                
                // Mostrar confirmación
                this.showNotification('Producto actualizado exitosamente', 'success');
                console.log('✅ Producto actualizado exitosamente');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Error actualizando producto:', error);
            this.showNotification('Error al actualizar producto: ' + error.message, 'error');
        }
    }

    deleteProduct(productId) {
        this.productToDelete = productId;
        document.getElementById('delete-modal').classList.remove('hidden');
        document.getElementById('delete-modal').classList.add('flex');
    }

    async confirmDelete() {
        try {
            console.log('🗑️ Eliminando producto desde Supabase:', this.productToDelete);

            const result = await SimpleSupabaseService.deleteProduct(this.productToDelete);
            
            if (result.success) {
                // Eliminar de la lista local
                this.products = this.products.filter(p => p.id !== this.productToDelete);
                
                // Actualizar UI
                this.filterProducts();
                this.updateStats();
                this.closeDeleteModal();
                
                // Mostrar confirmación
                this.showNotification('Producto eliminado exitosamente', 'success');
                console.log('✅ Producto eliminado exitosamente');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            this.showNotification('Error al eliminar producto: ' + error.message, 'error');
        }
    }

    closeEditModal() {
        document.getElementById('edit-modal').classList.add('hidden');
        document.getElementById('edit-modal').classList.remove('flex');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        document.getElementById('delete-modal').classList.remove('flex');
        this.productToDelete = null;
    }

    showNotification(message, type = 'info') {
        // Crear notificación simple (en una app real usarías una librería)
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-md text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Funciones globales
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('status-filter').value = '';
    vendorPanel.filterProducts();
}

function closeEditModal() {
    vendorPanel.closeEditModal();
}

function closeDeleteModal() {
    vendorPanel.closeDeleteModal();
}

function confirmDelete() {
    vendorPanel.confirmDelete();
}

// Instancia global
let vendorPanel;

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    vendorPanel = new VendorPanel();
});