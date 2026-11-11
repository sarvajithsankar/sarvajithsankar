/**
 * Spiral / Ring Card Deck Engine
 * Procedural Marble Art (5 Color Families), 3D Tilt & Flip Anatomy,
 * 4-Stage GSAP Scroll Choreography, and Mobile Carousel Fallback
 */

(function () {
  'use strict';

  const deckData = [
    { id: 'hero', family: 'purple-orange', title: '00 // IDENTITY', desc: 'Autonomous AI agent engineering & systems architecture.', target: 'hero' },
    { id: 'tenet', family: 'teal-crimson', title: '01 // TENET-AI', desc: 'SSoC S5 defensive security middleware protecting LLM endpoints.', target: 'pinned-scene-section' },
    { id: 'agent-core', family: 'olive-gold', title: '02 // REASONING', desc: 'LangGraph multi-node state graphs with stateful memory loops.', target: 'architecture-section' },
    { id: 'sentinel', family: 'brushed-chrome', title: '03 // SENTINEL', desc: 'C++17 SIEM monitor with AVL-tree engine and RAID-1 vault.', target: 'projects-section' },
    { id: 'vit-rag', family: 'blue-red', title: '04 // DOCUMENT RAG', desc: 'ChromaDB vector search & verified institutional document citations.', target: 'projects-section' },
    { id: 'schema-match', family: 'purple-orange', title: '05 // SCHEMA MATCH', desc: 'Dense neural embeddings automating federated column alignment.', target: 'projects-section' },
    { id: 'churn-ml', family: 'olive-gold', title: '06 // CHURN PREDICT', desc: 'Threshold-tuned gradient boosting over 7,000+ customer records.', target: 'projects-section' },
    { id: 'mcp-tools', family: 'teal-crimson', title: '07 // MCP SUITE', desc: 'Standardized Model Context Protocol execution tools.', target: 'architecture-section' },
    { id: 'ai-lab', family: 'blue-red', title: '08 // AI LAB', desc: 'Empirical benchmarks: RAG vs Fine-Tuning & Memory scaling.', target: 'statement-section' },
    { id: 'timeline', family: 'brushed-chrome', title: '09 // ODYSSEY', desc: 'VIT Vellore x IIT Madras foundations to production backends.', target: 'timeline-section' },
    { id: 'terminal', family: 'purple-orange', title: '10 // TERMINAL', desc: 'Interactive developer console, key links, and contact routes.', target: 'contact-section' },
    { id: 'architecture', family: 'olive-gold', title: '11 // ARCHITECTURE', desc: 'Deep dive into 5-stage agent execution topology.', target: 'architecture-section' }
  ];

  const N = deckData.length;

  // -------------------------------------------------------------
  // PROCEDURAL MARBLE TEXTURE GENERATOR (5 Families)
  // -------------------------------------------------------------
  function generateMarbleCanvas(family, index) {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Palette palettes
    const palettes = {
      'purple-orange': ['#1b0d36', '#3a1f6b', '#9b3f9e', '#e0803a', '#f1ebdd'],
      'olive-gold': ['#22230a', '#4b4a1d', '#856f24', '#c9a63b', '#efe1a6'],
      'teal-crimson': ['#061a1a', '#0f3a3b', '#1d6a68', '#c0292b', '#11141a'],
      'blue-red': ['#0d1430', '#1a2a5e', '#8fb4ff', '#d83a3a', '#f1ebdd'],
      'brushed-chrome': ['#2d3037', '#6d7380', '#b4bac4', '#e9edf2', '#8b919c']
    };

    const colors = palettes[family] || palettes['purple-orange'];

    // Multi-octave domain warped noise simulation using sinusoids & turbulence
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // Helper to parse hex
    function hexToRgb(hex) {
      const bigint = parseInt(hex.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    const rgbColors = colors.map(hexToRgb);

    const seed = index * 137.5;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w * 4.0;
        const ny = y / h * 4.0;

        // Domain warping: p + sin(p)
        const qx = Math.sin(nx * 1.5 + seed * 0.01) + Math.cos(ny * 2.1);
        const qy = Math.cos(nx * 1.8) + Math.sin(ny * 1.4 + seed * 0.02);

        const rx = Math.sin(nx + 3.0 * qx + 0.3);
        const ry = Math.cos(ny + 3.0 * qy + 0.5);

        let v = (Math.sin(nx + rx * 2.2) + Math.cos(ny + ry * 2.2)) * 0.5 + 0.5;
        v = Math.max(0, Math.min(1, v));

        // Color ramp interpolation
        const cIndex = v * (rgbColors.length - 1);
        const c0 = rgbColors[Math.floor(cIndex)];
        const c1 = rgbColors[Math.ceil(cIndex)];
        const f = cIndex - Math.floor(cIndex);

        const r = c0[0] + (c1[0] - c0[0]) * f;
        const g = c0[1] + (c1[1] - c0[1]) * f;
        const b = c0[2] + (c1[2] - c0[2]) * f;

        const pIdx = (y * w + x) * 4;
        data[pIdx] = r;
        data[pIdx + 1] = g;
        data[pIdx + 2] = b;
        data[pIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Fine brushed overlay if chrome
    if (family === 'brushed-chrome') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < h; i += 2) {
        ctx.fillRect(0, i, w, 1);
      }
    }

    return canvas.toDataURL('image/webp', 0.85);
  }

  // -------------------------------------------------------------
  // BUILD CARD DOM
  // -------------------------------------------------------------
  const cardContainer = document.getElementById('card-deck-viewport');
  const cards = [];

  if (!cardContainer) return;

  cardContainer.innerHTML = '';

  deckData.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'deck-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${item.title}: ${item.desc}`);

    const bgUrl = generateMarbleCanvas(item.family, i);

    card.innerHTML = `
      <div class="deck-card-inner">
        <div class="deck-card-front" style="background-image: url('${bgUrl}');">
          <div class="card-dot"></div>
          <div class="card-vertical-label">${item.title}</div>
        </div>
        <div class="deck-card-back">
          <div class="card-back-title">${item.title}</div>
          <div class="card-back-desc">${item.desc}</div>
          <button class="card-go-btn" type="button">GO →</button>
        </div>
      </div>
    `;

    // 3D Pointer Tilt
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `scale(1.05) rotateY(${px * 16}deg) rotateX(${-py * 16}deg) translateZ(24px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });

    // GO Button navigation
    const goBtn = card.querySelector('.card-go-btn');
    if (goBtn) {
      goBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.scrollToSection(item.target);
      });
    }

    // Keyboard accessibility: Enter/Space flips, second Enter activates GO
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (card.classList.contains('is-flipped')) {
          window.scrollToSection(item.target);
        } else {
          card.classList.add('is-flipped');
        }
      }
    });

    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });

    cardContainer.appendChild(card);
    cards.push(card);
  });

  // -------------------------------------------------------------
  // 4-STAGE SCROLL CHOREOGRAPHY (GSAP + ScrollTrigger)
  // -------------------------------------------------------------
  const pinnedSection = document.getElementById('deck-pinned-section');
  const centerText = document.getElementById('card-deck-center-text');

  if (window.innerWidth < 768) {
    // Mobile mode handled by CSS scroll-snap carousel
    return;
  }

  function getLayout(i, stage, p) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const normI = i - N / 2;

    if (stage === 0) {
      // Stage 0: Peek arc below fold
      return {
        x: normI * 120,
        y: vh * 0.42 + Math.abs(normI) * 6,
        rot: normI * 5,
        scale: 0.9,
        z: 0,
        opacity: 0.95
      };
    } else if (stage === 1) {
      // Stage 1: Full ring around centered text with swirl
      const spiralOffset = (1 - p) * Math.PI * 2;
      const theta = (i / N) * Math.PI * 2 - Math.PI / 2 + spiralOffset;
      const R = Math.min(vw, vh) * 0.32;
      return {
        x: Math.cos(theta) * R,
        y: Math.sin(theta) * R * 0.92,
        rot: (theta * 180 / Math.PI) + 90,
        scale: 0.88 + ((i % 3) * 0.05),
        z: ((i % 4) - 2) * 20,
        opacity: 1
      };
    } else if (stage === 2) {
      // Stage 2: Horizontal fan row (smile curve) under section headline
      return {
        x: normI * 190,
        y: 40 + Math.sin((i / N) * Math.PI) * -60 + Math.abs(normI) * 4,
        rot: normI * 3.2,
        scale: 1.0,
        z: 0,
        opacity: 1
      };
    } else {
      // Stage 3: Exit translating left across viewport
      return {
        x: normI * 190 - vw * 1.5 * (p - 0.75) * 4.0,
        y: 40 + Math.sin((i / N) * Math.PI) * -60,
        rot: normI * 3.2 - 15,
        scale: 0.95,
        z: -50,
        opacity: Math.max(0, 1 - (p - 0.85) * 6)
      };
    }
  }

  function lerpLayout(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      rot: a.rot + (b.rot - a.rot) * t,
      scale: a.scale + (b.scale - a.scale) * t,
      z: a.z + (b.z - a.z) * t,
      opacity: a.opacity + (b.opacity - a.opacity) * t
    };
  }

  if (typeof ScrollTrigger !== 'undefined' && pinnedSection) {
    ScrollTrigger.create({
      trigger: pinnedSection,
      start: 'top top',
      end: '+=450%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;

        // Center text opacity (peaks during ring stage 1)
        if (centerText) {
          if (p >= 0.15 && p <= 0.55) {
            centerText.style.opacity = '1';
          } else {
            centerText.style.opacity = '0';
          }
        }

        cards.forEach((card, i) => {
          // Stagger progress per card
          const cardP = Math.min(1, Math.max(0, p + (i / N) * 0.05 - 0.025));

          let pos;
          if (cardP < 0.28) {
            // Stage 0 -> 1
            const t = cardP / 0.28;
            const l0 = getLayout(i, 0, cardP);
            const l1 = getLayout(i, 1, cardP);
            pos = lerpLayout(l0, l1, t);
          } else if (cardP < 0.65) {
            // Stage 1 -> 2
            const t = (cardP - 0.28) / 0.37;
            const l1 = getLayout(i, 1, cardP);
            const l2 = getLayout(i, 2, cardP);
            pos = lerpLayout(l1, l2, t);
          } else {
            // Stage 2 -> 3
            pos = getLayout(i, 3, cardP);
          }

          card.style.transform = `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotate(${pos.rot}deg) scale(${pos.scale})`;
          card.style.opacity = pos.opacity;
        });
      }
    });
  }

})();
