/* ==========================================================
   DECRYPT REGISTER (Unified Base64 Version)
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

  /* ---------- Validation & Submission ---------- */
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

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function showSuccess(formWrap, successWrap) {
    formWrap.style.display = 'none';
    successWrap.classList.add('active');
    
    // Shows CHECK EMAIL directly, skips random hash UI bug
    const codeEl = document.getElementById('reg-access-code');
    if (codeEl) codeEl.textContent = 'CHECK EMAIL'; 

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

      const originalBtnText = submitLabel ? submitLabel.textContent : "Request access";
      submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'SUBMITTING...'; 

      try {
        const payload = {
          fullName: document.getElementById('reg-name').value,
          email: document.getElementById('reg-email').value,
          phone: document.getElementById('reg-phone').value || "N/A",
          location: document.getElementById('reg-location').value || "N/A",
          identity: document.getElementById('reg-identity').value || "N/A",
          source: document.getElementById('reg-source').value || "N/A",
          volunteer: document.getElementById('reg-volunteer').value || "N/A",
          notes: document.getElementById('reg-notes') ? document.getElementById('reg-notes').value : "N/A",
          track: Array.from(document.querySelectorAll('#track-pills input[type="checkbox"]:checked')).map(cb => cb.value).join(', ') || "N/A"
        };

        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhx5PmRQ3bJdKLyW0Bia-t5b0dNcy---geQJtGNrwOh6l8BylVdVotY9gAaQL8AzydLQ/exec";

        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        showSuccess(formWrap, successWrap);

      } catch (err) {
        console.error(err);
        if (window.DecryptUI) DecryptUI.toast("Registration failed. Please check your connection.");
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = originalBtnText;
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