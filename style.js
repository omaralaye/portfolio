// Tailwind Configuration
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    display: ['Space Grotesk', 'sans-serif'],
                    mono: ['JetBrains Mono', 'monospace'],
                }
            }
        }
    };
}

// ==========================================
// Initialize variables
// ==========================================
let canvas;
let ctx;
let width;
let height;
let particles = [];
let mouseX;
let mouseY;
let animationId = null;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================
// Particle System
// ==========================================
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.max(1, Math.random() * 2 + 0.5);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = 160 + Math.random() * 20; // Teal range
    }

    update() {
        // Mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw() {
        if (!ctx) return;
        const safeOpacity = Math.max(0, Math.min(1, this.opacity));
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${safeOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==========================================
// Canvas Setup
// ==========================================
function resizeCanvas() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function initParticles() {
    particles = [];
    const particleCount = Math.min(80, Math.floor((width * height) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    if (!ctx) return;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                const opacity = Math.max(0, Math.min(1, (1 - dist / 120) * 0.15));
                ctx.strokeStyle = `rgba(0, 212, 170, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    if (prefersReducedMotion || !ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw gradient background overlay
    const gradient = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, Math.max(300, width / 3)
    );
    gradient.addColorStop(0, 'rgba(0, 212, 170, 0.03)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    drawConnections();

    animationId = requestAnimationFrame(animate);
}

// ==========================================
// Navigation Scroll Effect
// ==========================================
function initScrollEffects() {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    if (!nav) return;

    window.addEventListener('scroll', () => {
        // Add background on scroll
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Highlight active section in nav
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.toggle('open');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });
    });
}

// ==========================================
// Scroll Reveal Animation
// ==========================================
function initRevealAnimation() {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

// ==========================================
// Initialize Everything
// ==========================================
function init() {
    canvas = document.getElementById('bg-canvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        width = window.innerWidth;
        height = window.innerHeight;
        mouseX = width / 2;
        mouseY = height / 2;

        resizeCanvas();
        initParticles();

        if (!prefersReducedMotion) {
            animate();
        }

        // Mouse Tracking
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Resize Handler
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });
    }

    initScrollEffects();
    initRevealAnimation();
}

document.addEventListener('DOMContentLoaded', init);

// Fallback initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
}
