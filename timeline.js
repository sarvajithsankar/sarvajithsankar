/**
 * Pinned Horizontal Timeline Engine (Section 11.5)
 * - Pinned horizontal scrub: translates inner track across viewport
 * - 2D Canvas wavy particle river (1,400 dots following sine wave drift)
 * - Alternating milestones with Anton numeral years & self-drawing vertical connectors
 */

(function () {
  'use strict';

  const timelineSection = document.getElementById('timeline-section');
  const track = document.getElementById('timeline-track');
  const riverCanvas = document.getElementById('timeline-river-canvas');

  if (!timelineSection || !track) return;

  // 1. Particle River (Canvas 2D, 1400 dots)
  let ctx = null;
  const DOT_COUNT = 1400;
  const dots = [];

  if (riverCanvas) {
    ctx = riverCanvas.getContext('2d');
    function resizeRiver() {
      riverCanvas.width = riverCanvas.parentElement.offsetWidth || window.innerWidth;
      riverCanvas.height = 80;
    }
    resizeRiver();
    window.addEventListener('resize', resizeRiver);

    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * 3200,
        offsetY: (Math.random() - 0.5) * 20,
        speed: 0.4 + Math.random() * 0.8,
        size: Math.random() > 0.85 ? 1.5 : 1.0,
        alpha: 0.15 + Math.random() * 0.35
      });
    }

    let riverTime = 0;
    function renderRiver() {
      if (!ctx) return;
      ctx.clearRect(0, 0, riverCanvas.width, riverCanvas.height);

      const midY = riverCanvas.height / 2;
      riverTime += 0.02;

      ctx.fillStyle = 'rgba(241, 235, 221, 0.35)'; // Cream

      for (let i = 0; i < DOT_COUNT; i++) {
        const d = dots[i];
        d.x -= d.speed;
        if (d.x < 0) d.x = 3200;

        // Wave formula: y = sin(x * 0.012 + t) * 18 + midY
        const y = Math.sin(d.x * 0.012 + riverTime) * 18 + midY + d.offsetY;

        ctx.globalAlpha = d.alpha;
        ctx.fillRect(d.x, y, d.size, d.size);
      }
      ctx.globalAlpha = 1.0;

      requestAnimationFrame(renderRiver);
    }
    requestAnimationFrame(renderRiver);
  }

  // 2. Horizontal Scrubbing with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined' && window.innerWidth >= 768) {
    function getScrollDistance() {
      return track.scrollWidth - window.innerWidth + 120;
    }

    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'top top',
      end: () => `+=${getScrollDistance()}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        const totalDist = getScrollDistance();
        const currentX = -p * totalDist;
        track.style.transform = `translateX(${currentX}px)`;

        // Check each milestone position to draw connectors
        const milestones = track.querySelectorAll('.milestone-node');
        milestones.forEach((m) => {
          const rect = m.getBoundingClientRect();
          const connector = m.querySelector('.milestone-connector');
          if (connector) {
            if (rect.left <= window.innerWidth * 0.72) {
              connector.classList.add('is-drawn');
            } else {
              connector.classList.remove('is-drawn');
            }
          }
        });
      }
    });
  }

})();
