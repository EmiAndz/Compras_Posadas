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
// Buscador con sugerencias
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.search');
  const input = form?.querySelector('input[type="search"]');
  if (!form || !input) return;

  const SUGGESTIONS = [
    'Xiaomi Redmi 13',
    'Motorola G54',
    'Auriculares Bluetooth',
    'Notebook 15.6"',
    'Perfume Carolina Herrera',
    'Smart TV 50"',
    'Apple iPhone 13'
  ];

  // Sugerencias
  const sugg = document.createElement('div');
  sugg.className = 'suggest';
  sugg.innerHTML = '<ul></ul>';
  form.appendChild(sugg);
  const list = sugg.querySelector('ul');
  let currentItems = [];
  let current = -1;

  const render = (items) => {
    list.innerHTML = items.map((t, i) => `<li data-i="${i}">${t}</li>`).join('');
    sugg.classList.toggle('visible', items.length > 0);
    current = -1;
  };

  const filter = (q) => {
    if (!q || q.trim().length < 2) { render([]); return; }
    const s = q.toLowerCase();
    currentItems = SUGGESTIONS.filter(x => x.toLowerCase().includes(s)).slice(0,6);
    render(currentItems);
  };

  input.addEventListener('input', (e) => {
    clearTimeout(input.__t);
    input.__t = setTimeout(() => filter(e.target.value), 180);
  });

  input.addEventListener('keydown', (e) => {
    const visible = sugg.classList.contains('visible');
    if (!visible) return;
    const items = [...list.querySelectorAll('li')];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      current = (current + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      current = (current - 1 + items.length) % items.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (current >= 0) input.value = currentItems[current];
      sugg.classList.remove('visible');
      form.submit();
      return;
    } else if (e.key === 'Escape') {
      sugg.classList.remove('visible');
      return;
    } else {
      return;
    }
    items.forEach((li,i)=> li.classList.toggle('active', i===current));
  });

  list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const i = +li.dataset.i;
    input.value = currentItems[i] || input.value;
    sugg.classList.remove('visible');
    form.submit();
  });

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) sugg.classList.remove('visible');
  });
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
    
    bottomNavItems.forEach(item => {
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