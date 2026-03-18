(function () {
  'use strict';

  /* ── DM PASSWORD (SHA-256 of actual password) ── */
  var DM_HASH = '67141ba3c2181c616513bfcf3189511ce98cc6619166220925ef2d09839fcc09';

  async function sha256(str) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  /* ── DM MODAL ── */
  var toggle = document.getElementById('dm-toggle');
  var overlay = document.getElementById('dm-modal-overlay');
  var input = document.getElementById('dm-password-input');
  var errorEl = document.getElementById('dm-error');
  var confirmBtn = document.getElementById('dm-confirm-btn');
  var cancelBtn = document.getElementById('dm-cancel-btn');

  var svgLocked = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>';
  var svgUnlocked = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0" stroke-dasharray="4 2"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>';

  function setDMMode(active) {
    var dmEls = document.querySelectorAll('.dm-only');
    if (active) {
      localStorage.setItem('dmMode', 'true');
      toggle.innerHTML = svgUnlocked;
      dmEls.forEach(function (el) { el.style.display = ''; });
    } else {
      localStorage.removeItem('dmMode');
      toggle.innerHTML = svgLocked;
      dmEls.forEach(function (el) { el.style.display = 'none'; });
    }
  }

  function openModal() {
    overlay.classList.add('active');
    input.value = '';
    errorEl.textContent = '';
    setTimeout(function () { input.focus(); }, 50);
  }

  function closeModal() {
    overlay.classList.remove('active');
  }

  async function attemptUnlock() {
    var entered = await sha256(input.value);
    if (entered === DM_HASH) {
      setDMMode(true);
      closeModal();
    } else {
      errorEl.textContent = 'Wrong password.';
      input.value = '';
      input.focus();
    }
  }

  toggle.addEventListener('click', function () {
    if (localStorage.getItem('dmMode') === 'true') {
      setDMMode(false);
    } else {
      openModal();
    }
  });

  confirmBtn.addEventListener('click', attemptUnlock);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') attemptUnlock(); });
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

  if (localStorage.getItem('dmMode') === 'true') { setDMMode(true); }

  /* ── DROPDOWN NAV (mobile toggle only; desktop uses CSS :hover) ── */
  document.querySelectorAll('.nav-dropdown__trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      var navToggle = document.querySelector('.nav-toggle');
      if (window.getComputedStyle(navToggle).display !== 'none') {
        e.stopPropagation();
        var parent = trigger.closest('.nav-dropdown');
        var isOpen = parent.classList.contains('open');
        document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.classList.remove('open'); });
        if (!isOpen) parent.classList.add('open');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.classList.remove('open'); });
    }
  });

  /* ── BACK TO TOP ── */
  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Bumalik sa tuktok');
  btn.innerHTML = '&#8679;';
  document.body.appendChild(btn);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) { btn.classList.add('visible'); }
    else { btn.classList.remove('visible'); }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── SCROLL-REVEAL ANIMATIONS ── */
  var revealTargets = document.querySelectorAll(
    '.npc-card, .nav-card, .timeline-card, .timeline-item, ' +
    '.parchment-card, .will-card, .glossary-card, .section-heading, ' +
    '.entries-stack > *, .timeline-closing, ' +
    '.codex-entry, .map-ticker, .section-container h2'
  );

  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: show everything for old browsers */
    revealTargets.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ── HERO PARALLAX ── */
  var heroEl = document.querySelector('.hero');
  if (heroEl) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroEl.style.backgroundPositionY = 'calc(center + ' + (scrolled * 0.3) + 'px)';
      }
    }, { passive: true });
  }

  /* ── LOADING SCREEN ── */
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        loadingScreen.classList.add('done');
        setTimeout(function () {
          loadingScreen.style.display = 'none';
        }, 750);
      }, 1800);
    });
  }

  /* ── EMBER PARTICLE CANVAS ── */
  var heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    var ctx = heroCanvas.getContext('2d');
    var embers = [];
    var animFrame;

    var EMBER_COUNT = 55;
    var EMBER_COLORS = [
      'rgba(255,140,20,',
      'rgba(255,80,10,',
      'rgba(220,60,5,',
      'rgba(255,200,60,',
      'rgba(180,40,5,'
    ];

    function resizeCanvas() {
      heroCanvas.width = heroCanvas.offsetWidth;
      heroCanvas.height = heroCanvas.offsetHeight;
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    function makeEmber() {
      return {
        x: randomBetween(0, heroCanvas.width),
        y: randomBetween(heroCanvas.height * 0.3, heroCanvas.height + 20),
        r: randomBetween(0.8, 2.8),
        speedY: randomBetween(0.3, 1.1),
        speedX: randomBetween(-0.25, 0.25),
        drift: randomBetween(-0.005, 0.005),
        life: randomBetween(0, 1),
        maxLife: randomBetween(0.6, 1.0),
        color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
        flicker: randomBetween(0.8, 1.0)
      };
    }

    function initEmbers() {
      embers = [];
      for (var i = 0; i < EMBER_COUNT; i++) {
        var e = makeEmber();
        e.life = Math.random(); /* spread across lifecycle on init */
        embers.push(e);
      }
    }

    function drawEmbers() {
      ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

      for (var i = 0; i < embers.length; i++) {
        var e = embers[i];
        e.life += 0.004;
        e.x += e.speedX + Math.sin(e.life * 2) * 0.18;
        e.y -= e.speedY;
        e.speedX += e.drift;

        var progress = e.life / e.maxLife;
        var alpha;
        if (progress < 0.2) {
          alpha = progress / 0.2 * e.flicker;
        } else if (progress < 0.7) {
          alpha = e.flicker * (0.9 - (progress - 0.2) * 0.4);
        } else {
          alpha = e.flicker * 0.7 * (1 - (progress - 0.7) / 0.3);
        }
        alpha = Math.max(0, Math.min(1, alpha));

        /* glow */
        var grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3.5);
        grd.addColorStop(0, e.color + (alpha * 0.9) + ')');
        grd.addColorStop(0.4, e.color + (alpha * 0.45) + ')');
        grd.addColorStop(1, e.color + '0)');
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        /* core dot */
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color + alpha + ')';
        ctx.fill();

        /* reset if done or out of bounds */
        if (e.life >= e.maxLife || e.y < -10 || e.x < -20 || e.x > heroCanvas.width + 20) {
          embers[i] = makeEmber();
          embers[i].y = randomBetween(heroCanvas.height * 0.5, heroCanvas.height + 10);
        }
      }

      animFrame = requestAnimationFrame(drawEmbers);
    }

    resizeCanvas();
    initEmbers();

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      drawEmbers();
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(animFrame);
        resizeCanvas();
        initEmbers();
        if (!reduceMotion) drawEmbers();
      }, 150);
    });
  }

})();
