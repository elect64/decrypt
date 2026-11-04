/* ==========================================================
   DECRYPT 2.0 PARTICIPANT PORTAL — portal.js v4
   Dashboard shell · hash router · Help & Support (emails the
   team inbox via Apps Script) · Notifications · Speakers ·
   Resources · Community · Achievements · Settings.
   Same Apps Script API as v3 (+ one new POST: portal_support).
   ========================================================== */

/* ---------- CONFIG ---------- */
const API = 'https://script.google.com/macros/s/AKfycbxhx5PmRQ3bJdKLyW0Bia-t5b0dNcy---geQJtGNrwOh6l8BylVdVotY9gAaQL8AzydLQ/exec';
const SUPPORT_EMAIL = 'teamdecryptinfo@gmail.com';       // shown as fallback only; the real inbox is set in Portal.gs
const BANNER_IMAGE_URL = 'https://raw.githubusercontent.com/elect64/decrypt/main/assets/70_20261005_151537_0009.png';
const CAMPAIGN_POLL_INTERVAL = 60000;

/* LIVE SESSIONS — { id, title, speaker, description, link, startISO, endISO } */
const DECRYPT_SESSIONS = [
  { id: 's1', title: 'Opening Session', speaker: 'DECRYPT Team',
    description: 'Welcome + keynote.', link: '',
    startISO: '2026-10-30T19:00:00', endISO: '2026-10-31T21:00:00' }
];

/* SPEAKERS — fill in as confirmed. Shown on the Speakers page.
   { name, role, topic, session, bio, photo (image URL), link }  */
const DECRYPT_SPEAKERS = [
   { name: 'Miss Anjolaoluwa Anifowose', role: 'Founder, The Growth Circle', topic: 'Creativity With Character', session: 'Opening Session', bio: '', photo: 'assets/sp-anjolaoluwa.png', link: '' },
   {name: 'Mr Femi Olowo', role: 'Founder, FOB Visuals', topic: 'Professional Creator', session: 'The Creators Responsibility', bio: '', photo: 'assets/sp-femi.png', link: '' },
  {name: 'Mr Daniel Andikan', role: 'Founder, Primforte', topic: 'Brand Designer', session: 'From Good Enough to Remarkable', bio: '', photo: 'assets/sp-daniel.png', link: '' },
  {name: 'Mr Gideon Omonkhuale', role: 'Founder, Dispatch Me & President NACOS Uniport', topic: 'Builder', session: 'The Craft Behind the Content', bio: '', photo: 'assets/sp-gideon.png', link: '' },
  {name: 'Mr Elect Okezie', role: 'Video Editor', topic: 'Video Editing', session: 'Resourceful Not Resource Limited', bio: '', photo: 'assets/sp-elect.png', link: '' },
];

/* Fill in title and url to publish; Audio and Video categories get built-in players. */
const DECRYPT_RESOURCES = [
  { title: 'Decrypt 2.0 Day 1 - Miss Anjiee', category: 'Audio', description: 'Miss Anjolaoluwa Anifowose', url: 'assets/Day 1 - Miss Anjie.m4a' },
  { title: 'Decrypt 2.0 Day 1 - Stream 1', category: 'Audio', description: 'Mr Elect Okezie', url: 'assets/Day 1 - Stream1.ogg' },
    { title: 'Decrypt 2.0 Day 1 - Stream 2', category: 'Audio', description: 'Mr Elect Okezie', url: 'assets/Day 1 - Stream2.ogg' },
  { title: 'Decrypt 2.0 Day 1', category: 'Video', description: 'Full Stream', url: 'assets/Decryptv2_Ms. Anjolaoluwa.mp4' },
  { title: 'Decrypt 2.0 Day 2 - Mr Elect', category: 'Audio', description: 'Mr Elect Okezie', url: 'assets/Day 2 - Mr Elect.mp3' },
  { title: 'Decrypt 2.0 Day 2 - Full Stream', category: 'Audio', description: 'Mr Elect Okezie', url: 'assets/Day 2 - Full Stream.ogg' },
  { title: 'Decrypt 2.0 Day 2', category: 'Video', description: 'Full Stream', url: 'assets/Day 2.mp4' }
  // { title: 'Opening session slides', category: 'Slides', description: 'PDF', url: 'https://…' }
];

/* COMMUNITY — channels participants can join.
   { name, platform, description, url } */
const DECRYPT_COMMUNITY = [
  // { name: 'DECRYPT 2.0 Participants', platform: 'Telegram', description: 'Announcements and discussion.', url: 'https://t.me/…' }
];

const EARLY_ACCESS_CUTOFF = '2026-10-17T00:00:00';

const FAQ = [
  ['I lost my access code', 'Search your inbox for "Registration confirmed" from DECRYPT (check spam/promotions too). If it is not there, send us a message from this page and we will recover it.'],
  ['How does check-in work?', 'Open My Access Pass and show the QR code to the scanner at the door. Saving the pass image to your phone means it works offline.'],
  ['When do I get my certificate?', 'Certificates are issued after DECRYPT 2.0 closes, to participants who attended. When yours is ready it appears under Achievements and you will get a notification.'],
  ['I can\'t find the session link', 'The joining link is published on My Event as soon as the team adds it. If a session is live and there is no link, message us.'],
  ['My registration details are wrong', 'Pick "Correct my details" when you contact support and tell us what needs to change. We will update it for you.']
];

/* ---------- STATE ---------- */
const K = {
  session: 'dcmd_portal_session', theme: 'dcmd_theme', fx: 'dcmd_fx', xp: 'dcmd_xp',
  seen: 'dcmd_seen_unlock', read: 'dcmd_read_notifs', lastCamp: 'dcmd_portal_last_campaign',
  sent: 'dcmd_support_sent'
};
let P = null;              // participant
let EVT = null;            // event info (null = loading, false = failed)
let CAMPS = [];            // campaigns
let _campTimer = null, _sessTimer = null;
let _fxOff = false;
const _mediaReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let _reduce = _mediaReduce;

/* ==========================================================
   UTILITIES
   ========================================================== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => (s === null || s === undefined) ? '' : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2800);
}
function qs(params) { return Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&'); }
function apiFetch(params) {
  return fetch(API + '?' + qs(params)).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
}
/* POST as text/plain so the browser skips the CORS preflight Apps Script can't answer */
function apiPost(body) {
  return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
}
const pill = (text, type) => '<span class="pill ' + (type || '') + '">' + esc(text) + '</span>';
const firstName = p => (p && p.name || '').trim().split(/\s+/)[0] || 'there';
const initials = p => ((p && p.name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('') || '?').toUpperCase();
function fmtDate(iso, opts) {
  try { return new Date(iso).toLocaleString(undefined, opts || { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  catch (e) { return ''; }
}
function fmtShort(iso) { return fmtDate(iso, { month: 'short', day: 'numeric', year: 'numeric' }); }
function timeAgo(iso) {
  const t = new Date(iso).getTime(); if (isNaN(t)) return '';
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return fmtShort(iso);
}

/* access code helpers */
function normalizeCode(v) {
  const s = String(v || '').trim().toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^DEC2\.?O-?([A-Z0-9]+)$/);
  return m ? 'DEC2.O-' + m[1] : s;
}
function codeState(v) {
  if (!v) return '';
  if (/^DEC2\.O-[A-Z0-9]{5}$/.test(v)) return 'valid';
  if (/^DEC2\.?O?-?[A-Z0-9.]{0,12}$/.test(v)) return 'incomplete';
  return 'invalid';
}

/* icons — one place */
const ICON = {
  grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  ticket: '<path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2.5 2.5 0 0 0 0 5v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2.5 2.5 0 0 0 0-5zM14 5v2M14 11v2M14 17v2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2 .8 3.5 2.6 3.5 5.6"/>',
  library: '<path d="M4 4v16M9 4v16M14 6l5 14M14 6l3.5-1.2"/>',
  chat: '<path d="M4 5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3.5V14H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M19 9h1a1 1 0 0 1 1 1v8l-3.5-3H12"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22 12 19l4.5 3-1.5-7.5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12 20 3M16 7l3 3M13 10l2 2"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  bolt: '<path d="M13 2 3 14h7l-1 8 10-12h-7z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l8 5V5L7 10H4a1 1 0 0 0-1 1zM19 9a4 4 0 0 1 0 6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  play: '<path d="m7 4 13 8-13 8z"/>'
};
const ico = (n, cls) => '<svg viewBox="0 0 24 24" class="i' + (cls ? ' ' + cls : '') + '">' + (ICON[n] || '') + '</svg>';

/* modals */
function openModal(id) { const m = $('#' + id); if (!m) return; m.classList.add('visible'); m.setAttribute('aria-hidden', 'false'); }
function closeModal(id) { const m = $('#' + id); if (!m) return; m.classList.remove('visible'); m.setAttribute('aria-hidden', 'true'); }
document.addEventListener('click', e => { if (e.target.classList && e.target.classList.contains('modal')) closeModal(e.target.id); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal('search-modal'); closeModal('pass-overlay'); closeModal('dd-modal'); Shell.closeMenu(); } });

/* ==========================================================
   THEME + MOTION
   ========================================================== */
const Theme = (function () {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function pref() { return ls.get(K.theme) || 'dark'; }           /* 'dark' | 'light' | 'system' */
  function resolved(p) { return p === 'system' ? (mq.matches ? 'dark' : 'light') : p; }
  function apply(p, persist) {
    const t = resolved(p);
    document.documentElement.setAttribute('data-theme', t);
    $('#meta-theme-color').setAttribute('content', t === 'dark' ? '#0B0C0B' : '#F1F2EE');
    if (persist !== false) ls.set(K.theme, p);
  }
  function toggle() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    if (P) Pages.settings();
  }
  function init() {
    apply(pref(), false);
    mq.addEventListener('change', () => { if (pref() === 'system') apply('system', false); });
    $('#theme-toggle').addEventListener('click', toggle);
    $('#gate-theme-toggle').addEventListener('click', toggle);
  }
  return { init, apply, pref };
})();

const Motion = (function () {
  function apply(off, persist) {
    _fxOff = off; _reduce = _mediaReduce || off;
    if (off) document.documentElement.setAttribute('data-fx', 'off'); else document.documentElement.removeAttribute('data-fx');
    if (persist !== false) off ? ls.set(K.fx, 'off') : ls.del(K.fx);
  }
  function init() { apply(ls.get(K.fx) === 'off', false); }
  return { init, apply, isOff: () => _fxOff };
})();

/* ==========================================================
   UNLOCK OVERLAY (short, tasteful)
   ========================================================== */
const Unlock = (function () {
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function run(first, done) {
    const v = $('#unlock-veil'), st = $('#unlock-status'), bar = $('#unlock-bar-fill');
    timers.forEach(clearTimeout); timers = [];
    v.classList.remove('granted'); bar.style.width = '0%';
    v.classList.add('visible'); v.setAttribute('aria-hidden', 'false');
    const finish = () => { v.classList.remove('visible'); v.setAttribute('aria-hidden', 'true'); done(); };
    if (_reduce) { st.textContent = 'ACCESS GRANTED'; later(finish, 300); return; }
    st.textContent = 'VERIFYING';
    later(() => { bar.style.width = first ? '55%' : '70%'; }, 40);
    later(() => { v.classList.add('granted'); st.textContent = 'ACCESS GRANTED'; bar.style.width = '100%'; }, first ? 900 : 450);
    later(finish, first ? 1500 : 900);
  }
  return { run };
})();

/* ==========================================================
   AUTH
   ========================================================== */
const Auth = (function () {
  function init() {
    const saved = sessionStorage.getItem(K.session);
    if (saved) {
      try { P = JSON.parse(saved); Shell.show(); return; }
      catch (e) { sessionStorage.removeItem(K.session); }
    }
    bind();
  }
  function bind() {
    const form = $('#auth-form'), btn = $('#auth-btn'), label = $('#auth-btn-label'), err = $('#auth-error');
    const emailI = $('#auth-email'), codeI = $('#auth-code');
    const setState = s => { codeI.classList.remove('state-valid', 'state-invalid'); if (s === 'valid' || s === 'invalid') codeI.classList.add('state-' + s); };

    codeI.addEventListener('input', () => {
      const pos = codeI.selectionStart; codeI.value = codeI.value.toUpperCase(); codeI.setSelectionRange(pos, pos);
      err.textContent = ''; setState(codeState(normalizeCode(codeI.value)));
    });

    $('#recovery-toggle').addEventListener('click', function () {
      const open = $('#recovery').classList.toggle('open'); this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = emailI.value.trim().toLowerCase(), code = normalizeCode(codeI.value);
      if (!email || !code) { err.textContent = 'Enter both your email and access code.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'That email address doesn\'t look right.'; emailI.focus(); return; }
      btn.disabled = true; label.textContent = 'Verifying…'; err.textContent = '';
      apiFetch({ action: 'portal_auth', email, code }).then(d => {
        btn.disabled = false; label.textContent = 'Unlock access';
        if (d.ok) {
          P = d.participant; sessionStorage.setItem(K.session, JSON.stringify(P));
          const seen = !!ls.get(K.seen); ls.set(K.seen, '1');
          Unlock.run(!seen, Shell.show);
        } else {
          err.textContent = d.error || 'Email and access code do not match.'; setState('invalid');
          form.classList.add('shake'); setTimeout(() => form.classList.remove('shake'), 420);
        }
      }).catch(() => {
        btn.disabled = false; label.textContent = 'Unlock access';
        err.textContent = 'Connection problem — check your internet and try again.';
      });
    });
  }
  function logout() {
    sessionStorage.removeItem(K.session); P = null; EVT = null; CAMPS = [];
    clearInterval(_campTimer); SessionLive.stop();
    closeModal('pass-overlay'); closeModal('dd-modal'); Shell.closeMenu();
    $('#portal-shell').hidden = true; $('#auth-veil').hidden = false;
    $('#auth-email').value = ''; $('#auth-code').value = ''; $('#auth-error').textContent = '';
    history.replaceState(null, '', location.pathname + location.search);
    $('#auth-email').focus();
  }
  return { init, logout, bind };
})();

/* ==========================================================
   SHELL — nav, router, drawer
   ========================================================== */
const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'event', label: 'My Event', icon: 'calendar' },
  { id: 'pass', label: 'My Access Pass', icon: 'ticket' },
  { id: 'speakers', label: 'Speakers', icon: 'users' },
  { id: 'resources', label: 'Resources Hub', icon: 'library' },
  { id: 'community', label: 'Community', icon: 'chat' },
  { id: 'achievements', label: 'Achievements', icon: 'award' }
];
const NAV_SUPPORT = [
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'help', label: 'Help & Support', icon: 'help' },
  { id: 'settings', label: 'Settings', icon: 'cog' }
];
const TITLES = {};
NAV_MAIN.concat(NAV_SUPPORT).forEach(n => TITLES[n.id] = n.label);
let _page = 'dashboard';
let _bound = false;

const Shell = (function () {
  function openSearch() {
    const items = NAV_MAIN.concat(NAV_SUPPORT);
    const results = $('#search-results');
    const input = $('#search-input');
    const render = () => {
      const query = input.value.trim().toLowerCase();
      const matches = items.filter(item => item.label.toLowerCase().includes(query));
      results.innerHTML = matches.length
        ? matches.map(item => '<li><a href="#/' + item.id + '" data-go="' + item.id + '">' + ico(item.icon) + '<span>' + esc(item.label) + '</span><small>Page</small></a></li>').join('')
        : '<li class="palette-empty">No matching pages</li>';
    };
    input.value = '';
    render();
    openModal('search-modal');
    input.focus();
    input.oninput = render;
    input.onkeydown = e => {
      if (e.key === 'Enter') {
        const first = results.querySelector('a');
        if (first) first.click();
      }
    };
  }

  function openMenu() { $('#side').classList.add('open'); $('#scrim').classList.add('show'); }
  function closeMenu() { $('#side').classList.remove('open'); $('#scrim').classList.remove('show'); }

  function go(page, push) {
    if (!TITLES[page]) page = 'dashboard';
    _page = page;
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    $('#top-title').textContent = TITLES[page];
    document.title = TITLES[page] + ' — DECRYPT 2.0';
    if (push !== false && location.hash !== '#/' + page) history.pushState(null, '', '#/' + page);
    closeMenu(); window.scrollTo(0, 0);
    if (page === 'notifications') Pages.notifications();
    if (page === 'help' && !$('#support-form')) Pages.help();
    if (page === 'settings') Pages.settings();
    if (page === 'achievements') { Pages.achievements(); refreshCert(); }
  }
  function fromHash() { return (location.hash.match(/^#\/([a-z]+)/) || [])[1] || 'dashboard'; }

  function bindOnce() {
    if (_bound) return; _bound = true;
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-go]');
      if (t) { e.preventDefault(); closeModal('search-modal'); go(t.dataset.go); return; }
      const n = e.target.closest('.nav-item');
      if (n) { e.preventDefault(); go(n.dataset.page); return; }
      const link = e.target.closest('a[href^="#/"]');
      if (link) {
        e.preventDefault();
        const page = (link.hash.match(/^#\/([a-z]+)/) || [])[1];
        if (page) go(page);
      }
    });
    window.addEventListener('popstate', () => { if (P) go(fromHash(), false); });
    $('#menu-btn').addEventListener('click', openMenu);
    $('#side-close').addEventListener('click', closeMenu);
    $('#scrim').addEventListener('click', closeMenu);
    $('#search-btn').addEventListener('click', openSearch);
    $('#search-btn-m').addEventListener('click', openSearch);
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    });
    $('#portal-logout').addEventListener('click', Auth.logout);
    PassModal.init(); DailyDecrypt.init();
  }

  function show() {
    $('#auth-veil').hidden = true; $('#portal-shell').hidden = false;
    bindOnce();
    $('#me-avatar').textContent = initials(P);
    $('#me-name').textContent = P.name || 'Participant';
    $('#me-track').textContent = P.track || P.code || 'Participant';
    Pages.renderAll();
    loadEvent(); startPolling(); refreshCert();
    go(fromHash(), false);
  }
  return { show, go, closeMenu, openMenu };
})();

/* ==========================================================
   DATA LOADERS
   ========================================================== */
function loadEvent() {
  EVT = null; Pages.dashboard(); Pages.event();
  apiFetch({ action: 'get_event_info' })
    .then(d => { EVT = (!d || d.ok === false) ? false : d; })
    .catch(() => { EVT = false; })
    .then(() => { Pages.dashboard(); Pages.event(); updateBadges(); if (_page === 'notifications') Pages.notifications(); });
}
function refreshCert() {
  if (!P) return;
  apiFetch({ action: 'get_certificate_status', code: P.code }).then(d => {
    if (!d || !d.ok) return;
    if (d.status !== P.certStatus || (d.certUrl || '') !== (P.certUrl || '')) {
      P.certStatus = d.status; P.certUrl = d.certUrl || '';
      sessionStorage.setItem(K.session, JSON.stringify(P));
      Pages.dashboard(); Pages.achievements(); updateBadges();
    }
  }).catch(() => {});
}
function startPolling() {
  clearInterval(_campTimer);
  pollCampaigns(true);
  _campTimer = setInterval(() => { if (!document.hidden) pollCampaigns(); }, CAMPAIGN_POLL_INTERVAL);
}
function pollCampaigns(first) {
  apiFetch({ action: 'get_campaigns' }).then(d => {
    CAMPS = (d && d.campaigns) || [];
    const latest = CAMPS[0];
    if (latest && latest.id) {
      const seen = ls.get(K.lastCamp) || '';
      if (!first && latest.id !== seen) toast('New message from DECRYPT — see Notifications');
      ls.set(K.lastCamp, latest.id);
    }
    updateBadges(); Pages.dashboard(); if (_page === 'notifications') Pages.notifications();
  }).catch(() => {});
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && P) pollCampaigns(); });

/* ==========================================================
   NOTIFICATIONS MODEL — real data only
   ========================================================== */
function readSet() { try { return new Set(JSON.parse(ls.get(K.read) || '[]')); } catch (e) { return new Set(); } }
function saveRead(set) { ls.set(K.read, JSON.stringify(Array.from(set).slice(-300))); }
function buildNotifs() {
  const out = [];
  if (!P) return out;
  if (P.status === 'CHECKED_IN') {
    out.push({ id: 'checkin', icon: 'check', title: 'You\'re checked in', body: 'Your attendance at DECRYPT 2.0 is recorded.', at: P.checkinTime });
  }
  if (P.certStatus === 'Sent' && P.certUrl) {
    out.push({ id: 'cert', icon: 'award', title: 'Your certificate is ready', body: 'Download it from Achievements.', at: null, go: 'achievements' });
  }
  if (EVT && EVT.announcement) {
    out.push({ id: 'ann:' + (EVT.lastUpdated || EVT.announcement.slice(0, 24)), icon: 'megaphone', title: 'Announcement', body: EVT.announcement, at: EVT.lastUpdated || null, go: 'event' });
  }
  CAMPS.slice(0, 15).forEach(c => {
    out.push({ id: 'c:' + c.id, icon: 'mail', title: c.subject || 'Message from DECRYPT', body: 'Sent to your registered email — check your inbox.', at: c.rawDate });
  });
  out.sort((a, b) => (new Date(b.at || 0).getTime()) - (new Date(a.at || 0).getTime()));
  return out;
}
function unreadCount() { const r = readSet(); return buildNotifs().filter(n => !r.has(n.id)).length; }
function updateBadges() {
  const n = unreadCount();
  const b = $('#nav-unread'), d = $('#bell-dot');
  if (b) { b.hidden = !n; b.textContent = n > 9 ? '9+' : n; }
  if (d) d.hidden = !n;
}

/* ==========================================================
   SESSION LIVE
   ========================================================== */
const SessionLive = (function () {
  const list = () => DECRYPT_SESSIONS.filter(s => s && !isNaN(new Date(s.startISO)) && !isNaN(new Date(s.endISO)));
  function compute() {
    const now = Date.now(); let live = null, next = null, last = null;
    list().forEach(s => {
      const st = +new Date(s.startISO), en = +new Date(s.endISO);
      if (now >= st && now <= en) live = s;
      if (st > now && (!next || st < +new Date(next.startISO))) next = s;
      if (en < now && (!last || en > +new Date(last.endISO))) last = s;
    });
    return { live, next, last, total: list().length };
  }
  function status(s) {
    const now = Date.now();
    if (now < +new Date(s.startISO)) return 'upcoming';
    if (now > +new Date(s.endISO)) return 'ended';
    return 'live';
  }
  function html() {
    const st = compute();
    if (!st.total) {
      return '<div class="empty"><span class="li-ico">' + ico('calendar') + '</span><b>No sessions published yet</b><p>The schedule will appear here as soon as the team confirms it.</p></div>';
    }
    if (st.live) {
      const s = st.live;
      return '<div class="session live-card" data-live="1"><div class="session-top"><span class="live-dot"></span><span class="lbl" style="color:var(--accent)">Live now</span></div>' +
        '<div><h4>' + esc(s.title) + '</h4>' + (s.speaker ? '<p class="meta">with ' + esc(s.speaker) + '</p>' : '') + '</div>' +
        (s.description ? '<p class="desc">' + esc(s.description) + '</p>' : '') +
        '<div class="session-actions">' + (s.link ? '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(s.link) + '">Join session ' + ico('arrow') + '</a>' : '<button class="btn btn-primary" data-go="event">Session info ' + ico('arrow') + '</button>') + '</div></div>';
    }
    if (st.next) {
      const n = st.next;
      return '<div class="session live-card"><div class="session-top"><span class="lbl">Next session</span></div>' +
        '<div><h4>' + esc(n.title) + '</h4><p class="meta">' + (n.speaker ? 'with ' + esc(n.speaker) + ' · ' : '') + esc(fmtDate(n.startISO)) + '</p></div>' +
        '<div class="count" aria-label="Countdown"><div><b data-c="dd">00</b><span>Days</span></div><div><b data-c="hh">00</b><span>Hours</span></div><div><b data-c="mm">00</b><span>Min</span></div><div><b data-c="ss">00</b><span>Sec</span></div></div>' +
        '<div class="session-actions"><button class="btn btn-ghost" data-go="event">View schedule</button></div></div>';
    }
    return '<div class="session live-card"><div class="session-top"><span class="lbl">Sessions complete</span></div>' +
      '<div><h4>DECRYPT 2.0 sessions have wrapped.</h4><p class="meta">Last session: ' + esc(st.last ? st.last.title : '') + (st.last ? ' · ' + esc(fmtDate(st.last.endISO)) : '') + '</p></div>' +
      '<p class="desc">Recordings, slides and links will be posted in the Resources Hub. Your certificate lands under Achievements once issued.</p>' +
      '<div class="session-actions"><button class="btn btn-ghost" data-go="resources">Open Resources Hub</button></div></div>';
  }
  function tick() {
    const st = compute();
    const card = $('.live-card');
    if (card) {
      const wasLive = card.dataset.live === '1';
      if (!!st.live !== wasLive) { Pages.dashboard(); return; }
    }
    if (!st.next || st.live) return;
    const diff = +new Date(st.next.startISO) - Date.now();
    if (diff <= 0) { Pages.dashboard(); return; }
    const set = (k, v) => $$('[data-c="' + k + '"]').forEach(el => { el.textContent = (v < 10 ? '0' : '') + v; });
    set('dd', Math.floor(diff / 864e5)); set('hh', Math.floor(diff % 864e5 / 36e5));
    set('mm', Math.floor(diff % 36e5 / 6e4)); set('ss', Math.floor(diff % 6e4 / 1e3));
  }
  function start() { stop(); tick(); _sessTimer = setInterval(() => { if (!document.hidden) tick(); }, 1000); }
  function stop() { if (_sessTimer) { clearInterval(_sessTimer); _sessTimer = null; } }
  return { html, start, stop, status, tick };
})();

/* ==========================================================
   ACCESS PASS (ticket) + modal + PNG export
   ========================================================== */
const qrUrl = (code, size) => 'https://quickchart.io/qr?text=' + encodeURIComponent(code) + '&size=' + (size || 240) + '&margin=1&dark=07220C&light=FFFFFF';

function ticketHtml(p, opts) {
  opts = opts || {};
  const ci = p.status === 'CHECKED_IN';
  const tag = opts.static ? 'div' : 'button';
  return '<' + tag + ' class="ticket' + (opts.big ? ' big' : '') + (opts.static ? ' static' : '') + '"' + (opts.static ? '' : ' type="button" data-open-pass aria-label="Open access pass"') + '>' +
    '<div class="ticket-top"><div class="ticket-brand"><span class="mark">D.</span>DECRYPT <i>2.0</i></div><span class="ticket-type">PARTICIPANT</span></div>' +
    '<div class="ticket-body"><div><div class="ticket-name">' + esc(p.name) + '</div><div class="ticket-code">' + esc(p.code) + '</div>' +
    '<span class="ticket-ok">' + ico('check') + (ci ? 'VERIFIED · CHECKED IN' : 'VERIFIED PARTICIPANT') + '</span></div>' +
    '<div class="ticket-qr"><img src="' + qrUrl(p.code) + '" alt="QR for ' + esc(p.code) + '" width="96" height="96"></div></div>' +
    '<div class="ticket-foot"><span>KNOWLEDGE SHOULD NOT STAY LOCKED.</span>' + (opts.static ? '' : '<span>TAP TO EXPAND</span>') + '</div></' + tag + '>';
}

const PassModal = (function () {
  function open() { if (!P) return; $('#pass-full').innerHTML = ticketHtml(P, { big: true, static: true }); openModal('pass-overlay'); }
  function init() {
    $('#pass-close').addEventListener('click', () => closeModal('pass-overlay'));
    $('#pass-save').addEventListener('click', savePng);
    document.addEventListener('click', e => { if (e.target.closest('[data-open-pass]')) open(); });
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrap(ctx, text, x, y, maxW, lh) {
    const words = String(text).split(' '); let line = '', yy = y;
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = t; });
    ctx.fillText(line, x, yy);
  }
  function savePng() {
    if (!P) return;
    const W = 1000, H = 560, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.fillStyle = '#07220C'; rr(c, 0, 0, W, H, 28); c.fill();
    c.fillStyle = '#FFFFFF'; rr(c, 60, 56, 44, 44, 9); c.fill();
    c.fillStyle = '#07220C'; c.font = '800 24px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('D.', 82, 79);
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#FFFFFF'; c.font = '700 26px system-ui, sans-serif'; c.fillText('DECRYPT', 120, 89);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '400 20px monospace'; c.fillText('2.0', 262, 88);
    c.textAlign = 'right'; c.font = '500 18px monospace'; c.fillText('PARTICIPANT', W - 60, 86); c.textAlign = 'left';
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(60, 130); c.lineTo(W - 60, 130); c.moveTo(60, 480); c.lineTo(W - 60, 480); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#FFFFFF'; c.font = '700 54px system-ui, sans-serif'; wrap(c, P.name, 60, 260, 540, 60);
    c.font = '500 28px monospace'; c.fillStyle = 'rgba(255,255,255,.7)'; c.fillText(P.code, 60, 380);
    c.font = '700 20px monospace'; c.fillStyle = '#7BF0A6'; c.fillText(P.status === 'CHECKED_IN' ? 'VERIFIED · CHECKED IN' : 'VERIFIED PARTICIPANT', 60, 430);
    c.font = '500 16px monospace'; c.fillStyle = 'rgba(255,255,255,.45)'; c.fillText('KNOWLEDGE SHOULD NOT STAY LOCKED.', 60, 522);
    c.fillStyle = '#FFFFFF'; rr(c, W - 330, 170, 270, 270, 16); c.fill();
    const done = () => {
      try { const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'DECRYPT-PASS-' + P.code + '.png'; document.body.appendChild(a); a.click(); a.remove(); toast('Pass saved to your downloads'); }
      catch (e) { toast('This browser blocked the export — screenshot the pass instead.'); }
    };
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { c.imageSmoothingEnabled = false; c.drawImage(img, W - 318, 182, 246, 246); done(); };
    img.onerror = () => { c.fillStyle = '#07220C'; c.font = '700 20px monospace'; c.textAlign = 'center'; c.fillText(P.code, W - 195, 310); c.textAlign = 'left'; done(); };
    img.src = qrUrl(P.code, 480);
  }
  return { init, open, savePng };
})();

function downloadQr() {
  const url = qrUrl(P.code, 600);
  toast('Preparing QR…');
  fetch(url).then(r => r.blob()).then(b => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'DECRYPT-QR-' + P.code + '.png';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }).catch(() => window.open(url, '_blank', 'noopener'));
}
function copyText(text, msg) {
  const done = () => toast(msg || 'Copied');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
  else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
}

/* ==========================================================
   PROGRESS (XP / achievements / journey)
   ========================================================== */
const Progress = (function () {
  const getXP = () => parseInt(ls.get(K.xp) || '0', 10) || 0;
  function dailyWins() {
    let n = 0;
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('dcmd_daily_win_') === 0) n++; } } catch (e) {}
    return n;
  }
  function addXP(n, why) { ls.set(K.xp, String(getXP() + n)); toast('+' + n + ' XP · ' + (why || 'DECRYPT progress')); }
  function defs() {
    const ci = P.status === 'CHECKED_IN';
    let early = false;
    if (P.registeredAt) { const r = +new Date(P.registeredAt), c = +new Date(EARLY_ACCESS_CUTOFF); early = !isNaN(r) && !isNaN(c) && r < c; }
    return [
      { name: 'FIRST UNLOCK', desc: 'Entered the DECRYPT portal', icon: 'key', on: true },
      { name: 'CODE CRACKER', desc: 'Cracked a Daily Decrypt', icon: 'lock', on: dailyWins() > 0 },
      { name: 'KNOWLEDGE SEEKER', desc: 'Checked in at DECRYPT 2.0', icon: 'book', on: ci },
      { name: 'EARLY ACCESS', desc: 'Registered before 17 Oct 2026', icon: 'bolt', on: early },
      { name: 'DECRYPTED', desc: 'Certificate issued', icon: 'award', on: P.certStatus === 'Sent' && !!P.certUrl }
    ];
  }
  function journey() {
    const ci = P.status === 'CHECKED_IN', xp = getXP();
    return [
      { label: 'Entered', note: 'Registered and signed in', done: true },
      { label: 'Attended', note: ci ? 'Checked in' : 'Check in at the event', done: ci },
      { label: 'Learned', note: 'Crack a Daily Decrypt or earn 200 XP', done: xp >= 200 || dailyWins() > 0 },
      { label: 'Created', note: 'Reach 400 XP', done: xp >= 400 },
      { label: 'Decrypted', note: 'Certificate issued', done: P.certStatus === 'Sent' }
    ];
  }
  function journeyHtml() {
    return '<div class="journey">' + journey().map(s =>
      '<div class="j-step' + (s.done ? ' done' : '') + '"><span class="j-dot">' + (s.done ? ico('check') : '') + '</span><div><b>' + s.label + '</b><small>' + esc(s.note) + '</small></div></div>').join('') + '</div>';
  }
  return { getXP, dailyWins, addXP, defs, journey, journeyHtml };
})();

/* ==========================================================
   DAILY DECRYPT — Caesar cipher mini-game (local persistence)
   ========================================================== */
const DailyDecrypt = (function () {
  const BANK = ['UNLOCK','DECRYPT','DESIGN','CREATE','CIPHER','CANVAS','INTENT','SIGNAL','VECTOR','ORIGIN','MOSAIC','PATTERN','PIXELS','BRIDGE','SYNTAX'];
  const MIN = 1, MAX = 9, TIME = 45;
  let st = null, timer = null;
  const pad = n => ('0' + n).slice(-2);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const dayNo = () => { const d = new Date(); return d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(); };
  const winKey = () => 'dcmd_daily_win_' + today();
  const won = () => !!ls.get(winKey());
  const caesar = (w, s) => w.split('').map(ch => String.fromCharCode(((ch.charCodeAt(0) - 65 + s) % 26 + 26) % 26 + 65)).join('');
  const chips = (w, cls) => w.split('').map(c => '<span class="dd-chip ' + (cls || '') + '">' + c + '</span>').join('');

  function compactHtml() {
    const w = won();
    return '<div class="dd-compact"><div><span class="lbl">Daily Decrypt</span><h4 style="margin-top:6px">' + (w ? 'Code cracked today' : 'Crack today\'s code') + '</h4></div>' +
      '<div class="dd-cipher">' + caesar(BANK[dayNo() % BANK.length], 1 + dayNo() % 9).split('').map(c => '<span>' + c + '</span>').join('') + '</div>' +
      '<p>' + (w ? 'Come back tomorrow for a new one.' : 'A shifted word, 45 seconds, and XP for the speed. Progress is stored on this device.') + '</p>' +
      '<div><button class="btn ' + (w ? 'btn-ghost' : 'btn-primary') + ' btn-sm" data-dd-open ' + (w ? 'disabled' : '') + '>' + (w ? 'Cracked ✓' : ico('play') + 'Play') + '</button></div></div>';
  }
  function open() {
    st = { word: BANK[dayNo() % BANK.length], shift: MIN + dayNo() % (MAX - MIN + 1), guess: 3, left: TIME, over: false, tries: 0 };
    buildPlay(); openModal('dd-modal'); startTimer();
  }
  function buildPlay() {
    $('#dd-body').innerHTML =
      '<div class="dd-head"><span class="lbl">Challenge ' + String(dayNo() % 1000).padStart(3, '0') + ' · ' + today() + '</span><h3>Crack the code</h3>' +
      '<p>Every letter was shifted forward in the alphabet. Dial the shift until the decoded word makes sense.</p></div>' +
      '<div class="dd-timer"><span id="dd-fill"></span></div><div class="dd-tl" id="dd-tl">' + TIME + 's</div>' +
      '<div class="dd-row">' + chips(caesar(st.word, st.shift)) + '</div>' +
      '<div class="dd-shift"><button id="dd-minus" aria-label="Decrease shift">‹</button><div><b id="dd-val">' + st.guess + '</b><span class="lbl">Shift</span></div><button id="dd-plus" aria-label="Increase shift">›</button></div>' +
      '<div class="dd-row" id="dd-prev" aria-live="polite"></div>' +
      '<button class="btn btn-primary btn-block" id="dd-crack">Crack the code</button>';
    $('#dd-minus').addEventListener('click', () => setGuess(st.guess - 1));
    $('#dd-plus').addEventListener('click', () => setGuess(st.guess + 1));
    $('#dd-crack').addEventListener('click', crack);
    preview();
  }
  function setGuess(v) { if (!st || st.over) return; if (v < MIN) v = MAX; if (v > MAX) v = MIN; st.guess = v; $('#dd-val').textContent = v; preview(); }
  function preview() { $('#dd-prev').innerHTML = chips(caesar(caesar(st.word, st.shift), -st.guess), 'out'); }
  function crack() {
    if (!st || st.over) return; st.tries++;
    if (st.guess === st.shift) return success();
    const c = $('.dd-card-modal'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    toast(st.guess < st.shift ? 'Not quite — try a bigger shift' : 'Not quite — try a smaller shift');
  }
  function success() {
    st.over = true; stopTimer();
    const xp = 100 + Math.max(0, st.left) * 2;
    ls.set(winKey(), '1'); Progress.addXP(xp, 'Code cracked');
    $('#dd-body').innerHTML = '<div class="dd-result"><h3 class="ok">Code cracked</h3><p>“' + esc(st.word) + '” in ' + (TIME - st.left) + 's · ' + st.tries + ' attempt' + (st.tries === 1 ? '' : 's') + '</p><div class="dd-xp">+' + xp + ' XP</div><p>Progress is stored on this device.</p><button class="btn btn-primary btn-block" id="dd-done">Done</button></div>';
    $('#dd-done').addEventListener('click', () => closeModal('dd-modal'));
    Pages.dashboard(); Pages.achievements();
  }
  function fail() {
    st.over = true; stopTimer();
    $('#dd-body').innerHTML = '<div class="dd-result"><h3>Time\'s up</h3><p>The window closed before the code was decrypted. A fresh one is available any time.</p><button class="btn btn-primary btn-block" id="dd-retry">Try again</button><button class="btn btn-ghost btn-block" id="dd-quit">Close</button></div>';
    $('#dd-retry').addEventListener('click', open); $('#dd-quit').addEventListener('click', () => closeModal('dd-modal'));
  }
  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (document.hidden || !st || st.over) return;
      st.left--; const f = $('#dd-fill'), l = $('#dd-tl');
      if (f) f.style.width = Math.max(0, st.left / TIME * 100) + '%'; if (l) l.textContent = st.left + 's';
      if (st.left <= 0) fail();
    }, 1000);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function init() {
    $('#dd-close').addEventListener('click', () => { stopTimer(); if (st) st.over = true; closeModal('dd-modal'); });
    document.addEventListener('click', e => { if (e.target.closest('[data-dd-open]')) open(); });
  }
  return { init, compactHtml, won };
})();

/* ==========================================================
   PAGES
   ========================================================== */
const Pages = (function () {
  const set = (id, html) => { const el = $('#page-' + id); if (el) el.innerHTML = html; };
  const head = (title, sub, actions) => '<div class="ph"><div><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="ph-actions">' + actions + '</div>' : '') + '</div>';
  const more = (page, text) => '<a class="link" href="#/' + page + '" data-go="' + page + '">' + (text || 'View all') + ' ' + ico('arrow').replace('class="i"', 'class="i" style="width:14px;height:14px"') + '</a>';

  /* ----- Dashboard ----- */
  function dashboard() {
    if (!P) return;
    const ci = P.status === 'CHECKED_IN', cert = P.certStatus === 'Sent' && !!P.certUrl;
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const regDate = P.registeredAt ? fmtShort(P.registeredAt) : '';

    const stats = '<div class="stats">' +
      stat('Registration', 'Confirmed', 'ok', regDate ? 'Registered ' + regDate : 'On file') +
      stat('Check-in', ci ? 'Done' : 'Pending', ci ? 'ok' : 'dim', ci && P.checkinTime ? fmtDate(P.checkinTime) : 'Show your pass at the door') +
      stat('Track', P.track || 'General', '', P.identity || '') +
      stat('Certificate', cert ? 'Ready' : 'Pending', cert ? 'ok' : 'dim', cert ? 'Download in Achievements' : 'Issued after the event') + '</div>';

    const brief = '<section class="panel"><div class="panel-h"><h3>Event brief</h3>' + more('event', 'Full details') + '</div>' + eventRows(true) + '</section>';

    const notifs = buildNotifs().slice(0, 4), rd = readSet();
    const notifBody = notifs.length ? '<div class="list">' + notifs.map(n => notifLi(n, rd)).join('') + '</div>' :
      '<div class="empty"><span class="li-ico">' + ico('bell') + '</span><b>Nothing new</b><p>Announcements and messages from the team will show up here.</p></div>';

    set('dashboard',
      '<div class="ph"><div class="greet"><h2>' + greet + ', ' + esc(firstName(P)) + '<span>.</span></h2></div>' +
      '<div class="ph-actions"><button class="btn btn-primary" data-open-pass>' + ico('ticket') + 'Open access pass</button></div></div>' +
      stats +
      '<div class="grid g-dash">' +
        '<div class="stack">' +
          '<section class="panel"><div class="panel-h"><h3>Sessions</h3>' + more('event', 'Schedule') + '</div>' + SessionLive.html() + '</section>' +
          brief +
          '<div class="grid g-2">' +
            '<section class="panel"><div class="panel-h"><h3>Recent notifications</h3>' + more('notifications') + '</div>' + notifBody + '</section>' +
            '<section class="panel"><div class="panel-h"><h3>Daily Decrypt</h3><span class="xp">' + Progress.getXP().toLocaleString() + ' XP</span></div>' + DailyDecrypt.compactHtml() + '</section>' +
          '</div>' +
        '</div>' +
        '<div class="stack">' +
          '<div class="ticket-wrap-bg">' + ticketHtml(P) + '</div>' +
          '<section class="panel"><div class="panel-h"><h3>Your journey</h3>' + more('achievements', 'Achievements') + '</div>' + Progress.journeyHtml() + '</section>' +
          '<section class="panel"><div class="panel-h"><h3>Need a hand?</h3></div><div class="panel-b"><p style="color:var(--text-2);font-size:.88rem;margin-bottom:14px">Locked out, wrong details, or can\'t find a link? Message the team — it lands directly in our inbox.</p><button class="btn btn-ghost btn-block" data-go="help">' + ico('mail') + 'Contact support</button></div></section>' +
        '</div>' +
      '</div>');
    SessionLive.start();
  }
  function stat(label, value, cls, cap) {
    return '<div class="stat"><span class="lbl">' + label + '</span><div><div class="stat-v ' + (cls || '') + '">' + esc(value) + '</div><div class="stat-c">' + esc(cap || '') + '</div></div></div>';
  }
  function notifLi(n, rd) {
    const unread = !rd.has(n.id);
    return '<div class="li' + (unread ? ' unread' : '') + '" data-nid="' + esc(n.id) + '"' + (n.go ? ' data-go="' + n.go + '"' : '') + '><span class="li-ico">' + ico(n.icon) + '</span><div><b>' + esc(n.title) + '</b><p>' + esc(n.body) + '</p></div><time>' + (n.at ? esc(timeAgo(n.at)) : '') + '</time></div>';
  }

  /* ----- Event rows (shared) ----- */
  function eventRows(compact) {
    if (EVT === null) return '<div class="panel-b"><div class="skel" style="height:110px"></div></div>';
    if (EVT === false) return '<div class="empty"><span class="li-ico">' + ico('calendar') + '</span><b>Couldn\'t load event details</b><p>Check your connection and refresh. If it keeps happening, contact support.</p></div>';
    let h = '';
    if (EVT.announcement) h += '<div class="announce">' + ico('megaphone') + '<p>' + esc(EVT.announcement) + '</p></div>';
    h += '<div class="rows">';
    if (EVT.doorsOpen) h += '<div class="row"><span class="k">Doors open</span><span class="v">' + esc(EVT.doorsOpen) + '</span></div>';
    if (EVT.joiningLink) h += '<div class="row"><span class="k">Joining link</span><span class="v"><a href="' + esc(EVT.joiningLink) + '" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">Join the conference room →</a></span></div>';
    if (EVT.schedule) h += '<div class="row"><span class="k">Schedule</span><span class="v pre">' + esc(compact ? (EVT.schedule.length > 220 ? EVT.schedule.slice(0, 220).trim() + '…' : EVT.schedule) : EVT.schedule) + '</span></div>';
    h += '</div>';
    if (!EVT.announcement && !EVT.doorsOpen && !EVT.joiningLink && !EVT.schedule)
      return '<div class="empty"><span class="li-ico">' + ico('calendar') + '</span><b>Details coming soon</b><p>Doors, schedule and the joining link will appear here as soon as the team publishes them.</p></div>';
    return h;
  }

  /* ----- My Event ----- */
  function event() {
    if (!P) return;
    const sess = DECRYPT_SESSIONS.slice().sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
    const sessBody = sess.length ? '<div class="list">' + sess.map(s => {
      const st = SessionLive.status(s);
      return '<div class="li"><span class="li-ico">' + ico('calendar') + '</span><div><b>' + esc(s.title) + '</b><p>' + (s.speaker ? esc(s.speaker) + ' · ' : '') + esc(fmtDate(s.startISO)) + '</p>' + (s.description ? '<p>' + esc(s.description) + '</p>' : '') + '</div>' +
        '<div style="display:grid;gap:8px;justify-items:end">' + pill(st === 'live' ? 'Live' : st === 'upcoming' ? 'Upcoming' : 'Ended', st === 'live' ? 'ok' : st === 'upcoming' ? 'warn' : '') +
        (s.link ? '<a class="btn btn-ghost btn-sm" href="' + esc(s.link) + '" target="_blank" rel="noopener">Join</a>' : '') + '</div></div>';
    }).join('') + '</div>' : '<div class="empty"><span class="li-ico">' + ico('calendar') + '</span><b>No sessions published yet</b><p>Sessions will be listed here as they are confirmed.</p></div>';

    set('event',
      head('My Event', 'DECRYPT 2.0 — October 2026. Everything you need to take part.') +
      '<div class="grid g-dash"><div class="stack">' +
        '<section class="panel"><div class="panel-h"><h3>Details</h3>' + (EVT && EVT.lastUpdated ? '<span class="lbl">Updated ' + esc(fmtShort(EVT.lastUpdated)) + '</span>' : '') + '</div>' + eventRows(false) + '</section>' +
        '<section class="panel"><div class="panel-h"><h3>Sessions</h3></div>' + sessBody + '</section>' +
      '</div><div class="stack">' +
        '<section class="panel"><div class="panel-h"><h3>Right now</h3></div>' + SessionLive.html() + '</section>' +
        '<div class="ticket-wrap-bg">' + ticketHtml(P) + '</div>' +
      '</div></div>');
    SessionLive.start();
  }

  /* ----- My Access Pass ----- */
  function pass() {
    if (!P) return;
    const ci = P.status === 'CHECKED_IN';
    const fields = [
      ['Full name', P.name], ['Email', P.email], ['Phone', P.phone || '—'], ['Location', P.location || '—'],
      ['I am mainly a', P.identity || '—'], ['Track', P.track || '—'], ['Volunteering', P.volunteer || 'No'],
      ['Heard via', P.source || '—'], ['Registered', P.registeredAt ? fmtShort(P.registeredAt) : '—'],
      ['Check-in', ci ? 'Checked in' + (P.checkinTime ? ' · ' + fmtDate(P.checkinTime) : '') : 'Not yet arrived']
    ];
    set('pass',
      head('My Access Pass', 'Your identity for DECRYPT 2.0. Show the QR code at check-in.',
        '<button class="btn btn-ghost" id="p-copy">' + ico('copy') + 'Copy code</button><button class="btn btn-primary" id="p-save">' + ico('download') + 'Save pass image</button>') +
      '<div class="pass-grid"><div class="stack">' +
        '<div class="ticket-wrap-bg">' + ticketHtml(P, { big: true, static: true }) + '</div>' +
        '<section class="panel"><div class="panel-h"><h3>At the door</h3></div><ol class="steps">' +
          '<li><span><b>Open this page</b> or the saved pass image on your phone.</span></li>' +
          '<li><span><b>Raise screen brightness</b> so the scanner reads the QR quickly.</span></li>' +
          '<li><span><b>Present the QR</b>. If it fails, give the team your access code and email.</span></li></ol>' +
          '<div class="btn-row"><button class="btn btn-ghost btn-sm" id="p-qr">' + ico('download') + 'Download QR only</button></div></section>' +
      '</div>' +
      '<section class="panel"><div class="panel-h"><h3>Registration on file</h3><button class="btn btn-quiet btn-sm" data-go="help">Request a correction</button></div><div class="rows">' +
        fields.map(f => '<div class="row"><span class="k">' + f[0] + '</span><span class="v">' + esc(f[1]) + '</span></div>').join('') +
        '<div class="row"><span class="k">Access code</span><span class="v mono" style="color:var(--accent)">' + esc(P.code) + '</span></div>' +
      '</div></section></div>');
    $('#p-copy').addEventListener('click', () => copyText(P.code, 'Access code copied'));
    $('#p-save').addEventListener('click', PassModal.savePng);
    $('#p-qr').addEventListener('click', downloadQr);
  }

  /* ----- Speakers ----- */
  function speakers() {
    const body = DECRYPT_SPEAKERS.length ? '<div class="cards">' + DECRYPT_SPEAKERS.map(s => {
      const tag = s.link ? 'a' : 'div';
      return '<' + tag + ' class="card"' + (s.link ? ' href="' + esc(s.link) + '" target="_blank" rel="noopener"' : '') + '><div class="card-img">' +
        (s.photo ? '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" loading="lazy">' : esc((s.name || '?').split(' ').map(w => w[0]).slice(0, 2).join(''))) + '</div>' +
        '<div class="card-b">' + (s.topic ? '<span class="lbl">' + esc(s.topic) + '</span>' : '') + '<h4>' + esc(s.name) + '</h4><span class="role">' + esc(s.role || '') + '</span>' +
        (s.session ? '<p>Session: ' + esc(s.session) + '</p>' : '') + (s.bio ? '<p>' + esc(s.bio) + '</p>' : '') + '</div></' + tag + '>';
    }).join('') + '</div>' :
      '<section class="panel"><div class="empty"><span class="li-ico">' + ico('users') + '</span><b>Speakers will be announced here</b><p>Profiles, topics and session times appear as soon as each speaker is confirmed.</p></div></section>';
    set('speakers', head('Speakers', 'The people behind the sessions.') + body);
  }

  /* ----- Resources ----- */
  let _resFilter = 'All';
  function resources() {
    const available = DECRYPT_RESOURCES.filter(r => r.title && r.title.trim() && r.url && r.url.trim());
    const cats = ['All'].concat(Array.from(new Set(available.map(r => r.category).filter(Boolean))));
    const items = available.filter(r => _resFilter === 'All' || r.category === _resFilter);
    let body;
    if (!available.length) {
      body = '<section class="panel"><div class="empty"><span class="li-ico">' + ico('library') + '</span><b>Nothing here yet</b><p>Slides, recordings and tools from the sessions will be posted here for participants.</p></div></section>';
    } else {
      body = (cats.length > 2 ? '<div class="filters">' + cats.map(c => '<button class="chip' + (c === _resFilter ? ' on' : '') + '" data-rf="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>' : '') +
        '<section class="panel">' + items.map(r => {
          const category = (r.category || '').toLowerCase();
          if (category === 'audio' || category === 'video') {
            const player = category === 'audio'
              ? '<audio controls preload="none" src="' + esc(r.url) + '">Your browser does not support audio playback.</audio>'
              : '<video controls preload="metadata" playsinline><source src="' + esc(r.url) + '">Your browser does not support video playback.</video>';
            return '<div class="res res-media"><span class="li-ico">' + ico(category === 'audio' ? 'play' : 'file') + '</span><div><b>' + esc(r.title) + '</b>' +
              (r.description ? '<small>' + esc(r.description) + '</small>' : '') + player + '</div><span class="type">' + esc(r.category) + '</span></div>';
          }
          return '<a class="res" href="' + esc(r.url) + '" target="_blank" rel="noopener"><span class="li-ico">' + ico(r.category === 'Reading' ? 'book' : r.category === 'Tool' ? 'link' : 'file') + '</span><div><b>' + esc(r.title) + '</b><small>' + esc(r.description || '') + '</small></div><span class="type">' + esc(r.category || '') + '</span></a>';
        }).join('') + '</section>';
    }
    set('resources', head('Resources Hub', 'Slides, recordings and tools from DECRYPT 2.0.') + body);
    $$('[data-rf]').forEach(b => b.addEventListener('click', () => { _resFilter = b.dataset.rf; resources(); }));
  }

  /* ----- Community ----- */
  function community() {
    const body = DECRYPT_COMMUNITY.length ? '<div class="cards">' + DECRYPT_COMMUNITY.map(c =>
      '<a class="card" href="' + esc(c.url) + '" target="_blank" rel="noopener"><div class="card-b" style="padding:20px"><span class="lbl">' + esc(c.platform || 'Channel') + '</span><h4>' + esc(c.name) + '</h4><p>' + esc(c.description || '') + '</p><span class="go">Join ' + ico('arrow').replace('class="i"', 'class="i" style="width:14px;height:14px"') + '</span></div></a>').join('') + '</div>' :
      '<section class="panel"><div class="empty"><span class="li-ico">' + ico('chat') + '</span><b>Community channels open soon</b><p>When the team opens a participants\' group, the invite link will be here. Until then, announcements arrive in Notifications and by email.</p><button class="btn btn-ghost btn-sm" data-go="notifications">Go to Notifications</button></div></section>';
    set('community', head('Community', 'Meet the other people unlocking knowledge with you.') + body);
  }

  /* ----- Achievements ----- */
  function achievements() {
    if (!P) return;
    const d = Progress.defs(), on = d.filter(a => a.on).length, xp = Progress.getXP();
    const cert = P.certStatus === 'Sent' && P.certUrl;
    const certBody = cert ?
      '<div class="cert"><div><span class="lbl">DECRYPT 2.0 Certificate</span><h4 style="margin-top:6px">' + esc(P.name) + '</h4><p>Awarded for participation in DECRYPT 2.0. It is a PDF — save it or share it as you like.</p></div><a class="btn btn-primary" href="' + esc(P.certUrl) + '" target="_blank" rel="noopener" download>' + ico('download') + 'Download</a></div>' :
      '<div class="cert"><div><span class="lbl">DECRYPT 2.0 Certificate</span><h4 style="margin-top:6px">Not issued yet</h4><p>' + (P.checkinTime ? 'You\'re eligible. Your certificate is being prepared and will appear here once issued.' : 'Certificates go to participants who attend DECRYPT 2.0. Check back after the event.') + '</p></div>' + pill(P.checkinTime ? 'Preparing' : 'Pending', P.checkinTime ? 'warn' : '') + '</div>';
    set('achievements',
      head('Achievements', 'Milestones, XP and your certificate.') +
      '<div class="grid g-dash"><div class="stack">' +
        '<section class="panel"><div class="panel-h"><h3>Certificate</h3></div>' + certBody + '</section>' +
        '<section class="panel"><div class="panel-h"><h3>Badges</h3><span class="xp">' + on + ' / ' + d.length + '</span></div><div class="ach-grid">' +
          d.map(a => '<div class="ach' + (a.on ? ' on' : '') + '"><span class="li-ico">' + ico(a.icon) + '</span><div><b>' + a.name + '</b><small>' + a.desc + '</small></div></div>').join('') + '</div></section>' +
      '</div><div class="stack">' +
        '<section class="panel"><div class="panel-h"><h3>Experience</h3></div><div class="panel-b"><div class="xp-hero"><b>' + xp.toLocaleString() + '</b><span class="lbl">XP · this device</span></div><div class="bar"><span style="width:' + Math.min(100, xp / 400 * 100) + '%"></span></div><p style="color:var(--text-3);font-size:.78rem;margin-top:10px">XP is earned from Daily Decrypt and is stored on this device only.</p></div></section>' +
        '<section class="panel"><div class="panel-h"><h3>Journey</h3></div>' + Progress.journeyHtml() + '</section>' +
        '<section class="panel"><div class="panel-h"><h3>Daily Decrypt</h3></div>' + DailyDecrypt.compactHtml() + '</section>' +
      '</div></div>');
  }

  /* ----- Notifications ----- */
  function notifications() {
    if (!P) return;
    const list = buildNotifs(), rd = readSet(), n = list.filter(x => !rd.has(x.id)).length;
    set('notifications',
      head('Notifications', n ? n + ' unread' : 'You\'re all caught up.', n ? '<button class="btn btn-ghost" id="n-read">' + ico('check') + 'Mark all read</button>' : '') +
      '<section class="panel">' + (list.length ? '<div class="list">' + list.map(x => notifLi(x, rd)).join('') + '</div>' :
        '<div class="empty"><span class="li-ico">' + ico('bell') + '</span><b>No notifications yet</b><p>Announcements, check-in confirmation, certificate updates and email campaigns from DECRYPT will be listed here.</p></div>') + '</section>');
    const b = $('#n-read');
    if (b) b.addEventListener('click', () => { const s = readSet(); buildNotifs().forEach(x => s.add(x.id)); saveRead(s); updateBadges(); notifications(); dashboard(); });
    updateBadges();
  }
  document.addEventListener('click', e => {
    const li = e.target.closest('.li[data-nid]');
    if (!li) return;
    const s = readSet(); s.add(li.dataset.nid); saveRead(s); updateBadges();
    li.classList.remove('unread');
  });

  /* ----- Help & Support ----- */
  const CATS = ['Access code or sign-in', 'Check-in or QR code', 'Certificate', 'Event link or schedule', 'Correct my details', 'Something else'];
  let _sending = false;
  function sentLog() { try { return JSON.parse(ls.get(K.sent) || '[]'); } catch (e) { return []; } }
  function help() {
    if (!P) return;
    const log = sentLog();
    set('help',
      head('Help & Support', 'Message the DECRYPT team. It goes straight to our inbox and we reply to your registered email.') +
      '<div class="help-grid"><div class="stack">' +
        '<section class="panel" id="support-panel"><div class="panel-h"><h3>Send a message</h3><span class="lbl">Goes to the team inbox</span></div><div class="panel-b" id="support-body">' + supportForm() + '</div></section>' +
      '</div><div class="stack">' +
        '<section class="panel faq"><div class="panel-h"><h3>Quick answers</h3></div>' + FAQ.map(f => '<details><summary>' + esc(f[0]) + ico('plus') + '</summary><p>' + esc(f[1]) + '</p></details>').join('') + '</section>' +
        (log.length ? '<section class="panel"><div class="panel-h"><h3>Sent from this device</h3></div><ul class="hist">' + log.slice(0, 5).map(l => '<li><div><b style="font-weight:600">' + esc(l.subject) + '</b></div><span>' + esc(l.ref) + '</span></li>').join('') + '</ul></section>' : '') +
      '</div></div>');
    bindSupport();
  }
  function supportForm() {
    return '<div class="sender"><span class="avatar">' + esc(initials(P)) + '</span><div><small>Sending as</small><b>' + esc(P.name) + ' · ' + esc(P.email) + '</b></div></div>' +
      '<form id="support-form" novalidate>' +
        '<div class="form-2"><div class="field"><label for="s-cat">Topic</label><select id="s-cat">' + CATS.map(c => '<option>' + c + '</option>').join('') + '</select></div>' +
        '<div class="field"><label for="s-sub">Subject</label><input id="s-sub" maxlength="120" placeholder="Short summary"></div></div>' +
        '<div class="field"><label for="s-msg">Message</label><textarea id="s-msg" maxlength="2000" placeholder="Tell us what happened and what you need."></textarea><div class="hint"><span id="s-err" style="color:var(--bad)"></span><span id="s-count">0 / 2000</span></div></div>' +
        '<button class="btn btn-primary" type="submit" id="s-btn">' + ico('mail') + '<span id="s-label">Send message</span></button>' +
      '</form>';
  }
  function bindSupport() {
    const form = $('#support-form'); if (!form) return;
    const msg = $('#s-msg'), cnt = $('#s-count'), err = $('#s-err'), btn = $('#s-btn'), lab = $('#s-label');
    msg.addEventListener('input', () => { cnt.textContent = msg.value.length + ' / 2000'; err.textContent = ''; });
    form.addEventListener('submit', e => {
      e.preventDefault(); if (_sending) return;
      const subject = $('#s-sub').value.trim(), message = msg.value.trim(), category = $('#s-cat').value;
      if (subject.length < 3) { err.textContent = 'Add a short subject.'; $('#s-sub').focus(); return; }
      if (message.length < 10) { err.textContent = 'Tell us a little more (at least 10 characters).'; msg.focus(); return; }
      _sending = true; btn.disabled = true; lab.textContent = 'Sending…'; err.textContent = '';
      apiPost({ action: 'portal_support', email: P.email, code: P.code, category, subject, message })
        .then(d => {
          if (d && d.ok) { logSent(d.ref, subject); sentState(d.ref, subject); }
          else throw new Error((d && d.error) || 'Could not send');
        })
        .catch(e => {
          err.innerHTML = esc(e.message === 'Failed to fetch' ? 'Connection problem.' : e.message) + ' You can also email <a href="mailto:' + SUPPORT_EMAIL + '" style="color:var(--accent)">' + SUPPORT_EMAIL + '</a>.';
          btn.disabled = false; lab.textContent = 'Send message';
        })
        .then(() => { _sending = false; });
    });
  }
  function logSent(ref, subject) { const l = sentLog(); l.unshift({ ref, subject, at: new Date().toISOString() }); ls.set(K.sent, JSON.stringify(l.slice(0, 10))); }
  function sentState(ref, subject) {
    $('#support-body').innerHTML = '<div class="sent-ok"><span class="tick">' + ico('check') + '</span><h3>Message sent</h3><p>The team has it. We\'ll reply to <b>' + esc(P.email) + '</b>. A copy of your message is on its way to that inbox too.</p><span class="ref">' + esc(ref) + '</span><button class="btn btn-ghost btn-sm" id="s-again">Send another</button></div>';
    $('#s-again').addEventListener('click', () => { $('#support-body').innerHTML = supportForm(); bindSupport(); });
    refreshHist();
  }
  function refreshHist() { /* update the history panel without wiping the success state */
    const side = $('#page-help .help-grid > .stack:last-child'); if (!side) return;
    const old = $('.hist', side); if (old) old.closest('.panel').remove();
    side.insertAdjacentHTML('beforeend', '<section class="panel"><div class="panel-h"><h3>Sent from this device</h3></div><ul class="hist">' + sentLog().slice(0, 5).map(l => '<li><div><b style="font-weight:600">' + esc(l.subject) + '</b></div><span>' + esc(l.ref) + '</span></li>').join('') + '</ul></section>');
  }

  /* ----- Settings ----- */
  function settings() {
    if (!P) return;
    const pref = Theme.pref();
    set('settings',
      head('Settings', 'Appearance, motion and your data on this device.') +
      '<div class="grid g-2" style="align-items:start"><div class="stack">' +
        '<section class="panel"><div class="panel-h"><h3>Appearance</h3></div>' +
          '<div class="set-row"><div><b>Theme</b><small>Dark is the default.</small></div><div class="seg" id="seg-theme">' + ['dark', 'light', 'system'].map(t => '<button class="' + (pref === t ? 'on' : '') + '" data-theme-set="' + t + '">' + t[0].toUpperCase() + t.slice(1) + '</button>').join('') + '</div></div>' +
          '<div class="set-row"><div><b>Reduce motion</b><small>Turns off page and countdown animations.</small></div><button class="switch" id="sw-motion" role="switch" aria-checked="' + (_fxOff ? 'true' : 'false') + '" aria-label="Reduce motion"></button></div>' +
        '</section>' +
        '<section class="panel"><div class="panel-h"><h3>This device</h3></div>' +
          '<div class="set-row"><div><b>Reset local progress</b><small>Clears XP and Daily Decrypt wins stored in this browser.</small></div><button class="btn btn-ghost btn-sm" id="btn-reset">Reset</button></div>' +
          '<div class="set-row"><div><b>Sign out</b><small>You\'ll need your email and access code to return.</small></div><button class="btn btn-ghost btn-sm" id="btn-signout">Sign out</button></div>' +
        '</section>' +
      '</div><section class="panel"><div class="panel-h"><h3>Account</h3><button class="btn btn-quiet btn-sm" data-go="help">Request change</button></div><div class="rows">' +
        [['Name', P.name], ['Email', P.email], ['Phone', P.phone || '—'], ['Location', P.location || '—'], ['Track', P.track || '—']].map(f => '<div class="row"><span class="k">' + f[0] + '</span><span class="v">' + esc(f[1]) + '</span></div>').join('') +
        '<div class="row"><span class="k">Access code</span><span class="v mono" style="color:var(--accent)">' + esc(P.code) + '</span></div></div></section></div>');
    $$('[data-theme-set]').forEach(b => b.addEventListener('click', () => { Theme.apply(b.dataset.themeSet); settings(); }));
    $('#sw-motion').addEventListener('click', () => { Motion.apply(!_fxOff); settings(); toast(_fxOff ? 'Motion reduced' : 'Motion on'); });
    $('#btn-signout').addEventListener('click', Auth.logout);
    $('#btn-reset').addEventListener('click', () => {
      if (!confirm('Clear XP and Daily Decrypt progress on this device?')) return;
      ls.del(K.xp);
      try { Object.keys(localStorage).filter(k => k.indexOf('dcmd_daily_win_') === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {}
      toast('Local progress cleared'); dashboard(); achievements();
    });
  }

  function renderAll() {
    dashboard(); event(); pass(); speakers(); resources(); community(); achievements(); notifications(); help(); settings(); updateBadges();
  }
  return { renderAll, dashboard, event, pass, speakers, resources, community, achievements, notifications, help, settings };
})();

/* QR fallback: if the QR image host is unreachable, show the code as text */
document.addEventListener('error', e => {
  const im = e.target;
  if (im && im.tagName === 'IMG' && im.closest && im.closest('.ticket-qr') && P) {
    const box = im.closest('.ticket-qr');
    box.innerHTML = '<div class="mono" style="color:#07220C;font-size:.72rem;font-weight:700;padding:14px 8px;text-align:center;width:96px;word-break:break-all">' + esc(P.code) + '</div>';
  }
}, true);

/* ==========================================================
   BOOT
   ========================================================== */
Motion.init();
Theme.init();
Auth.init();