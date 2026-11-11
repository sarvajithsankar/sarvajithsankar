/**
 * WebGL Particle Field Engine (Signature Element)
 * Three.js + Custom ShaderMaterial
 * Features: Morphing Shape Library, NDC Cursor Repel, Twinkle, Spark Burst API
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion or WebGL support
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('bg-particle-canvas');
  const fallback = document.querySelector('.bg-atmosphere-fallback');

  if (!canvas) return;

  if (prefersReducedMotion || !window.WebGLRenderingContext) {
    if (fallback) fallback.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    return;
  }

  // Point counts per device
  const width = window.innerWidth;
  let POINT_COUNT = 48000;
  if (width < 768) {
    POINT_COUNT = 9000;
  } else if (width < 1100) {
    POINT_COUNT = 24000;
  }

  const isMobile = width < 768;

  // Scene & Camera setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    if (fallback) fallback.style.display = 'block';
    canvas.style.display = 'none';
    return;
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Colors
  const COLOR_WHITE = new THREE.Color('#dfe8ff');
  const COLOR_BLUE = new THREE.Color('#9cb8ff');
  const COLOR_ORANGE = new THREE.Color('#f28a2e');
  const COLOR_YELLOW = new THREE.Color('#ffd27a');

  // Random generators
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randGaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // -------------------------------------------------------------
  // SHAPE GENERATORS (Each outputs Float32Array of POINT_COUNT * 3)
  // -------------------------------------------------------------

  function generateGalaxy() {
    const pos = new Float32Array(POINT_COUNT * 3);
    const discCount = Math.floor(POINT_COUNT * 0.85);

    for (let i = 0; i < discCount; i++) {
      const idx = i * 3;
      const r = Math.pow(Math.random(), 0.6) * 9.0;
      const a = Math.random() * Math.PI * 2 + r * 0.35;
      pos[idx] = Math.cos(a) * r;
      pos[idx + 1] = (Math.random() - 0.5) * 0.12 * (1.0 + r * 0.05);
      pos[idx + 2] = Math.sin(a) * r * 0.55;
    }

    // 15% in denser torus/ring placed right of center
    for (let i = discCount; i < POINT_COUNT; i++) {
      const idx = i * 3;
      const ringRadius = 1.1;
      const tubeRadius = 0.28;
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const cx = 1.4 + (ringRadius + tubeRadius * Math.cos(v)) * Math.cos(u);
      const cy = (tubeRadius * Math.sin(v)) * 0.6 + randGaussian() * 0.04;
      const cz = (ringRadius + tubeRadius * Math.cos(v)) * Math.sin(u) * 0.55;

      pos[idx] = cx;
      pos[idx + 1] = cy;
      pos[idx + 2] = cz;
    }
    return pos;
  }

  function generateRing() {
    const pos = new Float32Array(POINT_COUNT * 3);
    const swirlCount = Math.floor(POINT_COUNT * 0.06);

    for (let i = 0; i < POINT_COUNT - swirlCount; i++) {
      const idx = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const r = 3.2 + randGaussian() * 0.22;
      pos[idx] = Math.cos(theta) * r;
      pos[idx + 1] = randGaussian() * 0.15;
      pos[idx + 2] = Math.sin(theta) * r * 0.7;
    }

    // Bright warm swirl near center
    for (let i = POINT_COUNT - swirlCount; i < POINT_COUNT; i++) {
      const idx = i * 3;
      const t = Math.random() * Math.PI * 4;
      const r = (t / (Math.PI * 4)) * 1.5;
      pos[idx] = Math.cos(t) * r + randGaussian() * 0.06;
      pos[idx + 1] = randGaussian() * 0.1;
      pos[idx + 2] = Math.sin(t) * r * 0.7 + randGaussian() * 0.06;
    }
    return pos;
  }

  function generateHelix() {
    const pos = new Float32Array(POINT_COUNT * 3);
    const rungCount = Math.floor(POINT_COUNT * 0.22);
    const baseRingCount = Math.floor(POINT_COUNT * 0.015);
    const strandCount = POINT_COUNT - rungCount - baseRingCount;
    const halfStrand = Math.floor(strandCount / 2);

    // Strand 1
    for (let i = 0; i < halfStrand; i++) {
      const idx = i * 3;
      const t = (i / halfStrand) * Math.PI * 8;
      pos[idx] = Math.cos(t) * 1.1 + randGaussian() * 0.05;
      pos[idx + 1] = (t / (Math.PI * 4)) * 8.0 - 4.0;
      pos[idx + 2] = Math.sin(t) * 1.1 + randGaussian() * 0.05;
    }

    // Strand 2 (phase shifted by pi)
    for (let i = halfStrand; i < strandCount; i++) {
      const idx = i * 3;
      const t = ((i - halfStrand) / halfStrand) * Math.PI * 8;
      pos[idx] = Math.cos(t + Math.PI) * 1.1 + randGaussian() * 0.05;
      pos[idx + 1] = (t / (Math.PI * 4)) * 8.0 - 4.0;
      pos[idx + 2] = Math.sin(t + Math.PI) * 1.1 + randGaussian() * 0.05;
    }

    // Horizontal rungs every 0.35 units connecting strands
    for (let i = strandCount; i < strandCount + rungCount; i++) {
      const idx = i * 3;
      const rungLevel = Math.floor(Math.random() * 22) * 0.35 - 3.8;
      // find t matching y = rungLevel
      const t = ((rungLevel + 4.0) / 8.0) * Math.PI * 4;
      const frac = Math.random(); // lerp between strand 1 and 2
      const x1 = Math.cos(t) * 1.1;
      const z1 = Math.sin(t) * 1.1;
      const x2 = Math.cos(t + Math.PI) * 1.1;
      const z2 = Math.sin(t + Math.PI) * 1.1;
      pos[idx] = THREE.MathUtils.lerp(x1, x2, frac) + randGaussian() * 0.03;
      pos[idx + 1] = rungLevel + randGaussian() * 0.04;
      pos[idx + 2] = THREE.MathUtils.lerp(z1, z2, frac) + randGaussian() * 0.03;
    }

    // Orange elliptical ring at base
    for (let i = strandCount + rungCount; i < POINT_COUNT; i++) {
      const idx = i * 3;
      const angle = Math.random() * Math.PI * 2;
      pos[idx] = Math.cos(angle) * 1.6 + randGaussian() * 0.04;
      pos[idx + 1] = -4.1 + randGaussian() * 0.04;
      pos[idx + 2] = Math.sin(angle) * 1.0 + randGaussian() * 0.04;
    }
    return pos;
  }

  function generateTower() {
    const pos = new Float32Array(POINT_COUNT * 3);
    const floors = 26;
    const floorSpacing = 0.28;
    const pointsPerFloor = Math.floor((POINT_COUNT * 0.6) / floors);
    let cur = 0;

    for (let f = 0; f < floors; f++) {
      const y = (f - floors / 2) * floorSpacing;
      const taper = 1.0 - (f / floors) * 0.35;
      const halfW = 0.7 * taper;

      for (let p = 0; p < pointsPerFloor && cur < POINT_COUNT; p++) {
        const idx = cur * 3;
        // Rectangle perimeter sampling
        const edge = Math.floor(Math.random() * 4);
        const s = Math.random() * 2 - 1;
        if (edge === 0) {
          pos[idx] = halfW * s; pos[idx + 1] = y; pos[idx + 2] = halfW;
        } else if (edge === 1) {
          pos[idx] = halfW * s; pos[idx + 1] = y; pos[idx + 2] = -halfW;
        } else if (edge === 2) {
          pos[idx] = halfW; pos[idx + 1] = y; pos[idx + 2] = halfW * s;
        } else {
          pos[idx] = -halfW; pos[idx + 1] = y; pos[idx + 2] = halfW * s;
        }
        pos[idx] += randGaussian() * 0.02;
        pos[idx + 1] += randGaussian() * 0.02;
        pos[idx + 2] += randGaussian() * 0.02;
        cur++;
      }
    }

    // 4 vertical columns and diagonal bracing for remaining points
    while (cur < POINT_COUNT) {
      const idx = cur * 3;
      const col = Math.floor(Math.random() * 4);
      const y = (Math.random() - 0.5) * (floors * floorSpacing);
      const taper = 1.0 - ((y / (floors * floorSpacing)) + 0.5) * 0.35;
      const halfW = 0.7 * taper;
      const cx = (col === 0 || col === 1) ? halfW : -halfW;
      const cz = (col === 0 || col === 2) ? halfW : -halfW;

      pos[idx] = cx + randGaussian() * 0.02;
      pos[idx + 1] = y;
      pos[idx + 2] = cz + randGaussian() * 0.02;
      cur++;
    }
    return pos;
  }

  function generateNetwork() {
    const pos = new Float32Array(POINT_COUNT * 3);
    const nodeCount = 18;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: rand(-3.5, 3.5),
        y: rand(-2.0, 2.0),
        z: rand(-1.5, 1.5)
      });
    }

    // Connect nodes into pairs (edges)
    const edges = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 3.2) {
          edges.push({ a: nodes[i], b: nodes[j] });
        }
      }
    }

    // 50% points in node spheres
    const pointsInNodes = Math.floor(POINT_COUNT * 0.5);
    const perNode = Math.floor(pointsInNodes / nodeCount);
    let cur = 0;

    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      for (let p = 0; p < perNode && cur < POINT_COUNT; p++) {
        const idx = cur * 3;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 0.35;
        pos[idx] = node.x + r * Math.sin(phi) * Math.cos(theta);
        pos[idx + 1] = node.y + r * Math.sin(phi) * Math.sin(theta);
        pos[idx + 2] = node.z + r * Math.cos(phi);
        cur++;
      }
    }

    // 50% points sampled along connector edges
    while (cur < POINT_COUNT) {
      const idx = cur * 3;
      const edge = edges[Math.floor(Math.random() * edges.length)] || { a: nodes[0], b: nodes[1] };
      const t = Math.random();
      pos[idx] = THREE.MathUtils.lerp(edge.a.x, edge.b.x, t) + randGaussian() * 0.03;
      pos[idx + 1] = THREE.MathUtils.lerp(edge.a.y, edge.b.y, t) + randGaussian() * 0.03;
      pos[idx + 2] = THREE.MathUtils.lerp(edge.a.z, edge.b.z, t) + randGaussian() * 0.03;
      cur++;
    }
    return pos;
  }

  function generateWave() {
    const pos = new Float32Array(POINT_COUNT * 3);
    for (let i = 0; i < POINT_COUNT; i++) {
      const idx = i * 3;
      const x = rand(-10.0, 10.0);
      const y = Math.sin(x * 0.7) * 0.6 + randGaussian() * 0.12;
      const z = randGaussian() * 0.8;
      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;
    }
    return pos;
  }

  // Pre-generate shape library buffers
  const shapes = {
    galaxy: generateGalaxy(),
    ring: generateRing(),
    helix: generateHelix(),
    tower: generateTower(),
    network: generateNetwork(),
    wave: generateWave()
  };

  // -------------------------------------------------------------
  // ATTRIBUTES: SEED, COLOR
  // -------------------------------------------------------------
  const seeds = new Float32Array(POINT_COUNT);
  const colors = new Float32Array(POINT_COUNT * 3);

  for (let i = 0; i < POINT_COUNT; i++) {
    seeds[i] = Math.random();
    const idx = i * 3;
    const r = Math.random();

    let c;
    if (r < 0.80) {
      c = COLOR_WHITE;
    } else if (r < 0.92) {
      c = COLOR_BLUE;
    } else if (r < 0.97) {
      c = COLOR_YELLOW;
    } else {
      c = COLOR_ORANGE;
    }

    colors[idx] = c.r;
    colors[idx + 1] = c.g;
    colors[idx + 2] = c.b;
  }

  // Geometry & Buffers
  const geometry = new THREE.BufferGeometry();
  // `position` buffer is current 'from'
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shapes.galaxy), 3));
  // `aTo` buffer is target 'to'
  geometry.setAttribute('aTo', new THREE.BufferAttribute(new Float32Array(shapes.galaxy), 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  // Shaders
  const vertexShader = `
    uniform float uTime, uMix, uSize, uOpacity, uPixelRatio;
    uniform vec2  uMouse;          // NDC -1..1
    uniform vec2  uResolution;
    attribute vec3 aTo;            // target position buffer (aFrom is \`position\`)
    attribute float aSeed;         // 0..1
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float t = smoothstep(0., 1., clamp(uMix * 1.15 - aSeed * 0.15, 0., 1.)); // per-point stagger
      vec3 pos = mix(position, aTo, t);

      // slow idle drift
      pos.x += sin(uTime * .15 + aSeed * 40.) * .02;
      pos.y += cos(uTime * .12 + aSeed * 31.) * .02;

      vec4 mv = modelViewMatrix * vec4(pos, 1.);
      vec4 clip = projectionMatrix * mv;
      vec2 ndc = clip.xy / clip.w;

      // cursor repel (radius ~0.22 NDC)
      vec2 d = ndc - uMouse;
      float dist = length(d * vec2(uResolution.x / uResolution.y, 1.));
      float push = smoothstep(.22, 0., dist);
      clip.xy += normalize(d + 1e-5) * push * .10 * clip.w;

      gl_Position = clip;
      gl_PointSize = uSize * uPixelRatio * (1. + step(.97, aSeed) * 1.4) * (3. / -mv.z);
      vColor = aColor;
      vAlpha = uOpacity * (.45 + .55 * sin(uTime * 1.2 + aSeed * 60.) * .5 + .275);
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.0, d);
      if (a < 0.01) discard;
      gl_FragColor = vec4(vColor, a * vAlpha);
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uSize: { value: 2.0 },
    uOpacity: { value: 1.0 },
    uPixelRatio: { value: pixelRatio },
    uMouse: { value: new THREE.Vector2(-999, -999) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particlePoints = new THREE.Points(geometry, material);
  particlePoints.rotation.x = -1.05;
  particlePoints.rotation.z = 0.12;
  scene.add(particlePoints);

  // -------------------------------------------------------------
  // SPARK BURST API SYSTEM (Preallocated 600 particles)
  // -------------------------------------------------------------
  const BURST_COUNT = 600;
  const burstGeometry = new THREE.BufferGeometry();
  const burstPositions = new Float32Array(BURST_COUNT * 3);
  const burstVelocities = new Float32Array(BURST_COUNT * 3);
  const burstLifetimes = new Float32Array(BURST_COUNT);
  const burstMaxLifetimes = new Float32Array(BURST_COUNT);

  for (let i = 0; i < BURST_COUNT; i++) {
    burstPositions[i * 3 + 1] = 9999.0; // offscreen
  }

  burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));

  const burstMaterial = new THREE.PointsMaterial({
    color: 0xf28a2e,
    size: 3.5,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const burstPoints = new THREE.Points(burstGeometry, burstMaterial);
  scene.add(burstPoints);

  let burstHead = 0;
  window.addEventListener('particles:burst', (e) => {
    const detail = e.detail || {};
    const from = detail.from || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const to = detail.to || { x: from.x + 100, y: from.y };
    const count = Math.min(detail.count || 120, 200);

    // Convert screen coordinates to NDC & 3D world near z=0
    function toWorld(px, py) {
      const ndcX = (px / window.innerWidth) * 2 - 1;
      const ndcY = -(py / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    }

    const wFrom = toWorld(from.x, from.y);
    const wTo = toWorld(to.x, to.y);

    for (let i = 0; i < count; i++) {
      const idx = (burstHead % BURST_COUNT) * 3;
      const pIdx = burstHead % BURST_COUNT;
      burstHead++;

      const t = Math.random();
      burstPositions[idx] = THREE.MathUtils.lerp(wFrom.x, wTo.x, t);
      burstPositions[idx + 1] = THREE.MathUtils.lerp(wFrom.y, wTo.y, t);
      burstPositions[idx + 2] = THREE.MathUtils.lerp(wFrom.z, wTo.z, t);

      burstVelocities[idx] = (Math.random() - 0.5) * 0.8;
      burstVelocities[idx + 1] = (Math.random() - 0.5) * 0.8;
      burstVelocities[idx + 2] = (Math.random() - 0.5) * 0.8;

      burstLifetimes[pIdx] = 0.9;
      burstMaxLifetimes[pIdx] = 0.9;
    }
    burstGeometry.attributes.position.needsUpdate = true;
  });

  // -------------------------------------------------------------
  // MORPH ORCHESTRATION & SECTION MAPPING
  // -------------------------------------------------------------
  let currentShapeKey = 'galaxy';
  let isMorphing = false;

  window.morphToShape = function (shapeName, targetOpacity) {
    if (!shapes[shapeName] || shapeName === currentShapeKey) {
      if (typeof targetOpacity === 'number') {
        gsap.to(uniforms.uOpacity, { value: targetOpacity, duration: 0.6, ease: 'power2.out' });
      }
      return;
    }

    currentShapeKey = shapeName;
    const targetBuffer = shapes[shapeName];
    const aToAttr = geometry.attributes.aTo;
    aToAttr.copyArray(targetBuffer);
    aToAttr.needsUpdate = true;

    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(uniforms.uMix);
      uniforms.uMix.value = 0;
      isMorphing = true;

      gsap.to(uniforms.uMix, {
        value: 1.0,
        duration: 1.6,
        ease: 'power3.inOut',
        onComplete: function () {
          // Commit target positions to 'position' buffer and reset mix
          const posAttr = geometry.attributes.position;
          posAttr.copyArray(targetBuffer);
          posAttr.needsUpdate = true;
          uniforms.uMix.value = 0;
          isMorphing = false;
        }
      });

      if (typeof targetOpacity === 'number') {
        gsap.to(uniforms.uOpacity, { value: targetOpacity, duration: 0.6, ease: 'power2.out' });
      }
    }
  };

  // Section -> Shape Mapping Observer
  const sectionShapeMap = [
    { selector: '#hero', shape: 'galaxy', opacity: 1.0 },
    { selector: '#deck-section', shape: 'ring', opacity: 0.9 },
    { selector: '#statement-section', shape: 'tower', opacity: 0.28 },
    { selector: '#architecture-section', shape: 'network', opacity: 0.22 },
    { selector: '#pinned-scene-section', shape: 'helix', opacity: 0.30 },
    { selector: '#projects-section', shape: 'network', opacity: 0.20 },
    { selector: '#timeline-section', shape: 'wave', opacity: 0.25 },
    { selector: '#contact-section', shape: 'galaxy', opacity: 0.85 }
  ];

  function setupSectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = sectionShapeMap.find(item => entry.target.matches(item.selector));
          if (match) {
            window.morphToShape(match.shape, match.opacity);
          }
        }
      });
    }, { threshold: 0.35 });

    sectionShapeMap.forEach(item => {
      const el = document.querySelector(item.selector);
      if (el) observer.observe(el);
    });
  }

  // Mouse interaction for cursor repel (NDC -1..1)
  const targetMouse = new THREE.Vector2(-999, -999);
  if (!isMobile) {
    window.addEventListener('pointermove', (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      targetMouse.set(-999, -999);
    });
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP
  // -------------------------------------------------------------
  let lastTime = performance.now();
  let isPageVisible = true;

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  });

  function animate(now) {
    requestAnimationFrame(animate);

    if (!isPageVisible || uniforms.uOpacity.value < 0.05) return;

    const dt = Math.min((now - lastTime) * 0.001, 0.1);
    lastTime = now;

    uniforms.uTime.value += dt;

    // Slow continuous rotation of whole points group
    particlePoints.rotation.y += dt * 0.02;

    // Smooth lerp mouse to pointer in NDC
    if (!isMobile) {
      uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.08;
      uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.08;
    }

    // Update Spark Bursts
    let hasActiveBursts = false;
    for (let i = 0; i < BURST_COUNT; i++) {
      if (burstLifetimes[i] > 0) {
        hasActiveBursts = true;
        burstLifetimes[i] -= dt;
        const idx = i * 3;
        burstPositions[idx] += burstVelocities[idx] * dt;
        burstPositions[idx + 1] += burstVelocities[idx + 1] * dt;
        burstPositions[idx + 2] += burstVelocities[idx + 2] * dt;
      }
    }
    if (hasActiveBursts) {
      burstGeometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    uniforms.uResolution.value.set(w, h);
  });

  // Init section triggers when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSectionObserver);
  } else {
    setupSectionObserver();
  }

})();
