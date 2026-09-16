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
    el.innerHTML = SPEAKER_DATA.map(s => {
      const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const photoHtml = s.img
        ? `<img class="sp-photo" src="${s.img}" alt="${s.name}" loading="lazy">`
        : `<div class="sp-photo-placeholder sp-photo">${initials}</div>`;
      return `
        <div class="speaker-card" tabindex="0" role="button" aria-label="${s.name}, ${s.role}">
          <div class="sp-photo-wrap">
            ${photoHtml}
          </div>
          <div class="sp-glass-overlay">
            <span class="sp-role">${s.role}</span>
            <span class="sp-name">${s.name}</span>
            <span class="sp-note">${s.note}</span>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('.speaker-card').forEach(card => {
      const activate = () => {
        const wasActive = card.classList.contains('is-active');
        el.querySelectorAll('.speaker-card').forEach(c => c.classList.remove('is-active'));
        if (!wasActive) { card.classList.add('is-active'); DecryptSound.click(); }
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });
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
    const locked = (k) => k.status === 'Locked' || !k.pdf;

    el.innerHTML = KNOWLEDGE_DATA.map((k, i) => {
      const isLocked = locked(k);
      const floatDur  = (3.4 + i * 0.28).toFixed(2) + 's';
      const floatDel  = (i * 0.19).toFixed(2) + 's';
      return `
        <div class="folder-item" data-locked="${isLocked}" data-pdf="${k.pdf || ''}"
             data-title="${k.title}" tabindex="0" role="button"
             aria-label="Open ${k.title}"
             style="--float-dur:${floatDur}; --float-delay:${floatDel}">
          <div class="folder-3d">
            <div class="f-tab"></div>
            <div class="f-back">
              <div class="f-shine"></div>
              <div class="f-stripe"></div>
            </div>
          </div>
          <div class="folder-label">
            <span class="f-cat">${k.category}</span>
            <span class="f-title">${k.title}</span>
            <span class="f-status-tag">${k.status}</span>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('.folder-item').forEach(item => {
      const open = () => {
        DecryptSound.reveal();
        openPdfModal(item.dataset.title, item.dataset.pdf, item.dataset.locked === 'true');
      };
      item.addEventListener('click', open);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  /* ---------- PDF Modal ---------- */
  function initPdfModal() {
    // Inject modal markup once
    if (document.getElementById('pdf-modal-veil')) return;
    const veil = document.createElement('div');
    veil.id = 'pdf-modal-veil';
    veil.className = 'pdf-modal-veil';
    veil.setAttribute('role', 'dialog');
    veil.setAttribute('aria-modal', 'true');
    veil.setAttribute('aria-labelledby', 'pdf-modal-title');
    veil.innerHTML = `
      <div class="pdf-modal" id="pdf-modal">
        <div class="pdf-modal-head">
          <h3 id="pdf-modal-title">Document</h3>
          <button class="pdf-modal-close" id="pdf-modal-close" aria-label="Close">
            <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>
          </button>
        </div>
        <div class="pdf-modal-body" id="pdf-modal-body"></div>
      </div>`;
    document.body.appendChild(veil);

    const closeModal = () => {
      veil.classList.remove('open');
      document.getElementById('pdf-modal-body').innerHTML = '';
      document.body.style.overflow = '';
    };
    document.getElementById('pdf-modal-close').addEventListener('click', closeModal);
    veil.addEventListener('click', e => { if (e.target === veil) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  function openPdfModal(title, pdfPath, isLocked) {
    const veil  = document.getElementById('pdf-modal-veil');
    const body  = document.getElementById('pdf-modal-body');
    const titleEl = document.getElementById('pdf-modal-title');
    if (!veil) return;

    titleEl.textContent = title;
    document.body.style.overflow = 'hidden';

    if (isLocked || !pdfPath) {
      body.innerHTML = `
        <div class="pdf-locked-state">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="1.4">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>This file is locked — it will be accessible when released for this chapter.</p>
        </div>`;
    } else {
      body.innerHTML = `<iframe src="${pdfPath}#toolbar=0&navpanes=0" title="${title}"></iframe>`;
    }
    veil.classList.add('open');
    document.getElementById('pdf-modal-close').focus();
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
    initPdfModal();
    const fy = document.getElementById('footer-year');
    if (fy) fy.textContent = new Date().getFullYear();
  }

  return { init, toast };
})();

(function () {
  const dialog = document.getElementById('privacy-policy-dialog');
  const openBtn = document.getElementById('privacy-policy-button');
  const closeBtn = document.getElementById('privacy-policy-close');

  openBtn.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', ''); // fallback for old browsers
  });

  closeBtn.addEventListener('click', () => dialog.close());

  // Close when clicking the dark backdrop around the dialog
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    const inside = e.clientY >= r.top && e.clientY <= r.bottom &&
                   e.clientX >= r.left && e.clientX <= r.right;
    if (!inside) dialog.close();
  });
})();