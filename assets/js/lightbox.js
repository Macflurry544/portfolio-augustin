/* ============================================================
   LIGHTBOX.JS — visionneuse plein écran, transitions directionnelles
   ============================================================ */
(function () {
  'use strict';

  const lb         = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg      = document.getElementById('lightbox-img');
  const lbCaption  = document.getElementById('lightbox-caption');
  const lbClose    = document.getElementById('lightbox-close');
  const lbPrev     = document.getElementById('lightbox-prev');
  const lbNext     = document.getElementById('lightbox-next');
  const lbBackdrop = document.getElementById('lightbox-backdrop');

  const EASE = 'cubic-bezier(0.22,1,0.36,1)';
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let current     = 0;
  let isAnimating = false;

  /* ── Données ───────────────────────────────────────────── */
  function getData(item) {
    const img      = item.querySelector('img');
    const title    = item.querySelector('.gallery-item__title');
    const category = item.querySelector('.gallery-item__category');
    return {
      src:     img ? img.src : '',
      alt:     img ? img.alt : '',
      caption: [category?.textContent?.trim(), title?.textContent?.trim()]
                 .filter(Boolean).join(' — ')
    };
  }

  /* ── Ouvrir — entrée scale-up depuis le centre ─────────── */
  function open(index) {
    current = index;
    const d = getData(items[index]);

    /* Reset silencieux */
    lbImg.style.transition = 'none';
    lbImg.style.opacity    = '0';
    lbImg.style.transform  = 'scale(0.92)';
    lbImg.src              = d.src;
    lbImg.alt              = d.alt;
    lbCaption.textContent  = d.caption;

    lb.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    document.body.style.overflow = 'hidden';

    /* Déclenche l'entrée après le rendu */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lbImg.style.transition = `opacity 0.38s ease, transform 0.48s ${EASE}`;
        lbImg.style.opacity    = '1';
        lbImg.style.transform  = 'scale(1) translateX(0)';
      });
    });

    setTimeout(() => lbClose.focus(), 60);
  }

  /* ── Fermer ────────────────────────────────────────────── */
  function close() {
    lbImg.style.transition = `opacity 0.22s ease, transform 0.28s ${EASE}`;
    lbImg.style.opacity    = '0';
    lbImg.style.transform  = 'scale(0.94)';
    setTimeout(() => {
      lb.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      document.body.style.overflow = '';
      items[current]?.focus();
    }, 240);
  }

  /* ── Navigation — transition directionnelle ────────────── */
  function goTo(nextIndex, dir) {
    if (isAnimating) return;
    isAnimating = true;

    const next = ((nextIndex % items.length) + items.length) % items.length;
    const outX = dir > 0 ? '-28px' : '28px';   /* sort côté gauche ou droit */
    const inX  = dir > 0 ?  '28px' : '-28px';  /* entre du côté opposé */

    /* 1 — Sortie de l'image actuelle */
    lbImg.style.transition = `opacity 0.2s ease, transform 0.26s ${EASE}`;
    lbImg.style.opacity    = '0';
    lbImg.style.transform  = `translateX(${outX}) scale(0.97)`;

    setTimeout(() => {
      /* 2 — Charge la nouvelle image hors champ (pas de transition) */
      lbImg.style.transition = 'none';
      lbImg.style.opacity    = '0';
      lbImg.style.transform  = `translateX(${inX}) scale(0.97)`;

      const d = getData(items[next]);
      lbImg.src             = d.src;
      lbImg.alt             = d.alt;
      lbCaption.textContent = d.caption;
      current = next;

      /* 3 — Entrée fluide */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lbImg.style.transition = `opacity 0.32s ease, transform 0.42s ${EASE}`;
          lbImg.style.opacity    = '1';
          lbImg.style.transform  = 'translateX(0) scale(1)';
          setTimeout(() => { isAnimating = false; }, 440);
        });
      });
    }, 230);
  }

  /* ── Clic sur un item ──────────────────────────────────── */
  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  /* ── Boutons ───────────────────────────────────────────── */
  lbClose.addEventListener('click', close);
  lbBackdrop.addEventListener('click', close);
  lbPrev.addEventListener('click', () => goTo(current - 1, -1));
  lbNext.addEventListener('click', () => goTo(current + 1,  1));

  /* ── Clavier ───────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  goTo(current - 1, -1);
    if (e.key === 'ArrowRight') goTo(current + 1,  1);
  });

  /* ── Swipe tactile ─────────────────────────────────────── */
  let touchX = 0;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) dx > 0 ? goTo(current - 1, -1) : goTo(current + 1, 1);
  }, { passive: true });

})();
