(() => {
  // ===== MENU =====
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const menuClose = document.getElementById('menuClose');

  function openMenu() {
    menu.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  menuBtn?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menu?.addEventListener('click', (e) => {
    if (e.target === menu) closeMenu(); // click on backdrop
  });

  // close on nav click
  document.querySelectorAll('.menu-nav a').forEach(a => {
    a.addEventListener('click', () => closeMenu());
  });

  // close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // ===== SLIDER =====
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSub');

  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  if (!slides.length) return;

  let idx = 0;
  const AUTOPLAY_MS = 5000;
  let timer = null;

  // Build dots
  const dots = slides.map((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' is-active' : '');
    dotsWrap.appendChild(d);
    return d;
  });

  function setActive(newIdx) {
    idx = (newIdx + slides.length) % slides.length;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));

    const active = slides[idx];
    heroTitle.textContent = active.dataset.title || 'Happening now';
    heroSub.textContent = active.dataset.sub || 'UrArTu Gallery, Dubai';
  }

  function next() { setActive(idx + 1); }
  function prev() { setActive(idx - 1); }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, AUTOPLAY_MS);
  }

  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });

  // Touch swipe (mobile)
  const slider = document.querySelector('.hero-slider');
  let startX = 0;
  let startY = 0;
  let isTouching = false;

  slider.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    isTouching = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;

    const endTouch = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
    if (!endTouch) return;

    const dx = endTouch.clientX - startX;
    const dy = endTouch.clientY - startY;

    // ignore if mostly vertical (scroll)
    if (Math.abs(dy) > Math.abs(dx)) return;

    if (Math.abs(dx) > 45) {
      if (dx < 0) next();
      else prev();
      restartAutoplay();
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (timer) clearInterval(timer);
      timer = null;
    } else {
      restartAutoplay();
    }
  });

  // Init
  setActive(0);
  restartAutoplay();
})();
