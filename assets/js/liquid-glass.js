/* ============================================================
   LIQUID-GLASS.JS — Nav pill behavior (compact + scrolled + burger)
   ============================================================ */
(function () {
  'use strict';

  const nav        = document.querySelector('.nav');
  const burger     = document.querySelector('.nav-burger');
  const fullscreen = document.querySelector('.nav-fullscreen');
  const fsClose    = document.querySelector('.nav-fullscreen-close');

  if (!nav) return;

  /* --------------------------------------------------------
     Scroll — compact + scrolled states
  -------------------------------------------------------- */
  let ticking = false;
  const COMPACT_THRESHOLD = 55;
  const SCROLLED_THRESHOLD = window.innerHeight * 0.55;

  function updateNav() {
    const y = window.scrollY;

    /* Compact: réduit la hauteur */
    nav.classList.toggle('compact', y > COMPACT_THRESHOLD);

    /* Scrolled: glass sombre → clair — seulement si page claire
       Pour ce portfolio tout-sombre, on garde glass sombre toujours.
       Décommenter si pages claires ajoutées. */
    // nav.classList.toggle('scrolled', y > SCROLLED_THRESHOLD);

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  /* Initial state */
  updateNav();

  /* --------------------------------------------------------
     Burger — fullscreen mobile menu
  -------------------------------------------------------- */
  if (burger && fullscreen) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      fullscreen.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      burger.setAttribute('aria-expanded', isOpen);
    });

    if (fsClose) {
      fsClose.addEventListener('click', closeMenu);
    }

    /* Fermer sur clic lien */
    fullscreen.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    /* Fermer sur Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fullscreen.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    burger?.classList.remove('open');
    fullscreen?.classList.remove('open');
    document.body.style.overflow = '';
    burger?.setAttribute('aria-expanded', 'false');
  }

  /* --------------------------------------------------------
     Active link — met la class .active sur le lien courant
  -------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  nav.querySelectorAll('a[href]').forEach(link => {
    const page = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
    if (page === currentPage || (currentPage === '' && page === 'index.html')) {
      link.classList.add('active');
    }
  });

  if (fullscreen) {
    fullscreen.querySelectorAll('a[href]').forEach(link => {
      const page = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
      if (page === currentPage || (currentPage === '' && page === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* --------------------------------------------------------
     Light interaction — gradient refraction sur la pill
  -------------------------------------------------------- */
  function handleMouseMove(e) {
    const rect = nav.getBoundingClientRect();
    const dist = Math.hypot(
      e.clientX - (rect.left + rect.width / 2),
      e.clientY - (rect.top  + rect.height / 2)
    );
    if (dist < rect.width / 2 + 120) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      nav.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
      nav.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
    }
  }

  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  nav.addEventListener('mouseleave', () => {
    nav.style.setProperty('--mouse-x', '50%');
    nav.style.setProperty('--mouse-y', '50%');
  });

  /* Hover scale subtle */
  nav.addEventListener('mouseenter', () => {
    nav.style.transform = 'translateX(-50%) scale(1.012)';
  });
  nav.addEventListener('mouseleave', () => {
    nav.style.transform = 'translateX(-50%) scale(1)';
    nav.style.setProperty('--mouse-x', '50%');
    nav.style.setProperty('--mouse-y', '50%');
  });

})();
