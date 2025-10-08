/**
 * VENDOR.JS - Lógica para la página de perfil de tienda
 * Maneja la carga de información de tienda individual y sus productos
 */

// Estado global de la aplicación vendor
const VendorApp = {
  storeId: null,
  store: null,
  products: [],
  filteredProducts: [],
  filters: {
    search: '',
    category: ''
  },

  // Elementos del DOM
  elements: {
    vendorLoading: null,
    vendorError: null,
    vendorContent: null,
    vendorBreadcrumb: null,
    vendorLogo: null,
    vendorName: null,
    vendorCategories: null,
    vendorRating: null,
    vendorRatingValue: null,
    vendorPriceLevel: null,
    vendorNeighborhood: null,
    vendorStatus: null,
    vendorDescription: null,
    vendorServices: null,
    vendorPhone: null,
    vendorAddress: null,
    vendorInstagram: null,
    vendorHours: null,
    btnWhatsapp: null,
    btnMaps: null,
    btnWebsite: null,
    btnContactStore: null,
    productSearch: null,
    productCategoryFilter: null,
    productsLoading: null,
    productsGrid: null,
    noProducts: null
  },

  // Inicialización
  async init() {
    try {
      this.extractStoreId();
      this.initElements();
      this.bindEvents();
      await this.loadStoreData();
      await this.loadProducts();
      this.renderStore();
      this.renderProducts();
    } catch (error) {
      console.error('Error inicializando vendor:', error);
      this.showError();
    }
  },

  // Extraer ID de tienda de la URL
  extractStoreId() {
    const urlParams = new URLSearchParams(window.location.search);
    this.storeId = urlParams.get('id');
    
    if (!this.storeId) {
      throw new Error('No store ID provided');
    }
  },

  // Inicializar referencias a elementos del DOM
  initElements() {
    this.elements = {
      vendorLoading: document.getElementById('vendorLoading'),
      vendorError: document.getElementById('vendorError'),
      vendorContent: document.getElementById('vendorContent'),
      vendorBreadcrumb: document.getElementById('vendorBreadcrumb'),
      vendorLogo: document.getElementById('vendorLogo'),
      vendorName: document.getElementById('vendorName'),
      vendorCategories: document.getElementById('vendorCategories'),
      vendorRating: document.getElementById('vendorRating'),
      vendorRatingValue: document.getElementById('vendorRatingValue'),
      vendorPriceLevel: document.getElementById('vendorPriceLevel'),
      vendorNeighborhood: document.getElementById('vendorNeighborhood'),
      vendorStatus: document.getElementById('vendorStatus'),
      vendorDescription: document.getElementById('vendorDescription'),
      vendorServices: document.getElementById('vendorServices'),
      vendorPhone: document.getElementById('vendorPhone'),
      vendorAddress: document.getElementById('vendorAddress'),
      vendorInstagram: document.getElementById('vendorInstagram'),
      vendorHours: document.getElementById('vendorHours'),
      btnWhatsapp: document.getElementById('btnWhatsapp'),
      btnMaps: document.getElementById('btnMaps'),
      btnWebsite: document.getElementById('btnWebsite'),
      btnContactStore: document.getElementById('btnContactStore'),
      productSearch: document.getElementById('productSearch'),
      productCategoryFilter: document.getElementById('productCategoryFilter'),
      productsLoading: document.getElementById('productsLoading'),
      productsGrid: document.getElementById('productsGrid'),
      noProducts: document.getElementById('noProducts')
    };
  },

  // Vincular eventos
  bindEvents() {
    // Búsqueda de productos
    if (this.elements.productSearch) {
      this.elements.productSearch.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase().trim();
        this.debounceProductFilter();
      });
    }

    // Filtro de categoría de productos
    if (this.elements.productCategoryFilter) {
      this.elements.productCategoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.filterAndRenderProducts();
      });
    }

    // Botón contactar tienda
    if (this.elements.btnContactStore) {
      this.elements.btnContactStore.addEventListener('click', () => {
        if (this.store) {
          window.open(this.getWhatsAppUrl(), '_blank', 'noopener');
        }
      });
    }
  },

  // Debounce para la búsqueda de productos
  debounceProductFilter() {
    clearTimeout(this.productSearchTimeout);
    this.productSearchTimeout = setTimeout(() => {
      this.filterAndRenderProducts();
    }, 300);
  },

  // Cargar datos de la tienda
  async loadStoreData() {
    try {
      const response = await fetch('assets/data/stores.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stores = await response.json();
      this.store = stores.find(store => store.id === this.storeId);
      
      if (!this.store) {
        throw new Error('Store not found');
      }
    } catch (error) {
      console.error('Error cargando datos de tienda:', error);
      throw error;
    }
  },

  // Cargar productos
  async loadProducts() {
    try {
      const response = await fetch('assets/data/products.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allProducts = await response.json();
      this.products = allProducts.filter(product => product.storeId === this.storeId);
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error cargando productos:', error);
      // No lanzar error aquí, solo log - los productos son opcionales
    }
  },

  // Renderizar información de la tienda
  renderStore() {
    // Ocultar loading y mostrar contenido
    this.elements.vendorLoading.style.display = 'none';
    this.elements.vendorContent.style.display = 'block';

    // Breadcrumb
    this.elements.vendorBreadcrumb.textContent = this.store.name;

    // Logo (placeholder con inicial)
    this.elements.vendorLogo.src = '';
    this.elements.vendorLogo.alt = this.store.name;
    this.elements.vendorLogo.style.display = 'none';
    
    // Crear placeholder de logo
    const logoPlaceholder = document.createElement('div');
    logoPlaceholder.className = 'vendor-logo-placeholder';
    logoPlaceholder.style.cssText = `
      width: 100%;
      height: 100%;
      background: #238a49;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: 600;
      border-radius: 12px;
    `;
    logoPlaceholder.textContent = this.store.name.charAt(0).toUpperCase();
    this.elements.vendorLogo.parentNode.appendChild(logoPlaceholder);

    // Nombre
    this.elements.vendorName.textContent = this.store.name;

    // Categorías
    this.elements.vendorCategories.innerHTML = this.store.categories.map(cat => 
      `<span class="vendor-info__category">${cat}</span>`
    ).join('');

    // Rating
    const fullStars = Math.floor(this.store.rating);
    const hasHalfStar = this.store.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '★'.repeat(fullStars);
    if (hasHalfStar) starsHtml += '☆';
    starsHtml += '☆'.repeat(emptyStars);

    this.elements.vendorRating.innerHTML = starsHtml;
    this.elements.vendorRatingValue.textContent = this.store.rating;

    // Nivel de precio
    this.elements.vendorPriceLevel.innerHTML = Array.from({length: 4}, (_, i) => 
      `<span class="vendor-price__symbol ${i < this.store.priceLevel ? '' : 'vendor-price__symbol--inactive'}">$</span>`
    ).join('');

    // Barrio
    this.elements.vendorNeighborhood.textContent = this.store.neighborhood;

    // Estado
    const status = this.getStoreStatus();
    this.elements.vendorStatus.innerHTML = `
      <span class="vendor-status__badge vendor-status__badge--${status.class}">
        ${status.text}
      </span>
    `;

    // Descripción
    this.elements.vendorDescription.textContent = this.store.shortDesc;

    // Servicios
    const services = [];
    if (this.store.delivery) services.push('<span class="vendor-service vendor-service--delivery">🚚 Delivery</span>');
    if (this.store.pickup) services.push('<span class="vendor-service vendor-service--pickup">🏪 Retiro en tienda</span>');
    if (this.store.warranty) services.push('<span class="vendor-service vendor-service--warranty">🛡️ Garantía</span>');
    this.elements.vendorServices.innerHTML = services.join('');

    // Contacto
    this.elements.vendorPhone.querySelector('.vendor-contact__value').textContent = this.store.phone;
    this.elements.vendorAddress.querySelector('.vendor-contact__value').textContent = this.store.address;

    // Instagram
    if (this.store.instagram) {
      this.elements.vendorInstagram.style.display = 'flex';
      this.elements.vendorInstagram.querySelector('.vendor-contact__link').href = this.store.instagram;
    }

    // Horarios
    const daysMap = {
      mon: 'Lunes',
      tue: 'Martes', 
      wed: 'Miércoles',
      thu: 'Jueves',
      fri: 'Viernes',
      sat: 'Sábado',
      sun: 'Domingo'
    };

    const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];

    this.elements.vendorHours.innerHTML = Object.entries(daysMap).map(([key, label]) => {
      const hours = this.store.hours[key];
      const isToday = key === currentDay;
      const timeClass = hours ? (isToday ? 'vendor-hours__time--today' : '') : 'vendor-hours__time--closed';
      const timeText = hours || 'Cerrado';

      return `
        <div class="vendor-hours__item">
          <span class="vendor-hours__day">${label}</span>
          <span class="vendor-hours__time ${timeClass}">${timeText}</span>
        </div>
      `;
    }).join('');

    // Botones de acción
    this.elements.btnWhatsapp.onclick = () => window.open(this.getWhatsAppUrl(), '_blank', 'noopener');
    this.elements.btnMaps.onclick = () => window.open(this.getMapsUrl(), '_blank', 'noopener');

    if (this.store.website) {
      this.elements.btnWebsite.style.display = 'block';
      this.elements.btnWebsite.onclick = () => window.open(this.store.website, '_blank', 'noopener');
    }
  },

  // Renderizar productos
  renderProducts() {
    // Ocultar loading
    this.elements.productsLoading.style.display = 'none';

    if (this.products.length === 0) {
      this.elements.noProducts.style.display = 'block';
      this.elements.productsGrid.style.display = 'none';
      return;
    }

    // Poblar filtro de categorías
    this.populateProductFilters();

    // Mostrar grid y renderizar productos
    this.elements.productsGrid.style.display = 'grid';
    this.elements.noProducts.style.display = 'none';
    this.filterAndRenderProducts();
  },

  // Poblar filtros de productos
  populateProductFilters() {
    const categories = new Set();
    this.products.forEach(product => {
      if (product.category) categories.add(product.category);
    });

    this.elements.productCategoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
    [...categories].sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.elements.productCategoryFilter.appendChild(option);
    });
  },

  // Filtrar y renderizar productos
  filterAndRenderProducts() {
    // Aplicar filtros
    this.filteredProducts = this.products.filter(product => {
      // Filtro de búsqueda
      if (this.filters.search) {
        const searchTerm = this.filters.search;
        const searchableText = `${product.name} ${product.brand || ''} ${product.category || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro de categoría
      if (this.filters.category && product.category !== this.filters.category) {
        return false;
      }

      return true;
    });

    // Renderizar
    this.elements.productsGrid.innerHTML = '';
    this.filteredProducts.forEach(product => {
      const productCard = this.createProductCard(product);
      this.elements.productsGrid.appendChild(productCard);
    });

    // Mostrar/ocultar estado vacío
    if (this.filteredProducts.length === 0 && (this.filters.search || this.filters.category)) {
      this.elements.productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px;">
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      `;
    }
  },

  // Crear card de producto
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Convertir precio para mostrar en diferentes monedas
    const usdPrice = product.price;
    const brlPrice = (usdPrice * 5.46).toFixed(2); // Tasa de cambio aproximada
    const pygPrice = (usdPrice * 7300).toLocaleString(); // Tasa de cambio aproximada

    card.innerHTML = `
      <div class="product-card__image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card__content">
        <div class="product-card__category">${product.category || 'Sin categoría'}</div>
        <h4 class="product-card__name">${product.name}</h4>
        ${product.code ? `<div class="product-card__code">CÓDIGO: ${product.code}</div>` : ''}
        <div class="product-card__price">U$ ${usdPrice.toFixed(2)}</div>
        <div style="font-size: 0.8rem; color: #666; line-height: 1.2;">
          <div>R$ ${brlPrice}</div>
          <div>G$ ${pygPrice}</div>
        </div>
        ${product.brand ? `<div class="product-card__brand">${product.brand}</div>` : ''}
      </div>
    `;

    return card;
  },

  // Obtener estado de la tienda
  getStoreStatus() {
    const now = new Date();
    const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const todayHours = this.store.hours[currentDay];
    
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
  getWhatsAppUrl() {
    const phone = this.store.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola! Vi tu tienda "${this.store.name}" en Compras Posadas y me interesa conocer más sobre sus productos.`);
    return `https://wa.me/${phone}?text=${message}`;
  },

  // Generar URL de Google Maps
  getMapsUrl() {
    if (this.store.location && this.store.location.lat && this.store.location.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${this.store.location.lat},${this.store.location.lng}`;
    } else {
      const query = encodeURIComponent(`${this.store.address}, Posadas, Misiones`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
  },

  // Mostrar error
  showError() {
    this.elements.vendorLoading.style.display = 'none';
    this.elements.vendorContent.style.display = 'none';
    this.elements.vendorError.style.display = 'block';
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  VendorApp.init();
});

// Exportar para uso global
window.VendorApp = VendorApp;