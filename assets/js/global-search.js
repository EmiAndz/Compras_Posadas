/**
 * Sistema de búsqueda global para Compras Posadas
 * Funciona en todas las páginas de la aplicación
 */

class GlobalSearchBar {
  constructor(options = {}) {
    // Configuración por defecto
    this.config = {
      searchInputId: options.searchInputId || 'searchInput',
      searchFormClass: options.searchFormClass || 'search',
      clearBtnId: options.clearBtnId || 'clearSearchBtn',
      suggestionTextId: options.suggestionTextId || 'suggestionText',
      searchLoadingId: options.searchLoadingId || 'searchLoading',
      suggestionId: options.suggestionId || 'searchSuggestion',
      dropdownId: options.dropdownId || 'searchDropdown',
      placeholder: options.placeholder || 'Buscar por producto, categoría, tienda',
      enableDropdown: options.enableDropdown !== false, // Por defecto activado
      ...options
    };

    // Elementos DOM
    this.searchInput = null;
    this.searchForm = null;
    this.clearBtn = null;
    this.suggestionText = null;
    this.searchLoading = null;
    this.suggestion = null;
    this.dropdown = null;

    // Estado
    this.currentSuggestion = null;
    this.searchTimeout = null;
    this.isLoading = false;

    this.init();
  }

  init() {
    // Buscar elementos por ID o clase
    this.findElements();
    
    // Solo continuar si encontramos al menos el formulario de búsqueda
    if (!this.searchForm) {
      console.log('Global Search: No se encontró formulario de búsqueda en esta página');
      return;
    }

    // Configurar elementos si no existen
    this.setupElements();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    console.log('Global Search: Inicializado correctamente');
  }

  findElements() {
    // Buscar por ID específicos
    this.searchInput = document.getElementById(this.config.searchInputId);
    this.clearBtn = document.getElementById(this.config.clearBtnId);
    this.suggestionText = document.getElementById(this.config.suggestionTextId);
    this.searchLoading = document.getElementById(this.config.searchLoadingId);
    this.suggestion = document.getElementById(this.config.suggestionId);
    this.dropdown = document.getElementById(this.config.dropdownId);

    // Buscar formulario por clase
    this.searchForm = document.querySelector(`.${this.config.searchFormClass}`) || 
                     document.querySelector('form[role="search"]');

    // Si no encontramos input, buscar dentro del formulario
    if (!this.searchInput && this.searchForm) {
      this.searchInput = this.searchForm.querySelector('input[type="search"]');
    }
  }

  setupElements() {
    if (!this.searchInput) return;

    // Configurar placeholder
    if (this.config.placeholder) {
      this.searchInput.placeholder = this.config.placeholder;
    }

    // Si tenemos dropdown habilitado pero no existe, crearlo
    if (this.config.enableDropdown && !this.dropdown) {
      this.createDropdownElements();
    }
  }

  createDropdownElements() {
    if (!this.searchForm) return;

    // Crear estructura de dropdown si no existe
    const container = this.searchForm.querySelector('.search__container') || 
                     this.createSearchContainer();

    if (!this.dropdown) {
      this.dropdown = this.createDropdown();
      container.appendChild(this.dropdown);
    }
  }

  createSearchContainer() {
    const container = document.createElement('div');
    container.className = 'search__container';
    container.style.position = 'relative';
    container.style.width = '100%';

    // Envolver el input existente
    const inputWrapper = this.searchInput.parentElement;
    inputWrapper.appendChild(container);
    container.appendChild(inputWrapper);

    return container;
  }

  createDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'search__dropdown';
    dropdown.id = this.config.dropdownId;
    dropdown.style.display = 'none';

    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'search__suggestion-item';
    suggestionItem.id = this.config.suggestionId;

    const suggestionText = document.createElement('span');
    suggestionText.className = 'search__suggestion-text';
    suggestionText.id = this.config.suggestionTextId;

    const loading = document.createElement('div');
    loading.className = 'search__loading';
    loading.id = this.config.searchLoadingId;
    loading.style.display = 'none';

    const spinner = document.createElement('div');
    spinner.className = 'search__spinner';

    loading.appendChild(spinner);
    suggestionItem.appendChild(suggestionText);
    suggestionItem.appendChild(loading);
    dropdown.appendChild(suggestionItem);

    // Actualizar referencias
    this.suggestion = suggestionItem;
    this.suggestionText = suggestionText;
    this.searchLoading = loading;

    return dropdown;
  }

  setupEventListeners() {
    if (!this.searchInput || !this.searchForm) return;

    // Input events
    this.searchInput.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    // Form submit
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch();
    });

    // Clear button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Dropdown events (solo si está habilitado)
    if (this.config.enableDropdown) {
      this.setupDropdownEvents();
    }
  }

  setupDropdownEvents() {
    if (!this.searchInput) return;

    // Focus events
    this.searchInput.addEventListener('focus', () => {
      if (this.currentSuggestion && this.dropdown) {
        this.showDropdown();
      }
    });

    // Suggestion click
    if (this.suggestion) {
      this.suggestion.addEventListener('click', () => {
        if (this.currentSuggestion) {
          this.goToProduct(this.currentSuggestion.id);
        }
      });
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search__container') && 
          !e.target.closest('.search')) {
        this.hideDropdown();
      }
    });
  }

  handleInput(query) {
    // Mostrar/ocultar botón de limpiar
    this.updateClearButton(query.length > 0);

    if (query.length === 0) {
      this.hideSuggestion();
      return;
    }

    // Solo buscar sugerencias si el dropdown está habilitado
    if (this.config.enableDropdown && query.length >= 2) {
      // Debounce para búsqueda
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchProducts(query);
      }, 300);
    } else if (!this.config.enableDropdown) {
      // Si no hay dropdown, solo actualizar el botón de limpiar
      this.hideSuggestion();
    }
  }

  updateClearButton(show) {
    if (this.clearBtn) {
      this.clearBtn.style.display = show ? 'flex' : 'none';
    }
  }

  async searchProducts(query) {
    if (this.isLoading || !this.config.enableDropdown) return;

    this.showLoading();

    try {
      // Verificar que Supabase esté disponible
      if (!window.supabaseClient) {
        throw new Error('Supabase no está disponible');
      }

      const { data, error } = await window.supabaseClient
        .from('productos')
        .select('id, nombre, precio')
        .ilike('nombre', `%${query}%`)
        .eq('activo', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        this.currentSuggestion = data;
        this.showSuggestion(data.nombre);
      } else {
        this.currentSuggestion = null;
        this.showNoResults();
      }

    } catch (error) {
      console.error('Error en búsqueda:', error);
      this.currentSuggestion = null;
      this.showError();
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    if (!this.config.enableDropdown) return;
    
    this.isLoading = true;
    if (this.suggestionText) {
      this.suggestionText.textContent = '';
    }
    if (this.searchLoading) {
      this.searchLoading.style.display = 'flex';
    }
    this.showDropdown();
  }

  hideLoading() {
    this.isLoading = false;
    if (this.searchLoading) {
      this.searchLoading.style.display = 'none';
    }
  }

  showDropdown() {
    if (this.dropdown && this.config.enableDropdown) {
      this.dropdown.style.display = 'block';
    }
  }

  hideDropdown() {
    if (this.dropdown) {
      this.dropdown.style.display = 'none';
    }
  }

  showSuggestion(productName) {
    if (!this.config.enableDropdown) return;
    
    if (this.suggestionText) {
      this.suggestionText.textContent = productName;
      this.suggestionText.style.color = '#2c3e50';
    }
    this.showDropdown();
  }

  showNoResults() {
    if (!this.config.enableDropdown) return;
    
    if (this.suggestionText) {
      this.suggestionText.textContent = 'Sin resultados';
      this.suggestionText.style.color = '#888';
    }
    this.showDropdown();
  }

  showError() {
    if (!this.config.enableDropdown) return;
    
    if (this.suggestionText) {
      this.suggestionText.textContent = 'Error de búsqueda';
      this.suggestionText.style.color = '#888';
    }
    this.showDropdown();
  }

  hideSuggestion() {
    if (this.suggestionText) {
      this.suggestionText.textContent = '';
    }
    this.currentSuggestion = null;
    this.hideDropdown();
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchInput.focus();
    }
    
    this.updateClearButton(false);
    this.hideSuggestion();
    this.hideLoading();

    // Limpiar timeout si existe
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  performSearch() {
    const query = this.searchInput ? this.searchInput.value.trim() : '';
    
    if (query) {
      // Si tenemos una sugerencia actual, ir directamente al producto
      if (this.currentSuggestion && this.currentSuggestion.id) {
        this.goToProduct(this.currentSuggestion.id);
      } else {
        // Si no hay sugerencia, buscar y redirigir
        this.searchAndRedirect(query);
      }
    }
  }

  goToProduct(productId) {
    window.location.href = `producto.html?id=${productId}`;
  }

  async searchAndRedirect(query) {
    try {
      // Verificar que Supabase esté disponible
      if (!window.supabaseClient) {
        this.goToSearchResults(query);
        return;
      }

      const { data, error } = await window.supabaseClient
        .from('productos')
        .select('id, nombre, precio')
        .ilike('nombre', `%${query}%`)
        .eq('activo', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Ir directamente al producto encontrado
        this.goToProduct(data.id);
      } else {
        // Si no hay resultados, ir a la página de búsqueda
        this.goToSearchResults(query);
      }

    } catch (error) {
      console.error('Error en búsqueda:', error);
      // En caso de error, ir a la página de búsqueda
      this.goToSearchResults(query);
    }
  }

  goToSearchResults(query) {
    window.location.href = `listado_tabla.html?q=${encodeURIComponent(query)}`;
  }

  // Método estático para inicializar automáticamente
  static autoInit() {
    document.addEventListener('DOMContentLoaded', function() {
      // Esperar a que Supabase esté disponible
      const initSearch = () => {
        if (window.supabaseClient || !window.supabaseClient) {
          // Inicializar incluso si Supabase no está disponible (sin dropdown)
          new GlobalSearchBar({
            enableDropdown: !!window.supabaseClient
          });
        } else {
          setTimeout(initSearch, 100);
        }
      };

      setTimeout(initSearch, 500);
    });
  }
}

// Inicialización automática
GlobalSearchBar.autoInit();

// Exportar para uso manual si es necesario
window.GlobalSearchBar = GlobalSearchBar;