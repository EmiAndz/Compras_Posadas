/**
 * Ubicaciones App - Gestión de ubicaciones de tiendas
 * Muestra todas las tiendas con sus ubicaciones en formato lista
 */

class UbicacionesApp {
    constructor() {
        this.stores = [];
        this.filteredStores = [];
        this.currentView = 'list';
        this.searchTimeout = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadStores();
            this.setupEventListeners();
            this.populateFilters();
            this.renderStores();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError();
        }
    }

    async loadStores() {
        try {
            const response = await fetch('assets/data/stores.json');
            if (!response.ok) throw new Error('No se pudieron cargar las tiendas');
            
            this.stores = await response.json();
            this.filteredStores = [...this.stores];
        } catch (error) {
            console.error('Error loading stores:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Filters
        const neighborhoodFilter = document.getElementById('neighborhoodFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        
        neighborhoodFilter?.addEventListener('change', () => this.applyFilters());
        categoryFilter?.addEventListener('change', () => this.applyFilters());

        // View toggle
        const listViewBtn = document.getElementById('listViewBtn');
        const mapViewBtn = document.getElementById('mapViewBtn');
        
        listViewBtn?.addEventListener('click', () => this.switchView('list'));
        mapViewBtn?.addEventListener('click', () => this.switchView('map'));
    }

    populateFilters() {
        // Populate neighborhood filter
        const neighborhoods = [...new Set(this.stores.map(store => store.neighborhood))].sort();
        const neighborhoodFilter = document.getElementById('neighborhoodFilter');
        
        if (neighborhoodFilter) {
            neighborhoods.forEach(neighborhood => {
                const option = document.createElement('option');
                option.value = neighborhood;
                option.textContent = neighborhood;
                neighborhoodFilter.appendChild(option);
            });
        }

        // Populate category filter
        const categories = [...new Set(this.stores.flatMap(store => store.categories))].sort();
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (categoryFilter) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    }

    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    applyFilters() {
        const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const selectedNeighborhood = document.getElementById('neighborhoodFilter')?.value || '';
        const selectedCategory = document.getElementById('categoryFilter')?.value || '';

        this.filteredStores = this.stores.filter(store => {
            const matchesSearch = !searchQuery || 
                store.name.toLowerCase().includes(searchQuery) ||
                store.alias.toLowerCase().includes(searchQuery) ||
                store.neighborhood.toLowerCase().includes(searchQuery) ||
                store.address.toLowerCase().includes(searchQuery);

            const matchesNeighborhood = !selectedNeighborhood || 
                store.neighborhood === selectedNeighborhood;

            const matchesCategory = !selectedCategory || 
                store.categories.includes(selectedCategory);

            return matchesSearch && matchesNeighborhood && matchesCategory;
        });

        this.renderStores();
    }

    switchView(view) {
        this.currentView = view;
        
        const listView = document.getElementById('listView');
        const mapView = document.getElementById('mapView');
        const listBtn = document.getElementById('listViewBtn');
        const mapBtn = document.getElementById('mapViewBtn');

        if (view === 'list') {
            listView?.classList.remove('hidden');
            mapView?.classList.add('hidden');
            listBtn?.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            listBtn?.classList.remove('text-gray-600');
            mapBtn?.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
            mapBtn?.classList.add('text-gray-600');
        } else {
            listView?.classList.add('hidden');
            mapView?.classList.remove('hidden');
            mapBtn?.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            mapBtn?.classList.remove('text-gray-600');
            listBtn?.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
            listBtn?.classList.add('text-gray-600');
        }
    }

    renderStores() {
        const container = document.getElementById('listView');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;

        if (this.filteredStores.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');
        
        container.innerHTML = this.filteredStores.map(store => this.createStoreCard(store)).join('');
    }

    createStoreCard(store) {
        const status = this.getStoreStatus(store);
        const statusColor = status.isOpen ? 'text-green-600' : 'text-red-500';
        const services = this.getStoreServices(store);
        
        return `
            <div class="location-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div class="p-4 md:p-6">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-start space-x-3 flex-1">
                            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 text-lg truncate">${store.name}</h3>
                                <div class="flex items-center space-x-2 mt-1">
                                    <div class="flex items-center">
                                        <svg class="w-4 h-4 text-yellow-400 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                        <span class="text-sm font-medium text-gray-700">${store.rating}</span>
                                    </div>
                                    <span class="text-gray-300">•</span>
                                    <span class="text-sm ${statusColor} font-medium">${status.text}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <div class="flex items-center space-x-1 mb-2">
                                ${store.categories.map(cat => 
                                    `<span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">${cat}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Location Info -->
                    <div class="space-y-3 mb-4">
                        <div class="flex items-start space-x-2">
                            <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <div>
                                <p class="text-sm text-gray-900 font-medium">${store.address}</p>
                                <p class="text-sm text-gray-500">${store.neighborhood}</p>
                            </div>
                        </div>

                        ${store.phone ? `
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                                <path d="M22 16.92V19.92C22 20.5 21.5 21 21 21C9.4 21 0 11.6 0 0C0 -0.5 0.5 -1 1 -1H4C4.6 -1 5 -0.5 5 0C5 1.2 5.2 2.4 5.6 3.5C5.8 4.1 5.6 4.7 5.1 5.1L3.6 6.6C5.2 9.9 8.1 12.8 11.4 14.4L12.9 12.9C13.3 12.4 13.9 12.2 14.5 12.4C15.6 12.8 16.8 13 18 13C18.6 13 19 13.4 19 14V17C19 17.6 18.5 18 18 18C17.9 18 17.8 18 17.7 18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span class="text-sm text-gray-600">${store.phone}</span>
                        </div>
                        ` : ''}

                        <!-- Services -->
                        ${services.length > 0 ? `
                        <div class="flex items-center space-x-2">
                            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <div class="flex flex-wrap gap-1">
                                ${services.map(service => 
                                    `<span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">${service}</span>`
                                ).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-2">
                        <a href="vendor.html?store=${store.id}" 
                           class="flex-1 min-w-[120px] bg-custom-green text-white px-4 py-2 rounded-lg text-sm font-medium text-center hover:bg-green-600 transition-colors">
                            Ver Tienda
                        </a>
                        
                        ${store.whatsapp ? `
                        <a href="https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}" 
                           target="_blank"
                           class="flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                            <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
                            </svg>
                            WhatsApp
                        </a>
                        ` : ''}
                        
                        <a href="https://maps.google.com/?q=${store.location.lat},${store.location.lng}" 
                           target="_blank"
                           class="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Mapa
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    getStoreStatus(store) {
        const now = new Date();
        const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
        const currentTime = now.getHours() * 100 + now.getMinutes();
        
        const todayHours = store.hours[currentDay];
        
        if (!todayHours) {
            return { isOpen: false, text: 'Cerrado hoy' };
        }
        
        const [openTime, closeTime] = todayHours.split('-').map(time => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 100 + minutes;
        });
        
        if (currentTime >= openTime && currentTime <= closeTime) {
            const closeHour = Math.floor(closeTime / 100);
            const closeMinute = closeTime % 100;
            return { 
                isOpen: true, 
                text: `Abierto hasta ${closeHour}:${closeMinute.toString().padStart(2, '0')}` 
            };
        } else {
            return { isOpen: false, text: 'Cerrado' };
        }
    }

    getStoreServices(store) {
        const services = [];
        if (store.delivery) services.push('Delivery');
        if (store.pickup) services.push('Retiro');
        if (store.warranty) services.push('Garantía');
        return services;
    }

    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        loadingState?.classList.add('hidden');
    }

    showError() {
        const loadingState = document.getElementById('loadingState');
        const container = document.getElementById('listView');
        
        loadingState?.classList.add('hidden');
        
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="mx-auto h-16 w-16 text-red-400 mb-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Error al cargar ubicaciones</h3>
                    <p class="text-gray-600 mb-4">No se pudieron cargar las ubicaciones de las tiendas.</p>
                    <button onclick="location.reload()" class="bg-custom-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UbicacionesApp();
});