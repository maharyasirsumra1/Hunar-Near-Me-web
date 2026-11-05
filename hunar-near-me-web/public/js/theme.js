'use strict';

(() => {
  const key = 'hn_theme';
  let theme = 'light';
  try {
    theme = localStorage.getItem(key) === 'dark' ? 'dark' : 'light';
  } catch (err) {
    console.warn('Could not read the saved theme preference:', err);
  }

  const apply = value => {
    document.documentElement.dataset.theme = value;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const next = value === 'dark' ? 'light' : 'dark';
      const label = `Switch to ${next} mode`;
      button.textContent = value === 'dark' ? '☀️' : '🌙';
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  };

  apply(theme);
  document.addEventListener('DOMContentLoaded', () => apply(theme), { once: true });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-theme-toggle]');
    if (!button) return;
    theme = theme === 'dark' ? 'light' : 'dark';
    apply(theme);
    try {
      localStorage.setItem(key, theme);
    } catch (err) {
      console.warn('Could not save the theme preference:', err);
    }
  });
})();
