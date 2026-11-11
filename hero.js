// HERO THREE.JS SCENE
const heroCanvas = document.getElementById('hero-canvas');
const heroScene = new THREE.Scene();
const heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const heroRenderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
heroRenderer.setSize(window.innerWidth, window.innerHeight);

// Main icosahedron
const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 1);
const icosahedronMaterial = new THREE.MeshStandardMaterial({
    color: 0x6C63FF,
    roughness: 0.2,
    metalness: 0.8
});
const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
heroScene.add(icosahedron);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
heroScene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00D4FF, 2);
pointLight.position.set(5, 5, 5);
heroScene.add(pointLight);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 150;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;     // x
    positions[i + 1] = (Math.random() - 0.5) * 10; // y
    positions[i + 2] = (Math.random() - 0.5) * 20; // z
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0x00D4FF,
    size: 0.03,
    transparent: true,
    opacity: 0.4
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
heroScene.add(particles);

heroCamera.position.z = 5;

// Mouse parallax
let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Animation state
let isHeroAnimating = true;

// Intersection Observer to pause when not in viewport
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        isHeroAnimating = entry.isIntersecting;
    });
}, { threshold: 0.1 });

heroObserver.observe(heroCanvas);

// Animation loop
function animateHero() {
    requestAnimationFrame(animateHero);
    
    if (!isHeroAnimating) return;
    
    // Auto rotate icosahedron
    icosahedron.rotation.y += 0.003;
    
    // Mouse parallax with lerp
    targetRotationX = mouseY * 0.3;
    targetRotationY = mouseX * 0.3;
    
    icosahedron.rotation.x += (targetRotationX - icosahedron.rotation.x) * 0.05;
    icosahedron.rotation.y += (targetRotationY - icosahedron.rotation.y) * 0.05;
    
    // Animate point light orbit
    const time = Date.now() * 0.001;
    pointLight.position.x = Math.sin(time) * 5;
    pointLight.position.z = Math.cos(time) * 5;
    
    // Animate particles drifting upward
    const particlePositions = particles.geometry.attributes.position.array;
    for (let i = 1; i < particlesCount * 3; i += 3) {
        particlePositions[i] += 0.003;
        if (particlePositions[i] > 5) {
            particlePositions[i] = -5;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    heroRenderer.render(heroScene, heroCamera);
}

animateHero();

// Resize handler
window.addEventListener('resize', () => {
    heroCamera.aspect = window.innerWidth / window.innerHeight;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
});
