# Design Notes & Decisions — Cinematic Dark Editorial Redesign

## 1. Stack Detection & Architecture
- **Framework & Runtime**: Modern Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties.
- **Visual & Motion Libraries**: Three.js (r128), Lenis smooth scroll (v1.0.29), GSAP 3 + ScrollTrigger (v3.12.2), Devicons.
- **Build & Deployment**: Vite v7 with SingleFile plugin and GitHub Pages deployment workflow (`deploy.yml`).
- **Workspace Synchronization**: Mirrored all redesigned production assets and modules across active workspace and `sarvajithsankar.github.io`.

## 2. Design Tokens & Palette (Exact Values Enforced)
- **Surfaces**:
  - Page Background: `--bg: #08090d` (strictly enforced, never pure `#000`).
  - Elevated Surfaces: `--bg-raise: #0d1016`.
  - Glass Instrument Panels: `--panel: rgba(17, 20, 26, 0.86)` with `backdrop-filter: blur(8px)`.
  - Solid Wells & Code Insets: `--panel-solid: #11141a`, `--inset: #0a0c10`.
  - Borders: `--line: rgba(255, 255, 255, 0.08)`, `--line-strong: rgba(255, 255, 255, 0.18)`.
- **Typography & Accents**:
  - Cream Primary: `--ink: #f1ebdd`, Secondary: `--ink-2: rgba(241, 235, 221, 0.62)`, Micro-labels: `--ink-3: rgba(241, 235, 221, 0.38)`.
  - Primary Accent: `--orange: #f28a2e`, Soft: `--orange-soft: rgba(242, 138, 46, 0.16)`, Glow: `--orange-glow: rgba(242, 138, 46, 0.35)`.
  - Secondary Accent: `--blue: #8fb4ff` (keywords, supporting emphasis).
  - Status Accents: `--green: #7ee08f` (success / active verified), `--red: #ff6b5e` (blocked / warning).

## 3. Typography Hierarchy
- **Display**: `Anton` (ALL CAPS, line-height: 0.88-0.92, letter-spacing: -0.005em).
- **Accent Italic**: `Instrument Serif` (Italic, sentence case, burnt orange `--orange: #f28a2e`, line-height: 0.95).
- **Body Serif**: `Newsreader` (17-20px, line-height: 1.48, optical size active, high-contrast cream/secondary).
- **Mono / UI Chrome**: `IBM Plex Mono` (10-12px, UPPERCASE, letter-spacing: 0.08-0.14em).

## 4. Atmosphere Stacking Order
1. `--z-canvas: 0`: WebGL Particle Field (`#bg-particle-canvas`).
2. `--z-bokeh: 1`: 8 drifting radial bokeh orbs in margins (orange & ice-blue gradients, 2 with 1px inset ring).
3. `--z-content: 2`: Editorial content sections, grids, and instrument panels.
4. `--z-chrome`: Animated SVG `feTurbulence` grain overlay (180x180 tile, `steps(8)` 800ms jitter).
5. `--z-chrome: 50`: Persistent UI chrome (Hairline progress, CONTENTS button, tick rail, scroll % readout, scene frame counter).
6. `--z-loader: 200`: Initial loading wipe with progress counter (`000% -> 100%`).

## 5. WebGL Particle Field System
- **Points Scale**: 48,000 points on desktop, 24,000 on tablet, 9,000 on mobile with pixel ratio clamping.
- **Custom Shaders**: GLSL vertex shader implementing per-point staggered morphing (`uMix`), NDC cursor repel (radius 0.22 NDC), idle sine drift, and twinkle.
- **Morphing Library**:
  - `galaxy`: Hero tilted disc (85%) + dense warm torus core (15%).
  - `ring`: Concentric ring with spiral arm swirl.
  - `helix`: Dual-strand DNA double helix with horizontal connecting rungs.
  - `tower`: Stacked floor rectangles with perimeter sampling and vertical columns.
  - `network`: 18 cluster nodes connected by sampled edge lines.
  - `wave`: Continuous undulating sine ribbon.
- **Burst API**: Window event listener (`particles:burst`) triggering short-lived sparks along connector paths on packet arrival.

## 6. Spiral / Ring Card Deck
- **Card Anatomy**: 3:4 aspect ratio, rounded corners (`--radius-card: 10px`), rotated vertical Anton label, 5px corner dot, 3D pointer tilt (`rotateX`/`rotateY`), and 180° flip to reveal summary and `GO →` navigation button.
- **Marble Artwork**: 5 distinct color families (Purple/Orange, Olive/Gold, Teal/Crimson, Blue/Red Silk, Brushed Chrome) procedurally synthesized via domain-warped turbulence noise.
- **Choreography**: GSAP ScrollTrigger timeline smoothly interpolating through 4 stages (peek arc -> 360 circle -> smile fan curve -> left translation exit).

## 7. Interactive Instrument Panels & Pinned Scenes
- Cursor-following ambient glow using CSS variables `--mx` and `--my`.
- SVG architecture diagram featuring interactive node states (`idle`, `active`, `ready`, `success`, `failed`), traveling message chip, and spark burst callbacks.
- Pinned scroll-scrubbed scene for TENET-AI prompt security pipeline featuring floating step card, segmented progress bar, and `FRAME 0000 / 0960` telemetry readout.
- Pinned horizontal timeline with 2D canvas wavy particle river (1,400 dots) and self-drawing vertical connectors.

## 8. Progressive Enhancement & Accessibility
- Complete fallback under `@media (prefers-reduced-motion: reduce)`: WebGL disabled in favor of static layered CSS background, card deck renders as a clean accessible grid, loader is bypassed, animations disabled.
- Focus trap implemented in CONTENTS overlay and detail modal, with Esc key support and full keyboard tab navigation.
- All real user content, copy, links (GitHub, LinkedIn, Email), and repositories (TENET-AI, Sentinel-Vault, VIT Smart Assistant, Customer Churn, Maveric Systems) preserved with zero placeholder text.
