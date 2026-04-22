/* ============================================================
   SCROLL.JS — Reveals, parallax, filtres galerie, compteurs
   ============================================================ */
(function () {
  'use strict';

  /* --------------------------------------------------------
     Scroll reveal — IntersectionObserver
  -------------------------------------------------------- */
  const revealEls    = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');
  const staggerGroups = document.querySelectorAll('.reveal-stagger');

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        staggerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  staggerGroups.forEach(el => staggerObs.observe(el));

  /* --------------------------------------------------------
     Hero parallax
  -------------------------------------------------------- */
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          heroBg.style.transform = `translateY(${window.scrollY * 0.28}px) scale(1.05)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------
     Gallery grid — staggered entrance
  -------------------------------------------------------- */
  const gridItems = document.querySelectorAll('.gallery-item');
  if (gridItems.length) {
    /* Compteur local par batch d'entrée visible — évite des délais cumulatifs */
    let batchCounter = 0;
    let batchTimer   = null;

    const isMobile = () => window.innerWidth <= 600;

    const gridObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          /* Délai relatif à l'ordre dans le batch courant */
          const delay = (batchCounter % 4) * 80;
          batchCounter++;
          clearTimeout(batchTimer);
          batchTimer = setTimeout(() => { batchCounter = 0; }, 600);

          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.style.opacity         = '1';
          entry.target.style.transform       = 'translateY(0)';

          /* ── Shimmer mobile : reflet blanc one-shot ────────── */
          if (isMobile()) {
            const shineDelay = delay + 280; /* déclenché après le fade-in */
            setTimeout(() => {
              entry.target.classList.add('is-shining');
              setTimeout(() => entry.target.classList.remove('is-shining'), 800);
            }, shineDelay);
          }

          gridObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });

    gridItems.forEach(item => {
      item.style.opacity    = '0';
      item.style.transform  = 'translateY(18px)';
      item.style.transition = 'opacity 0.65s var(--ease-out), transform 0.65s var(--ease-out), box-shadow 0.32s ease';
      gridObs.observe(item);
    });
  }

  /* --------------------------------------------------------
     Auto-détection orientation portrait/paysage
     Lit les dimensions naturelles de l'image et assigne
     gi-port si hauteur > largeur, gi-land sinon.
  -------------------------------------------------------- */
  document.querySelectorAll('.gallery-item.gi-land, .gallery-item.gi-port').forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    function detect() {
      if (img.naturalWidth && img.naturalHeight) {
        if (img.naturalHeight > img.naturalWidth) {
          item.classList.remove('gi-land');
          item.classList.add('gi-port');
        } else {
          item.classList.remove('gi-port');
          item.classList.add('gi-land');
        }
      }
    }
    if (img.complete) { detect(); }
    else { img.addEventListener('load', detect, { once: true }); }
  });

  /* --------------------------------------------------------
     Gallery filters
  -------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;

        filterBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        let visible = 0;
        document.querySelectorAll('.gallery-item').forEach(item => {
          const show = cat === 'all' || item.dataset.category === cat;
          item.toggleAttribute('data-hidden', !show);
          if (show) visible++;
        });

        const countEl = document.getElementById('gallery-count');
        if (countEl) {
          countEl.textContent = `${visible} photographie${visible > 1 ? 's' : ''}`;
        }
      });
    });
  }

  /* --------------------------------------------------------
     Animated counters
  -------------------------------------------------------- */
  const counterItems = document.querySelectorAll('.counter-item');
  if (counterItems.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counterItems.forEach(item => counterObs.observe(item));
  }

  function animateCounter(item) {
    const el     = item.querySelector('.counter-item__value');
    if (!el) return;
    const raw    = el.textContent.trim();
    const suffix = raw.replace(/[0-9]/g, '');          /* garde + ou autre */
    const target = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(target)) return;

    const dur   = target > 999 ? 2000 : 1500;
    const start = performance.now();

    /* Formate les grands nombres avec espace (10 000) */
    function fmt(n) {
      return n >= 1000
        ? Math.floor(n / 1000).toLocaleString('fr-FR') + '\u202f000'
        : String(Math.round(n));
    }

    (function tick(now) {
      const t    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(ease * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

})();
