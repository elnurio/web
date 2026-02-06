(() => {
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

  // Desktop halves click
  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });

  // Touch swipe on mobile
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

  slider.addEventListener('touchmove', (e) => {
    // allow vertical scroll; don't block
    if (!isTouching || !e.touches || !e.touches[0]) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    // if user is clearly horizontal swiping, we can prevent bounce feel a bit
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 18) {
      // don't prevent default globally; keep it smooth
    }
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    if (!isTouching) return;
    isTouching = false;

    const endTouch = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
    if (!endTouch) return;

    const dx = endTouch.clientX - startX;
    const absDx = Math.abs(dx);

    if (absDx > 45) {
      if (dx < 0) next();
      else prev();
      restartAutoplay();
    }
  }, { passive: true });

  // Pause autoplay when tab hidden
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
