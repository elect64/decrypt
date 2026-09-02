/* ==========================================================
   DECRYPT ANIMATIONS
   Carries forward the reference site's signature techniques —
   the mix-blend custom cursor, IntersectionObserver reveals,
   and a bespoke canvas illustration — rather than replacing
   them with a generic 3D scene. The construction-site canvas
   becomes THE VAULT: an archive blueprint that fills in as
   small figures move through it.
   ========================================================== */

/* ---------- Custom cursor ---------- */
const DecryptCursor = (() => {
  function init() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reduced) return;

    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0, active = false, raf = null;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!active) { active = true; loop(); }
    });

    function loop() {
      if (!active) return;
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';
      raf = requestAnimationFrame(loop);
    }

    const interactive = 'a, button, [data-cursor], .countdown-unit, .chapter, .node';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(interactive)) cursor.classList.add('expanded'); });
    document.addEventListener('mouseout',  (e) => { if (e.target.closest(interactive)) cursor.classList.remove('expanded'); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { active = false; if (raf) cancelAnimationFrame(raf); }
    });
  }
  return { init };
})();

/* ---------- Scroll reveals ---------- */
const DecryptReveal = (() => {
  function init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }
  return { init };
})();

/* ---------- THE VAULT — canvas scene manager ----------
   Four distinct animations live behind one canvas. Tapping
   or clicking the scene cycles to the next one — pure
   interactive fun, no functional meaning attached. ---------- */
const DecryptVault = (() => {
  const state = {
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    canvas: null, ctx: null, width: 0, height: 0,
    loopDuration: 26000,
    animationId: null,
    theme: 'dark',
    sceneIndex: 0,
    wrap: null, hintEl: null, indicatorEl: null, announceEl: null
  };

  const SCENE_NAMES = ['The Vault', 'The Network', 'The Cipher', 'The Orbit'];

  const stars = [];
  const motes = [];
  const vault = {
    x: 0.24, y: 0.14, w: 0.52, h: 0.58,
    panels: [
      { x: 0.02, y: 0.02, w: 0.96, h: 0.13, fillTime: 3200 },
      { x: 0.02, y: 0.19, w: 0.28, h: 0.32, fillTime: 6400 },
      { x: 0.34, y: 0.19, w: 0.64, h: 0.15, fillTime: 8600 },
      { x: 0.34, y: 0.38, w: 0.64, h: 0.13, fillTime: 10800 },
      { x: 0.02, y: 0.56, w: 0.96, h: 0.13, fillTime: 13600 },
      { x: 0.34, y: 0.56, w: 0.3, h: 0.13, fillTime: 15800 }
    ]
  };

  const figures = [
    { id: 'learner',  baseX: 0.12, baseY: 0.74, targetX: 0.42, phase: 0 },
    { id: 'archivist', baseX: 0.78, baseY: 0.24, phase: 1.6 },
    { id: 'builder',  baseX: 0.28, baseY: 0.8, phase: 4.2 }
  ];

  /* ---- Scene 2: THE NETWORK — a knowledge graph pulsing with traffic ---- */
  const networkNodes = [
    { x: 0.18, y: 0.22 }, { x: 0.5, y: 0.14 }, { x: 0.82, y: 0.24 },
    { x: 0.28, y: 0.5 },  { x: 0.7, y: 0.52 },
    { x: 0.16, y: 0.78 }, { x: 0.48, y: 0.84 }, { x: 0.8, y: 0.76 }
  ];
  const networkEdges = [
    [0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4],
    [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7]
  ];

  /* ---- Scene 3: THE CIPHER — falling glyphs that never stop resolving ---- */
  const cipherColumns = [];
  const CIPHER_GLYPHS = '01DECRYPT#%&';
  function initCipher() {
    cipherColumns.length = 0;
    const n = 18;
    for (let i = 0; i < n; i++) {
      cipherColumns.push({
        x: (i + 0.5) / n,
        y: Math.random() * 1.6 - 0.5,
        speed: Math.random() * 0.15 + 0.07,
        len: Math.floor(Math.random() * 5) + 4,
        seed: Math.random() * 100
      });
    }
  }

  /* ---- Scene 4: THE ORBIT — access points circling a pulsing core ---- */
  const orbitRings = [
    { r: 0.15, count: 3, speed: 0.42 },
    { r: 0.25, count: 5, speed: -0.27 },
    { r: 0.35, count: 7, speed: 0.19 }
  ];

  function palette() {
    return state.theme === 'dark'
      ? { space1: '#0A2E12', space2: '#03130A', star: 'rgba(255,255,255,', nebula: 'rgba(156,240,176,', line: 'rgba(255,255,255,', accent: '#9CF0B0', panel: 'rgba(156,240,176,' }
      : { space1: '#E7EBE2', space2: '#DCE2D6', star: 'rgba(8,19,12,', nebula: 'rgba(14,90,40,', line: 'rgba(8,19,12,', accent: '#0E5A28', panel: 'rgba(14,90,40,' };
  }

  function initStars(n) {
    stars.length = 0;
    for (let i = 0; i < n; i++) stars.push({ x: Math.random(), y: Math.random(), size: Math.random() * 1.4 + 0.3, twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.006 });
  }
  function initMotes(n) {
    motes.length = 0;
    for (let i = 0; i < n; i++) motes.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, size: Math.random() * 1.8 + 0.5, opacity: Math.random() * 0.35 + 0.08 });
  }

  function setTheme(t) { state.theme = t; }

  function init(canvasEl, fallbackEl) {
    if (state.reduced) {
      fallbackEl.classList.add('active');
      canvasEl.classList.add('hidden');
      return;
    }
    canvasEl.classList.remove('hidden');
    state.canvas = canvasEl;
    state.ctx = canvasEl.getContext('2d');
    const isMobile = window.innerWidth < 760;
    initStars(isMobile ? 50 : 110);
    initMotes(isMobile ? 10 : 22);
    resize();
    window.addEventListener('resize', resize);
    initSceneSwitching(canvasEl);
    animate();
  }

  /* ---------- Tap/click cycles to the next scene, purely for fun ---------- */
  function initSceneSwitching(canvasEl) {
    const wrap = canvasEl.closest('.scene-wrap');
    if (!wrap) return;
    state.wrap = wrap;
    state.hintEl = document.getElementById('scene-hint');
    state.indicatorEl = document.getElementById('scene-indicator');
    state.announceEl = document.getElementById('scene-announce');
    wrap.setAttribute('data-switchable', 'true');

    let hintDismissed = localStorage.getItem('decrypt-scene-hint-seen') === '1';
    if (hintDismissed && state.hintEl) state.hintEl.classList.add('faded');

    function fireSwitch() {
      nextScene();
      if (!hintDismissed) {
        hintDismissed = true;
        localStorage.setItem('decrypt-scene-hint-seen', '1');
        if (state.hintEl) state.hintEl.classList.add('faded');
      }
    }

    wrap.addEventListener('click', fireSwitch);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fireSwitch(); }
    });
  }

  function nextScene() {
    state.sceneIndex = (state.sceneIndex + 1) % scenes.length;
    if (window.DecryptSound) DecryptSound.shift();
    if (state.wrap) {
      state.wrap.classList.remove('switching');
      void state.wrap.offsetWidth; // restart the flash animation
      state.wrap.classList.add('switching');
    }
    if (state.indicatorEl) {
      state.indicatorEl.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === state.sceneIndex);
      });
    }
    if (state.announceEl) state.announceEl.textContent = `Now showing: ${SCENE_NAMES[state.sceneIndex]}`;
  }

  function resize() {
    if (!state.canvas) return;
    const wrap = state.canvas.closest('.scene-wrap');
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width; state.height = rect.height;
    state.canvas.width = rect.width * dpr;
    state.canvas.height = rect.height * dpr;
    state.canvas.style.width = rect.width + 'px';
    state.canvas.style.height = rect.height + 'px';
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawSpace(ctx, w, h, t) {
    const p = palette();
    ctx.fillStyle = p.space2;
    ctx.fillRect(0, 0, w, h);
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.85);
    grad.addColorStop(0, p.space1);
    grad.addColorStop(1, p.space2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    stars.forEach(s => {
      const tw = Math.sin(t * s.speed + s.twinkle) * 0.5 + 0.5;
      ctx.fillStyle = p.star + (0.25 + tw * 0.6) + ')';
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = p.nebula + '0.09)';
    ctx.beginPath(); ctx.arc(w * 0.18, h * 0.28, w * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.nebula + '0.06)';
    ctx.beginPath(); ctx.arc(w * 0.82, h * 0.72, w * 0.2, 0, Math.PI * 2); ctx.fill();
  }

  function drawVaultFrame(ctx, w, h, loopT) {
    const p = palette();
    const vx = vault.x * w, vy = vault.y * h, vw = vault.w * w, vh = vault.h * h;

    ctx.strokeStyle = p.line + '0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(vx, vy, vw, vh);

    const c = 12;
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    [[vx, vy, c, 0], [vx + vw, vy, -c, 0], [vx, vy + vh, c, 1], [vx + vw, vy + vh, -c, 1]].forEach(([cx, cy, dx, bottom]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + (bottom ? -c : c));
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx, cy);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // grid
    ctx.strokeStyle = p.line + '0.07)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { const gy = vy + (vh / 4) * i; ctx.beginPath(); ctx.moveTo(vx, gy); ctx.lineTo(vx + vw, gy); ctx.stroke(); }
    for (let i = 1; i < 6; i++) { const gx = vx + (vw / 6) * i; ctx.beginPath(); ctx.moveTo(gx, vy); ctx.lineTo(gx, vy + vh); ctx.stroke(); }

    // panels unlocking
    vault.panels.forEach(panel => {
      const progress = Math.min(1, Math.max(0, (loopT - panel.fillTime) / 1800));
      if (progress <= 0) return;
      const px = vx + panel.x * vw, py = vy + panel.y * vh;
      const pw = panel.w * vw * progress, ph = panel.h * vh;
      ctx.fillStyle = p.panel + (0.12 + progress * 0.22) + ')';
      ctx.fillRect(px, py, pw, ph);
    });

    // center keyhole glyph
    const kx = vx + vw / 2, ky = vy + vh / 2;
    const pulse = Math.sin(loopT * 0.002) * 0.15 + 0.55;
    ctx.strokeStyle = p.accent;
    ctx.globalAlpha = pulse;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(kx, ky - 6, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx, ky + 14); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawFigure(ctx, w, h, fig, t) {
    const p = palette();
    let x = fig.baseX, y = fig.baseY;

    if (fig.id === 'learner') {
      const walk = (Math.sin(t * 0.6 + fig.phase) + 1) / 2;
      x = fig.baseX + (fig.targetX - fig.baseX) * walk;
      y = fig.baseY + Math.sin(t * 3 + fig.phase) * 0.006;
    } else if (fig.id === 'archivist') {
      x = fig.baseX + Math.sin(t * 0.45 + fig.phase) * 0.05;
      y = fig.baseY + Math.cos(t * 0.35 + fig.phase) * 0.035;
    } else if (fig.id === 'builder') {
      x = fig.baseX + Math.sin(t * 0.25 + fig.phase) * 0.01;
      y = fig.baseY;
    }

    const px = x * w, py = y * h;
    ctx.save();
    ctx.translate(px, py);
    ctx.strokeStyle = p.line + '0.55)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // head
    ctx.beginPath(); ctx.arc(0, -22, 6, 0, Math.PI * 2); ctx.stroke();
    // body
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 4); ctx.stroke();
    // legs
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(-7, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(7, 18); ctx.stroke();

    if (fig.id === 'archivist') {
      // floating knowledge panel
      const floatY = Math.sin(t * 1.4 + fig.phase) * 3;
      ctx.strokeStyle = p.line + '0.3)';
      ctx.strokeRect(-34, 10 + floatY, 68, 34);
      ctx.fillStyle = p.accent;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-28, 16 + floatY, 30, 3);
      ctx.fillRect(-28, 24 + floatY, 46, 3);
      ctx.fillRect(-28, 32 + floatY, 20, 3);
      ctx.globalAlpha = 1;
      // arms toward panel
      ctx.strokeStyle = p.line + '0.55)';
      ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-16, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(16, 8); ctx.stroke();
    } else if (fig.id === 'builder') {
      const type = Math.sin(t * 9 + fig.phase) * 2.5;
      ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(-6, 10 + type); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(6, 10 - type); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(-4, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(4, 8); ctx.stroke();
    }
    ctx.restore();
  }

  function drawNetwork(ctx, w, h, t) {
    const p = palette();
    ctx.lineWidth = 1;
    networkEdges.forEach(([a, b]) => {
      const n1 = networkNodes[a], n2 = networkNodes[b];
      ctx.strokeStyle = p.line + '0.12)';
      ctx.beginPath();
      ctx.moveTo(n1.x * w, n1.y * h);
      ctx.lineTo(n2.x * w, n2.y * h);
      ctx.stroke();
    });
    networkEdges.forEach(([a, b], i) => {
      const n1 = networkNodes[a], n2 = networkNodes[b];
      const prog = (t * 0.14 + i * 0.37) % 1;
      const px = n1.x + (n2.x - n1.x) * prog;
      const py = n1.y + (n2.y - n1.y) * prog;
      ctx.fillStyle = p.accent;
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(px * w, py * h, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    networkNodes.forEach((n, i) => {
      const pulse = Math.sin(t * 1.6 + i) * 0.4 + 0.6;
      ctx.strokeStyle = p.accent;
      ctx.globalAlpha = pulse * 0.7 + 0.25;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(n.x * w, n.y * h, 5 + pulse * 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.line + '0.75)';
      ctx.beginPath(); ctx.arc(n.x * w, n.y * h, 2.6, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawCipher(ctx, w, h, t) {
    const p = palette();
    if (!cipherColumns.length) initCipher();
    ctx.textAlign = 'center';
    ctx.font = `${Math.max(10, w * 0.013)}px ui-monospace, monospace`;
    cipherColumns.forEach(c => {
      c.y += c.speed * 0.0026;
      if (c.y > 1.4) { c.y = -0.4; c.seed = Math.random() * 100; }
      for (let j = 0; j < c.len; j++) {
        const yy = c.y - j * 0.045;
        if (yy < 0 || yy > 1) continue;
        const idx = Math.floor(t * 3 + c.seed + j) % CIPHER_GLYPHS.length;
        const ch = CIPHER_GLYPHS[idx];
        const alpha = j === 0 ? 0.95 : Math.max(0, 0.5 - j * 0.09);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = j === 0 ? p.accent : p.line + '1)';
        ctx.fillText(ch, c.x * w, yy * h);
      }
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function drawOrbit(ctx, w, h, t) {
    const p = palette();
    const cx = w * 0.5, cy = h * 0.5;
    const pulse = Math.sin(t * 1.4) * 0.15 + 0.6;
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = pulse;
    ctx.beginPath(); ctx.arc(cx, cy - 5, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + 19); ctx.stroke();
    ctx.globalAlpha = 1;
    orbitRings.forEach((ring, ri) => {
      const rad = ring.r * Math.min(w, h);
      ctx.strokeStyle = p.line + '0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, rad, rad * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < ring.count; i++) {
        const angle = t * ring.speed + (i / ring.count) * Math.PI * 2;
        const px = cx + Math.cos(angle) * rad;
        const py = cy + Math.sin(angle) * rad * 0.55;
        const tw = Math.sin(t * 2 + i + ri) * 0.4 + 0.6;
        ctx.fillStyle = p.accent;
        ctx.globalAlpha = tw;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  const scenes = [
    { draw: (ctx, w, h, t, loopT) => { drawVaultFrame(ctx, w, h, loopT); figures.forEach(f => drawFigure(ctx, w, h, f, t)); } },
    { draw: (ctx, w, h, t) => drawNetwork(ctx, w, h, t) },
    { draw: (ctx, w, h, t) => drawCipher(ctx, w, h, t) },
    { draw: (ctx, w, h, t) => drawOrbit(ctx, w, h, t) }
  ];

  function drawMotes(ctx, w, h) {
    const p = palette();
    motes.forEach(m => {
      m.x += m.vx / w; m.y += m.vy / h;
      if (m.x < 0) m.x = 1; if (m.x > 1) m.x = 0;
      if (m.y < 0) m.y = 1; if (m.y > 1) m.y = 0;
      ctx.fillStyle = p.accent;
      ctx.globalAlpha = m.opacity;
      ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.size, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function animate() {
    if (!state.ctx || state.reduced) return;
    const now = performance.now();
    const loopT = now % state.loopDuration;
    const t = now / 1000;
    const ctx = state.ctx, w = state.width, h = state.height;

    ctx.clearRect(0, 0, w, h);
    drawSpace(ctx, w, h, now);
    scenes[state.sceneIndex].draw(ctx, w, h, t, loopT);
    drawMotes(ctx, w, h);

    state.animationId = requestAnimationFrame(animate);
  }

  function destroy() {
    if (state.animationId) cancelAnimationFrame(state.animationId);
    window.removeEventListener('resize', resize);
  }

  return { init, setTheme, destroy, nextScene };
})();
