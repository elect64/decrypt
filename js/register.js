/* ==========================================================
   DECRYPT REGISTER
   Renders the tracks/FAQ/steps and drives the registration
   form: validation, submission (configurable endpoint with
   an email fallback), and the success state.
   ========================================================== */

const DecryptRegister = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderSteps() {
    const el = document.getElementById('steps-list');
    if (!el || typeof REGISTER_STEPS === 'undefined') return;
    el.innerHTML = REGISTER_STEPS.map((s, i) => `
      <div class="step-row">
        <span class="step-index">0${i + 1}</span>
        <div>
          <span class="step-title">${s.title}</span>
          <p class="step-detail">${s.detail}</p>
        </div>
      </div>`).join('');
  }

  function renderFaq() {
    const el = document.getElementById('faq-list');
    if (!el || typeof FAQ_DATA === 'undefined') return;
    el.innerHTML = FAQ_DATA.map((f, i) => `
      <div class="faq-item" data-i="${i}">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}" data-cursor>
          <span>${f.q}</span><span class="faq-plus" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>
      </div>`).join('');

    el.querySelectorAll('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-q');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        if (window.DecryptSound) DecryptSound.click();
      });
    });
  }

  function renderTracks() {
    const el = document.getElementById('track-pills');
    if (!el || typeof SESSION_DATA === 'undefined') return;
    const tracks = [...new Set(SESSION_DATA.filter(s => s.day !== 'PRE').map(s => s.track))];
    tracks.push('Not sure yet');
    el.innerHTML = tracks.map((t, i) => `
      <label class="track-pill">
        <input type="checkbox" name="tracks" value="${t}" id="track-${i}">
        <span>${t}</span>
      </label>`).join('');
  }

  /* ---------- Validation ---------- */
  function setError(field, message) {
    const wrap = field.closest('.field');
    if (!wrap) return;
    const errEl = wrap.querySelector('.field-error');
    if (errEl) errEl.textContent = message || '';
    wrap.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateForm(form) {
    let firstInvalid = null;
    const name = form.querySelector('#reg-name');
    const email = form.querySelector('#reg-email');
    const consent = form.querySelector('#reg-consent');

    if (!name.value.trim()) { setError(name, 'Tell us your name.'); firstInvalid = firstInvalid || name; }
    else setError(name, '');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { setError(email, 'Enter a valid email.'); firstInvalid = firstInvalid || email; }
    else setError(email, '');

    if (!consent.checked) { setError(consent, 'Required to proceed.'); firstInvalid = firstInvalid || consent; }
    else setError(consent, '');

    return firstInvalid;
  }

  function collectData(form) {
    const fd = new FormData(form);
    return {
      name: fd.get('name') || '',
      email: fd.get('email') || '',
      phone: fd.get('phone') || '',
      location: fd.get('location') || '',
      identity: fd.get('identity') || '',
      track: fd.getAll('tracks').join(', ') || '',
      source: fd.get('source') || '',
      notes: fd.get('notes') || ''
    };
  }

  function buildMailto(data) {
    const s = DECRYPT_CONFIG.SOCIAL_LINKS;
    const subject = encodeURIComponent(`DECRYPT 2.0 registration — ${data.name}`);
    const bodyLines = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Phone / WhatsApp: ${data.phone}` : '',
      data.location ? `City / Country: ${data.location}` : '',
      data.identity ? `Mainly a: ${data.identity}` : '',
      data.track ? `Tracks: ${data.track}` : '',
      data.source ? `Heard about DECRYPT via: ${data.source}` : '',
      data.notes ? `Notes: ${data.notes}` : ''
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join('\n'));
    return `mailto:${s.email}?subject=${subject}&body=${body}`;
  }

  function generateAccessCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return `DCRPT-${code}`;
  }

  async function submitToEndpoint(data) {
    const endpoint = DECRYPT_CONFIG.REGISTRATION_ENDPOINT;
    if (!endpoint) return { ok: false, skipped: true };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      return { ok: res.ok, skipped: false };
    } catch (err) {
      return { ok: false, skipped: false, error: err };
    }
  }

  function showSuccess(formWrap, successWrap) {
    formWrap.style.display = 'none';
    successWrap.classList.add('active');
    const codeEl = document.getElementById('reg-access-code');
    if (codeEl) codeEl.textContent = generateAccessCode();
    if (window.DecryptSound) DecryptSound.thunk();
    successWrap.setAttribute('tabindex', '-1');
    successWrap.focus({ preventScroll: true });
    successWrap.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }

  function initForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    const formWrap = document.getElementById('reg-form-wrap');
    const successWrap = document.getElementById('reg-success');
    const submitBtn = document.getElementById('reg-submit-btn');
    const submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstInvalid = validateForm(form);
      if (firstInvalid) {
        firstInvalid.focus();
        if (window.DecryptSound) DecryptSound.click();
        return;
      }

      const data = collectData(form);
      submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Decrypting request…';

      const result = await submitToEndpoint(data);

      if (result.ok) {
        showSuccess(formWrap, successWrap);
      } else if (result.skipped) {
        // No endpoint configured — open the visitor's email client instead.
        window.location.href = buildMailto(data);
        showSuccess(formWrap, successWrap);
      } else {
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Request access';
        if (window.DecryptUI) DecryptUI.toast("COULDN'T SEND — TRY THE EMAIL LINK BELOW");
      }
    });
  }

  function init() {
    renderSteps();
    renderFaq();
    renderTracks();
    initForm();
  }

  return { init };
})();