/**
 * theme.js
 * Runs BEFORE body renders (loaded in <head>) to prevent flash of wrong theme.
 * Handles: dark/light toggle, localStorage persistence, hamburger menu.
 */
(function () {
  const KEY = 'sv-theme';

  function getTheme() {
    return localStorage.getItem(KEY) || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }

  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    // Bounce animation on the button
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.style.transform = 'scale(0.85) rotate(20deg)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    }
  }

  // Apply immediately — before DOM ready — to prevent FOUC
  applyTheme(getTheme());

  document.addEventListener('DOMContentLoaded', function () {
    // Wire up theme toggle button
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    // Navbar scroll shadow
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
      });
    }

    // Mobile hamburger
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        const open = navLinks.classList.toggle('mobile-open');
        hamburger.setAttribute('aria-expanded', open);
        hamburger.innerHTML = open
          ? '<i class="fa-solid fa-xmark"></i>'
          : '<i class="fa-solid fa-bars"></i>';
      });
      // Close on outside click
      document.addEventListener('click', function (e) {
        if (navbar && !navbar.contains(e.target)) {
          navLinks.classList.remove('mobile-open');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      });
    }
  });

  // Expose for use in other scripts if needed
  window.toggleTheme = toggleTheme;
  window.getTheme   = getTheme;
})();
