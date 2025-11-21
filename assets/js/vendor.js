/**
 * VENDOR.JS - Lógica para la página de perfil de tienda
 * Maneja la carga de información de tienda individual y sus productos desde Supabase
 */

// Estado global de la aplicación vendor
const VendorApp = {
  storeId: null,
  store: null,
  products: [],
  filteredProducts: [],
  currentPage: 1,
  itemsPerPage: 12,
  filters: {
    search: '',
    category: '',
    sort: 'name'
  },

  // Elementos del DOM
  elements: {
    vendorLoading: null,
    vendorError: null,
    vendorContent: null,
    storeBreadcrumb: null,
    storeLogo: null,
    storeName: null,
    storeAlias: null,
    storeCategories: null,
    storeRating: null,
    storeRatingValue: null,
    storeNeighborhood: null,
    storeStatus: null,
    storeDescription: null,
    contactWhatsApp: null,
    viewOnMaps: null,
    vendorSearch: null,
    categoryFilter: null,
    sortFilter: null,
    productsLoading: null,
    productsGrid: null,
    emptyProducts: null,
    productsPagination: null,
    prevProductsPage: null,
    nextProductsPage: null,
    productsPageInfo: null
  },

  // Inicialización
  async init() {
    try {
      this.extractStoreId();
      this.initElements();
      this.bindEvents();
      
      // Esperar a que Supabase esté disponible
      await this.waitForSupabase();
      
      await this.loadStoreData();
      await this.loadProducts();
      this.renderStore();
      this.renderProducts();
    } catch (error) {
      console.error('Error inicializando vendor:', error);
      this.showError(error.message);
    }
  },

  // Esperar a que Supabase esté disponible
  async waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!window.supabaseClient && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.supabaseClient) {
      throw new Error('Supabase no está disponible');
    }
  },

  // Extraer ID de tienda de la URL
  extractStoreId() {
    const urlParams = new URLSearchParams(window.location.search);
    this.storeId = urlParams.get('id');
    
    if (!this.storeId) {
      throw new Error('ID de tienda no proporcionado');
    }
  },

  // Inicializar referencias a elementos del DOM
  initElements() {
    this.elements = {
      vendorLoading: document.getElementById('vendorLoading'),
      vendorError: document.getElementById('vendorError'),
      vendorContent: document.getElementById('vendorContent'),
      storeBreadcrumb: document.getElementById('storeBreadcrumb'),
      storeLogo: document.getElementById('storeLogo'),
      storeName: document.getElementById('storeName'),
      storeAlias: document.getElementById('storeAlias'),
      storeCategories: document.getElementById('storeCategories'),
      storeRating: document.getElementById('storeRating'),
      storeRatingValue: document.getElementById('storeRatingValue'),
      storeNeighborhood: document.getElementById('storeNeighborhood'),
      storeStatus: document.getElementById('storeStatus'),
      storeDescription: document.getElementById('storeDescription'),
      contactWhatsApp: document.getElementById('contactWhatsApp'),
      viewOnMaps: document.getElementById('viewOnMaps'),
      vendorSearch: document.getElementById('vendorSearch'),
      categoryFilter: document.getElementById('categoryFilter'),
      sortFilter: document.getElementById('sortFilter'),
      productsLoading: document.getElementById('productsLoading'),
      productsGrid: document.getElementById('productsGrid'),
      emptyProducts: document.getElementById('emptyProducts'),
      productsPagination: document.getElementById('productsPagination'),
      prevProductsPage: document.getElementById('prevProductsPage'),
      nextProductsPage: document.getElementById('nextProductsPage'),
      productsPageInfo: document.getElementById('productsPageInfo')
    };
  },

  // Vincular eventos
  bindEvents() {
    // Búsqueda de productos - input en tiempo real
    if (this.elements.vendorSearch) {
      this.elements.vendorSearch.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase().trim();
        this.debounceFilter();
      });
      
      // También manejar el evento de envío del formulario
      const searchForm = this.elements.vendorSearch.closest('form');
      if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.filters.search = this.elements.vendorSearch.value.toLowerCase().trim();
          this.applyFiltersAndRender();
        });
      }
      
      // Evento para limpiar búsqueda con Escape
      this.elements.vendorSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.elements.vendorSearch.value = '';
          this.filters.search = '';
          this.applyFiltersAndRender();
        }
      });
    }

    // Filtros
    if (this.elements.categoryFilter) {
      this.elements.categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.applyFiltersAndRender();
      });
    }

    if (this.elements.sortFilter) {
      this.elements.sortFilter.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.applyFiltersAndRender();
      });
    }

    // Paginación
    if (this.elements.prevProductsPage) {
      this.elements.prevProductsPage.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderProducts();
        }
      });
    }

    if (this.elements.nextProductsPage) {
      this.elements.nextProductsPage.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderProducts();
        }
      });
    }
    
    // Botón para limpiar búsqueda
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  },

  // Debounce para filtros
  debounceFilter() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.applyFiltersAndRender();
    }, 300);
  },

  // Aplicar filtros y renderizar
  applyFiltersAndRender() {
    this.currentPage = 1;
    this.applyFilters();
    this.updateSearchResults();
    this.renderProducts();
  },

  // Cargar datos de la tienda desde Supabase
  async loadStoreData() {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase no está inicializado');
      }

      const storeService = new StoreService();
      const result = await storeService.getStoreById(this.storeId);
      
      if (!result.success || !result.data) {
        throw new Error('Tienda no encontrada');
      }

      // Transformar datos de Supabase
      this.store = {
        id: result.data.id,
        name: result.data.nombre,
        alias: result.data.alias || '',
        description: result.data.descripcion || '',
        logo: result.data.logo || null,
        owner: result.data.propietario,
        email: result.data.email,
        phone: result.data.telefono || '',
        address: result.data.direccion || '',
        neighborhood: result.data.barrio || 'Centro',
        categories: this.extractCategories(result.data),
        rating: result.data.calificacion || 4.0,
        verified: result.data.verificada || false,
        active: result.data.activa,
        created_at: result.data.created_at
      };

      console.log('✅ Tienda cargada:', this.store.name);
      
    } catch (error) {
      console.error('Error cargando tienda:', error);
      throw new Error(`Error al cargar la tienda: ${error.message}`);
    }
  },

  // Cargar productos de la tienda desde Supabase
  async loadProducts() {
    try {
      console.log('🔍 Cargando productos para tienda ID:', this.storeId);
      
      if (typeof ProductService === 'undefined') {
        console.warn('⚠️ ProductService no está disponible');
        this.products = [];
        this.filteredProducts = [];
        return;
      }

      if (!window.supabaseClient) {
        console.warn('⚠️ Cliente Supabase no disponible para productos');
        this.products = [];
        this.filteredProducts = [];
        return;
      }

      const productService = new ProductService();
      const result = await productService.getProductsByStore(this.storeId);
      
      if (result.success && result.data && result.data.length > 0) {
        // Transformar datos de productos
        this.products = result.data.map(product => ({
          id: product.id,
          name: product.nombre,
          description: product.descripcion || '',
          price: product.precio,
          originalPrice: product.precio_original || null,
          image: product.imagen || 'img/products/placeholder.jpg',
          category: product.categorias ? product.categorias.nombre : 'General',
          categoryId: product.categoria_id,
          storeId: product.tienda_id,
          stock: product.stock || 0,
          featured: product.destacado || false,
          active: product.activo,
          created_at: product.created_at
        }));
        
        console.log(`✅ ${this.products.length} productos cargados desde Supabase`);
      } else {
        console.warn(`⚠️ No se encontraron productos para la tienda ID ${this.storeId}`);
        this.products = [];
      }
      
      this.filteredProducts = [...this.products];
      this.populateFilters();
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      this.products = [];
      this.filteredProducts = [];
    }
  },

  // Extraer categorías de los datos
  extractCategories(store) {
    const defaultCategories = ['General'];
    const name = (store.nombre || '').toLowerCase();
    const desc = (store.descripcion || '').toLowerCase();
    
    const categoryMap = {
      'celular': 'Celulares',
      'telefono': 'Celulares', 
      'electronica': 'Electrónica',
      'computadora': 'Informática',
      'cosmetica': 'Cosmética',
      'ropa': 'Indumentaria',
      'zapato': 'Calzado'
    };
    
    const detectedCategories = [];
    Object.keys(categoryMap).forEach(keyword => {
      if (name.includes(keyword) || desc.includes(keyword)) {
        detectedCategories.push(categoryMap[keyword]);
      }
    });
    
    return detectedCategories.length > 0 ? detectedCategories : defaultCategories;
  },

  // Poblar filtros dinámicamente
  populateFilters() {
    if (!this.elements.categoryFilter) return;

    // Obtener categorías únicas de los productos
    const categories = [...new Set(this.products.map(p => p.category))];

    // Poblar select de categorías
    this.elements.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categories.sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.elements.categoryFilter.appendChild(option);
    });
  },

  // Aplicar filtros
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      // Filtro de búsqueda - buscar en múltiples campos
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        const searchableFields = [
          product.name || '',
          product.description || '',
          product.category || '',
          product.price ? product.price.toString() : ''
        ];
        
        const searchableText = searchableFields.join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro de categoría
      if (this.filters.category && product.categoryId !== this.filters.category) {
        return false;
      }

      return true;
    });

    // Aplicar ordenamiento
    this.sortProducts();
    
    // Log para debugging
    console.log(`Filtros aplicados: búsqueda="${this.filters.search}", categoría="${this.filters.category}", orden="${this.filters.sort}"`);
    console.log(`Productos filtrados: ${this.filteredProducts.length} de ${this.products.length}`);
  },

  // Ordenar productos
  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      switch (this.filters.sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  },

  // Renderizar información de la tienda
  renderStore() {
    try {
      // Ocultar loading y mostrar contenido
      this.elements.vendorLoading.style.display = 'none';
      this.elements.vendorContent.style.display = 'block';

      // Actualizar título de la página
      document.title = `${this.store.name} - Compras Posadas`;

      // Breadcrumb
      this.elements.storeBreadcrumb.textContent = this.store.name;

      // Logo (placeholder con inicial)
      const logoPlaceholder = this.store.name.charAt(0).toUpperCase();
      this.elements.storeLogo.textContent = logoPlaceholder;

      // Información básica
      this.elements.storeName.textContent = this.store.name;
      
      if (this.store.alias) {
        this.elements.storeAlias.textContent = this.store.alias;
        this.elements.storeAlias.style.display = 'block';
      }

      this.elements.storeDescription.textContent = this.store.description;
      this.elements.storeNeighborhood.textContent = this.store.neighborhood;

      // Categorías
      const categoriesHtml = this.store.categories.map(category => 
        `<span class="vendor-category">${category}</span>`
      ).join('');
      this.elements.storeCategories.innerHTML = categoriesHtml;

      // Rating
      const rating = this.store.rating || 4.0;
      const starsHtml = this.generateStars(rating);
      this.elements.storeRating.innerHTML = starsHtml;
      this.elements.storeRatingValue.textContent = rating.toFixed(1);

      // Estado de la tienda
      const status = this.getStoreStatus();
      this.elements.storeStatus.innerHTML = `
        <span class="vendor-status vendor-status--${status.class}">${status.text}</span>
      `;

      // Botones de acción
      this.setupActionButtons();

    } catch (error) {
      console.error('Error renderizando tienda:', error);
      this.showError('Error mostrando información de la tienda');
    }
  },

  // Configurar botones de acción
  setupActionButtons() {
    // WhatsApp
    if (this.store.phone) {
      this.elements.contactWhatsApp.style.display = 'inline-flex';
      this.elements.contactWhatsApp.onclick = () => {
        window.open(this.getWhatsAppUrl(), '_blank');
      };
    }

    // Maps
    this.elements.viewOnMaps.onclick = () => {
      window.open(this.getMapsUrl(), '_blank');
    };
  },

  // Generar estrellas de rating
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '★'.repeat(fullStars);
    if (hasHalfStar) starsHtml += '☆';
    starsHtml += '☆'.repeat(emptyStars);
    
    return starsHtml;
  },

  // Obtener estado de la tienda
  getStoreStatus() {
    return { class: 'available', text: 'Contactar' };
  },

  // Obtener URL de WhatsApp
  getWhatsAppUrl() {
    const phone = this.store.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola! Vi tu tienda "${this.store.name}" en Compras Posadas y me interesa conocer más sobre sus productos.`);
    return `https://wa.me/${phone}?text=${message}`;
  },

  // Obtener URL de Google Maps
  getMapsUrl() {
    const searchQuery = this.store.address ? 
      `${this.store.address}, ${this.store.neighborhood}, Posadas, Misiones` : 
      `${this.store.name}, Posadas, Misiones`;
    const query = encodeURIComponent(searchQuery);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  },

  // Renderizar productos
  renderProducts() {
    try {
      // Ocultar loading
      this.elements.productsLoading.style.display = 'none';

      if (this.filteredProducts.length === 0) {
        this.elements.productsGrid.style.display = 'none';
        this.elements.emptyProducts.style.display = 'block';
        this.elements.productsPagination.style.display = 'none';
        
        // Mostrar mensaje apropiado según el contexto
        const emptyContent = this.elements.emptyProducts.querySelector('.products-empty__content');
        if (this.filters.search || this.filters.category) {
          emptyContent.innerHTML = `
            <h3>No se encontraron productos</h3>
            <p>
              ${this.filters.search ? `No hay productos que coincidan con "<strong>${this.filters.search}</strong>"` : ''}
              ${this.filters.search && this.filters.category ? ' en esta categoría.' : ''}
              ${!this.filters.search && this.filters.category ? 'No hay productos en esta categoría.' : '.'}
            </p>
            <button class="btn btn-ghost" onclick="VendorApp.clearFilters()">Limpiar filtros</button>
          `;
        } else {
          emptyContent.innerHTML = `
            <h3>No hay productos disponibles</h3>
            <p>Esta tienda aún no ha agregado productos a su catálogo.</p>
          `;
        }
        return;
      }

      // Calcular productos de la página actual
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

      // Renderizar productos
      this.elements.productsGrid.innerHTML = '';
      pageProducts.forEach(product => {
        const productCard = this.createProductCard(product);
        this.elements.productsGrid.appendChild(productCard);
      });

      this.elements.productsGrid.style.display = 'grid';
      this.elements.emptyProducts.style.display = 'none';

      // Actualizar paginación
      this.updatePagination();

    } catch (error) {
      console.error('Error renderizando productos:', error);
    }
  },

  // Crear card de producto
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const discountPercentage = product.originalPrice ? 
      Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    card.innerHTML = `
      <div class="product-card__image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.featured ? '<span class="product-card__badge product-card__badge--featured">Destacado</span>' : ''}
        ${discountPercentage > 0 ? `<span class="product-card__badge product-card__badge--discount">-${discountPercentage}%</span>` : ''}
      </div>
      
      <div class="product-card__content">
        <h3 class="product-card__title">${product.name}</h3>
        <p class="product-card__category">${product.category}</p>
        
        <div class="product-card__price">
          <span class="product-card__current-price">$${product.price.toLocaleString('es-AR')}</span>
          ${product.originalPrice ? `<span class="product-card__original-price">$${product.originalPrice.toLocaleString('es-AR')}</span>` : ''}
        </div>
        
        <div class="product-card__actions">
          <button class="product-card__btn product-card__btn--primary" onclick="VendorApp.viewProduct('${product.id}')">
            Ver producto
          </button>
          <button class="product-card__btn product-card__btn--wishlist" onclick="VendorApp.toggleWishlist('${product.id}')" title="Agregar a favoritos">
            ♥
          </button>
        </div>
      </div>
    `;

    return card;
  },

  // Actualizar paginación
  updatePagination() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);

    if (totalPages <= 1) {
      this.elements.productsPagination.style.display = 'none';
      return;
    }

    this.elements.productsPagination.style.display = 'flex';
    this.elements.productsPageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
    
    this.elements.prevProductsPage.disabled = this.currentPage <= 1;
    this.elements.nextProductsPage.disabled = this.currentPage >= totalPages;
  },

  // Actualizar indicador de resultados de búsqueda
  updateSearchResults() {
    const searchResults = document.getElementById('searchResults');
    const searchResultsText = document.getElementById('searchResultsText');
    
    if (!searchResults || !searchResultsText) return;
    
    if (this.filters.search || this.filters.category) {
      const totalResults = this.filteredProducts.length;
      const totalProducts = this.products.length;
      
      let text = '';
      if (this.filters.search && this.filters.category) {
        text = `${totalResults} de ${totalProducts} productos encontrados para "<strong>${this.filters.search}</strong>" en esta categoría`;
      } else if (this.filters.search) {
        text = `${totalResults} de ${totalProducts} productos encontrados para "<strong>${this.filters.search}</strong>"`;
      } else if (this.filters.category) {
        const categoryName = this.elements.categoryFilter?.options[this.elements.categoryFilter.selectedIndex]?.text || 'esta categoría';
        text = `${totalResults} de ${totalProducts} productos en ${categoryName}`;
      }
      
      searchResultsText.innerHTML = text;
      searchResults.style.display = 'flex';
    } else {
      searchResults.style.display = 'none';
    }
  },

  // Ver producto (placeholder)
  viewProduct(productId) {
    console.log('Ver producto:', productId);
    // TODO: Implementar navegación a página de producto
  },

  // Toggle wishlist (placeholder)
  toggleWishlist(productId) {
    console.log('Toggle wishlist:', productId);
    // TODO: Implementar funcionalidad de wishlist
  },

  // Mostrar error
  showError(message = 'Error cargando la tienda') {
    this.elements.vendorLoading.style.display = 'none';
    this.elements.vendorContent.style.display = 'none';
    this.elements.vendorError.style.display = 'block';
    
    const errorContent = this.elements.vendorError.querySelector('.vendor-error__content h1');
    if (errorContent) {
      errorContent.textContent = message;
    }
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Esperar un poco para que Supabase se inicialice
  setTimeout(() => {
    VendorApp.init();
  }, 200);
});

// Exportar para uso global
window.VendorApp = VendorApp;