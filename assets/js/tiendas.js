/**
 * TIENDAS.JS - Lógica para la página de tiendas
 * Maneja búsqueda, filtros, ordenamiento y renderizado de tiendas
 */

// Estado global de la aplicación de tiendas
const TiendasApp = {
  stores: [],
  filteredStores: [],
  currentPage: 1,
  itemsPerPage: 12,
  filters: {
    search: '',
    category: '',
    sort: 'alphabetical'
  },
  
  // Elementos del DOM
  elements: {
    storesGrid: null,
    storesLoading: null,
    resultsCount: null,
    searchInput: null,
    clearSearch: null,
    categoryFilter: null,
    sortFilter: null,
    pagination: null,
    prevBtn: null,
    nextBtn: null,
    pageInfo: null,
    emptyState: null,
    resetFilters: null
  },

  // Inicialización
  async init() {
    try {
      this.initElements();
      this.bindEvents();
      await this.loadStores();
      this.populateFilters();
      this.applyFilters();
      this.renderStores();
    } catch (error) {
      console.error('Error inicializando tiendas:', error);
      this.showError('Error cargando las tiendas. Por favor, recarga la página.');
    }
  },

  // Inicializar referencias a elementos del DOM
  initElements() {
    this.elements = {
      storesGrid: document.getElementById('storesGrid'),
      storesLoading: document.getElementById('storesLoading'),
      resultsCount: document.getElementById('resultsCount'),
      searchInput: document.getElementById('storeSearch'),
      clearSearch: document.getElementById('clearSearch'),
      categoryFilter: document.getElementById('categoryFilter'),
      sortFilter: document.getElementById('sortFilter'),
      pagination: document.getElementById('storesPagination'),
      prevBtn: document.getElementById('prevPage'),
      nextBtn: document.getElementById('nextPage'),
      pageInfo: document.getElementById('pageInfo'),
      emptyState: document.getElementById('emptyState'),
      resetFilters: document.getElementById('resetFilters')
    };
  },

  // Vincular eventos
  bindEvents() {
    // Búsqueda
    this.elements.searchInput.addEventListener('input', (e) => {
      this.filters.search = e.target.value.toLowerCase().trim();
      this.toggleClearButton();
      this.debounceFilter();
    });

    this.elements.clearSearch.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.filters.search = '';
      this.toggleClearButton();
      this.applyFiltersAndRender();
    });

    // Filtros
    this.elements.categoryFilter.addEventListener('change', (e) => {
      this.filters.category = e.target.value;
      this.applyFiltersAndRender();
    });

    this.elements.sortFilter.addEventListener('change', (e) => {
      this.filters.sort = e.target.value;
      this.applyFiltersAndRender();
    });

    // Paginación
    this.elements.prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderStores();
        this.scrollToTop();
      }
    });

    this.elements.nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(this.filteredStores.length / this.itemsPerPage);
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderStores();
        this.scrollToTop();
      }
    });

    // Reset filtros
    this.elements.resetFilters.addEventListener('click', () => {
      this.resetFilters();
    });
  },

  // Debounce para la búsqueda
  debounceFilter() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFiltersAndRender();
    }, 300);
  },

  // Cargar datos de tiendas
  async loadStores() {
    try {
      const response = await fetch('assets/data/stores.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.stores = await response.json();
    } catch (error) {
      console.error('Error cargando stores.json:', error);
      throw error;
    }
  },

  // Poblar filtros dinámicamente
  populateFilters() {
    // Obtener todas las categorías únicas
    const categories = new Set();
    this.stores.forEach(store => {
      store.categories.forEach(cat => categories.add(cat));
    });

    // Poblar select de categorías
    this.elements.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    [...categories].sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.elements.categoryFilter.appendChild(option);
    });
  },

  // Aplicar filtros
  applyFilters() {
    this.filteredStores = this.stores.filter(store => {
      // Filtro de búsqueda
      if (this.filters.search) {
        const searchTerm = this.filters.search;
        const searchableText = `${store.name} ${store.alias || ''} ${store.neighborhood} ${store.categories.join(' ')}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro de categoría
      if (this.filters.category) {
        if (!store.categories.includes(this.filters.category)) {
          return false;
        }
      }

      return true;
    });

    // Aplicar ordenamiento
    this.applySorting();

    // Reset página actual
    this.currentPage = 1;
  },

  // Aplicar ordenamiento
  applySorting() {
    switch (this.filters.sort) {
      case 'alphabetical':
        this.filteredStores.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        this.filteredStores.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        this.filteredStores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'price':
        this.filteredStores.sort((a, b) => a.priceLevel - b.priceLevel);
        break;
    }
  },

  // Aplicar filtros y renderizar
  applyFiltersAndRender() {
    this.applyFilters();
    this.renderStores();
  },

  // Renderizar tiendas
  renderStores() {
    // Ocultar loading y mostrar grid
    this.elements.storesLoading.style.display = 'none';
    this.elements.storesGrid.style.display = 'grid';

    // Calcular paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedStores = this.filteredStores.slice(startIndex, endIndex);

    // Mostrar/ocultar estado vacío
    if (this.filteredStores.length === 0) {
      this.elements.storesGrid.style.display = 'none';
      this.elements.pagination.style.display = 'none';
      this.elements.emptyState.style.display = 'block';
      this.updateResultsCount();
      return;
    } else {
      this.elements.emptyState.style.display = 'none';
      this.elements.pagination.style.display = 'flex';
    }

    // Renderizar cards
    this.elements.storesGrid.innerHTML = '';
    paginatedStores.forEach(store => {
      const storeCard = this.createStoreCard(store);
      this.elements.storesGrid.appendChild(storeCard);
    });

    // Actualizar UI
    this.updateResultsCount();
    this.updatePagination();
  },

  // Crear card de tienda
  createStoreCard(store) {
    const card = document.createElement('div');
    card.className = 'store-card';
    card.setAttribute('data-store-id', store.id);

    // Calcular status (abierto/cerrado)
    const status = this.getStoreStatus(store);

    // Generar chips de categorías
    const categoriesHtml = store.categories.map(cat => 
      `<span class="store-card__category">${cat}</span>`
    ).join('');

    // Generar rating stars
    const fullStars = Math.floor(store.rating);
    const hasHalfStar = store.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '★'.repeat(fullStars);
    if (hasHalfStar) starsHtml += '☆';
    starsHtml += '☆'.repeat(emptyStars);

    // Generar indicadores de precio
    const priceHtml = Array.from({length: 4}, (_, i) => 
      `<span class="store-card__price-symbol ${i < store.priceLevel ? '' : 'store-card__price-symbol--inactive'}">$</span>`
    ).join('');

    // Generar badges de servicios
    const servicesHtml = [];
    if (store.delivery) servicesHtml.push('<span class="store-card__service store-card__service--delivery">Delivery</span>');
    if (store.pickup) servicesHtml.push('<span class="store-card__service store-card__service--pickup">Retiro</span>');
    if (store.warranty) servicesHtml.push('<span class="store-card__service store-card__service--warranty">Garantía</span>');

    // Logo placeholder
    const logoPlaceholder = store.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <div class="store-card__header">
        <div class="store-card__logo">
          <div class="store-card__logo-placeholder">${logoPlaceholder}</div>
        </div>
        <div class="store-card__info">
          <h3 class="store-card__name">${store.name}</h3>
          ${store.alias ? `<p class="store-card__alias">${store.alias}</p>` : ''}
          <div class="store-card__categories">
            ${categoriesHtml}
          </div>
        </div>
      </div>
      
      <div class="store-card__meta">
        <div class="store-card__rating">
          <span class="store-card__stars">${starsHtml}</span>
          <span class="store-card__rating-value">${store.rating}</span>
        </div>
        <div class="store-card__price">
          ${priceHtml}
        </div>
        <span class="store-card__neighborhood">${store.neighborhood}</span>
      </div>

      ${servicesHtml.length > 0 ? `<div class="store-card__services">${servicesHtml.join('')}</div>` : ''}

      <div class="store-card__status">
        <span class="store-card__status-badge store-card__status-badge--${status.class}">
          ${status.text}
        </span>
      </div>

      <div class="store-card__actions">
        <a href="vendor.html?id=${store.id}" class="store-card__btn store-card__btn--primary">
          Ver tienda
        </a>
        <a href="${this.getWhatsAppUrl(store)}" target="_blank" rel="noopener" class="store-card__btn store-card__btn--whatsapp">
          WhatsApp
        </a>
        <a href="${this.getMapsUrl(store)}" target="_blank" rel="noopener" class="store-card__btn store-card__btn--secondary">
          Mapa
        </a>
      </div>
    `;

    return card;
  },

  // Obtener estado de la tienda (abierto/cerrado)
  getStoreStatus(store) {
    const now = new Date();
    const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

    const todayHours = store.hours[currentDay];
    
    if (!todayHours || todayHours === '') {
      return { class: 'closed', text: 'Cerrado hoy' };
    }

    const [openTime, closeTime] = todayHours.split('-').map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 100 + minutes;
    });

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { class: 'open', text: 'Abierto ahora' };
    } else {
      return { class: 'closed', text: 'Cerrado' };
    }
  },

  // Generar URL de WhatsApp
  getWhatsAppUrl(store) {
    const phone = store.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola! Vi tu tienda "${store.name}" en Compras Posadas y me interesa conocer más sobre sus productos.`);
    return `https://wa.me/${phone}?text=${message}`;
  },

  // Generar URL de Google Maps
  getMapsUrl(store) {
    if (store.location && store.location.lat && store.location.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${store.location.lat},${store.location.lng}`;
    } else {
      const query = encodeURIComponent(`${store.address}, Posadas, Misiones`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
  },

  // Actualizar contador de resultados
  updateResultsCount() {
    const total = this.filteredStores.length;
    let text = '';

    if (total === 0) {
      text = 'No se encontraron tiendas';
    } else if (total === 1) {
      text = '1 tienda encontrada';
    } else {
      text = `${total} tiendas encontradas`;
    }

    this.elements.resultsCount.textContent = text;
  },

  // Actualizar paginación
  updatePagination() {
    const totalPages = Math.ceil(this.filteredStores.length / this.itemsPerPage);
    
    // Actualizar botones
    this.elements.prevBtn.disabled = this.currentPage <= 1;
    this.elements.nextBtn.disabled = this.currentPage >= totalPages;

    // Actualizar info de página
    if (totalPages > 0) {
      this.elements.pageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
    } else {
      this.elements.pageInfo.textContent = '';
    }

    // Mostrar/ocultar paginación
    if (totalPages <= 1) {
      this.elements.pagination.style.display = 'none';
    } else {
      this.elements.pagination.style.display = 'flex';
    }
  },

  // Toggle botón de limpiar búsqueda
  toggleClearButton() {
    if (this.elements.searchInput.value.trim()) {
      this.elements.clearSearch.style.display = 'block';
    } else {
      this.elements.clearSearch.style.display = 'none';
    }
  },

  // Reset filtros
  resetFilters() {
    this.elements.searchInput.value = '';
    this.elements.categoryFilter.value = '';
    this.elements.sortFilter.value = 'alphabetical';
    
    this.filters = {
      search: '',
      category: '',
      sort: 'alphabetical'
    };

    this.toggleClearButton();
    this.applyFiltersAndRender();
  },

  // Scroll to top suave
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Mostrar error
  showError(message) {
    this.elements.storesLoading.style.display = 'none';
    this.elements.storesGrid.style.display = 'none';
    this.elements.pagination.style.display = 'none';
    this.elements.emptyState.style.display = 'block';
    
    const emptyContent = this.elements.emptyState.querySelector('.stores-empty__content');
    emptyContent.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn btn-primary">Reintentar</button>
    `;
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  TiendasApp.init();
});

// Exportar para uso global
window.TiendasApp = TiendasApp;