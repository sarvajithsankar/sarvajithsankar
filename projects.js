// PROJECT 1: AI Agent - Node Graph
const project1Canvas = document.getElementById('project-1-canvas');
const project1Scene = new THREE.Scene();
const project1Camera = new THREE.PerspectiveCamera(75, project1Canvas.clientWidth / 320, 0.1, 1000);
const project1Renderer = new THREE.WebGLRenderer({ canvas: project1Canvas, alpha: true, antialias: true });
project1Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
project1Renderer.setSize(project1Canvas.clientWidth, 320);

// Create nodes
const nodes = [];
const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x6C63FF });

for (let i = 0; i < 6; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
    );
    node.userData = { 
        baseScale: 1, 
        phase: Math.random() * Math.PI * 2 
    };
    nodes.push(node);
    project1Scene.add(node);
}

// Create connections
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.6 });
const lineGeometry = new THREE.BufferGeometry();
const linePositions = [];

// Connect each node to 2-3 other nodes
for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.5) {
            linePositions.push(
                nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
                nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
            );
        }
    }
}

lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
project1Scene.add(lines);

project1Camera.position.z = 4;

let project1Animating = true;
let project1RotationSpeed = 0.005;

const project1Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        project1Animating = entry.isIntersecting;
    });
}, { threshold: 0.1 });

project1Observer.observe(project1Canvas);

const project1Block = document.querySelector('.project-1');
project1Block.addEventListener('mouseenter', () => {
    project1RotationSpeed = 0.015;
});
project1Block.addEventListener('mouseleave', () => {
    project1RotationSpeed = 0.005;
});

function animateProject1() {
    requestAnimationFrame(animateProject1);
    
    if (!project1Animating) return;
    
    const time = Date.now() * 0.001;
    
    // Rotate entire scene
    project1Scene.rotation.y += project1RotationSpeed;
    
    // Pulse nodes
    nodes.forEach(node => {
        const scale = node.userData.baseScale + Math.sin(time * 2 + node.userData.phase) * 0.1;
        node.scale.setScalar(scale);
    });
    
    project1Renderer.render(project1Scene, project1Camera);
}

animateProject1();

// PROJECT 2: Backend API - Torus Knot
const project2Canvas = document.getElementById('project-2-canvas');
const project2Scene = new THREE.Scene();
const project2Camera = new THREE.PerspectiveCamera(75, project2Canvas.clientWidth / 320, 0.1, 1000);
const project2Renderer = new THREE.WebGLRenderer({ canvas: project2Canvas, alpha: true, antialias: true });
project2Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
project2Renderer.setSize(project2Canvas.clientWidth, 320);

const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const torusKnotMaterial = new THREE.MeshStandardMaterial({
    color: 0x6C63FF,
    metalness: 0.9,
    roughness: 0.1
});
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
project2Scene.add(torusKnot);

const project2Light = new THREE.PointLight(0xffffff, 1);
project2Light.position.set(5, 5, 5);
project2Scene.add(project2Light);

const project2Ambient = new THREE.AmbientLight(0xffffff, 0.3);
project2Scene.add(project2Ambient);

project2Camera.position.z = 4;

let project2Animating = true;
let project2RotationSpeed = 0.003;

const project2Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        project2Animating = entry.isIntersecting;
    });
}, { threshold: 0.1 });

project2Observer.observe(project2Canvas);

const project2Block = document.querySelector('.project-2');
project2Block.addEventListener('mouseenter', () => {
    project2RotationSpeed = 0.009;
});
project2Block.addEventListener('mouseleave', () => {
    project2RotationSpeed = 0.003;
});

function animateProject2() {
    requestAnimationFrame(animateProject2);
    
    if (!project2Animating) return;
    
    torusKnot.rotation.x += project2RotationSpeed;
    torusKnot.rotation.y += project2RotationSpeed;
    
    project2Renderer.render(project2Scene, project2Camera);
}

animateProject2();

// PROJECT 3: Data Pipeline - Wireframe Icosahedron
const project3Canvas = document.getElementById('project-3-canvas');
const project3Scene = new THREE.Scene();
const project3Camera = new THREE.PerspectiveCamera(75, project3Canvas.clientWidth / 320, 0.1, 1000);
const project3Renderer = new THREE.WebGLRenderer({ canvas: project3Canvas, alpha: true, antialias: true });
project3Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
project3Renderer.setSize(project3Canvas.clientWidth, 320);

const icosahedronGeometry2 = new THREE.IcosahedronGeometry(1.5, 2);
const icosahedronMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x00D4FF,
    wireframe: true
});
const icosahedron2 = new THREE.Mesh(icosahedronGeometry2, icosahedronMaterial2);
project3Scene.add(icosahedron2);

project3Camera.position.z = 4;

let project3Animating = true;
let project3RotationSpeed = 0.002;

const project3Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        project3Animating = entry.isIntersecting;
    });
}, { threshold: 0.1 });

project3Observer.observe(project3Canvas);

const project3Block = document.querySelector('.project-3');
project3Block.addEventListener('mouseenter', () => {
    project3RotationSpeed = 0.006;
});
project3Block.addEventListener('mouseleave', () => {
    project3RotationSpeed = 0.002;
});

function animateProject3() {
    requestAnimationFrame(animateProject3);
    
    if (!project3Animating) return;
    
    icosahedron2.rotation.x += project3RotationSpeed;
    icosahedron2.rotation.y += project3RotationSpeed;
    
    project3Renderer.render(project3Scene, project3Camera);
}

animateProject3();

// Resize handlers for all project canvases
window.addEventListener('resize', () => {
    // Project 1
    project1Camera.aspect = project1Canvas.clientWidth / 320;
    project1Camera.updateProjectionMatrix();
    project1Renderer.setSize(project1Canvas.clientWidth, 320);
    
    // Project 2
    project2Camera.aspect = project2Canvas.clientWidth / 320;
    project2Camera.updateProjectionMatrix();
    project2Renderer.setSize(project2Canvas.clientWidth, 320);
    
    // Project 3
    project3Camera.aspect = project3Canvas.clientWidth / 320;
    project3Camera.updateProjectionMatrix();
    project3Renderer.setSize(project3Canvas.clientWidth, 320);
});
