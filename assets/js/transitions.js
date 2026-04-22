/* ============================================================
   TRANSITIONS.JS — Transitions liquid glass entre les pages
   Entrée  : blur 32px → 0  (dévoilement)
   Sortie  : blur 0 → 32px  (voile avant navigation)
   ============================================================ */
(function () {
  'use strict';

  /* ── Créer l'overlay ───────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id        = 'page-glass-transition';
  overlay.className = 'pgt';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  /* ── Entrée : la page arrive, on dissout le voile ─────── */
  function enterAnimation() {
    overlay.classList.add('pgt--entering');
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('pgt--entering');
    }, { once: true });
  }

  /* ── Sortie : clic sur lien, on applique le voile ─────── */
  function leaveAnimation(href) {
    overlay.classList.add('pgt--leaving');
    overlay.addEventListener('animationend', () => {
      window.location.href = href;
    }, { once: true });
  }

  /* ── Intercepter tous les liens locaux ────────────────── */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    /* Ignorer : ancres, mails, téléphones, liens externes, _blank */
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http') ||
      link.target === '_blank' ||
      e.metaKey || e.ctrlKey || e.shiftKey
    ) return;

    e.preventDefault();
    leaveAnimation(href);
  });

  /* ── Lancer l'entrée immédiatement ────────────────────── */
  enterAnimation();

  /* ── Easter egg : code Konami — appareil photo ─────────── */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                  'b','a'];
  let konamiIdx = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        triggerEasterEgg();
      }
    } else {
      konamiIdx = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  function triggerEasterEgg() {
    /* Flash obturateur */
    const flash = document.createElement('div');
    flash.className = 'shutter-flash';
    document.body.appendChild(flash);

    /* Polaroïd flottant */
    const polaroid = document.createElement('div');
    polaroid.className = 'easter-polaroid';
    polaroid.innerHTML = `
      <div class="easter-polaroid__frame">
        <div class="easter-polaroid__lens">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="17" stroke="#B0845A" stroke-width="1.5"/>
            <circle cx="20" cy="20" r="11" stroke="#B0845A" stroke-width="1.5"/>
            <circle cx="20" cy="20" r="5"  fill="#B0845A" opacity="0.4"/>
            <line x1="20" y1="3"  x2="20" y2="8"  stroke="#B0845A" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="20" y1="32" x2="20" y2="37" stroke="#B0845A" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="3"  y1="20" x2="8"  y2="20" stroke="#B0845A" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="32" y1="20" x2="37" y2="20" stroke="#B0845A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="easter-polaroid__text">Objectif trouvé ✦</p>
        <p class="easter-polaroid__sub">Tu connais le Konami code.<br>Photographe dans l'âme.</p>
      </div>
    `;
    document.body.appendChild(polaroid);

    /* Jouer un son d'obturateur via AudioContext */
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}

    setTimeout(() => flash.remove(), 500);
    setTimeout(() => {
      polaroid.classList.add('easter-polaroid--out');
      setTimeout(() => polaroid.remove(), 600);
    }, 4000);
  }

})();
