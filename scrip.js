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