/**
 * Sarvajith Sankar — Portfolio Logic & Interactivity
 * Pure Vanilla JavaScript · Three.js Hero Background · Dynamic Hydration from data.js
 */

document.addEventListener("DOMContentLoaded", () => {
  // Ensure PORTFOLIO_DATA is present
  if (typeof PORTFOLIO_DATA === "undefined") {
    console.error("PORTFOLIO_DATA not loaded. Check data.js path.");
    return;
  }

  initApp(PORTFOLIO_DATA);
});

function initApp(data) {
  renderNavbar(data);
  renderHero(data);
  renderCurrentlyBuilding(data);
  renderFeaturedProjects(data);
  renderArchitecture(data);
  renderAILab(data);
  renderStack(data);
  renderProofOfWork(data);
  renderTimeline(data);
  renderAbout(data);
  renderContact(data);
  renderFooter(data);

  initTypewriter(data.profile.roles);
  initThreeHeroBackground();
  initMobileNav();
}

/* =========================================================
   1. NAVBAR
   ========================================================= */
function renderNavbar(data) {
  const brandEl = document.getElementById("nav-brand-name");
  if (brandEl) brandEl.textContent = data.profile.name;

  const statusTextEl = document.getElementById("nav-status-text");
  if (statusTextEl) {
    statusTextEl.textContent = "AI Intern @ Maveric Systems";
  }
}

function initMobileNav() {
  const toggleBtn = document.getElementById("nav-mobile-toggle");
  const navLinks = document.getElementById("nav-links");
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("mobile-open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close nav on link click
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================================
   2. HERO SECTION
   ========================================================= */
function renderHero(data) {
  const p = data.profile;
  const statusEl = document.getElementById("hero-status-text");
  if (statusEl) statusEl.textContent = p.statusBadge.text;

  const nameEl = document.getElementById("hero-name");
  if (nameEl) nameEl.textContent = p.name;

  const taglineEl = document.getElementById("hero-tagline");
  if (taglineEl) taglineEl.textContent = p.tagline;

  const subtitleEl = document.getElementById("hero-subtitle");
  if (subtitleEl) subtitleEl.textContent = p.subtitle;

  const githubBtn = document.getElementById("hero-cta-github");
  if (githubBtn) githubBtn.href = p.links.github;

  // Avatar side card
  const avatarImg = document.getElementById("hero-avatar-img");
  if (avatarImg && p.avatarUrl) avatarImg.src = p.avatarUrl;

  const metaLocation = document.getElementById("hero-meta-location");
  if (metaLocation) metaLocation.textContent = "Vellore / Bengaluru";

  const metaTarget = document.getElementById("hero-meta-target");
  if (metaTarget) metaTarget.textContent = "AI / ML Engineering";
}

/* =========================================================
   3. TYPEWRITER EFFECT
   ========================================================= */
function initTypewriter(words) {
  const textEl = document.getElementById("typewriter-output");
  if (!textEl || !words || words.length === 0) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    textEl.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 65;
  const deleteSpeed = 30;
  const holdDelay = 1800;

  function tick() {
    const currentWord = words[wordIndex % words.length];

    if (isDeleting) {
      charIndex--;
      textEl.textContent = currentWord.substring(0, charIndex);
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleteSpeed);
    } else {
      charIndex++;
      textEl.textContent = currentWord.substring(0, charIndex);
      if (charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(tick, holdDelay);
        return;
      }
      setTimeout(tick, typeSpeed);
    }
  }

  tick();
}

/* =========================================================
   4. THREE.JS 3D HERO BACKGROUND
   ========================================================= */
function initThreeHeroBackground() {
  const canvas = document.getElementById("hero-three-canvas");
  if (!canvas || typeof THREE === "undefined") {
    console.warn("Three.js not loaded or canvas missing.");
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroSection = document.getElementById("hero");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 7;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  } catch (e) {
    console.warn("WebGL initialization skipped:", e);
    return;
  }

  // Create subtle 3D abstract polyhedral group
  const group = new THREE.Group();

  // 1. Central Icosahedron Wireframe
  const geomIcosa = new THREE.IcosahedronGeometry(2.2, 1);
  const matWire = new THREE.MeshBasicMaterial({
    color: 0x7C3AED, // Electric violet
    wireframe: true,
    transparent: true,
    opacity: 0.16
  });
  const meshIcosa = new THREE.Mesh(geomIcosa, matWire);
  group.add(meshIcosa);

  // 2. Inner Nested Torus Wireframe
  const geomTorus = new THREE.TorusGeometry(1.4, 0.4, 16, 50);
  const matTorus = new THREE.MeshBasicMaterial({
    color: 0x0D9488, // Electric teal accent
    wireframe: true,
    transparent: true,
    opacity: 0.10
  });
  const meshTorus = new THREE.Mesh(geomTorus, matTorus);
  group.add(meshTorus);

  // 3. Subtle floating particle constellation
  const particleCount = 45;
  const partGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 8;
    positions[i + 1] = (Math.random() - 0.5) * 8;
    positions[i + 2] = (Math.random() - 0.5) * 6;
  }
  partGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0x7C3AED,
    size: 0.055,
    transparent: true,
    opacity: 0.28
  });
  const particleSystem = new THREE.Points(partGeom, partMat);
  group.add(particleSystem);

  scene.add(group);

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener("mousemove", (e) => {
    if (prefersReducedMotion) return;
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    mouseX = (e.clientX - halfW) * 0.0004;
    mouseY = (e.clientY - halfH) * 0.0004;
  });

  // Resize handler
  function handleResize() {
    if (!canvas.parentElement) return;
    const width = canvas.parentElement.offsetWidth;
    const height = canvas.parentElement.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    if (prefersReducedMotion) renderer.render(scene, camera);
  }
  window.addEventListener("resize", handleResize);

  // Animation Loop with Visibility Observer
  let isHeroVisible = true;
  let animationFrameId;

  if ("IntersectionObserver" in window && heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(heroSection);
  }

  function animate() {
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
      return;
    }

    animationFrameId = requestAnimationFrame(animate);

    if (!isHeroVisible) return; // Save battery/CPU when scrolled down

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    meshIcosa.rotation.x += 0.0015;
    meshIcosa.rotation.y += 0.0022;

    meshTorus.rotation.x -= 0.002;
    meshTorus.rotation.z += 0.0018;

    particleSystem.rotation.y += 0.0008;

    group.rotation.y = targetX * 1.5;
    group.rotation.x = targetY * 1.5;

    renderer.render(scene, camera);
  }

  animate();
}

/* =========================================================
   5. CURRENTLY BUILDING SECTION
   ========================================================= */
function renderCurrentlyBuilding(data) {
  const cb = data.currentlyBuilding;
  const container = document.getElementById("currently-building-content");
  if (!container || !cb) return;

  const stackHtml = cb.stack.map(chip => `<span class="chip chip-accent">${chip}</span>`).join("");

  container.innerHTML = `
    <div class="building-header">
      <div class="building-title-wrap">
        <div class="chip chip-teal mb-2">
          <span class="live-dot"></span> Active Focus
        </div>
        <h3 class="mt-2">${cb.title}</h3>
        <div class="building-org">${cb.organization} · <span class="text-muted font-normal">${cb.role} (${cb.period})</span></div>
      </div>
      <div class="building-location chip">${cb.location}</div>
    </div>
    
    <p class="building-body font-medium text-slate-800 mb-2">${cb.valueProp}</p>
    <p class="building-body">${cb.description}</p>

    <div class="building-progress-wrap">
      <div class="progress-label-row">
        <span class="text-primary font-bold">${cb.milestone.label}</span>
        <span class="text-accent font-bold">${cb.milestone.progressPercent}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${cb.milestone.progressPercent}%;"></div>
      </div>
      <div class="progress-note">${cb.milestone.statusNote}</div>
    </div>

    <div class="building-stack">
      ${stackHtml}
    </div>
  `;
}

/* =========================================================
   6. FEATURED PROJECTS (3 PRODUCT CARDS)
   ========================================================= */
function renderFeaturedProjects(data) {
  const grid = document.getElementById("featured-projects-grid");
  if (!grid || !data.featuredProjects) return;

  grid.innerHTML = data.featuredProjects.map(p => {
    const stackChips = p.stack.map(s => `<span class="chip">${s}</span>`).join("");
    const capabilitiesList = p.capabilities.map(c => `<li>${c}</li>`).join("");

    const isPlaceholderDemo = p.demoUrl.includes("[PLACEHOLDER");
    const demoButton = isPlaceholderDemo
      ? `<span class="btn btn-secondary btn-sm opacity-75" title="Live demo deployment in progress">Demo [PLACEHOLDER]</span>`
      : `<a href="${p.demoUrl}" target="_blank" rel="noreferrer" class="btn btn-secondary btn-sm">Live Demo</a>`;

    return `
      <div class="project-card">
        <div class="project-top">
          <div class="project-badges-row">
            <span class="chip chip-accent">${p.category}</span>
            <span class="chip chip-teal">${p.contextBadge}</span>
          </div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-value-prop">${p.valueProp}</p>
          <p class="project-description">${p.description}</p>
          
          <ul class="project-capabilities">
            ${capabilitiesList}
          </ul>

          <div class="project-metrics-slot">
            <span class="metrics-slot-label">Metric Benchmark</span>
            <span class="metrics-slot-text">${p.metrics}</span>
          </div>

          <div class="project-stack">
            ${stackChips}
          </div>
        </div>

        <div class="project-links">
          <a href="${p.githubUrl}" target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            GitHub
          </a>
          ${demoButton}
        </div>
      </div>
    `;
  }).join("");
}

/* =========================================================
   7. INTERACTIVE ARCHITECTURE FLOW
   ========================================================= */
function renderArchitecture(data) {
  const flowContainer = document.getElementById("architecture-flow-nodes");
  const inspector = document.getElementById("architecture-inspector");
  if (!flowContainer || !inspector || !data.architectureFlow) return;

  const nodes = data.architectureFlow.nodes;

  // Render clickable flow nodes
  flowContainer.innerHTML = nodes.map((n, idx) => `
    <div class="arch-node ${idx === 0 ? "active" : ""}" data-node-id="${n.id}" tabindex="0" role="button" aria-label="Step ${n.step}: ${n.label}">
      <span class="arch-step-badge">STEP ${n.step}</span>
      <div class="arch-node-title">${n.label}</div>
      <div class="arch-node-sub">${n.sub}</div>
      ${idx < nodes.length - 1 ? '<div class="arch-connector"></div>' : ''}
    </div>
  `).join("");

  // Helper to update inspector content
  function updateInspector(node) {
    inspector.innerHTML = `
      <div class="inspector-header">
        <div class="inspector-title-row">
          <span class="arch-step-badge">STEP ${node.step}</span>
          <span class="inspector-title">${node.label}</span>
          <span class="chip chip-accent">${node.sub}</span>
        </div>
      </div>
      <p class="inspector-summary font-semibold text-slate-900">${node.summary}</p>
      <p class="inspector-summary">${node.details}</p>
      <div class="inspector-io-grid">
        <div class="io-box">
          <div class="io-label">Incoming Inputs / Context</div>
          <div class="io-content">${node.inputs}</div>
        </div>
        <div class="io-box">
          <div class="io-label">Produced Outputs / Actions</div>
          <div class="io-content">${node.outputs}</div>
        </div>
      </div>
    `;
  }

  // Initialize with first node
  updateInspector(nodes[0]);

  // Bind interaction events
  const nodeEls = flowContainer.querySelectorAll(".arch-node");
  nodeEls.forEach(el => {
    const nodeId = el.getAttribute("data-node-id");
    const nodeObj = nodes.find(n => n.id === nodeId);

    function selectNode() {
      nodeEls.forEach(n => n.classList.remove("active"));
      el.classList.add("active");
      if (nodeObj) updateInspector(nodeObj);
    }

    el.addEventListener("click", selectNode);
    el.addEventListener("mouseenter", selectNode);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectNode();
      }
    });
  });
}

/* =========================================================
   8. AI LAB
   ========================================================= */
function renderAILab(data) {
  const grid = document.getElementById("ailab-grid");
  if (!grid || !data.aiLab) return;

  grid.innerHTML = data.aiLab.map(exp => {
    const metricsHtml = exp.metrics.map(m => `
      <div class="exp-metric-item">
        <span class="exp-metric-val">${m.val}</span>
        <span class="exp-metric-label">${m.label}</span>
      </div>
    `).join("");

    return `
      <div class="experiment-card">
        <div>
          <div class="exp-tag-row">
            <span class="chip chip-teal">${exp.tag}</span>
          </div>
          <h3 class="exp-title">${exp.title}</h3>
          <p class="exp-summary">${exp.summary}</p>
          
          <div class="exp-finding-box">
            <strong>Key Finding:</strong> ${exp.finding}
          </div>
        </div>

        <div>
          <div class="chip-metric-placeholder mb-3 w-full text-center">
            ${exp.metricsNote}
          </div>
          <div class="exp-metrics-grid">
            ${metricsHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* =========================================================
   9. ENGINEERING STACK
   ========================================================= */
function renderStack(data) {
  const grid = document.getElementById("stack-grid");
  if (!grid || !data.stackGroups) return;

  grid.innerHTML = data.stackGroups.map(group => {
    const skillsHtml = group.skills.map(s => `
      <span class="skill-pill">
        <span class="skill-level-dot"></span>
        ${s.name}
      </span>
    `).join("");

    return `
      <div class="stack-group-card">
        <h3 class="stack-group-title">${group.category}</h3>
        <p class="stack-group-desc">${group.description}</p>
        <div class="stack-skills-list">
          ${skillsHtml}
        </div>
      </div>
    `;
  }).join("");
}

/* =========================================================
   10. PROOF OF WORK
   ========================================================= */
function renderProofOfWork(data) {
  const grid = document.getElementById("pow-grid");
  if (!grid || !data.proofOfWork) return;

  grid.innerHTML = data.proofOfWork.map(item => `
    <div class="pow-card">
      <div class="pow-metric">${item.metric}</div>
      <div class="pow-label">${item.label}</div>
      <div class="pow-note">${item.note}</div>
    </div>
  `).join("");
}

/* =========================================================
   11. LEARNING TIMELINE
   ========================================================= */
function renderTimeline(data) {
  const wrap = document.getElementById("timeline-wrap");
  if (!wrap || !data.learningTimeline) return;

  const timelineHtml = data.learningTimeline.map(item => {
    const bulletsHtml = item.bullets.map(b => `<li>${b}</li>`).join("");
    return `
      <div class="timeline-item">
        <div class="timeline-node"></div>
        <div class="timeline-content">
          <span class="timeline-year-badge">${item.year}</span>
          <h3 class="timeline-title">${item.title}</h3>
          <ul class="timeline-bullets">
            ${bulletsHtml}
          </ul>
        </div>
      </div>
    `;
  }).join("");

  wrap.innerHTML = `
    <div class="timeline-line"></div>
    ${timelineHtml}
  `;
}

/* =========================================================
   12. ABOUT SECTION
   ========================================================= */
function renderAbout(data) {
  const container = document.getElementById("about-paragraphs");
  if (!container || !data.profile.bio) return;

  container.innerHTML = data.profile.bio.map(para => `<p>${para}</p>`).join("");
}

/* =========================================================
   13. CONTACT / CTA SECTION
   ========================================================= */
function renderContact(data) {
  const p = data.profile;

  const emailVal = document.getElementById("contact-val-email");
  if (emailVal) emailVal.textContent = p.links.email;

  const githubVal = document.getElementById("contact-val-github");
  if (githubVal) githubVal.textContent = p.links.github.replace("https://", "");

  const linkedinVal = document.getElementById("contact-val-linkedin");
  if (linkedinVal) linkedinVal.textContent = p.links.linkedin.replace("https://", "");

  const resumeVal = document.getElementById("contact-val-resume");
  if (resumeVal) resumeVal.textContent = p.links.resume;

  // Contact channel links
  const emailLink = document.getElementById("contact-link-email");
  if (emailLink) emailLink.href = `mailto:${p.links.email}`;

  const githubLink = document.getElementById("contact-link-github");
  if (githubLink) githubLink.href = p.links.github;

  const linkedinLink = document.getElementById("contact-link-linkedin");
  if (linkedinLink) linkedinLink.href = p.links.linkedin;

  // Copy Email button setup
  const copyBtn = document.getElementById("copy-email-btn");
  const copyFeedback = document.getElementById("copy-email-feedback");
  if (copyBtn && copyFeedback) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(p.links.email).then(() => {
        copyFeedback.classList.add("visible");
        setTimeout(() => copyFeedback.classList.remove("visible"), 2500);
      }).catch(err => {
        console.warn("Clipboard copy failed:", err);
      });
    });
  }

  // Target roles box
  const targetRoles = document.getElementById("target-roles-text");
  if (targetRoles) targetRoles.textContent = p.targetRoles;

  const prefLoc = document.getElementById("target-location-text");
  if (prefLoc) prefLoc.textContent = p.preferredLocation;
}

/* =========================================================
   14. FOOTER
   ========================================================= */
function renderFooter(data) {
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  const footerName = document.getElementById("footer-name");
  if (footerName) footerName.textContent = data.profile.name;
}
