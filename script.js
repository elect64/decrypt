const CONFIG = {
    launchDate: "2026-08-24T00:00:00",
    websiteUrl: "https://decrypt.pxxl.click",
    instagram: "https://www.instagram.com/officialdecrypt_?igsh=dGdjZDdlODBmZTl2",
    facebook: "https://www.facebook.com/share/19V4zN4ikG/",
    whatsapp: "https://wa.link/llj78c",
    linkedin: "https://www.linkedin.com/company/decrypt144/",
    email: "teamdecryptinfo@gmail.com"
};

/* ============================================
   STATE
   ============================================ */

const state = {
    isLoading: true,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isTouch: window.matchMedia('(pointer: coarse)').matches,
    launchTime: new Date(CONFIG.launchDate).getTime(),
    countdownInterval: null,
    animationId: null,
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    time: 0,
    loopDuration: 30000, // 30 seconds
    videoReady: false
};

/* ============================================
   DOM REFERENCES
   ============================================ */

const dom = {
    loader: document.getElementById('loader'),
    page: document.getElementById('page'),
    cursor: document.getElementById('cursor'),
    video: document.getElementById('constructionVideo'),
    canvas: document.getElementById('constructionCanvas'),
    fallback: document.getElementById('reducedMotionFallback'),
    countdown: document.getElementById('countdown'),
    countdownGrid: document.getElementById('countdownGrid'),
    liveState: document.getElementById('liveState'),
    liveCta: document.getElementById('liveCta'),
    cdDays: document.getElementById('cdDays'),
    cdHours: document.getElementById('cdHours'),
    cdMinutes: document.getElementById('cdMinutes'),
    cdSeconds: document.getElementById('cdSeconds'),
    footerYear: document.getElementById('footerYear'),
    socialInstagram: document.getElementById('socialInstagram'),
    socialFacebook: document.getElementById('socialFacebook'),
    socialWhatsApp: document.getElementById('socialWhatsApp'),
    socialLinkedIn: document.getElementById('socialLinkedIn'),
    socialEmail: document.getElementById('socialEmail')
};

/* ============================================
   LOADING
   ============================================ */

function initLoader() {
    document.body.classList.add('loading');
    
    setTimeout(() => {
        dom.loader.classList.add('hidden');
        document.body.classList.remove('loading');
        dom.page.classList.add('ready');
        state.isLoading = false;
        initReveals();
    }, 1100);
}

/* ============================================
   CUSTOM CURSOR
   ============================================ */

function initCursor() {
    if (state.isTouch || state.prefersReducedMotion) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isActive = false;
    let rafId = null;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isActive) {
            isActive = true;
            animateCursor();
        }
    });
    
    function animateCursor() {
        if (!isActive) return;
        cursorX += (mouseX - cursorX) * 0.18;
        cursorY += (mouseY - cursorY) * 0.18;
        dom.cursor.style.left = cursorX + 'px';
        dom.cursor.style.top = cursorY + 'px';
        rafId = requestAnimationFrame(animateCursor);
    }
    
    const interactive = 'a, button, [data-cursor], .countdown-unit';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactive)) {
            dom.cursor.classList.add('expanded');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactive)) {
            dom.cursor.classList.remove('expanded');
        }
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isActive = false;
            if (rafId) cancelAnimationFrame(rafId);
        }
    });
}

/* ============================================
   REVEAL ANIMATIONS
   ============================================ */

function initReveals() {
    if (state.prefersReducedMotion) {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ============================================
   COUNTDOWN
   ============================================ */

function updateCountdown() {
    const now = Date.now();
    const diff = state.launchTime - now;
    
    if (diff <= 0) {
        showLiveState();
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    dom.cdDays.textContent = String(days).padStart(2, '0');
    dom.cdHours.textContent = String(hours).padStart(2, '0');
    dom.cdMinutes.textContent = String(minutes).padStart(2, '0');
    dom.cdSeconds.textContent = String(seconds).padStart(2, '0');
}

function showLiveState() {
    dom.countdown.classList.add('hidden');
    dom.liveState.classList.add('active');
    dom.liveState.setAttribute('aria-hidden', 'false');
    if (state.countdownInterval) clearInterval(state.countdownInterval);
}

function initCountdown() {
    updateCountdown();
    state.countdownInterval = setInterval(updateCountdown, 1000);
}

/* ============================================
   SCENE / ANIMATION
   ============================================ */

function initScene() {
    if (state.prefersReducedMotion) {
        dom.fallback.classList.add('active');
        dom.canvas.classList.add('hidden');
        return;
    }
    
    // Try video first
    if (dom.video) {
        dom.video.addEventListener('canplay', () => {
            state.videoReady = true;
            dom.video.classList.add('active');
            dom.canvas.classList.add('hidden');
        });
        dom.video.addEventListener('error', () => {
            startCanvasAnimation();
        });
        // Fallback to canvas if video doesn't load in 2s
        setTimeout(() => {
            if (!state.videoReady) startCanvasAnimation();
        }, 2000);
    } else {
        startCanvasAnimation();
    }
}

function startCanvasAnimation() {
    if (!dom.canvas) return;
    dom.canvas.classList.remove('hidden');
    state.canvas = dom.canvas;
    state.ctx = dom.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animateConstruction();
}

function resizeCanvas() {
    if (!state.canvas) return;
    const wrap = document.getElementById('sceneWrap');
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    state.canvas.width = rect.width * dpr;
    state.canvas.height = rect.height * dpr;
    state.canvas.style.width = rect.width + 'px';
    state.canvas.style.height = rect.height + 'px';
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* ============================================
   CANVAS CONSTRUCTION SCENE
   ============================================ */

// Scene objects
const stars = [];
const particles = [];
const bricks = [];

function initStars(count) {
    stars.length = 0;
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random(),
            size: Math.random() * 1.5 + 0.3,
            twinkle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.005
        });
    }
}

function initParticles(count) {
    particles.length = 0;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.4 + 0.1
        });
    }
}

function initBricks() {
    bricks.length = 0;
    // Bricks that will be placed into the structure
    const brickColors = ['#F2D16B', '#E5C520', '#D4A017', '#C49415'];
    for (let i = 0; i < 18; i++) {
        bricks.push({
            id: i,
            color: brickColors[i % brickColors.length],
            placed: false,
            placeTime: 3000 + i * 1200, // staggered placement
            x: 0, y: 0, w: 0, h: 0,
            targetX: 0, targetY: 0,
            currentX: 0, currentY: 0,
            carrier: null,
            opacity: 0
        });
    }
}

// Character definitions
const characters = [
    {
        id: 'carrier',
        name: 'Carrier',
        bodyColor: '#F2D16B',
        hatColor: '#D4A017',
        x: 0, y: 0,
        phase: 0,
        carrying: null,
        walkOffset: 0,
        baseY: 0.72,
        baseX: 0.12,
        targetX: 0.45,
        state: 'enter', // enter, walk, place, return
        stateTime: 0
    },
    {
        id: 'inspector',
        name: 'Inspector',
        bodyColor: '#F2D16B',
        hatColor: '#D4A017',
        x: 0, y: 0,
        phase: 1.5,
        baseY: 0.22,
        baseX: 0.75,
        floatOffset: 0,
        hasTablet: true,
        state: 'float',
        stateTime: 0
    },
    {
        id: 'climber',
        name: 'Climber',
        bodyColor: '#F2D16B',
        hatColor: '#D4A017',
        x: 0, y: 0,
        phase: 3,
        baseY: 0.35,
        baseX: 0.55,
        hangAngle: 0,
        state: 'hang',
        stateTime: 0
    },
    {
        id: 'struggler',
        name: 'Struggler',
        bodyColor: '#F2D16B',
        hatColor: '#D4A017',
        x: 0, y: 0,
        phase: 4.5,
        baseY: 0.65,
        baseX: 0.82,
        wobble: 0,
        state: 'struggle',
        stateTime: 0
    },
    {
        id: 'operator',
        name: 'Operator',
        bodyColor: '#F2D16B',
        hatColor: '#D4A017',
        x: 0, y: 0,
        phase: 6,
        baseY: 0.78,
        baseX: 0.3,
        typing: 0,
        state: 'type',
        stateTime: 0
    }
];

// Webpage structure
const structure = {
    x: 0.25, y: 0.15,
    w: 0.5, h: 0.55,
    sections: [
        { x: 0.02, y: 0.02, w: 0.96, h: 0.12, filled: false, fillTime: 4000 },
        { x: 0.02, y: 0.18, w: 0.25, h: 0.35, filled: false, fillTime: 7000 },
        { x: 0.32, y: 0.18, w: 0.66, h: 0.16, filled: false, fillTime: 9000 },
        { x: 0.32, y: 0.38, w: 0.66, h: 0.15, filled: false, fillTime: 11000 },
        { x: 0.02, y: 0.58, w: 0.96, h: 0.12, filled: false, fillTime: 14000 },
        { x: 0.32, y: 0.58, w: 0.3, h: 0.12, filled: false, fillTime: 16000 },
    ]
};

function drawStarfield(ctx, w, h, t) {
    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(0, 0, w, h);
    
    // Deep space gradient
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.8);
    grad.addColorStop(0, '#121826');
    grad.addColorStop(1, '#0B0F1A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    // Stars
    stars.forEach(star => {
        const twinkle = Math.sin(t * star.speed + star.twinkle) * 0.5 + 0.5;
        const alpha = 0.3 + twinkle * 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Distant nebula glow
    ctx.fillStyle = 'rgba(2, 40, 4, 0.08)';
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.3, w * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(2, 40, 4, 0.05)';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.7, w * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

function drawStructure(ctx, w, h, loopT) {
    const sx = structure.x * w;
    const sy = structure.y * h;
    const sw = structure.w * w;
    const sh = structure.h * h;
    
    // Outer frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);
    
    // Corner accents
    const cornerSize = 12;
    ctx.strokeStyle = 'rgba(2, 40, 4, 0.6)';
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(sx, sy + cornerSize);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx + cornerSize, sy);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(sx + sw - cornerSize, sy);
    ctx.lineTo(sx + sw, sy);
    ctx.lineTo(sx + sw, sy + cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(sx, sy + sh - cornerSize);
    ctx.lineTo(sx, sy + sh);
    ctx.lineTo(sx + cornerSize, sy + sh);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(sx + sw - cornerSize, sy + sh);
    ctx.lineTo(sx + sw, sy + sh);
    ctx.lineTo(sx + sw, sy + sh - cornerSize);
    ctx.stroke();
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const gy = sy + (sh / 4) * i;
        ctx.beginPath();
        ctx.moveTo(sx, gy);
        ctx.lineTo(sx + sw, gy);
        ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
        const gx = sx + (sw / 6) * i;
        ctx.beginPath();
        ctx.moveTo(gx, sy);
        ctx.lineTo(gx, sy + sh);
        ctx.stroke();
    }
    
    // Filling sections with bricks
    structure.sections.forEach((sec, i) => {
        const progress = Math.min(1, Math.max(0, (loopT - sec.fillTime) / 2000));
        if (progress > 0) {
            const bx = sx + sec.x * sw;
            const by = sy + sec.y * sh;
            const bw = sec.w * sw * progress;
            const bh = sec.h * sh;
            
            ctx.fillStyle = `rgba(242, 209, 107, ${0.15 + progress * 0.25})`;
            ctx.fillRect(bx, by, bw, bh);
            
            // Brick pattern
            const brickH = bh / 3;
            const brickW = bw / 4;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 4; col++) {
                    const offset = row % 2 === 0 ? 0 : brickW / 2;
                    const bxx = bx + col * brickW + offset;
                    const byy = by + row * brickH;
                    if (bxx < bx + bw) {
                        ctx.strokeStyle = `rgba(242, 209, 107, ${0.2 * progress})`;
                        ctx.lineWidth = 0.5;
                        ctx.strokeRect(bxx + 1, byy + 1, brickW - 2, brickH - 2);
                    }
                }
            }
        }
    });
    
    // Floating interface elements
    const floatT = loopT * 0.0005;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Floating panel 1
    const p1x = sx + sw * 1.15 + Math.sin(floatT) * 8;
    const p1y = sy + sh * 0.2 + Math.cos(floatT * 0.7) * 6;
    ctx.strokeRect(p1x, p1y, 50, 35);
    ctx.fillStyle = 'rgba(2, 40, 4, 0.3)';
    ctx.fillRect(p1x + 4, p1y + 4, 42, 8);
    ctx.fillRect(p1x + 4, p1y + 16, 30, 4);
    ctx.fillRect(p1x + 4, p1y + 24, 20, 4);
    
    // Floating panel 2
    const p2x = sx - 70 + Math.cos(floatT * 0.8) * 6;
    const p2y = sy + sh * 0.6 + Math.sin(floatT * 0.6) * 8;
    ctx.strokeRect(p2x, p2y, 45, 55);
    ctx.fillStyle = 'rgba(2, 40, 4, 0.25)';
    ctx.fillRect(p2x + 4, p2y + 4, 37, 6);
    ctx.fillRect(p2x + 4, p2y + 14, 25, 4);
    ctx.fillRect(p2x + 4, p2y + 22, 30, 4);
    ctx.fillRect(p2x + 4, p2y + 30, 20, 4);
    ctx.fillRect(p2x + 4, p2y + 38, 28, 4);
}

function drawCharacter(ctx, w, h, char, loopT) {
    const cx = char.x * w;
    const cy = char.y * h;
    const scale = Math.min(w, h) * 0.0009;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    
    // Body (rounded rectangle)
    ctx.fillStyle = char.bodyColor;
    roundRect(ctx, -25, -30, 50, 55, 12);
    ctx.fill();
    
    // Body highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    roundRect(ctx, -20, -25, 40, 20, 8);
    ctx.fill();
    
    // Hard hat
    ctx.fillStyle = char.hatColor;
    roundRect(ctx, -28, -42, 56, 14, 4);
    ctx.fill();
    ctx.fillRect(-22, -46, 44, 6);
    
    // Goggles
    ctx.fillStyle = '#1A1A1A';
    roundRect(ctx, -20, -18, 40, 14, 4);
    ctx.fill();
    
    // Eyes
    const eyeGlow = Math.sin(loopT * 0.003 + char.phase) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${eyeGlow})`;
    ctx.beginPath();
    ctx.arc(-8, -11, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -11, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-7, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(9, -10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Mouth (small smile)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 2, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Limbs based on character state
    drawLimbs(ctx, char, loopT);
    
    ctx.restore();
}

function drawLimbs(ctx, char, loopT) {
    ctx.strokeStyle = char.bodyColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    const t = loopT * 0.001;
    
    if (char.id === 'carrier') {
        // Walking legs
        const walk = Math.sin(t * 4 + char.phase) * 8;
        ctx.beginPath();
        ctx.moveTo(-12, 22);
        ctx.lineTo(-15 + walk, 45);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12, 22);
        ctx.lineTo(15 - walk, 45);
        ctx.stroke();
        
        // Arms carrying brick
        ctx.beginPath();
        ctx.moveTo(-22, -5);
        ctx.lineTo(-35, 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(22, -5);
        ctx.lineTo(35, 5);
        ctx.stroke();
        
        // Brick in hands
        ctx.fillStyle = '#D4A017';
        roundRect(ctx, -30, 0, 60, 18, 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-28, 2, 56, 14);
        
    } else if (char.id === 'inspector') {
        // Floating legs (dangling)
        const dangle = Math.sin(t * 2 + char.phase) * 3;
        ctx.beginPath();
        ctx.moveTo(-10, 22);
        ctx.lineTo(-12 + dangle, 38);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, 22);
        ctx.lineTo(12 - dangle, 38);
        ctx.stroke();
        
        // Arms holding tablet
        ctx.beginPath();
        ctx.moveTo(-20, -2);
        ctx.lineTo(-5, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -2);
        ctx.lineTo(5, 8);
        ctx.stroke();
        
        // Tablet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        roundRect(ctx, -18, 5, 36, 26, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(2, 40, 4, 0.8)';
        roundRect(ctx, -14, 9, 28, 18, 2);
        ctx.fill();
        // Screen lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-10, 12, 20, 2);
        ctx.fillRect(-10, 17, 14, 2);
        ctx.fillRect(-10, 22, 16, 2);
        
    } else if (char.id === 'climber') {
        // Hanging from structure
        ctx.beginPath();
        ctx.moveTo(-18, -35);
        ctx.lineTo(-22, -55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(18, -35);
        ctx.lineTo(22, -50);
        ctx.stroke();
        
        // Body rotated slightly
        ctx.rotate(0.15);
        
        // Legs kicking
        const kick = Math.sin(t * 5 + char.phase) * 6;
        ctx.beginPath();
        ctx.moveTo(-10, 22);
        ctx.lineTo(-18, 38 + kick);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, 22);
        ctx.lineTo(18, 38 - kick);
        ctx.stroke();
        
        // Hammer arm
        const hammerSwing = Math.sin(t * 6 + char.phase) * 0.4;
        ctx.save();
        ctx.translate(20, 0);
        ctx.rotate(hammerSwing);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(15, -10);
        ctx.stroke();
        // Hammer head
        ctx.fillStyle = '#888';
        ctx.fillRect(12, -16, 10, 8);
        ctx.restore();
        
        // Other arm holding on
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-30, -15);
        ctx.stroke();
        
    } else if (char.id === 'struggler') {
        // Wobbly stance
        const wobble = Math.sin(t * 8 + char.phase) * 3;
        
        // Legs (unsteady)
        ctx.beginPath();
        ctx.moveTo(-12, 22);
        ctx.lineTo(-18 + wobble * 0.5, 42);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12, 22);
        ctx.lineTo(18 - wobble * 0.5, 42);
        ctx.stroke();
        
        // Arms struggling with big brick
        ctx.beginPath();
        ctx.moveTo(-22, -5);
        ctx.lineTo(-30, -20 + wobble);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(22, -5);
        ctx.lineTo(30, -20 + wobble);
        ctx.stroke();
        
        // Oversized brick wobbling above
        ctx.save();
        ctx.translate(0, -35 + wobble);
        ctx.rotate(Math.sin(t * 6 + char.phase) * 0.08);
        ctx.fillStyle = '#C49415';
        roundRect(ctx, -35, -12, 70, 24, 3);
        ctx.fill();
        // Brick texture
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(18, 0);
        ctx.stroke();
        ctx.restore();
        
        // Sweat drops
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(18, -25, 2, 0, Math.PI * 2);
        ctx.fill();
        
    } else if (char.id === 'operator') {
        // Standing legs
        ctx.beginPath();
        ctx.moveTo(-12, 22);
        ctx.lineTo(-14, 42);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12, 22);
        ctx.lineTo(14, 42);
        ctx.stroke();
        
        // Typing arms
        const type = Math.sin(t * 10 + char.phase) * 3;
        ctx.beginPath();
        ctx.moveTo(-20, -2);
        ctx.lineTo(-10, 15 + type);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -2);
        ctx.lineTo(10, 15 - type);
        ctx.stroke();
        
        // Floating interface panel
        const panelFloat = Math.sin(t * 1.5 + char.phase) * 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        roundRect(ctx, -50, 20 + panelFloat, 100, 50, 4);
        ctx.fill();
        ctx.stroke();
        
        // Panel content
        ctx.fillStyle = 'rgba(2, 40, 4, 0.5)';
        ctx.fillRect(-44, 26 + panelFloat, 88, 6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-44, 36 + panelFloat, 30, 3);
        ctx.fillRect(-44, 42 + panelFloat, 50, 3);
        ctx.fillRect(-44, 48 + panelFloat, 20, 3);
        ctx.fillRect(-44, 54 + panelFloat, 40, 3);
        
        // Cursor blink
        if (Math.sin(t * 4) > 0) {
            ctx.fillStyle = 'rgba(242, 209, 107, 0.8)';
            ctx.fillRect(8, 54 + panelFloat, 3, 3);
        }
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawParticles(ctx, w, h) {
    particles.forEach(p => {
        p.x += p.vx / w;
        p.y += p.vy / h;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
        
        ctx.fillStyle = `rgba(242, 209, 107, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateCharacters(loopT) {
    const t = loopT / 1000; // seconds
    const cycle = (loopT % state.loopDuration) / state.loopDuration;
    
    characters.forEach(char => {
        // Reset positions based on cycle phase for seamless loop
        const charCycle = (cycle + char.phase / 10) % 1;
        
        if (char.id === 'carrier') {
            // Walk back and forth
            const walkProgress = (Math.sin(t * 0.8 + char.phase) + 1) / 2;
            char.x = char.baseX + (char.targetX - char.baseX) * walkProgress;
            char.y = char.baseY + Math.sin(t * 3 + char.phase) * 0.01;
            
        } else if (char.id === 'inspector') {
            // Float around
            char.x = char.baseX + Math.sin(t * 0.5 + char.phase) * 0.06;
            char.y = char.baseY + Math.cos(t * 0.4 + char.phase * 0.7) * 0.04;
            
        } else if (char.id === 'climber') {
            // Hang and swing
            char.x = char.baseX + Math.sin(t * 0.6 + char.phase) * 0.02;
            char.y = char.baseY + Math.sin(t * 1.2 + char.phase) * 0.015;
            
        } else if (char.id === 'struggler') {
            // Wobble in place
            char.x = char.baseX + Math.sin(t * 2 + char.phase) * 0.008;
            char.y = char.baseY;
            
        } else if (char.id === 'operator') {
            // Type and look at panel
            char.x = char.baseX + Math.sin(t * 0.3 + char.phase) * 0.01;
            char.y = char.baseY;
        }
    });
}

function animateConstruction() {
    if (!state.ctx || state.prefersReducedMotion) return;
    
    const now = performance.now();
    state.time = now;
    const loopT = now % state.loopDuration;
    
    const ctx = state.ctx;
    const w = state.width;
    const h = state.height;
    
    // Clear
    ctx.clearRect(0, 0, w, h);
    
    // Background
    drawStarfield(ctx, w, h, now);
    
    // Structure
    drawStructure(ctx, w, h, loopT);
    
    // Update and draw characters
    updateCharacters(loopT);
    characters.forEach(char => drawCharacter(ctx, w, h, char, loopT));
    
    // Particles
    drawParticles(ctx, w, h);
    
    // Ambient glow overlay
    const glowPulse = Math.sin(now * 0.001) * 0.02 + 0.03;
    ctx.fillStyle = `rgba(2, 40, 4, ${glowPulse})`;
    ctx.fillRect(0, 0, w, h);
    
    state.animationId = requestAnimationFrame(animateConstruction);
}

/* ============================================
   CONTENT INJECTION
   ============================================ */

function injectContent() {
    // Footer year
    if (dom.footerYear) dom.footerYear.textContent = new Date().getFullYear();
    
    // Live CTA URL
    if (dom.liveCta) {
        const url = CONFIG.websiteUrl;
        if (url && !url.includes('[ADD')) {
            dom.liveCta.href = url;
        } else {
            dom.liveCta.href = '#';
            dom.liveCta.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }
    }
    
    // Social links
    const socialMap = {
        socialInstagram: CONFIG.instagram,
        socialFacebook: CONFIG.facebook,
        socialWhatsApp: CONFIG.whatsapp,
        socialLinkedIn: CONFIG.linkedin,
        socialEmail: CONFIG.email
    };
    
    Object.entries(socialMap).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (url && !url.includes('[ADD')) {
            if (id === 'socialEmail' && !url.startsWith('mailto:')) {
                el.href = 'mailto:' + url;
            } else {
                el.href = url;
            }
            if (id !== 'socialEmail') {
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
            }
        } else {
            el.href = '#';
            el.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }
    });
}

/* ============================================
   INITIALIZATION
   ============================================ */

function init() {
    initStars(120);
    initParticles(25);
    initBricks();
    initLoader();
    initCursor();
    initCountdown();
    initScene();
    injectContent();
    
    // Handle reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        state.prefersReducedMotion = e.matches;
        if (e.matches) {
            if (state.animationId) cancelAnimationFrame(state.animationId);
            dom.canvas.classList.add('hidden');
            dom.video.classList.remove('active');
            dom.fallback.classList.add('active');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
