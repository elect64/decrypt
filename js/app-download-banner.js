(function () {
  const STORAGE_KEY = 'decrypt-app-toast-shown';

  try {
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;
  } catch (error) {
    console.warn('Decrypt app toast storage unavailable:', error);
  }

  if (document.getElementById('decrypt-app-toast')) return;

  const apkPath = 'assets/Decrypt.apk';
  const styleId = 'decrypt-app-toast-styles';

  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .decrypt-app-toast {
        position: fixed;
        left: 50%;
        bottom: 22px;
        transform: translate(-50%, 120%);
        width: min(480px, calc(100vw - 28px));
        z-index: 100000;
        opacity: 0;
        transition: transform 0.38s ease, opacity 0.38s ease;
        pointer-events: none;
      }

      .decrypt-app-toast.is-visible {
        transform: translate(-50%, 0);
        opacity: 1;
        pointer-events: auto;
      }

      .decrypt-app-toast__inner {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px 12px 12px;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 22px;
        background: rgba(18, 24, 20, 0.82);
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: blur(14px);
        color: #f5f7f6;
      }

      .decrypt-app-toast__icon {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: linear-gradient(135deg, #1ecf72, #3cb371);
        color: #041109;
        font-weight: 800;
        font-size: 1.05rem;
        letter-spacing: 0.04em;
        flex-shrink: 0;
      }

      .decrypt-app-toast__text {
        flex: 1;
        min-width: 0;
        font-size: 0.94rem;
        line-height: 1.3;
        letter-spacing: 0.01em;
        font-weight: 600;
        color: rgba(255,255,255,0.96);
      }

      .decrypt-app-toast__cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 84px;
        padding: 10px 14px;
        border-radius: 999px;
        background: #fff;
        color: #081a11;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-decoration: none;
        text-transform: uppercase;
        white-space: nowrap;
        cursor: pointer;
      }

      @media (max-width: 480px) {
        .decrypt-app-toast {
          bottom: 18px;
          width: calc(100vw - 20px);
        }

        .decrypt-app-toast__inner {
          gap: 10px;
          padding: 10px 12px 10px 10px;
        }

        .decrypt-app-toast__text {
          font-size: 0.82rem;
        }

        .decrypt-app-toast__cta {
          min-width: 74px;
          padding: 9px 10px;
          letter-spacing: 0.05em;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement('div');
  toast.id = 'decrypt-app-toast';
  toast.className = 'decrypt-app-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="decrypt-app-toast__inner">
      <div class="decrypt-app-toast__icon" aria-hidden="true">D</div>
      <div class="decrypt-app-toast__text">Download the Decrypt App today</div>
      <a class="decrypt-app-toast__cta" href="${apkPath}" download>Get it</a>
    </div>
  `;

  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch (error) {
    console.warn('Decrypt app toast could not persist state:', error);
  }

  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('is-visible');
  });

  window.setTimeout(function () {
    toast.classList.remove('is-visible');
    window.setTimeout(function () {
      toast.remove();
    }, 400);
  }, 15000);
})();
