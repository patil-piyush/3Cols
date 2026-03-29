/**
 * flash.js
 * Handles flash message dismiss (close button) and auto-dismiss after 4s.
 * Loaded at bottom of main.ejs so DOM is ready.
 */
document.addEventListener('DOMContentLoaded', function () {

  function dismissFlash(el) {
    el.classList.add('dismissing');
    setTimeout(() => el.remove(), 300);
  }

  // Close button
  document.querySelectorAll('.flash-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      dismissFlash(btn.closest('.flash'));
    });
  });

  // Auto-dismiss after 4 seconds
  document.querySelectorAll('.flash').forEach(function (flash) {
    setTimeout(function () {
      if (flash.isConnected) dismissFlash(flash);
    }, 4000);
  });

});
