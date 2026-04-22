/* ============================================================
   MORPHING.JS — Genie effect & Lightbox
   ============================================================ */

(function () {
  'use strict';

  const STRIP_COUNT = 24;
  const DURATION = 880;

  /* --------------------------------------------------------
     Easing functions
  -------------------------------------------------------- */
  const easeInCubic  = t => t * t * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOut    = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* --------------------------------------------------------
     Genie Effect
     The image splits into horizontal strips. Bottom strips
     are drawn toward the nav pill first, progressively
     narrowing as they approach. Top strips follow with delay.
  -------------------------------------------------------- */

  function genieEffect(imgEl, navPill, onComplete) {
    if (!imgEl || !navPill) return;

    const imgRect  = imgEl.getBoundingClientRect();
    const navRect  = navPill.getBoundingClientRect();

    const destX = navRect.left + navRect.width  / 2;
    const destY = navRect.top  + navRect.height / 2;

    /* Build strip container */
    const container = document.createElement('div');
    container.className = 'genie-strip-container';
    document.body.appendChild(container);

    /* Hide source image */
    imgEl.dataset.genieActive = 'true';
    imgEl.style.opacity = '0';

    const stripH   = imgRect.height / STRIP_COUNT;
    const imgSrc   = imgEl.currentSrc || imgEl.src;
    const strips   = [];

    for (let i = 0; i < STRIP_COUNT; i++) {
      const strip = document.createElement('div');
      strip.className = 'genie-strip';
      strip.style.cssText = `
        left:   ${imgRect.left}px;
        top:    ${imgRect.top + i * stripH}px;
        width:  ${imgRect.width}px;
        height: ${stripH + 1}px;
      `;

      const inner = document.createElement('img');
      inner.src = imgSrc;
      inner.alt = '';
      inner.setAttribute('aria-hidden', 'true');
      inner.style.cssText = `
        position: absolute;
        top:    ${-(i * stripH)}px;
        left:   0;
        width:  ${imgRect.width}px;
        height: ${imgRect.height}px;
        object-fit: cover;
        pointer-events: none;
        user-select: none;
      `;

      strip.appendChild(inner);
      container.appendChild(strip);
      strips.push(strip);
    }

    /* Animation */
    const startTime = performance.now();

    const animate = (now) => {
      const t = Math.min((now - startTime) / DURATION, 1);

      strips.forEach((strip, i) => {
        /* Bottom strips lead — stagger maps 0=top…1=bottom */
        const frac = i / (STRIP_COUNT - 1);

        /* Bottom strips start earlier: progress offset */
        const progress = Math.max(0, (t - (1 - frac) * 0.28) / 0.72);
        const ease     = easeInOut(Math.min(progress, 1));

        /* Current Y of this strip's original position */
        const origY = imgRect.top + i * stripH;

        /* Width narrows as strip moves toward dest */
        const widthScale = 1 - ease * 0.96;
        const currentW   = imgRect.width * widthScale;

        /* X converges to dest center */
        const origCX   = imgRect.left + imgRect.width / 2;
        const currentX = origCX + (destX - origCX) * ease - currentW / 2;

        /* Y pulled downward toward dest.y with bottom bias */
        const yPull    = Math.pow(ease, 1.6);
        const currentY = origY  + (destY - origY) * yPull;

        /* Opacity fades during last 35% */
        const alpha = Math.max(0, 1 - Math.pow(Math.max(0, ease - 0.65) / 0.35, 1.5));

        strip.style.cssText = `
          position: fixed;
          left:    ${currentX}px;
          top:     ${currentY}px;
          width:   ${currentW}px;
          height:  ${stripH + 1}px;
          overflow: hidden;
          opacity: ${alpha};
          will-change: transform;
          pointer-events: none;
        `;

        /* Shift the inner img to compensate for strip position change */
        const inner = strip.firstElementChild;
        if (inner) {
          inner.style.top    = `${-(i * stripH)}px`;
          inner.style.left   = `0`;
          inner.style.width  = `${imgRect.width}px`;
          inner.style.height = `${imgRect.height}px`;
        }
      });

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        container.remove();

        /* Restore source image visibility */
        delete imgEl.dataset.genieActive;
        imgEl.style.opacity = '';

        /* Nav pill pulse feedback */
        navPill.classList.remove('pulse');
        void navPill.offsetWidth; /* force reflow */
        navPill.classList.add('pulse');

        if (typeof onComplete === 'function') onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /* --------------------------------------------------------
     Lightbox
  -------------------------------------------------------- */

  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbCaption    = document.getElementById('lightbox-caption');
  const lbClose      = document.getElementById('lightbox-close');
  const lbBackdrop   = document.getElementById('lightbox-backdrop');
  const lbPrev       = document.getElementById('lightbox-prev');
  const lbNext       = document.getElementById('lightbox-next');

  if (!lightbox) return;

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const navPill      = document.querySelector('.nav-pill');
  let currentIndex   = -1;

  /* Open lightbox after genie */
  function openLightbox(index) {
    const item = galleryItems[index];
    if (!item) return;

    const imgEl    = item.querySelector('img');
    const title    = item.querySelector('.gallery-item__title');
    const category = item.querySelector('.gallery-item__category');

    currentIndex     = index;
    lbImg.src        = imgEl ? imgEl.src : '';
    lbImg.alt        = imgEl ? imgEl.alt : '';
    lbCaption.textContent = [
      category ? category.textContent : '',
      title    ? title.textContent    : ''
    ].filter(Boolean).join(' — ');

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  function showNext() {
    if (currentIndex < 0) return;
    const next = (currentIndex + 1) % galleryItems.length;
    openLightbox(next);
  }

  function showPrev() {
    if (currentIndex < 0) return;
    const prev = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(prev);
  }

  /* --------------------------------------------------------
     Gallery item click → genie → lightbox
  -------------------------------------------------------- */

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (item.dataset.genieActive) return;

      const imgEl = item.querySelector('img');
      if (!imgEl) return;

      genieEffect(imgEl, navPill, () => {
        openLightbox(index);
      });
    });

    /* Keyboard support */
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  /* --------------------------------------------------------
     Lightbox controls
  -------------------------------------------------------- */

  if (lbClose)    lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev)     lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  if (lbNext)     lbNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  /* Keyboard navigation */
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  showNext();
    if (e.key === 'ArrowLeft')   showPrev();
  });

  /* Touch swipe */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? showNext() : showPrev();
    }
  }, { passive: true });

})();
