/* ==========================================================
   DECRYPT COUNTDOWN — DECRYPT 2.0
   ========================================================== */

const DecryptCountdown = (() => {
  let timer = null;

  function init() {
    const target = new Date(DECRYPT_CONFIG.COUNTDOWN_TARGET_DATE).getTime();
    const els = {
      d: document.getElementById('cd-days'),
      h: document.getElementById('cd-hours'),
      m: document.getElementById('cd-mins'),
      s: document.getElementById('cd-secs')
    };
    const statusEl = document.getElementById('cd-status');
    if (!els.d) return;

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = '00';
        if (statusEl && statusEl.textContent !== 'ACCESS OPEN') {
          statusEl.textContent = 'ACCESS OPEN';
          if (window.DecryptSound) DecryptSound.unlock();
        }
        clearInterval(timer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      els.d.textContent = String(d).padStart(2, '0');
      els.h.textContent = String(h).padStart(2, '0');
      els.m.textContent = String(m).padStart(2, '0');
      els.s.textContent = String(s).padStart(2, '0');
    }
    tick();
    timer = setInterval(tick, 1000);
  }

  return { init };
})();
