/* ==========================================================
   DECRYPT REGISTER — MAIN
   ========================================================== */

(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dom = {
    loader: document.getElementById('loader'),
    loaderSub: document.getElementById('loader-sub'),
    page: document.getElementById('page'),
    canvas: document.getElementById('scene-canvas'),
    fallback: document.getElementById('scene-fallback')
  };

  function runLoader() {
    if (reduced) {
      dom.loader.classList.add('hidden');
      dom.page.classList.add('ready');
      return;
    }
    document.body.classList.add('loading', 'lock-scroll');
    const steps = ['Initializing access', 'Verifying identity', 'Preparing form', 'Access granted'];
    let i = 0;
    function next() {
      if (i < steps.length) {
        dom.loaderSub.textContent = steps[i];
        if (i === 1) DecryptSound.unlock();
        if (i === steps.length - 1) { dom.loader.classList.add('granted'); DecryptSound.thunk(); }
        i++;
        setTimeout(next, 230);
      } else {
        setTimeout(() => {
          dom.loader.classList.add('hidden');
          document.body.classList.remove('loading', 'lock-scroll');
          dom.page.classList.add('ready');
          revealHero();
        }, 250);
      }
    }
    setTimeout(next, 250);
  }

  function revealHero() {
    document.querySelectorAll('.hero-title .line span').forEach((el, i) => {
      el.style.transform = 'translateY(110%)';
      requestAnimationFrame(() => {
        el.style.transition = `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`;
        el.style.transform = 'translateY(0)';
      });
    });
  }

  function init() {
    DecryptVault.setTheme(DecryptTheme.get());
    DecryptTheme.onChange((next) => DecryptVault.setTheme(next));

    DecryptUI.init();
    DecryptRegister.init();
    DecryptCursor.init();
    DecryptReveal.init();
    DecryptCountdown.init();
    if (dom.canvas) DecryptVault.init(dom.canvas, dom.fallback);

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches && dom.canvas) { DecryptVault.destroy(); dom.canvas.classList.add('hidden'); dom.fallback.classList.add('active'); }
    });

    runLoader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
