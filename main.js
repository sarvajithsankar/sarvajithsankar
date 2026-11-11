/**
 * MAIN ORCHESTRATION & GLOBAL INTERACTION ENGINE
 * - Lenis Smooth Scroll + GSAP ScrollTrigger ticker integration
 * - Desktop Cursor Follower with interactive ring expansion
 * - Marquee Dividers with velocity boost, direction flip, and dynamic skew
 * - Reveal Utilities (Headline masks, eyebrow dash scaling, word-by-word reveal statement)
 * - Detail Modal Overlay system with focus trap
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Lenis Smooth Scroll + GSAP Integration (Section 12)
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8
    });

    window.lenisInstance = lenis;

    lenis.on('scroll', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    });

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Cursor Follower (Desktop, pointer: fine)
  const cursorDot = document.getElementById('cursor-dot');
  if (cursorDot && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    let mouseX = -100, mouseY = -100;
    let dotX = -100, dotY = -100;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function renderCursor() {
      // Lerp 0.2
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;

      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expand cursor over interactive targets
    const interactiveSelector = 'a, button, [role="button"], input, .chip, .deck-card, .diagram-node, .contents-row, .tick-item';
    document.querySelectorAll(interactiveSelector).forEach((el) => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hovering'));
    });
  }

  // 3. Marquee Dividers (Section 7.1)
  const marquees = document.querySelectorAll('.marquee-divider');
  marquees.forEach((marquee) => {
    const track = marquee.querySelector('.marquee-track');
    if (!track || prefersReducedMotion) return;

    let basePos = 0;
    const baseSpeed = 0.8; // ~40px/s
    let currentSkew = 0;

    function animateMarquee() {
      // Base drift left
      basePos -= baseSpeed;

      // Add scroll velocity if available
      if (typeof ScrollTrigger !== 'undefined') {
        const vel = ScrollTrigger.getVelocity() || 0;
        const boost = vel * 0.003;
        basePos += boost;

        // Dynamic skew by velocity * -0.02deg capped at 6deg
        const targetSkew = Math.max(-6, Math.min(6, vel * -0.015));
        currentSkew += (targetSkew - currentSkew) * 0.1;
      }

      // Seamless wrap around loop
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(basePos) >= halfWidth) {
        basePos = 0;
      }

      track.style.transform = `translateX(${basePos}px) skewX(${currentSkew}deg)`;
      requestAnimationFrame(animateMarquee);
    }
    requestAnimationFrame(animateMarquee);
  });

  // 4. Reveal Statement Word-by-Word Scrubbing (Section 3.3)
  const statementEl = document.getElementById('statement-text');
  if (statementEl) {
    const rawText = statementEl.textContent.trim();
    const words = rawText.split(/\s+/);
    statementEl.innerHTML = '';

    words.forEach((word) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word + ' ';

      // Highlight key hero phrases
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanWord === 'actually' || cleanWord === 'work' || cleanWord === 'production') {
        span.classList.add('hero-phrase');
      } else if (cleanWord === 'deterministic' || cleanWord === 'resilient') {
        span.classList.add('blue-phrase');
      }

      statementEl.appendChild(span);
    });

    if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      const wordSpans = statementEl.querySelectorAll('.w:not(.hero-phrase):not(.blue-phrase)');
      ScrollTrigger.create({
        trigger: statementEl,
        start: 'top 75%',
        end: 'bottom 45%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const total = wordSpans.length;
          wordSpans.forEach((w, idx) => {
            if (idx / total <= p) {
              w.classList.add('is-revealed');
            } else {
              w.classList.remove('is-revealed');
            }
          });
        }
      });
    } else {
      statementEl.querySelectorAll('.w').forEach(w => w.classList.add('is-revealed'));
    }
  }

  // 5. Headline Line Reveals (Section 11.2) & Eyebrow Dashes (Section 11.3)
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const headlineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const innerSpans = entry.target.querySelectorAll('.headline-inner');
          innerSpans.forEach((span, idx) => {
            setTimeout(() => {
              span.classList.add('is-inview');
            }, idx * 90);
          });
          headlineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.section-headline').forEach(h => headlineObserver.observe(h));

    // Default Section Fade Ups (Section 11.1)
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.panel, .feature-item, .info-trio-col').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 700ms cubic-bezier(.2, .8, .2, 1), transform 700ms cubic-bezier(.2, .8, .2, 1)';
      fadeObserver.observe(el);
    });
  }

  // 6. Detail Modal Overlay (Section 11.6)
  const detailModal = document.getElementById('detail-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  window.openDetailModal = function (title, lead, desc, tags) {
    if (!detailModal) return;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-lead').textContent = lead;
    document.getElementById('modal-desc').textContent = desc;

    const tagsContainer = document.getElementById('modal-tags-row');
    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      (tags || ['PYTHON', 'SYSTEMS', 'AI']).forEach((t) => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'modal-tag';
        tagSpan.textContent = t;
        tagsContainer.appendChild(tagSpan);
      });
    }

    detailModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
  };

  window.closeDetailModal = function () {
    if (!detailModal) return;
    detailModal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', window.closeDetailModal);
  }

  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) {
        window.closeDetailModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && detailModal.classList.contains('is-open')) {
        window.closeDetailModal();
      }
    });
  }

  // Wire inspect buttons to modal
  document.querySelectorAll('.trigger-modal-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.title || 'SYSTEM TELEMETRY';
      const lead = btn.dataset.lead || 'Deep execution telemetry and architectural topology.';
      const desc = btn.dataset.desc || 'Detailed state inspection across distributed agents and defensive security middleware.';
      const tags = (btn.dataset.tags || 'LANGGRAPH,FASTAPI,REDIS').split(',');
      window.openDetailModal(title, lead, desc, tags);
    });
  });

})();
