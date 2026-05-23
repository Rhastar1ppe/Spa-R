/**
 * ROSSIE SALOON SPA — main.js
 * Scroll reveals · Header shrink · Mobile nav · Parallax · Floating CTA
 */

(function () {
  'use strict';

  /* ── 1. HEADER: scroll class + mobile hamburger ─────────────── */
  const header     = document.querySelector('.main-header');
  const hamburger  = document.querySelector('.hamburger');
  const navMenu    = document.querySelector('.nav-menu');
  const navLinks   = document.querySelectorAll('.nav-menu a');

  // Crear botón hamburguesa si no existe en el HTML
  if (!hamburger && header) {
    const btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.setAttribute('aria-label', 'Menú');
    btn.innerHTML = '<span></span><span></span><span></span>';
    header.querySelector('.header-container').appendChild(btn);

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });


  /* ── 2. REVEAL ON SCROLL (IntersectionObserver) ─────────────── */
  function addRevealClasses() {
    const targets = [
      { sel: '.card-destacado',   delays: true },
      { sel: '.card-service',     delays: true },
      { sel: '.card-product',     delays: true },
      { sel: '.section-title',    delays: false },
      { sel: '.section-title-alt',delays: false },
      { sel: '.section-subtitle', delays: false },
      { sel: '.category-title',   delays: false },
      { sel: '.brand-intro',      delays: false },
      { sel: '.contact-info-block', delays: false },
      { sel: '.contact-buttons-block', delays: false },
    ];

    targets.forEach(({ sel, delays }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('reveal');
        if (delays && i < 4) {
          el.classList.add(`reveal-delay-${i + 1}`);
        }
      });
    });
  }

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }


  /* ── 3. HERO PARALLAX (orbs background) ─────────────────────── */
  function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const limit   = heroSection.offsetHeight;
      if (scrollY > limit) return;

      const ratio = scrollY / limit;
      heroSection.style.setProperty('--parallax-y', `${scrollY * 0.35}px`);
    }, { passive: true });

    // Aplicar el efecto al pseudo-elemento vía una clase dinámica
    const style = document.createElement('style');
    style.textContent = `.hero-section::before { transform: translate(var(--parallax-y, 0), calc(var(--parallax-y, 0) * -0.5)); }`;
    document.head.appendChild(style);
  }


  /* ── 4. SMOOTH ACTIVE NAV (highlight current section) ───────── */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-menu a[href^="#"]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.style.color = 'var(--cyan-dark)';
            }
          });
        }
      });
    }, { threshold: 0.45 });

    sections.forEach(s => observer.observe(s));
  }


  /* ── 5. CARD TILT (sutil, solo desktop) ─────────────────────── */
  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.card-product, .card-destacado').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const tiltX  = (dy * -6).toFixed(2);
        const tiltY  = (dx *  6).toFixed(2);

        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
    });
  }


  /* ── 6. SMOOTH SCROLL con offset para el header fijo ────────── */
  function initSmoothScroll() {
    const headerH = 72;
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }


  /* ── 7. FLOATING BUTTON aparece con delay ────────────────────── */
  function initFloatingButtons() {
    const container = document.querySelector('.floating-buttons-container');
    if (!container) return;

    container.style.opacity    = '0';
    container.style.transform  = 'translateY(20px)';
    container.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    setTimeout(() => {
      container.style.opacity   = '1';
      container.style.transform = 'translateY(0)';
    }, 1500);
  }


  /* ── 8. IMAGE FALLBACK (placeholder con gradiente) ───────────── */
  function initImageFallbacks() {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', function () {
        const parent = this.parentElement;
        this.style.display = 'none';

        // Si no hay ya un placeholder
        if (!parent.querySelector('.img-placeholder')) {
          const ph = document.createElement('div');
          ph.className = 'img-placeholder';
          ph.style.cssText = `
            width: 100%;
            height: 100%;
            min-height: 180px;
            background: linear-gradient(135deg, #b8eaf4 0%, #f7e49e 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(28,26,24,0.35);
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            letter-spacing: 0.1em;
          `;
          ph.textContent = '✦';
          parent.appendChild(ph);
        }
      });
    });
  }


  /* ── 9. HERO TEXT: shimmer animado en el nombre ──────────────── */
  function initHeroShimmer() {
    const h1 = document.querySelector('.hero-content h1');
    if (!h1 || h1.querySelector('span')) return;

    // Envolver "Rossie" en un span con gradiente animado
    h1.innerHTML = h1.textContent
      .replace('Rossie', '<span>Rossie</span>');
  }


  /* ── 10. CURSOR personalizado (solo desktop) ─────────────────── */
  function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = document.createElement('div');
    cursor.id = 'rossie-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--gradient-brand, linear-gradient(135deg,#7dd8e8,#e8c84a));
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%,-50%);
      transition: width 0.25s ease, height 0.25s ease, opacity 0.25s ease;
      mix-blend-mode: multiply;
      opacity: 0;
    `;

    const ring = document.createElement('div');
    ring.id = 'rossie-cursor-ring';
    ring.style.cssText = `
      position: fixed;
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 1.5px solid rgba(125,216,232,0.6);
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%,-50%);
      transition: width 0.35s ease, height 0.35s ease, border-color 0.35s ease;
      opacity: 0;
    `;

    document.body.appendChild(cursor);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.opacity = '1';
      ring.style.opacity   = '1';
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    // Smooth ring follow
    function followRing() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(followRing);
    }
    followRing();

    // Hover expand
    document.querySelectorAll('a, button, .card-service, .card-product, .card-destacado').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width  = '16px';
        cursor.style.height = '16px';
        ring.style.width    = '56px';
        ring.style.height   = '56px';
        ring.style.borderColor = 'rgba(232,200,74,0.7)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width  = '10px';
        cursor.style.height = '10px';
        ring.style.width    = '36px';
        ring.style.height   = '36px';
        ring.style.borderColor = 'rgba(125,216,232,0.6)';
      });
    });
  }
/* ── 11. ACCORDION: Detalles desplegables en Servicios ───────── */
  function initServiceAccordion() {
   const toggleBtns = document.querySelectorAll('.toggle-details-btn');
    
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.card-service');
        if (card) {
          card.classList.toggle('active');
        }
      });
    });
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  function init() {
    addRevealClasses();
    initReveal();
    initParallax();
    initActiveNav();
    initTilt();
    initSmoothScroll();
    initFloatingButtons();
    initImageFallbacks();
    initHeroShimmer();
    initCustomCursor();
    initServiceAccordion(); 
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();