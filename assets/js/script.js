// === Carousel/Slider Logic ===
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;
  const viewport = carousel.querySelector('.carousel__viewport');
  const slides = Array.from(carousel.querySelectorAll('.carousel__slide'));
  const prevBtn = carousel.querySelector('.carousel__nav--prev');
  const nextBtn = carousel.querySelector('.carousel__nav--next');
  const dotsContainer = carousel.querySelector('.carousel__dots');
  let current = 0;
  let interval = null;
  let isPaused = false;
  let startX = null;
  let deltaX = 0;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir al slide ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function update() {
    viewport.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('button').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      dot.tabIndex = i === current ? 0 : -1;
    });
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== current);
      slide.tabIndex = i === current ? 0 : -1;
    });
  }

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    update();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Keyboard navigation
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
  });
  carousel.tabIndex = 0;

  // Autoplay
  function startAutoplay() {
    if (interval) clearInterval(interval);
    interval = setInterval(() => { if (!isPaused) next(); }, 3000);
  }
  function stopAutoplay() { if (interval) clearInterval(interval); }

  carousel.addEventListener('mouseenter', () => { isPaused = true; });
  carousel.addEventListener('mouseleave', () => { isPaused = false; });

  // Touch/Swipe support
  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      deltaX = 0;
    }
  });
  viewport.addEventListener('touchmove', e => {
    if (startX !== null) {
      deltaX = e.touches[0].clientX - startX;
    }
  });
  viewport.addEventListener('touchend', () => {
    if (startX !== null && Math.abs(deltaX) > 40) {
      if (deltaX > 0) prev();
      else next();
    }
    startX = null;
    deltaX = 0;
  });

  // Pause autoplay on focus (accessibility)
  carousel.addEventListener('focusin', () => { isPaused = true; });
  carousel.addEventListener('focusout', () => { isPaused = false; });

  // Init
  update();
  startAutoplay();
});
// === Mobile Sidebar Logic ===
document.addEventListener('DOMContentLoaded', function () {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const sidebarClose = document.querySelector('.sidebar__close');
  const body = document.body;

  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    body.classList.add('sidebar-open'); // Ocultar topbar en móvil
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden'; // Prevenir scroll del body
    
    // Focus en el botón de cerrar primero en móvil, luego en el primer enlace
    if (window.innerWidth <= 768) {
      const closeBtn = sidebar.querySelector('.sidebar__close');
      if (closeBtn) {
        closeBtn.focus();
      }
    } else {
      const firstLink = sidebar.querySelector('.sidebar__nav a');
      if (firstLink) {
        firstLink.focus();
      }
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('sidebar-open'); // Mostrar topbar nuevamente
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    body.style.overflow = ''; // Restaurar scroll del body
    
    // Retornar focus al botón de menú
    mobileMenuBtn.focus();
  }

  // Event listeners
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  // Cerrar al hacer clic en el overlay
  overlay.addEventListener('click', closeSidebar);

  // Cerrar con tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // Manejar cambios de tamaño de ventana
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1024 && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });

  // Navigation con teclado dentro del sidebar
  sidebar.addEventListener('keydown', function(e) {
    if (!sidebar.classList.contains('active')) return;

    const focusableElements = sidebar.querySelectorAll('.sidebar__close, .sidebar__nav a');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Trap focus dentro del sidebar
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
});

// === Bottom Navigation Logic ===
document.addEventListener('DOMContentLoaded', function () {
  const bottomNav = document.querySelector('.bottom-nav');
  const categoriesBtn = document.querySelector('.bottom-nav__categories');
  const sidebar = document.querySelector('.sidebar');
  const body = document.body;

  // Función para abrir sidebar desde bottom nav
  function openSidebarFromBottomNav() {
    if (!sidebar) return;
    
    // Reutilizar la función existente si existe
    const existingMobileBtn = document.querySelector('.mobile-menu-btn');
    if (existingMobileBtn) {
      existingMobileBtn.click();
    } else {
      // Implementación directa si no existe el botón móvil
      sidebar.classList.add('active');
      let overlay = document.querySelector('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        body.appendChild(overlay);
        
        // Cerrar al hacer clic en el overlay
        overlay.addEventListener('click', closeSidebarFromBottomNav);
      }
      overlay.classList.add('active');
      body.classList.add('sidebar-open');
      body.style.overflow = 'hidden';
      
      // Actualizar estado del botón
      categoriesBtn.setAttribute('aria-expanded', 'true');
      categoriesBtn.classList.add('active');
    }
  }

  function closeSidebarFromBottomNav() {
    if (!sidebar) return;
    
    sidebar.classList.remove('active');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    body.classList.remove('sidebar-open');
    body.style.overflow = '';
    
    // Actualizar estado del botón
    categoriesBtn.setAttribute('aria-expanded', 'false');
    categoriesBtn.classList.remove('active');
  }

  // Event listener para el botón de categorías
  if (categoriesBtn) {
    categoriesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const isExpanded = categoriesBtn.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        closeSidebarFromBottomNav();
      } else {
        openSidebarFromBottomNav();
      }
    });
  }

  // Detectar cuando el sidebar se cierre por otros medios
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!sidebar.classList.contains('active')) {
          categoriesBtn.setAttribute('aria-expanded', 'false');
          categoriesBtn.classList.remove('active');
        }
      }
    });
  });

  if (sidebar) {
    observer.observe(sidebar, { attributes: true });
  }

  // Actualizar estado activo según la página actual
  function updateActiveState() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const bottomNavItems = document.querySelectorAll('.bottom-nav__item');
    const desktopNavItems = document.querySelectorAll('.desktop-nav__item');
    
    // Actualizar bottom navigation
    bottomNavItems.forEach(item => {
      item.classList.remove('active');
      
      // Activar Home para index.html
      if (currentPage === 'index.html' && item.getAttribute('href') === 'index.html') {
        item.classList.add('active');
      }
      // Activar Tiendas para tiendas.html y vendor.html
      else if ((currentPage === 'tiendas.html' || currentPage === 'vendor.html') && 
               item.getAttribute('href') === 'tiendas.html') {
        item.classList.add('active');
      }
      // Activar Ubicaciones para ubicaciones.html
      else if (currentPage === 'ubicaciones.html' && item.getAttribute('href') === 'ubicaciones.html') {
        item.classList.add('active');
      }
    });

    // Actualizar desktop navigation
    desktopNavItems.forEach(item => {
      item.classList.remove('active');
      
      // Activar Home para index.html
      if (currentPage === 'index.html' && item.getAttribute('href') === 'index.html') {
        item.classList.add('active');
      }
      // Activar Tiendas para tiendas.html y vendor.html
      else if ((currentPage === 'tiendas.html' || currentPage === 'vendor.html') && 
               item.getAttribute('href') === 'tiendas.html') {
        item.classList.add('active');
      }
      // Activar Ubicaciones para ubicaciones.html
      else if (currentPage === 'ubicaciones.html' && item.getAttribute('href') === 'ubicaciones.html') {
        item.classList.add('active');
      }
    });
  }

  // Ejecutar al cargar la página
  updateActiveState();

  // Manejar cambios de tamaño de ventana para ocultar en desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 990) {
      // Cerrar sidebar si está abierto cuando se vuelve a desktop
      if (sidebar && sidebar.classList.contains('active')) {
        closeSidebarFromBottomNav();
      }
    }
  });
});

// === Desktop Navigation Logic ===
document.addEventListener('DOMContentLoaded', function () {
  const desktopNav = document.querySelector('.desktop-nav');
  
  if (!desktopNav) return;

  // Actualizar estado activo según la página actual
  function updateDesktopActiveState() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const desktopNavItems = document.querySelectorAll('.desktop-nav__item');
    
    desktopNavItems.forEach(item => {
      item.classList.remove('active');
      
      // Activar Home para index.html
      if (currentPage === 'index.html' && item.getAttribute('href') === 'index.html') {
        item.classList.add('active');
      }
      // Activar Tiendas para listado_box.html
      else if (currentPage === 'listado_box.html' && item.getAttribute('href') === 'listado_box.html') {
        item.classList.add('active');
      }
    });
  }

  // Ejecutar al cargar la página
  updateDesktopActiveState();
});

// === Recommended Products Carousel ===
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector('.recommended__carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.recommended__viewport');
  const track = carousel.querySelector('.recommended__track');
  const items = track.querySelectorAll('.recommended__item');
  const prevBtn = document.querySelector('.recommended__nav--prev');
  const nextBtn = document.querySelector('.recommended__nav--next');

  let currentIndex = 0;
  let itemsPerView = getItemsPerView();
  let itemWidth = 0;
  let itemGap = 20;

  function getItemsPerView() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) return 1.5;
    if (screenWidth <= 768) return 2.5;
    if (screenWidth <= 1024) return 3;
    return 4;
  }

  function calculateItemWidth() {
    const carouselWidth = viewport.offsetWidth;
    const totalGap = itemGap * (itemsPerView - 1);
    itemWidth = (carouselWidth - totalGap) / itemsPerView;
    
    // Aplicar ancho a los items
    items.forEach(item => {
      item.style.flexBasis = `${itemWidth}px`;
      item.style.minWidth = `${itemWidth}px`;
    });
  }

  function updateCarousel() {
    const translateX = -(currentIndex * (itemWidth + itemGap));
    track.style.transform = `translateX(${translateX}px)`;
    updateButtons();
  }

  function updateButtons() {
    const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));
    
    if (prevBtn) {
      prevBtn.disabled = currentIndex <= 0;
    }
    
    if (nextBtn) {
      nextBtn.disabled = currentIndex >= maxIndex;
    }
  }

  function goToPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  function goToNext() {
    const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }

  // Event listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', goToPrev);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', goToNext);
  }

  // Touch/swipe functionality
  let startX = 0;
  let isDragging = false;
  let startTransform = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    startTransform = currentIndex * (itemWidth + itemGap);
    track.style.transition = 'none';
  });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    const newTransform = -(startTransform + diffX);
    
    track.style.transform = `translateX(${newTransform}px)`;
  });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    
    isDragging = false;
    track.style.transition = 'transform 0.4s ease-in-out';
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = itemWidth / 3;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    } else {
      updateCarousel();
    }
  });

  // Mouse drag functionality for desktop
  let mouseStartX = 0;
  let isMouseDragging = false;
  let mouseStartTransform = 0;

  track.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    isMouseDragging = true;
    mouseStartTransform = currentIndex * (itemWidth + itemGap);
    track.style.transition = 'none';
    track.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isMouseDragging) return;
    
    const currentX = e.clientX;
    const diffX = mouseStartX - currentX;
    const newTransform = -(mouseStartTransform + diffX);
    
    track.style.transform = `translateX(${newTransform}px)`;
  });

  document.addEventListener('mouseup', (e) => {
    if (!isMouseDragging) return;
    
    isMouseDragging = false;
    track.style.transition = 'transform 0.4s ease-in-out';
    track.style.cursor = 'grab';
    
    const endX = e.clientX;
    const diffX = mouseStartX - endX;
    const threshold = itemWidth / 3;
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    } else {
      updateCarousel();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('.recommended')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      itemsPerView = getItemsPerView();
      calculateItemWidth();
      
      // Ajustar currentIndex si es necesario
      const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      
      updateCarousel();
    }, 150);
  });

  // Initialize carousel
  function init() {
    if (items.length === 0) return;
    
    calculateItemWidth();
    updateCarousel();
    
    // Set initial cursor style
    track.style.cursor = 'grab';
    
    // Auto-play functionality (opcional)
    if (items.length > itemsPerView) {
      let autoPlayInterval = setInterval(() => {
        const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));
        if (currentIndex >= maxIndex) {
          currentIndex = 0;
        } else {
          currentIndex++;
        }
        updateCarousel();
      }, 5000);
      
      // Pause auto-play on hover
      carousel.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
      });
      
      carousel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
          const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView));
          if (currentIndex >= maxIndex) {
            currentIndex = 0;
          } else {
            currentIndex++;
          }
          updateCarousel();
        }, 5000);
      });
    }
  }

  // Start the carousel
  init();
});

// === Desktop Navigation Auto-Hide on Scroll ===
// COMENTADO: Auto-hide desactivado para mantener navbar fija
/*
document.addEventListener('DOMContentLoaded', function() {
  const desktopNav = document.querySelector('.desktop-nav');
  if (!desktopNav) return;

  let lastScrollY = 0;
  let isScrollingDown = false;
  let navHeight = desktopNav.offsetHeight;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Solo aplicar en desktop
    if (window.innerWidth <= 990) {
      desktopNav.classList.remove('nav-hidden');
      return;
    }

    // Determinar dirección del scroll
    if (currentScrollY > lastScrollY && currentScrollY > navHeight) {
      // Scrolling down & past nav height
      if (!isScrollingDown) {
        isScrollingDown = true;
        desktopNav.classList.add('nav-hidden');
      }
    } else if (currentScrollY < lastScrollY || currentScrollY <= navHeight) {
      // Scrolling up or at top
      if (isScrollingDown) {
        isScrollingDown = false;
        desktopNav.classList.remove('nav-hidden');
      }
    }

    lastScrollY = currentScrollY;
  }

  // Throttle scroll events
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick);
  
  // Reset on resize
  window.addEventListener('resize', () => {
    navHeight = desktopNav.offsetHeight;
    if (window.innerWidth <= 990) {
      desktopNav.classList.remove('nav-hidden');
      isScrollingDown = false;
    }
  });
});
*/

// === Sistema de Autenticación ===
document.addEventListener('DOMContentLoaded', function() {
  // Configuración de storage
  const STORAGE_KEY = 'cp:user';
  
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  };
  
  const setUser = (u) => localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  const clearUser = () => localStorage.removeItem(STORAGE_KEY);

  // Referencias al DOM
  const modal = document.getElementById('loginModal');
  const btnLogin = document.getElementById('btnLogin');
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('loginSubmit');
  const errorEl = document.getElementById('loginError');

  // Funciones para modal
  function openLogin() {
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const emailInput = modal.querySelector('input[name="email"]');
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100);
      }
    }
  }

  function closeLogin() {
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // Event listeners del modal
  if (btnLogin) {
    btnLogin.addEventListener('click', openLogin);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close], .modal__backdrop')) {
        closeLogin();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
      closeLogin();
    }
  });

  // Validación y login fake
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }
      
      const fd = new FormData(form);
      const email = (fd.get('email') || '').toString().trim();
      const pass = (fd.get('password') || '').toString();
      
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      
      if (!validEmail) {
        if (errorEl) {
          errorEl.textContent = 'Ingresá un email válido.';
          errorEl.hidden = false;
        }
        return;
      }
      
      if (pass.length < 6) {
        if (errorEl) {
          errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
          errorEl.hidden = false;
        }
        return;
      }
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Ingresando…';
      }
      
      setTimeout(() => {
        setUser({
          name: email.split('@')[0],
          email: email
        });
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Ingresar';
        }
        
        // Limpiar formulario
        form.reset();
        
        closeLogin();
        paintAuthState();
      }, 900);
    });
  }

  // Función para pintar el estado de autenticación
  function paintAuthState() {
    const user = getUser();
    const actions = document.querySelector('.actions');
    
    if (!actions) return;

    // Remover menú existente si existe
    const existing = actions.querySelector('.account-menu');
    if (existing) {
      existing.remove();
    }

    if (user) {
      // Usuario logueado: ocultar botón login y mostrar menú de cuenta
      const loginBtn = actions.querySelector('#btnLogin');
      if (loginBtn) {
        loginBtn.classList.add('hidden');
      }

      const wrap = document.createElement('div');
      wrap.className = 'account-menu';
      wrap.innerHTML = `
        <button class="action-btn" id="btnAccount" aria-haspopup="true" aria-expanded="false">
          ${user.name || 'Mi cuenta'}
        </button>
        <div class="account-dropdown" role="menu">
          <a href="#" role="menuitem">Perfil (pronto)</a>
          <button type="button" id="btnLogout" role="menuitem">Cerrar sesión</button>
        </div>`;
      
      actions.appendChild(wrap);

      const btnAcc = wrap.querySelector('#btnAccount');
      const dropdown = wrap.querySelector('.account-dropdown');
      
      if (btnAcc && dropdown) {
        btnAcc.addEventListener('click', () => {
          const open = wrap.classList.toggle('open');
          btnAcc.setAttribute('aria-expanded', String(open));
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
          if (!wrap.contains(e.target)) {
            wrap.classList.remove('open');
            btnAcc.setAttribute('aria-expanded', 'false');
          }
        });

        // Logout
        const logoutBtn = wrap.querySelector('#btnLogout');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => {
            clearUser();
            paintAuthState();
          });
        }
      }
    } else {
      // Usuario no logueado: mostrar botón login
      const loginBtn = actions.querySelector('#btnLogin');
      if (loginBtn) {
        loginBtn.classList.remove('hidden');
      }
    }
  }

  // HOOKS para Supabase (preparados para integración futura)
  const googleBtn = document.getElementById('loginGoogle');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      alert('Google se activará cuando conectemos Supabase.');
      // TODO: Reemplazar por supabase.auth.signInWithOAuth({ provider: 'google' })
    });
  }

  const forgotBtn = document.getElementById('forgotPass');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => {
      alert('Función disponible cuando integremos el servicio de autenticación.');
      // TODO: Implementar reset de contraseña con Supabase
    });
  }

  const createBtn = document.getElementById('createAccount');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      alert('Función disponible cuando integremos el servicio de autenticación.');
      // TODO: Implementar registro con Supabase
    });
  }

  // Inicializar estado de autenticación al cargar la página
  paintAuthState();
});

// === Sistema de Lista de Deseos (Wishlist) ===
document.addEventListener('DOMContentLoaded', function() {
  // Storage key para favoritos (reutilizando la existente)
  const FAVS_KEY = 'cp:favs';
  
  // Helper functions
  const loadFavs = () => {
    try {
      return JSON.parse(localStorage.getItem(FAVS_KEY) || '[]');
    } catch {
      return [];
    }
  };
  
  const saveFavs = (arr) => localStorage.setItem(FAVS_KEY, JSON.stringify(arr));
  
  // Referencias al DOM
  const drawer = document.getElementById('wishlistDrawer');
  const btnWl = document.getElementById('btnWishlist');
  const wlList = document.getElementById('wlList');
  const wlClear = document.getElementById('wlClear');
  const wlCount = document.getElementById('wlCount');

  // Función para actualizar contador en header
  function paintWishlistCount() {
    if (!wlCount) return;
    const count = loadFavs().length;
    wlCount.textContent = String(count);
  }

  // Cache para almacenar datos de productos
  const productCache = new Map();

  // Función para obtener datos de producto por ID
  async function getProductDataById(id) {
    // Verificar cache primero
    if (productCache.has(id)) {
      return productCache.get(id);
    }

    // Intentar desde el DOM (para productos ya cargados)
    const selectors = [
      `.card[data-card-id="${id}"]`,
      `[data-product-id="${id}"]`,
      `.product-card[data-id="${id}"]`
    ];
    
    let card = null;
    for (const selector of selectors) {
      card = document.querySelector(selector);
      if (card) break;
    }
    
    if (card) {
      // Extraer datos de la card
      const nameSelectors = ['.card__title', '.product-title', 'h3', 'h4', '.title', '.product-name', '[data-product-name]'];
      const priceSelectors = ['.card__price', '.product-price', '.price', '.text-emerald-600'];
      const imgSelectors = ['.card__img img', 'img', '.product-image', '.card img', '[data-img]'];
      
      let name = '';
      for (const sel of nameSelectors) {
        const el = card.querySelector(sel);
        if (el?.textContent?.trim()) {
          name = el.textContent.trim();
          console.log(`Nombre encontrado con selector '${sel}':`, name);
          break;
        }
        // También verificar atributos data
        if (el?.dataset?.name) {
          name = el.dataset.name;
          console.log(`Nombre encontrado en data-name:`, name);
          break;
        }
      }
      
      // Si no se encontró nombre, intentar desde el atributo title o alt de la imagen
      if (!name) {
        const titleEl = card.querySelector('[title]');
        if (titleEl?.title) {
          name = titleEl.title;
          console.log('Nombre desde title:', name);
        }
      }
      
      let price = '';
      for (const sel of priceSelectors) {
        const el = card.querySelector(sel);
        if (el?.textContent?.trim()) {
          price = el.textContent.trim();
          break;
        }
      }
      
      let img = '';
      for (const sel of imgSelectors) {
        const el = card.querySelector(sel);
        if (el?.src && el.src !== '' && el.src !== 'undefined' && !el.src.includes('undefined')) {
          img = el.src;
          break;
        }
        // También verificar data attributes
        if (el?.dataset?.img && el.dataset.img !== '' && el.dataset.img !== 'undefined') {
          img = el.dataset.img;
          break;
        }
      }
      
      const productData = { id, name: name || `Producto #${id}`, price, img };
      console.log('Datos extraídos del DOM:', productData);
      productCache.set(id, productData);
      return productData;
    }

    // Intentar obtener desde Supabase si ProductService está disponible
    if (typeof ProductService !== 'undefined') {
      try {
        const productService = new ProductService();
        console.log(`\n>>> BUSCANDO PRODUCTO EN SUPABASE CON UUID: ${id} <<<`);
        const response = await productService.getProductById(id);
        
        console.log('Respuesta completa de Supabase:', response);
        
        if (response.success && response.data) {
          const product = response.data;
          console.log('=== DATOS COMPLETOS DESDE SUPABASE ===');
          console.log('Producto completo:', JSON.stringify(product, null, 2));
          console.log('ID:', product.id);
          console.log('Nombre (product.nombre):', product.nombre);
          console.log('Precio (product.precio):', product.precio);
          console.log('Imagen (product.imagen):', product.imagen);
          console.log('Tienda:', product.tiendas);
          console.log('==========================================');
          
          // Extraer nombre del producto con verificación estricta
          let productName = '';
          if (product.nombre && typeof product.nombre === 'string' && product.nombre.trim() !== '') {
            productName = product.nombre.trim();
            console.log('✓ Usando nombre desde BD (product.nombre):', productName);
          } else {
            console.log('⚠ Campo product.nombre vacío o no existe');
            console.log('Campos disponibles en product:', Object.keys(product));
            // Intentar otros posibles campos
            productName = product.name || product.title || product.nombre_producto || `Sin nombre (${id.substring(0, 8)})`;
            console.log('✓ Usando nombre fallback:', productName);
          }
          
          // Manejar imagen con fallbacks
          let imageUrl = product.imagen || '';
          
          // Si no hay imagen, intentar construir URL desde Supabase Storage
          if (!imageUrl || imageUrl === '') {
            // Primero intentar desde el storage
            const supabaseUrl = 'https://ckcbzefrzjhnbbdaenrg.supabase.co';
            imageUrl = `${supabaseUrl}/storage/v1/object/public/products/${product.id}.jpg`;
            console.log('Intentando imagen desde storage:', imageUrl);
          }
          
          // Si aún no hay imagen válida, usar imagen placeholder genérica
          if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
            // Usar SVG inline como placeholder
            imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjAgNjBIMTQwVjE0MEg2MFY2MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iODAiIGN5PSI4NSIgcj0iMTAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTYwIDIwMEwxMDAgMTIwTDEyMCAxNDBMMTQwIDkwTDE4MCAxNDBWMjAwSDYwWiIgZmlsbD0iIzlDQTNBRiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlByb2R1Y3RvPC90ZXh0Pjwvc3ZnPg==';
            console.log('Usando SVG placeholder inline');
          }
          
          const productData = {
            id: product.id,
            name: productName,
            price: product.precio ? `ARS ${parseFloat(product.precio).toFixed(2)}` : '',
            img: imageUrl,
            store: product.tiendas?.nombre || ''
          };
          
          console.log('=== DATOS FINALES DEL PRODUCTO ===');
          console.log('ID final:', productData.id);
          console.log('Nombre final:', productData.name);
          console.log('Precio final:', productData.price);
          console.log('Imagen final:', productData.img);
          console.log('Tienda final:', productData.store);
          console.log('===================================');
          productCache.set(id, productData);
          return productData;
        } else {
          console.log('⚠ Respuesta de Supabase sin datos válidos:');
          console.log('- response.success:', response?.success);
          console.log('- response.data:', response?.data);
          console.log('- response.message:', response?.message);
          console.log('- response.error:', response?.error);
        }
      } catch (error) {
        console.error('❌ Error obteniendo producto desde Supabase:', error);
        console.log('Error details:', {
          message: error.message,
          stack: error.stack,
          productId: id
        });
      }
    } else {
      console.log('⚠ ProductService no está disponible');
    }
    
    // Fallback: datos genéricos cuando no se puede obtener desde Supabase
    const shortId = id.length > 8 ? id.substring(0, 8) + '...' : id;
    const fallbackData = { 
      id, 
      name: `Producto ${shortId}`, 
      price: '', 
      img: '',
      store: ''
    };
    
    console.log(`⚠ Usando datos fallback para UUID ${id}:`, fallbackData);
    productCache.set(id, fallbackData);
    return fallbackData;
    productCache.set(id, fallbackData);
    return fallbackData;
  }

  // Función para renderizar la lista de deseos
  async function renderWishlist() {
    if (!wlList) return;
    
    const favs = loadFavs();
    console.log('Favoritos cargados:', favs);
    wlList.innerHTML = '';
    
    if (!favs.length) {
      wlList.innerHTML = `
        <div class="wl-empty">
          <div class="wl-empty__icon">♥</div>
          <p class="wl-empty__title">Tu lista está vacía</p>
          <p class="wl-empty__subtitle">Agrega productos tocando el corazón en las cards</p>
        </div>`;
      return;
    }

    // Mostrar indicador de carga
    wlList.innerHTML = `
      <div class="wl-loading">
        <div class="wl-loading__spinner"></div>
        <p>Cargando productos...</p>
      </div>`;
    
    try {
      // Cargar todos los productos favoritos
      console.log('Obteniendo datos para productos:', favs);
      const productPromises = favs.map(id => getProductDataById(id));
      const products = await Promise.all(productPromises);
      
      console.log('Productos obtenidos:', products);
      
      // Limpiar y renderizar productos
      wlList.innerHTML = '';
      
      products.forEach((product, index) => {
        const id = favs[index];
        const item = document.createElement('div');
        item.className = 'wl-item';
        
        // Generar placeholder si no hay imagen válida
        const productName = product.name || `Producto #${id}`;
        const placeholder = productName.charAt(0).toUpperCase();
        const imageUrl = product.img;
        
        // Validar si la imagen es válida
        const hasValidImage = imageUrl && 
                            imageUrl !== '' && 
                            imageUrl !== null && 
                            imageUrl !== 'null' && 
                            imageUrl !== 'undefined' && 
                            typeof imageUrl === 'string' && 
                            imageUrl.length > 3 && // Mínimo una URL válida
                            (imageUrl.startsWith('http') || imageUrl.startsWith('https') || 
                             imageUrl.startsWith('./') || imageUrl.startsWith('../') ||
                             imageUrl.startsWith('/') || imageUrl.startsWith('data:'));
        
        console.log(`\n=== PRODUCTO ${id} ===`);
        console.log('Nombre:', productName);
        console.log('URL imagen original:', product.img);
        console.log('URL imagen procesada:', imageUrl);
        console.log('¿Imagen válida?:', hasValidImage);
        console.log('Longitud URL:', imageUrl?.length || 0);
        console.log('========================\n');
        
        item.innerHTML = `
          <div class="wl-item__image">
            ${hasValidImage ? 
              `<img src="${imageUrl}" alt="${productName}" loading="lazy" 
                   onerror="
                     console.warn('Error cargando imagen:', '${imageUrl}'); 
                     this.parentNode.innerHTML='<div class=\"wl-item__placeholder\" title=\"Imagen no disponible\"><span>${placeholder}</span></div>';
                   ">` : 
              `<div class="wl-item__placeholder" title="${productName} - Sin imagen"><span>${placeholder}</span></div>`
            }
          </div>
          <div class="wl-item__content">
            <h4 class="wl-item__name" title="${productName}">${productName}</h4>
          </div>
          <div class="wl-item__actions">
            <button class="wl-item__btn wl-item__btn--view" onclick="window.open('producto.html?id=${encodeURIComponent(id)}', '_blank')" title="Ver producto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="wl-item__btn wl-item__btn--remove" data-remove="${id}" title="Quitar de favoritos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>`;
        
        wlList.appendChild(item);
      });

      // Event listeners para botones "Quitar"
      wlList.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-remove');
          let favs = loadFavs().filter(x => String(x) !== String(id));
          saveFavs(favs);
          
          // Limpiar cache del producto
          productCache.delete(id);
          
          // Actualizar UI del botón fav si existe
          const favBtn = document.querySelector(`[data-card-id="${id}"] .fav-btn, [data-product-id="${id}"] .fav-btn`);
          if (favBtn) {
            favBtn.classList.remove('active');
            favBtn.setAttribute('aria-pressed', 'false');
          }
          
          // Disparar evento de actualización
          document.dispatchEvent(new CustomEvent('cp:favs:updated'));
          renderWishlist();
        });
      });
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      wlList.innerHTML = `
        <div style="opacity:.7;padding:20px;text-align:center;color:#ef4444;">
          <p>Error al cargar favoritos</p>
          <small>Intenta de nuevo en unos momentos</small>
        </div>`;
    }
  }

  // Función para abrir drawer
  const openWishlist = () => {
    if (drawer) {
      drawer.setAttribute('aria-hidden', 'false');
      btnWl?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      
      // Debug temporal
      const favs = loadFavs();
      console.log('Favoritos cargados:', favs);
      
      renderWishlist();
    }
  };

  // Función para cerrar drawer
  const closeWishlist = () => {
    if (drawer) {
      drawer.setAttribute('aria-hidden', 'true');
      btnWl?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  // Event listeners para abrir/cerrar
  if (btnWl) {
    btnWl.addEventListener('click', openWishlist);
  }

  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target.matches('[data-close], .wl-backdrop')) {
        closeWishlist();
      }
    });
  }

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.getAttribute('aria-hidden') === 'false') {
      closeWishlist();
    }
  });

  // Event listener para vaciar lista
  if (wlClear) {
    wlClear.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres vaciar tu lista de deseos?')) {
        saveFavs([]);
        
        // Actualizar todos los botones fav
        document.querySelectorAll('.fav-btn.active').forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });
        
        // Disparar evento de actualización
        document.dispatchEvent(new CustomEvent('cp:favs:updated'));
        renderWishlist();
      }
    });
  }

  // Sincronización con cambios de favoritos
  document.addEventListener('cp:favs:updated', () => {
    paintWishlistCount();
    updateFavoriteButtonsState();
  });
  
  // Sincronización con storage de otras pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === FAVS_KEY) {
      paintWishlistCount();
      updateFavoriteButtonsState();
      // Actualizar drawer si está abierto
      if (drawer?.getAttribute('aria-hidden') === 'false') {
        renderWishlist();
      }
    }
  });

  // Inicializar contador al cargar
  paintWishlistCount();

  // === Sistema de Botones de Favoritos ===
  // Función para actualizar estado visual de todos los botones de favoritos
  function updateFavoriteButtonsState() {
    const favs = loadFavs();
    document.querySelectorAll('.fav-btn').forEach(btn => {
      const productId = btn.getAttribute('data-product-id');
      const isFavorite = favs.includes(String(productId));
      
      btn.classList.toggle('active', isFavorite);
      btn.setAttribute('aria-pressed', String(isFavorite));
      
      const icon = btn.querySelector('.fav-icon');
      if (icon) {
        icon.style.color = isFavorite ? '#ef4444' : '';
      }
    });
  }

  // Event listener global para botones de favoritos
  document.addEventListener('click', function(e) {
    if (e.target.closest('.fav-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const btn = e.target.closest('.fav-btn');
      const productId = btn.getAttribute('data-product-id') || btn.getAttribute('data-card-id');
      
      if (!productId) {
        console.warn('No se encontró ID de producto en el botón de favoritos');
        return;
      }
      
      console.log('Botón de favoritos clickeado, producto ID:', productId);
      
      let favs = loadFavs();
      console.log('Favoritos actuales:', favs);
      const isFavorite = favs.includes(String(productId));
      
      if (isFavorite) {
        // Remover de favoritos
        favs = favs.filter(id => String(id) !== String(productId));
        console.log('Removiendo producto de favoritos');
      } else {
        // Agregar a favoritos
        favs.push(String(productId));
        console.log('Agregando producto a favoritos');
      }
      
      saveFavs(favs);
      console.log('Favoritos después del cambio:', favs);
      updateFavoriteButtonsState();
      
      // Disparar evento para actualizar el contador de wishlist
      document.dispatchEvent(new CustomEvent('cp:favs:updated'));
    }
  });

  // Escuchar cuando se renderizan nuevas cards
  document.addEventListener('cards:rendered', () => {
    setTimeout(updateFavoriteButtonsState, 100);
  });

  // Sincronización con cambios de favoritos
  document.addEventListener('cp:favs:updated', () => {
    paintWishlistCount();
    updateFavoriteButtonsState();
  });
  
  // Inicializar estado de botones al cargar
  setTimeout(updateFavoriteButtonsState, 200);
});