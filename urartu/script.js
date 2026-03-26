(() => {
  // =========================
  // MENU (PACE-LIKE)
  // =========================
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const menuClose = document.getElementById('menuClose');

  if (menuBtn && menu) {
    const focusableSelector =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    let lastActiveEl = null;

    function openMenu() {
      lastActiveEl = document.activeElement;
      menu.classList.add('is-open');
      document.body.classList.add('menu-open'); // lock scroll

      menuBtn.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');

      // focus first link for accessibility
      const firstFocusable = menu.querySelector(focusableSelector);
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open'); // unlock scroll

      menuBtn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');

      // restore focus
      if (lastActiveEl && typeof lastActiveEl.focus === 'function') lastActiveEl.focus();
    }

    // toggle
    menuBtn.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    menuClose?.addEventListener('click', closeMenu);

    // click on backdrop closes menu
    menu.addEventListener('click', (e) => {
      if (e.target === menu) closeMenu();
    });

    // close on nav click (anchors and internal links)
    menu.querySelectorAll('a[href]').forEach((a) => {
      a.addEventListener('click', () => closeMenu());
    });

    // close on ESC + basic focus trap on TAB
    window.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        closeMenu();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = Array.from(menu.querySelectorAll(focusableSelector))
          .filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // =========================
  // SLIDER
  // =========================
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSub');
  const heroLocation = document.getElementById('heroLocation');

  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  if (!slides.length || !dotsWrap || !heroTitle || !heroSub) return;

  let idx = 0;
  const AUTOPLAY_MS = 5000;
  let timer = null;

  // Build dots
  const dots = slides.map((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' is-active' : '');
    d.addEventListener('click', () => {
      setActive(i);
      restartAutoplay();
    });
    dotsWrap.appendChild(d);
    return d;
  });

  function setActive(newIdx) {
    idx = (newIdx + slides.length) % slides.length;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));

    const active = slides[idx];

    // Optional: if you ever want per-slide small label, add data-label=""
    if (heroLocation) heroLocation.textContent = active.dataset.label !== undefined ? active.dataset.label : 'Happening now';

    heroTitle.textContent = active.dataset.title || 'Exhibition';
    heroSub.textContent = active.dataset.sub || 'UrArTu Gallery, Dubai';
  }

  function next() {
    setActive(idx + 1);
  }
  function prev() {
    setActive(idx - 1);
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, AUTOPLAY_MS);
  }

  nextBtn?.addEventListener('click', () => {
    next();
    restartAutoplay();
  });

  prevBtn?.addEventListener('click', () => {
    prev();
    restartAutoplay();
  });

  // Touch swipe (mobile)
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    let startX = 0;
    let startY = 0;
    let isTouching = false;

    slider.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches || !e.touches[0]) return;
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    slider.addEventListener(
      'touchend',
      (e) => {
        if (!isTouching) return;
        isTouching = false;

        const endTouch = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null;
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
      },
      { passive: true }
    );
  }

  // Pause autoplay when tab is hidden
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
