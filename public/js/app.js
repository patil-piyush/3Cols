/**
 * app.js
 * Global utilities: toast notifications, clipboard copy, avatar colors, lang badges, active nav.
 * Loaded at bottom of main.ejs — DOM is ready.
 */
document.addEventListener('DOMContentLoaded', function () {

  // ── Avatar gradient generator ─────────────────────────────────────────────
  // Generates a consistent gradient per username so avatars always look the same
  function getAvatarGradient(str) {
    const gradients = [
      'linear-gradient(135deg,#4f8ef7,#7c3aed)',
      'linear-gradient(135deg,#10d9a0,#059669)',
      'linear-gradient(135deg,#f97316,#ef4444)',
      'linear-gradient(135deg,#fbbf24,#f97316)',
      'linear-gradient(135deg,#a78bfa,#7c3aed)',
      'linear-gradient(135deg,#f43f5e,#7c3aed)',
      'linear-gradient(135deg,#22d3ee,#3b82f6)',
      'linear-gradient(135deg,#84cc16,#22d3ee)',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  }

  // Apply gradient to all avatars that have data-username
  document.querySelectorAll('.avatar[data-username]').forEach(function (el) {
    el.style.background = getAvatarGradient(el.dataset.username);
  });

  // ── Language badge class applier ──────────────────────────────────────────
  // Adds lang-<name> class to .lang-badge elements so CSS colours them
  document.querySelectorAll('.lang-badge').forEach(function (el) {
    const lang = (el.dataset.lang || el.textContent).toLowerCase().trim().replace(/\s+/g, '');
    el.classList.add('lang-' + lang);
  });

  // ── Active nav link highlighter ───────────────────────────────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });

  // ── Toast notification system ─────────────────────────────────────────────
  window.showToast = function (message, type, duration) {
    type     = type     || 'default';
    duration = duration || 3000;

    const icons = {
      success:  '✅', error: '❌', info: 'ℹ️',
      like:     '❤️', bookmark: '🔖', copy: '📋', default: '💬'
    };

    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span>' + (icons[type] || icons.default) + '</span><span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.animation = 'toastIn 0.3s ease reverse forwards';
      setTimeout(function () { toast.remove(); }, 300);
    }, duration);
  };

  // ── Clipboard copy buttons ────────────────────────────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Find code: either data-target selector OR nearest code block
      const target = btn.dataset.target;
      const code = target
        ? (document.querySelector(target) || {}).innerText
        : (btn.closest('.code-block') || {}).querySelector && btn.closest('.code-block').querySelector('code') && btn.closest('.code-block').querySelector('code').innerText;

      if (!code) return;

      navigator.clipboard.writeText(code).then(function () {
        const original = btn.innerHTML;
        btn.innerHTML  = '<i class="fa-solid fa-check"></i> copied';
        btn.classList.add('copied');
        window.showToast('Code copied to clipboard!', 'copy', 2000);
        setTimeout(function () {
          btn.innerHTML = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  // Expose avatar helper globally (used by profile pages etc.)
  window.getAvatarGradient = getAvatarGradient;

});




document.addEventListener('DOMContentLoaded', function () {

  // AOS init
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  // Highlight.js init
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach(function (el) {
      hljs.highlightElement(el);
    });
  }

});


$(document).ready(function () {
  $('#lang-select').select2({
    placeholder: "Select or search language",
    width: '100%'
  });
});

function copyCode(button) {
  const code = document.getElementById("snippet-code").innerText;

  navigator.clipboard.writeText(code).then(() => {
    const span = button.querySelector("span");
    const icon = button.querySelector("i");

    span.textContent = "Copied!";
    icon.className = "fa-solid fa-check";

    setTimeout(() => {
      span.textContent = "Copy";
      icon.className = "fa-regular fa-copy";
    }, 1500);
  });
}