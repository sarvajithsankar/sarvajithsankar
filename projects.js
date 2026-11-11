/**
 * Instrument Panel & Interactive Systems Architecture Engine
 * Features:
 * - Cursor-following panel glow
 * - SVG Architecture Diagram with Traveling Message Chips & Burst Trigger
 * - Pinned Scroll-Scrubbed Security Scene with Floating Step Card & Frame Counter
 * - Code Syntax Explorer & Stat Tweening
 */

(function () {
  'use strict';

  // 1. Cursor Follow Glow on all .panel elements
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.addEventListener('pointermove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      panel.style.setProperty('--mx', `${x}%`);
      panel.style.setProperty('--my', `${y}%`);
    });
  });

  // 2. Interactive SVG Architecture Flow
  const nodes = [
    { id: 'user', title: 'CLIENT INGEST', sub: 'REST / WEBSOCKET', state: 'active', desc: 'Inbound prompt payload received from client interface with session token and task constraints.' },
    { id: 'agent', title: 'REASONING CORE', sub: 'LLM RE-ACT LOOP', state: 'idle', desc: 'Decomposes complex technical query into sub-goals and determines tool invocation policy.' },
    { id: 'orchestrator', title: 'LANGGRAPH STATE', sub: 'EPISODIC MEMORY', state: 'idle', desc: 'State machine checkpointing short/long-term memory with ChromaDB vector recall.' },
    { id: 'tools', title: 'MCP PROTOCOL', sub: 'VERIFIED TOOLS', state: 'idle', desc: 'Sandboxed tool callers: arXiv, Tavily search, code sandbox, and PostgreSQL database queries.' },
    { id: 'result', title: 'SYNTHESIS ENGINE', sub: 'CITATION CHECK', state: 'idle', desc: 'Synthesizes grounded output document, verifies inline source citations, and passes safety audit.' }
  ];

  let activeNodeIndex = 0;

  window.selectArchitectureNode = function (index) {
    activeNodeIndex = index;
    const nodeData = nodes[index];

    // Update diagram node DOM states
    document.querySelectorAll('.diagram-node').forEach((nodeEl, idx) => {
      if (idx === index) {
        nodeEl.setAttribute('data-state', 'active');
      } else if (idx < index) {
        nodeEl.setAttribute('data-state', 'success');
      } else {
        nodeEl.setAttribute('data-state', 'idle');
      }
    });

    // Update Detail Text in Right Inspector
    const titleEl = document.getElementById('arch-inspector-title');
    const descEl = document.getElementById('arch-inspector-desc');
    const statePill = document.getElementById('arch-inspector-state');

    if (titleEl) titleEl.textContent = `${nodeData.title} // 0${index + 1}`;
    if (descEl) descEl.textContent = nodeData.desc;
    if (statePill) statePill.textContent = index === 4 ? 'VERIFIED' : 'ACTIVE';

    // Trigger Traveling Message Chip Animation along Connector
    animateTravelingPacket(index);
  };

  function animateTravelingPacket(step) {
    const chip = document.getElementById('traveling-message-chip');
    const path = document.getElementById(`connector-path-${step}`);
    if (!chip || !path) return;

    chip.style.opacity = '1';
    const totalLength = path.getTotalLength();
    const startTime = performance.now();
    const duration = 900; // ms

    function stepMotion(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const point = path.getPointAtLength(progress * totalLength);

      chip.style.left = `${point.x}px`;
      chip.style.top = `${point.y}px`;

      if (progress < 1) {
        requestAnimationFrame(stepMotion);
      } else {
        // Arrival: Fire particles burst at screen coordinates
        const rect = chip.getBoundingClientRect();
        window.dispatchEvent(new CustomEvent('particles:burst', {
          detail: {
            from: { x: rect.left, y: rect.top },
            to: { x: rect.left + 80, y: rect.top - 40 },
            count: 140,
            color: '#f28a2e'
          }
        }));

        setTimeout(() => {
          chip.style.opacity = '0';
        }, 200);
      }
    }
    requestAnimationFrame(stepMotion);
  }

  // Setup click listeners on SVG nodes
  document.querySelectorAll('.diagram-node').forEach((nodeEl, idx) => {
    nodeEl.addEventListener('click', () => {
      window.selectArchitectureNode(idx);
    });
  });

  // Run initial node
  setTimeout(() => {
    window.selectArchitectureNode(0);
  }, 500);

  // 3. Pinned Scroll-Scrubbed Scene: TENET-AI Security Pipeline (Section 9)
  const pinnedScene = document.getElementById('pinned-scene-section');

  const securitySteps = [
    {
      stepNum: '01 / 04',
      title: 'INBOUND INGESTION',
      action: 'INGEST',
      stateColor: '#8fb4ff',
      badgeIcon: '⚡',
      desc: 'Inbound prompt payload enters the defensive middleware proxy before model exposure. Token stream buffered in memory.'
    },
    {
      stepNum: '02 / 04',
      title: 'HEURISTIC SCANNER',
      action: 'FILTER',
      stateColor: '#f28a2e',
      badgeIcon: '🛡️',
      desc: 'Dual-stage pattern matching executes regex token filtering and jailbreak heuristic evaluation with sub-15ms latency overhead.'
    },
    {
      stepNum: '03 / 04',
      title: 'SEMANTIC DISTANCE',
      action: 'VERIFY',
      stateColor: '#ffd27a',
      badgeIcon: '🧠',
      desc: 'Embedding distance thresholding cross-references hostile payload vectors against cached attack manifolds in Redis.'
    },
    {
      stepNum: '04 / 04',
      title: 'APPEND-ONLY AUDIT',
      action: 'COMMIT',
      stateColor: '#7ee08f',
      badgeIcon: '✓',
      desc: 'Sanitized prompt dispatched to LLM. Execution hash, risk score, and telemetry committed to append-only PostgreSQL ledger.'
    }
  ];

  let currentStepIndex = 0;

  function updateSecurityStep(stepIdx, fractionInsideStep) {
    if (stepIdx !== currentStepIndex) {
      currentStepIndex = stepIdx;
      const data = securitySteps[stepIdx];

      // Update Card Header & Texts with fade/translate
      const card = document.getElementById('security-step-card');
      const counterEl = document.getElementById('sec-step-counter');
      const titleEl = document.getElementById('sec-step-title');
      const descEl = document.getElementById('sec-step-desc');
      const actionEl = document.getElementById('sec-step-action');
      const iconEl = document.getElementById('sec-step-icon');

      if (card) {
        card.style.borderTopColor = data.stateColor;
        card.style.boxShadow = `0 40px 80px -30px rgba(0, 0, 0, 0.9), 0 0 30px ${data.stateColor}33`;
      }
      if (counterEl) counterEl.textContent = data.stepNum;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.innerHTML = data.desc;
      if (actionEl) {
        actionEl.textContent = data.action;
        actionEl.style.color = data.stateColor;
      }
      if (iconEl) {
        iconEl.textContent = data.badgeIcon;
        iconEl.style.borderColor = data.stateColor;
        iconEl.style.color = data.stateColor;
      }

      // Update SVG Scene Node Highlights
      document.querySelectorAll('.sec-diagram-stage').forEach((stEl, idx) => {
        if (idx === stepIdx) {
          stEl.classList.add('is-active');
        } else if (idx < stepIdx) {
          stEl.classList.remove('is-active');
          stEl.classList.add('is-done');
        } else {
          stEl.classList.remove('is-active', 'is-done');
        }
      });
    }

    // Segment progress updates
    const segments = document.querySelectorAll('.sec-step-segment-fill');
    segments.forEach((segFill, idx) => {
      if (idx < stepIdx) {
        segFill.style.width = '100%';
        segFill.style.backgroundColor = securitySteps[stepIdx].stateColor;
      } else if (idx === stepIdx) {
        segFill.style.width = `${Math.round(fractionInsideStep * 100)}%`;
        segFill.style.backgroundColor = securitySteps[stepIdx].stateColor;
      } else {
        segFill.style.width = '0%';
      }
    });
  }

  if (typeof ScrollTrigger !== 'undefined' && pinnedScene) {
    if (window.innerWidth >= 768) {
      ScrollTrigger.create({
        trigger: pinnedScene,
        start: 'top top',
        end: '+=450%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const frame = Math.round(p * 960);
          window.setSceneFrame(frame, self.isActive);

          const stepCount = securitySteps.length;
          const rawStep = p * stepCount;
          const stepIndex = Math.min(stepCount - 1, Math.floor(rawStep));
          const frac = rawStep - stepIndex;

          updateSecurityStep(stepIndex, frac);
        }
      });
    }
  }

  // 4. Interactive Scenario Chips (Re-run sequence with different threat scenarios)
  const scenarioChips = document.querySelectorAll('.scenario-chip');
  scenarioChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      scenarioChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const scenario = chip.dataset.scenario;

      // Pulse spark burst to represent scenario switch
      const rect = chip.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent('particles:burst', {
        detail: {
          from: { x: rect.left, y: rect.top },
          to: { x: rect.left + 140, y: rect.top + 60 },
          count: 90,
          color: '#f28a2e'
        }
      }));
    });
  });

  // 5. Stat Counter Tweening (Counts up smoothly when scrolled into view)
  const statElements = document.querySelectorAll('.stat-val[data-target]');
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetNum = parseFloat(el.getAttribute('data-target'));
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          if (isNaN(targetNum)) return;

          let start = 0;
          const duration = 600;
          const startTime = performance.now();

          function stepTween(now) {
            const progress = Math.min(1, (now - startTime) / duration);
            const val = THREE.MathUtils.lerp(start, targetNum, progress);
            el.textContent = `${prefix}${val.toFixed(targetNum % 1 === 0 ? 0 : 1)}${suffix}`;
            if (progress < 1) requestAnimationFrame(stepTween);
          }
          requestAnimationFrame(stepTween);
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statElements.forEach(el => statObserver.observe(el));
  }

})();
