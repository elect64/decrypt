/* ==========================================================
   DECRYPT INTERACTIONS
   ========================================================== */

const DecryptUI = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer;

  function toast(msg) {
    const el = document.getElementById('egg-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    document.querySelectorAll('[data-scroll-to]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(btn.dataset.scrollTo);
        if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        closeMobileNav();
        DecryptSound.click();
      });
    });

    const soundBtn = document.getElementById('sound-toggle');
    const syncSound = () => soundBtn.setAttribute('aria-pressed', String(DecryptSound.isEnabled()));
    syncSound();
    soundBtn.addEventListener('click', () => { DecryptSound.toggle(); syncSound(); DecryptSound.click(); });

    document.getElementById('theme-toggle').addEventListener('click', () => { DecryptTheme.toggle(); DecryptSound.click(); });

    const navToggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    navToggle.addEventListener('click', () => mobileNav.classList.add('open'));
    document.getElementById('close-nav').addEventListener('click', closeMobileNav);
    function closeMobileNav() { mobileNav.classList.remove('open'); }
  }

  /* ---------- Renderers ---------- */
  function renderChapters() {
    const list = document.getElementById('chapter-list');
    if (!list) return;
    list.innerHTML = EDITION_DATA.map(ed => `
      <button class="chapter" data-id="${ed.id}" data-locked="${ed.status === 'locked'}" aria-expanded="false" data-cursor>
        <span class="c-index">${ed.index}</span>
        <span>
          <span class="c-name">${ed.name}</span>
          <span class="c-theme">${ed.theme} — ${ed.format}</span>
        </span>
        <span class="c-date">${ed.date}</span>
        <span class="status-pill" data-status="${ed.status}">${ed.status}</span>
      </button>
    `).join('');
    list.querySelectorAll('.chapter').forEach(el => el.addEventListener('click', () => onChapterOpen(el)));
  }

  function onChapterOpen(el) {
    const ed = EDITION_DATA.find(e => e.id === el.dataset.id);
    if (!ed) return;
    if (ed.status === 'locked') { toast('STILL LOCKED — CHECK BACK LATER'); DecryptSound.click(); return; }
    DecryptSound.reveal();
    if (ed.hasDetail) {
      const detail = document.getElementById('chapter-detail');
      detail.classList.toggle('open');
      el.setAttribute('aria-expanded', String(detail.classList.contains('open')));
      if (detail.classList.contains('open')) detail.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    } else if (ed.id === '2.0') {
      document.getElementById('next-lock').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  }

  function renderSessions() {
    const el = document.getElementById('session-list');
    if (!el) return;
    el.innerHTML = SESSION_DATA.map(s => `
      <div class="session-row">
        <span class="s-day">${s.day}</span>
        <span><span class="s-track">${s.track}</span><span class="s-title">${s.title}</span></span>
      </div>`).join('');
  }

  function renderSpeakers() {
    const el = document.getElementById('speaker-wall');
    if (!el) return;
    el.innerHTML = SPEAKER_DATA.map(s => `
      <div class="speaker-card">
        <span class="sp-role">${s.role}</span>
        <span class="sp-name">${s.name}</span>
        <span class="sp-note">${s.note}</span>
      </div>`).join('');
  }

  function renderMovement() {
    const wrap = document.getElementById('node-grid');
    if (!wrap) return;
    wrap.innerHTML = MOVEMENT_DATA.map((n, i) => `
      <button class="node" data-i="${i}" aria-expanded="false" data-cursor>
        <span class="n-index">0${i + 1}</span>
        <span class="n-title">${n.title}</span>
        <span class="n-detail">${n.detail}</span>
      </button>`).join('');
    wrap.querySelectorAll('.node').forEach(btn => {
      btn.addEventListener('click', () => {
        const isActive = btn.classList.contains('is-active');
        wrap.querySelectorAll('.node').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-expanded', 'false'); });
        if (!isActive) { btn.classList.add('is-active'); btn.setAttribute('aria-expanded', 'true'); DecryptSound.click(); }
      });
    });
  }

  function renderEcosystem() {
    const el = document.getElementById('ecosystem');
    if (!el) return;
    el.innerHTML = ECOSYSTEM_DATA.map(e => `
      <div class="eco-item"><span class="e-title">${e.title}</span><span class="e-desc">${e.desc}</span></div>`).join('');
  }

  function renderKnowledge() {
    const el = document.getElementById('knowledge-grid');
    if (!el) return;
    el.innerHTML = KNOWLEDGE_DATA.map(k => `
      <div class="file-record">
        <span class="f-id">FILE ${k.id}</span>
        <span class="f-cat">${k.category}</span>
        <span class="f-title">${k.title}</span>
        <span class="f-status">${k.status}</span>
      </div>`).join('');
  }

  function renderSocials() {
    const s = DECRYPT_CONFIG.SOCIAL_LINKS;
    const map = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'], ['linkedin', 'LinkedIn'], ['email', 'Email']];
    document.getElementById('footer-social').innerHTML = map.map(([key, label]) => {
      const href = key === 'email' ? `mailto:${s.email}` : s[key];
      const target = key === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a class="social-link" href="${href}"${target} data-cursor>${label}</a>`;
    }).join('');
  }

  /* ---------- Easter eggs (7) ---------- */
  function initEasterEggs() {
    let clickCount = 0, clickTimer;
    document.getElementById('logo-btn').addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => clickCount = 0, 600);
      if (clickCount === 3) { toast('YOU FOUND SOMETHING.'); DecryptSound.egg(); clickCount = 0; }
    });

    let typed = '';
    window.addEventListener('keydown', (e) => {
      if (e.key.length === 1) {
        typed = (typed + e.key).slice(-7).toLowerCase();
        if (typed === 'decrypt') { toast('ACCESS GRANTED.'); DecryptSound.egg(); }
      }
    });

    const konamiSeq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];
    let ki = 0;
    window.addEventListener('keydown', (e) => {
      if (e.key === konamiSeq[ki]) { ki++; if (ki === konamiSeq.length) { toast('THE VAULT REMEMBERS.'); DecryptSound.egg(); ki = 0; } }
      else ki = (e.key === konamiSeq[0]) ? 1 : 0;
    });

    const keyhole = document.getElementById('keyhole-egg');
    if (keyhole) keyhole.addEventListener('click', () => { toast('THE LAST LOCK. THANK YOU FOR LOOKING CLOSELY.'); DecryptSound.egg(); });

    console.log('%cDECRYPT', 'font-size:20px;font-weight:bold;color:#9CF0B0;');
    console.log('%cKnowledge should not stay locked. teamdecryptinfo@gmail.com is open if you build things.', 'color:#9CF0B0;');

    document.querySelectorAll('.chapter[data-locked="true"]').forEach(el => {
      let hold;
      el.addEventListener('mouseenter', () => { hold = setTimeout(() => { toast('SOMETHING STIRS BEHIND THIS LOCK.'); DecryptSound.click(); }, 1400); });
      el.addEventListener('mouseleave', () => clearTimeout(hold));
    });

    let endTriggered = false;
    window.addEventListener('scroll', () => {
      if (endTriggered) return;
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 20) { endTriggered = true; toast("THERE'S ALWAYS MORE TO UNLOCK."); }
    }, { passive: true });
  }

  function wireCTAs() {
    const s = DECRYPT_CONFIG.SOCIAL_LINKS;
    const join = document.getElementById('join-movement');
    const follow = document.getElementById('follow-decrypt');
    if (join) { join.href = `mailto:${s.email}`; }
    if (follow) { follow.href = s.instagram; follow.target = '_blank'; follow.rel = 'noopener noreferrer'; }
  }

  function init() {
    renderChapters();
    renderSessions();
    renderSpeakers();
    renderMovement();
    renderEcosystem();
    renderKnowledge();
    renderSocials();
    wireCTAs();
    initNav();
    initEasterEggs();
    const fy = document.getElementById('footer-year');
    if (fy) fy.textContent = new Date().getFullYear();
  }

  return { init, toast };
})();
