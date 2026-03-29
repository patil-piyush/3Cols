/**
 * auth.js
 * Client-side enhancements for register + login pages.
 * Loaded via pageScript on auth pages only.
 */
document.addEventListener('DOMContentLoaded', function () {

  // ── Show / hide password toggle ─────────────────────────────────────────
  document.querySelectorAll('.input-toggle-pw').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const wrap  = btn.closest('.input-wrap');
      const input = wrap.querySelector('input[type="password"], input[type="text"]');
      const icon  = btn.querySelector('i');
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  });

  // ── Password strength meter (register page only) ─────────────────────────
  const pwInput = document.getElementById('password');
  const bar     = document.getElementById('pw-strength-bar');
  const label   = document.getElementById('pw-strength-label');

  if (pwInput && bar && label) {
    pwInput.addEventListener('input', function () {
      const val = pwInput.value;
      let strength = 0;

      if (val.length >= 6)                              strength++;
      if (val.length >= 10)                             strength++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val))      strength++;
      if (/\d/.test(val))                               strength++;
      if (/[^A-Za-z0-9]/.test(val))                    strength++;

      bar.className = 'pw-strength-bar';
      if (val.length === 0) {
        bar.style.width = '0';
        label.textContent = '';
      } else if (strength <= 2) {
        bar.classList.add('weak');
        label.textContent = 'Weak';
        label.style.color = 'var(--accent-red)';
      } else if (strength <= 3) {
        bar.classList.add('medium');
        label.textContent = 'Good';
        label.style.color = 'var(--accent-yellow)';
      } else {
        bar.classList.add('strong');
        label.textContent = 'Strong 💪';
        label.style.color = 'var(--accent-green)';
      }
    });
  }

  // ── Live username validation (register page only) ────────────────────────
  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    usernameInput.addEventListener('input', function () {
      const val   = usernameInput.value;
      const valid = /^[a-zA-Z0-9_]{3,20}$/.test(val);
      const hint  = usernameInput.closest('.form-group').querySelector('.form-hint');

      usernameInput.classList.toggle('error', val.length > 0 && !valid);
      if (hint) {
        hint.style.color = (val.length > 0 && !valid)
          ? 'var(--accent-red)'
          : 'var(--text-muted)';
      }
    });
  }

  // ── Submit button loading state ──────────────────────────────────────────
  document.querySelectorAll('.auth-form').forEach(function (form) {
    form.addEventListener('submit', function () {
      const btn = form.querySelector('.auth-submit');
      if (!btn) return;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Please wait…';
    });
  });

});
