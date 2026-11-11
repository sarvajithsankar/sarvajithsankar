// CONTACT THREE.JS - Torus Ring
const contactCanvas = document.getElementById('contact-canvas');
const contactScene = new THREE.Scene();
const contactCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const contactRenderer = new THREE.WebGLRenderer({ canvas: contactCanvas, alpha: true, antialias: true });
contactRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
contactRenderer.setSize(window.innerWidth, window.innerHeight);

const torusGeometry = new THREE.TorusGeometry(3, 0.02, 8, 80);
const torusMaterial = new THREE.MeshBasicMaterial({
    color: 0x6C63FF,
    transparent: true,
    opacity: 0.15
});
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
contactScene.add(torus);

contactCamera.position.z = 5;

let contactAnimating = true;

const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        contactAnimating = entry.isIntersecting;
    });
}, { threshold: 0.1 });

contactObserver.observe(contactCanvas);

function animateContact() {
    requestAnimationFrame(animateContact);
    
    if (!contactAnimating) return;
    
    torus.rotation.x += 0.001;
    torus.rotation.y += 0.001;
    
    contactRenderer.render(contactScene, contactCamera);
}

animateContact();

window.addEventListener('resize', () => {
    contactCamera.aspect = window.innerWidth / window.innerHeight;
    contactCamera.updateProjectionMatrix();
    contactRenderer.setSize(window.innerWidth, window.innerHeight);
});

// TYPEWRITER EFFECT
const terminalLines = document.querySelectorAll('.terminal-line');
let typewriterStarted = false;

const contactSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !typewriterStarted) {
            typewriterStarted = true;
            startTypewriter();
        }
    });
}, { threshold: 0.5 });

contactSectionObserver.observe(document.querySelector('.contact'));

function startTypewriter() {
    // Line 1: $ whoami
    typeLine(terminalLines[0].querySelector('.terminal-prompt'), '$ whoami', 80, () => {
        // Line 2: lollipop (after 600ms)
        setTimeout(() => {
            typeLine(terminalLines[1].querySelector('.terminal-output'), 'lollipop', 80, () => {
                // Line 3: $ links (after 400ms)
                setTimeout(() => {
                    typeLine(terminalLines[2].querySelector('.terminal-prompt'), '$ links', 80, () => {
                        // Line 4: github link (after 400ms)
                        setTimeout(() => {
                            typeLine(terminalLines[3].querySelector('.terminal-link'), 'github → https://github.com/sarvajithsankar', 80, () => {
                                // Line 5: linkedin link (after 400ms)
                                setTimeout(() => {
                                    typeLine(terminalLines[4].querySelector('.terminal-link'), 'linkedin → https://www.linkedin.com/in/sarvajithsankar/', 80, () => {
                                        // Line 6: cursor (after 600ms)
                                        setTimeout(() => {
                                            terminalLines[5].style.opacity = '1';
                                        }, 600);
                                    });
                                }, 400);
                            });
                        }, 400);
                    });
                }, 400);
            });
        }, 600);
    });
}

function typeLine(element, text, speed, callback) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    
    type();
}

// Hide cursor initially
terminalLines[5].style.opacity = '0';
