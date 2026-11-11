/**
 * Persistent Chrome Controller
 * Hairline progress, Contents button + overlay (with focus trap),
 * Right-edge tick rail, Scroll percentage readout, Frame counter, and Fullscreen loader
 */

(function () {
  'use strict';

  const sectionsData = [
    { id: 'hero', index: '00', title: 'HERO // IDENTITY' },
    { id: 'deck-section', index: '01', title: 'MODULE REGISTRY' },
    { id: 'statement-section', index: '02', title: 'CORE PHILOSOPHY' },
    { id: 'architecture-section', index: '03', title: 'AGENT ARCHITECTURE' },
    { id: 'pinned-scene-section', index: '04', title: 'SECURITY PIPELINE' },
    { id: 'projects-section', index: '05', title: 'PRODUCTION SYSTEMS' },
    { id: 'timeline-section', index: '06', title: 'ENGINEERING ODYSSEY' },
    { id: 'contact-section', index: '07', title: 'COMMAND TERMINAL' }
  ];

  // 1. Initial Loader Sequence
  const loader = document.getElementById('fullscreen-loader');
  const loaderCounter = document.getElementById('loader-counter');
  const loaderFill = document.getElementById('loader-fill');
  const loaderInner = document.getElementById('loader-inner');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isVisited = sessionStorage.getItem('cinematic_portfolio_visited');

  if (loader) {
    if (prefersReducedMotion || isVisited) {
      loader.style.display = 'none';
      revealHeroDirect();
    } else {
      sessionStorage.setItem('cinematic_portfolio_visited', 'true');
      let progress = 0;
      const startTime = performance.now();
      const minDuration = 1100; // between 900ms and 1800ms

      function updateLoader(now) {
        const elapsed = now - startTime;
        progress = Math.min(100, Math.floor((elapsed / minDuration) * 100));

        if (loaderCounter) {
          loaderCounter.textContent = String(progress).padStart(3, '0') + '%';
        }
        if (loaderFill) {
          loaderFill.style.width = progress + '%';
        }

        if (progress < 100) {
          requestAnimationFrame(updateLoader);
        } else {
          // Loader finished
          setTimeout(() => {
            if (loaderInner) {
              loaderInner.style.transform = 'translateY(-12px)';
              loaderInner.style.opacity = '0';
            }
            setTimeout(() => {
              loader.style.clipPath = 'inset(0 0 100% 0)';
              setTimeout(() => {
                loader.style.display = 'none';
                revealHeroDirect();
              }, 750);
            }, 300);
          }, 120);
        }
      }
      requestAnimationFrame(updateLoader);
    }
  }

  function revealHeroDirect() {
    document.querySelectorAll('.hero-headline .headline-inner').forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('is-inview');
      }, 100 + i * 90);
    });
  }

  // 2. Scroll Progress Hairline & Percentage Readout
  const progressHairline = document.getElementById('progress-hairline');
  const scrollPercentage = document.getElementById('scroll-percentage');

  function onScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    if (progressHairline) {
      // 24px min stub at 0%
      const minRatio = 24 / window.innerWidth;
      const currentScale = Math.max(minRatio, ratio);
      progressHairline.style.transform = `scaleX(${currentScale})`;
    }

    if (scrollPercentage) {
      const pct = Math.round(ratio * 100);
      scrollPercentage.textContent = String(pct).padStart(3, '0') + '%';
    }

    updateActiveTick();
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(onScrollProgress);
  }, { passive: true });

  onScrollProgress();

  // 3. CONTENTS Button & Overlay with Focus Trap
  const contentsBtn = document.getElementById('contents-btn');
  const contentsOverlay = document.getElementById('contents-overlay');
  const contentsCloseBtn = document.getElementById('contents-close-btn');
  const previewBigIdx = document.getElementById('contents-preview-big-idx');

  function openContents() {
    if (!contentsOverlay) return;
    contentsOverlay.classList.add('is-open');
    contentsBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    contentsCloseBtn.focus();
    document.addEventListener('keydown', handleOverlayKeydown);
  }

  function closeContents() {
    if (!contentsOverlay) return;
    contentsOverlay.classList.remove('is-open');
    contentsBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    contentsBtn.focus();
    document.removeEventListener('keydown', handleOverlayKeydown);
  }

  function handleOverlayKeydown(e) {
    if (e.key === 'Escape') {
      closeContents();
      return;
    }
    if (e.key === 'Tab') {
      const focusables = contentsOverlay.querySelectorAll('button, [href], [tabindex="0"]');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  if (contentsBtn) {
    contentsBtn.addEventListener('click', () => {
      const isOpen = contentsOverlay.classList.contains('is-open');
      if (isOpen) closeContents(); else openContents();
    });
  }

  if (contentsCloseBtn) {
    contentsCloseBtn.addEventListener('click', closeContents);
  }

  // Populate Contents List Rows
  const contentsList = document.getElementById('contents-list');
  if (contentsList) {
    contentsList.innerHTML = '';
    sectionsData.forEach((sec) => {
      const row = document.createElement('div');
      row.className = 'contents-row';
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.innerHTML = `
        <span class="row-idx">${sec.index}</span>
        <span class="row-title">${sec.title}</span>
      `;

      row.addEventListener('mouseenter', () => {
        if (previewBigIdx) previewBigIdx.textContent = sec.index;
      });

      row.addEventListener('click', () => {
        closeContents();
        scrollToSection(sec.id);
      });

      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeContents();
          scrollToSection(sec.id);
        }
      });

      contentsList.appendChild(row);
    });
  }

  // 4. Right-Edge Tick Rail
  const tickRail = document.getElementById('tick-rail');
  if (tickRail) {
    tickRail.innerHTML = '';
    sectionsData.forEach((sec, idx) => {
      const item = document.createElement('button');
      item.className = 'tick-item';
      item.setAttribute('aria-label', sec.title);
      item.dataset.targetId = sec.id;
      item.dataset.index = idx;
      item.innerHTML = `
        <span class="tick-tooltip">${sec.index} // ${sec.title}</span>
        <span class="tick-line"></span>
      `;

      item.addEventListener('click', () => {
        scrollToSection(sec.id);
      });

      tickRail.appendChild(item);
    });
  }

  function updateActiveTick() {
    const scrollMiddle = window.scrollY + window.innerHeight * 0.45;
    let activeIdx = 0;

    sectionsData.forEach((sec, idx) => {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        if (scrollMiddle >= top) {
          activeIdx = idx;
        }
      }
    });

    const tickItems = document.querySelectorAll('.tick-item');
    tickItems.forEach((tItem, i) => {
      tItem.classList.remove('is-active', 'is-near-active');
      if (i === activeIdx) {
        tItem.classList.add('is-active');
      } else if (i === activeIdx - 1 || i === activeIdx + 1) {
        tItem.classList.add('is-near-active');
      }
    });
  }

  // 5. Smooth Scroll Navigation with Lenis Support
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(el, {
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4)
      });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 6. Scene Frame Counter Exposure
  const frameCounterEl = document.getElementById('scene-frame-counter');
  const frameNumeratorEl = document.getElementById('scene-frame-num');

  window.setSceneFrame = function (currentFrame, isPinned) {
    if (!frameCounterEl) return;
    if (isPinned) {
      frameCounterEl.classList.add('is-active');
      if (frameNumeratorEl) {
        frameNumeratorEl.textContent = String(Math.min(960, Math.max(0, currentFrame))).padStart(4, '0');
      }
    } else {
      frameCounterEl.classList.remove('is-active');
    }
  };

})();
