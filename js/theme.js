/* ==========================================================
   DECRYPT THEME ENGINE
   Not a CSS flip — an animated state change (wipe transition)
   that also notifies the vault scene so its palette follows.
   ========================================================== */

const DecryptTheme = (() => {
  const root = document.documentElement;
  let current = localStorage.getItem('decrypt-theme') || DECRYPT_CONFIG.THEME_DEFAULT;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const listeners = [];

  function apply(next, animate = true) {
    current = next;
    if (animate && !reduced) {
      const wipe = document.createElement('div');
      wipe.className = 'theme-wipe';
      wipe.style.background = next === 'dark' ? '#03130A' : '#F5F6F1';
      document.body.appendChild(wipe);
      requestAnimationFrame(() => {
        wipe.style.transition = 'opacity 0.35s cubic-bezier(0.4,0,0.2,1)';
        wipe.style.opacity = '1';
        setTimeout(() => {
          root.setAttribute('data-theme', next);
          listeners.forEach(fn => fn(next));
          wipe.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1)';
          wipe.style.opacity = '0';
          setTimeout(() => wipe.remove(), 550);
        }, 360);
      });
    } else {
      root.setAttribute('data-theme', next);
      listeners.forEach(fn => fn(next));
    }
    localStorage.setItem('decrypt-theme', next);
  }

  root.setAttribute('data-theme', current);

  return {
    get: () => current,
    toggle: () => apply(current === 'dark' ? 'light' : 'dark'),
    onChange: (fn) => listeners.push(fn)
  };
})();
