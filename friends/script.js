// ── SCROLL ANIMATIONS ────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

document.querySelectorAll('.au').forEach(el => observer.observe(el));

// ── STICKY HEADER (hide on scroll down, show on scroll up) ──
const header = document.getElementById('siteHeader');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 80) {
    header.classList.toggle('is-hidden', y > lastScrollY);
  } else {
    header.classList.remove('is-hidden');
  }
  lastScrollY = y;
}, { passive: true });

// ── MOBILE ACCORDION ─────────────────────────────────────
function isMobile() { return window.innerWidth < 768; }

function initAccordion() {
  const btns = document.querySelectorAll('.acc-btn');

  btns.forEach((btn, i) => {
    const body = btn.nextElementSibling;

    if (i === 0 && isMobile()) {
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      body.classList.add('is-open');
    }

    btn.addEventListener('click', () => {
      if (!isMobile()) return;
      const opening = !btn.classList.contains('is-open');

      btns.forEach(b => {
        b.classList.remove('is-open');
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('is-open');
      });

      if (opening) {
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        body.classList.add('is-open');
      }
    });
  });
}

initAccordion();

// Reset accordion state on resize
window.addEventListener('resize', () => {
  const btns = document.querySelectorAll('.acc-btn');
  if (!isMobile()) {
    btns.forEach(b => {
      b.classList.remove('is-open');
      b.nextElementSibling.classList.remove('is-open');
    });
  }
}, { passive: true });

// ── REVIEWS SLIDER ───────────────────────────────────────
const slider   = document.getElementById('slider');
const prevBtn  = document.getElementById('sliderPrev');
const nextBtn  = document.getElementById('sliderNext');

if (slider && prevBtn && nextBtn) {
  function cardWidth() {
    const card = slider.querySelector('.review-card');
    if (!card) return 360;
    return card.offsetWidth + parseInt(getComputedStyle(slider).gap || '20');
  }

  prevBtn.addEventListener('click', () => slider.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => slider.scrollBy({ left:  cardWidth(), behavior: 'smooth' }));
}

// ── FORM SUBMIT ───────────────────────────────────────────
const form    = document.getElementById('signupForm');
const success = document.getElementById('formSuccess');

if (form && success) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Форма відправлена:', data);
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// ── SMOOTH SCROLL for anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = header ? header.offsetHeight + 8 : 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
