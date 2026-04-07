/**
 * AppCore - Core application initialization and utility functions.
 * Uses vanilla JS and Bootstrap 5 native APIs. No jQuery dependency.
 */
var AppCore = {

  /**
   * Initialize all core handlers.
   * Safe to call multiple times (idempotent) — used after AJAX content injection.
   */
  init: function () {
    this.tooltips();
    this.popovers();
    this.htmlPopovers();
    this.masks();
    this.enhancedSelects();
    FormatTime.init();
  },

  /**
   * Initialize Bootstrap 5 tooltips on elements with data-bs-toggle="tooltip"
   */
  tooltips: function () {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
      if (!bootstrap.Tooltip.getInstance(el)) {
        new bootstrap.Tooltip(el);
      }
    });
  },

  /**
   * Initialize Bootstrap 5 popovers on elements with data-bs-toggle="popover"
   */
  popovers: function () {
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
      if (!bootstrap.Popover.getInstance(el)) {
        new bootstrap.Popover(el);
      }
    });
  },

  /**
   * Initialize HTML content popovers on .html-popover elements
   */
  htmlPopovers: function () {
    document.querySelectorAll('.html-popover').forEach(function (el) {
      if (!bootstrap.Popover.getInstance(el)) {
        var sourceSelector = el.dataset.element;
        var sourceEl = sourceSelector ? document.querySelector(sourceSelector) : null;
        new bootstrap.Popover(el, {
          content: sourceEl ? sourceEl.innerHTML : '',
          html: true
        });
      }
    });
  },

  /**
   * Initialize Inputmask on all input elements (vanilla mode).
   */
  masks: function () {
    if (typeof Inputmask !== 'undefined') {
      Inputmask().mask(document.querySelectorAll('input'));
    }
  },

  /**
   * Initialize TomSelect on .enhanced-select elements
   */
  enhancedSelects: function () {
    document.querySelectorAll('select.enhanced-select:not(.tomselected)').forEach(function (el) {
      var config = {
        allowEmptyOption: true
      };

      if (el.multiple) {
        config.plugins = ['remove_button'];
      }

      try {
        new TomSelect(el, config);
      } catch (e) {
        console.error('TomSelect init failed:', e, el);
      }
    });
  }
};

/**
 * Boot the application once the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
  AppCore.init();
  AjaxPagination.init();
  ModalConfirm.init();
});
