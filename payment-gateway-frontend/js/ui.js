/* ═══════════════════════════════════════════════════════════
   UI — Toast, Modal, Loading, Animations
   ═══════════════════════════════════════════════════════════ */
const UI = (() => {
  // ── Toast ─────────────────────────────────────────────────
  function toast(type, title, message) {
    const container = document.getElementById('toast-container');
    const iconMap = { success: Icons.check, error: Icons.x, warning: Icons.zap, info: Icons.shield };
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span class="toast__icon">${iconMap[type] || Icons.info}</span>
      <div class="toast__content">
        <div class="toast__title">${title}</div>
        ${message ? `<div class="toast__message">${message}</div>` : ''}
      </div>
      <div class="toast__progress"></div>
    `;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }

  // ── Modal ─────────────────────────────────────────────────
  function openModal(content, opts = {}) {
    const overlay = document.getElementById('modal-overlay');
    const card = document.getElementById('modal-card');
    card.innerHTML = content;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    // Focus trap
    setTimeout(() => {
      const first = card.querySelector('button, input, [tabindex]');
      if (first) first.focus();
    }, 100);
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('closing');
      document.body.style.overflow = '';
    }, 150);
  }

  // ── Loading bar ───────────────────────────────────────────
  function showLoading() { document.getElementById('loading-bar').classList.add('active'); }
  function hideLoading() { document.getElementById('loading-bar').classList.remove('active'); }

  // ── Animated Counter ──────────────────────────────────────
  function animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    const isAmount = el.dataset.format === 'amount';
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = target * easeOutCubic(progress);
      el.textContent = isAmount ? Data.formatAmount(value) : Math.round(value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Delay helper ──────────────────────────────────────────
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── MPIN Input Handler ────────────────────────────────────
  function initMpinDots(container) {
    const dots = container.querySelectorAll('.mpin-dots__dot');
    dots.forEach((dot, i) => {
      dot.addEventListener('input', () => {
        if (dot.value.length === 1) {
          dot.classList.add('filled');
          if (i < dots.length - 1) dots[i + 1].focus();
        }
      });
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !dot.value && i > 0) {
          dots[i - 1].focus();
          dots[i - 1].value = '';
          dots[i - 1].classList.remove('filled');
        }
      });
    });
  }

  function getMpinValue(container) {
    return Array.from(container.querySelectorAll('.mpin-dots__dot')).map(d => d.value).join('');
  }

  // ── Form validation ───────────────────────────────────────
  function setError(inputGroup, msg) {
    inputGroup.classList.add('input-group--error');
    const errEl = inputGroup.querySelector('.input-group__error');
    if (errEl) errEl.textContent = msg;
    inputGroup.classList.add('anim-shake');
    setTimeout(() => inputGroup.classList.remove('anim-shake'), 400);
  }

  function clearError(inputGroup) {
    inputGroup.classList.remove('input-group--error');
    const errEl = inputGroup.querySelector('.input-group__error');
    if (errEl) errEl.textContent = '';
  }

  function clearAllErrors(form) {
    form.querySelectorAll('.input-group').forEach(g => clearError(g));
  }

  // ── Build status badge ────────────────────────────────────
  function statusBadge(status) {
    const s = status.toUpperCase();
    const cls = s === 'SUCCESS' ? 'success' : s === 'PENDING' ? 'pending' : s === 'FAILED' ? 'failed' : 'cancelled';
    return `<span class="badge badge--${cls}"><span class="badge__dot"></span>${s}</span>`;
  }

  // ── Build step indicator ──────────────────────────────────
  function buildSteps(current) {
    const labels = ['Details', 'Confirm', 'Done'];
    return `<div class="steps">${labels.map((l, i) => {
      const state = i < current - 1 ? 'step--done' : i === current - 1 ? 'step--active' : '';
      return `${i > 0 ? '<div class="step__line"></div>' : ''}<div class="step ${state}"><div class="step__circle">${i < current - 1 ? '✓' : i + 1}</div><span>${l}</span></div>`;
    }).join('')}</div>`;
  }

  return { toast, openModal, closeModal, showLoading, hideLoading, animateCounter, delay, initMpinDots, getMpinValue, setError, clearError, clearAllErrors, statusBadge, buildSteps };
})();
