/* ═══════════════════════════════════════════
   ĐÓA HOA TẶNG EM — JavaScript
   Hiệu ứng: cánh hoa rơi, scroll reveal, 
   3D tilt cards, bloom interaction, parallax
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. FALLING PETALS (Canvas) ── */
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];
  let animId;

  // Petal colors — Sophia palette
  const petalColors = [
    'rgba(242, 196, 192, 0.7)',   // Soft pink
    'rgba(232, 181, 176, 0.6)',   // Dusty rose
    'rgba(212, 165, 154, 0.5)',   // Rose gold
    'rgba(240, 192, 186, 0.65)',  // Blush
    'rgba(229, 173, 168, 0.55)', // Mauve
    'rgba(250, 225, 218, 0.5)',   // Lightest
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createPetal() {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 12 + 6,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: Math.random() * 0.6 - 0.3,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 2 - 1,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: Math.random() * 0.5 + 0.3,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;

    // Draw an organic petal shape
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(
      p.size * 0.6, -p.size * 0.8,
      p.size * 0.8, -p.size * 0.2,
      0, p.size * 0.3
    );
    ctx.bezierCurveTo(
      -p.size * 0.8, -p.size * 0.2,
      -p.size * 0.6, -p.size * 0.8,
      0, -p.size
    );
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }

  function animatePetals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn new petals occasionally
    if (petals.length < 25 && Math.random() < 0.03) {
      petals.push(createPetal());
    }

    petals.forEach((p, i) => {
      p.wobble += p.wobbleSpeed;
      p.x += p.speedX + Math.sin(p.wobble) * 0.5;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      // Fade out near bottom
      if (p.y > canvas.height - 100) {
        p.opacity -= 0.005;
      }

      drawPetal(p);

      // Remove if off screen or invisible
      if (p.y > canvas.height + 30 || p.opacity <= 0) {
        petals.splice(i, 1);
      }
    });

    animId = requestAnimationFrame(animatePetals);
  }

  // Init petals
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animatePetals();

  // Pause when tab is hidden to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(animatePetals);
    }
  });


  /* ── 2. SCROLL REVEAL ── */
  const revealElements = document.querySelectorAll(
    '.letter__paper, .gallery__card, .timeline__item, .bloom__container, .gallery__header, .timeline__header'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // Stagger gallery cards
  document.querySelectorAll('.gallery__card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
  });

  // Stagger timeline items
  document.querySelectorAll('.timeline__item').forEach((item, i) => {
    item.style.transitionDelay = `${i * 120}ms`;
  });


  /* ── 3. 3D TILT EFFECT on Gallery Cards ── */
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });
  });


  /* ── 4. BLOOM FLOWER INTERACTION ── */
  const flower = document.getElementById('bloom-flower');
  const bloomMsg = document.getElementById('bloom-message');
  let isBloomed = false;

  function toggleBloom() {
    isBloomed = !isBloomed;
    flower.classList.toggle('bloomed', isBloomed);
    bloomMsg.classList.toggle('visible', isBloomed);

    // Hide hint
    const hint = document.querySelector('.bloom__hint');
    if (hint && isBloomed) {
      hint.style.opacity = '0';
    } else if (hint) {
      hint.style.opacity = '1';
    }
  }

  flower.addEventListener('click', toggleBloom);
  flower.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleBloom();
    }
  });


  /* ── 5. PARALLAX on Hero ── */
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero__content');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY < heroHeight) {
      const ratio = scrollY / heroHeight;
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - ratio * 1.2;
    }
  }, { passive: true });


  /* ── 6. SMOOTH SCROLL for CTA ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ── 7. CURSOR TRAIL (desktop only) — subtle rose particles ── */
  if (window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;
    const particles = [];

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (Math.random() < 0.15) { // Reduced frequency
        createParticle(mouseX, mouseY);
      }
    });

    function createParticle(x, y) {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        pointer-events: none;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${petalColors[Math.floor(Math.random() * petalColors.length)]};
        left: ${x}px;
        top: ${y}px;
        z-index: 9998;
        transition: all 1s ease-out;
      `;
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${Math.random() * -30 - 10}px)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 1000);
    }
  }

})();
