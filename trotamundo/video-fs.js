/**
 * Fullscreen video with grid “push” transition (GSAP Flip).
 * Based on Codrops PushGridItems — https://github.com/codrops/PushGridItems (MIT)
 */
(function () {
  function hasVideoSource(video) {
    if (!video) return false;
    if (video.src && String(video.src).replace(/^about:blank$/, '')) return true;
    var s = video.querySelector('source[src]');
    var u = s && s.getAttribute('src');
    return !!(u && String(u).trim());
  }

  if (typeof gsap === 'undefined' || typeof Flip === 'undefined') {
    document.querySelectorAll('.iphone-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function () {
        var screen = overlay.closest('.iphone-screen');
        if (!screen) return;
        var video = screen.querySelector('video');
        if (!hasVideoSource(video)) return;
        if (video.paused) {
          var p = video.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        } else {
          video.pause();
        }
      });
    });
    return;
  }

  gsap.registerPlugin(Flip);

  var root = document.getElementById('video-fs');
  if (!root) return;

  var grid = root.querySelector('.video-fs__grid');
  var fsTarget = root.querySelector('.video-fs__fullscreen');
  var closeBtn = root.querySelector('.video-fs__close');
  var gridItems = grid ? Array.from(grid.querySelectorAll('.grid__item')) : [];

  var POSITION = {
    NORTH: 'pos-north',
    SOUTH: 'pos-south',
    WEST: 'pos-west',
    EAST: 'pos-east'
  };

  var anim = { duration: 0.88, ease: 'expo.inOut' };

  var isOpen = false;
  var iphoneScreenEl = null;
  var shell = null;
  var videoEl = null;
  var overlayEl = null;

  function determinePositionClass(itemRect, anchorRect) {
    if (itemRect.bottom < anchorRect.top) return POSITION.NORTH;
    if (itemRect.top > anchorRect.bottom) return POSITION.SOUTH;
    if (itemRect.right < anchorRect.left) return POSITION.WEST;
    if (itemRect.left > anchorRect.right) return POSITION.EAST;
    return '';
  }

  function clearPushClasses() {
    gridItems.forEach(function (item) {
      item.classList.remove(POSITION.NORTH, POSITION.SOUTH, POSITION.WEST, POSITION.EAST);
    });
  }

  function pushGridOpen(anchorRect) {
    if (!gridItems.length) return;
    var state = Flip.getState(gridItems);
    gridItems.forEach(function (item) {
      var c = determinePositionClass(item.getBoundingClientRect(), anchorRect);
      if (c) item.classList.add(c);
    });
    Flip.from(state, {
      duration: anim.duration,
      ease: anim.ease,
      scale: true,
      prune: true
    });
  }

  function pushGridCollapse() {
    if (!gridItems.length) return;
    var state = Flip.getState(gridItems);
    clearPushClasses();
    Flip.from(state, {
      duration: anim.duration,
      ease: anim.ease,
      scale: true,
      prune: true
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function openFromPhone(screenEl, video) {
    if (isOpen || !screenEl || !video || !hasVideoSource(video)) return;

    iphoneScreenEl = screenEl;
    videoEl = video;
    overlayEl = screenEl.querySelector('.iphone-overlay');

    shell = document.createElement('div');
    shell.className = 'video-fs__shell';

    screenEl.insertBefore(shell, overlayEl || null);
    shell.appendChild(video);

    var anchorRect = screenEl.getBoundingClientRect();

    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    void root.offsetHeight;

    if (prefersReducedMotion()) {
      gridItems.forEach(function (item) {
        var c = determinePositionClass(item.getBoundingClientRect(), anchorRect);
        if (c) item.classList.add(c);
      });
      fsTarget.appendChild(shell);
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
      isOpen = true;
      return;
    }

    pushGridOpen(anchorRect);

    var vState = Flip.getState(shell);
    fsTarget.appendChild(shell);
    Flip.from(vState, {
      duration: anim.duration,
      ease: anim.ease,
      scale: true,
      prune: true,
      onComplete: function () {
        var p2 = video.play();
        if (p2 && typeof p2.catch === 'function') p2.catch(function () {});
      }
    });

    isOpen = true;
  }

  function closeFs() {
    if (!isOpen || !shell || !iphoneScreenEl || !videoEl) return;

    videoEl.pause();

    if (prefersReducedMotion()) {
      if (shell.parentNode !== iphoneScreenEl) {
        iphoneScreenEl.insertBefore(shell, overlayEl || null);
      }
      clearPushClasses();
      shell.removeChild(videoEl);
      iphoneScreenEl.insertBefore(videoEl, shell);
      iphoneScreenEl.removeChild(shell);
      shell = null;
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      isOpen = false;
      iphoneScreenEl = null;
      videoEl = null;
      overlayEl = null;
      return;
    }

    var vState = Flip.getState(shell);
    iphoneScreenEl.insertBefore(shell, overlayEl || null);
    Flip.from(vState, {
      duration: anim.duration,
      ease: anim.ease,
      scale: true,
      prune: true,
      onComplete: function () {
        shell.removeChild(videoEl);
        iphoneScreenEl.insertBefore(videoEl, shell);
        iphoneScreenEl.removeChild(shell);
        shell = null;
        pushGridCollapse();
        root.classList.remove('is-open');
        root.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        isOpen = false;
        iphoneScreenEl = null;
        videoEl = null;
        overlayEl = null;
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeFs);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeFs();
  });

  document.querySelectorAll('.iphone-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      var screen = overlay.closest('.iphone-screen');
      if (!screen) return;
      var video = screen.querySelector('video');
      if (!hasVideoSource(video)) return;
      e.preventDefault();
      e.stopPropagation();
      openFromPhone(screen, video);
    });
  });

  window.TrotamundoVideoFs = { open: openFromPhone, close: closeFs };
})();
