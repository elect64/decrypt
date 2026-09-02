/* ==========================================================
   DECRYPT SOUND ENGINE
   Procedural, subtle, mechanical. No autoplay, no music.
   ========================================================== */

const DecryptSound = (() => {
  let ctx = null;
  let enabled = (localStorage.getItem('decrypt-sound') || DECRYPT_CONFIG.SOUND_DEFAULT) !== 'off';

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq = 440, duration = 0.12, type = 'sine', gain = 0.05, glideTo = null }) {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + duration);
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
  }

  return {
    click:  () => tone({ freq: 720, duration: 0.05, type: 'square', gain: 0.02 }),
    unlock: () => { tone({ freq: 300, duration: 0.09, type: 'triangle', gain: 0.05 }); setTimeout(() => tone({ freq: 620, duration: 0.14, type: 'triangle', gain: 0.05 }), 90); },
    thunk:  () => tone({ freq: 90, duration: 0.16, type: 'sine', gain: 0.07, glideTo: 40 }),
    reveal: () => tone({ freq: 480, duration: 0.35, type: 'sine', gain: 0.03, glideTo: 900 }),
    shift:  () => { tone({ freq: 560, duration: 0.05, type: 'square', gain: 0.028 }); setTimeout(() => tone({ freq: 860, duration: 0.07, type: 'square', gain: 0.028 }), 45); },
    egg:    () => { tone({ freq: 520, duration: 0.09, gain: 0.04 }); setTimeout(() => tone({ freq: 780, duration: 0.12, gain: 0.04 }), 100); setTimeout(() => tone({ freq: 1040, duration: 0.16, gain: 0.04 }), 200); },
    isEnabled: () => enabled,
    toggle: () => {
      enabled = !enabled;
      localStorage.setItem('decrypt-sound', enabled ? 'on' : 'off');
      if (enabled) ensureCtx();
      return enabled;
    }
  };
})();
