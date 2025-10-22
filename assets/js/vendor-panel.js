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
            // Cargar productos
            const response = await fetch('assets/data/productos.json');
            const allProducts = await response.json();
            
            // Filtrar productos de la tienda actual
            this.products = allProducts.filter(p => p.tienda_id === this.currentStore.id);
            this.filteredProducts = [...this.products];

            // Cargar categorías para filtros
            const categoriesResponse = await fetch('assets/data/categorias.json');
            const categories = await categoriesResponse.json();
            this.populateCategories(categories);

        } catch (error) {
            console.error('Error cargando datos:', error);
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
        const select = document.getElementById('category-filter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.nombre;
            option.textContent = category.nombre;
            select.appendChild(option);
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
            const matchesCategory = !categoryFilter || product.categoria === categoryFilter;

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
                        ${product.categoria}
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
                            onclick="vendorPanel.editProduct(${product.id})"
                            class="text-blue-600 hover:text-blue-900"
                        >
                            Editar
                        </button>
                        <button 
                            onclick="vendorPanel.deleteProduct(${product.id})"
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
        document.getElementById('edit-precio').value = product.precio;
        document.getElementById('edit-stock').value = product.stock;
        document.getElementById('edit-destacado').checked = product.destacado;

        // Mostrar modal
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');
    }

    async handleEditSubmit(e) {
        e.preventDefault();

        const productId = parseInt(document.getElementById('edit-product-id').value);
        const updatedData = {
            nombre: document.getElementById('edit-nombre').value,
            precio: parseFloat(document.getElementById('edit-precio').value),
            stock: parseInt(document.getElementById('edit-stock').value),
            destacado: document.getElementById('edit-destacado').checked
        };

        try {
            // Actualizar producto en la lista local
            const productIndex = this.products.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                this.products[productIndex] = { ...this.products[productIndex], ...updatedData };
                
                // En una aplicación real, aquí se enviaría al servidor
                console.log('Producto actualizado:', this.products[productIndex]);
                
                // Actualizar UI
                this.filterProducts();
                this.updateStats();
                this.closeEditModal();
                
                // Mostrar confirmación
                this.showNotification('Producto actualizado exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            this.showNotification('Error al actualizar producto', 'error');
        }
    }

    deleteProduct(productId) {
        this.productToDelete = productId;
        document.getElementById('delete-modal').classList.remove('hidden');
        document.getElementById('delete-modal').classList.add('flex');
    }

    async confirmDelete() {
        try {
            // Eliminar de la lista local
            this.products = this.products.filter(p => p.id !== this.productToDelete);
            
            // En una aplicación real, aquí se enviaría al servidor
            console.log('Producto eliminado:', this.productToDelete);
            
            // Actualizar UI
            this.filterProducts();
            this.updateStats();
            this.closeDeleteModal();
            
            // Mostrar confirmación
            this.showNotification('Producto eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            this.showNotification('Error al eliminar producto', 'error');
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