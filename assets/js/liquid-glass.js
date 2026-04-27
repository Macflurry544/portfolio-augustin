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
     Scroll — compact state (direction-aware, mobile-friendly)
     iOS Safari throttle les scroll events pendant le geste,
     donc on combine scroll + touchmove pour un feedback immédiat.
  -------------------------------------------------------- */
  let ticking     = false;
  let lastY       = window.scrollY;
  const TOP_ZONE  = 55;
  const SCROLL_EPS = 4;

  function applyState(direction) {
    const y = window.scrollY;
    if (y < TOP_ZONE) {
      nav.classList.remove('compact');
      return;
    }
    if (direction === 'down') nav.classList.add('compact');
    else if (direction === 'up') nav.classList.remove('compact');
  }

  function updateNav() {
    const y  = window.scrollY;
    const dy = y - lastY;
    if (y < TOP_ZONE) {
      nav.classList.remove('compact');
    } else if (dy > SCROLL_EPS) {
      nav.classList.add('compact');
    } else if (dy < -SCROLL_EPS) {
      nav.classList.remove('compact');
    }
    lastY   = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  /* --- Touch (iOS Safari) : feedback immédiat pendant le geste --- */
  let touchY      = 0;
  let touchActive = false;

  window.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    touchY      = e.touches[0].clientY;
    touchActive = true;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!touchActive || !e.touches[0]) return;
    const cy = e.touches[0].clientY;
    const ddy = cy - touchY;
    /* Le doigt descend (ddy > 0) = contenu se déplace vers le bas = scroll UP */
    if (ddy > 8) {
      applyState('up');
      touchY = cy;
    } else if (ddy < -8) {
      applyState('down');
      touchY = cy;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    touchActive = false;
    /* Re-sync avec scrollY après le geste */
    lastY = window.scrollY;
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
