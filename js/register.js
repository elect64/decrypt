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
    const wrap = field.closest('.waitlist-field');
    if (!wrap) return;
    const errEl = wrap.querySelector('.field-error');
    if (errEl) errEl.textContent = message || '';
    wrap.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function initForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    const steps = [...form.querySelectorAll('.waitlist-step')];
    const inputs = steps.map(step => step.querySelector('input'));
    const backButton = document.getElementById('step-back');
    const nextButton = document.getElementById('step-next');
    const submitButton = document.getElementById('reg-submit-btn');
    const submitLabel = submitButton.querySelector('.btn-label');
    const stepCount = document.getElementById('step-count');
    const stepKicker = document.getElementById('step-kicker');
    const stepHeading = document.getElementById('step-heading');
    const stepDescription = document.getElementById('step-description');
    const progress = document.querySelector('.waitlist-progress');
    const progressFill = document.querySelector('.waitlist-progress-fill');
    const formError = document.getElementById('waitlist-error');
    const successDialog = document.getElementById('waitlist-success');
    const successName = document.getElementById('success-name');
    const closeButtons = [...successDialog.querySelectorAll('.waitlist-success-close, #success-done')];
    const content = [
      { title: 'What should we call you?', description: 'Start with your name.' },
      { title: 'Where can we reach you?', description: 'Your inbox is where the first signal lands.' },
      { title: 'One last detail.', description: 'Add a phone number for important updates.' }
    ];
    let activeStep = 0;

    function validateStep(index) {
      const input = inputs[index];
      const value = input.value.trim();
      let message = '';
      if (!value) {
        message = ['Enter your name.', 'Enter your email address.', 'Enter your phone number.'][index];
      } else if (index === 1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = 'Enter a valid email address.';
      } else if (index === 2 && value.replace(/\D/g, '').length < 7) {
        message = 'Enter a valid phone number.';
      }
      setError(input, message);
      return !message;
    }

    function showStep(index) {
      activeStep = index;
      steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });
      stepCount.textContent = `0${index + 1} / 0${steps.length}`;
      stepKicker.textContent = `STEP 0${index + 1}`;
      stepHeading.textContent = content[index].title;
      stepDescription.textContent = content[index].description;
      backButton.hidden = index === 0;
      nextButton.hidden = index === steps.length - 1;
      submitButton.hidden = index !== steps.length - 1;
      progress.setAttribute('aria-valuenow', String(index + 1));
      progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;
      formError.textContent = '';
    }

    nextButton.addEventListener('click', () => {
      if (!validateStep(activeStep)) { inputs[activeStep].focus(); return; }
      showStep(activeStep + 1);
      inputs[activeStep].focus();
    });

    backButton.addEventListener('click', () => {
      showStep(activeStep - 1);
      inputs[activeStep].focus();
    });

    inputs.forEach((input, index) => input.addEventListener('input', () => {
      if (input.closest('.waitlist-field').classList.contains('has-error')) validateStep(index);
    }));

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (activeStep < steps.length - 1) {
        if (!validateStep(activeStep)) { inputs[activeStep].focus(); return; }
        showStep(activeStep + 1);
        inputs[activeStep].focus();
        return;
      }
      if (!validateStep(activeStep)) { inputs[activeStep].focus(); return; }

      const originalLabel = submitLabel.textContent;
      submitButton.disabled = true;
      submitLabel.textContent = 'ADDING YOU...';
      formError.textContent = '';
      const payload = {
        fullName: inputs[0].value.trim(),
        email: inputs[1].value.trim(),
        phone: inputs[2].value.trim()
      };

      try {
        await fetch('https://script.google.com/macros/s/AKfycbxhx5PmRQ3bJdKLyW0Bia-t5b0dNcy---geQJtGNrwOh6l8BylVdVotY9gAaQL8AzydLQ/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        submitLabel.textContent = 'YOU’RE ON THE LIST';
        successName.textContent = payload.fullName.split(/\s+/)[0];
        successDialog.showModal();
        successDialog.querySelector('.waitlist-success-close').focus();
        if (window.WaitlistMascot) window.WaitlistMascot.play();
        if (window.DecryptSound) DecryptSound.reveal();
      } catch (error) {
        console.error(error);
        formError.textContent = 'We couldn’t connect. Check your connection and try again.';
        submitButton.disabled = false;
        submitLabel.textContent = originalLabel;
      }
    });

    closeButtons.forEach(button => button.addEventListener('click', () => successDialog.close()));
    successDialog.addEventListener('click', event => {
      if (event.target === successDialog) successDialog.close();
    });
    successDialog.addEventListener('close', () => {
      if (window.WaitlistMascot) window.WaitlistMascot.pause();
      stepHeading.focus();
    });
    showStep(0);
  }

  function init() {
    renderSteps();
    renderFaq();
    renderTracks();
    initForm();
  }

  return { init };
})();