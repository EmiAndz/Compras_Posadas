/**
 * SCRIPT.JS - Funcionalidades generales de la aplicación
 * VERSIÓN LIMPIA - SIN SUPABASE
 */

// === Mobile Sidebar Logic ===
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const sidebarClose = document.querySelector('.sidebar__close');
  const body = document.body;
  
  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    display: none;
  `;
  body.appendChild(overlay);

  function openSidebar() {
    if (sidebar) {
      sidebar.classList.add('active');
      overlay.style.display = 'block';
      body.classList.add('sidebar-open');
    }
  }

  function closeSidebar() {
    if (sidebar) {
      sidebar.classList.remove('active');
      overlay.style.display = 'none';
      body.classList.remove('sidebar-open');
    }
  }

  // Event listeners
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openSidebar);
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  overlay.addEventListener('click', closeSidebar);

  // Bottom nav categories button
  const bottomNavCategories = document.querySelector('.bottom-nav__categories');
  if (bottomNavCategories) {
    bottomNavCategories.addEventListener('click', (e) => {
      e.preventDefault();
      openSidebar();
    });
  }
});

// === Modal Logic ===
document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('loginModal');
  const btnLogin = document.getElementById('btnLogin');
  const loginForm = document.getElementById('loginForm');

  // Función para abrir modal
  function openModal(modal) {
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // Función para cerrar modal
  function closeModal(modal) {
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // Event listeners para abrir modal
  if (btnLogin && loginModal) {
    btnLogin.addEventListener('click', () => openModal(loginModal));
  }

  // Event listeners para cerrar modal
  document.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) {
      const modal = e.target.closest('.modal');
      if (modal) closeModal(modal);
    }
  });

  // Cerrar modal con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal[aria-hidden="false"]');
      if (openModal) closeModal(openModal);
    }
  });

  // Manejar formulario de login (simulado)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Funcionalidad de login pendiente de implementar');
    });
  }
});

// === Wishlist Logic ===
document.addEventListener('DOMContentLoaded', function() {
  const wishlistBtn = document.querySelector('#btnWishlist');
  const wishlistDrawer = document.querySelector('#wishlistDrawer');
  const wishlistList = document.querySelector('#wlList');
  const wishlistCount = document.querySelector('#wlCount');
  const wishlistClear = document.querySelector('#wlClear');

  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

  function updateWishlistUI() {
    if (wishlistCount) {
      wishlistCount.textContent = wishlist.length;
    }

    if (wishlistList) {
      if (wishlist.length === 0) {
        wishlistList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Tu lista está vacía</p>';
      } else {
        wishlistList.innerHTML = wishlist.map(item => `
          <div class="wl-item" data-id="${item.id}">
            <div class="wl-item__content">
              <h4>${item.name}</h4>
              <p>$${item.price}</p>
            </div>
            <button class="wl-item__remove" onclick="removeFromWishlist('${item.id}')">×</button>
          </div>
        `).join('');
      }
    }
  }

  function openWishlist() {
    if (wishlistDrawer) {
      wishlistDrawer.setAttribute('aria-hidden', 'false');
      wishlistDrawer.style.display = 'block';
    }
  }

  function closeWishlist() {
    if (wishlistDrawer) {
      wishlistDrawer.setAttribute('aria-hidden', 'true');
      wishlistDrawer.style.display = 'none';
    }
  }

  window.addToWishlist = function(product) {
    if (!wishlist.find(item => item.id === product.id)) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      updateWishlistUI();
    }
  };

  window.removeFromWishlist = function(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
  };

  // Event listeners
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', openWishlist);
  }

  if (wishlistClear) {
    wishlistClear.addEventListener('click', () => {
      wishlist = [];
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      updateWishlistUI();
    });
  }

  // Cerrar wishlist
  document.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close') && e.target.closest('#wishlistDrawer')) {
      closeWishlist();
    }
  });

  // Inicializar UI
  updateWishlistUI();
});

// === Search Functionality ===
document.addEventListener('DOMContentLoaded', function() {
  const searchForms = document.querySelectorAll('.search');
  
  searchForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = form.querySelector('input[type="search"]');
      if (searchInput && searchInput.value.trim()) {
        // Redirigir a página de búsqueda (pendiente de implementar)
        console.log('Búsqueda:', searchInput.value.trim());
        alert(`Búsqueda: "${searchInput.value.trim()}" - Funcionalidad pendiente`);
      }
    });
  });
});

// === Utilidades generales ===
window.AppUtils = {
  // Formatear precio
  formatPrice: function(price, currency = 'USD') {
    switch(currency) {
      case 'USD':
        return `U$ ${price.toFixed(2)}`;
      case 'BRL':
        return `R$ ${(price * 5.46).toFixed(2)}`;
      case 'PYG':
        return `G$ ${(price * 7300).toLocaleString()}`;
      default:
        return `${price}`;
    }
  },

  // Truncar texto
  truncateText: function(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Generar URL de WhatsApp
  getWhatsAppUrl: function(phone, message = '') {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
  },

  // Generar URL de Google Maps
  getMapsUrl: function(address, lat = null, lng = null) {
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
      const query = encodeURIComponent(address);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
  }
};

console.log('✅ Script.js cargado correctamente (versión sin Supabase)');