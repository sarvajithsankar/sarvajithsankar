// MAIN.JS - Lenis, GSAP ScrollTrigger, Scroll Progress

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// SCROLL PROGRESS INDICATOR
const scrollProgress = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.height = scrollPercent + '%';
});

// ABOUT SECTION ANIMATIONS
const aboutLeft = document.querySelector('.about-left');
const aboutRight = document.querySelector('.about-right');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    gsap.fromTo(aboutLeft,
        { x: -60, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    gsap.fromTo(aboutRight,
        { x: 60, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    // PROJECTS SECTION ANIMATIONS
    const projectBlocks = document.querySelectorAll('.project-block');

    projectBlocks.forEach((block, index) => {
        const textSide = block.querySelector('.project-text');
        const canvasSide = block.querySelector('.project-3d');
        
        // Determine direction based on index
        const direction = index % 2 === 0 ? -80 : 80;
        
        gsap.fromTo(textSide,
            { x: direction, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: block,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        gsap.fromTo(canvasSide,
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: block,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
} else {
    // Show elements immediately for reduced motion
    aboutLeft.style.opacity = '1';
    aboutLeft.style.transform = 'translateX(0)';
    aboutRight.style.opacity = '1';
    aboutRight.style.transform = 'translateX(0)';
    
    document.querySelectorAll('.project-text').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
    });
    
    document.querySelectorAll('.project-3d').forEach(el => {
        el.style.opacity = '1';
    });
}
