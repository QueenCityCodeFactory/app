/**
 * Dark Mode Toggle — Bootstrap 5.3 theme switching.
 *
 * Adds a `[data-theme-toggle]` button handler that cycles between
 * light / dark / auto themes using `data-bs-theme` on `<html>`.
 * Persists user preference in localStorage.
 */
const DarkMode = {
  STORAGE_KEY: 'bc-theme',

  init() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.apply(stored);
    } else {
      this.apply('auto');
    }

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      if (btn.dataset._themeBound) return;
      btn.dataset._themeBound = '1';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const current = localStorage.getItem(DarkMode.STORAGE_KEY) || 'auto';
        const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
        DarkMode.apply(next);
        localStorage.setItem(DarkMode.STORAGE_KEY, next);
        DarkMode.updateIcons();
      });
    });

    this.updateIcons();
  },

  apply(theme) {
    const html = document.documentElement;
    if (theme === 'auto') {
      html.removeAttribute('data-bs-theme');
    } else {
      html.setAttribute('data-bs-theme', theme);
    }
  },

  updateIcons() {
    const current = localStorage.getItem(this.STORAGE_KEY) || 'auto';
    const iconMap = {
      light: 'fa-sun',
      dark: 'fa-moon',
      auto: 'fa-circle-half-stroke',
    };

    document.querySelectorAll('[data-theme-toggle] em, [data-theme-toggle] i').forEach((icon) => {
      icon.className = 'fa-solid ' + (iconMap[current] || iconMap.auto);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => DarkMode.init());
