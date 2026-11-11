// TIMELINE GSAP ANIMATIONS
gsap.registerPlugin(ScrollTrigger);

// Animate timeline nodes
const timelineNodes = document.querySelectorAll('.timeline-node');

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    timelineNodes.forEach((node, index) => {
        gsap.fromTo(node, 
            { 
                opacity: 0, 
                y: 30 
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: node,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Animate timeline line drawing
    const timelineLine = document.querySelector('.timeline-line');
    const timelineSection = document.querySelector('.timeline');

    gsap.fromTo(timelineLine,
        { scaleY: 0 },
        {
            scaleY: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: timelineSection,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 1
            }
        }
    );
} else {
    // Show elements immediately for reduced motion
    timelineNodes.forEach(node => {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
    });
    
    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
        timelineLine.style.transform = 'translateX(-50%) scaleY(1)';
    }
}
